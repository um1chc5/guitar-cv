# Features (what's built)

## Screen layout

- **Top bar:** ☰ drawer, 🔥 streak, ⭐ stars, status line, 🔊 Listen, ▶ Play, 🎸 Audio, ◧ View,
  VI/EN, 🌙/☀️.
- **Left:** the *Target* card (the note to play now, string and fret) and the mode buttons.
- **Centre:** the lesson card (text, tips, part chips, Listen / Start, goal bar) and the score bar.
- **Right:** the *Heard* card (detected note, Hz, cents needle — doubles as a tuner, input level)
  and the *Tempo* card.
- **Main area:** the fretboard diagram with the note sequence strip above it.
- **Drawer (☰):** *Learn* (the lesson path) and *Free practice* (pattern settings), plus practice
  and audio-input settings. On narrow screens it starts closed and closes after you pick a lesson.

## Input setup

On start, a dialog asks for the guitar input: device and channel (Input 1 / Input 2 / Mix),
because interfaces put the guitar on one channel only. *Start* or *Skip* both open the next lesson.

## Theory engine (`js/theory.js`)

- Any of 12 roots + a pattern:
  - **Scales:** major, natural minor, major / minor pentatonic, blues, dorian, phrygian, lydian,
    mixolydian, locrian, harmonic minor, melodic minor.
  - **Arpeggios:** major, minor, diminished, augmented, maj7, m7, dom7, m7♭5, dim7.
- Standard tuning (E A D G B E), frets 0–15.
- Labels: scale degrees (R, ♭3, 5 …) or note names.
- **Positions:** box presets start from each pattern note on the low E string (≈ the 5 pentatonic
  boxes), or the whole neck, or a custom fret range.
- **Sequences:** ascending, descending, up & down, groups of 3, groups of 4, random.

## Fretboard diagram (`js/fretboard.js`)

SVG, high e on top like tab. Shows every pattern note (outside the box faded), roots in red, the
target in orange with a pulsing ring, a dashed ring on the next note, green / red flashes on hits /
misses. Click any note to hear it.

## Pitch detection (`js/pitch.js`)

YIN pitch detection tuned for guitar (70 Hz – 1.4 kHz), an RMS noise gate (adjustable in the
drawer), and an onset after the same note is stable for 3 frames. Monophonic — single notes, not
chords. *Accept any octave* is available for players whose guitar sits an octave off.

## Practice modes (`js/practice.js`)

- **Explore** — just show the shape; Space switches to Free tempo (or Metronome without audio).
- **Free tempo** — advances when the right note is heard.
- **Metronome** — the target moves on every click; each beat is judged hit or miss.
- **Listen** — the app plays the sequence and lights the notes (not scored).
- Stats: hits, misses, streak, best, notes/min, runs.

## Tempo card

BPM with −5 / +5, a slider (30–200) and quick chips (60 · 70 · 80 · 100 · 120, plus the lesson
tempo if it's another value). In lesson part 2 the lesson tempo is marked on the slider and
slower chips are dashed: *"practice only, won't pass"*.

## Sound out (`js/synth.js`)

Metronome clicks (accent on the first beat) and a Karplus-Strong plucked string for Listen and
note clicks. The app does **not** play your guitar back — use your interface's direct monitoring
(see [roadmap.md](roadmap.md#hearing-your-guitar)).

## Look, language, keys

- Light and dark themes; the default follows the system, 🌙/☀️ switches and is remembered.
- English / Vietnamese for the whole UI and every lesson; first visit picks Vietnamese if the
  browser language is Vietnamese.
- Keys: `L` listen · `Space` play / stop · `F` hide the fretboard · `→` skip a note ·
  `Esc` close the results.
