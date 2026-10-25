// Microphone / audio-interface input + YIN pitch detection tuned for guitar.

import { freqToMidiFloat } from './theory.js';

const MIN_FREQ = 70;    // a bit below low E (82 Hz) for drop tunings / flat strings
const MAX_FREQ = 1400;  // ~fret 22 on high e
const YIN_THRESHOLD = 0.15;

export class PitchDetector {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.buf = null;
    this.running = false;
    this.gate = 0.01; // RMS noise gate
    this.listeners = new Set();
    this.stableMidi = null;
    this.stableCount = 0;
  }

  static async listInputs() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'audioinput');
  }

  // channel: 'mix' | 0 | 1. Audio interfaces usually put the guitar on input 1 only,
  // and mixing in the empty channel halves the level.
  async start(deviceId, channel = 'mix') {
    this.stop();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        channelCount: { ideal: 2 },
        echoCancellation: false, noiseSuppression: false, autoGainControl: false,
      },
    });
    this.channelCount = this.stream.getAudioTracks()[0]?.getSettings().channelCount || 1;
    this.ctx = new AudioContext({ latencyHint: 'interactive' });
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    if (channel === 'mix') {
      src.connect(this.analyser);
    } else {
      const splitter = this.ctx.createChannelSplitter(2);
      src.connect(splitter);
      splitter.connect(this.analyser, Math.min(+channel, this.channelCount - 1));
    }
    this.buf = new Float32Array(this.analyser.fftSize);
    await this.ctx.resume();
    this.running = true;
    // A timer (not rAF) keeps listening while the tab is in the background.
    this.timer = setInterval(() => this.tick(), 20);
  }

  stop() {
    this.running = false;
    clearInterval(this.timer);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.ctx?.close();
    this.ctx = null;
  }

  onPitch(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  tick() {
    this.analyser.getFloatTimeDomainData(this.buf);
    let rms = 0;
    for (let i = 0; i < this.buf.length; i++) rms += this.buf[i] * this.buf[i];
    rms = Math.sqrt(rms / this.buf.length);

    let result = { rms, freq: null, midi: null, cents: 0, stable: false };
    if (rms > this.gate) {
      const freq = yin(this.buf, this.ctx.sampleRate);
      if (freq) {
        const mf = freqToMidiFloat(freq);
        const midi = Math.round(mf);
        result = { rms, freq, midi, cents: Math.round((mf - midi) * 100), stable: false };
      }
    }

    // A note counts as "played" once it is detected on several consecutive frames.
    if (result.midi !== null && result.midi === this.stableMidi) this.stableCount++;
    else { this.stableMidi = result.midi; this.stableCount = result.midi === null ? 0 : 1; }
    result.stable = this.stableCount >= 3;
    result.onset = this.stableCount === 3;

    for (const fn of this.listeners) fn(result);
  }
}

function yin(buf, sampleRate) {
  const tauMin = Math.floor(sampleRate / MAX_FREQ);
  const tauMax = Math.min(Math.floor(sampleRate / MIN_FREQ), Math.floor(buf.length / 2));
  const W = buf.length - tauMax;
  const d = new Float32Array(tauMax + 1);
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < W; i++) {
      const diff = buf[i] - buf[i + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }
  // Cumulative mean normalised difference.
  let running = 0;
  d[0] = 1;
  for (let tau = 1; tau <= tauMax; tau++) {
    running += d[tau];
    d[tau] = running ? (d[tau] * tau) / running : 1;
  }
  let tau = tauMin;
  for (; tau <= tauMax; tau++) {
    if (d[tau] < YIN_THRESHOLD) {
      while (tau + 1 <= tauMax && d[tau + 1] < d[tau]) tau++;
      break;
    }
  }
  if (tau > tauMax) return null;
  // Parabolic interpolation around the minimum.
  const x0 = d[tau - 1] ?? d[tau];
  const x2 = d[tau + 1] ?? d[tau];
  const denom = x0 + x2 - 2 * d[tau];
  const better = denom ? tau + (x0 - x2) / (2 * denom) : tau;
  return sampleRate / better;
}
