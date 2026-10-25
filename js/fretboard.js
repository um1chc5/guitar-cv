// SVG fretboard diagram. High e string on top (like tab), nut on the left.

import { MAX_FRET, STRING_NAMES, midiToName } from './theory.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const W = 1000;
const H = 230;
const LEFT = 46;   // space for string names + open-string notes
const RIGHT = 14;
const TOP = 22;
const BOTTOM = 34; // fret numbers
const INLAYS = [3, 5, 7, 9, 15];

const el = (tag, attrs = {}, parent) => {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
};

export class Fretboard {
  constructor(svg, { onNoteClick } = {}) {
    this.svg = svg;
    this.onNoteClick = onNoteClick;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this.fretW = (W - LEFT - RIGHT) / (MAX_FRET + 0.6);
    this.stringGap = (H - TOP - BOTTOM) / 5;
    this.drawStatic();
    this.dynamic = el('g', {}, svg);
  }

  // x for the *spot where you press* a fret (between fret wires), fret 0 = left of nut.
  noteX(fret) {
    if (fret === 0) return LEFT - 20;
    return LEFT + (fret - 0.5) * this.fretW;
  }
  wireX(fret) { return LEFT + fret * this.fretW; }
  stringY(string) { return TOP + (5 - string) * this.stringGap; }

  drawStatic() {
    const g = el('g', {}, this.svg);
    const boardRight = this.wireX(MAX_FRET) + this.fretW * 0.6;
    el('rect', { x: LEFT, y: TOP - 10, width: boardRight - LEFT, height: this.stringGap * 5 + 20, rx: 4, class: 'fb-wood' }, g);
    for (const f of INLAYS) {
      el('circle', { cx: this.noteX(f), cy: TOP + this.stringGap * 2.5, r: 6, class: 'fb-inlay' }, g);
    }
    el('circle', { cx: this.noteX(12), cy: TOP + this.stringGap * 1.5, r: 6, class: 'fb-inlay' }, g);
    el('circle', { cx: this.noteX(12), cy: TOP + this.stringGap * 3.5, r: 6, class: 'fb-inlay' }, g);
    for (let f = 0; f <= MAX_FRET; f++) {
      el('line', { x1: this.wireX(f), x2: this.wireX(f), y1: TOP - 10, y2: TOP + this.stringGap * 5 + 10, class: f === 0 ? 'fb-nut' : 'fb-wire' }, g);
      if (f > 0) {
        const t = el('text', { x: this.noteX(f), y: H - 10, class: 'fb-fretnum' + (INLAYS.includes(f) || f === 12 ? ' strong' : '') }, g);
        t.textContent = f;
      }
    }
    for (let s = 0; s < 6; s++) {
      el('line', { x1: LEFT, x2: boardRight, y1: this.stringY(s), y2: this.stringY(s), class: 'fb-string', 'stroke-width': 1 + (5 - s) * 0.35 }, g);
      const t = el('text', { x: 10, y: this.stringY(s) + 4, class: 'fb-strname' }, g);
      t.textContent = STRING_NAMES[s];
    }
  }

  render({ notes = [], windowMin = 0, windowMax = MAX_FRET, labelMode = 'degree', target = null, next = null, fingers = [], flash = null }) {
    const g = this.dynamic;
    g.replaceChildren();

    // Shade the active window.
    if (windowMin > 0 || windowMax < MAX_FRET) {
      const x1 = windowMin === 0 ? LEFT - 36 : this.wireX(windowMin - 1);
      el('rect', { x: x1, y: TOP - 14, width: this.wireX(windowMax) - x1, height: this.stringGap * 5 + 28, rx: 6, class: 'fb-window' }, g);
    }

    for (const n of notes) {
      const inWin = n.fret >= windowMin && n.fret <= windowMax && !n.dim;
      const isTarget = target && target.string === n.string && target.fret === n.fret;
      const cls = ['fb-note', n.isRoot ? 'root' : '', inWin ? '' : 'faded', isTarget ? 'target' : ''].join(' ');
      const grp = el('g', { class: cls, transform: `translate(${this.noteX(n.fret)},${this.stringY(n.string)})` }, g);
      el('circle', { r: 12 }, grp);
      const t = el('text', { y: 4 }, grp);
      t.textContent = labelMode === 'degree' ? n.degree : midiToName(n.midi);
      grp.addEventListener('pointerdown', () => this.onNoteClick?.(n));
    }

    if (next && !(target && next.string === target.string && next.fret === target.fret)) {
      el('circle', { cx: this.noteX(next.fret), cy: this.stringY(next.string), r: 16, class: 'fb-next' }, g);
    }
    if (target) {
      el('circle', { cx: this.noteX(target.fret), cy: this.stringY(target.string), r: 18, class: 'fb-target-ring' }, g);
    }
    if (flash) {
      el('circle', { cx: this.noteX(flash.fret), cy: this.stringY(flash.string), r: 20, class: 'fb-flash ' + flash.kind }, g);
    }
    for (const f of fingers) {
      el('circle', { cx: this.noteX(f.fret), cy: this.stringY(f.string), r: 7, class: 'fb-finger' }, g);
    }
  }
}
