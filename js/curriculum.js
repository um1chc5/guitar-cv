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
    title: { en: 'First shape: the E shape', vi: 'Hình đầu tiên: hình E' },
    goal: {
      en: 'Learn the most used soloing shape in rock & blues: A minor pentatonic in the E shape.',
      vi: 'Học hình solo phổ biến nhất trong rock & blues: ngũ cung thứ La (A) ở hình E.',
    },
    lessons: [
      {
        id: 'l1-see',
        title: { en: 'Meet the E shape', vi: 'Làm quen hình E' },
        text: {
          en: 'This is A minor pentatonic in the E shape (frets 5–8). Red dots are the root A. Two notes per string: index finger on fret 5, ring or pinky on frets 7–8.',
          vi: 'Đây là gam ngũ cung thứ La (A) ở hình E (phím 5–8). Chấm đỏ là nốt chủ A. Mỗi dây có 2 nốt: ngón trỏ ở phím 5, ngón áp út hoặc ngón út ở phím 7–8.',
        },
        tips: {
          en: ['Start with 📖 Read: where the name "E shape" comes from.', 'Press Listen to hear the shape, or click the dots.', 'Keep the index finger parked on fret 5.'],
          vi: ['Bắt đầu với 📖 Đọc: vì sao gọi là "hình E".', 'Bấm Nghe để nghe cả hình, hoặc bấm vào từng chấm.', 'Giữ ngón trỏ cố định ở phím 5.'],
        },
        read: [
          {
            title: { en: 'A chord you already know', vi: 'Một hợp âm bạn đã biết' },
            text: {
              en: 'Open E minor. Remember its shape: the lowest note, on the 6th string, is the root (R). The other notes are the ♭3 and the 5 — the three notes of every minor chord.',
              vi: 'Hợp âm Mi thứ (Em) dây buông. Hãy nhớ hình của nó: nốt trầm nhất, trên dây 6, là nốt chủ (R). Các nốt còn lại là ♭3 và 5 — ba nốt của mọi hợp âm thứ.',
            },
            view: { window: [0, 3], chord: [[0, 0, 'R'], [1, 2, '5'], [2, 2, 'R'], [3, 0, '♭3'], [4, 0, '5'], [5, 0, 'R']] },
          },
          {
            title: { en: 'Slide the shape up: the E shape', vi: 'Trượt hình lên: hình E' },
            text: {
              en: 'Move the same shape up so your index finger bars fret 5. Now the root on the 6th string is A, so the chord is A minor. Because it is the E-minor shape moved up, it is called the E shape.',
              vi: 'Dời cùng hình đó lên để ngón trỏ chặn phím 5. Giờ nốt chủ trên dây 6 là A, nên hợp âm là La thứ (Am). Vì đây là hình Em được dời lên, nên gọi là hình E.',
            },
            view: { window: [4, 8], chord: [[0, 5, 'R'], [1, 7, '5'], [2, 7, 'R'], [3, 5, '♭3'], [4, 5, '5'], [5, 5, 'R']] },
          },
          {
            title: { en: 'The scale lives around the chord', vi: 'Gam nằm quanh hợp âm' },
            text: {
              en: 'A minor pentatonic in the E shape = the chord notes (R, ♭3, 5, bright) plus two more notes (4 and ♭7, faded). Same notes as C major pentatonic — only "home" differs.',
              vi: 'Ngũ cung thứ La ở hình E = các nốt của hợp âm (R, ♭3, 5, sáng) cộng thêm hai nốt (4 và ♭7, mờ). Cùng các nốt với ngũ cung trưởng Đô — chỉ khác nốt "nhà".',
            },
            view: { root: 9, pattern: 'Minor pentatonic', position: 1, bright: ['R', '♭3', '5'] },
          },
          {
            title: { en: 'C-A-G-E-D: five shapes, one neck', vi: 'C-A-G-E-D: năm hình, một cần đàn' },
            text: {
              en: 'The same trick works with the open C, A, G, E and D chord shapes. Each one gives a shape of the scale, and together they cover the whole neck. You start with the E shape; Level 2 adds the other four.',
              vi: 'Cách này áp dụng cho cả năm hình hợp âm dây buông C, A, G, E và D. Mỗi hình cho một hình của gam, và cả năm phủ kín cần đàn. Bạn bắt đầu với hình E; Cấp 2 sẽ thêm bốn hình còn lại.',
            },
            view: { root: 9, pattern: 'Minor pentatonic', position: 'all' },
            links: [
              { label: { en: 'Wikipedia: the CAGED system', vi: 'Wikipedia: hệ thống CAGED (tiếng Anh)' }, url: 'https://en.wikipedia.org/wiki/Bar_chord#CAGED_System' },
              { label: { en: 'Wikipedia: pentatonic scale', vi: 'Wikipedia: gam ngũ cung (tiếng Anh)' }, url: 'https://en.wikipedia.org/wiki/Pentatonic_scale' },
            ],
          },
        ],
        settings: { root: A, pattern: 'Minor pentatonic', position: 1, sequence: 'Ascending' },
        test: null,
      },
      {
        id: 'l1-up',
        title: { en: 'Climb the E shape', vi: 'Leo lên hình E' },
        text: {
          en: 'Play the shape slowly from the low A to the top. In part 1 the next note lights up once the app hears the current one; in part 2 you play along with a slow click.',
          vi: 'Đánh chậm hình này từ nốt A trầm lên tới nốt cao nhất. Ở phần 1, nốt tiếp theo sáng lên khi app nghe đúng nốt hiện tại; ở phần 2 bạn đánh theo máy đếm nhịp chậm.',
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
          en: ['Alternate picking: down, up, down, up.', 'If part 2 falls apart, use a slower tempo chip to practise, then come back to the lesson tempo.'],
          vi: ['Đánh luân phiên: xuống, lên, xuống, lên.', 'Nếu phần 2 bị rối, chọn tốc độ chậm hơn để luyện, rồi quay lại tốc độ của bài.'],
        },
        settings: { root: A, pattern: 'Minor pentatonic', position: 1, sequence: 'Up & down' },
        test: test(70, 0.9),
      },
    ],
  },
  {
    title: { en: 'The whole neck: CAGED', vi: 'Toàn bộ cần đàn: CAGED' },
    goal: {
      en: 'Learn the other four CAGED shapes of the pentatonic and connect them, so you are never stuck in one place.',
      vi: 'Học bốn hình CAGED còn lại của gam ngũ cung và nối chúng với nhau, để không bị kẹt ở một chỗ.',
    },
    lessons: [
      {
        id: 'l2-map',
        title: { en: 'The five CAGED shapes', vi: 'Năm hình CAGED' },
        text: {
          en: 'The same 5 notes repeat all over the neck in five shapes: E, D, C, A and G, in that order going up. Each shape overlaps the next one. The easiest way to find a shape is its root.',
          vi: 'Cùng 5 nốt đó lặp lại khắp cần đàn thành năm hình: E, D, C, A và G, theo thứ tự đi lên. Mỗi hình chồng lên hình kế tiếp. Cách dễ nhất để tìm một hình là nhìn nốt chủ của nó.',
        },
        tips: {
          en: ['Start with 📖 Read for a tour of all five shapes.', 'In Free practice, the Position menu lists every shape.'],
          vi: ['Bắt đầu với 📖 Đọc để xem qua cả năm hình.', 'Trong Luyện tự do, mục Thế bấm liệt kê mọi hình.'],
        },
        read: [
          {
            title: { en: 'Same notes, five places', vi: 'Cùng các nốt, năm vị trí' },
            text: {
              en: 'Here is A minor pentatonic over the whole neck. The roots (A, bright) are your landmarks: each CAGED shape is built around a pair of them.',
              vi: 'Đây là ngũ cung thứ La trên cả cần đàn. Các nốt chủ (A, sáng) là mốc của bạn: mỗi hình CAGED được xây quanh một cặp nốt chủ.',
            },
            view: { root: 9, pattern: 'Minor pentatonic', position: 'all', bright: ['R'] },
          },
          {
            title: { en: 'E shape · frets 4–8', vi: 'Hình E · phím 4–8' },
            text: {
              en: 'You know this one. Root on the 6th string at fret 5, under the index finger.',
              vi: 'Hình bạn đã biết. Nốt chủ trên dây 6 ở phím 5, dưới ngón trỏ.',
            },
            view: { root: 9, pattern: 'Minor pentatonic', position: 1 },
          },
          {
            title: { en: 'D shape · frets 7–11', vi: 'Hình D · phím 7–11' },
            text: {
              en: 'Root on the 4th (D) string at fret 7 — like the open D-minor chord moved up. It starts where the E shape ends.',
              vi: 'Nốt chủ trên dây 4 (dây D) ở phím 7 — giống hợp âm Rê thứ dây buông được dời lên. Hình này bắt đầu nơi hình E kết thúc.',
            },
            view: { root: 9, pattern: 'Minor pentatonic', position: 2 },
          },
          {
            title: { en: 'C shape · frets 9–13', vi: 'Hình C · phím 9–13' },
            text: {
              en: 'Root on the 5th (A) string at fret 12, under the ring finger, and on the 2nd string at fret 10.',
              vi: 'Nốt chủ trên dây 5 (dây A) ở phím 12, dưới ngón áp út, và trên dây 2 ở phím 10.',
            },
            view: { root: 9, pattern: 'Minor pentatonic', position: 3 },
          },
          {
            title: { en: 'A shape · open position (and frets 12–15)', vi: 'Hình A · thế dây buông (và phím 12–15)' },
            text: {
              en: 'Root on the open 5th (A) string — the open A-minor chord. The same shape repeats an octave higher at frets 12–15.',
              vi: 'Nốt chủ là dây 5 (dây A) buông — chính là hợp âm La thứ dây buông. Cùng hình đó lặp lại cao hơn một quãng tám ở phím 12–15.',
            },
            view: { root: 9, pattern: 'Minor pentatonic', position: 4 },
          },
          {
            title: { en: 'G shape · frets 2–6', vi: 'Hình G · phím 2–6' },
            text: {
              en: 'Root on the 6th string at fret 5, but now under the pinky. Go one step higher and you are back in the E shape: the cycle repeats.',
              vi: 'Nốt chủ trên dây 6 ở phím 5, nhưng giờ dưới ngón út. Đi lên thêm một bước là bạn trở lại hình E: vòng lặp bắt đầu lại.',
            },
            view: { root: 9, pattern: 'Minor pentatonic', position: 5 },
            links: [
              { label: { en: 'Wikipedia: the CAGED system', vi: 'Wikipedia: hệ thống CAGED (tiếng Anh)' }, url: 'https://en.wikipedia.org/wiki/Bar_chord#CAGED_System' },
              { label: { en: 'musictheory.net: scales & chords basics', vi: 'musictheory.net: cơ bản về gam & hợp âm (tiếng Anh)' }, url: 'https://www.musictheory.net/lessons' },
            ],
          },
        ],
        settings: { root: A, pattern: 'Minor pentatonic', position: 'all', sequence: 'Ascending' },
        test: null,
      },
      {
        id: 'l2-pos2',
        title: { en: 'D shape', vi: 'Hình D' },
        text: {
          en: 'The D shape (position 2): root A on the 4th (D) string at fret 7. On the low E string it starts on C, fret 8.',
          vi: 'Hình D (thế 2): nốt chủ A trên dây 4 (dây D) ở phím 7. Trên dây E trầm, hình bắt đầu từ nốt C, phím 8.',
        },
        tips: {
          en: ['Stay inside this shape — don’t slide back to the E shape for the same notes.'],
          vi: ['Đánh trong hình này — đừng trượt về hình E để lấy cùng nốt.'],
        },
        settings: { root: A, pattern: 'Minor pentatonic', position: 2, sequence: 'Up & down' },
        test: test(70),
      },
      {
        id: 'l2-connect',
        title: { en: 'Connect E → D shape', vi: 'Nối hình E → D' },
        text: {
          en: 'Play across both shapes (frets 5–10). Slide from one to the other on the G string.',
          vi: 'Đánh qua cả hai hình (phím 5–10). Trượt từ hình này sang hình kia trên dây G.',
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
        title: { en: 'C shape', vi: 'Hình C' },
        text: {
          en: 'The C shape (position 3): root A on the 5th (A) string at fret 12, under the ring finger. On the low E string it starts on D, fret 10.',
          vi: 'Hình C (thế 3): nốt chủ A trên dây 5 (dây A) ở phím 12, dưới ngón áp út. Trên dây E trầm, hình bắt đầu từ nốt D, phím 10.',
        },
        tips: { en: [], vi: [] },
        settings: { root: A, pattern: 'Minor pentatonic', position: 3, sequence: 'Up & down' },
        test: test(70),
      },
      {
        id: 'l2-pos4',
        title: { en: 'A shape', vi: 'Hình A' },
        text: {
          en: 'The A shape (position 4) — here in open position (frets 0–3), root on the open A string. The same shape repeats an octave higher at frets 12–15.',
          vi: 'Hình A (thế 4) — ở đây là thế dây buông (phím 0–3), nốt chủ là dây A buông. Cùng hình đó lặp lại cao hơn một quãng tám ở phím 12–15.',
        },
        tips: { en: [], vi: [] },
        settings: { root: A, pattern: 'Minor pentatonic', position: 4, sequence: 'Up & down' },
        test: test(70),
      },
      {
        id: 'l2-pos5',
        title: { en: 'G shape', vi: 'Hình G' },
        text: {
          en: 'The G shape (position 5): root A on the 6th string at fret 5, under the pinky. It leads straight back into the E shape.',
          vi: 'Hình G (thế 5): nốt chủ A trên dây 6 ở phím 5, dưới ngón út. Hình này dẫn thẳng về lại hình E.',
        },
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
      vi: 'Thêm nốt blue, và khám phá rằng cùng hình đó cho bạn âm trưởng vui tươi.',
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
          en: ['Compare with the pentatonic E shape: all three notes are already inside it.'],
          vi: ['So với hình E của ngũ cung: cả ba nốt đều đã nằm trong đó.'],
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
          vi: 'Các nốt đến theo thứ tự ngẫu nhiên. Bài này luyện bạn nhìn thấy hình của gam thay vì học thuộc một đường chạy.',
        },
        tips: { en: [], vi: [] },
        settings: { root: A, pattern: 'Minor pentatonic', position: 1, sequence: 'Random' },
        test: test(60, 0.85, 0.7),
      },
      {
        id: 'l6-e',
        title: { en: 'Another key: E minor', vi: 'Giọng khác: Mi thứ' },
        text: {
          en: 'Move the shape: E minor pentatonic in open position. It is the E shape you know from fret 5, slid down so the open strings play the index-finger notes.',
          vi: 'Dời hình: ngũ cung thứ Mi (E) ở thế dây buông. Đó là hình E bạn đã biết ở phím 5, trượt xuống để dây buông thay cho ngón trỏ.',
        },
        tips: {
          en: ['Every shape you learned moves to any key by sliding it.'],
          vi: ['Mọi hình bạn đã học đều chuyển sang giọng khác bằng cách trượt nó.'],
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
