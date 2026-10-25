// UI wiring: learning path, two-part lesson tests, free practice, audio (+ optional camera) input.

import {
  NOTE_NAMES, PATTERNS, SEQUENCES, STRING_NAMES, MAX_FRET,
  findPattern, patternNotes, positionPresets, scaleRun, buildSequence, candidatePositions,
  midiToName, midiToNameOctave,
} from './theory.js';
import { Fretboard } from './fretboard.js';
import { CameraView } from './camera.js';
import { PitchDetector } from './pitch.js';
import { PracticeSession } from './practice.js';
import { pluck, click } from './synth.js';
import { LEVELS, ALL_LESSONS, TEST_RUNS, loadProgress, saveProgress, isDone, starsFor, nextLessonId } from './curriculum.js';
import { t, L, getLang, setLang, applyStatic, patternLabel, sequenceLabel } from './i18n.js';

const $ = (id) => document.getElementById(id);
const PREFS_KEY = 'fretcoach.prefs';
// Webcam fret overlay + calibration. Off for now: practice is judged by audio only.
const CAMERA_FEATURES = false;
document.body.classList.toggle('no-cam', !CAMERA_FEATURES);

const state = {
  root: 9, // A
  pattern: 'Minor pentatonic',
  position: '1',
  fretMin: 4,
  fretMax: 9,
  labels: 'degree',
  sequence: 'Up & down',
  notes: [],
  fingers: [],
  heard: null,
};

// ---- persistence -------------------------------------------------------------

function loadPrefs() {
  try { Object.assign(state, JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')); } catch { /* ignore */ }
}
function savePrefs() {
  const { root, pattern, position, fretMin, fretMax, labels, sequence } = state;
  try { localStorage.setItem(PREFS_KEY, JSON.stringify({ root, pattern, position, fretMin, fretMax, labels, sequence })); } catch { /* ignore */ }
}

// ---- components --------------------------------------------------------------

const status = (msg) => { $('status').textContent = msg; };
const fretboard = new Fretboard($('fretboard'), { onNoteClick: (n) => pluck(n.midi) });
const practice = new PracticeSession({
  onChange: () => { requestRender(); renderHud(); reactToStats(); checkLesson(); },
  onMessage: status,
  locate: locateHeard,
});

// Audio knows the pitch, not where it was played. Pick the candidate spot on the neck
// closest to a tracked fingertip; same-pitch spots are ~5 frets apart, so the camera
// only needs to be roughly right. Without a fingertip, assume the spot inside the box.
function locateHeard(midi) {
  const cands = candidatePositions(midi);
  if (!cands.length) return null;
  const fingers = state.fingers;
  if (camera.mapper && fingers.length) {
    let best = null;
    for (const c of cands) {
      for (const f of fingers) {
        const d = Math.abs(c.fret - f.fret) + 0.7 * Math.abs(c.string - f.string);
        if (!best || d < best.d) best = { ...c, d };
      }
    }
    return { string: best.string, fret: best.fret, verified: best.d <= 2.5 };
  }
  const mid = (state.fretMin + state.fretMax) / 2;
  const inBox = cands.filter((c) => c.fret >= state.fretMin && c.fret <= state.fretMax);
  const pick = (inBox.length ? inBox : cands).reduce((a, b) => (Math.abs(a.fret - mid) <= Math.abs(b.fret - mid) ? a : b));
  return { ...pick, verified: false };
}
const camera = new CameraView($('video'), {
  onStatus: status,
  onFingers: (fingers) => {
    state.fingers = fingers;
    practice.handleFingers(fingers);
    requestRender();
  },
});
const pitch = new PitchDetector();
pitch.onPitch((p) => {
  state.heard = p;
  const target = practice.target;
  const misses = practice.stats.misses;
  practice.handlePitch(p);
  if (practice.mode === 'ear' && practice.stats.misses > misses && target && p.midi != null) {
    toast(t('toast.wrong', { played: midiToNameOctave(p.midi), target: midiToNameOctave(target.midi) }), 'bad');
  }
  renderHeard(p);
});

// ---- feedback: toasts, daily streak --------------------------------------------------

let toastTimer = null;
function toast(text, kind = 'good') {
  const el = $('toast');
  el.textContent = text;
  el.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 1400);
}

const seen = { hits: 0, misses: 0, laps: 0 };
function reactToStats() {
  const s = practice.stats;
  if (s.hits > seen.hits && s.streak >= 5 && s.streak % 5 === 0) toast(t('toast.streak', { n: s.streak }), 'good');
  if (s.misses > seen.misses && practice.mode === 'metronome') toast(t('toast.missed'), 'bad');
  if (s.laps > seen.laps) bumpDaily();
  Object.assign(seen, { hits: s.hits, misses: s.misses, laps: s.laps });
}

const DAILY_KEY = 'fretcoach.daily';
const dayKey = (offset = 0) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toLocaleDateString('en-CA'); };
function loadDaily() {
  try { return JSON.parse(localStorage.getItem(DAILY_KEY) || 'null') || { days: 0, last: null }; } catch { return { days: 0, last: null }; }
}
function bumpDaily() {
  const d = loadDaily();
  if (d.last === dayKey()) return;
  d.days = d.last === dayKey(-1) ? d.days + 1 : 1;
  d.last = dayKey();
  try { localStorage.setItem(DAILY_KEY, JSON.stringify(d)); } catch { /* ignore */ }
  renderBadges();
}
function renderBadges() {
  const d = loadDaily();
  const alive = d.last === dayKey() || d.last === dayKey(-1);
  $('dayStreak').textContent = `🔥 ${alive ? d.days : 0}`;
  $('dayStreak').title = t('badge.streak');
  const stars = Object.values(lessonState.progress).reduce((n, p) => n + (p.stars || 0), 0);
  $('starTotal').textContent = `⭐ ${stars}`;
  $('starTotal').title = t('badge.stars');
}

