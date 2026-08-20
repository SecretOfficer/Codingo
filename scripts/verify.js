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
