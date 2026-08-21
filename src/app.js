import {
  subjects, lessonList, getLesson, getUnitOf, getSubjectOf, getSubject, unitPool, totalExercises, worldOfUnit
} from './course/index.js';
import { labs, getLab, labState } from './labs.js';
import { createArena } from './arena-ui.js';
import { createCodex } from './codex-ui.js';
import * as fx from './juice.js';
import { BADGES, evaluate, tierRank } from './achievements.js';

const api = window.codingo;
const view = document.getElementById('view');
const modalRoot = document.getElementById('modal-root');
const modalBox = document.getElementById('modal-box');
const navEl = document.getElementById('nav');

const LESSON_SIZE = 6;
const HEART_REFILL_COST = 100;
const MAX_CROWNS = 3;
const LAB_CHALLENGE_XP = 15;

let S = null;          // persisted state
let pythonOK = false;
let appInfo = { version: '1.0.0' };
let session = null;    // active lesson run
let route = { view: 'home', arg: null };
let labRuntime = null; // { lab, s, raf, ... }

/* ============================================================== helpers */

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function dayKey(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function daysBetween(a, b) {
  const pa = new Date(a + 'T00:00:00');
  const pb = new Date(b + 'T00:00:00');
  return Math.round((pb - pa) / 86400000);
}

function fmtMinutes(seconds) {
  const m = Math.round(seconds / 60);
  if (m < 60) return m + ' min';
  return Math.floor(m / 60) + ' h ' + (m % 60) + ' min';
}

const PY_KEYWORDS = ['False','None','True','and','as','assert','async','await','break','class','continue','def','del','elif','else','except','finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield'];
const PY_BUILTINS = ['print','len','range','int','str','float','bool','list','dict','set','tuple','sum','min','max','sorted','abs','round','type','input','enumerate','zip','map','filter','open','super','isinstance','pow'];

// Tiny Python highlighter: one pass, so no token is ever painted twice.
const HL_RE = /(#[^\n]*)|("[^"\n]*"|'[^'\n]*')|(_{3,})|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

function hl(code) {
  const src = String(code);
  let out = '';
  let last = 0;
  let m;
  HL_RE.lastIndex = 0;
  while ((m = HL_RE.exec(src)) !== null) {
    const t = m[0];
    out += esc(src.slice(last, m.index));
    if (m[1]) out += '<span class="tok-com">' + esc(t) + '</span>';
    else if (m[2]) out += '<span class="tok-str">' + esc(t) + '</span>';
    else if (m[3]) out += '<span class="tok-blank">' + esc(t) + '</span>';
    else if (m[4]) out += '<span class="tok-num">' + esc(t) + '</span>';
    else if (PY_KEYWORDS.includes(t)) out += '<span class="tok-kw">' + esc(t) + '</span>';
    else if (PY_BUILTINS.includes(t)) out += '<span class="tok-fn">' + esc(t) + '</span>';
    else out += esc(t);
    last = m.index + t.length;
  }
  out += esc(src.slice(last));
  return out;
}

function normText(s) {
  return String(s).replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
}

function normAnswer(s) {
  return String(s).trim().replace(/\s+/g, ' ');
}

/* ================================================================ state */

async function initState() {
  S = await api.loadState();
  S.topics = S.topics || {};
  S.subjectStats = S.subjectStats || {};
  S.history = S.history || {};
  S.labs = S.labs || {};
  S.settings = Object.assign({ fontScale: 1, contrast: false, motion: true, sound: true }, S.settings || {});
  S.badges = S.badges || [];
  S.counters = Object.assign({ quick: 0, bestCombo: 0, labChallenges: 0 }, S.counters || {});
  S.gacha = Object.assign({
    owned: {}, team: [], pity: { since5: 0, since4: 0 }, pulls: 0, fiveStars: 0,
    tickets: 3, battles: { wins: 0, losses: 0 }, log: [], stolen: 0, xpBonus: 0
  }, S.gacha || {});
  S.arena = Object.assign({
    player: { id: 'me', name: 'You', rating: 1500, rd: 350, vol: 0.06, wins: 0, losses: 0, draws: 0, streak: 0, best: 1500 },
    pool: [], placements: 0, placed: false,
    season: { number: 1, startedAt: null },
    duels: [], solvedProblems: [], lastDrift: null
  }, S.arena || {});
  const t = today();
  if (S.lastActiveDay !== t) {
    S.xpToday = 0;
    S.hearts = S.maxHearts;   // hearts come back with a new day
  }
  applySettings();
  await save();
}

function save() {
  return api.saveState(S);
}

function applySettings() {
  const root = document.documentElement;
  root.style.setProperty('--font-scale', S.settings.fontScale);
  document.body.classList.toggle('contrast', !!S.settings.contrast);
  document.body.classList.toggle('no-motion', !S.settings.motion);
  fx.setMuted(!S.settings.sound);
  fx.setReducedMotion(!S.settings.motion);
}

/* --------------------------------------------------------------- badges */

function badgeContext(flags) {
  const answers = Object.values(S.history).reduce((n, h) => n + h.correct + h.wrong, 0);
  const correct = Object.values(S.history).reduce((n, h) => n + h.correct, 0);
  return {
    flags: flags || {},
    lessonsDone: lessonList.filter((l) => lessonProgress(l.id).crowns > 0).length,
    subjectsTouched: subjects.filter((s) => subjectDone(s) > 0).length,
    labChallenges: labs.reduce((n, l) => n + labProgress(l.id).done.length, 0),
    labsCleared: labsCleared(),
    labsTotal: labs.length,
    answers,
    accuracy: answers ? Math.round((correct / answers) * 100) : 0,
    tierRank: S.arena.placed && S.arena.lastTier ? tierRank(S.arena.lastTier) : 99
  };
}

/** Called after anything that could unlock a badge. Awards, celebrates, saves. */
async function checkBadges(flags) {
  const fresh = evaluate(S, badgeContext(flags));
  if (!fresh.length) return [];
  S.badges = (S.badges || []).concat(fresh.map((b) => b.id));
  S.gems += fresh.length * 20;
  await save();
  paintTopbar();
  fresh.forEach((b, i) => setTimeout(() => {
    fx.play('badge');
    fx.confetti(50);
    badgeToast(b);
  }, i * 900));
  return fresh;
}

function badgeToast(badge) {
  const el = document.createElement('div');
  el.className = 'badge-toast';
  el.innerHTML = `
    <div class="bt-icon">${esc(badge.icon)}</div>
    <div>
      <div class="bt-kicker">Badge unlocked &middot; +20 gems</div>
      <div class="bt-name">${esc(badge.name)}</div>
      <div class="bt-desc">${esc(badge.desc)}</div>
    </div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 400); }, 3400);
}

function lessonProgress(id) {
  return S.lessons[id] || { crowns: 0, completions: 0, bestAccuracy: 0 };
}

function topicStat(id) {
  return S.topics[id] || { seen: 0, correct: 0 };
}

function subjectStat(id) {
  return S.subjectStats[id] || { xp: 0, correct: 0, wrong: 0, seconds: 0, lessons: 0 };
}

function historyFor(day) {
  return S.history[day] || { xp: 0, correct: 0, wrong: 0, seconds: 0, lessons: 0, labs: 0 };
}

function isUnlocked(lesson) {
  if (lesson.orderInSubject === 0) return true;
  const subject = getSubject(lesson.subjectId);
  const prev = subject.lessons[lesson.orderInSubject - 1];
  return lessonProgress(prev.id).crowns > 0;
}

function worldIndex(id) {
  return ['sands', 'lagoon', 'steppes', 'ascent', 'apex'].indexOf(id);
}

function unitCrowns(unit) {
  return unit.lessons.reduce((n, l) => n + lessonProgress(l.id).crowns, 0);
}

function subjectDone(subject) {
  return subject.lessons.filter((l) => lessonProgress(l.id).crowns > 0).length;
}

function subjectAccuracy(subjectId) {
  const st = subjectStat(subjectId);
  const total = st.correct + st.wrong;
  return total ? Math.round((st.correct / total) * 100) : 0;
}

function firstOpenLesson(subjectId) {
  const pool = subjectId ? getSubject(subjectId).lessons : lessonList;
  for (const l of pool) {
    if (isUnlocked(l) && lessonProgress(l.id).crowns === 0) return l.id;
  }
  return pool[pool.length - 1].id;
}

function labProgress(id) {
  return S.labs[id] || { done: [], runs: 0, seconds: 0 };
}

function labsCleared() {
  return labs.filter((l) => labProgress(l.id).done.length >= l.challenges.length).length;
}

// Every answer feeds the live dashboard, the streak of the day, and topic mastery.
function recordAnswer(lesson, correct, seconds) {
  const day = today();
  const h = historyFor(day);
  const st = subjectStat(lesson.subjectId);
  const tp = topicStat(lesson.id);

  tp.seen += 1;
  if (correct) tp.correct += 1;
  S.topics[lesson.id] = tp;

  if (correct) { h.correct += 1; st.correct += 1; } else { h.wrong += 1; st.wrong += 1; }
  h.seconds += seconds;
  st.seconds += seconds;

  S.history[day] = h;
  S.subjectStats[lesson.subjectId] = st;
}

function recordXp(subjectId, xp) {
  const day = today();
  const h = historyFor(day);
  h.xp += xp;
  S.history[day] = h;
  if (subjectId) {
    const st = subjectStat(subjectId);
    st.xp += xp;
    S.subjectStats[subjectId] = st;
  }
  S.xp += xp;
  S.xpToday += xp;
}

function bumpStat(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
}

function paintTopbar() {
  document.getElementById('v-streak').textContent = S.streak;
  document.getElementById('v-gems').textContent = S.gems;
  document.getElementById('v-hearts').textContent = S.hearts;
  document.getElementById('v-xp').textContent = S.xp;
  navEl.querySelectorAll('.nav-btn').forEach((b) => {
    const on = b.dataset.view === route.view
      || (route.view === 'path' && b.dataset.view === 'home')
      || (route.view === 'lab' && b.dataset.view === 'labs')
      || (route.view === 'ladder' && b.dataset.view === 'arena');
    b.classList.toggle('active', on);
  });
}

function touchStreak() {
  const t = today();
  if (S.lastActiveDay === t) return;
  if (S.lastActiveDay && daysBetween(S.lastActiveDay, t) === 1) S.streak += 1;
  else S.streak = 1;
  S.lastActiveDay = t;
}

/* ================================================================ router */

function go(viewName, arg) {
  if (labRuntime) { cancelAnimationFrame(labRuntime.raf); labRuntime = null; }
  if (arenaUi) arenaUi.leave();
  if (codexUi) codexUi.leave();
  route = { view: viewName, arg: arg || null };
  paintTopbar();
  paintTitle();
  if (viewName === 'home') renderHome();
  else if (viewName === 'path') renderPath(arg);
  else if (viewName === 'labs') renderLabs();
  else if (viewName === 'lab') renderLab(arg);
  else if (viewName === 'arena') arenaUi.renderArena();
  else if (viewName === 'ladder') arenaUi.renderLadder();
  else if (viewName === 'codex') codexUi.render();
  else if (viewName === 'progress') renderProgress();
  else if (viewName === 'sdg') renderSdg();
  view.scrollTop = 0;
}

navEl.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.onclick = () => {
    if (session && !confirmLeave()) return;
    go(btn.dataset.view);
  };
});

function confirmLeave() {
  if (!session || session.answered === 0) { session = null; return true; }
  quitLesson();
  return false;
}

/* ================================================================ modal */

function openModal(html, wire) {
  modalBox.innerHTML = html;
  modalRoot.classList.remove('hidden');
  if (wire) wire(modalBox);
}

function closeModal() {
  modalRoot.classList.add('hidden');
  modalBox.innerHTML = '';
}

modalRoot.addEventListener('click', (e) => {
  if (e.target.dataset.close) closeModal();
});

function settingsModal() {
  const done = lessonList.filter((l) => lessonProgress(l.id).crowns > 0).length;
  const crowns = lessonList.reduce((n, l) => n + lessonProgress(l.id).crowns, 0);
  openModal(`
    <h2>Settings</h2>
    <p>Codingo &mdash; STEM and coding, one tap at a time.</p>
    <div class="setting"><span class="k">Lessons complete</span><span class="v">${done} / ${lessonList.length}</span></div>
    <div class="setting"><span class="k">Crowns earned</span><span class="v">${crowns} / ${lessonList.length * MAX_CROWNS}</span></div>
    <div class="setting"><span class="k">Labs cleared</span><span class="v">${labsCleared()} / ${labs.length}</span></div>
    <div class="setting"><span class="k">Python interpreter</span><span class="v">${pythonOK ? esc(appInfo.python || 'found') : '<button class="mini-btn" data-act="python">not found — check again</button>'}</span></div>
    <div class="setting"><span class="k">Version</span><span class="v">${esc(appInfo.version)}</span></div>
    <div class="setting"><span class="k">Daily goal</span><span class="v"><button class="mini-btn" data-act="goal">${S.dailyGoal} XP</button></span></div>
    <div class="setting"><span class="k">Text size</span><span class="v"><button class="mini-btn" data-act="font">${Math.round(S.settings.fontScale * 100)}%</button></span></div>
    <div class="setting"><span class="k">High contrast</span><span class="v"><button class="mini-btn" data-act="contrast">${S.settings.contrast ? 'on' : 'off'}</button></span></div>
    <div class="setting"><span class="k">Animations</span><span class="v"><button class="mini-btn" data-act="motion">${S.settings.motion ? 'on' : 'reduced'}</button></span></div>
    <div class="setting"><span class="k">Sound effects</span><span class="v"><button class="mini-btn" data-act="sound">${S.settings.sound ? 'on' : 'off'}</button></span></div>
    <div class="setting"><span class="k">Badges</span><span class="v">${(S.badges || []).length} / ${BADGES.length}</span></div>
    <div class="row">
      <button class="btn blue" data-act="export">Export report</button>
      <button class="btn red" data-act="reset">Reset</button>
    </div>
    <div class="row">
      <button class="btn ghost" data-act="shortcuts">Shortcuts</button>
      <button class="btn" data-close="1">Close</button>
    </div>
  `, (box) => {
    const rerun = async () => { await save(); applySettings(); settingsModal(); };
    box.querySelector('[data-act="shortcuts"]').onclick = shortcutsModal;
    const pyBtn = box.querySelector('[data-act="python"]');
    if (pyBtn) pyBtn.onclick = async () => {
      pyBtn.textContent = 'checking…';
      pythonOK = await api.recheckPython();
      appInfo = await api.appInfo();
      settingsModal();
      toast(pythonOK ? 'Python found — code exercises are on' : 'Still no Python interpreter');
    };
    box.querySelector('[data-act="goal"]').onclick = () => {
      const goals = [20, 50, 100, 200];
      S.dailyGoal = goals[(goals.indexOf(S.dailyGoal) + 1) % goals.length];
      rerun();
    };
    box.querySelector('[data-act="font"]').onclick = () => {
      const sizes = [1, 1.15, 1.3, 0.9];
      S.settings.fontScale = sizes[(sizes.indexOf(S.settings.fontScale) + 1) % sizes.length];
      rerun();
    };
    box.querySelector('[data-act="contrast"]').onclick = () => {
      S.settings.contrast = !S.settings.contrast;
      rerun();
    };
    box.querySelector('[data-act="motion"]').onclick = () => {
      S.settings.motion = !S.settings.motion;
      rerun();
    };
    box.querySelector('[data-act="sound"]').onclick = () => {
      S.settings.sound = !S.settings.sound;
      fx.setMuted(!S.settings.sound);
      if (S.settings.sound) fx.play('correct');
      rerun();
    };
    box.querySelector('[data-act="export"]').onclick = exportReport;
    box.querySelector('[data-act="reset"]').onclick = () => {
      openModal(`
        <h2>Reset everything?</h2>
        <p>This erases all XP, crowns, gems, lab results and your streak. It cannot be undone.</p>
        <div class="row">
          <button class="btn ghost" data-close="1">Cancel</button>
          <button class="btn red" data-act="yes">Erase</button>
        </div>
      `, (b2) => {
        b2.querySelector('[data-act="yes"]').onclick = async () => {
          S = await api.resetState();
          await initState();
          closeModal();
          paintTopbar();
          go('home');
        };
      });
    };
  });
}

document.getElementById('btn-settings').onclick = settingsModal;

function shortcutsModal() {
  const rows = [
    ['1 – 9', 'Pick an option, a word chip or a code line'],
    ['Enter', 'Check the answer, then continue'],
    ['Esc', 'Leave the lesson, or close a dialog'],
    ['Tab', 'Insert four spaces inside a code editor'],
    ['Ctrl + Enter', 'Run the code you have written'],
    ['Ctrl + +  /  Ctrl + -', 'Zoom the whole window in or out'],
    ['F11', 'Full screen']
  ];
  openModal(`
    <h2>Keyboard shortcuts</h2>
    <p>Everything in Codingo can be driven from the keyboard.</p>
    ${rows.map(([k, v]) => `<div class="setting"><span class="k"><kbd>${esc(k)}</kbd></span><span class="v shortcut-what">${esc(v)}</span></div>`).join('')}
    <div class="row"><button class="btn" data-close="1">Close</button></div>
  `);
}

async function exportReport() {
  const json = {
    generated: new Date().toISOString(),
    totals: {
      xp: S.xp,
      streak: S.streak,
      lessonsComplete: lessonList.filter((l) => lessonProgress(l.id).crowns > 0).length,
      lessonsAvailable: lessonList.length,
      labsCleared: labsCleared(),
      labsAvailable: labs.length
    },
    subjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      lessonsComplete: subjectDone(s),
      lessonsAvailable: s.lessons.length,
      accuracy: subjectAccuracy(s.id),
      minutes: Math.round(subjectStat(s.id).seconds / 60)
    })),
    topics: lessonList.filter((l) => topicStat(l.id).seen > 0).map((l) => ({
      lesson: l.title,
      subject: getSubjectOf(l.id).name,
      unit: getUnitOf(l.id).title,
      seen: topicStat(l.id).seen,
      correct: topicStat(l.id).correct,
      mastery: Math.round((topicStat(l.id).correct / topicStat(l.id).seen) * 100)
    })),
    labs: labs.map((l) => ({ lab: l.title, challengesDone: labProgress(l.id).done.length, challenges: l.challenges.length })),
    history: S.history
  };
  const rows = [['subject', 'unit', 'lesson', 'attempts', 'correct', 'mastery_percent']];
  json.topics.forEach((t) => rows.push([t.subject, t.unit, t.lesson, t.seen, t.correct, t.mastery]));
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');

  const res = await api.exportReport({ json, csv });
  if (res.canceled) return;
  openModal(res.ok
    ? `<h2>Report saved</h2><p>Written to <code>${esc(res.path)}</code>. Choose a .csv name next time to get the flat table instead.</p><div class="row"><button class="btn" data-close="1">OK</button></div>`
    : `<h2>Export failed</h2><p>${esc(res.error || 'Unknown error')}</p><div class="row"><button class="btn" data-close="1">OK</button></div>`);
}

/* ========================================================== home screen */

function renderHome() {
  session = null;
  paintTopbar();
  const goalPct = Math.min(100, Math.round((S.xpToday / S.dailyGoal) * 100));
  const h = historyFor(today());

  const cards = subjects.map((subject) => {
    const done = subjectDone(subject);
    const total = subject.lessons.length;
    const pct = Math.round((done / total) * 100);
    const acc = subjectAccuracy(subject.id);
    return `
      <button class="subject-card" data-subject="${subject.id}" style="--sc:${subject.color}">
        <div class="sc-icon">${esc(subject.icon)}</div>
        <div class="sc-body">
          <div class="sc-title">${esc(subject.name)}</div>
          <div class="sc-tag">${esc(subject.tagline)}</div>
          <div class="sc-bar"><div class="sc-fill" style="width:${pct}%"></div></div>
          <div class="sc-meta">${done}/${total} lessons${acc ? ' &middot; ' + acc + '% accuracy' : ''}</div>
        </div>
      </button>
    `;
  }).join('');

  view.innerHTML = `
    <div class="wrap">
      <div class="goal-card">
        <div class="goal-text">
          <div class="goal-title">Daily goal &mdash; ${S.xpToday} / ${S.dailyGoal} XP</div>
          <div class="goal-sub">${S.streak > 0 ? S.streak + ' day streak &middot; ' : ''}${h.correct + h.wrong} answers today &middot; ${fmtMinutes(h.seconds)} on task</div>
          <div class="goal-bar"><div class="goal-fill" style="width:${goalPct}%"></div></div>
        </div>
        <button class="btn" id="btn-continue">Continue</button>
      </div>

      ${pythonOK ? '' : `
        <div class="goal-card warn">
          <div class="goal-text">
            <div class="goal-title">No Python interpreter found</div>
            <div class="goal-sub">Write-code exercises and the Python sandbox are switched off. Install Python and restart Codingo.</div>
          </div>
        </div>`}

      <button class="arena-cta" id="btn-arena-cta">
        <div class="ac-left">
          <div class="ac-kicker">Ranked Arena &middot; Season ${S.arena.season.number}</div>
          <div class="ac-title">${S.arena.placed ? 'Queue a duel' : 'Play ' + (5 - S.arena.placements) + ' placement duels'}</div>
          <div class="ac-sub">Debug Duel &middot; 1-Shot Vibecode &middot; Rapid STEM &mdash; skill-matched opponents</div>
        </div>
        <div class="ac-right">${S.arena.placed ? Math.round(S.arena.player.rating) : '?'}<span>rating</span></div>
      </button>

      <div class="section-title">Subjects</div>
      <div class="subject-grid">${cards}</div>

      <div class="section-title">Jump into a lab</div>
      <div class="lab-strip">
        ${labs.map((l) => `
          <button class="lab-chip" data-lab="${l.id}" style="--sc:${l.color}">
            <span class="lab-chip-icon">${esc(l.icon)}</span>
            <span>
              <span class="lab-chip-title">${esc(l.title)}</span>
              <span class="lab-chip-meta">${labProgress(l.id).done.length}/${l.challenges.length} challenges</span>
            </span>
          </button>`).join('')}
      </div>
    </div>
  `;

  document.getElementById('btn-arena-cta').onclick = () => go('arena');
  view.querySelectorAll('[data-subject]').forEach((b) => { b.onclick = () => go('path', b.dataset.subject); });
  view.querySelectorAll('[data-lab]').forEach((b) => { b.onclick = () => go('lab', b.dataset.lab); });
  document.getElementById('btn-continue').onclick = () => {
    const id = firstOpenLesson(null);
    startLesson(id);
  };
}

/* ========================================================== path screen */

function renderPath(subjectId) {
  session = null;
  const subject = getSubject(subjectId) || subjects[0];
  paintTopbar();

  const parts = [`<div class="wrap">
    <button class="back-link" id="btn-back">&larr; All subjects</button>
    <div class="path-head" style="--sc:${subject.color}">
      <div class="ph-icon">${esc(subject.icon)}</div>
      <div>
        <div class="ph-title">${esc(subject.name)}</div>
        <div class="ph-sub">${esc(subject.tagline)} &middot; ${subjectDone(subject)}/${subject.lessons.length} lessons done</div>
      </div>
    </div>`];

  let lastWorld = null;
  subject.units.forEach((unit, ui) => {
    const crowns = unitCrowns(unit);
    const maxC = unit.lessons.length * MAX_CROWNS;

    const world = worldOfUnit(unit.id);
    if (world && world.id !== lastWorld) {
      lastWorld = world.id;
      const wLessons = subject.lessons.filter((l) => world.units.includes(l.unitId));
      const wDone = wLessons.filter((l) => lessonProgress(l.id).crowns > 0).length;
      parts.push(`
        <div class="world-banner" style="--wc:${world.color}">
          <div class="world-mark"></div>
          <div class="world-text">
            <div class="world-kicker">World ${worldIndex(world.id) + 1}</div>
            <div class="world-name">${esc(world.name)}</div>
            <div class="world-tag">${esc(world.tagline)}</div>
          </div>
          <div class="world-progress">
            <div class="world-ring" style="--p:${Math.round((wDone / wLessons.length) * 100)}">
              <span>${wDone}/${wLessons.length}</span>
            </div>
          </div>
        </div>`);
    }

    parts.push(`
      <div class="unit-header" style="background:${unit.color}">
        <div>
          <div class="u-kicker">Unit ${ui + 1} &middot; ${esc(unit.icon)}</div>
          <div class="u-title">${esc(unit.title)}</div>
          <div class="u-sub">${esc(unit.subtitle)}</div>
        </div>
        <div class="unit-crowns">${crowns} / ${maxC} crowns</div>
      </div>
      <div class="path">
    `);

    unit.lessons.forEach((lesson, li) => {
      const p = lessonProgress(lesson.id);
      const unlocked = isUnlocked(lesson);
      const isCurrent = unlocked && p.crowns === 0;
      const offsets = [0, 62, 88, 62, 0, -62, -88, -62];
      const dx = offsets[lesson.orderInSubject % offsets.length];
      const color = p.crowns > 0 ? unit.color : (unlocked ? '#dbe4f5' : '');
      const shadow = p.crowns > 0 ? 'inset 0 -6px 0 rgba(0,0,0,.22), 0 6px 0 rgba(0,0,0,.35)' : '0 6px 0 #9aa7bf';
      const cls = ['node'];
      if (!unlocked) cls.push('locked');
      if (p.crowns > 0) cls.push('done');
      if (isCurrent) cls.push('current');
      if (lesson.review) cls.push('review-node');
      const face = !unlocked ? '&#128274;' : (lesson.review ? '&#9878;' : (p.crowns >= MAX_CROWNS ? '&#9819;' : String(li + 1)));
      const mastery = topicStat(lesson.id);
      const rate = mastery.seen ? Math.round((mastery.correct / mastery.seen) * 100) : null;

      parts.push(`
        <div class="node-row" style="transform:translateX(${dx}px)">
          <div class="node-stack">
            ${isCurrent ? '<div class="start-bubble">START</div>' : ''}
            <button class="${cls.join(' ')}" data-lesson="${lesson.id}" ${unlocked ? '' : 'disabled'}
              style="${color ? 'background:' + color + ';' : ''}box-shadow:${shadow}">${face}</button>
            <div class="crown-row">${'&#9733;'.repeat(p.crowns)}</div>
            <div class="node-label">${esc(lesson.title)}${rate !== null ? `<span class="node-mastery">${rate}%</span>` : ''}</div>
          </div>
        </div>
      `);
    });

    parts.push(`</div>`);
  });

  parts.push(`</div>`);
  view.innerHTML = parts.join('');

  document.getElementById('btn-back').onclick = () => go('home');
  view.querySelectorAll('[data-lesson]').forEach((btn) => {
    btn.onclick = () => startLesson(btn.dataset.lesson);
  });
  const cur = view.querySelector('.node.current');
  if (cur) cur.scrollIntoView({ block: 'center' });
}

/* ============================================================== session */

function buildQueue(lesson) {
  let pool;
  if (lesson.review) pool = shuffle(unitPool(lesson.unitId));
  else pool = shuffle(lesson.exercises);
  if (!pythonOK) pool = pool.filter((ex) => ex.type !== 'code');
  const size = lesson.review ? (lesson.size || 8) : LESSON_SIZE;
  return pool.slice(0, Math.max(1, Math.min(size, pool.length)));
}

function startLesson(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson) return;
  if (S.hearts <= 0) { outOfHeartsModal(); return; }

  const queue = buildQueue(lesson);
  if (!queue.length) {
    openModal(`<h2>Nothing to practise</h2><p>This lesson only holds write-code challenges and no Python interpreter was found.</p><div class="row"><button class="btn" data-close="1">OK</button></div>`);
    return;
  }

  route = { view: 'lesson', arg: lessonId };
  paintTopbar();
  session = {
    lesson,
    queue,
    total: queue.length,
    pos: 0,
    answered: 0,
    correct: 0,
    mistakes: 0,
    xpEarned: 0,
    combo: 0,
    bestCombo: 0,
    quickAnswers: 0,
    startedAt: Date.now(),
    markAt: Date.now(),
    state: 'answering',
    ex: null,
    ui: {}
  };
  renderExercise();
}

function quitLesson() {
  if (!session || session.answered === 0) { session = null; go('home'); return; }
  const subjectId = session.lesson.subjectId;
  openModal(`
    <h2>Leave the lesson?</h2>
    <p>Answers you have already given stay in your progress, but this lesson will not count as complete.</p>
    <div class="row">
      <button class="btn" data-close="1">Keep going</button>
      <button class="btn red" data-act="quit">Quit</button>
    </div>
  `, (box) => {
    box.querySelector('[data-act="quit"]').onclick = () => { closeModal(); session = null; go('path', subjectId); };
  });
}

function outOfHeartsModal() {
  const canBuy = S.gems >= HEART_REFILL_COST;
  openModal(`
    <h2>You are out of hearts</h2>
    <p>Hearts come back tomorrow, or refill them now for ${HEART_REFILL_COST} gems. You hold ${S.gems}. Labs never cost hearts, so that is another way to keep going.</p>
    <div class="row">
      <button class="btn ghost" data-act="labs">Open labs</button>
      <button class="btn ${canBuy ? '' : 'ghost'}" data-act="buy" ${canBuy ? '' : 'disabled'}>Refill</button>
    </div>
  `, (box) => {
    box.querySelector('[data-act="labs"]').onclick = () => { closeModal(); session = null; go('labs'); };
    const buy = box.querySelector('[data-act="buy"]');
    if (buy) buy.onclick = async () => {
      if (S.gems < HEART_REFILL_COST) return;
      S.gems -= HEART_REFILL_COST;
      S.hearts = S.maxHearts;
      await save();
      paintTopbar();
      closeModal();
      if (session) renderExercise(); else go('home');
    };
  });
}

/* ==================================================== exercise rendering */

function comboMultiplier(combo) {
  if (combo >= 8) return 2;
  if (combo >= 5) return 1.5;
  if (combo >= 3) return 1.2;
  return 1;
}

function lessonChrome(inner) {
  const pct = Math.round((session.pos / session.total) * 100);
  const acc = session.answered ? Math.round((session.correct / session.answered) * 100) : 100;
  const mult = comboMultiplier(session.combo);
  return `
    <div class="lesson-top">
      <button class="quit" id="btn-quit" title="Quit">&times;</button>
      <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="live-chip combo ${mult > 1 ? 'hot' : ''}" id="chip-combo" title="Answer correctly in a row to raise the XP multiplier">&#9889; x${mult}</div>
      <div class="live-chip" title="Live accuracy this lesson">${acc}%</div>
      <div class="live-chip xp" title="XP earned this lesson">+${session.xpEarned}</div>
      <div class="hearts-live">&#9829; ${S.hearts}</div>
    </div>
    <div class="lesson-body">${inner}</div>
    <div class="footer" id="footer">
      <div class="footer-inner">
        <div class="footer-msg" id="footer-msg"></div>
        <button class="btn" id="btn-primary" disabled>Check</button>
      </div>
    </div>
  `;
}

function renderExercise() {
  const ex = session.queue[session.pos];
  session.ex = ex;
  session.state = 'answering';
  session.ui = {};
  session.markAt = Date.now();

  let body = '';
  if (ex.type === 'mcq' || ex.type === 'output') body = viewChoice(ex);
  else if (ex.type === 'blank') body = viewBlank(ex);
  else if (ex.type === 'type') body = viewType(ex);
  else if (ex.type === 'numeric') body = viewNumeric(ex);
  else if (ex.type === 'order') body = viewOrder(ex);
  else if (ex.type === 'match') body = viewMatch(ex);
  else if (ex.type === 'bug') body = viewBug(ex);
  else if (ex.type === 'code') body = viewCode(ex);
  else body = `<div class="prompt">Unsupported exercise</div>`;

  view.innerHTML = lessonChrome(body);
  view.scrollTop = 0;

  document.getElementById('btn-quit').onclick = quitLesson;
  document.getElementById('btn-primary').onclick = onPrimary;

  if (ex.type === 'mcq' || ex.type === 'output') wireChoice(ex);
  else if (ex.type === 'blank') wireBlank(ex);
  else if (ex.type === 'type' || ex.type === 'numeric') wireType(ex);
  else if (ex.type === 'order') wireOrder(ex);
  else if (ex.type === 'match') wireMatch(ex);
  else if (ex.type === 'bug') wireBug(ex);
  else if (ex.type === 'code') wireCode(ex);
}

function primary() { return document.getElementById('btn-primary'); }
function setPrimary(label, enabled) {
  const b = primary();
  if (!b) return;
  b.textContent = label;
  b.disabled = !enabled;
}

/* ------------------------------------------------------ choice / output */

function viewChoice(ex) {
  const isOut = ex.type === 'output';
  const heading = ex.q || (isOut ? 'What does this print?' : '');
  const codeBlock = ex.code ? `<pre class="code">${hl(ex.code)}</pre>` : '';
  // Options are authored correct-answer-first, so shuffle them on the way in.
  const order = shuffle(ex.options.map((_o, i) => i));
  const opts = order.map((orig, slot) => {
    const o = ex.options[orig];
    return `
    <button class="option" data-i="${orig}">
      <span class="option-key">${slot + 1}</span>
      <span class="${isOut || /[()"']/.test(o) ? 'mono' : ''}">${esc(o)}</span>
    </button>`;
  }).join('');
  return `<div class="prompt">${esc(heading)}</div>${codeBlock}<div class="options">${opts}</div>`;
}

function wireChoice() {
  session.ui.pick = null;
  view.querySelectorAll('.option').forEach((btn) => {
    btn.onclick = () => {
      if (session.state !== 'answering') return;
      view.querySelectorAll('.option').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      session.ui.pick = Number(btn.dataset.i);
      setPrimary('Check', true);
    };
  });
  setPrimary('Check', false);
}

function gradeChoice(ex) {
  const ok = session.ui.pick === ex.answer;
  view.querySelectorAll('.option').forEach((b) => {
    const i = Number(b.dataset.i);
    b.classList.add('disabled');
    if (i === ex.answer) b.classList.add('right');
    else if (i === session.ui.pick) b.classList.add('wrong');
  });
  return { ok, correctText: ex.options[ex.answer] };
}

/* ---------------------------------------------------------------- blank */

function viewBlank(ex) {
  const segments = ex.code.split(/_{3,}/);
  let html = '';
  segments.forEach((seg, i) => {
    html += hl(seg);
    if (i < segments.length - 1) html += `<span class="slot empty" data-slot="${i}">&nbsp;</span>`;
  });
  const bank = shuffle(ex.bank).map((w, i) => `<button class="chip" data-word="${esc(w)}" data-ci="${i}">${esc(w)}</button>`).join('');
  return `
    <div class="prompt">${esc(ex.q)}</div>
    <div class="bank-slotline">${html}</div>
    <div class="bank">${bank}</div>
  `;
}

function wireBlank(ex) {
  session.ui.slots = new Array(ex.answer.length).fill(null);
  session.ui.used = new Set();
  session.ui.slotSrc = {};

  const repaint = () => {
    view.querySelectorAll('.slot').forEach((el, i) => {
      const val = session.ui.slots[i];
      el.textContent = val === null ? ' ' : val;
      el.classList.toggle('empty', val === null);
      el.classList.toggle('active', val === null && session.ui.slots.slice(0, i).every((v) => v !== null));
    });
    view.querySelectorAll('.chip').forEach((c) => {
      c.classList.toggle('used', session.ui.used.has(Number(c.dataset.ci)));
    });
    setPrimary('Check', session.ui.slots.every((v) => v !== null));
  };

  view.querySelectorAll('.chip').forEach((chip) => {
    chip.onclick = () => {
      if (session.state !== 'answering') return;
      const ci = Number(chip.dataset.ci);
      if (session.ui.used.has(ci)) return;
      const free = session.ui.slots.indexOf(null);
      if (free === -1) return;
      session.ui.slots[free] = chip.dataset.word;
      session.ui.slotSrc[free] = ci;
      session.ui.used.add(ci);
      repaint();
    };
  });

  view.querySelectorAll('.slot').forEach((slot) => {
    slot.onclick = () => {
      if (session.state !== 'answering') return;
      const i = Number(slot.dataset.slot);
      if (session.ui.slots[i] === null) return;
      session.ui.used.delete(session.ui.slotSrc[i]);
      session.ui.slots[i] = null;
      repaint();
    };
  });

  repaint();
}

function gradeBlank(ex) {
  const ok = session.ui.slots.every((v, i) => v === ex.answer[i]);
  return { ok, correctText: ex.answer.join('  ,  ') };
}

/* ------------------------------------------------------- type / numeric */

function viewType(ex) {
  return `
    <div class="prompt">${esc(ex.q)}</div>
    ${ex.code ? `<pre class="code">${hl(ex.code)}</pre>` : ''}
    <input class="type-input" id="type-in" spellcheck="false" autocomplete="off"
      placeholder="${ex.type === 'numeric' ? 'Type a number' : 'Type your answer'}">
    ${ex.type === 'numeric' && ex.tol ? `<div class="sub-prompt">Anything within ${ex.tol} counts as correct.</div>` : ''}
  `;
}

function viewNumeric(ex) { return viewType(ex); }

function wireType() {
  const input = document.getElementById('type-in');
  input.focus();
  input.oninput = () => setPrimary('Check', input.value.trim().length > 0);
  input.onkeydown = (e) => {
    if (e.key === 'Enter' && !primary().disabled) { e.preventDefault(); onPrimary(); }
  };
  setPrimary('Check', false);
}

function gradeType(ex) {
  const el = document.getElementById('type-in');
  const raw = el.value;
  el.disabled = true;

  if (ex.type === 'numeric') {
    const num = Number(String(raw).replace(/[^0-9.eE+-]/g, ''));
    const ok = Number.isFinite(num) && Math.abs(num - ex.answer) <= (ex.tol || 0);
    return { ok, correctText: String(ex.answer) };
  }
  const given = ex.caseSensitive ? normAnswer(raw) : normAnswer(raw).toLowerCase();
  const ok = ex.answer.some((a) => {
    const want = ex.caseSensitive ? normAnswer(a) : normAnswer(a).toLowerCase();
    return want === given;
  });
  return { ok, correctText: ex.answer[0] };
}

/* ---------------------------------------------------------------- order */

function viewOrder(ex) {
  const pool = shuffle(ex.lines.map((l, i) => ({ l, i })));
  session.ui.pool = pool;
  const chips = pool.map((p, pi) =>
    `<button class="order-item" draggable="true" data-pool="${pi}"><span class="idx">&#8942;</span>${esc(p.l)}</button>`).join('');
  return `
    <div class="prompt">${esc(ex.q)}</div>
    <div class="sub-prompt">Tap a line to move it, or drag to reorder.</div>
    <div class="order-zone-label">Your answer</div>
    <div class="order-list drop-zone" id="order-answer"></div>
    <div class="order-zone-label">Available lines</div>
    <div class="order-list order-pool drop-zone" id="order-pool">${chips}</div>
  `;
}

function wireOrder(ex) {
  session.ui.answer = [];
  const poolEl = document.getElementById('order-pool');
  const ansEl = document.getElementById('order-answer');

  // Drop index is worked out from where the pointer is relative to each row.
  const dropIndexAt = (container, y) => {
    const rows = Array.from(container.querySelectorAll('.order-item'));
    for (let i = 0; i < rows.length; i++) {
      const box = rows[i].getBoundingClientRect();
      if (y < box.top + box.height / 2) return i;
    }
    return rows.length;
  };

  const repaint = () => {
    ansEl.innerHTML = session.ui.answer.map((pi, k) => {
      const p = session.ui.pool[pi];
      return `<button class="order-item" draggable="true" data-ans="${k}"><span class="idx">${k + 1}</span>${esc(p.l)}</button>`;
    }).join('');
    poolEl.querySelectorAll('.order-item').forEach((el) => {
      el.style.display = session.ui.answer.includes(Number(el.dataset.pool)) ? 'none' : '';
    });
    ansEl.querySelectorAll('[data-ans]').forEach((el) => {
      el.onclick = () => {
        if (session.state !== 'answering') return;
        session.ui.answer.splice(Number(el.dataset.ans), 1);
        repaint();
      };
      el.ondragstart = (e) => {
        session.ui.drag = { from: 'answer', index: Number(el.dataset.ans) };
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', el.dataset.ans);
      };
      el.ondragend = () => el.classList.remove('dragging');
    });
    setPrimary('Check', session.ui.answer.length === ex.lines.length);
  };

  poolEl.querySelectorAll('.order-item').forEach((el) => {
    el.onclick = () => {
      if (session.state !== 'answering') return;
      const pi = Number(el.dataset.pool);
      if (session.ui.answer.includes(pi)) return;
      session.ui.answer.push(pi);
      repaint();
    };
    el.ondragstart = (e) => {
      session.ui.drag = { from: 'pool', pi: Number(el.dataset.pool) };
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', el.dataset.pool);
    };
    el.ondragend = () => el.classList.remove('dragging');
  });

  [ansEl, poolEl].forEach((zone) => {
    zone.ondragover = (e) => {
      if (session.state !== 'answering') return;
      e.preventDefault();
      zone.classList.add('drag-over');
    };
    zone.ondragleave = () => zone.classList.remove('drag-over');
    zone.ondrop = (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const drag = session.ui.drag;
      if (session.state !== 'answering' || !drag) return;

      if (zone === poolEl) {
        if (drag.from === 'answer') session.ui.answer.splice(drag.index, 1);
      } else {
        const at = dropIndexAt(ansEl, e.clientY);
        if (drag.from === 'pool') {
          if (!session.ui.answer.includes(drag.pi)) session.ui.answer.splice(at, 0, drag.pi);
        } else {
          const [moved] = session.ui.answer.splice(drag.index, 1);
          session.ui.answer.splice(at > drag.index ? at - 1 : at, 0, moved);
        }
      }
      session.ui.drag = null;
      repaint();
    };
  });

  repaint();
}

function gradeOrder(ex) {
  const given = session.ui.answer.map((pi) => session.ui.pool[pi].l);
  const ok = given.length === ex.lines.length && given.every((l, i) => l === ex.lines[i]);
  return { ok, correctText: '\n' + ex.lines.join('\n') };
}

/* ---------------------------------------------------------------- match */

function viewMatch(ex) {
  const left = shuffle(ex.pairs.map((p, i) => ({ text: p[0], i })));
  const right = shuffle(ex.pairs.map((p, i) => ({ text: p[1], i })));
  session.ui.matched = new Set();
  session.ui.sel = null;
  const col = (items, side) => items.map((it) =>
    `<button class="match-btn" data-side="${side}" data-pair="${it.i}">${esc(it.text)}</button>`).join('');
  return `
    <div class="prompt">${esc(ex.q)}</div>
    <div class="sub-prompt">Tap one on the left, then its partner on the right.</div>
    <div class="match-grid">
      <div class="order-list">${col(left, 'l')}</div>
      <div class="order-list">${col(right, 'r')}</div>
    </div>
  `;
}

function wireMatch(ex) {
  const btns = Array.from(view.querySelectorAll('.match-btn'));
  session.ui.matchWrong = 0;

  btns.forEach((btn) => {
    btn.onclick = () => {
      if (session.state !== 'answering') return;
      if (btn.classList.contains('ok')) return;
      const sel = session.ui.sel;

      if (!sel) {
        btns.forEach((b) => b.classList.remove('sel'));
        btn.classList.add('sel');
        session.ui.sel = btn;
        return;
      }
      if (sel === btn) { btn.classList.remove('sel'); session.ui.sel = null; return; }
      if (sel.dataset.side === btn.dataset.side) {
        btns.forEach((b) => b.classList.remove('sel'));
        btn.classList.add('sel');
        session.ui.sel = btn;
        return;
      }

      if (sel.dataset.pair === btn.dataset.pair) {
        sel.classList.remove('sel');
        sel.classList.add('ok');
        btn.classList.add('ok');
        session.ui.matched.add(btn.dataset.pair);
        session.ui.sel = null;
        if (session.ui.matched.size === ex.pairs.length) {
          setPrimary('Check', true);
          onPrimary();
        }
      } else {
        session.ui.matchWrong++;
        sel.classList.add('bad');
        btn.classList.add('bad');
        const a = sel, b = btn;
        setTimeout(() => { a.classList.remove('bad', 'sel'); b.classList.remove('bad'); }, 320);
        session.ui.sel = null;
      }
    };
  });

  setPrimary('Check', false);
}

function gradeMatch() {
  return { ok: session.ui.matchWrong === 0, correctText: 'every pair matched first time' };
}

/* --------------------------------------------------- click the bug line */

function viewBug(ex) {
  const lines = ex.lines.map((l, i) =>
    `<button class="bug-line" data-line="${i}"><span class="bug-num">${i + 1}</span><span class="bug-code">${hl(l)}</span></button>`).join('');
  return `
    <div class="prompt">${esc(ex.q || 'Click the line that holds the bug.')}</div>
    ${ex.brief ? `<div class="sub-prompt">${esc(ex.brief)}</div>` : ''}
    <div class="bug-block">${lines}</div>
  `;
}

function wireBug() {
  session.ui.pick = null;
  view.querySelectorAll('.bug-line').forEach((el) => {
    el.onclick = () => {
      if (session.state !== 'answering') return;
      view.querySelectorAll('.bug-line').forEach((x) => x.classList.remove('selected'));
      el.classList.add('selected');
      session.ui.pick = Number(el.dataset.line);
      setPrimary('Check', true);
    };
  });
  setPrimary('Check', false);
}

function gradeBug(ex) {
  const ok = session.ui.pick === ex.answer;
  view.querySelectorAll('.bug-line').forEach((el) => {
    const i = Number(el.dataset.line);
    el.classList.add('disabled');
    if (i === ex.answer) el.classList.add('right');
    else if (i === session.ui.pick) el.classList.add('wrong');
  });
  return { ok, correctText: 'line ' + (ex.answer + 1) + ':  ' + ex.lines[ex.answer].trim() };
}

/* ----------------------------------------------------------------- code */

function viewCode(ex) {
  return `
    <div class="prompt">${esc(ex.q)}</div>
    <div class="sub-prompt">Write real Python. It runs on your machine.${ex.expectOutput ? ' Expected output:' : ''}</div>
    ${ex.expectOutput ? `<pre class="code">${esc(ex.expectOutput)}</pre>` : ''}
    <textarea class="code-editor" id="code-in" spellcheck="false">${esc(ex.starter || '')}</textarea>
    <div class="run-row">
      <button class="btn blue" id="btn-run">Run</button>
      <span class="run-note">Tab inserts four spaces. Ctrl+Enter runs.</span>
    </div>
    <pre class="console hidden" id="console"></pre>
  `;
}

function wireCode(ex) {
  const ta = document.getElementById('code-in');
  const runBtn = document.getElementById('btn-run');
  const consoleEl = document.getElementById('console');
  ta.focus();
  ta.selectionStart = ta.value.length;

  ta.onkeydown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
      ta.selectionStart = ta.selectionEnd = s + 4;
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      runBtn.click();
    }
  };
  ta.oninput = () => setPrimary('Check', ta.value.trim().length > 0);

  runBtn.onclick = async () => {
    runBtn.disabled = true;
    runBtn.textContent = 'Running';
    const res = await api.runPython(ta.value, '', 6000);
    runBtn.disabled = false;
    runBtn.textContent = 'Run';
    consoleEl.classList.remove('hidden');
    consoleEl.innerHTML = consoleHtml(res);
  };

  setPrimary('Check', (ex.starter || '').trim().length > 0);
}