// ---- pattern controls ----------------------------------------------------------

function fillSelect(sel, items, value) {
  sel.replaceChildren();
  for (const it of items) {
    if (it.group) {
      const og = document.createElement('optgroup');
      og.label = it.group;
      for (const o of it.options) og.appendChild(new Option(o.label, o.value));
      sel.appendChild(og);
    } else {
      sel.appendChild(new Option(it.label, it.value));
    }
  }
  if (value !== undefined) sel.value = value;
}

function fillPatternSelects() {
  const opts = (names) => names.map((n) => ({ label: patternLabel(n), value: n }));
  fillSelect($('root'), NOTE_NAMES.map((n, i) => ({ label: n, value: i })), state.root);
  fillSelect($('pattern'), [
    { group: t('free.scales'), options: opts(Object.keys(PATTERNS.scales)) },
    { group: t('free.arps'), options: opts(Object.keys(PATTERNS.arpeggios)) },
  ], state.pattern);
  fillSelect($('sequence'), SEQUENCES.map((s) => ({ label: sequenceLabel(s), value: s })), state.sequence);
  $('labels').value = state.labels;
}

function initControls() {
  fillPatternSelects();
  refreshPositions();

  $('root').onchange = (e) => { state.root = +e.target.value; refreshPositions(true); };
  $('pattern').onchange = (e) => { state.pattern = e.target.value; refreshPositions(true); };
  $('position').onchange = (e) => { state.position = e.target.value; applyPosition(); };
  $('fretMin').onchange = $('fretMax').onchange = () => {
    state.fretMin = clampFret($('fretMin').value);
    state.fretMax = clampFret($('fretMax').value);
    if (state.fretMin > state.fretMax) [state.fretMin, state.fretMax] = [state.fretMax, state.fretMin];
    state.position = 'custom';
    $('position').value = 'custom';
    rebuild();
  };
  $('labels').onchange = (e) => { state.labels = e.target.value; rebuild(); };
  $('sequence').onchange = (e) => { state.sequence = e.target.value; rebuild(); };

  for (const btn of $('modes').querySelectorAll('button')) {
    btn.onclick = () => setMode(btn.dataset.mode);
  }
  $('bpm').oninput = (e) => setBpm(+e.target.value);
  $('bpmDown').onclick = () => setBpm(practice.bpm - 5);
  $('bpmUp').onclick = () => setBpm(practice.bpm + 5);
  $('ignoreOctave').onchange = (e) => { practice.ignoreOctave = e.target.checked; };
  $('requirePosition').onchange = (e) => { practice.requirePosition = e.target.checked; };
}

const BPM_MIN = 30;
const BPM_MAX = 200;
const BPM_CHIPS = [60, 70, 80, 100, 120];

function setBpm(bpm) {
  bpm = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(bpm)));
  $('bpm').value = bpm;
  $('bpmLabel').textContent = bpm;
  practice.setBpm(bpm);
  renderTempo();
}

// The lesson tempo only matters in part 2 (in time): slower runs are practice and don't pass.
const lessonTempo = () => (lessonState.active?.test && lessonState.part === 2 ? lessonState.active.test.bpm : null);

function renderTempo() {
  const bpm = practice.bpm;
  const target = lessonTempo();
  const values = [...new Set([...BPM_CHIPS, ...(target ? [target] : [])])].sort((a, b) => a - b);
  $('bpmChips').replaceChildren(...values.map((v) => {
    const b = document.createElement('button');
    b.className = 'bpm-chip';
    b.textContent = v;
    b.classList.toggle('active', v === bpm);
    b.classList.toggle('target', v === target);
    b.classList.toggle('below', !!target && v < target);
    if (target && v < target) b.title = t('tempo.practiceOnly');
    b.onclick = () => setBpm(v);
    return b;
  }));
  $('bpmMark').hidden = !target;
  if (target) $('bpmMark').style.left = `${((target - BPM_MIN) / (BPM_MAX - BPM_MIN)) * 100}%`;
  $('tempoTarget').hidden = !target;
  $('tempoTarget').textContent = target ? t('tempo.target', { bpm: target }) : '';
  const note = $('tempoNote');
  note.hidden = !target;
  note.classList.toggle('warn', !!target && bpm < target);
  if (target) note.textContent = bpm < target ? t('tempo.below', { bpm: target }) : t('tempo.ok');
}

// Load a preset (from a lesson) into the controls.
function applySettings(s, mode, bpm) {
  state.root = s.root;
  state.pattern = s.pattern;
  state.sequence = s.sequence;
  $('root').value = s.root;
  $('pattern').value = s.pattern;
  $('sequence').value = s.sequence;
  if (bpm) setBpm(bpm);
  if (typeof s.position === 'object') {
    state.position = 'custom';
    state.fretMin = s.position.min;
    state.fretMax = s.position.max;
  } else {
    state.position = String(s.position);
  }
  refreshPositions();
  setMode(mode);
}

