// Tiny output synth: metronome clicks and plucked-string note previews.

import { midiToFreq } from './theory.js';

let ctx = null;
const getCtx = () => {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

export function click(accent = false) {
  const c = getCtx();
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.frequency.value = accent ? 1600 : 1000;
  gain.gain.setValueAtTime(0.35, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}

// Karplus-Strong plucked string.
export function pluck(midi, duration = 1.2) {
  const c = getCtx();
  const freq = midiToFreq(midi);
  const sr = c.sampleRate;
  const len = Math.floor(sr * duration);
  const buffer = c.createBuffer(1, len, sr);
  const data = buffer.getChannelData(0);
  const period = Math.round(sr / freq);
  const ring = new Float32Array(period).map(() => Math.random() * 2 - 1);
  for (let i = 0; i < len; i++) {
    const j = i % period;
    const nextJ = (j + 1) % period;
    data[i] = ring[j];
    ring[j] = 0.996 * 0.5 * (ring[j] + ring[nextJ]);
  }
  const src = c.createBufferSource();
  const gain = c.createGain();
  gain.gain.value = 0.4;
  src.buffer = buffer;
  src.connect(gain).connect(c.destination);
  src.start();
}
