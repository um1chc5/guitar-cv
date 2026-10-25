// Learning roadmap: levels of lessons, each a practice preset plus a two-part test.
//
// settings: root (0-11, C=0), pattern, position ('all' | 1-based box | {min, max}), sequence
// test:     null = look-and-listen lesson (marked done by hand). Otherwise:
//           part 1 "free tempo" (ear mode): TEST_RUNS runs at >= accuracy
//           part 2 "in time" (metronome at bpm): TEST_RUNS runs at >= timed (looser: timing is harder)
// Text fields are { en, vi }.

const A = 9, C = 0, D = 2, E = 4, G = 7;
export const TEST_RUNS = 2;
const test = (bpm, accuracy = 0.85, timed = 0.75) => ({ bpm, accuracy, timed });

export const LEVELS = [
  {
    title: { en: 'First box', vi: 'Thế bấm đầu tiên' },
    goal: {
      en: 'Learn the most used soloing shape in rock & blues: A minor pentatonic, position 1.',
      vi: 'Học thế bấm solo phổ biến nhất trong rock & blues: ngũ cung thứ La (A), thế 1.',
    },
    lessons: [
      {
        id: 'l1-see',
        title: { en: 'Meet the box', vi: 'Làm quen thế bấm' },
        text: {
          en: 'This is A minor pentatonic in position 1 (frets 5–8). Red dots are the root A. Two notes per string: index finger on fret 5, ring or pinky on frets 7–8.',
          vi: 'Đây là gam ngũ cung thứ La (A) ở thế 1 (phím 5–8). Chấm đỏ là nốt chủ A. Mỗi dây có 2 nốt: ngón trỏ ở phím 5, ngón áp út hoặc ngón út ở phím 7–8.',
        },
        tips: {
          en: ['Press Listen to hear the shape, or click the dots.', 'Find all three A roots in the box.', 'Keep the index finger parked on fret 5.'],
          vi: ['Bấm Nghe để nghe cả thế bấm, hoặc bấm vào từng chấm.', 'Tìm cả ba nốt chủ A trong thế bấm.', 'Giữ ngón trỏ cố định ở phím 5.'],
        },
        settings: { root: A, pattern: 'Minor pentatonic', position: 1, sequence: 'Ascending' },
        test: null,
      },
      {
        id: 'l1-up',
        title: { en: 'Climb the box', vi: 'Leo lên thế bấm' },
        text: {
          en: 'Play the box slowly from the low A to the top. In part 1 the next note lights up once the app hears the current one; in part 2 you play along with a slow click.',
          vi: 'Đánh chậm thế bấm từ nốt A trầm lên tới nốt cao nhất. Ở phần 1, nốt tiếp theo sáng lên khi app nghe đúng nốt hiện tại; ở phần 2 bạn đánh theo máy đếm nhịp chậm.',
        },
        tips: {
          en: ['Accuracy first, speed later.', 'Mute the strings you are not playing with your palm.'],
          vi: ['Đánh đúng trước, nhanh sau.', 'Dùng lòng bàn tay chặn các dây không đánh.'],
        },
        settings: { root: A, pattern: 'Minor pentatonic', position: 1, sequence: 'Ascending' },
        test: test(60),
      },
      {
        id: 'l1-updown',
        title: { en: 'Up and back down', vi: 'Lên rồi xuống' },
        text: {
          en: 'Now go up and come back down without stopping at the top.',
          vi: 'Giờ đánh lên rồi quay xuống, không dừng lại ở nốt cao nhất.',
        },
        tips: {
          en: ['Alternate picking: down, up, down, up.', 'If part 2 falls apart, slow down in ☰ → Tempo and build back up.'],
          vi: ['Đánh luân phiên: xuống, lên, xuống, lên.', 'Nếu phần 2 bị rối, giảm tốc độ ở ☰ → Tempo rồi tăng dần lại.'],
        },
        settings: { root: A, pattern: 'Minor pentatonic', position: 1, sequence: 'Up & down' },
        test: test(70, 0.9),
      },
    ],
  },
  {
    title: { en: 'The whole neck', vi: 'Toàn bộ cần đàn' },
    goal: {
      en: 'Learn the other four pentatonic boxes and connect them, so you are never stuck in one place.',
      vi: 'Học bốn thế ngũ cung còn lại và nối chúng với nhau, để không bị kẹt ở một chỗ.',
    },
    lessons: [
      {
        id: 'l2-map',
        title: { en: 'The five boxes', vi: 'Năm thế bấm' },
        text: {
          en: 'The same 5 notes repeat all over the neck. Each box overlaps the next one. Look at how position 1 connects to position 2.',
          vi: 'Cùng 5 nốt đó lặp lại khắp cần đàn. Mỗi thế chồng lên thế kế tiếp. Hãy xem thế 1 nối với thế 2 như thế nào.',
        },
        tips: {
          en: ['Switch the Position menu in Free practice to see each box.'],
          vi: ['Đổi mục Thế bấm trong Luyện tự do để xem từng thế.'],
        },
        settings: { root: A, pattern: 'Minor pentatonic', position: 'all', sequence: 'Ascending' },
        test: null,
      },
      {
        id: 'l2-pos2',
        title: { en: 'Box 2', vi: 'Thế 2' },
        text: {
          en: 'Position 2 starts on the C on the low E string (fret 8).',
          vi: 'Thế 2 bắt đầu từ nốt C trên dây E trầm (phím 8).',
        },
        tips: {
          en: ['Stay inside this box — don’t slide back to box 1 for the same notes.'],
          vi: ['Đánh trong thế này — đừng trượt về thế 1 để lấy cùng nốt.'],
        },
        settings: { root: A, pattern: 'Minor pentatonic', position: 2, sequence: 'Up & down' },
        test: test(70),
      },
      {
        id: 'l2-connect',
        title: { en: 'Connect box 1 → 2', vi: 'Nối thế 1 → 2' },
        text: {
          en: 'Play across both boxes (frets 5–10). Slide between them on the G string.',
          vi: 'Đánh qua cả hai thế (phím 5–10). Trượt từ thế này sang thế kia trên dây G.',
        },
        tips: {
          en: ['Shift your hand on the way up, not in the middle of a string.'],
          vi: ['Dời tay khi chuyển dây, không dời giữa chừng một dây.'],
        },
        settings: { root: A, pattern: 'Minor pentatonic', position: { min: 5, max: 10 }, sequence: 'Up & down' },
        test: test(65),
      },
      {
        id: 'l2-pos3',
        title: { en: 'Box 3', vi: 'Thế 3' },
        text: { en: 'Position 3 starts on D (fret 10 on the low E).', vi: 'Thế 3 bắt đầu từ nốt D (phím 10 trên dây E trầm).' },
        tips: { en: [], vi: [] },
        settings: { root: A, pattern: 'Minor pentatonic', position: 3, sequence: 'Up & down' },
        test: test(70),
      },
      {
        id: 'l2-pos4',
        title: { en: 'Box 4', vi: 'Thế 4' },
        text: {
          en: 'Position 4 starts on E — here using the open strings (frets 0–3). The same shape repeats an octave higher at frets 12–15.',
          vi: 'Thế 4 bắt đầu từ nốt E — ở đây dùng dây buông (phím 0–3). Cùng hình đó lặp lại cao hơn một quãng tám ở phím 12–15.',
        },
        tips: { en: [], vi: [] },
        settings: { root: A, pattern: 'Minor pentatonic', position: 4, sequence: 'Up & down' },
        test: test(70),
      },
      {
        id: 'l2-pos5',
        title: { en: 'Box 5', vi: 'Thế 5' },
        text: { en: 'Position 5 starts on G (fret 3) and leads back into box 1.', vi: 'Thế 5 bắt đầu từ nốt G (phím 3) và dẫn về lại thế 1.' },
        tips: { en: [], vi: [] },
        settings: { root: A, pattern: 'Minor pentatonic', position: 5, sequence: 'Up & down' },
        test: test(70),
      },
    ],
  },
  {
    title: { en: 'Blues & major sound', vi: 'Blues & âm trưởng' },
    goal: {
      en: 'Add the blue note, and discover that the same shapes give you a happy major sound.',
      vi: 'Thêm nốt blue, và khám phá rằng cùng thế bấm đó cho bạn âm trưởng vui tươi.',
    },
    lessons: [
      {
        id: 'l3-blues',
        title: { en: 'The blue note', vi: 'Nốt blue' },
        text: {
          en: 'The blues scale is the minor pentatonic plus one note: the ♭5 (E♭). Use it as a passing note, not a resting note.',
          vi: 'Gam blues là ngũ cung thứ cộng thêm một nốt: ♭5 (E♭). Dùng nó làm nốt lướt qua, không dừng lại trên nó.',
        },
        tips: {
          en: ['Hear how tense the ♭5 sounds, then resolve to the 4 or the 5.'],
          vi: ['Nghe ♭5 căng thế nào, rồi giải quyết về nốt 4 hoặc 5.'],
        },
        settings: { root: A, pattern: 'Blues', position: 1, sequence: 'Up & down' },
        test: test(70),
      },
      {
        id: 'l3-major',
        title: { en: 'Same shape, major sound', vi: 'Cùng thế, âm trưởng' },
        text: {
          en: 'C major pentatonic uses exactly the same notes as A minor pentatonic. The only change is which note feels like "home" (now C).',
          vi: 'Ngũ cung trưởng Đô (C) dùng đúng các nốt của ngũ cung thứ La (A). Chỉ khác ở nốt nào nghe như "nhà" (giờ là C).',
        },
        tips: {
          en: ['Look at the red roots: they moved, the dots did not.'],
          vi: ['Nhìn các nốt chủ màu đỏ: chúng đổi chỗ, còn các chấm thì không.'],
        },
        settings: { root: C, pattern: 'Major pentatonic', position: { min: 4, max: 8 }, sequence: 'Up & down' },
        test: test(70),
      },
      {
        id: 'l3-threes',
        title: { en: 'Groups of 3', vi: 'Nhóm 3 nốt' },
        text: {
          en: 'Sequences turn a boring scale into licks. Play 1-2-3, 2-3-4, 3-4-5 …',
          vi: 'Chuỗi nốt biến gam nhàm chán thành lick. Đánh 1-2-3, 2-3-4, 3-4-5 …',
        },
        tips: {
          en: ['This is a classic warm-up used by almost every lead player.'],
          vi: ['Đây là bài khởi động kinh điển mà hầu hết guitarist lead đều dùng.'],
        },
        settings: { root: A, pattern: 'Minor pentatonic', position: 1, sequence: 'Groups of 3' },
        test: test(70, 0.85, 0.75),
      },
    ],
  },
  {
    title: { en: 'Chord tones (arpeggios)', vi: 'Nốt hợp âm (hợp âm rải)' },
    goal: {
      en: 'Know where the chord notes are inside the scale — that is what makes a solo sound like it fits the song.',
      vi: 'Biết nốt của hợp âm nằm ở đâu trong gam — đó là điều làm câu solo nghe hợp với bài hát.',
    },
    lessons: [
      {
        id: 'l4-minor',
        title: { en: 'A minor triad', vi: 'Hợp âm ba La thứ' },
        text: {
          en: 'A minor = A, C, E (R, ♭3, 5). Landing on these notes at the end of a phrase sounds "right" over an Am chord.',
          vi: 'La thứ = A, C, E (R, ♭3, 5). Kết câu bằng các nốt này nghe "đúng" khi đệm hợp âm Am.',
        },
        tips: {
          en: ['Compare with the pentatonic box: all three notes are already inside it.'],
          vi: ['So với thế ngũ cung: cả ba nốt đều đã nằm trong đó.'],
        },
        settings: { root: A, pattern: 'Minor triad', position: 1, sequence: 'Up & down' },
        test: test(70),
      },
      {
        id: 'l4-m7',
        title: { en: 'A minor 7', vi: 'La thứ 7' },
        text: {
          en: 'Add the ♭7 (G). Am7 is literally 4 of the 5 notes of the pentatonic.',
          vi: 'Thêm nốt ♭7 (G). Am7 chính là 4 trong 5 nốt của ngũ cung.',
        },
        tips: { en: [], vi: [] },
        settings: { root: A, pattern: 'Minor 7', position: 1, sequence: 'Up & down' },
        test: test(70),
      },
      {
        id: 'l4-dom7',
        title: { en: 'A7 — the blues chord', vi: 'A7 — hợp âm blues' },
        text: {
          en: 'A dominant 7 = A, C#, E, G. The C# (major 3rd) against the minor pentatonic’s C is the sound of the blues.',
          vi: 'La 7 át = A, C#, E, G. Nốt C# (quãng 3 trưởng) đối lại nốt C của ngũ cung thứ chính là âm thanh blues.',
        },
        tips: {
          en: ['Over an A7 chord, bend the C slightly up towards C#.'],
          vi: ['Trên hợp âm A7, bend nhẹ nốt C lên gần C#.'],
        },
        settings: { root: A, pattern: 'Dominant 7', position: 1, sequence: 'Up & down' },
        test: test(70),
      },
      {
        id: 'l4-maj',
        title: { en: 'C major 7', vi: 'Đô trưởng 7' },
        text: { en: 'C major 7 = C, E, G, B. A dreamy, jazzy colour.', vi: 'Đô trưởng 7 = C, E, G, B. Màu âm mơ màng, hơi jazz.' },
        tips: { en: [], vi: [] },
        settings: { root: C, pattern: 'Major 7', position: { min: 7, max: 11 }, sequence: 'Up & down' },
        test: test(70),
      },
    ],
  },
  {
    title: { en: 'Full scales & modes', vi: 'Gam đầy đủ & điệu thức' },
    goal: {
      en: 'Go from 5 notes to 7. Learn the major scale, natural minor, and the two most used rock/blues modes.',
      vi: 'Từ 5 nốt lên 7 nốt. Học gam trưởng, gam thứ tự nhiên và hai điệu thức hay dùng nhất trong rock/blues.',
    },
    lessons: [
      {
        id: 'l5-major',
        title: { en: 'G major scale', vi: 'Gam Sol trưởng' },
        text: {
          en: 'The major scale (do-re-mi) is the reference every other scale is compared to.',
          vi: 'Gam trưởng (đô-rê-mi) là chuẩn để so sánh với mọi gam khác.',
        },
        tips: {
          en: ['Three notes on some strings now: use one finger per fret.'],
          vi: ['Giờ có dây có 3 nốt: mỗi ngón phụ trách một phím.'],
        },
        settings: { root: G, pattern: 'Major (Ionian)', position: 1, sequence: 'Up & down' },
        test: test(65),
      },
      {
        id: 'l5-minor',
        title: { en: 'A natural minor', vi: 'La thứ tự nhiên' },
        text: {
          en: 'Minor pentatonic + 2 (B) and ♭6 (F). Sad, classic rock/metal sound.',
          vi: 'Ngũ cung thứ + nốt 2 (B) và ♭6 (F). Âm buồn, kiểu rock/metal kinh điển.',
        },
        tips: { en: [], vi: [] },
        settings: { root: A, pattern: 'Natural minor (Aeolian)', position: 1, sequence: 'Up & down' },
        test: test(65),
      },
      {
        id: 'l5-dorian',
        title: { en: 'A dorian', vi: 'La Dorian' },
        text: {
          en: 'Natural minor with a major 6 (F#). Funky, Santana / Pink Floyd minor.',
          vi: 'Gam thứ tự nhiên với nốt 6 trưởng (F#). Âm thứ kiểu funk, Santana / Pink Floyd.',
        },
        tips: {
          en: ['Compare it to natural minor: only one note changes.'],
          vi: ['So với gam thứ tự nhiên: chỉ khác đúng một nốt.'],
        },
        settings: { root: A, pattern: 'Dorian', position: 1, sequence: 'Up & down' },
        test: test(65),
      },
      {
        id: 'l5-mixo',
        title: { en: 'A mixolydian', vi: 'La Mixolydian' },
        text: {
          en: 'Major scale with a ♭7. The rock & roll / blues-rock major sound.',
          vi: 'Gam trưởng với nốt ♭7. Âm trưởng kiểu rock & roll / blues-rock.',
        },
        tips: { en: [], vi: [] },
        settings: { root: A, pattern: 'Mixolydian', position: 1, sequence: 'Up & down' },
        test: test(65),
      },
      {
        id: 'l5-harm',
        title: { en: 'E harmonic minor', vi: 'Mi thứ hòa âm' },
        text: {
          en: 'Natural minor with a major 7. Neo-classical and metal shred sound.',
          vi: 'Gam thứ tự nhiên với nốt 7 trưởng. Âm neo-classical và shred metal.',
        },
        tips: { en: [], vi: [] },
        settings: { root: E, pattern: 'Harmonic minor', position: 1, sequence: 'Up & down' },
        test: test(65),
      },
    ],
  },
  {
    title: { en: 'Speed & freedom', vi: 'Tốc độ & tự do' },
    goal: {
      en: 'Build speed, and learn to find any note of the scale without running up from the root.',
      vi: 'Tăng tốc độ, và học cách tìm bất kỳ nốt nào trong gam mà không cần chạy từ nốt chủ.',
    },
    lessons: [
      {
        id: 'l6-fours',
        title: { en: 'Groups of 4', vi: 'Nhóm 4 nốt' },
        text: {
          en: 'A classic speed builder: 1-2-3-4, 2-3-4-5 … Part 2 is at 100 BPM. Push the tempo a little every day.',
          vi: 'Bài tăng tốc kinh điển: 1-2-3-4, 2-3-4-5 … Phần 2 ở 100 BPM. Mỗi ngày tăng tốc độ một chút.',
        },
        tips: {
          en: ['Small movements, pick close to the strings.'],
          vi: ['Cử động nhỏ, gảy sát dây.'],
        },
        settings: { root: A, pattern: 'Minor pentatonic', position: 1, sequence: 'Groups of 4' },
        test: test(100, 0.85, 0.75),
      },
      {
        id: 'l6-random',
        title: { en: 'Random notes', vi: 'Nốt ngẫu nhiên' },
        text: {
          en: 'Notes come in random order. This trains you to see the shape instead of memorising a run.',
          vi: 'Các nốt đến theo thứ tự ngẫu nhiên. Bài này luyện bạn nhìn thấy thế bấm thay vì học thuộc một đường chạy.',
        },
        tips: { en: [], vi: [] },
        settings: { root: A, pattern: 'Minor pentatonic', position: 1, sequence: 'Random' },
        test: test(60, 0.85, 0.7),
      },
      {
        id: 'l6-e',
        title: { en: 'Another key: E minor', vi: 'Giọng khác: Mi thứ' },
        text: {
          en: 'Move the box: E minor pentatonic in open position. It is the box-1 shape you know from fret 5, slid down so the nut plays the index-finger notes.',
          vi: 'Dời thế bấm: ngũ cung thứ Mi (E) ở thế dây buông. Đó là hình thế 1 bạn đã biết ở phím 5, trượt xuống để dây buông thay cho ngón trỏ.',
        },
        tips: {
          en: ['Every shape you learned moves to any key by sliding it.'],
          vi: ['Mọi thế bấm bạn đã học đều chuyển sang giọng khác bằng cách trượt nó.'],
        },
        settings: { root: E, pattern: 'Minor pentatonic', position: 1, sequence: 'Up & down' },
        test: test(80),
      },
      {
        id: 'l6-d',
        title: { en: 'Another key: D dorian', vi: 'Giọng khác: Rê Dorian' },
        text: {
          en: 'D dorian across frets 9–13 — a common jam key.',
          vi: 'Rê Dorian ở phím 9–13 — một giọng hay dùng khi jam.',
        },
        tips: { en: [], vi: [] },
        settings: { root: D, pattern: 'Dorian', position: { min: 9, max: 13 }, sequence: 'Up & down' },
        test: test(75),
      },
    ],
  },
];

export const ALL_LESSONS = LEVELS.flatMap((lvl, li) => lvl.lessons.map((l) => ({ ...l, level: li })));

// ---- progress ------------------------------------------------------------------------
// progress[id] = { part1?: true, stars?: 1-3, at } — the lesson is done once it has stars.

const KEY = 'fretcoach.progress';

export function loadProgress() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function saveProgress(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}

export const isDone = (p) => !!p?.stars;

// Stars come from the in-time part: 1 = passed, 2 = >= 90 %, 3 = >= 98 %.
export function starsFor(accuracy) {
  if (accuracy >= 0.98) return 3;
  if (accuracy >= 0.9) return 2;
  return 1;
}

// First lesson not yet done (or the last one when everything is done).
export function nextLessonId(progress) {
  return (ALL_LESSONS.find((l) => !isDone(progress[l.id])) || ALL_LESSONS[ALL_LESSONS.length - 1]).id;
}