const clampFret = (v) => Math.max(0, Math.min(MAX_FRET, Math.round(+v || 0)));

function refreshPositions(resetToFirst = false) {
  const presets = positionPresets(state.root, findPattern(state.pattern));
  const items = [
    { label: t('free.wholeNeck'), value: 'all' },
    ...presets.map((p, i) => ({ label: t('free.pos', { n: i + 1, fret: p.fret, degree: p.degree }), value: String(i + 1) })),
    { label: t('free.custom'), value: 'custom' },
  ];
  if (resetToFirst && state.position !== 'all' && state.position !== 'custom') state.position = '1';
  if (!items.some((i) => i.value === state.position)) state.position = '1';
  fillSelect($('position'), items, state.position);
  applyPosition();
}

function applyPosition() {
  const presets = positionPresets(state.root, findPattern(state.pattern));
  if (state.position === 'all') { state.fretMin = 0; state.fretMax = MAX_FRET; }
  else if (state.position !== 'custom') {
    const p = presets[+state.position - 1];
    if (p) { state.fretMin = p.min; state.fretMax = p.max; }
  }
  $('fretMin').value = state.fretMin;
  $('fretMax').value = state.fretMax;
  rebuild();
}

function rebuild() {
  const intervals = findPattern(state.pattern);
  state.notes = patternNotes(state.root, intervals);
  const inWindow = state.notes.filter((n) => n.fret >= state.fretMin && n.fret <= state.fretMax);
  practice.setSequence(buildSequence(scaleRun(inWindow), state.sequence));
  practice.resetStats();
  if (!lessonState.active) savePrefs();
  renderSeqStrip();
  renderHud();
  requestRender();
}

function modeHint(mode) {
  if (mode === 'ear') return t(pitch.running ? 'st.ear' : 'st.earNoAudio');
  if (mode === 'metronome') return t(pitch.running ? 'st.metro' : 'st.metroNoAudio');
  if (mode === 'camera') return camera.mapper ? 'Finger: press Space, then put a fingertip on each highlighted fret.' : 'Finger mode needs the camera + neck calibration (C).';
  return t('st.explore');
}

function setMode(mode) {
  cancelCountdown();
  stopDemo();
  for (const btn of $('modes').querySelectorAll('button')) btn.classList.toggle('active', btn.dataset.mode === mode);
  practice.setMode(mode);
  // In a lesson, the mode decides which part is being tested.
  const l = lessonState.active;
  if (l?.test && (mode === 'ear' || mode === 'metronome')) {
    lessonState.part = mode === 'metronome' ? 2 : 1;
    renderLessonCard();
  }
  renderTempo();
  status(modeHint(mode));
}

// ---- learning path ------------------------------------------------------------------

const lessonState = { active: null, part: 1, progress: loadProgress() };

function initLearn() {
  for (const btn of $('tabs').querySelectorAll('button')) {
    btn.onclick = () => switchTab(btn.dataset.tab);
  }
  $('continueBtn').onclick = () => openLesson(nextLessonId(lessonState.progress));
  $('lessonNext').onclick = () => stepLesson(1);
  $('lessonPrev').onclick = () => stepLesson(-1);
  $('lessonDone').onclick = () => { stopPlay(true); completeLesson(1); showResults('complete', 1, null); };
  $('lessonListen').onclick = startListen;
  $('lessonStart').onclick = () => (practice.running || (countdown.active && !demo.pending) ? stopPlay() : startPlay());
  for (const chip of [$('part1Chip'), $('part2Chip')]) chip.onclick = () => { stopPlay(true); setLessonPart(+chip.dataset.part); };
  $('resRetry').onclick = () => { closeResults(); startPlay(); };
  $('resNext').onclick = () => { closeResults(); stepLesson(1); };
  $('resPart2').onclick = () => { closeResults(); setLessonPart(2); startPlay(); };
  $('resFaster').onclick = () => { closeResults(); setBpm(Math.min(200, practice.bpm + 10)); startPlay(); };
  $('resClose').onclick = closeResults;
  $('resetProgress').onclick = () => {
    if (!confirm(t('path.resetConfirm'))) return;
    lessonState.progress = {};
    saveProgress(lessonState.progress);
    renderLevels();
    renderBadges();
    if (lessonState.active) openLesson(lessonState.active.id);
  };
  renderLevels();
}

function switchTab(tab) {
  for (const btn of $('tabs').querySelectorAll('button')) btn.classList.toggle('active', btn.dataset.tab === tab);
  $('tab-learn').hidden = tab !== 'learn';
  $('tab-free').hidden = tab !== 'free';
  if (tab === 'free' && lessonState.active) {
    // Leave the lesson; free practice picks up the user's own last settings.
    stopPlay(true);
    lessonState.active = null;
    $('lesson').hidden = true;
    loadPrefs();
    initControls();
    setMode('explore');
    renderLevels();
  }
}