function consoleHtml(res) {
  const parts = [];
  if (res.stdout) parts.push(esc(res.stdout));
  if (res.stderr) parts.push('<span class="err">' + esc(res.stderr) + '</span>');
  return parts.length ? parts.join('') : '<span class="err">(no output)</span>';
}

async function gradeCode(ex) {
  const ta = document.getElementById('code-in');
  const consoleEl = document.getElementById('console');
  setPrimary('Checking', false);

  const res = await api.runPython(ta.value, '', 6000);
  consoleEl.classList.remove('hidden');
  consoleEl.innerHTML = consoleHtml(res);

  if (!res.ok && res.stderr) return { ok: false, correctText: 'a program that runs without errors' };
  const got = normText(res.stdout);
  const want = normText(ex.expectOutput || '');
  return { ok: got === want, correctText: want };
}

/* ================================================================ grade */

async function onPrimary() {
  if (!session) return;

  if (session.state === 'answering') {
    const ex = session.ex;
    let result;
    if (ex.type === 'mcq' || ex.type === 'output') result = gradeChoice(ex);
    else if (ex.type === 'blank') result = gradeBlank(ex);
    else if (ex.type === 'type' || ex.type === 'numeric') result = gradeType(ex);
    else if (ex.type === 'order') result = gradeOrder(ex);
    else if (ex.type === 'match') result = gradeMatch(ex);
    else if (ex.type === 'bug') result = gradeBug(ex);
    else if (ex.type === 'code') result = await gradeCode(ex);
    else result = { ok: false, correctText: '' };

    const seconds = Math.min(180, Math.round((Date.now() - session.markAt) / 1000));
    session.state = 'graded';
    session.answered++;

    if (result.ok) {
      session.correct++;
      session.combo++;
      session.bestCombo = Math.max(session.bestCombo, session.combo);
      const quick = seconds <= 8 && ex.type !== 'code';
      if (quick) session.quickAnswers++;
      const mult = comboMultiplier(session.combo);
      const gained = Math.round(2 * mult) + (quick ? 1 : 0);
      result.bonus = { mult, quick, gained };
      session.xpEarned += gained;
      recordXp(session.lesson.subjectId, gained);
      if (quick) S.counters.quick += 1;
      S.counters.bestCombo = Math.max(S.counters.bestCombo, session.combo);

      const anchor = view.querySelector('.option.right, .bug-line.right, .prompt');
      fx.play(mult > 1 ? 'combo' : 'correct', session.combo);
      fx.burstAt(anchor, { count: 14 + session.combo * 3, up: true, speed: 4 + mult });
      fx.floatText('+' + gained + ' XP', anchor, 'xp');
      if (mult >= 2) { fx.confetti(40); fx.slam('x2 COMBO', '#ffc800'); }
    } else {
      session.mistakes++;
      session.combo = 0;
      S.hearts = Math.max(0, S.hearts - 1);
      bumpStat('stat-hearts');
      fx.play('wrong');
      fx.shake('soft');
      fx.flash('rgba(255,75,75,.22)');
      fx.play('heart');
      session.queue.push(ex);           // a missed exercise returns at the end
      session.total = session.queue.length;
    }
    recordAnswer(session.lesson, result.ok, seconds);
    touchStreak();
    await save();
    paintTopbar();
    paintLiveChips();
    showFeedback(result, ex);
    checkBadges({ comboX2: session.combo >= 8 });
    return;
  }

  if (S.hearts <= 0) { outOfHeartsModal(); return; }
  session.pos++;
  if (session.pos >= session.queue.length) finishLesson();
  else renderExercise();
}

