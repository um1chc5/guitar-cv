# Tech stack

Short version: **plain HTML, CSS and JavaScript running in the browser, no framework, no build
step, no npm packages.** About 3,600 lines in total.

## Languages and runtime

| | Used for |
|---|---|
| **HTML5** | one page, `index.html` |
| **CSS3** | `css/style.css` — custom properties (design tokens), grid / flexbox, light + dark themes via `prefers-color-scheme` and `[data-theme]` |
| **JavaScript (ES2022 modules)** | `js/*.js`, loaded with `<script type="module">`; modern syntax (`??=`, optional chaining, class fields, top-level `await`) |
| **Node.js** (≥ 18) | only `server.js`, a 29-line static file server for local development (`http`, `fs`, `path` — no packages) |

Browsers: current Chrome, Edge or Firefox. Safari should work but hasn't been tested.

## Browser APIs

| API | Where | Why |
|---|---|---|
| **Web Audio** (`AudioContext`, `AnalyserNode`, `ChannelSplitterNode`) | `pitch.js` | read the guitar signal, pick one interface channel, get samples for pitch detection |
| **Web Audio** (`OscillatorNode`, `AudioBuffer`, `GainNode`) | `synth.js` | metronome click, plucked-note synth |
| **Media Capture** (`getUserMedia`, `enumerateDevices`) | `pitch.js`, `camera.js`, `app.js` | audio-interface input (and webcam, when enabled); echo cancellation / noise suppression / auto gain switched off so the DI signal stays clean |
| **SVG** | `fretboard.js` | the fretboard diagram |
| **Canvas 2D** | `camera.js` | video + AR overlay (camera features) |
| **localStorage** | `app.js`, `curriculum.js`, `i18n.js`, `camera.js` | progress, preferences, theme, language, calibration |
| `ResizeObserver`, `matchMedia`, `requestAnimationFrame` | `app.js` | layout sync, system theme, batched redraws |

Audio and camera APIs need a secure origin: `http://localhost` locally, HTTPS on GitHub Pages.

## External libraries and services

| What | Version | Loaded from | When |
|---|---|---|---|
| **Nunito** font | — | Google Fonts | always (falls back to the system font offline) |
| **MediaPipe Tasks Vision** — Hand Landmarker | 0.10.14 | jsDelivr CDN (JS + WASM), model from Google Cloud Storage | **only when the camera features are on and the camera is started** (off by default) |

That's all: no React / Vue, no bundler, no CSS framework, no audio library, no analytics.

Earlier experiment, removed: **js-aruco2** (printed ArUco markers to track the neck) — dropped
because it needed stickers on the guitar.

## Algorithms (written in this repo)

| Algorithm | File | Notes |
|---|---|---|
| **YIN** pitch detection | `pitch.js` | cumulative mean normalised difference, threshold 0.15, parabolic interpolation; range 70–1400 Hz; runs on a 20 ms timer so it keeps working in background tabs |
| **Karplus-Strong** plucked string | `synth.js` | noise burst through a decaying averaging delay line — a guitar-like note with no samples |
| Equal-temperament fret maths | `geometry.js` | fret *n* sits at `L · (1 − 2^(−n/12))` from the nut |
| **Homography** (4-point, Gaussian elimination) | `geometry.js` | maps neck coordinates ↔ video pixels for the camera overlay |
| Scale / box / sequence generation | `theory.js` | intervals → notes on each string; box presets; groups-of-N sequences |

## Hosting and tools

- **GitHub Pages** serves the repo root as a static site (`.nojekyll`, no build). A push to `main`
  redeploys in about a minute.
- **Git + GitHub CLI (`gh`)** for the repo.
- Local run: `node server.js` → http://localhost:5173 (no `npm install`).
- No test framework or linter is set up yet; features were checked by driving the app in a browser.