function renderLevels() {
  const { progress } = lessonState;
  const done = ALL_LESSONS.filter((l) => isDone(progress[l.id])).length;
  $('overallFill').style.width = `${(done / ALL_LESSONS.length) * 100}%`;
  $('overallText').textContent = t('path.count', { done, total: ALL_LESSONS.length });
  const nextId = nextLessonId(progress);
  const box = $('levels');
  box.replaceChildren();
  LEVELS.forEach((lvl, li) => {
    const sec = document.createElement('div');
    sec.className = 'level';
    const lvlDone = lvl.lessons.filter((l) => isDone(progress[l.id])).length;
    sec.innerHTML = `<div class="level-head"><span class="level-badge">${li + 1}</span><div><b></b><small></small></div></div>`;
    sec.querySelector('b').textContent = L(lvl.title);
    sec.querySelector('small').textContent = t('path.levelCount', { done: lvlDone, total: lvl.lessons.length });
    const path = document.createElement('div');
    path.className = 'path';
    lvl.lessons.forEach((l, i) => {
      const b = document.createElement('button');
      const p = progress[l.id];
      const done = isDone(p);
      b.className = 'node';
      if (done) b.classList.add('done');
      else if (p?.part1) b.classList.add('half');
      if (l.id === nextId) b.classList.add('next');
      if (lessonState.active?.id === l.id) b.classList.add('current');
      const dot = done ? '✓' : l.id === nextId ? '▶' : String(i + 1);
      const sub = done ? '★'.repeat(p.stars) + '☆'.repeat(3 - p.stars)
        : p?.part1 ? t('path.half') : l.id === nextId ? t('path.upNext') : '';
      b.innerHTML = '<span class="node-dot"></span><span class="node-label"><span></span><small></small></span>';
      b.querySelector('.node-dot').textContent = dot;
      b.querySelector('.node-label span').textContent = L(l.title);
      b.querySelector('small').textContent = sub;
      b.onclick = () => openLesson(l.id);
      path.appendChild(b);
    });
    sec.appendChild(path);
    box.appendChild(sec);
  });
}

// Lessons with a test start at part 2 once part 1 is passed.
function openLesson(id) {
  const lesson = ALL_LESSONS.find((l) => l.id === id);
  if (!lesson) return;
  stopPlay(true);
  closeResults();
  lessonState.active = lesson;
  const p = lessonState.progress[id];
  lessonState.part = lesson.test && (p?.part1 || isDone(p)) ? 2 : 1;
  for (const btn of $('tabs').querySelectorAll('button')) btn.classList.toggle('active', btn.dataset.tab === 'learn');
  $('tab-learn').hidden = false;
  $('tab-free').hidden = true;
  $('lesson').hidden = false;
  $('lessonBody').hidden = false;
  applyLessonPart();
  renderLevels();
  if (narrow()) setDrawer(false, false);
}

function setLessonPart(part) {
  lessonState.part = part;
  applyLessonPart();
}

// Part 1 = free tempo (ear), part 2 = in time (metronome). Look-only lessons explore.
function applyLessonPart() {
  const l = lessonState.active;
  const mode = !l.test ? 'explore' : lessonState.part === 1 ? 'ear' : 'metronome';
  applySettings(l.settings, mode, l.test?.bpm || 70);
  renderLessonCard();
}

function renderLessonCard() {
  const l = lessonState.active;
  if (!l) return;
  const lvl = LEVELS[l.level];
  const p = lessonState.progress[l.id];
  $('lessonLevel').textContent = t('lesson.level', { n: l.level + 1, title: L(lvl.title) });
  $('lessonLevel').title = L(lvl.goal);
  $('lessonTitle').textContent = L(l.title);
  $('lessonText').textContent = L(l.text);
  $('lessonTips').replaceChildren(...L(l.tips).map((tip) => Object.assign(document.createElement('li'), { textContent: tip })));
  $('lessonDone').hidden = !!l.test;
  $('lessonParts').hidden = !l.test;
  if (l.test) {
    const c1 = $('part1Chip');
    const c2 = $('part2Chip');
    c1.textContent = `${p?.part1 || isDone(p) ? '✓ ' : ''}${t('lesson.part1')}`;
    c2.textContent = `${isDone(p) ? '✓ ' : ''}${t('lesson.part2', { bpm: l.test.bpm })}`;
    c1.classList.toggle('active', lessonState.part === 1);
    c2.classList.toggle('active', lessonState.part === 2);
    c1.classList.toggle('passed', !!(p?.part1 || isDone(p)));
    c2.classList.toggle('passed', isDone(p));
    $('lessonGoal').textContent = lessonState.part === 1
      ? t('goal.part1', { runs: TEST_RUNS, pct: Math.round(l.test.accuracy * 100) })
      : t('goal.part2', { runs: TEST_RUNS, bpm: l.test.bpm, pct: Math.round(l.test.timed * 100) });
  } else {
    $('lessonGoal').textContent = t('goal.look');
  }
  const idx = ALL_LESSONS.indexOf(ALL_LESSONS.find((x) => x.id === l.id));
  $('lessonPrev').disabled = idx === 0;
  $('lessonNext').disabled = idx === ALL_LESSONS.length - 1;
  renderTempo();
  renderHud();
  renderLessonResult();
}

function stepLesson(dir) {
  const idx = ALL_LESSONS.findIndex((l) => l.id === lessonState.active?.id);
  const next = ALL_LESSONS[idx + dir];
  if (next) openLesson(next.id);
}

function saveLessonProgress(update) {
  const l = lessonState.active;
  lessonState.progress[l.id] = { ...lessonState.progress[l.id], ...update, at: Date.now() };
  saveProgress(lessonState.progress);
  bumpDaily();
  renderLevels();
  renderBadges();
  renderLessonCard();
}

