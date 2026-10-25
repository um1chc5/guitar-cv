# Fretboard Coach — webcam-assisted guitar solo trainer

## The idea

A browser app that helps you learn the building blocks of electric guitar soloing —
**scales, arpeggios, box positions** — by watching you through the **webcam** and
listening through the **microphone / audio interface**.

Instead of staring at a tab or a chart and guessing whether you're in the right place,
the app overlays the target notes directly **on the live video of your guitar neck**
(a kind of AR fretboard), tells you **which fret/string your fingertips are on**, and
**hears whether you played the right note**.

No install, no account: open the page, allow camera + mic, practice.

## Who it's for

- Beginners/intermediates who know some chords and want to start soloing.
- Players who know "the pentatonic box" but want to connect positions, learn modes,
  and see chord tones (arpeggios) inside the scale.

## Product design: audio judges, camera checks position

An electric guitar plugged into an audio interface gives a clean signal the browser can read
directly (no Python needed). That makes **audio the primary judge**: it reliably answers
*which note* and *when*. But audio cannot answer *where*: the same E4 exists at 5 places on
the neck, and learning solos is mostly about positions and boxes.

So the **camera's job is only to pick between candidate positions** for the pitch audio heard.
Same-pitch spots on neighbouring strings are ~5 frets apart, so the camera only needs to be
accurate to about ±2 frets — far easier than reading exact fingertips. It also sidesteps the
camera's biggest weakness (it can't tell a pressed finger from a hovering one): audio says a
note was played, the camera just says where the hand was.

| Situation | Result |
|---|---|
| Right pitch, fingertip near the target spot | ✅ hit |
| Right pitch, fingertip clearly at another spot with that pitch | 🟠 "right note, wrong place" (counts as a miss) |
| Right pitch, no fingertip visible / no calibration | ✅ hit (trust audio) |
| Wrong pitch | ❌ miss |

## Two ways to use it

- **Learn** — a guided roadmap (below). Each lesson loads its preset, explains what and why,
  and has a goal (e.g. 2 clean runs at ≥ 90 % accuracy, at 90 BPM). Passing earns 1–3 stars
  (pass / ≥ 95 % / 100 %) and unlocks "next". Progress is saved in the browser.
- **Free practice** — on demand: any root, scale, arpeggio, box or fret range, any mode.

### Lesson flow
1. **Listen** — the app plays the sequence (plucked-string synth) at the lesson tempo and lights
   each note on the diagram, after a 3-2-1 count-in.
2. **Part 1 · Free tempo** — no metronome: the next note lights up once the app hears the current
   one. 2 runs at the lesson accuracy (85–90 %) → "Part 1 passed", saved as half-done.
3. **Part 2 · In time** — the metronome at the lesson tempo, 2 runs at a looser bar (≈75 %, timing is
   harder). Passing completes the lesson; stars (1–3 at pass / 90 % / 98 %) come from this part.
- Wrong notes get instant feedback ("You played C3 · target D3"); streak milestones get a cheer.
- Results screen: stars, accuracy, best streak; *Start part 2* / *Next lesson* / *Try again* / *10 BPM faster*.
- After the input setup the app opens the next lesson straight away (the first one for new users).
- Look-only lessons have Listen + "Got it". The separate "In time" lessons were merged into part 2
  of each lesson (25 lessons now).
- A daily streak (🔥) and total stars (⭐) sit in the top bar.

### Look
Light and dark themes (follows the system, 🌙/☀️ to switch), English / Vietnamese UI and lesson
text (VI/EN button; `js/i18n.js`, lesson text in `js/curriculum.js` as `{ en, vi }`). Gamified style: cream background, white cards with a solid bottom edge, chunky colour
buttons, Nunito font, a lesson *path* of round nodes (done / up next / current). Colours mean the
same everywhere: orange = play this, blue = note, red = root, green = success.

## Learning roadmap (25 lessons, all in `js/curriculum.js`)

| Level | Focus | Lessons |
|---|---|---|
| 1 · First box | A minor pentatonic, position 1 | meet the box → climb it → up & down |
| 2 · The whole neck | the 5 pentatonic boxes | map of all boxes → box 2 → connect 1→2 → boxes 3, 4, 5 |
| 3 · Blues & major sound | blue note, relative major | blues scale → C major pentatonic (same shape!) → groups of 3 |
| 4 · Chord tones | arpeggios inside the scale | Am → Am7 → A7 → Cmaj7 |
| 5 · Full scales & modes | 7-note scales | G major → A natural minor → A dorian → A mixolydian → E harmonic minor |
| 6 · Speed & freedom | speed, seeing the shape, other keys | groups of 4 (part 2 @ 100 BPM) → random notes → E minor pent. open → D dorian |

Ideas for later levels: bends to pitch (audio measures cents), vibrato, licks with rhythm,
improvising over backing tracks with "land on a chord tone" scoring.

## Core features (v1 — what's built)

### 1. Theory engine
- Root note (any of 12) + pattern:
  - **Scales:** major, natural minor, major/minor pentatonic, blues, dorian, phrygian,
    lydian, mixolydian, locrian, harmonic minor, melodic minor.
  - **Arpeggios:** major, minor, diminished, augmented, maj7, m7, dom7, m7♭5, dim7.
- Standard tuning (E A D G B E), frets 0–15.
- Labels: note names or scale degrees (R, ♭3, 5 …).
- **Positions:** limit the pattern to a fret window. Presets build a box starting from
  each pattern note on the low E string (≈ the 5 pentatonic boxes / CAGED shapes),
  or pick a custom fret range.

