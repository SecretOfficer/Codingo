/* Arena: ranked duels, matchmaking, leaderboard and season handling.
   All rating maths, problem selection and code judging happen in the main process;
   this module only drives the screens and asks the authority for answers. */

const PLACEMENT_DUELS = 5;

const MODES = [
  {
    id: 'debug',
    name: 'Debug Duel',
    icon: 'BUG',
    color: '#ff4b4b',
    blurb: 'A working function has been broken. Find the fault and fix it before your opponent does. Run the tests as often as you like.'
  },
  {
    id: 'vibecode',
    name: '1-Shot Vibecode Duel',
    icon: '1ST',
    color: '#a560ff',
    blurb: 'Read the spec, write the function, submit once. No test runs, no second attempt. Planning beats guessing.'
  },
  {
    id: 'rapid',
    name: 'Rapid STEM Duel',
    icon: 'x6',
    color: '#1cb0f6',
    blurb: 'Six questions pulled from every subject you have unlocked. Answer faster and more accurately than the opponent.'
  }
];

export function createArena(ctx) {
  const { esc, view, api, toast } = ctx;
  let live = null;   // the duel currently on screen

  const S = () => ctx.state();
  const A = () => S().arena;
  const me = () => A().player;

  /* ---------------------------------------------------------- utilities */

  function clearTimers() {
    if (!live) return;
    if (live.tick) clearInterval(live.tick);
    if (live.queueTimer) clearInterval(live.queueTimer);
    live.tick = null;
    live.queueTimer = null;
  }

  function leave() {
    clearTimers();
    live = null;
  }

  async function ensurePool() {
    const a = A();
    if (!a.pool || a.pool.length < 50) {
      a.pool = await api.arena.newPool(150);
      a.lastDrift = ctx.today();
      await ctx.save();
    } else if (a.lastDrift !== ctx.today()) {
      a.pool = await api.arena.drift(a.pool, 1);
      a.lastDrift = ctx.today();
      await ctx.save();
    }
    if (!a.season.startedAt) {
      a.season.startedAt = new Date().toISOString();
      await ctx.save();
    }
  }

  async function seasonCheck() {
    const a = A();
    const info = await api.arena.season(a.season);
    if (info.expired && a.placed) {
      const reset = await api.arena.softReset(a.player);
      Object.assign(a.player, reset);
      a.season = { number: a.season.number + 1, startedAt: new Date().toISOString() };
      a.pool = await api.arena.drift(a.pool, 3);
      await ctx.save();
      toast('Season ' + a.season.number + ' has started — ratings soft reset');
      return await api.arena.season(a.season);
    }
    return info;
  }

  function tierBadge(tier, sub) {
    return `<div class="tier-badge" style="--tc:${tier.color}">
      <div class="tier-name">${esc(tier.name)}</div>
      ${sub ? `<div class="tier-sub">${esc(sub)}</div>` : ''}
    </div>`;
  }

  function fmtDelta(n) {
    const r = Math.round(n);
    return (r > 0 ? '+' : '') + r;
  }

  /* -------------------------------------------------------- arena home */

  async function renderArena() {
    leave();
    await ensurePool();
    const info = await seasonCheck();
    const a = A();
    const st = await api.arena.standings(a.pool, a.player);
    const placing = !a.placed;

    const recent = (a.duels || []).slice(0, 6).map((d) => `
      <div class="duel-row ${d.result}">
        <span class="dr-result">${d.result === 'win' ? 'WIN' : d.result === 'loss' ? 'LOSS' : 'DRAW'}</span>
        <span class="dr-mode">${esc(d.modeName)}</span>
        <span class="dr-vs">vs ${esc(d.opponent)} (${d.opponentRating})</span>
        <span class="dr-delta ${d.delta >= 0 ? 'up' : 'down'}">${fmtDelta(d.delta)}</span>
      </div>`).join('') || '<p class="panel-note">No duels yet. Your first five are placement matches.</p>';

    view.innerHTML = `
      <div class="wrap wide">
        <div class="arena-head">
          <div class="arena-title">
            <div class="section-title" style="margin:0">Ranked Arena</div>
            <p class="section-note" style="margin:6px 0 0">
              Skill-matched 1v1 duels. Ratings use Glicko-2 and are computed by the app's authority process,
              never by the duel screen. Tiers are percentile cuts against the live ladder, so they cannot inflate.
            </p>
          </div>
          <button class="btn ghost" id="btn-ladder">Leaderboard</button>
        </div>

        <div class="rank-grid">
          <div class="panel rank-panel">
            ${placing
              ? `<div class="tier-badge placement"><div class="tier-name">Unranked</div><div class="tier-sub">${a.placements}/${PLACEMENT_DUELS} placement duels</div></div>`
              : tierBadge(st.tier, 'top ' + Math.max(0.1, Math.round(st.percentile * 1000) / 10) + '%')}
            <div class="rank-facts">
              <div class="rf"><span class="rf-k">Rating</span><span class="rf-v">${placing ? 'hidden' : Math.round(a.player.rating)}</span></div>
              <div class="rf"><span class="rf-k">Deviation</span><span class="rf-v">&plusmn;${Math.round(a.player.rd)}</span></div>
              <div class="rf"><span class="rf-k">Ladder rank</span><span class="rf-v">${placing ? '&mdash;' : '#' + st.rank + ' of ' + st.total}</span></div>
              <div class="rf"><span class="rf-k">Record</span><span class="rf-v">${a.player.wins}W ${a.player.losses}L ${a.player.draws}D</span></div>
              <div class="rf"><span class="rf-k">Win streak</span><span class="rf-v">${a.player.streak}</span></div>
              <div class="rf"><span class="rf-k">Peak</span><span class="rf-v">${Math.round(a.player.best)}</span></div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-title">Season ${info.number}</div>
            <div class="season-days">${info.daysLeft}</div>
            <div class="panel-note">days left. At the end of a season every rating is pulled halfway back to 1500
            and its deviation widens, so the ladder re-sorts instead of ossifying.</div>
            <div class="rf" style="margin-top:12px"><span class="rf-k">Ladder size</span><span class="rf-v">${st.total} players</span></div>
          </div>
        </div>

        <div class="section-title">Choose a mode</div>
        <div class="mode-grid">
          ${MODES.map((m) => `
            <button class="mode-card" data-mode="${m.id}" style="--sc:${m.color}">
              <div class="mode-icon">${esc(m.icon)}</div>
              <div class="mode-name">${esc(m.name)}</div>
              <div class="mode-blurb">${esc(m.blurb)}</div>
              <div class="mode-cta">Find match &rarr;</div>
            </button>`).join('')}
        </div>

        <div class="panel">
          <div class="panel-title">Recent duels</div>
          ${recent}
        </div>
      </div>
    `;

    view.querySelectorAll('[data-mode]').forEach((b) => { b.onclick = () => startQueue(b.dataset.mode); });
    document.getElementById('btn-ladder').onclick = renderLadder;
  }

  /* ------------------------------------------------------------- ladder */

  async function renderLadder() {
    leave();
    await ensurePool();
    const a = A();
    const st = await api.arena.standings(a.pool, a.player);
    const tiers = await api.arena.tiers();

    const row = (p, idx) => {
      const isMe = p.id === 'me';
      const pct = (idx + 1) / st.total;
      const tier = tiers.find((t) => pct <= t.cut) || tiers[tiers.length - 1];
      return `<div class="lb-row ${isMe ? 'me' : ''}">
        <span class="lb-rank">#${idx + 1}</span>
        <span class="lb-tier" style="color:${tier.color}">${esc(tier.name)}</span>
        <span class="lb-name">${esc(isMe ? 'You' : p.name)}</span>
        <span class="lb-rating">${Math.round(p.rating)}</span>
        <span class="lb-rd">&plusmn;${Math.round(p.rd)}</span>
      </div>`;
    };

    const top = st.top.map((p, i) => row(p, i)).join('');
    const meIndex = st.rank - 1;
    const nearby = st.rank > 60
      ? `<div class="section-title">Around you</div><div class="lb-list">
          ${st.around.map((p, i) => row(p, Math.max(0, meIndex - 3) + i)).join('')}</div>`
      : '';

    view.innerHTML = `
      <div class="wrap wide">
        <button class="back-link" id="btn-back">&larr; Arena</button>
        <div class="section-title">Leaderboard &mdash; season ${a.season.number}</div>
        <p class="section-note">
          ${st.total} players. Tier is a percentile cut of the live ladder recomputed on every open, so a
          Diamond badge always means the same thing however many people join.
        </p>
        <div class="tier-legend">
          ${tiers.map((t) => `<span class="tier-pill" style="--tc:${t.color}">${esc(t.name)} <b>top ${Math.round(t.cut * 100)}%</b></span>`).join('')}
        </div>
        <div class="lb-list">${top}</div>
        ${nearby}
      </div>
    `;
    document.getElementById('btn-back').onclick = renderArena;
  }

  /* -------------------------------------------------------------- queue */

  async function startQueue(modeId) {
    leave();
    await ensurePool();
    const mode = MODES.find((m) => m.id === modeId);
    const a = A();
    const started = Date.now();

    view.innerHTML = `
      <div class="wrap">
        <div class="queue-screen">
          <div class="queue-mode" style="color:${mode.color}">${esc(mode.name)}</div>
          <div class="queue-radar"><div class="radar-sweep"></div></div>
          <div class="queue-status" id="q-status">Searching for an opponent&hellip;</div>
          <div class="queue-band" id="q-band">Rating window &plusmn;60</div>
          <div class="queue-wait" id="q-wait">0.0s</div>
          <button class="btn ghost" id="q-cancel">Cancel</button>
        </div>
      </div>
    `;
    document.getElementById('q-cancel').onclick = () => { leave(); renderArena(); };

    live = { mode, queueTimer: null, tick: null };
    const findAfter = 1800 + Math.random() * 2200;

    live.queueTimer = setInterval(async () => {
      const waited = Date.now() - started;
      const bandEl = document.getElementById('q-band');
      const waitEl = document.getElementById('q-wait');
      if (!bandEl || !waitEl) { clearTimers(); return; }
      const res = await api.arena.queue(a.pool, a.player, waited, []);
      bandEl.textContent = 'Rating window ±' + res.band;
      waitEl.textContent = (waited / 1000).toFixed(1) + 's';

      if (waited >= findAfter) {
        clearTimers();
        const opp = res.opponent;
        const statusEl = document.getElementById('q-status');
        if (statusEl) {
          statusEl.innerHTML = `Matched with <b>${esc(opp.name)}</b> &mdash; ${Math.round(opp.rating)}`;
          statusEl.classList.add('found');
        }
        setTimeout(() => beginDuel(mode, opp), 1100);
      }
    }, 300);
  }

  /* --------------------------------------------------------- duel setup */

  async function beginDuel(mode, opponent) {
    const a = A();
    const target = Math.max(0.1, Math.min(0.75, (a.player.rating - 900) / 2200));

    if (mode.id === 'rapid') {
      startRapidDuel(mode, opponent);
      return;
    }

    const problem = await api.arena.problem(mode.id, target, a.solvedProblems || []);
    const sim = await api.arena.simOpponent(opponent, problem.difficulty, problem.limitSeconds);

    live = {
      mode,
      opponent,
      problem,
      sim,
      startedAt: Date.now(),
      limit: problem.limitSeconds,
      finished: false,
      submissions: 0,
      tick: null
    };

    view.innerHTML = `
      <div class="wrap wide">
        <div class="duel-top">
          <div class="duel-side me">
            <div class="ds-name">You</div>
            <div class="ds-rating">${a.placed ? Math.round(a.player.rating) : 'unranked'}</div>
          </div>
          <div class="duel-center">
            <div class="duel-clock" id="duel-clock">${problem.limitSeconds}s</div>
            <div class="duel-mode" style="color:${mode.color}">${esc(mode.name)}</div>
            <div class="opp-progress"><div class="opp-fill" id="opp-fill"></div></div>
            <div class="opp-note" id="opp-note">opponent working&hellip;</div>
          </div>
          <div class="duel-side opp">
            <div class="ds-name">${esc(opponent.name)}</div>
            <div class="ds-rating">${Math.round(opponent.rating)}</div>
          </div>
        </div>

        <div class="panel duel-brief">
          <div class="panel-title">${esc(problem.title)} &middot; ${problem.testCount} hidden tests</div>
          <p class="duel-text">${esc(problem.brief || problem.spec)}</p>
          ${mode.id === 'vibecode'
            ? '<p class="duel-warn">One submission only. There is no Run button and no second attempt.</p>'
            : '<p class="panel-note">Run the tests as often as you need. Only a submission ends the duel.</p>'}
        </div>

        <textarea class="code-editor tall" id="duel-code" spellcheck="false">${esc(problem.code)}</textarea>
        <div class="run-row">
          ${mode.id === 'debug' ? '<button class="btn blue" id="btn-run">Run tests</button>' : ''}
          <button class="btn" id="btn-submit">Submit${mode.id === 'vibecode' ? ' (final)' : ''}</button>
          <button class="btn ghost" id="btn-forfeit">Forfeit</button>
          <span class="run-note">Tab inserts four spaces.</span>
        </div>
        <pre class="console hidden" id="duel-console"></pre>
      </div>
    `;

    const ta = document.getElementById('duel-code');
    ta.focus();
    ta.onkeydown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 4;
      }
    };

    const runBtn = document.getElementById('btn-run');
    if (runBtn) runBtn.onclick = () => judge(false);
    document.getElementById('btn-submit').onclick = () => {
      if (mode.id === 'vibecode') confirmFinal();
      else judge(true);
    };
    document.getElementById('btn-forfeit').onclick = () => {
      ctx.openModal(`<h2>Forfeit the duel?</h2><p>It counts as a loss and your rating moves accordingly.</p>
        <div class="row"><button class="btn ghost" data-close="1">Keep playing</button>
        <button class="btn red" data-act="yes">Forfeit</button></div>`, (box) => {
        box.querySelector('[data-act="yes"]').onclick = () => { ctx.closeModal(); finishDuel('loss', 'You forfeited.'); };
      });
    };

    live.tick = setInterval(tickDuel, 200);
  }

  function confirmFinal() {
    ctx.openModal(`<h2>Submit for judging?</h2>
      <p>This is a 1-shot duel: the code is sent to the judge exactly once and the result stands.</p>
      <div class="row"><button class="btn ghost" data-close="1">Not yet</button>
      <button class="btn" data-act="yes">Submit</button></div>`, (box) => {
      box.querySelector('[data-act="yes"]').onclick = () => { ctx.closeModal(); judge(true); };
    });
  }

  function tickDuel() {
    if (!live || live.finished) return;
    const elapsed = (Date.now() - live.startedAt) / 1000;
    const clock = document.getElementById('duel-clock');
    const fill = document.getElementById('opp-fill');
    const note = document.getElementById('opp-note');
    if (!clock) { clearTimers(); return; }

    const left = Math.max(0, live.limit - elapsed);
    clock.textContent = Math.ceil(left) + 's';
    clock.classList.toggle('low', left < 30);

    const pct = Math.min(100, (elapsed / live.sim.seconds) * 100);
    if (fill) fill.style.width = pct + '%';
    if (note) {
      note.textContent = pct >= 100
        ? (live.sim.solves ? 'opponent submitted' : 'opponent stalled')
        : (pct > 70 ? 'opponent is close' : 'opponent working…');
    }

    if (live.sim.solves && elapsed >= live.sim.seconds) {
      finishDuel('loss', esc(live.opponent.name) + ' submitted a passing solution first.');
      return;
    }
    if (left <= 0) {
      finishDuel(live.sim.solves ? 'loss' : 'draw', 'Time ran out.');
    }
  }

  async function judge(isSubmission) {
    if (!live || live.finished) return;
    const ta = document.getElementById('duel-code');
    const consoleEl = document.getElementById('duel-console');
    const submitBtn = document.getElementById('btn-submit');
    const runBtn = document.getElementById('btn-run');
    [submitBtn, runBtn].forEach((b) => { if (b) b.disabled = true; });

    const res = await api.arena.judge(live.problem.id, ta.value);
    [submitBtn, runBtn].forEach((b) => { if (b && !live.finished) b.disabled = false; });

    consoleEl.classList.remove('hidden');
    if (!res.cases || !res.cases.length) {
      consoleEl.innerHTML = `<span class="err">${esc(res.stderr || 'No verdict returned.')}</span>`;
    } else {
      consoleEl.innerHTML = res.cases.map((c) =>
        `<div class="case ${c.ok ? 'pass' : 'fail'}">${c.ok ? '&#10003;' : '&#10007;'} ${esc(c.expr)}
          ${c.ok ? '' : `<span class="case-detail">got ${esc(c.got)}, expected ${esc(c.want)}</span>`}</div>`).join('')
        + `<div class="case-summary">${res.passed}/${res.total} tests passing</div>`;
    }

    if (!isSubmission) return;
    live.submissions += 1;
    if (res.ok) {
      const seconds = Math.round((Date.now() - live.startedAt) / 1000);
      const beatBot = !live.sim.solves || seconds < live.sim.seconds;
      finishDuel(beatBot ? 'win' : 'loss',
        beatBot ? `All ${res.total} tests pass in ${seconds}s.` : 'Correct, but your opponent got there first.');
    } else if (live.mode.id === 'vibecode') {
      finishDuel(live.sim.solves ? 'loss' : 'draw', `Only ${res.passed}/${res.total} tests passed, and a 1-shot duel has no retry.`);
    } else {
      toast(res.passed + '/' + res.total + ' tests passing — keep going');
    }
  }

  /* ---------------------------------------------------------- rapid duel */

  function rapidQuestions(n) {
    const bank = [];
    ctx.lessonList.forEach((lesson) => {
      if (lesson.review) return;
      lesson.exercises.forEach((ex) => {
        if (ex.type === 'mcq' || ex.type === 'output' || ex.type === 'numeric') bank.push({ ex, lesson });
      });
    });
    return ctx.shuffle(bank).slice(0, n);
  }

  async function startRapidDuel(mode, opponent) {
    const a = A();
    const questions = rapidQuestions(6);
    const skill = (opponent.rating - 800) / 1800;
    const oppPlan = questions.map(() => ({
      correct: Math.random() < Math.max(0.2, Math.min(0.95, 0.3 + skill * 0.65)),
      at: 3 + Math.random() * (14 - skill * 8)
    }));

    live = {
      mode,
      opponent,
      questions,
      oppPlan,
      index: 0,
      myScore: 0,
      oppScore: 0,
      startedAt: Date.now(),
      limit: 20,
      finished: false,
      tick: null,
      questionStart: Date.now()
    };
    renderRapidQuestion();
  }

  function renderRapidQuestion() {
    if (!live || live.finished) return;
    clearTimers();
    const { questions, index, opponent } = live;
    if (index >= questions.length) { finishRapid(); return; }

    const { ex } = questions[index];
    live.questionStart = Date.now();
    live.answered = false;

    const options = ex.type === 'numeric'
      ? `<input class="type-input" id="rapid-in" spellcheck="false" autocomplete="off" placeholder="Type a number">`
      : `<div class="options">${ctx.shuffle(ex.options.map((_o, i) => i)).map((orig, slot) => `
          <button class="option" data-i="${orig}"><span class="option-key">${slot + 1}</span>
          <span class="${ex.type === 'output' ? 'mono' : ''}">${esc(ex.options[orig])}</span></button>`).join('')}</div>`;

    view.innerHTML = `
      <div class="wrap">
        <div class="duel-top compact">
          <div class="duel-side me"><div class="ds-name">You</div><div class="ds-score">${live.myScore}</div></div>
          <div class="duel-center">
            <div class="duel-clock" id="duel-clock">20s</div>
            <div class="duel-mode" style="color:#1cb0f6">Question ${index + 1} of ${questions.length}</div>
            <div class="opp-progress"><div class="opp-fill" id="opp-fill"></div></div>
          </div>
          <div class="duel-side opp"><div class="ds-name">${esc(opponent.name)}</div><div class="ds-score">${live.oppScore}</div></div>
        </div>
        <div class="lesson-body">
          <div class="prompt">${esc(ex.q || 'What does this print?')}</div>
          ${ex.code ? `<pre class="code">${ctx.hl(ex.code)}</pre>` : ''}
          ${options}
        </div>
        <div class="footer" id="footer">
          <div class="footer-inner">
            <div class="footer-msg" id="footer-msg"></div>
            <button class="btn" id="btn-primary" disabled>Lock in</button>
          </div>
        </div>
      </div>
    `;

    const btn = document.getElementById('btn-primary');
    let pick = null;

    view.querySelectorAll('.option').forEach((b) => {
      b.onclick = () => {
        if (live.answered) return;
        view.querySelectorAll('.option').forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected');
        pick = Number(b.dataset.i);
        btn.disabled = false;
      };
    });
    const input = document.getElementById('rapid-in');
    if (input) {
      input.focus();
      input.oninput = () => { btn.disabled = input.value.trim().length === 0; };
      input.onkeydown = (e) => { if (e.key === 'Enter' && !btn.disabled) submitRapid(pick); };
    }
    btn.onclick = () => submitRapid(pick);

    live.tick = setInterval(() => {
      if (!live || live.answered) return;
      const elapsed = (Date.now() - live.questionStart) / 1000;
      const clock = document.getElementById('duel-clock');
      const fill = document.getElementById('opp-fill');
      if (!clock) { clearTimers(); return; }
      clock.textContent = Math.max(0, Math.ceil(live.limit - elapsed)) + 's';
      clock.classList.toggle('low', live.limit - elapsed < 6);
      const plan = live.oppPlan[live.index];
      if (fill) fill.style.width = Math.min(100, (elapsed / plan.at) * 100) + '%';
      if (elapsed >= live.limit) submitRapid(null, true);
    }, 150);
  }

  function submitRapid(pick, timedOut) {
    if (!live || live.answered) return;
    live.answered = true;
    clearTimers();

    const { ex } = live.questions[live.index];
    const elapsed = (Date.now() - live.questionStart) / 1000;
    let correct = false;
    if (!timedOut) {
      if (ex.type === 'numeric') {
        const el = document.getElementById('rapid-in');
        const num = Number(String(el ? el.value : '').replace(/[^0-9.eE+-]/g, ''));
        correct = Number.isFinite(num) && Math.abs(num - ex.answer) <= (ex.tol || 0);
      } else {
        correct = pick === ex.answer;
      }
    }

    const plan = live.oppPlan[live.index];
    const oppCorrect = plan.correct && plan.at <= live.limit;
    if (correct) live.myScore += 1;
    if (oppCorrect) live.oppScore += 1;

    const footer = document.getElementById('footer');
    const msg = document.getElementById('footer-msg');
    footer.classList.add(correct ? 'ok' : 'no');
    msg.innerHTML = `<div class="footer-title">${correct ? 'Correct in ' + elapsed.toFixed(1) + 's' : (timedOut ? 'Out of time' : 'Wrong')}</div>
      <div class="footer-why">${esc(ex.explain || '')}</div>
      <div class="footer-why">${esc(live.opponent.name)} ${oppCorrect ? 'answered correctly in ' + plan.at.toFixed(1) + 's' : 'got it wrong'}.</div>`;

    view.querySelectorAll('.option').forEach((b) => {
      const i = Number(b.dataset.i);
      b.classList.add('disabled');
      if (i === ex.answer) b.classList.add('right');
      else if (i === pick) b.classList.add('wrong');
    });

    const btn = document.getElementById('btn-primary');
    btn.disabled = false;
    btn.textContent = live.index === live.questions.length - 1 ? 'See result' : 'Next question';
    btn.onclick = () => { live.index += 1; renderRapidQuestion(); };
    btn.focus();
  }

  function finishRapid() {
    const result = live.myScore > live.oppScore ? 'win' : (live.myScore < live.oppScore ? 'loss' : 'draw');
    finishDuel(result, `Final score ${live.myScore} &ndash; ${live.oppScore}.`);
  }

  /* --------------------------------------------------------- resolution */

  async function finishDuel(result, reason) {
    if (!live || live.finished) return;
    live.finished = true;
    clearTimers();

    const a = A();
    const before = Math.round(a.player.rating);
    const score = result === 'win' ? 1 : (result === 'draw' ? 0.5 : 0);
    const rated = await api.arena.rate(a.player, live.opponent, score);

    Object.assign(a.player, rated.me);
    a.player.best = Math.max(a.player.best || 1500, a.player.rating);
    if (result === 'win') { a.player.wins += 1; a.player.streak += 1; }
    else if (result === 'loss') { a.player.losses += 1; a.player.streak = 0; }
    else { a.player.draws += 1; }

    const idx = a.pool.findIndex((b) => b.id === live.opponent.id);
    if (idx >= 0) a.pool[idx] = Object.assign({}, a.pool[idx], rated.opponent);

    if (live.problem) {
      a.solvedProblems = (a.solvedProblems || []).concat([live.problem.id]).slice(-12);
    }
    if (!a.placed) {
      a.placements += 1;
      if (a.placements >= PLACEMENT_DUELS) a.placed = true;
    }

    const xp = result === 'win' ? 40 : (result === 'draw' ? 20 : 10);
    const gems = result === 'win' ? 25 : 5;
    ctx.recordXp('code', xp);
    S().gems += gems;
    ctx.touchStreak();

    const delta = Math.round(a.player.rating) - before;
    a.duels = [{
      result,
      modeName: live.mode.name,
      opponent: live.opponent.name,
      opponentRating: Math.round(live.opponent.rating),
      delta,
      at: new Date().toISOString()
    }].concat(a.duels || []).slice(0, 20);

    await ctx.save();
    ctx.paintTopbar();

    const st = await api.arena.standings(a.pool, a.player);
    const justPlaced = a.placed && a.placements === PLACEMENT_DUELS;

    view.innerHTML = `
      <div class="center-screen">
        <div class="result-banner ${result}">${result === 'win' ? 'VICTORY' : result === 'loss' ? 'DEFEAT' : 'DRAW'}</div>
        <p>${reason}</p>

        <div class="award-row">
          <div class="award"><div class="k">Rating</div><div class="v ${delta >= 0 ? 'up' : 'down'}">${a.placed ? Math.round(a.player.rating) : 'hidden'}</div></div>
          <div class="award"><div class="k">Change</div><div class="v ${delta >= 0 ? 'up' : 'down'}">${fmtDelta(delta)}</div></div>
          <div class="award xp"><div class="k">XP</div><div class="v">+${xp}</div></div>
        </div>

        ${a.placed
          ? `<div class="result-tier">${tierBadge(st.tier, '#' + st.rank + ' of ' + st.total)}</div>
             ${justPlaced ? '<p class="placement-note">Placement complete. Your tier is now visible on the ladder.</p>' : ''}`
          : `<p class="placement-note">Placement duel ${a.placements} of ${PLACEMENT_DUELS} done. Your rating stays hidden until placement finishes.</p>`}

        <div class="award-row">
          <button class="btn ghost" id="btn-arena">Back to arena</button>
          <button class="btn" id="btn-again">Queue again</button>
        </div>
      </div>
    `;
    const mode = live.mode;
    live = null;
    document.getElementById('btn-arena').onclick = renderArena;
    document.getElementById('btn-again').onclick = () => startQueue(mode.id);
  }

  return { renderArena, renderLadder, leave, MODES, PLACEMENT_DUELS };
}