function paintLiveChips() {
  const combo = document.getElementById('chip-combo');
  const chips = view.querySelectorAll('.live-chip:not(.combo)');
  const acc = session.answered ? Math.round((session.correct / session.answered) * 100) : 100;
  if (combo) {
    const mult = comboMultiplier(session.combo);
    combo.innerHTML = '&#9889; x' + mult;
    combo.classList.toggle('hot', mult > 1);
    combo.classList.remove('pulse');
    void combo.offsetWidth;
    combo.classList.add('pulse');
  }
  if (chips[0]) {
    chips[0].textContent = acc + '%';
    chips[0].classList.toggle('low', acc < 60);
  }
  if (chips[1]) chips[1].textContent = '+' + session.xpEarned;
}

function showFeedback(result, ex) {
  const footer = document.getElementById('footer');
  const msg = document.getElementById('footer-msg');
  footer.classList.add(result.ok ? 'ok' : 'no');

  const praise = ['Nice.', 'Correct.', 'Exactly.', 'Got it.', 'Clean.'];
  let title = result.ok ? praise[Math.floor(Math.random() * praise.length)] : 'Not quite.';
  if (result.ok && result.bonus) {
    const bits = [];
    if (result.bonus.mult > 1) bits.push(session.combo + ' in a row, x' + result.bonus.mult);
    if (result.bonus.quick) bits.push('speed bonus');
    if (bits.length) title += ' <span class="bonus-tag">+' + result.bonus.gained + ' XP &middot; ' + bits.join(' &middot; ') + '</span>';
  }
  const answerLine = result.ok
    ? ''
    : `<div class="footer-why">Answer: <code>${esc(String(result.correctText)).replace(/\n/g, '<br>')}</code></div>`;
  const why = ex.explain ? `<div class="footer-why">${esc(ex.explain)}</div>` : '';

  msg.innerHTML = `<div class="footer-title">${title}</div>${answerLine}${why}`;
  const btn = primary();
  btn.className = 'btn' + (result.ok ? '' : ' red');
  setPrimary('Continue', true);
  btn.focus();

  const fill = view.querySelector('.progress-fill');
  if (fill) fill.style.width = Math.round(((session.pos + 1) / session.total) * 100) + '%';
}

