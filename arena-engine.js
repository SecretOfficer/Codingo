/* Arena engine — the authority for matchmaking, judging and rating.
   Everything here runs in the Electron main process. The renderer never computes a
   rating, never decides a winner and never sees the answer key; it asks and displays. */

const TAU = 0.5;
const SCALE = 173.7178;
const DEFAULT_RATING = 1500;
const DEFAULT_RD = 350;
const DEFAULT_VOL = 0.06;

/* ------------------------------------------------------------- Glicko-2 */

function toGlicko(p) {
  return { mu: (p.rating - DEFAULT_RATING) / SCALE, phi: p.rd / SCALE, sigma: p.vol };
}

function gFactor(phi) {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

function expected(mu, muJ, phiJ) {
  return 1 / (1 + Math.exp(-gFactor(phiJ) * (mu - muJ)));
}

// Illinois-algorithm root find for the new volatility, as in Glickman's paper.
function newVolatility(phi, sigma, delta, v) {
  const a = Math.log(sigma * sigma);
  const f = (x) => {
    const ex = Math.exp(x);
    const num = ex * (delta * delta - phi * phi - v - ex);
    const den = 2 * Math.pow(phi * phi + v + ex, 2);
    return num / den - (x - a) / (TAU * TAU);
  };

  let A = a;
  let B;
  if (delta * delta > phi * phi + v) {
    B = Math.log(delta * delta - phi * phi - v);
  } else {
    let k = 1;
    while (f(a - k * TAU) < 0 && k < 100) k++;
    B = a - k * TAU;
  }

  let fA = f(A);
  let fB = f(B);
  let guard = 0;
  while (Math.abs(B - A) > 0.000001 && guard++ < 200) {
    const C = A + ((A - B) * fA) / (fB - fA);
    const fC = f(C);
    if (fC * fB <= 0) { A = B; fA = fB; } else { fA = fA / 2; }
    B = C;
    fB = fC;
  }
  return Math.exp(A / 2);
}

/**
 * Rate one player against a list of results.
 * @param {{rating:number,rd:number,vol:number}} player
 * @param {Array<{rating:number,rd:number,score:number}>} results score: 1 win, 0.5 draw, 0 loss
 */
function rate(player, results) {
  const p = toGlicko(player);

  if (!results.length) {
    const phiStar = Math.min(Math.sqrt(p.phi * p.phi + p.sigma * p.sigma), DEFAULT_RD / SCALE);
    return { rating: player.rating, rd: phiStar * SCALE, vol: player.vol };
  }

  let vInv = 0;
  let deltaSum = 0;
  results.forEach((r) => {
    const o = toGlicko(r);
    const g = gFactor(o.phi);
    const e = expected(p.mu, o.mu, o.phi);
    vInv += g * g * e * (1 - e);
    deltaSum += g * (r.score - e);
  });

  const v = 1 / vInv;
  const delta = v * deltaSum;
  const sigmaNew = newVolatility(p.phi, p.sigma, delta, v);
  const phiStar = Math.sqrt(p.phi * p.phi + sigmaNew * sigmaNew);
  const phiNew = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const muNew = p.mu + phiNew * phiNew * deltaSum;

  return {
    rating: Math.round((muNew * SCALE + DEFAULT_RATING) * 100) / 100,
    rd: Math.max(30, Math.min(DEFAULT_RD, Math.round(phiNew * SCALE * 100) / 100)),
    vol: Math.round(sigmaNew * 1000000) / 1000000
  };
}

/** Probability the first player beats the second, used to simulate bot outcomes. */
function winChance(a, b) {
  const pa = toGlicko(a);
  const pb = toGlicko(b);
  return expected(pa.mu, pb.mu, Math.sqrt(pa.phi * pa.phi + pb.phi * pb.phi));
}

/* ------------------------------------------------------------------ tiers */

const TIERS = [
  { id: 'grandmaster', name: 'Grandmaster', cut: 0.005, color: '#ff4b4b' },
  { id: 'master', name: 'Master', cut: 0.02, color: '#a560ff' },
  { id: 'diamond', name: 'Diamond', cut: 0.06, color: '#1cb0f6' },
  { id: 'platinum', name: 'Platinum', cut: 0.15, color: '#2ec4b6' },
  { id: 'gold', name: 'Gold', cut: 0.30, color: '#ffc800' },
  { id: 'silver', name: 'Silver', cut: 0.55, color: '#c3ccdb' },
  { id: 'bronze', name: 'Bronze', cut: 1.0, color: '#cd7f32' }
];

/** Percentile-based tiers recompute against the live population, so they cannot inflate. */
function tierFor(percentile) {
  for (const t of TIERS) if (percentile <= t.cut) return t;
  return TIERS[TIERS.length - 1];
}

function standings(pool, me) {
  const all = pool.concat([me]).sort((a, b) => b.rating - a.rating);
  const rank = all.findIndex((p) => p.id === me.id) + 1;
  const percentile = rank / all.length;
  return { all, rank, total: all.length, percentile, tier: tierFor(percentile) };
}

/* -------------------------------------------------------------- bot pool */

const HANDLE_A = ['byte', 'null', 'stack', 'quantum', 'kernel', 'pixel', 'cyber', 'lambda', 'delta', 'neo',
  'turbo', 'hyper', 'zero', 'mega', 'proto', 'echo', 'vector', 'binary', 'atomic', 'silent',
  'crimson', 'frost', 'solar', 'lunar', 'rogue', 'iron', 'nova', 'flux', 'omega', 'ember'];
const HANDLE_B = ['fox', 'wolf', 'hawk', 'coder', 'ninja', 'smith', 'ghost', 'raptor', 'monk', 'ranger',
  'spark', 'blade', 'scribe', 'weaver', 'runner', 'drift', 'forge', 'pulse', 'sage', 'crow',
  'lynx', 'otter', 'viper', 'finch', 'moth', 'quill', 'reef', 'stone', 'tide', 'wren'];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePool(size, seed) {
  const rnd = mulberry32(seed || 20260820);
  const used = new Set();
  const pool = [];
  for (let i = 0; i < size; i++) {
    let handle;
    let guard = 0;
    do {
      handle = HANDLE_A[Math.floor(rnd() * HANDLE_A.length)] + '_' +
        HANDLE_B[Math.floor(rnd() * HANDLE_B.length)] + (rnd() < 0.4 ? Math.floor(rnd() * 90 + 10) : '');
      guard++;
    } while (used.has(handle) && guard < 30);
    used.add(handle);

    // Box-Muller, so the ladder has a realistic bell shape instead of a flat spread.
    const u1 = Math.max(1e-9, rnd());
    const u2 = rnd();
    const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const rating = Math.round(Math.max(750, Math.min(2650, 1500 + gauss * 290)));

    pool.push({
      id: 'bot' + i,
      name: handle,
      rating,
      rd: Math.round(50 + rnd() * 70),
      vol: DEFAULT_VOL,
      wins: Math.floor(rnd() * 120),
      losses: Math.floor(rnd() * 120),
      bot: true
    });
  }
  return pool;
}

/** A small random walk so the ladder is not frozen between sessions. */
function driftPool(pool, days) {
  if (!days) return pool;
  const rnd = mulberry32(Date.now() & 0xffff);
  return pool.map((b) => {
    const step = (rnd() - 0.5) * 26 * Math.min(days, 5);
    return Object.assign({}, b, { rating: Math.round(Math.max(700, Math.min(2700, b.rating + step))) });
  });
}

/* -------------------------------------------------------- matchmaking */

/** The queue band widens over time: fair pairing first, then a reasonable wait. */
function bandAt(waitedMs) {
  return Math.min(400, 60 + Math.floor(waitedMs / 600) * 40);
}

function findOpponent(pool, me, waitedMs, excludeIds) {
  const band = bandAt(waitedMs);
  const skip = new Set(excludeIds || []);
  const eligible = pool.filter((b) => !skip.has(b.id) && Math.abs(b.rating - me.rating) <= band);
  const from = eligible.length ? eligible : pool.slice().sort(
    (a, b) => Math.abs(a.rating - me.rating) - Math.abs(b.rating - me.rating)
  ).slice(0, 5);
  return { opponent: from[Math.floor(Math.random() * from.length)], band };
}

/* ------------------------------------------------- opponent simulation */

/**
 * How long a bot takes to solve, and whether it solves at all.
 * Stronger bots are faster and more reliable; every duel still has variance.
 */
function simulateOpponent(bot, problemDifficulty, limitSeconds) {
  const skill = (bot.rating - 800) / 1800;                  // 0 .. 1
  const base = limitSeconds * (1.15 - 0.72 * skill) * (0.6 + problemDifficulty * 0.5);
  const jitter = base * (0.75 + Math.random() * 0.6);
  const solveChance = Math.max(0.12, Math.min(0.97, 0.25 + skill * 0.8 - problemDifficulty * 0.18));
  const solves = Math.random() < solveChance;
  return {
    solves,
    seconds: solves ? Math.max(6, Math.round(jitter)) : limitSeconds + 1,
    solveChance
  };
}

/* --------------------------------------------------------------- season */

const SEASON_DAYS = 14;

function seasonInfo(season) {
  const start = new Date(season.startedAt);
  const end = new Date(start.getTime() + SEASON_DAYS * 86400000);
  const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
  return { number: season.number, startedAt: season.startedAt, endsAt: end.toISOString(), daysLeft, expired: daysLeft === 0 };
}

/** Soft reset: half the distance back to 1500, uncertainty restored. */
function softReset(player) {
  return {
    rating: Math.round(DEFAULT_RATING + (player.rating - DEFAULT_RATING) * 0.5),
    rd: Math.min(DEFAULT_RD, player.rd + 110),
    vol: DEFAULT_VOL
  };
}

module.exports = {
  DEFAULT_RATING, DEFAULT_RD, DEFAULT_VOL, TIERS, SEASON_DAYS,
  rate, winChance, tierFor, standings, makePool, driftPool,
  bandAt, findOpponent, simulateOpponent, seasonInfo, softReset
};