function completeLesson(stars) {
  const prev = lessonState.progress[lessonState.active.id];
  saveLessonProgress({ part1: true, stars: Math.max(stars, prev?.stars || 0) });
  status(t('st.complete', { title: L(lessonState.active.title) }));
}

// kind: 'part1' | 'complete' | 'fail'
function showResults(kind, stars, stats, hint = '') {
  const l = lessonState.active;
  const idx = ALL_LESSONS.findIndex((x) => x.id === l.id);
  const passed = kind !== 'fail';
  $('resEmoji').textContent = kind === 'fail' ? '💪' : kind === 'part1' ? '✅' : stars === 3 ? '🏆' : '🎉';
  $('resTitle').textContent = t(kind === 'fail' ? 'res.fail' : kind === 'part1' ? 'res.part1' : 'res.complete');
  $('resStars').innerHTML = [1, 2, 3].map((n) => `<span class="${n <= stars ? 'on' : ''}">★</span>`).join('');
  $('resStars').hidden = kind !== 'complete';
  $('resStats').hidden = !stats;
  if (stats) {
    $('resAcc').textContent = `${Math.round(stats.acc * 100)}%`;
    $('resStreak').textContent = stats.best;
    $('resHits').textContent = `${stats.hits}/${stats.hits + stats.misses}`;
  }
  $('resHint').textContent = hint || (kind === 'part1' ? t('res.hintPart2', { bpm: l.test.bpm })
    : kind === 'complete' ? (stars < 3 && stats ? t('res.hintStars') : '') : '');
  $('resPart2').hidden = kind !== 'part1';
  $('resNext').hidden = kind !== 'complete' || idx === ALL_LESSONS.length - 1;
  $('resFaster').hidden = kind !== 'complete' || !stats;
  $('resRetry').classList.toggle('primary', !passed);
  $('results').hidden = false;
  const primary = [$('resPart2'), $('resNext')].find((b) => !b.hidden) || $('resRetry');
  primary.focus();
}

function closeResults() { $('results').hidden = true; }

// Called on every practice change: after TEST_RUNS runs, end the part and show the result.
function checkLesson() {
  const l = lessonState.active;
  if (!l?.test || !practice.running || practice.stats.laps < TEST_RUNS) { renderLessonResult(); return; }
  const timed = practice.mode === 'metronome';
  const stats = { ...practice.stats, acc: practice.accuracy };
  const need = timed ? l.test.timed : l.test.accuracy;
  const tempoOk = !timed || practice.bpm >= l.test.bpm;
  stopPlay(true);
  if (stats.acc >= need && tempoOk) {
    if (timed) {
      const stars = starsFor(stats.acc);
      completeLesson(stars);
      showResults('complete', stars, stats);
    } else {
      saveLessonProgress({ part1: true });
      status(t('st.part1'));
      showResults('part1', 0, stats);
    }
  } else {
    showResults('fail', 0, stats, tempoOk ? t('res.hintFail', { pct: Math.round(need * 100) }) : t('res.hintPart2', { bpm: l.test.bpm }));
  }
  renderLessonResult();
}

function renderLessonResult() {
  const l = lessonState.active;
  if (!l) return;
  const p = lessonState.progress[l.id];
  let frac;
  if (!l.test) frac = isDone(p) ? 1 : 0;
  else {
    const partDone = lessonState.part === 1 ? p?.part1 || isDone(p) : isDone(p);
    const laps = Math.min(practice.stats.laps, TEST_RUNS);
    frac = practice.running ? (laps + practice.index / Math.max(1, practice.sequence.length)) / TEST_RUNS : partDone ? 1 : 0;
  }
  $('goalFill').style.width = `${Math.min(1, frac) * 100}%`;
  const total = practice.stats.hits + practice.stats.misses;
  const parts = [];
  if (l.test && total) parts.push(t('goal.accuracy', { pct: Math.round(practice.accuracy * 100) }));
  if (isDone(p)) parts.push(t('goal.best', { stars: '★'.repeat(p.stars) }));
  $('lessonResult').textContent = parts.join(' · ');
}

// ---- rendering -------------------------------------------------------------------

let renderQueued = false;
function requestRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    const overlay = {
      notes: state.notes,
      windowMin: state.fretMin,
      windowMax: state.fretMax,
      labelMode: state.labels,
      target: demoNote(0) || practice.target,
      next: demo.active ? demoNote(1) : practice.next,
      flash: practice.flash,
    };
    fretboard.render({ ...overlay, fingers: state.fingers });
    camera.setOverlay(overlay);
    renderFingers();
    renderSeqProgress();
  });
}

const placeName = (n) => t('place', { s: STRING_NAMES[n.string], f: n.fret === 0 ? t('place.open') : t('place.fret', { n: n.fret }) });