/* ============================================================== finish */

function weakestTopics(limit) {
  return lessonList
    .map((l) => ({ lesson: l, st: topicStat(l.id) }))
    .filter((r) => r.st.seen >= 3 && r.st.correct / r.st.seen < 0.85)
    .sort((a, b) => (a.st.correct / a.st.seen) - (b.st.correct / b.st.seen))
    .slice(0, limit || 5);
}

function suggestedLab(subjectId) {
  return labs.find((l) => l.subject === subjectId && labProgress(l.id).done.length < l.challenges.length)
    || labs.find((l) => labProgress(l.id).done.length < l.challenges.length)
    || labs[0];
}

async function finishLesson() {
  const lesson = session.lesson;
  const unit = getUnitOf(lesson.id);
  const subject = getSubjectOf(lesson.id);
  const accuracy = Math.round((session.correct / Math.max(1, session.answered)) * 100);
  const perfect = session.mistakes === 0;

  const p = lessonProgress(lesson.id);
  const wasNew = p.crowns === 0;
  const crowns = Math.min(MAX_CROWNS, p.crowns + 1);

  let xp = lesson.review ? 20 : 10;
  if (perfect) xp += 5;
  if (wasNew) xp += 5;
  const teamBonus = Math.round(xp * ((S.gacha.xpBonus || 0) / 100));
  xp += teamBonus;
  const gems = perfect ? 15 : 5;
  grantTicket('lesson complete');

  S.lessons[lesson.id] = {
    crowns,
    completions: p.completions + 1,
    bestAccuracy: Math.max(p.bestAccuracy, accuracy)
  };
  recordXp(subject.id, xp);
  S.gems += gems;
  const day = today();
  const h = historyFor(day);
  h.lessons += 1;
  S.history[day] = h;
  const st = subjectStat(subject.id);
  st.lessons += 1;
  S.subjectStats[subject.id] = st;
  touchStreak();
  await save();
  paintTopbar();

  fx.play('complete');
  fx.confetti(perfect ? 160 : 80);
  if (perfect) setTimeout(() => fx.slam('FLAWLESS', '#58cc02'), 250);

  const minutes = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));
  const nextId = firstOpenLesson(subject.id);
  const weak = weakestTopics(1)[0];
  const lab = suggestedLab(subject.id);
  const goalPct = Math.min(100, Math.round((S.xpToday / S.dailyGoal) * 100));

  view.innerHTML = `
    <div class="center-screen">
      <div class="big-emoji">${perfect ? '&#9733;&#9733;&#9733;' : '&#9733;'}</div>
      <h1>${perfect ? 'Flawless lesson' : 'Lesson complete'}</h1>
      <p>${esc(subject.name)} &middot; ${esc(unit.title)} &middot; ${esc(lesson.title)} &middot; ${minutes} min</p>
      <div class="award-row">
        <div class="award xp"><div class="k">XP earned</div><div class="v">+${xp + session.xpEarned}</div>${teamBonus ? `<div class="award-note">incl. +${teamBonus} from your Codex team</div>` : ''}</div>
        <div class="award acc"><div class="k">Accuracy</div><div class="v">${accuracy}%</div></div>
        <div class="award crown"><div class="k">Crowns</div><div class="v">${crowns}/${MAX_CROWNS}</div></div>
        <div class="award"><div class="k">Best combo</div><div class="v">x${comboMultiplier(session.bestCombo)}</div></div>
        <div class="award"><div class="k">Speed bonuses</div><div class="v">${session.quickAnswers}</div></div>
      </div>

      <div class="coach">
        <div class="coach-title">What to do next</div>
        <div class="coach-line">Daily goal ${goalPct}% done (${S.xpToday}/${S.dailyGoal} XP).</div>
        ${weak
          ? `<div class="coach-line">Weakest topic so far: <b>${esc(weak.lesson.title)}</b> at ${Math.round((weak.st.correct / weak.st.seen) * 100)}% &mdash; <button class="link-btn" data-practice="${weak.lesson.id}">practise it</button>.</div>`
          : `<div class="coach-line">No weak topics yet. Keep the accuracy up.</div>`}
        <div class="coach-line">Try the <button class="link-btn" data-golab="${lab.id}">${esc(lab.title)}</button> lab to see this in action.</div>
      </div>

      <div class="award-row">
        <button class="btn ghost" id="btn-home">Back to path</button>
        <button class="btn" id="btn-next">Next lesson</button>
      </div>
    </div>
  `;
  document.getElementById('btn-home').onclick = () => { session = null; go('path', subject.id); };
  document.getElementById('btn-next').onclick = () => {
    if (S.hearts <= 0) { outOfHeartsModal(); return; }
    startLesson(nextId);
  };
  const practice = view.querySelector('[data-practice]');
  if (practice) practice.onclick = () => startLesson(practice.dataset.practice);
  const golab = view.querySelector('[data-golab]');
  if (golab) golab.onclick = () => { session = null; go('lab', golab.dataset.golab); };
  checkBadges({ flawless: perfect, comboX2: session.bestCombo >= 8 });
  session = null;
}

