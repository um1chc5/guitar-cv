// Fretboard geometry: maps (fret, string) <-> video pixels using a homography
// fitted to 4 calibration clicks (low/high E at the nut and at the 12th fret).
//
// "Neck space": X runs along the neck in units of half the scale length
// (nut = 0, 12th fret = 1). Y runs across the neck, centred on the neck axis.
// The neck tapers, so string spread grows from the nut to the 12th fret.

import { MAX_FRET } from './theory.js';

// Typical E-to-E string spread (≈35 mm at nut, ≈44 mm at 12th) / half scale (≈324 mm).
const SPREAD_NUT = 0.108;
const SPREAD_12 = 0.136;

const spread = (X) => SPREAD_NUT + (SPREAD_12 - SPREAD_NUT) * X;

// Physical position of fret wire n.
export const fretWireX = (n) => 2 * (1 - Math.pow(2, -n / 12));

// Where a finger presses for fret n (a bit behind the wire); open strings sit before the nut.
export function pressX(fret) {
  if (fret === 0) return -0.05;
  const a = fretWireX(fret - 1);
  const b = fretWireX(fret);
  return a + 0.65 * (b - a);
}

// Solve the 3x3 homography mapping src[i] -> dst[i] (4 point pairs).
export function solveHomography(src, dst) {
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  const h = gaussSolve(A, b);
  if (!h) return null;
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

function gaussSolve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    if (Math.abs(M[piv][c]) < 1e-12) return null;
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

const apply = (m, x, y) => {
  const w = m[6] * x + m[7] * y + m[8];
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];
};

function invert3(m) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) return null;
  return [
    A / det, -(b * i - c * h) / det, (b * f - c * e) / det,
    B / det, (a * i - c * g) / det, -(a * f - c * d) / det,
    C / det, -(a * h - b * g) / det, (a * e - b * d) / det,
  ];
}

// String s (0 = low E, 5 = high E) -> Y offset across the neck at position X.
const stringY = (s, X) => (s / 5 - 0.5) * spread(X);

export class NeckMapper {
  // points: [nutLowE, nutHighE, fret12LowE, fret12HighE] in video pixels.
  constructor(points) {
    const src = [
      [0, stringY(0, 0)], [0, stringY(5, 0)],
      [1, stringY(0, 1)], [1, stringY(5, 1)],
    ];
    this.H = solveHomography(src, points);
    this.Hinv = this.H && invert3(this.H);
    this.ok = !!this.Hinv;
  }

  // Neck coordinates (X along the neck, s = fractional string index) -> pixel.
  toPixel(X, s) {
    return apply(this.H, X, stringY(s, X));
  }

  notePixel(string, fret) {
    return this.toPixel(pressX(fret), string);
  }

  // Pixel -> {string, fret} or null if outside the neck.
  locate(px, py) {
    const [X, Y] = apply(this.Hinv, px, py);
    const s = (Y / spread(X) + 0.5) * 5;
    if (s < -0.6 || s > 5.6) return null;
    if (X < -0.12 || X > fretWireX(MAX_FRET)) return null;
    let fret = 0;
    if (X > 0) {
      fret = 1;
      while (fret < MAX_FRET && fretWireX(fret) < X) fret++;
    }
    return { string: Math.max(0, Math.min(5, Math.round(s))), fret, X, s };
  }
}