function renderHud() {
  const playing = practice.running || countdown.active || demo.active;
  $('playBtn').classList.toggle('stop', playing);
  $('playBtn').innerHTML = t(playing ? 'btn.stopPlay' : 'btn.play');
  $('playHint').hidden = playing;

  const l = lessonState.active;
  const testing = practice.running || (countdown.active && !demo.pending);
  const startLabel = !l?.test ? t('lesson.try') : t('lesson.startPart', { n: lessonState.part });
  $('lessonStart').innerHTML = `<span class="step-n">2</span><span></span>`;
  $('lessonStart').lastChild.textContent = testing ? t('lesson.stop') : startLabel;
  $('lessonStart').classList.toggle('stop', testing);
  const listening = demo.active || demo.pending;
  $('lessonListen').innerHTML = `<span class="step-n">1</span><span></span>`;
  $('lessonListen').lastChild.textContent = listening ? t('lesson.stop') : t('lesson.listen');
  $('lessonListen').classList.toggle('stop', listening);

  const demoN = demoNote(0);
  if (demoN) {
    $('target').classList.add('big');
    $('target').classList.remove('mid');
    $('target').textContent = midiToNameOctave(demoN.midi);
    $('targetSub').textContent = t('hud.listening', { place: placeName(demoN), i: demo.index + 1, n: practice.sequence.length });
    return;
  }
  const tg = practice.target;
  $('target').classList.toggle('mid', !tg);
  $('target').classList.toggle('big', !!tg);
  if (tg) {
    $('target').textContent = midiToNameOctave(tg.midi);
    $('targetSub').textContent = `${placeName(tg)} · ${tg.degree}  (${practice.index + 1}/${practice.sequence.length})`;
  } else {
    $('target').textContent = `${midiToName(state.root)} ${patternLabel(state.pattern).split(' (')[0]}`;
    $('targetSub').textContent = t('hud.explore', { a: state.fretMin, b: state.fretMax, n: practice.sequence.length });
  }
  const s = practice.stats;
  $('sHits').textContent = s.hits;
  $('sMiss').textContent = s.misses;
  $('sStreak').textContent = s.streak;
  $('sBest').textContent = s.best;
  $('sNpm').textContent = practice.notesPerMinute();
  $('sLaps').textContent = s.laps;
}

function renderHeard(p) {
  $('level').style.width = `${Math.min(100, (p.rms / 0.2) * 100)}%`;
  if (p.midi == null) return;
  $('heard').textContent = midiToNameOctave(p.midi);
  $('heardSub').textContent = `${p.freq.toFixed(1)} Hz · ${p.cents > 0 ? '+' : ''}${p.cents}¢`;
  $('needle').style.left = `${50 + p.cents}%`;
  const tg = practice.target;
  $('heard').style.color = tg && practice.matches(p.midi, tg) ? 'var(--green-t)' : '';
}

function renderFingers() {
  const f = state.fingers;
  if (!camera.running) { $('fingers').textContent = '—'; return; }
  if (!camera.mapper) { $('fingers').textContent = 'calibrate neck'; return; }
  $('fingers').textContent = f.length
    ? f.map((x) => `${x.finger[0].toUpperCase()}: ${STRING_NAMES[x.string]}${x.fret}`).join('  ')
    : 'no fingertip on neck';
}

function renderSeqStrip() {
  const strip = $('seqStrip');
  strip.replaceChildren();
  practice.sequence.slice(0, 64).forEach((n) => {
    const s = document.createElement('span');
    s.textContent = state.labels === 'degree' ? n.degree : midiToName(n.midi);
    s.title = placeName(n);
    strip.appendChild(s);
  });
}

function renderSeqProgress() {
  const spans = $('seqStrip').children;
  const active = practice.mode !== 'explore';
  for (let i = 0; i < spans.length; i++) {
    spans[i].classList.toggle('current', active && i === practice.index);
    spans[i].classList.toggle('done', active && i < practice.index);
  }
}

setInterval(() => { if (practice.mode !== 'explore') $('sNpm').textContent = practice.notesPerMinute(); }, 1000);

// ---- devices ------------------------------------------------------------------------

async function refreshDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const fill = (sel, kind, fallback) => {
      const cur = sel.value;
      sel.replaceChildren(new Option(fallback, ''));
      devices.filter((d) => d.kind === kind).forEach((d, i) => sel.appendChild(new Option(d.label || `${kind} ${i + 1}`, d.deviceId)));
      sel.value = cur;
    };
    fill($('camSelect'), 'videoinput', 'Default camera');
    fill($('micSelect'), 'audioinput', t('audio.default'));
    fill($('setupCam'), 'videoinput', 'Default camera');
    fill($('setupMic'), 'audioinput', t('audio.default'));
  } catch { /* ignore */ }
}

async function startCamera(deviceId = $('camSelect').value) {
  try {
    await camera.start(deviceId);
    $('camToggle').classList.add('on');
    $('camToggle').textContent = '📷 Camera on';
    $('stage').classList.add('live');
    refreshDevices();
  } catch (e) {
    status(`Camera error: ${e.message}`);
  }
}

function stopCamera() {
  camera.stop();
  $('camToggle').classList.remove('on');
  $('camToggle').textContent = '📷 Camera';
  $('stage').classList.remove('live');
}

function renderAudioButton() {
  $('micToggle').classList.toggle('on', pitch.running);
  $('micToggle').textContent = t(pitch.running ? 'btn.audioOn' : 'btn.audio');
  if (!state.heard || !pitch.running) $('heardSub').textContent = t(pitch.running ? 'audio.listening' : 'audio.off');
}

async function startAudio(deviceId = $('micSelect').value, channel = $('micChannel').value) {
  try {
    await pitch.start(deviceId, channel);
    renderAudioButton();
    const ch = pitch.channelCount > 1 ? t('st.multi', { n: pitch.channelCount }) : t('st.mono');
    status(t('st.audioOn', { ch }));
    refreshDevices();
  } catch (e) {
    status(t('st.audioErr', { msg: e.message }));
  }
}