/* ============================================================ labs list */

function renderLabs() {
  const cards = labs.map((lab) => {
    const p = labProgress(lab.id);
    const cleared = p.done.length >= lab.challenges.length;
    const subject = getSubject(lab.subject);
    return `
      <button class="lab-card ${cleared ? 'cleared' : ''}" data-lab="${lab.id}" style="--sc:${lab.color}">
        <div class="lab-icon">${esc(lab.icon)}</div>
        <div class="lab-body">
          <div class="lab-title">${esc(lab.title)}${cleared ? ' <span class="tick">&#10003;</span>' : ''}</div>
          <div class="lab-subject">${esc(subject ? subject.name : lab.subject)}</div>
          <div class="lab-blurb">${esc(lab.blurb)}</div>
          <div class="lab-concepts">${lab.concepts.map((c) => `<span class="tag">${esc(c)}</span>`).join('')}</div>
          <div class="sc-bar"><div class="sc-fill" style="width:${Math.round((p.done.length / lab.challenges.length) * 100)}%"></div></div>
          <div class="sc-meta">${p.done.length}/${lab.challenges.length} challenges cleared</div>
        </div>
      </button>`;
  }).join('');

  view.innerHTML = `
    <div class="wrap">
      <div class="section-title">Virtual labs</div>
      <p class="section-note">
        Every lab is a live simulation, not a video. Move a control and the maths behind it recomputes
        immediately, the drawing redraws, and any challenge you have satisfied is marked and paid in XP.
        Labs never cost hearts, so experimenting is free.
      </p>
      <div class="lab-grid">${cards}</div>
    </div>
  `;
  view.querySelectorAll('[data-lab]').forEach((b) => { b.onclick = () => go('lab', b.dataset.lab); });
}

