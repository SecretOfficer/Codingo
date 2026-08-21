/* Content and wiring gate. Run with `npm run verify` before packaging or publishing.
   Checks every exercise, lab and duel problem for the mistakes that only show up in
   front of a learner: an answer index out of range, a word bank missing its own answer,
   a blank count that does not match, a lab challenge that throws, a duplicate id. */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..');
const problems = [];
let checks = 0;

function check(condition, message) {
  checks++;
  if (!condition) problems.push(message);
}

const EXERCISE_TYPES = ['mcq', 'output', 'blank', 'type', 'numeric', 'order', 'match', 'bug', 'code'];

function verifyExercise(ex, where) {
  check(EXERCISE_TYPES.includes(ex.type), `${where}: unknown type "${ex.type}"`);
  check(typeof ex.explain === 'string' && ex.explain.length > 10, `${where}: missing or trivial explanation`);

  switch (ex.type) {
    case 'mcq':
    case 'output':
      check(Array.isArray(ex.options) && ex.options.length >= 2, `${where}: needs at least two options`);
      check(Number.isInteger(ex.answer) && ex.answer >= 0 && ex.answer < (ex.options || []).length,
        `${where}: answer index out of range`);
      check(new Set(ex.options).size === (ex.options || []).length, `${where}: duplicate options`);
      break;

    case 'blank': {
      const blanks = (ex.code.match(/_{3,}/g) || []).length;
      check(blanks > 0, `${where}: blank exercise has no ____ placeholder`);
      check(Array.isArray(ex.answer) && ex.answer.length === blanks,
        `${where}: ${blanks} blanks but ${(ex.answer || []).length} answers`);
      check(Array.isArray(ex.bank) && ex.bank.length >= 2, `${where}: word bank too small`);
      (ex.answer || []).forEach((a) => check((ex.bank || []).includes(a),
        `${where}: answer "${a}" is not in the word bank`));
      break;
    }

    case 'type':
      check(Array.isArray(ex.answer) && ex.answer.length >= 1, `${where}: no accepted answers`);
      break;

    case 'numeric':
      check(typeof ex.answer === 'number' && Number.isFinite(ex.answer), `${where}: answer must be a number`);
      check(ex.tol === undefined || (typeof ex.tol === 'number' && ex.tol >= 0), `${where}: bad tolerance`);
      break;

    case 'order':
      check(Array.isArray(ex.lines) && ex.lines.length >= 2, `${where}: needs at least two lines`);
      check(new Set(ex.lines).size === (ex.lines || []).length,
        `${where}: duplicate lines make the order ambiguous`);
      break;

    case 'match':
      check(Array.isArray(ex.pairs) && ex.pairs.length >= 2, `${where}: needs at least two pairs`);
      (ex.pairs || []).forEach((p) => check(Array.isArray(p) && p.length === 2, `${where}: malformed pair`));
      check(new Set((ex.pairs || []).map((p) => p[0])).size === (ex.pairs || []).length,
        `${where}: duplicate left-hand terms`);
      check(new Set((ex.pairs || []).map((p) => p[1])).size === (ex.pairs || []).length,
        `${where}: duplicate right-hand terms`);
      break;

    case 'bug':
      check(Array.isArray(ex.lines) && ex.lines.length >= 2, `${where}: needs at least two lines`);
      check(Number.isInteger(ex.answer) && ex.answer >= 0 && ex.answer < (ex.lines || []).length,
        `${where}: bug line index out of range`);
      break;

    case 'code':
      check(typeof ex.expectOutput === 'string' && ex.expectOutput.length > 0,
        `${where}: code exercise needs an expected output`);
      break;
  }
}