function stopAudio() {
  pitch.stop();
  state.heard = null;
  renderAudioButton();
}

function toggleCalibration() {
  if (camera.calibrating) { camera.cancelCalibration(); syncCalibBtn(); return; }
  if (!camera.running) { status('Start the camera first (📷 Camera).'); return; }
  stopPlay();
  camera.startCalibration();
  syncCalibBtn();
}

function syncCalibBtn() {
  const on = camera.calibrating;
  if ($('calibrate').classList.contains('active') === on) return;
  $('calibrate').classList.toggle('active', on);
  $('calibrate').innerHTML = on ? '✕ Cancel <kbd>Esc</kbd>' : '⌖ Calibrate <kbd>C</kbd>';
}
if (CAMERA_FEATURES) setInterval(syncCalibBtn, 300); // calibration finishes inside the camera loop

function initDevices() {
  if (!navigator.mediaDevices?.getUserMedia) {
    status(t('st.noMedia'));
    return;
  }
  refreshDevices();
  $('camToggle').onclick = () => (camera.running ? stopCamera() : startCamera());
  $('phCam').onclick = () => startCamera();
  $('camSelect').onchange = () => { if (camera.running) startCamera(); };
  $('calibrate').onclick = toggleCalibration;
  $('clearCalib').onclick = () => camera.clearCalibration();

  try { $('micChannel').value = localStorage.getItem('fretcoach.channel') || '0'; } catch { /* ignore */ }
  $('micToggle').onclick = () => (pitch.running ? stopAudio() : startAudio());
  $('micSelect').onchange = () => { if (pitch.running) startAudio(); };
  $('micChannel').onchange = (e) => {
    try { localStorage.setItem('fretcoach.channel', e.target.value); } catch { /* ignore */ }
    if (pitch.running) startAudio();
  };
  $('gate').oninput = (e) => { pitch.gate = +e.target.value; };
}

// ---- play along: count-in -> run ------------------------------------------------------

const countdown = { active: false, timers: [] };

function showCount(text, go) {
  const el = $('countdown');
  el.hidden = false;
  el.textContent = text;
  el.classList.toggle('go', !!go);
  el.classList.remove('pop');
  void el.offsetWidth; // restart the animation
  el.classList.add('pop');
}

function cancelCountdown() {
  countdown.timers.forEach(clearTimeout);
  countdown.timers = [];
  countdown.active = false;
  $('countdown').hidden = true;
}

// Three clicks at the practice tempo, then GO on the downbeat.
function countIn(onGo, goClick = true) {
  cancelCountdown();
  countdown.active = true;
  const beat = Math.max(350, Math.min(1000, 60000 / practice.bpm));
  ['3', '2', '1'].forEach((n, i) => {
    countdown.timers.push(setTimeout(() => { click(i === 0); showCount(n); }, i * beat));
  });
  countdown.timers.push(setTimeout(() => {
    countdown.active = false;
    showCount(getLang() === 'vi' ? 'ĐI!' : 'GO!', true);
    if (goClick) click(true);
    onGo();
  }, 3 * beat));
  countdown.timers.push(setTimeout(() => { $('countdown').hidden = true; }, 3 * beat + 700));
  renderHud();
}

function startPlay() {
  closeResults();
  stopDemo();
  if (practice.mode === 'explore') setMode(pitch.running ? 'ear' : 'metronome');
  if (practice.mode === 'camera' && !camera.mapper) { status('Finger mode needs the camera + neck calibration (C).'); return; }
  practice.stop();
  if (practice.mode === 'ear' && !pitch.running) status(t('st.needAudio'));
  // The metronome clicks its own first beat.
  countIn(() => {
    practice.play();
    status(t(practice.mode === 'metronome' ? 'st.goMetro' : 'st.go'));
  }, practice.mode !== 'metronome');
}

function stopPlay(quiet = false) {
  const was = practice.running || countdown.active || demo.active;
  cancelCountdown();
  stopDemo();
  practice.stop();
  if (was && !quiet) status(t('st.stopped'));
  renderHud();
}

// ---- listen: the app plays the sequence and lights each note ------------------------

const demo = { active: false, pending: false, index: -1, timers: [] };
const demoNote = (ahead) => (demo.active && demo.index >= 0 ? practice.sequence[demo.index + ahead] || null : null);

function stopDemo() {
  demo.timers.forEach(clearTimeout);
  demo.timers = [];
  demo.active = false;
  demo.pending = false;
  demo.index = -1;
}

function startListen() {
  if (demo.active || demo.pending) { stopPlay(); return; }
  stopPlay(true);
  const seq = practice.sequence;
  if (!seq.length) return;
  const gap = 60000 / Math.max(60, Math.min(140, practice.bpm));
  demo.pending = true;
  status(t('st.listen'));
  countIn(() => {
    demo.pending = false;
    demo.active = true;
    seq.forEach((n, i) => demo.timers.push(setTimeout(() => {
      demo.index = i;
      pluck(n.midi, 0.9);
      requestRender();
      renderHud();
    }, i * gap)));
    demo.timers.push(setTimeout(() => {
      stopDemo();
      status(t('st.yourTurn'));
      requestRender();
      renderHud();
    }, seq.length * gap + 400));
  }, false);
}

const togglePlay = () => (practice.running || countdown.active || demo.active ? stopPlay() : startPlay());