/* ============================================================= lab view */

function renderLab(labId) {
  const lab = getLab(labId);
  if (!lab) { go('labs'); return; }
  if (lab.code) { renderCodeLab(lab); return; }

  const s = labState(lab);
  const controls = lab.params.map((p) => {
    if (p.type === 'choice') {
      return `
        <div class="ctrl">
          <div class="ctrl-label">${esc(p.label)}</div>
          <div class="seg" data-key="${p.key}">
            ${p.options.map((o) => `<button class="seg-btn ${o === p.value ? 'on' : ''}" data-val="${esc(o)}">${esc(o)}</button>`).join('')}
          </div>
        </div>`;
    }
    return `
      <div class="ctrl">
        <div class="ctrl-label">${esc(p.label)} <span class="ctrl-val" id="val-${p.key}">${p.value}${p.unit ? ' ' + p.unit : ''}</span></div>
        <input type="range" class="slider" data-key="${p.key}" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}">
      </div>`;
  }).join('');

  view.innerHTML = `
    <div class="wrap wide">
      <button class="back-link" id="btn-back">&larr; All labs</button>
      <div class="lab-head" style="--sc:${lab.color}">
        <div class="lab-icon big">${esc(lab.icon)}</div>
        <div>
          <div class="ph-title">${esc(lab.title)}</div>
          <div class="ph-sub">${esc(lab.blurb)}</div>
          <div class="lab-concepts">${lab.concepts.map((c) => `<span class="tag">${esc(c)}</span>`).join('')}</div>
        </div>
      </div>

      <div class="lab-layout">
        <div class="lab-stage">
          <canvas id="lab-canvas" width="720" height="380"></canvas>
          <div class="readout" id="lab-readout"></div>
        </div>
        <div class="lab-side">
          <div class="panel">
            <div class="panel-title">Controls</div>
            ${controls}
          </div>
          <div class="panel">
            <div class="panel-title">Challenges</div>
            <div id="lab-challenges"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-back').onclick = () => go('labs');

  const canvas = document.getElementById('lab-canvas');
  const g = canvas.getContext('2d');
  const readoutEl = document.getElementById('lab-readout');
  const challengeEl = document.getElementById('lab-challenges');

  labRuntime = { lab, s, raf: 0, lastAward: 0 };

  const paintChallenges = (d) => {
    const p = labProgress(lab.id);
    challengeEl.innerHTML = lab.challenges.map((c) => {
      const done = p.done.includes(c.id);
      const live = !done && c.check(s, d);
      return `<div class="chal ${done ? 'done' : ''} ${live ? 'live' : ''}">
        <span class="chal-box">${done ? '&#10003;' : (live ? '&#9679;' : '')}</span>
        <span>${esc(c.text)}</span>
      </div>`;
    }).join('');
  };

  const awardIfSolved = async (d) => {
    const p = labProgress(lab.id);
    let gained = 0;
    lab.challenges.forEach((c) => {
      if (!p.done.includes(c.id) && c.check(s, d)) {
        p.done.push(c.id);
        gained += LAB_CHALLENGE_XP;
      }
    });
    if (!gained) return false;
    S.labs[lab.id] = p;
    recordXp(lab.subject, gained);
    S.gems += 5;
    const day = today();
    const h = historyFor(day);
    h.labs += 1;
    S.history[day] = h;
    touchStreak();
    await save();
    paintTopbar();
    bumpStat('stat-xp');
    fx.play('complete');
    fx.confetti(60);
    toast('Challenge cleared  +' + gained + ' XP');
    grantTicket('lab challenge');
    await save();
    checkBadges();
    return true;
  };

  const tick = () => {
    const d = lab.derive(s);
    lab.draw(g, canvas.width, canvas.height, s, d);
    readoutEl.innerHTML = lab.readout(s, d).map((r) =>
      `<div class="ro"><span class="ro-k">${esc(r.label)}</span><span class="ro-v">${esc(String(r.value))}</span></div>`).join('');
    paintChallenges(d);
    if (Date.now() - labRuntime.lastAward > 250) {
      labRuntime.lastAward = Date.now();
      awardIfSolved(d).then((won) => { if (won) paintChallenges(lab.derive(s)); });
    }
    labRuntime.raf = requestAnimationFrame(tick);
  };

  view.querySelectorAll('.slider').forEach((sl) => {
    sl.oninput = () => {
      s[sl.dataset.key] = Number(sl.value);
      const p = lab.params.find((q) => q.key === sl.dataset.key);
      const out = document.getElementById('val-' + sl.dataset.key);
      if (out) out.textContent = sl.value + (p.unit ? ' ' + p.unit : '');
    };
  });
  view.querySelectorAll('.seg').forEach((seg) => {
    seg.querySelectorAll('.seg-btn').forEach((b) => {
      b.onclick = () => {
        seg.querySelectorAll('.seg-btn').forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        s[seg.dataset.key] = b.dataset.val;
      };
    });
  });

  tick();
}

function renderCodeLab(lab) {
  const p = labProgress(lab.id);
  view.innerHTML = `
    <div class="wrap wide">
      <button class="back-link" id="btn-back">&larr; All labs</button>
      <div class="lab-head" style="--sc:${lab.color}">
        <div class="lab-icon big">${esc(lab.icon)}</div>
        <div>
          <div class="ph-title">${esc(lab.title)}</div>
          <div class="ph-sub">${esc(lab.blurb)}</div>
          <div class="lab-concepts">${lab.concepts.map((c) => `<span class="tag">${esc(c)}</span>`).join('')}</div>
        </div>
      </div>
      ${pythonOK ? '' : '<div class="goal-card warn"><div class="goal-text"><div class="goal-title">Python not found</div><div class="goal-sub">This sandbox needs a Python interpreter on the machine.</div></div></div>'}
      <div class="lab-layout">
        <div class="lab-stage">
          <textarea class="code-editor tall" id="lab-code" spellcheck="false">${esc(lab.starter)}</textarea>
          <div class="run-row">
            <button class="btn blue" id="btn-run" ${pythonOK ? '' : 'disabled'}>Run</button>
            <button class="btn" id="btn-check" ${pythonOK ? '' : 'disabled'}>Check challenges</button>
            <span class="run-note">Ctrl+Enter runs. Output is compared against every open challenge.</span>
          </div>
          <pre class="console" id="lab-console">Output appears here.</pre>
        </div>
        <div class="lab-side">
          <div class="panel">
            <div class="panel-title">Challenges</div>
            <div id="lab-challenges">
              ${lab.challenges.map((c) => `<div class="chal ${p.done.includes(c.id) ? 'done' : ''}">
                <span class="chal-box">${p.done.includes(c.id) ? '&#10003;' : ''}</span><span>${esc(c.text)}</span></div>`).join('')}
            </div>
          </div>
          <div class="panel">
            <div class="panel-title">How checking works</div>
            <p class="panel-note">Your program runs for real and its printed output is compared with each
            unsolved challenge. Solve them in any order &mdash; whichever one matches gets ticked.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-back').onclick = () => go('labs');
  const ta = document.getElementById('lab-code');
  const consoleEl = document.getElementById('lab-console');
  const runBtn = document.getElementById('btn-run');
  const checkBtn = document.getElementById('btn-check');

  ta.onkeydown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const a = ta.selectionStart, b = ta.selectionEnd;
      ta.value = ta.value.slice(0, a) + '    ' + ta.value.slice(b);
      ta.selectionStart = ta.selectionEnd = a + 4;
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      runBtn.click();
    }
  };

  const run = async () => {
    const res = await api.runPython(ta.value, '', 6000);
    consoleEl.innerHTML = consoleHtml(res);
    const prog = labProgress(lab.id);
    prog.runs += 1;
    S.labs[lab.id] = prog;
    return res;
  };

  runBtn.onclick = async () => {
    runBtn.disabled = true; runBtn.textContent = 'Running';
    await run();
    runBtn.disabled = false; runBtn.textContent = 'Run';
    await save();
  };

  checkBtn.onclick = async () => {
    checkBtn.disabled = true; checkBtn.textContent = 'Checking';
    const res = await run();
    const got = normText(res.stdout);
    const prog = labProgress(lab.id);
    let gained = 0;
    lab.challenges.forEach((c) => {
      if (!prog.done.includes(c.id) && got === normText(c.expect)) {
        prog.done.push(c.id);
        gained += LAB_CHALLENGE_XP;
      }
    });
    S.labs[lab.id] = prog;
    if (gained) {
      recordXp(lab.subject, gained);
      S.gems += 5;
      const h = historyFor(today());
      h.labs += 1;
      S.history[today()] = h;
      touchStreak();
      fx.play('complete');
      fx.confetti(60);
      toast('Challenge cleared  +' + gained + ' XP');
      checkBadges();
    } else {
      fx.play('wrong');
      toast('No challenge matches that output yet');
    }
    await save();
    paintTopbar();
    checkBtn.disabled = false; checkBtn.textContent = 'Check challenges';
    document.getElementById('lab-challenges').innerHTML = lab.challenges.map((c) =>
      `<div class="chal ${prog.done.includes(c.id) ? 'done' : ''}">
        <span class="chal-box">${prog.done.includes(c.id) ? '&#10003;' : ''}</span><span>${esc(c.text)}</span></div>`).join('');
  };
}

