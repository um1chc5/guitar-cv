# Product

## The idea

Learning to solo is mostly learning **shapes**: where the notes of a scale or chord sit on the
neck, in which box, and how the boxes connect. Charts and tabs show the shape, but they can't tell
you whether you actually played it right.

Fretboard Coach does three things for each shape:

1. **Shows it** on a fretboard diagram (roots in red, the note to play in orange).
2. **Plays it** for you — you hear and see each note light up in order.
3. **Listens to you** play it back through the guitar signal and scores every note, first at your
   own pace, then in time with a metronome.

## Who it's for

- Beginners / intermediates who know some chords and want to start soloing.
- Players who know "the pentatonic box" but want to connect positions, learn modes, and see the
  chord tones (arpeggios) inside the scale.

## Core design decision: audio judges the notes

An electric guitar into an audio interface gives a clean signal the browser can read directly.
Audio reliably answers **which note** and **when** — so audio is the judge.

Audio cannot answer **where** on the neck a note was played (the same E4 exists in up to 5 places).
The app handles that in two ways:

- The lesson limits the notes to one **box** (a fret window), so in practice there is one right place.
- A webcam can check the position. That part is built but switched off for now — see
  [camera.md](camera.md).

## Two ways to use it

- **Learn** — a guided path of 6 levels / 25 lessons (see [lessons.md](lessons.md)). After the
  input setup the app opens your next lesson straight away.
- **Free practice** — on demand: any root, scale, arpeggio, box or fret range, in any mode.

## Principles

- **Zero friction:** open a URL, allow audio, play. Nothing to install.
- **Private:** audio is analysed in the browser and never leaves the computer.
- **Encouraging:** instant feedback, stars, streaks, and "practice only" instead of "fail" when
  you slow the tempo down.
- **Bilingual:** English and Vietnamese, including all lesson text.
