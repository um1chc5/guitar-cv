// Webcam + MediaPipe hand tracking + neck calibration + AR note overlay.

import { NeckMapper, fretWireX } from './geometry.js';
import { MAX_FRET, midiToName } from './theory.js';
import { click } from './synth.js';

const MP_VERSION = '0.10.14';
const MP_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}`;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const FINGERTIPS = { 8: 'index', 12: 'middle', 16: 'ring', 20: 'pinky' };
const HAND_EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];
const CALIB_PROMPTS = [
  'LOW E string, right at the NUT',
  'HIGH e string, right at the NUT',
  'LOW E string, on the 12th FRET wire',
  'HIGH e string, on the 12th FRET wire',
];
const STORAGE_KEY = 'fretcoach.calibration';

// Finger-touch calibration: hold the index fingertip still on a point to capture it.
const HOLD_MS = 900;
const STILL = 0.012;     // max fingertip wobble while holding, as a fraction of video width
const AWAY = 0.035;      // a new point must be this far from points already captured
const DROPOUT_MS = 250;  // tolerate the hand tracker missing a few frames

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export class CameraView {
  constructor(canvas, { onFingers, onStatus } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.muted = true;
    this.onFingers = onFingers;
    this.onStatus = onStatus;
    this.mirror = false;
    this.showHands = true;
    this.showGrid = true;
    this.showShape = true;
    this.overlay = {};
    this.landmarker = null;
    this.hands = [];
    this.calibPoints = [];
    this.calibrating = false;
    this.touch = null;
    this.dragIndex = -1;
    this.mapper = null;
    this.lastVideoTime = -1;
    this.loadCalibration();
    this.bindPointer();
  }

  status(msg) { this.onStatus?.(msg); }

  async start(deviceId) {
    this.stop();
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: deviceId ? { exact: deviceId } : undefined, width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    this.video.srcObject = this.stream;
    await this.video.play();
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.running = true;
    this.loop();
    if (!this.landmarker) this.loadLandmarker();
    if (!this.mapper) this.status('Camera on. Press "Calibrate" (C) to map the fretboard.');
  }

  stop() {
    this.running = false;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  async loadLandmarker() {
    this.status('Loading hand tracking model…');
    try {
      const vision = await import(/* @vite-ignore */ `${MP_URL}/vision_bundle.mjs`);
      const fileset = await vision.FilesetResolver.forVisionTasks(`${MP_URL}/wasm`);
      const make = (delegate) => vision.HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      try { this.landmarker = await make('GPU'); } catch { this.landmarker = await make('CPU'); }
      this.status(this.mapper ? 'Hand tracking ready. Calibration loaded.' : 'Hand tracking ready. Calibrate the neck next (C).');
    } catch (e) {
      console.error(e);
      this.status('Could not load hand tracking (offline?). You can still calibrate by clicking.');
    }
  }

  // ---- calibration -------------------------------------------------------

  startCalibration() {
    this.calibrating = true;
    this.calibPoints = [];
    this.touch = null;
    this.mapper = null;
    this.status(this.promptText());
  }

  cancelCalibration() {
    this.calibrating = false;
    this.touch = null;
    this.loadCalibration();
    this.status(this.mapper ? 'Calibration cancelled — previous one restored.' : 'Calibration cancelled.');
  }

  promptText() {
    const how = this.landmarker ? 'Touch it with your index fingertip and hold still (or click it)' : 'Click it on the video';
    return `${this.calibPoints.length + 1}/4 · ${CALIB_PROMPTS[this.calibPoints.length]} — ${how}`;
  }

  addCalibPoint(p) {
    this.calibPoints.push(p);
    if (this.calibPoints.length < 4) { this.status(this.promptText()); return; }
    this.calibrating = false;
    this.touch = null;
    this.setMapperFromPoints();
    this.status(this.mapper
      ? 'Calibrated! Check the drawn frets line up; drag the orange dots to fine-tune.'
      : 'Calibration failed — try again with the points spread out.');
  }

  updateMapper() {
    const m = new NeckMapper(this.calibPoints);
    this.mapper = m.ok ? m : null;
  }

  setMapperFromPoints() {
    this.updateMapper();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ points: this.calibPoints })); } catch { /* storage unavailable */ }
  }

  loadCalibration() {
    this.calibPoints = [];
    this.mapper = null;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      const pts = Array.isArray(saved) ? saved : saved?.points;
      if (Array.isArray(pts) && pts.length === 4) {
        this.calibPoints = pts;
        this.updateMapper();
      }
    } catch { /* ignore */ }
  }

  clearCalibration() {
    this.calibPoints = [];
    this.mapper = null;
    this.calibrating = false;
    this.touch = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    this.status('Calibration cleared.');
  }

  // Hold-to-capture with the index fingertip (landmark 8) of whichever hand is touching.
  updateTouch() {
    if (!this.calibrating) { this.touch = null; return; }
    const W = this.canvas.width;
    const H = this.canvas.height;
    const now = performance.now();
    const tips = this.hands.map((h) => [h[8].x * W, h[8].y * H]);
    const fresh = (p) => this.calibPoints.every((q) => dist(p, q) > AWAY * W);
    let t = this.touch;
    if (!tips.length) {
      if (t && now - t.seen > DROPOUT_MS) this.touch = null;
      return;
    }
    const p = t ? tips.reduce((a, b) => (dist(b, t.anchor) < dist(a, t.anchor) ? b : a)) : null;
    if (t && dist(p, t.anchor) < STILL * W) {
      t.sum[0] += p[0]; t.sum[1] += p[1]; t.n++;
      t.pos = p;
      t.seen = now;
    } else {
      const q = tips.find(fresh);
      this.touch = t = q ? { anchor: q, pos: q, start: now, seen: now, sum: [...q], n: 1 } : null;
    }
    if (t && now - t.start >= HOLD_MS) {
      click(true);
      this.addCalibPoint([t.sum[0] / t.n, t.sum[1] / t.n]);
      this.touch = null;
    }
  }

  // Screen (CSS) position -> video pixel coordinates (the canvas is letterboxed with object-fit: contain).
  eventToVideo(e) {
    const r = this.canvas.getBoundingClientRect();
    const k = Math.min(r.width / this.canvas.width, r.height / this.canvas.height);
    const ox = (r.width - this.canvas.width * k) / 2;
    const oy = (r.height - this.canvas.height * k) / 2;
    let x = (e.clientX - r.left - ox) / k;
    const y = (e.clientY - r.top - oy) / k;
    if (this.mirror) x = this.canvas.width - x;
    return [x, y];
  }

  bindPointer() {
    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.running) return;
      const p = this.eventToVideo(e);
      if (this.calibrating) { this.addCalibPoint(p); return; }
      const hitR = this.canvas.width * 0.02;
      this.dragIndex = this.calibPoints.findIndex(([x, y]) => Math.hypot(x - p[0], y - p[1]) < hitR);
      if (this.dragIndex >= 0) this.canvas.setPointerCapture(e.pointerId);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (this.dragIndex < 0) return;
      this.calibPoints[this.dragIndex] = this.eventToVideo(e);
      this.updateMapper();
    });
    const end = () => {
      if (this.dragIndex >= 0) this.setMapperFromPoints();
      this.dragIndex = -1;
    };
    this.canvas.addEventListener('pointerup', end);
    this.canvas.addEventListener('pointercancel', end);
  }

  // ---- render loop ---------------------------------------------------------

  setOverlay(o) { this.overlay = o; }

  loop() {
    if (!this.running) return;
    this.step();
    requestAnimationFrame(() => this.loop());
  }

  // One frame of work: vision on new camera frames, then redraw.
  step() {
    if (this.video.readyState < 2) return;
    if (this.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.video.currentTime;
      if (this.landmarker) {
        try {
          const res = this.landmarker.detectForVideo(this.video, performance.now());
          this.hands = res.landmarks || [];
        } catch (e) { console.warn(e); }
      }
      this.updateTouch();
    }
    this.draw();
    this.emitFingers();
  }

  sx(x) { return this.mirror ? this.canvas.width - x : x; }

  emitFingers() {
    if (!this.onFingers) return;
    const fingers = [];
    if (this.mapper) {
      for (const hand of this.hands) {
        for (const [idx, name] of Object.entries(FINGERTIPS)) {
          const lm = hand[idx];
          const loc = this.mapper.locate(lm.x * this.canvas.width, lm.y * this.canvas.height);
          if (loc) fingers.push({ ...loc, finger: name });
        }
      }
    }
    this.onFingers(fingers);
  }

  draw() {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    ctx.save();
    if (this.mirror) { ctx.translate(W, 0); ctx.scale(-1, 1); }
    ctx.drawImage(this.video, 0, 0, W, H);
    ctx.restore();

    const scale = W / 1280;
    if (this.mapper && !this.calibrating) {
      if (this.showGrid) this.drawGrid(scale);
      if (this.showShape) this.drawShape(scale);
      this.drawNotes(scale);
    }
    this.drawCalibPoints(scale);
    if (this.showHands) this.drawHands(scale);
    this.drawTouch(scale);
  }

  line(a, b) {
    this.ctx.beginPath();
    this.ctx.moveTo(this.sx(a[0]), a[1]);
    this.ctx.lineTo(this.sx(b[0]), b[1]);
    this.ctx.stroke();
  }

  path(points, close) {
    const { ctx } = this;
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(this.sx(x), y) : ctx.moveTo(this.sx(x), y)));
    if (close) ctx.closePath();
  }

  drawGrid(scale) {
    const { ctx, mapper } = this;
    ctx.lineWidth = 1.5 * scale;
    for (let f = 0; f <= MAX_FRET; f++) {
      ctx.strokeStyle = f === 0 || f === 12 ? 'rgba(255,220,120,0.9)' : 'rgba(255,255,255,0.35)';
      const X = fretWireX(f);
      this.line(mapper.toPixel(X, -0.3), mapper.toPixel(X, 5.3));
    }
    ctx.strokeStyle = 'rgba(120,200,255,0.3)';
    for (let s = 0; s < 6; s++) this.line(mapper.toPixel(-0.05, s), mapper.toPixel(fretWireX(MAX_FRET), s));
  }

  // The box shape on the real neck: a stepped outline around each string's notes, plus
  // the path to the next note while practising.
  drawShape(scale) {
    const { ctx, mapper } = this;
    const { notes = [], windowMin = 0, windowMax = MAX_FRET, target, next } = this.overlay;
    if (windowMax - windowMin <= 7) {
      const left = [];
      const right = [];
      for (let s = 0; s < 6; s++) {
        const frets = notes.filter((n) => n.string === s && n.fret >= windowMin && n.fret <= windowMax).map((n) => n.fret);
        if (!frets.length) continue;
        const lo = Math.min(...frets);
        const hi = Math.max(...frets);
        const L = lo === 0 ? -0.1 : fretWireX(lo - 1) + 0.006;
        const R = hi === 0 ? -0.01 : fretWireX(hi) - 0.006;
        left.push(mapper.toPixel(L, s - 0.5), mapper.toPixel(L, s + 0.5));
        right.unshift(mapper.toPixel(R, s + 0.5), mapper.toPixel(R, s - 0.5));
      }
      if (left.length) {
        this.path([...left, ...right], true);
        ctx.fillStyle = 'rgba(255,210,63,0.10)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,210,63,0.75)';
        ctx.lineWidth = 2.5 * scale;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    }
    if (target && next && !(next.string === target.string && next.fret === target.fret)) {
      const a = mapper.notePixel(target.string, target.fret);
      const b = mapper.notePixel(next.string, next.fret);
      const ang = Math.atan2(b[1] - a[1], this.sx(b[0]) - this.sx(a[0]));
      const len = dist([this.sx(a[0]), a[1]], [this.sx(b[0]), b[1]]);
      if (len > 30 * scale) {
        const cut = Math.min(22 * scale, len / 3);
        const x1 = this.sx(a[0]) + Math.cos(ang) * cut;
        const y1 = a[1] + Math.sin(ang) * cut;
        const x2 = this.sx(b[0]) - Math.cos(ang) * cut;
        const y2 = b[1] - Math.sin(ang) * cut;
        ctx.strokeStyle = 'rgba(255,210,63,0.9)';
        ctx.fillStyle = 'rgba(255,210,63,0.9)';
        ctx.lineWidth = 3 * scale;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        const h = 10 * scale;
        ctx.beginPath();
        ctx.moveTo(x2 + Math.cos(ang) * h * 0.4, y2 + Math.sin(ang) * h * 0.4);
        ctx.lineTo(x2 - Math.cos(ang - 0.5) * h, y2 - Math.sin(ang - 0.5) * h);
        ctx.lineTo(x2 - Math.cos(ang + 0.5) * h, y2 - Math.sin(ang + 0.5) * h);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  drawNotes(scale) {
    const { ctx, mapper } = this;
    const { notes = [], windowMin = 0, windowMax = MAX_FRET, target, next, labelMode = 'degree', flash } = this.overlay;
    const radiusAt = (string, fret) => {
      const a = mapper.notePixel(0, fret);
      const b = mapper.notePixel(5, fret);
      return Math.max(5 * scale, Math.min(28 * scale, Math.hypot(a[0] - b[0], a[1] - b[1]) / 5 * 0.42));
    };
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const n of notes) {
      if (n.fret < windowMin || n.fret > windowMax) continue;
      const [x, y] = mapper.notePixel(n.string, n.fret);
      const r = radiusAt(n.string, n.fret);
      const isTarget = target && target.string === n.string && target.fret === n.fret;
      ctx.globalAlpha = target && !isTarget ? 0.55 : 0.92;
      ctx.fillStyle = isTarget ? '#ff8a1f' : n.isRoot ? '#ef4a3f' : '#2f7bff';
      ctx.beginPath();
      ctx.arc(this.sx(x), y, isTarget ? r * 1.25 : r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#111';
      ctx.font = `bold ${Math.round(r * 0.95)}px system-ui, sans-serif`;
      ctx.fillText(labelMode === 'degree' ? n.degree : midiToName(n.midi), this.sx(x), y + 1);
    }
    if (next && !(target && next.string === target.string && next.fret === target.fret)) {
      const [x, y] = mapper.notePixel(next.string, next.fret);
      ctx.strokeStyle = 'rgba(255,210,63,0.7)';
      ctx.setLineDash([4 * scale, 4 * scale]);
      ctx.lineWidth = 2 * scale;
      ctx.beginPath(); ctx.arc(this.sx(x), y, radiusAt(next.string, next.fret) * 1.5, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    if (flash) {
      const [x, y] = mapper.notePixel(flash.string, flash.fret);
      ctx.strokeStyle = { hit: '#5cff8a', spot: '#ff9f1c' }[flash.kind] || '#ff4d4d';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath(); ctx.arc(this.sx(x), y, radiusAt(flash.string, flash.fret) * 1.9, 0, Math.PI * 2); ctx.stroke();
    }
  }

  drawCalibPoints(scale) {
    const { ctx } = this;
    const labels = ['nut E', 'nut e', '12 E', '12 e'];
    ctx.font = `${Math.round(14 * scale)}px system-ui, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    this.calibPoints.forEach(([x, y], i) => {
      ctx.fillStyle = this.calibrating ? '#ff9f1c' : 'rgba(255,159,28,0.8)';
      ctx.beginPath(); ctx.arc(this.sx(x), y, 7 * scale, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(labels[i], this.sx(x) + 10 * scale, y - 10 * scale);
    });
    if (this.calibrating) {
      const W = this.canvas.width;
      const y = this.canvas.height * 0.2;
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, y - 34 * scale, W, 80 * scale);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd23f';
      ctx.font = `bold ${Math.round(26 * scale)}px system-ui, sans-serif`;
      ctx.fillText(`${this.calibPoints.length + 1}/4 · Touch: ${CALIB_PROMPTS[this.calibPoints.length]}`, W / 2, y);
      ctx.fillStyle = '#e6e8ee';
      ctx.font = `${Math.round(16 * scale)}px system-ui, sans-serif`;
      ctx.fillText(this.landmarker ? 'Index fingertip on the spot, hold still ~1 s · or click it · Esc to cancel' : 'Click the spot on the video · Esc to cancel', W / 2, y + 30 * scale);
    }
  }

  // Progress ring around the fingertip while a calibration point is being held.
  drawTouch(scale) {
    const t = this.touch;
    if (!this.calibrating || !t) return;
    const { ctx } = this;
    const frac = Math.min(1, (performance.now() - t.start) / HOLD_MS);
    const x = this.sx(t.pos[0]);
    const y = t.pos[1];
    ctx.lineWidth = 5 * scale;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.arc(x, y, 22 * scale, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#ffd23f';
    ctx.beginPath(); ctx.arc(x, y, 22 * scale, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
  }

  drawHands(scale) {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    ctx.textBaseline = 'alphabetic';
    for (const hand of this.hands) {
      ctx.strokeStyle = 'rgba(160,255,160,0.7)';
      ctx.lineWidth = 2 * scale;
      for (const [a, b] of HAND_EDGES) this.line([hand[a].x * W, hand[a].y * H], [hand[b].x * W, hand[b].y * H]);
      for (const idx of Object.keys(FINGERTIPS)) {
        const lm = hand[idx];
        ctx.fillStyle = this.calibrating && idx === '8' ? '#ffd23f' : '#a0ffa0';
        ctx.beginPath(); ctx.arc(this.sx(lm.x * W), lm.y * H, (this.calibrating && idx === '8' ? 8 : 6) * scale, 0, Math.PI * 2); ctx.fill();
        if (this.mapper && !this.calibrating) {
          const loc = this.mapper.locate(lm.x * W, lm.y * H);
          if (loc) {
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.round(13 * scale)}px system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(`${'EADGBe'[loc.string]}${loc.fret}`, this.sx(lm.x * W), lm.y * H - 12 * scale);
          }
        }
      }
    }
  }
}