// ---- view: drawer, overlays, theme, language -----------------------------------------

// On narrow screens the drawer covers the lesson, so it starts closed there.
const narrow = () => innerWidth <= 1100;
function setDrawer(open, remember = true) {
  $('stage').classList.toggle('drawer-open', open);
  if (remember && !narrow()) try { localStorage.setItem('fretcoach.drawer', open ? 'open' : 'closed'); } catch { /* ignore */ }
}

const prefersDark = matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => document.documentElement.dataset.theme || (prefersDark.matches ? 'dark' : 'light');
function renderThemeButton() { $('themeBtn').textContent = currentTheme() === 'dark' ? '☀️' : '🌙'; }
function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('fretcoach.theme', next); } catch { /* ignore */ }
  renderThemeButton();
}

function renderLangButtons() {
  const other = getLang() === 'vi' ? 'EN' : 'VI';
  $('langBtn').textContent = other;
  $('setupLang').textContent = getLang() === 'vi' ? '🌐 English' : '🌐 Tiếng Việt';
}

// Re-render every translated piece in place (keeps audio running).
function toggleLang() {
  stopPlay(true);
  setLang(getLang() === 'vi' ? 'en' : 'vi');
  applyStatic();
  renderLangButtons();
  fillPatternSelects();
  refreshPositions();
  refreshDevices();
  renderLevels();
  renderBadges();
  renderAudioButton();
  renderSeqStrip();
  renderLessonCard();
  renderTempo();
  renderHud();
  status(modeHint(practice.mode));
}

function initView() {
  const stage = $('stage');
  let open = !narrow();
  try { open = open && localStorage.getItem('fretcoach.drawer') !== 'closed'; } catch { /* ignore */ }
  setDrawer(open, false);
  $('menuBtn').onclick = () => setDrawer(!stage.classList.contains('drawer-open'));
  $('playBtn').onclick = togglePlay;
  $('listenBtn').onclick = startListen;
  $('layersBtn').onclick = () => { $('layers').hidden = !$('layers').hidden; };
  $('lessonInfo').onclick = () => { $('lessonBody').hidden = !$('lessonBody').hidden; };
  $('themeBtn').onclick = toggleTheme;
  $('langBtn').onclick = toggleLang;
  $('setupLang').onclick = toggleLang;
  prefersDark.addEventListener('change', renderThemeButton);
  renderThemeButton();
  renderLangButtons();

  $('mirror').onchange = (e) => { camera.mirror = e.target.checked; };
  $('showHands').onchange = (e) => { camera.showHands = e.target.checked; };
  $('showGrid').onchange = (e) => { camera.showGrid = e.target.checked; };
  $('showShape').onchange = (e) => { camera.showShape = e.target.checked; };
  $('showFretboard').onchange = (e) => { $('fbPanel').hidden = !e.target.checked; syncFbHeight(); };

  // Keep the "press Space" hint above the fretboard panel (camera layout).
  const syncFbHeight = () => stage.style.setProperty('--fb-h', $('fbPanel').hidden ? '0px' : `${$('fbPanel').offsetHeight}px`);
  new ResizeObserver(syncFbHeight).observe($('fbPanel'));
}

// ---- first-run setup: ask for the guitar input, then go straight to a lesson ------------

function initSetup() {
  try { $('setupChannel').value = localStorage.getItem('fretcoach.channel') || '0'; } catch { /* ignore */ }
  const finish = () => {
    $('setup').hidden = true;
    openLesson(nextLessonId(lessonState.progress));
  };
  $('setupSkip').onclick = finish;
  $('setupStart').onclick = async () => {
    const channel = $('setupChannel').value;
    $('micChannel').value = channel;
    try { localStorage.setItem('fretcoach.channel', channel); } catch { /* ignore */ }
    if ($('setupCam').value) $('camSelect').value = $('setupCam').value;
    if ($('setupMic').value) $('micSelect').value = $('setupMic').value;
    finish();
    if (CAMERA_FEATURES && $('useCam').checked) await startCamera($('setupCam').value);
    if ($('useMic').checked) await startAudio($('setupMic').value, channel);
  };
}

// ---- keyboard ------------------------------------------------------------------------

document.addEventListener('keydown', (e) => {
  if (e.target.matches?.('input, select, textarea') || !$('setup').hidden) return;
  const k = e.key.toLowerCase();
  if (!$('results').hidden) {
    if (k === 'escape') closeResults();
    return; // Space / Enter press the focused result button
  }
  if (k === ' ') { e.preventDefault(); e.target.blur?.(); togglePlay(); }
  else if (k === 'c' && CAMERA_FEATURES) toggleCalibration();
  else if (k === 'escape') {
    if (camera.calibrating) toggleCalibration();
    else $('layers').hidden = true;
  }
  else if (k === 'm' && CAMERA_FEATURES) $('mirror').click();
  else if (k === 'f') $('showFretboard').click();
  else if (k === 'l') startListen();
  else if (e.key === 'ArrowRight' && practice.target) practice.advance();
});

// ---- boot ---------------------------------------------------------------------------------

applyStatic();
loadPrefs();
initControls();
initDevices();
initLearn();
initView();
initSetup();
renderBadges();
renderAudioButton();
renderTempo();
renderHud();
status(t('status.start'));
window.fretcoach = { state, practice, pitch, camera, lessonState }; // for debugging in devtools
