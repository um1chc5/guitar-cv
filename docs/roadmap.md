# Limitations, decisions, roadmap

## Known limitations

- **Monophonic pitch detection** — single-note lines only, not chords or double stops.
- **Needs a clean signal** — an audio interface (DI) works best; a mic next to an amp picks up
  noise and room sound. Raise the noise gate if *Heard* flickers.
- **Timing in Metronome mode** is judged per beat window: a note played much too early or late
  counts for the wrong beat.
- **Progress is per browser** — no accounts or sync; clearing site data resets it.
- No automated tests yet.

## Decisions

### Browser, not Python / a desktop app
The browser reads an audio interface directly, MediaPipe runs the same in both, and the browser
gives zero-install sharing (one URL) and the UI for free. Python only becomes worth it for training
custom vision models — and those can be exported to ONNX and run in the browser too.

### Audio judges, camera is optional
Audio is reliable for *what* and *when*; the camera only helps with *where*, and only roughly. So
the app works fully without a camera, and the camera features are switched off until the neck can
be tracked automatically (see [camera.md](camera.md)).

### Two-part tests
Players first learn the notes at their own pace, then play them in time. Part 2 uses a lower
accuracy bar because timing is harder. This replaced separate "in time" lessons.

### Hearing your guitar
The app doesn't play the guitar back. Browsers can't use ASIO on Windows, so the input-to-output
delay is roughly 20–50 ms (a DAW is about 5–10 ms) — fine for scoring, noticeable for
monitoring. Use the interface's **direct monitoring**, an amp, or a DAW with an amp sim running
alongside (if the interface's driver allows two apps at once).

## Roadmap ideas

1. **Automatic neck tracking** (no markers) — detect fret wires / neck edges (Hough transform or
   a small trained model), so the camera overlay follows the guitar; then turn the camera
   features back on.
2. **Technique detection** — bends (pitch rising while the fret stays), slides, hammer-ons
   (onset without a pick attack), vibrato width / speed.
3. **Lick library** — classic licks as note sequences with rhythm; play-along scoring.
4. **Backing tracks** — a drum + bass + chord loop in the lesson key, with "land on a chord tone"
   scoring.
5. **Finger coaching** — use the hand landmarks to check "one finger per fret" and thumb position.
6. **Progress history** — per-pattern speed and accuracy over time; repeat weak boxes.
7. **Tuner check** on first run, so a wrong note is never just an out-of-tune string.
8. Alternative tunings (drop D, D standard, 7-string).
9. Optional monitor switch with a simple amp tone, showing the measured latency.
