// Practice session: walks a note sequence, advancing by ear (mic), camera (fingertips)
// or metronome, and keeps score.

import { click } from './synth.js';

const CAMERA_DWELL_MS = 350;
const FLASH_MS = 350;

export class PracticeSession {
  // locate(midi) -> {string, fret, verified}: where on the neck a heard pitch was most likely
  // played (verified = a tracked fingertip confirms it).
  constructor({ onChange, onMessage, locate } = {}) {
    this.onChange = onChange;
    this.onMessage = onMessage;
    this.locate = locate;
    this.requirePosition = true;
    this.mode = 'explore';
    this.running = false; // a mode is armed when picked and runs after play()
    this.sequence = [];
    this.index = 0;
    this.ignoreOctave = false;
    this.bpm = 70;
    this.flash = null;
    this.resetStats();
  }

  resetStats() {
    this.stats = { hits: 0, misses: 0, wrongSpot: 0, streak: 0, best: 0, laps: 0, startedAt: null };
  }

  get target() { return this.mode === 'explore' ? null : this.sequence[this.index] || null; }
  get next() { return this.mode === 'explore' ? null : this.sequence[(this.index + 1) % this.sequence.length] || null; }

  setSequence(seq) {
    this.sequence = seq;
    this.index = 0;
    this.emit();
  }

  setMode(mode) {
    this.stopMetronome();
    this.running = false;
    this.mode = mode;
    this.index = 0;
    this.resetStats();
    this.emit();
  }

  play() {
    this.stopMetronome();
    this.index = 0;
    this.resetStats();
    this.running = true;
    if (this.mode === 'metronome') this.startMetronome();
    this.emit();
  }

  stop() {
    this.stopMetronome();
    this.running = false;
    this.emit();
  }

  setBpm(bpm) {
    this.bpm = bpm;
    if (this.mode === 'metronome' && this.running) this.startMetronome();
  }

  emit() { this.onChange?.(this); }

  matches(midi, target) {
    if (!target || midi == null) return false;
    return this.ignoreOctave ? (midi - target.midi) % 12 === 0 : midi === target.midi;
  }

  setFlash(note, kind) {
    this.flash = { string: note.string, fret: note.fret, kind };
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => { this.flash = null; this.emit(); }, FLASH_MS);
  }

  get accuracy() {
    const total = this.stats.hits + this.stats.misses;
    return total ? this.stats.hits / total : 0;
  }

  hit() {
    const t = this.target;
    this.stats.startedAt ??= performance.now();
    this.stats.hits++;
    this.stats.streak++;
    this.stats.best = Math.max(this.stats.best, this.stats.streak);
    this.setFlash(t, 'hit');
    this.advance();
  }

  miss(note, kind = 'miss') {
    this.stats.startedAt ??= performance.now();
    this.stats.misses++;
    if (kind === 'spot') this.stats.wrongSpot++;
    this.stats.streak = 0;
    if (note) this.setFlash(note, kind);
    this.emit();
  }

  // Right pitch, but did the camera see it played at the target spot?
  wrongSpot(midi) {
    const t = this.target;
    if (!this.requirePosition || !this.locate || midi !== t.midi) return null;
    const pos = this.locate(midi);
    if (!pos?.verified || pos.string === t.string) return null;
    return pos;
  }

  advance() {
    this.index++;
    if (this.index >= this.sequence.length) { this.index = 0; this.stats.laps++; }
    this.cameraDwellStart = null;
    this.emit();
  }

  // ---- inputs ----------------------------------------------------------------

  handlePitch(p) {
    if (!this.running || !p.onset || !this.target) return;
    const prev = this.sequence[(this.index - 1 + this.sequence.length) % this.sequence.length];
    if (this.mode !== 'ear' && this.mode !== 'metronome') return;
    if (this.matches(p.midi, this.target)) {
      const spot = this.wrongSpot(p.midi);
      if (spot) {
        this.onMessage?.(`Right note, wrong place: you played it on the ${'EADGBe'[spot.string]} string fret ${spot.fret} — target is ${'EADGBe'[this.target.string]} string fret ${this.target.fret}.`);
        if (this.mode === 'ear') this.miss(spot, 'spot');
        else this.beatSpot = spot;
        return;
      }
      if (this.mode === 'ear') this.hit();
      else this.beatHit = true;
    } else if (this.mode === 'ear' && !this.matches(p.midi, prev)) {
      this.miss(this.locate?.(p.midi) || this.target);
    }
  }

  handleFingers(fingers) {
    if (!this.running || this.mode !== 'camera' || !this.target) return;
    const t = this.target;
    const onTarget = fingers.some((f) => f.string === t.string && f.fret === t.fret);
    if (!onTarget) { this.cameraDwellStart = null; return; }
    const now = performance.now();
    this.cameraDwellStart ??= now;
    if (now - this.cameraDwellStart >= CAMERA_DWELL_MS) this.hit();
  }

  // ---- metronome ---------------------------------------------------------------

  startMetronome() {
    this.stopMetronome();
    this.beat = 0;
    this.beatHit = false;
    const tick = () => {
      if (this.beat > 0) {
        // Judge the note that was due on the beat that just ended.
        if (this.beatHit) this.hit();
        else if (this.beatSpot) { this.miss(this.beatSpot, 'spot'); this.advance(); }
        else { this.miss(this.target); this.advance(); }
      }
      this.beatHit = false;
      this.beatSpot = null;
      click(this.beat % 4 === 0);
      this.beat++;
    };
    tick();
    this.metroTimer = setInterval(tick, 60000 / this.bpm);
  }

  stopMetronome() {
    clearInterval(this.metroTimer);
    this.metroTimer = null;
  }

  notesPerMinute() {
    if (!this.stats.startedAt) return 0;
    const mins = (performance.now() - this.stats.startedAt) / 60000;
    return mins > 0.05 ? Math.round(this.stats.hits / mins) : 0;
  }
}
