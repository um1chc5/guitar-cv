// Music theory: notes, scales, arpeggios, fretboard mapping, practice sequences.

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// String 0 = low E ... string 5 = high E (MIDI numbers of open strings).
export const STANDARD_TUNING = [40, 45, 50, 55, 59, 64];
export const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];
export const MAX_FRET = 15;

const DEGREE_LABELS = ['R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];

export const PATTERNS = {
  scales: {
    'Minor pentatonic': [0, 3, 5, 7, 10],
    'Major pentatonic': [0, 2, 4, 7, 9],
    'Blues': [0, 3, 5, 6, 7, 10],
    'Major (Ionian)': [0, 2, 4, 5, 7, 9, 11],
    'Natural minor (Aeolian)': [0, 2, 3, 5, 7, 8, 10],
    'Dorian': [0, 2, 3, 5, 7, 9, 10],
    'Phrygian': [0, 1, 3, 5, 7, 8, 10],
    'Lydian': [0, 2, 4, 6, 7, 9, 11],
    'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'Locrian': [0, 1, 3, 5, 6, 8, 10],
    'Harmonic minor': [0, 2, 3, 5, 7, 8, 11],
    'Melodic minor': [0, 2, 3, 5, 7, 9, 11],
  },
  arpeggios: {
    'Major triad': [0, 4, 7],
    'Minor triad': [0, 3, 7],
    'Diminished triad': [0, 3, 6],
    'Augmented triad': [0, 4, 8],
    'Major 7': [0, 4, 7, 11],
    'Minor 7': [0, 3, 7, 10],
    'Dominant 7': [0, 4, 7, 10],
    'Minor 7♭5': [0, 3, 6, 10],
    'Diminished 7': [0, 3, 6, 9],
  },
};

export function findPattern(name) {
  return PATTERNS.scales[name] || PATTERNS.arpeggios[name];
}

export const midiToName = (midi) => NOTE_NAMES[((midi % 12) + 12) % 12];
export const midiToNameOctave = (midi) => midiToName(midi) + (Math.floor(midi / 12) - 1);
export const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
export const freqToMidiFloat = (f) => 69 + 12 * Math.log2(f / 440);

export function degreeLabel(midi, root) {
  return DEGREE_LABELS[(((midi - root) % 12) + 12) % 12];
}

// All positions (string, fret) on the neck whose pitch class is in the pattern.
export function patternNotes(root, intervals, { minFret = 0, maxFret = MAX_FRET, tuning = STANDARD_TUNING } = {}) {
  const pcs = new Set(intervals.map((i) => (root + i) % 12));
  const notes = [];
  tuning.forEach((open, string) => {
    for (let fret = minFret; fret <= maxFret; fret++) {
      const midi = open + fret;
      if (pcs.has(midi % 12)) {
        notes.push({ string, fret, midi, isRoot: midi % 12 === root, degree: degreeLabel(midi, root) });
      }
    }
  });
  return notes;
}

// Every (string, fret) where this exact pitch can be played.
export function candidatePositions(midi, tuning = STANDARD_TUNING) {
  return tuning
    .map((open, string) => ({ string, fret: midi - open }))
    .filter((p) => p.fret >= 0 && p.fret <= MAX_FRET);
}

// CAGED name of each pentatonic position, keyed by the degree it starts from on the low E string.
// Going up the neck the shapes come in the order E, D, C, A, G.
const MINOR_CAGED = { R: "E", "♭3": "D", 4: "C", 5: "A", "♭7": "G" };
const CAGED = {
  "Minor pentatonic": MINOR_CAGED,
  Blues: MINOR_CAGED,
  "Major pentatonic": { R: "E", 2: "D", 3: "C", 5: "A", 6: "G" },
};
export const cagedShape = (pattern, degree) => CAGED[pattern]?.[degree] ?? null;

// Box positions: one per pattern note on the low E string, each a ~5-fret window.
// Position 1 starts on the root; the rest follow up the neck (wrapping at the 12th fret).
export function positionPresets(root, intervals, tuning = STANDARD_TUNING) {
  const lowE = patternNotes(root, intervals, { maxFret: 11, tuning }).filter((n) => n.string === 0);
  const start = Math.max(0, lowE.findIndex((n) => n.isRoot));
  const ordered = [...lowE.slice(start), ...lowE.slice(0, start)];
  return ordered.map((n, i) => {
    const min = Math.max(0, n.fret - (n.fret > 0 ? 1 : 0));
    return { label: `Pos ${i + 1} (fret ${n.fret}, ${n.degree})`, fret: n.fret, degree: n.degree, min, max: Math.min(MAX_FRET, min + 4) };
  });
}

// One playable note per pitch, ordered low -> high. When a pitch exists on two strings
// inside the window, keep the one on the thicker string unless it would stretch past the box.
export function scaleRun(notes) {
  const byMidi = new Map();
  for (const n of notes) {
    const prev = byMidi.get(n.midi);
    if (!prev) byMidi.set(n.midi, n);
  }
  // Prefer thinner string if the thick-string note is a stretch (fret far from window centre).
  const frets = notes.map((n) => n.fret);
  const centre = (Math.min(...frets) + Math.max(...frets)) / 2;
  for (const n of notes) {
    const cur = byMidi.get(n.midi);
    if (cur !== n && Math.abs(n.fret - centre) + 1 < Math.abs(cur.fret - centre)) byMidi.set(n.midi, n);
  }
  return [...byMidi.values()].sort((a, b) => a.midi - b.midi);
}

export const SEQUENCES = ['Ascending', 'Descending', 'Up & down', 'Groups of 3', 'Groups of 4', 'Random'];

export function buildSequence(run, kind) {
  if (run.length === 0) return [];
  const up = run;
  const down = [...run].reverse();
  const groups = (size) => {
    const out = [];
    for (let i = 0; i + size <= up.length; i++) out.push(...up.slice(i, i + size));
    for (let i = 0; i + size <= down.length; i++) out.push(...down.slice(i, i + size));
    return out;
  };
  switch (kind) {
    case 'Descending': return down;
    case 'Up & down': return [...up, ...down.slice(1)];
    case 'Groups of 3': return groups(3);
    case 'Groups of 4': return groups(4);
    case 'Random': {
      const out = [];
      let last = null;
      for (let i = 0; i < 32; i++) {
        let n;
        do { n = run[Math.floor(Math.random() * run.length)]; } while (run.length > 1 && n === last);
        out.push(n); last = n;
      }
      return out;
    }
    default: return up;
  }
}