### 2. Fretboard diagram
- Clean 2D fretboard showing every pattern note in the window, roots highlighted.
- Shows the **current target note** in practice mode and **live fingertip positions**
  coming from the webcam.

### 3. Webcam AR overlay (computer vision)
- Hand tracking with **MediaPipe Hand Landmarker** (runs fully in-browser, WebGL/WASM).
- **4-click calibration**: click the low-E and high-E string at the **nut**, then at the
  **12th fret**. A homography maps "fretboard space" (fret position, string) to video
  pixels — this handles the perspective of the neck.
- Fret spacing uses the real equal-temperament rule: distance from nut to fret *n* is
  `L · (1 − 2^(−n/12))`, so frets get closer together exactly like on a real guitar.
- Once calibrated:
  - Pattern notes are drawn **on top of the neck in the video**.
  - Fingertips are mapped back (inverse homography) to **string + fret**, shown on the
    video and the diagram ("index finger → G string, 7th fret").
- Mirror toggle (practice like looking in a mirror).

### 3b. Finger-touch calibration
- Instead of clicking, touch each of the 4 calibration points with the **index fingertip**
  (MediaPipe landmark 8) and hold still ~0.9 s; a ring fills and a click confirms the capture.
- The captured point is the average fingertip position over the hold, which smooths tracker jitter.
  A new point must be away from the ones already captured, so a finger left in place can't count twice.
- Clicking on the video still works (and is used if hand tracking can't load).
- Caveat: landmark 8 is the visible tip, so a strongly curled finger may sit a few px off the contact
  point. The offset is similar for all 4 points, and dragging the dots fine-tunes it.

### 3c. Shape on the video
- The current box is outlined on the real neck (a stepped outline around each string's notes),
  and while playing an arrow points from the target note to the next one.

### 3d. Play along
- Picking a mode arms it; **Space** gives a 3-2-1 count-in (clicks at the practice tempo) and
  starts it. Space again stops.

### 4. Pitch detection (ear)
- Audio-interface (or mic) input via Web Audio, YIN pitch detector tuned for
  guitar range (~70 Hz – 1.4 kHz). Channel selector (input 1 / input 2 / mix), because
  interfaces put the guitar on one channel only.
- Displays detected note, frequency and cents offset (doubles as a tuner).

### 5. Practice modes
- **Explore** — just show the pattern on diagram + video.
- **Follow (ear)** — the app highlights the next note in the sequence; it advances only
  when the mic hears the right pitch (exact octave = right place on the neck, mostly).
- **Follow (camera)** — advances when a fingertip sits on the target fret/string for a
  moment (works with an unplugged electric!).
- **Metronome** — the target advances on every beat at a chosen BPM, with a click.
  Hits are counted when the mic hears the target during its beat.
- Sequences: ascending, descending, up & down, groups of 3, groups of 4, random.
- Stats: notes hit, misses (wrong notes heard), streak, notes/minute.

## How it works (architecture)

```
index.html
├─ js/theory.js     notes, intervals, scales/arpeggios, fretboard note map, sequences
├─ js/fretboard.js  SVG fretboard diagram renderer
├─ js/geometry.js   homography, fret math, point ↔ (fret,string)
├─ js/camera.js     webcam + MediaPipe hand landmarker + finger-touch calibration + AR overlay
├─ js/pitch.js      mic input + autocorrelation pitch detection
├─ js/practice.js   practice session state machine (follow / metronome / stats / position check)
├─ js/curriculum.js learning roadmap: levels, lessons (en + vi), two-part tests, progress
├─ js/i18n.js       English / Vietnamese UI strings
├─ js/synth.js      metronome click + plucked-note preview
└─ js/app.js        UI wiring, audio+camera fusion
server.js           zero-dependency static server (camera/mic need localhost or https)
```

Everything runs locally in the browser. Video and audio never leave the machine;
the only network requests are the MediaPipe library + model files from a CDN.

## Known limitations / honest notes

- **Calibration is static.** If the guitar moves a lot, the overlay drifts; recalibrate
  (a few seconds with finger touch). Automatic neck tracking is on the roadmap.
- Camera angle matters: a view from above/in front of the neck where frets are visible
  works best. Fingertips hidden behind the neck can't be tracked.
- Pitch detection is monophonic — great for single-note lines, not chords.
- Use a direct input (audio interface); a mic next to an amp also works but picks up noise.
- Browser audio input adds ~20–40 ms latency (no ASIO) — fine for scoring, not for
  monitoring; listen through your amp or the interface's direct monitoring.

## Why the browser and not Python (decision)

MediaPipe runs the same in both; the hard problems (neck moving, occlusion) don't depend on
the platform, and the browser gives zero-install sharing and UI for free. Python becomes
worth it only when we train custom vision models (e.g. a fretboard detector) — and even then
the model can be exported to ONNX and run in the browser.

## Roadmap (v2+ ideas)

1. **Automatic neck tracking** — detect fret wires / the neck edges (Hough transform
   or a small trained model) so the overlay follows the guitar without recalibrating.
2. **Technique detection** — bends (pitch rising while fret stays), slides, hammer-ons
   (onset without pick attack), vibrato width/speed.
3. **Lick library** — classic licks as note sequences with timing; play-along scoring.
4. **Backing tracks** — generate a drum + bass + chord loop in a key so you can
   improvise with the scale lit up on the neck.
5. **Finger assignment coaching** — use the 21 hand landmarks to check
   "one finger per fret" and warn about collapsed fingers / thumb position.
6. **Progress tracking** — per-pattern speed & accuracy history, spaced repetition of
   weak positions.
7. Alternative tunings (drop D, D standard, 7-string).
