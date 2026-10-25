# Camera features (built, switched off)

The webcam features are complete but hidden, because the overlay doesn't follow the guitar when
it moves (see [roadmap.md](roadmap.md)). To turn them on, set `CAMERA_FEATURES = true` at the top
of `js/app.js`. Camera UI strings are English only.

## What they do

- **Hand tracking** with MediaPipe Hand Landmarker (in the browser, GPU with CPU fallback,
  2 hands, 21 landmarks each).
- **AR overlay:** the fret grid, the scale notes, the box outline and an arrow to the next note are
  drawn on the live video of your neck.
- **Fingertip → string / fret:** each fingertip is mapped back onto the neck ("index → G7"),
  shown on the video and the diagram.
- **Finger mode:** advances when a fingertip rests on the target for 350 ms (works unplugged).
- **Position check** in the other modes (below).

## Calibration

You mark 4 points: low E and high e at the **nut**, low E and high e on the **12th fret**.

- **Finger touch:** hold the index fingertip (landmark 8) still on each point for about 0.9 s; a
  ring fills and a click confirms. The point is the average position over the hold. A new point
  must be away from those already captured, so a finger left in place can't count twice.
- **Click** the points on the video instead (also the fallback when hand tracking can't load).
- Drag the orange dots afterwards to fine-tune. The calibration is saved.

A homography maps neck space (X along the neck: nut = 0, 12th fret = 1; Y across the strings,
which spread slightly towards the body) to video pixels. Frets follow the equal-temperament rule.

## Audio + camera fusion

Audio says *which* note; the camera picks *where*, among the spots with that pitch, by choosing
the one nearest a fingertip. Same-pitch spots on neighbouring strings are about 5 frets apart, so
the camera only has to be right to within about ±2 frets.

| Situation | Result |
|---|---|
| Right pitch, fingertip near the target | ✅ hit |
| Right pitch, fingertip clearly at another spot with that pitch | 🟠 "right note, wrong place" (a miss) |
| Right pitch, no fingertip visible / not calibrated | ✅ hit (trust audio) |
| Wrong pitch | ❌ miss |

## Limitations

- **Static calibration:** move the guitar and the overlay drifts; recalibrate.
- Camera angle matters: the frets must be visible; fingertips behind the neck can't be tracked.
- A strongly curled finger's landmark can sit a few px off the contact point.
- Downloads several MB (MediaPipe WASM + hand model) the first time the camera starts.

## History

- A version with printed **ArUco markers** (js-aruco2) on the headstock / body tracked the neck as
  the guitar moved (1–11 px error in tests). Removed: nobody wants stickers on their guitar.
- Next idea: marker-free neck tracking — see [roadmap.md](roadmap.md).