async function main() {
  const course = await import(pathToFileURL(path.join(ROOT, 'src', 'course', 'index.js')).href);
  const labsMod = await import(pathToFileURL(path.join(ROOT, 'src', 'labs.js')).href);
  const arena = require(path.join(ROOT, 'arena-engine.js'));
  const duel = require(path.join(ROOT, 'arena-problems.js'));

  /* ---------------------------------------------------------- course */

  const lessonIds = new Set();
  let exerciseCount = 0;

  course.subjects.forEach((subject) => {
    check(subject.units.length > 0, `subject ${subject.id}: no units`);
    subject.units.forEach((unit) => {
      unit.lessons.forEach((lesson) => {
        check(!lessonIds.has(lesson.id), `duplicate lesson id ${lesson.id}`);
        lessonIds.add(lesson.id);
        if (lesson.review) {
          check(course.unitPool(unit.id).length >= lesson.size,
            `${unit.id} review wants ${lesson.size} questions but the unit only holds ${course.unitPool(unit.id).length}`);
          return;
        }
        check(lesson.exercises.length >= 6,
          `${lesson.id}: only ${lesson.exercises.length} exercises, lessons draw 6`);
        lesson.exercises.forEach((ex, i) => {
          exerciseCount++;
          verifyExercise(ex, `${lesson.id}[${i}] (${ex.type})`);
        });
      });
    });
  });

  // Worlds must cover the coding units exactly once.
  const coding = course.getSubject('code');
  const covered = course.worlds.flatMap((w) => w.units);
  check(new Set(covered).size === covered.length, 'a unit appears in two worlds');
  coding.units.forEach((u) => check(covered.includes(u.id), `unit ${u.id} belongs to no world`));

  /* ------------------------------------------------------------ labs */

  const labIds = new Set();
  labsMod.labs.forEach((lab) => {
    check(!labIds.has(lab.id), `duplicate lab id ${lab.id}`);
    labIds.add(lab.id);
    check(!!course.getSubject(lab.subject), `lab ${lab.id}: subject "${lab.subject}" does not exist`);
    check(lab.challenges.length >= 3, `lab ${lab.id}: fewer than three challenges`);

    if (lab.code) {
      lab.challenges.forEach((c) => check(typeof c.expect === 'string' && c.expect.length > 0,
        `lab ${lab.id} ${c.id}: code challenge has no expected output`));
      return;
    }
    const params = lab.params;
    const state = labsMod.labState(lab);
    const derived = lab.derive(state);
    check(derived && typeof derived === 'object', `lab ${lab.id}: derive() returned nothing`);
    check(lab.readout(state, derived).length > 0, `lab ${lab.id}: empty readout`);

    // Every challenge ships a settings combination that solves it; prove each one works
    // and that its values are actually reachable with the controls on screen.
    lab.challenges.forEach((c) => {
      check(!!c.solve, `lab ${lab.id} challenge ${c.id}: no declared solution`);
      if (!c.solve) return;

      params.forEach((p) => {
        const v = c.solve[p.key];
        check(v !== undefined, `lab ${lab.id} ${c.id}: solution leaves "${p.key}" unset`);
        if (v === undefined) return;
        if (p.type === 'choice') {
          check(p.options.includes(v), `lab ${lab.id} ${c.id}: "${v}" is not an option for ${p.key}`);
        } else {
          check(v >= p.min && v <= p.max, `lab ${lab.id} ${c.id}: ${p.key}=${v} is outside ${p.min}..${p.max}`);
          const steps = (v - p.min) / p.step;
          check(Math.abs(steps - Math.round(steps)) < 1e-6,
            `lab ${lab.id} ${c.id}: ${p.key}=${v} does not land on a step of ${p.step}`);
        }
      });

      try {
        check(c.check(c.solve, lab.derive(c.solve)),
          `lab ${lab.id}: declared solution does not satisfy "${c.text}"`);
      } catch (err) {
        problems.push(`lab ${lab.id} ${c.id}: check() threw on its own solution — ${err.message}`);
      }
    });

    // Random sweep: nothing in the parameter space may throw or produce a non-finite readout.
    const rand = (p) => (p.type === 'choice'
      ? p.options[Math.floor(Math.random() * p.options.length)]
      : p.min + Math.round(Math.random() * (p.max - p.min) / p.step) * p.step);

    for (let i = 0; i < 2000; i++) {
      const s = {};
      params.forEach((p) => { s[p.key] = rand(p); });
      let d;
      try { d = lab.derive(s); } catch (err) {
        problems.push(`lab ${lab.id}: derive() threw on ${JSON.stringify(s)} — ${err.message}`);
        break;
      }
      const bad = lab.readout(s, d).find((r) => String(r.value).includes('NaN') || String(r.value).includes('Infinity'));
      if (bad) {
        problems.push(`lab ${lab.id}: readout "${bad.label}" is ${bad.value} at ${JSON.stringify(s)}`);
        break;
      }
      let threw = false;
      lab.challenges.forEach((c) => {
        try { c.check(s, d); } catch (err) {
          if (!threw) problems.push(`lab ${lab.id} ${c.id}: check() threw — ${err.message}`);
          threw = true;
        }
      });
      if (threw) break;
    }
    checks += 2;
  });

  /* ----------------------------------------------------- duel problems */

  const duelIds = new Set();
  duel.DEBUG_PROBLEMS.concat(duel.VIBECODE_PROBLEMS).forEach((p) => {
    check(!duelIds.has(p.id), `duplicate duel problem id ${p.id}`);
    duelIds.add(p.id);
    check(p.tests.length >= 3, `duel ${p.id}: fewer than three tests`);
    check(p.limitSeconds >= 60, `duel ${p.id}: time limit is too tight`);
    check(p.difficulty > 0 && p.difficulty <= 1, `duel ${p.id}: difficulty out of range`);
    check(!!(p.code || p.starter), `duel ${p.id}: no starting code`);
    const view = duel.publicView(p, 'debug');
    check(!('tests' in view), `duel ${p.id}: public view leaks the tests`);
  });

  /* ------------------------------------------------------------- codex */

  const gacha = require(path.join(ROOT, 'gacha-engine.js'));
  const art = await import(pathToFileURL(path.join(ROOT, 'src', 'gacha-art.js')).href);

  const charIds = new Set();
  const perRarity = { 3: 0, 4: 0, 5: 0 };
  gacha.ROSTER.forEach((c) => {
    check(!charIds.has(c.id), `duplicate character id ${c.id}`);
    charIds.add(c.id);
    check([3, 4, 5].includes(c.rarity), `${c.id}: bad rarity`);
    perRarity[c.rarity] = (perRarity[c.rarity] || 0) + 1;
    check(gacha.SUBJECTS.includes(c.subject), `${c.id}: unknown subject "${c.subject}"`);
    check(gacha.CLASSES.includes(c.klass), `${c.id}: unknown class "${c.klass}"`);
    check(c.palette.length === 3 && c.palette.every((h) => /^#[0-9a-f]{6}$/i.test(h)),
      `${c.id}: palette must be three hex colours`);
    check(c.lore.length > 30 && c.skill.length > 10, `${c.id}: lore or skill text too thin`);
    check(!!c.title && !!c.name, `${c.id}: missing name or title`);

    // Power must not overlap between rarities, or the ladder of value collapses.
    if (c.rarity === 5) check(c.power >= 190, `${c.id}: five star under 190 power`);
    if (c.rarity === 4) check(c.power >= 118 && c.power <= 140, `${c.id}: four star outside 118-140`);
    if (c.rarity === 3) check(c.power >= 55 && c.power <= 75, `${c.id}: three star outside 55-75`);

    const svg = art.portrait(c, { size: 100 });
    check(svg.startsWith('\n<svg') || svg.trim().startsWith('<svg'), `${c.id}: portrait is not an svg`);
    check(!svg.includes('undefined') && !svg.includes('NaN'), `${c.id}: portrait has holes in it`);
  });
  check(perRarity[5] >= 4 && perRarity[4] >= 8 && perRarity[3] >= 8,
    `roster is lopsided: ${JSON.stringify(perRarity)}`);
  gacha.CLASSES.forEach((k) => check(gacha.ROSTER.some((c) => c.klass === k && c.rarity === 3),
    `no three star ${k}, so a beginner cannot answer that class`));

  // Simulate a long pull history: rates should land near the advertised numbers and
  // pity must never be exceeded.
  let pity = { since5: 0, since4: 0 };
  const ownedSim = {};
  const counts = { 3: 0, 4: 0, 5: 0 };
  let longest5 = 0;
  let longest4 = 0;
  let run5 = 0;
  let run4 = 0;
  for (let i = 0; i < 4000; i++) {
    const res = gacha.pull(1, pity, ownedSim);
    pity = res.pity;
    const r = res.results[0];
    counts[r.rarity]++;
    ownedSim[r.id] = true;
    run5 = r.rarity === 5 ? 0 : run5 + 1;
    run4 = r.rarity >= 4 ? 0 : run4 + 1;
    longest5 = Math.max(longest5, run5);
    longest4 = Math.max(longest4, run4);
  }
  const rate5 = counts[5] / 4000;
  const rate4 = counts[4] / 4000;
  check(rate5 >= gacha.RATES[5] * 0.7 && rate5 <= gacha.RATES[5] * 2.2,
    `five star rate off: ${(rate5 * 100).toFixed(2)}% against an advertised ${(gacha.RATES[5] * 100).toFixed(0)}%`);
  check(rate4 >= gacha.RATES[4] * 0.7 && rate4 <= gacha.RATES[4] * 2.2,
    `four star rate off: ${(rate4 * 100).toFixed(2)}%`);
  check(longest5 < gacha.PITY_5, `went ${longest5} pulls without a five star, pity is ${gacha.PITY_5}`);
  check(longest4 < gacha.PITY_4, `went ${longest4} pulls without a four star, pity is ${gacha.PITY_4}`);

  // Class triangle must be a genuine cycle.
  gacha.CLASSES.forEach((k) => {
    const beaten = gacha.BEATS[k];
    check(gacha.classMultiplier(k, beaten) > 1, `${k} should beat ${beaten}`);
    check(gacha.classMultiplier(beaten, k) < 1, `${beaten} should lose to ${k}`);
    check(gacha.classMultiplier(k, k) === 1, `${k} against itself should be neutral`);
  });

  // Awakening and synergy behave monotonically.
  const sample = gacha.ROSTER[0];
  check(gacha.characterPower(sample, 3) > gacha.characterPower(sample, 1), 'duplicates must raise power');
  check(gacha.characterPower(sample, 20) === gacha.characterPower(sample, 1 + gacha.AWAKEN_MAX),
    'awakening must cap out');

  const same = [0, 1, 2].map(() => ({ char: gacha.ROSTER.find((c) => c.subject === 'code'), copies: 1 }));
  check(gacha.teamSynergy(same.map((e) => e.char)).mult > 1.15, 'single discipline bonus missing');

  // A stronger team should win far more often than it loses.
  const strong = [gacha.ROSTER[0], gacha.ROSTER[1], gacha.ROSTER[2]]
    .map((c) => ({ id: c.id, klass: c.klass, power: c.power }));
  const weak = gacha.ROSTER.filter((c) => c.rarity === 3).slice(0, 3)
    .map((c) => ({ id: c.id, klass: c.klass, power: c.power }));
  let strongWins = 0;
  for (let i = 0; i < 400; i++) if (gacha.resolveBattle(strong, weak).won) strongWins++;
  check(strongWins >= 380, `power should decide battles: strong team won only ${strongWins}/400`);

  let coinflips = 0;
  for (let i = 0; i < 400; i++) if (gacha.resolveBattle(strong, strong.slice()).won) coinflips++;
  check(coinflips > 120 && coinflips < 280, `mirror match should be near even, got ${coinflips}/400`);

  const foe = gacha.makeOpponentTeam(600, 'Test');
  check(foe.team.length === 3, 'opponent team must have three members');
  check(new Set(foe.team.map((t) => t.id)).size === 3, 'opponent team has duplicates');

  // A full battle through the same path the app uses must be close to a coin flip:
  // matchmaking scales the rival to the player, so neither side may be handicapped.
  const sampleTeams = [
    ['nullwyrm', 'primearch', 'recursa'],
    ['printling', 'cellet', 'fracton'],
    ['photonet', 'acidra', 'isotopia']
  ];
  sampleTeams.forEach((ids) => {
    const entries = ids.map((id) => ({ id, copies: 1 }));
    let wins = 0;
    let laneWins = 0;
    for (let i = 0; i < 600; i++) {
      const r = gacha.runBattle(entries, {}, 'Test');
      if (!r) { problems.push('runBattle returned nothing for ' + ids.join(', ')); return; }
      if (r.won) wins++;
      laneWins += r.myWins;
      if (r.won) check(!!r.prize, 'a won battle must award a prize');
    }
    const rate = wins / 600;
    checks++;
    if (rate < 0.35 || rate > 0.65) {
      problems.push(`battle balance is skewed for [${ids.join(', ')}]: won ${(rate * 100).toFixed(1)}% of 600`);
    }
    check(laneWins / 1800 > 0.35 && laneWins / 1800 < 0.65,
      `lane win share skewed for [${ids.join(', ')}]: ${(laneWins / 1800 * 100).toFixed(1)}%`);
  });

  check(gacha.runBattle([{ id: 'not_a_character', copies: 1 }], {}, 'x') === null,
    'runBattle must reject an unknown character instead of guessing');

  /* ------------------------------------------------------ rating engine */

  const ref = arena.rate({ rating: 1500, rd: 200, vol: 0.06 }, [
    { rating: 1400, rd: 30, score: 1 },
    { rating: 1550, rd: 100, score: 0 },
    { rating: 1700, rd: 300, score: 0 }
  ]);
  check(Math.abs(ref.rating - 1464.06) < 0.5, `Glicko-2 rating drifted: got ${ref.rating}, expected ~1464.06`);
  check(Math.abs(ref.rd - 151.52) < 0.5, `Glicko-2 deviation drifted: got ${ref.rd}, expected ~151.52`);

  const pool = arena.makePool(150);
  check(new Set(pool.map((p) => p.name)).size === pool.length, 'ladder has duplicate names');
  check(arena.tierFor(0.004).id === 'grandmaster' && arena.tierFor(1).id === 'bronze', 'tier cuts are wrong');
  check(arena.bandAt(0) < arena.bandAt(5000), 'matchmaking band does not widen');

  /* ------------------------------------------------------------ assets */

  ['build/icon.png', 'main.js', 'preload.js', 'src/index.html', 'src/styles.css', 'LICENSE', 'README.md']
    .forEach((f) => check(fs.existsSync(path.join(ROOT, f)), `missing file ${f}`));

  const pkg = require(path.join(ROOT, 'package.json'));
  pkg.build.files.filter((f) => !f.startsWith('!') && !f.includes('*'))
    .forEach((f) => check(fs.existsSync(path.join(ROOT, f)), `packaged file "${f}" does not exist`));

  // Anything main.js requires from the project root must be inside build.files, or the
  // packaged app dies on startup while the dev run stays perfectly happy.
  const mainSource = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
  const localRequires = [...mainSource.matchAll(/require\(['"]\.\/([^'"]+)['"]\)/g)].map((m) => m[1]);
  check(localRequires.length > 0, 'could not read main.js requires');
  localRequires.forEach((rel) => {
    const file = rel.endsWith('.js') ? rel : rel + '.js';
    check(fs.existsSync(path.join(ROOT, file)), `main.js requires missing file ${file}`);
    const packaged = pkg.build.files.some((pattern) =>
      pattern === file || pattern === rel || pattern.includes('**'));
    check(packaged, `main.js requires "${file}" but build.files does not ship it`);
  });

  /* ------------------------------------------------------------ report */

  console.log(`lessons ${lessonIds.size}  exercises ${exerciseCount}  labs ${labsMod.labs.length}  duel problems ${duelIds.size}`);
  console.log(`${checks} checks run`);
  if (problems.length) {
    console.error('\nFAILED:');
    problems.forEach((p) => console.error('  - ' + p));
    process.exit(1);
  }
  console.log('all content verified');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
