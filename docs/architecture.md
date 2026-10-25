# Architecture

## Files

```
index.html          the single page: top bar, HUD cards, fretboard, drawer, dialogs
css/style.css       design tokens, light/dark themes, layout, components, fretboard SVG styles
js/
├─ app.js           UI wiring: lessons, two-part tests, controls, tempo card, count-in, listen,
│                   results, toasts, streak, theme, language, devices, keyboard
├─ theory.js        notes, intervals, scales/arpeggios, notes on the neck, boxes, sequences
├─ fretboard.js     SVG fretboard renderer
├─ practice.js      practice session state machine: modes, target/next, hit/miss, metronome, stats
├─ pitch.js         audio input + YIN pitch detection → { midi, freq, cents, rms, onset }
├─ synth.js         metronome click + Karplus-Strong pluck
├─ curriculum.js    levels and lessons (en + vi), test rules, progress storage, stars
├─ i18n.js          English / Vietnamese strings, t(), applyStatic()
├─ camera.js        webcam + MediaPipe hands + calibration + AR overlay   (off by default)
└─ geometry.js      fret maths, homography, neck ↔ pixel mapping           (used by camera.js)
server.js           local static server
docs/               these pages
```

`app.js` is the only module that touches the DOM outside the fretboard and camera canvas; the
others are plain logic with small callback interfaces.

## Data flow

```
guitar → audio interface → getUserMedia → pitch.js (YIN, every 20 ms)
                                              │ { midi, cents, onset }
                                              ▼
lesson / free-practice settings ──► theory.js ──► sequence ──► practice.js
                                                                │ onChange
                     ┌──────────────────────────────────────────┤
                     ▼                    ▼                     ▼
             fretboard.js (SVG)    HUD cards (app.js)    checkLesson(): after 2 runs
                                                         → part 1 / part 2 result
                                                         → progress in localStorage
```

- A **mode** decides how the target advances: on a heard note (Free tempo), on a beat
  (Metronome), on a fingertip (camera), or not at all (Explore).
- In a lesson the mode is the part: Free tempo = part 1, Metronome = part 2.
- `practice.js` only advances while `running` — picking a mode arms it; the count-in then calls
  `play()`.
- Rendering is batched with `requestAnimationFrame`; the pitch loop runs on `setInterval` so it
  keeps working when the tab isn't visible.

## Translation

- Static text: `data-i18n` (text), `data-i18n-html` (markup with `<kbd>`), `data-i18n-title`
  (tooltips), filled by `applyStatic()`.
- Code: `t('key', { vars })`; lesson fields `{ en, vi }` via `L(field)`; scale and sequence names
  stay English as data values and are translated only for display.
- Switching language re-renders in place, so audio keeps running.

## Stored in the browser (`localStorage`)

| Key | Content |
|---|---|
| `fretcoach.progress` | per lesson: part 1 passed, stars, time |
| `fretcoach.prefs` | free-practice settings (root, pattern, position, frets, labels, sequence) |
| `fretcoach.daily` | streak: days in a row, last day |
| `fretcoach.channel` | audio-interface channel |
| `fretcoach.lang` | `en` / `vi` |
| `fretcoach.theme` | `light` / `dark` (absent = follow the system) |
| `fretcoach.drawer` | drawer open / closed on wide screens |
| `fretcoach.calibration` | camera neck calibration (4 points) |

Nothing is sent to a server. Clearing site data resets everything.

## Feature switch

`CAMERA_FEATURES` at the top of `js/app.js` turns the webcam features on or off. When off, the
body gets a `no-cam` class, every `[data-cam]` element is hidden, and the layout becomes a normal
page with the fretboard as the main view. See [camera.md](camera.md).
