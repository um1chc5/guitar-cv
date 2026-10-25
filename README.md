# Fretboard Coach

Learn guitar solo vocabulary (scales, arpeggios, box positions) with your **guitar signal**
(audio interface). The fretboard shows the shape and the next note; a pitch detector checks what you played.

Docs: [docs/](docs/README.md) — product, lessons, features, [tech stack](docs/tech-stack.md), architecture, camera, roadmap.

## Run

```bash
node server.js
```

Open http://localhost:5173 (audio input only works on `localhost` or HTTPS). No `npm install` needed.

## Quick start

1. On start, the app asks for your **guitar input** (audio interface + channel, usually Input 1),
   then opens your next lesson right away. Play a note: the *Heard* card should show it.
2. Each lesson: **🔊 Listen** first (the app plays the shape and lights each note), then the test:
   - **Part 1 · Free tempo**: no metronome; the next note lights up when you play the current one.
     Play it 2 times with enough notes right → *Part 1 passed!*
   - **Part 2 · In time**: the same with the metronome at the lesson tempo, 2 times (a slightly lower
     accuracy bar, since timing is harder). Passing it completes the lesson; stars come from this part.
   Look-only lessons (e.g. *Meet the box*) just have Listen and *Got it*.
   The path in the ☰ drawer shows done ✓, half-done (part 1 ✓) and up-next lessons (6 levels, 25 lessons).
3. **Free practice** (☰ drawer): pick any root, scale/arpeggio and box, choose a mode
   (Explore / Free tempo / Metronome), then **L** to listen or **Space** to play along.

Top bar: **VI / EN** switches Vietnamese ↔ English, **🌙 / ☀️** switches dark ↔ light mode
(the default follows your system).

Keys: `L` listen · `Space` play/stop · `F` hide/show the fretboard · `→` skip note.

## Tips

- Raise the noise gate (☰ → Audio) if the "Heard" card flickers when you're not playing.
- Wrong pitch but right note name? Turn on *Accept any octave* in ☰ → Practice.

## Camera features (hidden)

Webcam features (fret overlay on the live video, finger-touch calibration, Finger mode, position check)
are built but switched off. To turn them on, set `CAMERA_FEATURES = true` at the top of `js/app.js`.
