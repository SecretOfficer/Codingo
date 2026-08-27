/* Codex: summoning, collection, team building and 3-lane battles.
   Gems come from studying, so the only way to pull is to learn something first.
   Rolls, team power and battle outcomes are all decided in the main process. */

import { portrait, rarityColour, stars } from './gacha-art.js';

const SUBJECT_NAMES = { code: 'Coding', math: 'Maths', physics: 'Physics', chem: 'Chemistry', bio: 'Biology' };
const CLASS_NAMES = { attack: 'Attack', guard: 'Guard', tech: 'Tech' };
const CLASS_BEATS = { attack: 'Tech', tech: 'Guard', guard: 'Attack' };
const TICKET_MAX = 10;

export function createCodex(ctx) {
  const { esc, view, api, toast, fx } = ctx;

  let meta = null;                   // roster and rates, fetched once
  let byId = new Map();
  let screen = 'summon';
  let filter = 'all';
  let battleRuntime = null;

  const S = () => ctx.state();
  const G = () => S().gacha;

  async function ensureMeta() {
    if (meta) return meta;
    meta = await api.gacha.roster();
    byId = new Map(meta.roster.map((c) => [c.id, c]));
    return meta;
  }

  function owned() { return G().owned || {}; }
  function copiesOf(id) { return (owned()[id] || {}).copies || 0; }
  function ownedList() {
    return Object.keys(owned()).map((id) => byId.get(id)).filter(Boolean);
  }

  function power(char) {
    const awaken = Math.min(meta.awakenMax, Math.max(0, copiesOf(char.id) - 1));
    return Math.round(char.power * (1 + awaken * meta.awakenStep));
  }

  function teamEntries() {
    return (G().team || []).filter(Boolean).map((id) => ({ id, copies: copiesOf(id) }));
  }

  /** The team's payoff outside battles: a small XP bonus in every lesson. */
  function xpBonusPercent(total) {
    return Math.min(25, Math.floor((total || 0) / 60));
  }

  /* ------------------------------------------------------------ shell */

  function shell(inner) {
    const g = G();
    const tickets = g.tickets || 0;
    return `
      <div class="wrap wide">
        <div class="codex-head">
          <div>
            <div class="section-title" style="margin:0">Codex</div>
            <p class="section-note" style="margin:6px 0 0">
              Spirits of the things you are studying. Gems earned from lessons, labs and duels summon them;
              a team of three fights rival teams three lanes at a time.
            </p>
          </div>
          <div class="codex-wallet">
            <div class="cw-item"><span class="cw-v">${S().gems}</span><span class="cw-k">gems</span></div>
            <div class="cw-item"><span class="cw-v">${tickets}/${TICKET_MAX}</span><span class="cw-k">tickets</span></div>
            <div class="cw-item"><span class="cw-v">${Object.keys(owned()).length}/${meta.roster.length}</span><span class="cw-k">collected</span></div>
          </div>
        </div>

        <div class="codex-tabs">
          ${[['summon', 'Summon'], ['collection', 'Collection'], ['team', 'Team'], ['battle', 'Battle']]
            .map(([id, label]) => `<button class="codex-tab ${screen === id ? 'on' : ''}" data-screen="${id}">${label}</button>`).join('')}
        </div>

        ${inner}
      </div>`;
  }

  function wireTabs() {
    view.querySelectorAll('[data-screen]').forEach((b) => {
      b.onclick = () => { screen = b.dataset.screen; render(); };
    });
  }

  /* ----------------------------------------------------------- summon */

  function summonScreen() {
    const g = G();
    const p = g.pity || { since5: 0, since4: 0 };
    const to5 = Math.max(0, meta.pity5 - p.since5);
    const canOne = S().gems >= meta.pullCost;
    const canTen = S().gems >= meta.multiCost;

    return `
      <div class="banner">
        <div class="banner-art">
          ${meta.roster.filter((c) => c.rarity === 5).slice(0, 3)
            .map((c, i) => `<div class="banner-figure f${i}">${portrait(c, { size: 150 })}</div>`).join('')}
          <div class="banner-glow"></div>
        </div>
        <div class="banner-body">
          <div class="banner-kicker">Standard summon</div>
          <div class="banner-title">Voices of the Curriculum</div>
          <p class="banner-text">
            Every spirit personifies an idea from the course. ${meta.roster.length} exist in total:
            ${meta.roster.filter((c) => c.rarity === 5).length} five star,
            ${meta.roster.filter((c) => c.rarity === 4).length} four star and
            ${meta.roster.filter((c) => c.rarity === 3).length} three star.
          </p>
          <div class="rate-row">
            <span class="rate r5">5★ ${(meta.rates[5] * 100).toFixed(0)}%</span>
            <span class="rate r4">4★ ${(meta.rates[4] * 100).toFixed(0)}%</span>
            <span class="rate r3">3★ rest</span>
          </div>
          <div class="pity-bar" title="Guaranteed 5★ counter">
            <div class="pity-fill" style="width:${Math.round((p.since5 / meta.pity5) * 100)}%"></div>
          </div>
          <div class="pity-note">${to5} pulls until a guaranteed 5★ &middot; a 4★ or better at least every ${meta.pity4}</div>

          <div class="summon-actions">
            <button class="btn ${canOne ? '' : 'ghost'}" id="pull-1" ${canOne ? '' : 'disabled'}>
              Summon &times;1 &mdash; ${meta.pullCost} gems
            </button>
            <button class="btn blue ${canTen ? '' : 'ghost'}" id="pull-10" ${canTen ? '' : 'disabled'}>
              Summon &times;10 &mdash; ${meta.multiCost} gems
            </button>
          </div>
          <div class="pity-note">Ten summons cost the price of nine. Duplicates awaken a spirit you already own,
          adding ${Math.round(meta.awakenStep * 100)}% power up to ${meta.awakenMax} times, and refund gems.</div>
        </div>
      </div>`;
  }

  function wireSummon() {
    const one = document.getElementById('pull-1');
    const ten = document.getElementById('pull-10');
    if (one) one.onclick = () => doPull(1, meta.pullCost);
    if (ten) ten.onclick = () => doPull(10, meta.multiCost);
  }

  async function doPull(count, cost) {
    const s = S();
    if (s.gems < cost) { toast('Not enough gems — finish a lesson or a lab'); return; }

    const g = G();
    s.gems -= cost;
    const res = await api.gacha.pull(count, g.pity || { since5: 0, since4: 0 }, owned());
    g.pity = res.pity;
    g.pulls = (g.pulls || 0) + count;

    let refunded = 0;
    res.results.forEach((r) => {
      const entry = g.owned[r.id] || { copies: 0, obtained: new Date().toISOString() };
      entry.copies += 1;
      g.owned[r.id] = entry;
      if (r.gems) { s.gems += r.gems; refunded += r.gems; }
      if (r.rarity === 5) g.fiveStars = (g.fiveStars || 0) + 1;
    });

    // A first team is filled in automatically so a new player can fight immediately.
    g.team = (g.team || []).filter((id) => owned()[id]);
    if (g.team.length < 3) {
      const best = ownedList().sort((a, b) => power(b) - power(a));
      best.forEach((c) => { if (g.team.length < 3 && !g.team.includes(c.id)) g.team.push(c.id); });
    }

    await ctx.save();
    ctx.paintTopbar();
    await showPullReveal(res.results, refunded);
    ctx.checkBadges({ pulled: true });
  }

  /** Cards flip one at a time, brightest last, so the ten-pull has a build. */
  function showPullReveal(results, refunded) {
    return new Promise((resolve) => {
      const ordered = results.slice().sort((a, b) => a.rarity - b.rarity);
      const best = ordered[ordered.length - 1].rarity;

      const overlay = document.createElement('div');
      overlay.className = 'pull-overlay';
      overlay.innerHTML = `
        <div class="pull-sky rarity-${best}"></div>
        <div class="pull-stage" id="pull-stage"></div>
        <div class="pull-footer">
          <div class="pull-hint" id="pull-hint">summoning…</div>
          <button class="btn hidden" id="pull-done">Continue${refunded ? ' (+' + refunded + ' gems returned)' : ''}</button>
        </div>`;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('in'));

      const stage = overlay.querySelector('#pull-stage');
      const hint = overlay.querySelector('#pull-hint');
      const done = overlay.querySelector('#pull-done');
      let i = 0;

      const revealNext = () => {
        if (i >= ordered.length) {
          hint.textContent = ordered.length > 1 ? 'all ' + ordered.length + ' summoned' : '';
          done.classList.remove('hidden');
          done.focus();
          return;
        }
        const r = ordered[i++];
        const c = byId.get(r.id);
        const card = document.createElement('div');
        card.className = 'pull-card rarity-' + r.rarity;
        card.style.setProperty('--rc', rarityColour(r.rarity));
        card.innerHTML = `
          <div class="pc-art">${portrait(c, { size: 132 })}</div>
          <div class="pc-stars">${stars(r.rarity)}</div>
          <div class="pc-name">${esc(c.name)}</div>
          <div class="pc-title">${esc(c.title)}</div>
          <div class="pc-tag">${r.isNew ? 'NEW' : 'awakened +' + Math.round(meta.awakenStep * 100) + '%'}</div>`;
        stage.appendChild(card);
        requestAnimationFrame(() => card.classList.add('in'));

        if (r.rarity === 5) {
          fx.play('badge');
          fx.confetti(90);
          fx.slam('5★', rarityColour(5));
        } else if (r.rarity === 4) {
          fx.play('combo', 3);
          fx.burstAt(card, { count: 20, up: true });
        } else {
          fx.play('click');
        }

        setTimeout(revealNext, r.rarity === 5 ? 900 : 380);
      };

      setTimeout(revealNext, 320);

      done.onclick = () => {
        overlay.classList.remove('in');
        setTimeout(() => { overlay.remove(); render(); resolve(); }, 260);
      };
      overlay.onclick = (e) => { if (e.target === overlay) done.click(); };
    });
  }

  /* ------------------------------------------------------- collection */

  function collectionScreen() {
    const all = meta.roster.slice().sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));
    const shown = all.filter((c) => filter === 'all' || c.subject === filter);

    return `
      <div class="filter-row">
        ${[['all', 'All']].concat(Object.entries(SUBJECT_NAMES))
          .map(([id, label]) => `<button class="mini-btn ${filter === id ? 'on' : ''}" data-filter="${id}">${esc(label)}</button>`).join('')}
      </div>
      <div class="codex-grid">
        ${shown.map((c) => {
          const have = copiesOf(c.id);
          return `
            <button class="codex-card ${have ? '' : 'unowned'}" data-char="${c.id}" style="--rc:${rarityColour(c.rarity)}">
              <div class="cc-art">${have ? portrait(c, { size: 104 }) : '<div class="cc-silhouette">?</div>'}</div>
              <div class="cc-stars">${stars(c.rarity)}</div>
              <div class="cc-name">${have ? esc(c.name) : '???'}</div>
              <div class="cc-meta">${esc(SUBJECT_NAMES[c.subject])} &middot; ${esc(CLASS_NAMES[c.klass])}</div>
              ${have ? `<div class="cc-power">${power(c)}</div>` : ''}
              ${have > 1 ? `<div class="cc-awaken">+${have - 1}</div>` : ''}
            </button>`;
        }).join('')}
      </div>`;
  }

  function wireCollection() {
    view.querySelectorAll('[data-filter]').forEach((b) => {
      b.onclick = () => { filter = b.dataset.filter; render(); };
    });
    view.querySelectorAll('[data-char]').forEach((b) => {
      b.onclick = () => {
        const c = byId.get(b.dataset.char);
        if (!copiesOf(c.id)) { toast('Not summoned yet'); return; }
        showCharacter(c);
      };
    });
  }

  function showCharacter(c) {
    const have = copiesOf(c.id);
    const inTeam = (G().team || []).includes(c.id);
    ctx.openModal(`
      <div class="char-sheet" style="--rc:${rarityColour(c.rarity)}">
        <div class="cs-art">${portrait(c, { size: 168 })}</div>
        <div class="cs-stars">${stars(c.rarity)}</div>
        <h2>${esc(c.name)}</h2>
        <div class="cs-title">${esc(c.title)}</div>
        <div class="cs-chips">
          <span class="tag">${esc(SUBJECT_NAMES[c.subject])}</span>
          <span class="tag">${esc(CLASS_NAMES[c.klass])} &middot; beats ${esc(CLASS_BEATS[c.klass])}</span>
          <span class="tag">Power ${power(c)}</span>
          ${have > 1 ? `<span class="tag">Awakened +${have - 1}</span>` : ''}
        </div>
        <p class="cs-lore">${esc(c.lore)}</p>
        <div class="cs-skill"><b>${esc(c.skill.split('—')[0].trim())}</b>${esc(c.skill.includes('—') ? ' — ' + c.skill.split('—')[1].trim() : '')}</div>
      </div>
      <div class="row">
        <button class="btn ghost" data-close="1">Close</button>
        <button class="btn" data-act="team">${inTeam ? 'Remove from team' : 'Add to team'}</button>
      </div>
    `, (box) => {
      box.querySelector('[data-act="team"]').onclick = async () => {
        const g = G();
        g.team = g.team || [];
        if (inTeam) g.team = g.team.filter((id) => id !== c.id);
        else if (g.team.length >= 3) { toast('Team is full — remove someone first'); return; }
        else g.team.push(c.id);
        await ctx.save();
        ctx.closeModal();
        screen = 'team';
        render();
      };
    });
  }

  /* -------------------------------------------------------------- team */

  async function teamScreen() {
    const g = G();
    const entries = teamEntries();
    const tp = entries.length === 3 ? await api.gacha.teamPower(entries) : null;
    const bonus = tp ? xpBonusPercent(tp.total) : 0;
    g.xpBonus = bonus;

    const slots = [0, 1, 2].map((i) => {
      const id = (g.team || [])[i];
      const c = id ? byId.get(id) : null;
      if (!c) {
        return `<button class="team-slot empty" data-slot="${i}">
          <div class="ts-plus">+</div><div class="ts-hint">Lane ${i + 1}</div></button>`;
      }
      return `
        <button class="team-slot" data-slot="${i}" style="--rc:${rarityColour(c.rarity)}">
          <div class="ts-lane">Lane ${i + 1}</div>
          <div class="ts-art">${portrait(c, { size: 110 })}</div>
          <div class="ts-name">${esc(c.name)}</div>
          <div class="ts-meta">${esc(CLASS_NAMES[c.klass])} &middot; ${power(c)}</div>
        </button>`;
    }).join('');

    return `
      <div class="team-board">
        <div class="team-slots">${slots}</div>
        <div class="panel team-summary">
          <div class="panel-title">Team</div>
          ${tp ? `
            <div class="rf"><span class="rf-k">Raw power</span><span class="rf-v">${tp.base}</span></div>
            <div class="rf"><span class="rf-k">Synergy</span><span class="rf-v">${esc(tp.synergy.label)}</span></div>
            <div class="rf"><span class="rf-k">Total</span><span class="rf-v">${tp.total}</span></div>
            <div class="rf"><span class="rf-k">Lesson XP bonus</span><span class="rf-v">+${bonus}%</span></div>
          ` : '<p class="panel-note">Pick three spirits to see the team totals.</p>'}
          <p class="panel-note">
            Lanes clash in order, so position matters: Attack beats Tech, Tech beats Guard, Guard beats Attack.
            A favourable match-up is worth 25% in that lane.
          </p>
        </div>
      </div>
      <div class="section-title">Your spirits</div>
      <div class="codex-grid small">
        ${ownedList().sort((a, b) => power(b) - power(a)).map((c) => {
          const inTeam = (g.team || []).includes(c.id);
          return `
            <button class="codex-card ${inTeam ? 'picked' : ''}" data-pick="${c.id}" style="--rc:${rarityColour(c.rarity)}">
              <div class="cc-art">${portrait(c, { size: 84 })}</div>
              <div class="cc-stars">${stars(c.rarity)}</div>
              <div class="cc-name">${esc(c.name)}</div>
              <div class="cc-meta">${esc(CLASS_NAMES[c.klass])} &middot; ${power(c)}</div>
            </button>`;
        }).join('') || '<p class="panel-note">Nothing summoned yet.</p>'}
      </div>`;
  }

  function wireTeam() {
    view.querySelectorAll('[data-slot]').forEach((b) => {
      b.onclick = async () => {
        const g = G();
        const i = Number(b.dataset.slot);
        if (!(g.team || [])[i]) { screen = 'collection'; render(); return; }
        g.team.splice(i, 1);
        await ctx.save();
        render();
      };
    });
    view.querySelectorAll('[data-pick]').forEach((b) => {
      b.onclick = async () => {
        const g = G();
        const id = b.dataset.pick;
        g.team = g.team || [];
        if (g.team.includes(id)) g.team = g.team.filter((x) => x !== id);
        else if (g.team.length >= 3) { toast('Team is full'); return; }
        else g.team.push(id);
        await ctx.save();
        render();
      };
    });
  }

  /* ------------------------------------------------------------ battle */

  function battleScreen() {
    const g = G();
    const ready = (g.team || []).length === 3;
    const tickets = g.tickets || 0;
    const record = g.battles || { wins: 0, losses: 0 };

    return `
      <div class="panel battle-intro">
        <div class="panel-title">Lane battle</div>
        <p class="duel-text">
          Three lanes, resolved in order. Win two and the rival hands over one of their spirits.
          Each battle costs one focus ticket, and tickets come from finishing lessons and lab challenges,
          so the collection only grows if the studying does.
        </p>
        <div class="rank-facts" style="margin-top:14px">
          <div class="rf"><span class="rf-k">Tickets</span><span class="rf-v">${tickets} / ${TICKET_MAX}</span></div>
          <div class="rf"><span class="rf-k">Record</span><span class="rf-v">${record.wins}W ${record.losses}L</span></div>
          <div class="rf"><span class="rf-k">Team</span><span class="rf-v">${ready ? 'ready' : 'incomplete'}</span></div>
          <div class="rf"><span class="rf-k">Spirits won</span><span class="rf-v">${g.stolen || 0}</span></div>
        </div>
        <div class="row">
          <button class="btn ${ready && tickets > 0 ? '' : 'ghost'}" id="btn-fight" ${ready && tickets > 0 ? '' : 'disabled'}>
            ${ready ? (tickets > 0 ? 'Find a rival' : 'No tickets left') : 'Build a team of three first'}
          </button>
        </div>
      </div>
      ${(g.log || []).length ? `
        <div class="panel">
          <div class="panel-title">Recent battles</div>
          ${(g.log || []).slice(0, 6).map((l) => `
            <div class="duel-row ${l.won ? 'win' : 'loss'}">
              <span class="dr-result">${l.won ? 'WIN' : 'LOSS'}</span>
              <span class="dr-mode">${l.myWins}&ndash;${l.theirWins}</span>
              <span class="dr-vs">vs ${esc(l.opponent)}</span>
              <span class="dr-delta ${l.won ? 'up' : 'down'}">${l.prize ? '+' + esc(l.prizeName) : '—'}</span>
            </div>`).join('')}
        </div>` : ''}`;
  }

  function wireBattle() {
    const btn = document.getElementById('btn-fight');
    if (btn) btn.onclick = startBattle;
  }

  async function startBattle() {
    const g = G();
    if ((g.team || []).length !== 3 || (g.tickets || 0) < 1) return;

    g.tickets -= 1;
    await ctx.save();

    const names = ['Ashen Circuit', 'Iron Tutor', 'Glass Theorem', 'Static Choir', 'Verdant Proof',
      'Cobalt Axiom', 'Hollow Formula', 'Quiet Reagent', 'Bright Lemma'];
    const res = await api.gacha.battle(teamEntries(), owned(), names[Math.floor(Math.random() * names.length)]);

    view.innerHTML = shell(`
      <div class="lane-arena">
        <div class="lane-head">
          <div class="lane-side me"><div class="ds-name">Your team</div><div class="ds-rating">${res.myPower.total}</div></div>
          <div class="lane-score" id="lane-score">0 &ndash; 0</div>
          <div class="lane-side opp"><div class="ds-name">${esc(res.opponent.name)}</div><div class="ds-rating">${res.opponent.power}</div></div>
        </div>
        <div class="lanes" id="lanes">
          ${res.lanes.map((l, i) => {
            const a = byId.get(l.mine.id);
            const b = byId.get(l.theirs.id);
            return `
              <div class="lane pending" data-lane="${i}">
                <div class="lane-fighter mine" style="--rc:${rarityColour(a.rarity)}">
                  ${portrait(a, { size: 92 })}
                  <div class="lf-name">${esc(a.name)}</div>
                  <div class="lf-power" data-power="mine"></div>
                </div>
                <div class="lane-vs">
                  <div class="lane-no">Lane ${i + 1}</div>
                  <div class="lane-bolt">vs</div>
                  <div class="lane-verdict" data-verdict></div>
                </div>
                <div class="lane-fighter theirs" style="--rc:${rarityColour(b.rarity)}">
                  ${portrait(b, { size: 92 })}
                  <div class="lf-name">${esc(b.name)}</div>
                  <div class="lf-power" data-power="theirs"></div>
                </div>
              </div>`;
          }).join('')}
        </div>
        <div class="lane-result hidden" id="lane-result"></div>
      </div>`);
    wireTabs();

    battleRuntime = { res, i: 0 };
    setTimeout(() => revealLane(res), 600);
  }

  function revealLane(res) {
    if (!battleRuntime) return;
    const i = battleRuntime.i;
    if (i >= res.lanes.length) { finishBattle(res); return; }

    const lane = res.lanes[i];
    const el = view.querySelector(`[data-lane="${i}"]`);
    if (!el) return;

    el.classList.remove('pending');
    el.classList.add(lane.won ? 'won' : 'lost');
    el.querySelector('[data-power="mine"]').textContent = lane.mine.power +
      (lane.mine.mult > 1 ? '  ▲' : (lane.mine.mult < 1 ? '  ▼' : ''));
    el.querySelector('[data-power="theirs"]').textContent = lane.theirs.power +
      (lane.theirs.mult > 1 ? '  ▲' : (lane.theirs.mult < 1 ? '  ▼' : ''));
    el.querySelector('[data-verdict]').textContent = lane.won ? 'WON' : 'LOST';

    fx.play(lane.won ? 'correct' : 'wrong');
    fx.burstAt(el.querySelector(lane.won ? '.lane-fighter.mine' : '.lane-fighter.theirs'), { count: 16 });
    if (!lane.won) fx.shake('soft');

    const score = view.querySelector('#lane-score');
    const mine = res.lanes.slice(0, i + 1).filter((l) => l.won).length;
    const theirs = (i + 1) - mine;
    if (score) score.innerHTML = mine + ' &ndash; ' + theirs;

    battleRuntime.i += 1;
    setTimeout(() => revealLane(res), 1100);
  }

  async function finishBattle(res) {
    const g = G();
    const s = S();
    g.battles = g.battles || { wins: 0, losses: 0 };

    let prizeChar = null;
    let gems = 0;

    if (res.won) {
      g.battles.wins += 1;
      gems = 40;
      prizeChar = byId.get(res.prize);
      if (prizeChar) {
        const entry = g.owned[prizeChar.id] || { copies: 0, obtained: new Date().toISOString() };
        entry.copies += 1;
        g.owned[prizeChar.id] = entry;
        g.stolen = (g.stolen || 0) + 1;
      }
      fx.play('victory');
      fx.confetti(140);
      fx.slam('VICTORY', '#7fa650');
    } else {
      g.battles.losses += 1;
      gems = 8;
      fx.play('defeat');
      fx.shake('hard');
    }

    s.gems += gems;
    g.log = [{
      won: res.won,
      myWins: res.myWins,
      theirWins: res.theirWins,
      opponent: res.opponent.name,
      prize: res.prize,
      prizeName: prizeChar ? prizeChar.name : '',
      at: new Date().toISOString()
    }].concat(g.log || []).slice(0, 20);

    await ctx.save();
    ctx.paintTopbar();

    const box = view.querySelector('#lane-result');
    if (box) {
      box.classList.remove('hidden');
      box.innerHTML = `
        <div class="result-banner ${res.won ? 'win' : 'loss'}">${res.won ? 'VICTORY' : 'DEFEAT'}</div>
        <p>${res.myWins} lanes to ${res.theirWins}. +${gems} gems.</p>
        ${prizeChar ? `
          <div class="prize-card" style="--rc:${rarityColour(prizeChar.rarity)}">
            <div class="pz-art">${portrait(prizeChar, { size: 120 })}</div>
            <div>
              <div class="pz-kicker">Claimed from ${esc(res.opponent.name)}</div>
              <div class="pz-name">${esc(prizeChar.name)} ${stars(prizeChar.rarity)}</div>
              <div class="pz-desc">${esc(prizeChar.title)}</div>
            </div>
          </div>` : (res.won ? '' : '<p class="panel-note">No spirit changes hands after a loss. Your team is untouched.</p>')}
        <div class="row">
          <button class="btn ghost" id="lr-team">Adjust team</button>
          <button class="btn" id="lr-again">Battle again</button>
        </div>`;
      document.getElementById('lr-team').onclick = () => { screen = 'team'; render(); };
      document.getElementById('lr-again').onclick = () => { screen = 'battle'; render(); };
    }
    battleRuntime = null;
    ctx.checkBadges({ battleWon: res.won });
  }

  /* ------------------------------------------------------------ render */

  async function render() {
    await ensureMeta();
    const g = G();
    g.owned = g.owned || {};
    g.team = (g.team || []).filter((id) => byId.has(id) && g.owned[id]);

    // Keep the lesson XP bonus current even if the player never opens the Team tab.
    if (g.team.length === 3) {
      const tp = await api.gacha.teamPower(teamEntries());
      if (tp) g.xpBonus = xpBonusPercent(tp.total);
    } else {
      g.xpBonus = 0;
    }

    let inner = '';
    if (screen === 'summon') inner = summonScreen();
    else if (screen === 'collection') inner = collectionScreen();
    else if (screen === 'team') inner = await teamScreen();
    else inner = battleScreen();

    view.innerHTML = shell(inner);
    wireTabs();
    if (screen === 'summon') wireSummon();
    else if (screen === 'collection') wireCollection();
    else if (screen === 'team') wireTeam();
    else wireBattle();
  }

  function leave() {
    battleRuntime = null;
  }

  return { render, leave, TICKET_MAX, xpBonusPercent };
}
