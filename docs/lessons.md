# Lessons

All lesson data lives in `js/curriculum.js`. Each lesson is a preset (root, pattern, position,
sequence) plus a test, with its text in English and Vietnamese (`{ en, vi }`).

## Lesson flow

1. **🔊 Listen** — a 3-2-1 count-in, then the app plays the sequence (plucked-string synth) at the
   lesson tempo and lights each note on the fretboard.
2. **Part 1 · Free tempo** — no metronome. The next note lights up once the app hears the current
   one. Play the shape **2 times** at the lesson accuracy (85–90 % of notes right) →
   *"Part 1 passed!"*, saved as half-done.
3. **Part 2 · In time** — the same with the metronome at the lesson tempo, **2 times**, at a looser
   bar (about 75 %, because timing makes it harder). Passing completes the lesson.

Look-only lessons (*Meet the box*, *The five boxes*) have just **Listen** and **Got it ✓**.

Every count-in is three clicks at the practice tempo, then **GO**. `Space` starts and stops,
`L` listens.

## Scoring

| | Rule |
|---|---|
| Accuracy | notes right ÷ (notes right + misses) over the 2 runs |
| Part 1 pass | accuracy ≥ the lesson's `accuracy` (0.85 or 0.9) |
| Part 2 pass | accuracy ≥ the lesson's `timed` (0.7–0.75) **and** tempo ≥ the lesson tempo |
| Stars (from part 2) | ★ pass · ★★ ≥ 90 % · ★★★ ≥ 98 % |

- Slowing the tempo below the lesson tempo is allowed, but the run is "practice only" and can't
  pass — the Tempo card says so and marks the lesson tempo on its slider.
- Feedback while playing: wrong notes show *"You played C3 · target D3"*; every 5 notes in a row
  gets a cheer.
- The results screen shows stars, accuracy, best streak and notes right, with *Start part 2*,
  *Next lesson*, *Try again* or *Again, 10 BPM faster*.
- The top bar shows a 🔥 daily streak (days in a row with a finished run) and ⭐ total stars.

Progress is stored in the browser (`localStorage`, key `fretcoach.progress`):
`{ [lessonId]: { part1?: true, stars?: 1–3, at } }`. A lesson counts as done once it has stars.

## The path (25 lessons)

| Level | Focus | Lessons (part 2 tempo) |
|---|---|---|
| 1 · First box | A minor pentatonic, position 1 | Meet the box (look) → Climb the box (60) → Up and back down (70) |
| 2 · The whole neck | the 5 pentatonic boxes | The five boxes (look) → Box 2 (70) → Connect box 1 → 2 (65) → Box 3, 4, 5 (70) |
| 3 · Blues & major sound | blue note, relative major | The blue note (70) → Same shape, major sound (70) → Groups of 3 (70) |
| 4 · Chord tones | arpeggios inside the scale | A minor triad → A minor 7 → A7 → C major 7 (all 70) |
| 5 · Full scales & modes | 7-note scales | G major → A natural minor → A dorian → A mixolydian → E harmonic minor (all 65) |
| 6 · Speed & freedom | speed, seeing the shape, other keys | Groups of 4 (100) → Random notes (60) → E minor pentatonic open (80) → D dorian (75) |

The two separate "In time 60 / 90 BPM" lessons of the first version were merged into part 2 of
every lesson.

## Adding a lesson

Add an object to a level in `LEVELS`:

```js
{
  id: 'l3-new',                                  // unique, used as the progress key
  title: { en: '…', vi: '…' },
  text:  { en: '…', vi: '…' },
  tips:  { en: ['…'], vi: ['…'] },
  settings: { root: A, pattern: 'Minor pentatonic', position: 1, sequence: 'Up & down' },
  test: test(70),                                // or test(bpm, accuracy, timed); null = look-only
}
```

`pattern` must be a key of `PATTERNS` in `js/theory.js`; `position` is a box number, `'all'` or
`{ min, max }` frets.

## Ideas for later levels

Bends to pitch (audio measures cents), vibrato, licks with rhythm, improvising over backing tracks
with "land on a chord tone" scoring.