function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('in'), 10);
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 300); }, 2200);
}

/* ======================================================== progress view */

function barChart(rows, colour) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const w = 640, h = 150, pad = 22;
  const bw = (w - pad * 2) / rows.length;
  const bars = rows.map((r, i) => {
    const bh = (r.value / max) * (h - 46);
    const x = pad + i * bw;
    const y = h - 26 - bh;
    return `<rect x="${x + 2}" y="${y}" width="${bw - 6}" height="${Math.max(1, bh)}" rx="3" fill="${r.value ? colour : '#232c40'}"></rect>
      <text x="${x + bw / 2}" y="${h - 10}" text-anchor="middle" class="ch-label">${esc(r.label)}</text>
      ${r.value ? `<text x="${x + bw / 2}" y="${y - 5}" text-anchor="middle" class="ch-value">${r.value}</text>` : ''}`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" class="chart">${bars}</svg>`;
}

function donut(pct, colour, caption) {
  const r = 52, c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return `<svg viewBox="0 0 140 140" class="donut">
    <circle cx="70" cy="70" r="${r}" fill="none" stroke="#232c40" stroke-width="16"></circle>
    <circle cx="70" cy="70" r="${r}" fill="none" stroke="${colour}" stroke-width="16" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 70 70)"></circle>
    <text x="70" y="66" text-anchor="middle" class="donut-v">${pct}%</text>
    <text x="70" y="88" text-anchor="middle" class="donut-k">${esc(caption)}</text>
  </svg>`;
}

function renderProgress() {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const key = dayKey(-i);
    const h = historyFor(key);
    days.push({ label: key.slice(8), value: h.xp, key });
  }
  const totalCorrect = Object.values(S.history).reduce((n, h) => n + h.correct, 0);
  const totalWrong = Object.values(S.history).reduce((n, h) => n + h.wrong, 0);
  const totalSeconds = Object.values(S.history).reduce((n, h) => n + h.seconds, 0);
  const answers = totalCorrect + totalWrong;
  const accuracy = answers ? Math.round((totalCorrect / answers) * 100) : 0;
  const lessonsDone = lessonList.filter((l) => lessonProgress(l.id).crowns > 0).length;
  const coverage = Math.round((lessonsDone / lessonList.length) * 100);
  const activeDays = Object.keys(S.history).filter((k) => historyFor(k).correct + historyFor(k).wrong > 0).length;

  const subjectRows = subjects.map((s) => {
    const done = subjectDone(s);
    const pct = Math.round((done / s.lessons.length) * 100);
    const acc = subjectAccuracy(s.id);
    const st = subjectStat(s.id);
    return `
      <div class="mastery-row">
        <div class="mr-name" style="color:${s.color}">${esc(s.name)}</div>
        <div class="mr-bar"><div class="mr-fill" style="width:${pct}%;background:${s.color}"></div></div>
        <div class="mr-meta">${done}/${s.lessons.length} lessons &middot; ${acc}% accuracy &middot; ${fmtMinutes(st.seconds)}</div>
      </div>`;
  }).join('');

  const weak = weakestTopics(5);
  const weakHtml = weak.length ? weak.map((r) => {
    const pct = Math.round((r.st.correct / r.st.seen) * 100);
    return `<div class="weak-row">
      <div class="weak-name">${esc(r.lesson.title)}<span class="weak-sub">${esc(getSubjectOf(r.lesson.id).name)} &middot; ${esc(getUnitOf(r.lesson.id).title)}</span></div>
      <div class="weak-pct ${pct < 60 ? 'bad' : ''}">${pct}%</div>
      <button class="mini-btn" data-practice="${r.lesson.id}">Practise</button>
    </div>`;
  }).join('') : `<p class="panel-note">Nothing is lagging yet. A topic shows up here once you have answered it at least three times and are below 85%.</p>`;

  const labRows = labs.map((l) => {
    const p = labProgress(l.id);
    const pct = Math.round((p.done.length / l.challenges.length) * 100);
    return `<div class="mastery-row">
      <div class="mr-name" style="color:${l.color}">${esc(l.title)}</div>
      <div class="mr-bar"><div class="mr-fill" style="width:${pct}%;background:${l.color}"></div></div>
      <div class="mr-meta">${p.done.length}/${l.challenges.length} challenges &middot; ${p.runs || 0} runs</div>
    </div>`;
  }).join('');

  view.innerHTML = `
    <div class="wrap wide">
      <div class="section-title">Progress</div>
      <p class="section-note">Everything here updates the moment you answer a question or clear a lab challenge. Nothing leaves this machine unless you export it yourself.</p>

      <div class="kpi-row">
        <div class="kpi"><div class="k">Total XP</div><div class="v">${S.xp}</div></div>
        <div class="kpi"><div class="k">Day streak</div><div class="v">${S.streak}</div></div>
        <div class="kpi"><div class="k">Answers given</div><div class="v">${answers}</div></div>
        <div class="kpi"><div class="k">Time on task</div><div class="v">${fmtMinutes(totalSeconds)}</div></div>
        <div class="kpi"><div class="k">Active days</div><div class="v">${activeDays}</div></div>
        <div class="kpi"><div class="k">Labs cleared</div><div class="v">${labsCleared()}/${labs.length}</div></div>
      </div>

      <div class="panel-grid">
        <div class="panel">
          <div class="panel-title">XP over the last 14 days</div>
          ${barChart(days, '#58cc02')}
        </div>
        <div class="panel center">
          <div class="panel-title">Overall accuracy</div>
          ${donut(accuracy, accuracy >= 80 ? '#58cc02' : (accuracy >= 60 ? '#ffc800' : '#ff4b4b'), 'correct')}
          <div class="panel-note">${totalCorrect} right, ${totalWrong} wrong, out of ${totalExercises} authored exercises.</div>
        </div>
      </div>

      <div class="panel-grid">
        <div class="panel">
          <div class="panel-title">Subject mastery</div>
          ${subjectRows}
          <div class="panel-note">Course coverage: ${coverage}% of all ${lessonList.length} lessons.</div>
        </div>
        <div class="panel">
          <div class="panel-title">Needs another look</div>
          ${weakHtml}
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Virtual labs</div>
        ${labRows}
      </div>

      <div class="panel">
        <div class="panel-title">Badges &mdash; ${(S.badges || []).length} of ${BADGES.length}</div>
        <div class="badge-grid">
          ${BADGES.map((b) => {
            const owned = (S.badges || []).includes(b.id);
            return `<div class="badge ${owned ? 'owned' : 'locked'}" title="${esc(b.desc)}">
              <div class="badge-icon">${owned ? esc(b.icon) : '?'}</div>
              <div class="badge-name">${esc(b.name)}</div>
              <div class="badge-desc">${esc(b.desc)}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="row-actions">
        <button class="btn blue" id="btn-export">Export report</button>
        <button class="btn ghost" id="btn-goto-labs">Open labs</button>
      </div>
    </div>
  `;

  view.querySelectorAll('[data-practice]').forEach((b) => { b.onclick = () => startLesson(b.dataset.practice); });
  document.getElementById('btn-export').onclick = exportReport;
  document.getElementById('btn-goto-labs').onclick = () => go('labs');
}

/* ============================================================= sdg view */

function renderSdg() {
  const lessonsDone = lessonList.filter((l) => lessonProgress(l.id).crowns > 0).length;
  view.innerHTML = `
    <div class="wrap wide">
      <div class="section-title">Why this app is built the way it is</div>
      <p class="section-note">
        Codingo targets three UN Sustainable Development Goals. Each claim below points at a feature you can
        actually open, not a slogan.
      </p>

      <div class="sdg-card sdg4">
        <div class="sdg-num">SDG 4</div>
        <div class="sdg-body">
          <div class="sdg-title">Quality education</div>
          <p>Five subjects &mdash; coding, mathematics, physics, chemistry, biology &mdash; across ${lessonList.length}
          lessons and ${totalExercises} authored exercises, each with a written explanation that appears the moment
          you answer, right or wrong. Learning is active: you predict output, order steps, match ideas and write
          programs that really execute. Mastery is tracked per topic, and anything below 85% is surfaced for
          repractice instead of being quietly forgotten. You have completed ${lessonsDone} so far.</p>
        </div>
      </div>

      <div class="sdg-card sdg9">
        <div class="sdg-num">SDG 9</div>
        <div class="sdg-body">
          <div class="sdg-title">Industry, innovation and infrastructure</div>
          <p>Six virtual labs replace equipment a school may not own: a circuit bench, a projectile range, a
          titration bench, a quadratic grapher, a Punnett square and a Python sandbox wired to the interpreter on
          the machine. Every lab computes real physics, chemistry and maths live rather than replaying a video,
          so a student can run an experiment that would otherwise need a lab technician, glassware or a
          power supply. The coding track builds exactly the skills the goal asks countries to grow.</p>
        </div>
      </div>

      <div class="sdg-card sdg10">
        <div class="sdg-num">SDG 10</div>
        <div class="sdg-body">
          <div class="sdg-title">Reduced inequalities</div>
          <p>The whole platform runs offline on a modest desktop: no account, no sign-up, no subscription, no
          telemetry and no network calls at all, so a student with intermittent or metered internet loses nothing.
          Progress is stored in a local file the learner owns and can export as JSON or CSV for a teacher.
          Accessibility settings adjust text size to 130%, switch on a high-contrast palette, and reduce
          animation for anyone who finds movement distracting. Content assumes no paid textbook.</p>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Design decisions behind the claims</div>
        <div class="fact-row"><span class="fact-k">Network calls</span><span class="fact-v">none &mdash; the window has a strict content security policy and no remote assets</span></div>
        <div class="fact-row"><span class="fact-k">Account required</span><span class="fact-v">no &mdash; progress lives in a local JSON file</span></div>
        <div class="fact-row"><span class="fact-k">Feedback delay</span><span class="fact-v">immediate, with the reason for the right answer</span></div>
        <div class="fact-row"><span class="fact-k">Retry model</span><span class="fact-v">missed questions return later in the same lesson</span></div>
        <div class="fact-row"><span class="fact-k">Data export</span><span class="fact-v">JSON snapshot or a per-topic CSV table</span></div>
        <div class="fact-row"><span class="fact-k">Code execution</span><span class="fact-v">local Python, six second timeout, temporary working directory</span></div>
      </div>
    </div>
  `;
}

/* ================================================================ arena */

const arenaUi = createArena({
  esc, hl, view, api, toast, shuffle, today, lessonList, fx,
  state: () => S,
  save: () => save(),
  paintTopbar,
  recordXp,
  touchStreak,
  openModal,
  closeModal,
  checkBadges
});

const codexUi = createCodex({
  esc, view, api, toast, fx,
  state: () => S,
  save: () => save(),
  paintTopbar,
  openModal,
  closeModal,
  checkBadges
});

/** Focus tickets are the bridge: studying is the only way to earn a battle. */
function grantTicket(reason) {
  const g = S.gacha;
  if ((g.tickets || 0) >= codexUi.TICKET_MAX) return;
  g.tickets = (g.tickets || 0) + 1;
  toast('+1 focus ticket  (' + reason + ')');
}

/* =========================================================== keyboard */

document.addEventListener('keydown', (e) => {
  if (!modalRoot.classList.contains('hidden')) {
    if (e.key === 'Escape') closeModal();
    return;
  }
  if (!session) return;

  if (e.key === 'Escape') { quitLesson(); return; }
  if (e.key === 'Enter' && document.activeElement && document.activeElement.tagName === 'TEXTAREA' && !e.ctrlKey) return;

  if (e.key === 'Enter') {
    const b = primary();
    if (b && !b.disabled) { e.preventDefault(); onPrimary(); }
    return;
  }

  if (session.state === 'answering' && /^[1-9]$/.test(e.key)) {
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const idx = Number(e.key) - 1;
    const opts = view.querySelectorAll('.option');
    if (opts[idx]) { opts[idx].click(); return; }
    const chips = Array.from(view.querySelectorAll('.chip:not(.used)'));
    if (chips[idx]) chips[idx].click();
  }
});

/* ================================================================ boot */

/* ================================================= app-level plumbing */

const VIEW_TITLES = {
  home: 'Learn', path: 'Learn', lesson: 'Lesson', labs: 'Virtual Labs', lab: 'Virtual Labs',
  arena: 'Arena', ladder: 'Leaderboard', codex: 'Codex', progress: 'Progress', sdg: 'Impact'
};

function paintTitle() {
  document.title = 'Codingo — ' + (VIEW_TITLES[route.view] || 'Learn');
}

// A crash in one screen should not leave the learner staring at a blank window.
window.addEventListener('error', (e) => {
  console.error('renderer error', e.error || e.message);
  toast('Something went wrong on that screen');
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('unhandled rejection', e.reason);
});

(async function boot() {
  pythonOK = await api.pythonAvailable();
  appInfo = await api.appInfo();
  await initState();
  paintTopbar();
  go('home');

  api.onMenu((channel) => {
    if (channel === 'menu:export') exportReport();
    else if (channel === 'menu:shortcuts') shortcutsModal();
  });

  if (!S.seenIntro) {
    S.seenIntro = true;
    await save();
    openModal(`
      <h2>Welcome to Codingo</h2>
      <p>Five subjects &mdash; coding, maths, physics, chemistry and biology &mdash; taught as short lessons you
      tap through, plus six virtual labs where you run the experiment yourself.</p>
      <p>Answers are marked instantly with the reasoning, your mastery per topic is tracked live under Progress,
      and everything works offline. ${pythonOK ? 'Python was found, so code exercises and the sandbox will really run your program.' : 'No Python interpreter was found, so code exercises are skipped for now.'}</p>
      <div class="row"><button class="btn" data-close="1">Start learning</button></div>
    `);
  }
})();
