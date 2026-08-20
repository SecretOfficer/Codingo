# Codingo

A gamified e-learning desktop platform that teaches STEM and coding to school students through
interactive gameplay, live progress tracking and virtual labs. Built with Electron; runs fully offline.

## Running it

```bash
npm install     # first time only
npm start
```

`npm run dev` starts the same app with DevTools open. Python is optional but recommended: it powers the
write-code exercises and the Python sandbox lab.

## What is inside

**Five subjects, 72 lessons, ~340 authored exercises.**

| Subject | Units | Covers |
|---------|-------|--------|
| Coding | 8 | print, variables, strings, logic, lists and loops, functions, dicts/sets/tuples, classes and errors |
| Mathematics | 2 | fractions, powers, equations, angles, area and volume, averages and probability |
| Physics | 2 | speed and acceleration, forces, projectiles, energy, circuits, heat and waves |
| Chemistry | 2 | atomic structure, periodic table, bonding, reactions, acids and bases, states and mixtures |
| Biology | 2 | cells, body systems, plants, DNA and inheritance, evolution, ecosystems |

Each unit ends with a generated **Unit Review** that resamples everything in that unit.

## Engaging and educational gameplay

Lessons are short tap-through sessions built from seven exercise types, so the interaction changes
every screen:

- **Multiple choice** and **predict-the-output** — options are shuffled on every render.
- **Fill the blank** — tap words from a bank into gaps in a formula or snippet.
- **Numeric answer** — typed values checked against a tolerance, used across maths and science.
- **Type the answer** — free text, normalised before comparison.
- **Order the lines** — assemble a working program, a method, or a food chain, by tapping *or* by
  dragging rows between the pool and your answer and reordering them in place.
- **Match pairs** — connect terms to meanings.
- **Click the bug** — a short program is shown line by line; click the line that carries the fault.
  It is the same skill the Debug Duel tests, introduced gently.
- **Write code** — a real editor whose program is executed by the local Python interpreter and whose
  stdout is compared with the expected output.

The coding track is laid out as five themed worlds from the pitch — **Syntax Sands, Logic Lagoon,
Structure Steppes, Algorithm Ascent, Architect's Apex** — each with a progress ring over the lessons it
contains.

Game mechanics: five hearts (one lost per miss, refilled next day or for 100 gems), three crowns per
lesson, gems, a daily XP goal and a day streak. XP per answer is live-multiplied by a **combo**: three
correct in a row gives x1.2, five gives x1.5, eight gives x2, and any wrong answer resets it. Answering
in under eight seconds adds a **speed bonus**. Both are shown in the lesson header as they change, and
summarised on the completion screen. A missed question is pushed back into the queue, so no lesson ends
until everything in it has been answered correctly at least once.

## Ranked Arena — the competitive layer

`Arena` tab. Skill-matched 1v1 duels with a real rating system.

- **Glicko-2 rating**, implemented in full (rating, deviation, volatility, Illinois root-finding for σ′).
  Verified against Glickman's published worked example: 1500/200 vs three opponents returns
  **1464.05 / 151.52 / 0.059996** against the paper's 1464.06 / 151.52 / 0.05999.
- **Server-authoritative by design.** All rating maths, problem selection and code judging run in the
  Electron main process (`arena-engine.js`, `arena-problems.js`). The duel screen never sees the hidden
  tests, never decides a winner and never computes a rating — it submits and displays. Slide 4's
  architecture principle holds inside a desktop app.
- **Placement**: the first five duels are placements; your rating is hidden until they are done.
- **Matchmaking**: the queue starts at a ±60 rating window and widens by 40 every 0.6 s up to ±400, so
  fair pairing comes first and the wait stays bounded. The widening band is shown live while searching.
- **Percentile tiers**: Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster, cut as
  percentages of the live 150-player ladder and recomputed on every open, so tiers cannot inflate.
- **Seasons**: 14 days, then a soft reset that pulls every rating halfway back to 1500 and widens its
  deviation.
- **Three modes**:
  - **Debug Duel** — a working function has been broken; run the hidden tests as often as you like, but
    only a submission ends the duel. 12 problems, each verified so the shipped code fails and a correct fix passes.
  - **1-Shot Vibecode Duel** — read the spec, write the function, submit exactly once. No test runs,
    no retry. 10 problems.
  - **Rapid STEM Duel** — six questions drawn from every subject, 20 s each, scored against the opponent.
- **Opponent model**: opponents are simulated from the ladder, not networked. Their solve time and
  success chance come from their rating and the problem's difficulty, and their progress bar ticks in
  real time during the duel. This is the one place the app is honest about not having a backend.

## Real-time progress tracking and feedback

- **Instant feedback**: every answer is marked the moment you submit it, with the correct answer and a
  written explanation of *why* — not just right or wrong.
- **Live in-lesson readout**: the header carries a running accuracy percentage and XP counter that update
  after each question.
- **Progress dashboard** (`Progress` tab): total XP, day streak, answers given, time on task, active days
  and labs cleared; a 14-day XP bar chart; an accuracy donut; per-subject mastery bars with accuracy and
  minutes; and a **Needs another look** list of every topic below 85% mastery with a one-click *Practise*
  button.
- **Coaching after each lesson**: the completion screen names your weakest topic, links straight to
  practising it, and suggests a lab that demonstrates what you just learned.
- **Export**: a JSON snapshot or a per-topic CSV table for a teacher, written wherever you choose.

## Integration with virtual labs

Six labs (`Virtual Labs` tab). Each is a live simulation — move a control and the underlying maths is
recomputed and redrawn immediately, with challenges checked continuously and paid in XP. Labs never
cost hearts, so experimenting is free.

| Lab | Subject | What it simulates |
|-----|---------|-------------------|
| Circuit Bench | Physics | Two resistors in series or parallel; live Ohm law, per-component voltage, power and animated charge flow |
| Projectile Range | Physics | Trajectory, range, peak height and flight time under Earth, Moon or Mars gravity, with a target to hit |
| Titration Bench | Chemistry | 50 mL of acid titrated with alkali; real pH calculation, indicator colour and a live titration curve |
| Quadratic Grapher | Mathematics | y = ax² + bx + c with roots, discriminant and vertex, plus a mystery curve to match |
| Punnett Square | Biology | Crosses two genotypes and reports genotype and phenotype ratios |
| Python Sandbox | Coding | A free editor wired to the local interpreter; output is matched against four open challenges |

## SDG alignment

The `Impact` tab states the alignment inside the app, tied to features you can open:

- **SDG 4 — Quality education.** Five subjects across 72 lessons, every answer explained immediately,
  per-topic mastery tracked and weak topics resurfaced for repractice.
- **SDG 9 — Industry, innovation and infrastructure.** Six virtual labs stand in for equipment a school
  may not own, and the coding track builds the skills the goal asks countries to grow.
- **SDG 10 — Reduced inequalities.** No account, no subscription, no telemetry and no network calls;
  progress is a local file the learner owns and can export. Accessibility settings scale text to 130%,
  offer a high-contrast palette, and reduce animation.

## Keyboard

`1`–`9` pick an option or word chip, `Enter` checks and continues, `Esc` quits the lesson,
`Tab` inserts four spaces in any code editor, `Ctrl+Enter` runs code.

## Layout

```
main.js              Electron main: window, storage, Python runner, arena IPC, report export
arena-engine.js      authority: Glicko-2, percentile tiers, ladder, matchmaking, opponent model, seasons
arena-problems.js    duel problems, the hidden test harness, and the client-safe view of a problem
preload.js           contextBridge API exposed to the renderer
src/index.html       shell markup and nav
src/styles.css       all styling, including high-contrast and reduced-motion modes
src/app.js           renderer: routing, worlds path, lesson engine, labs shell, dashboard, SDG page
src/arena-ui.js      renderer: rank card, queue, the three duel screens, leaderboard
src/labs.js          the six simulations: parameters, physics/chemistry/maths, drawing, challenges
src/course/          content, one file per subject, plus an index that adds unit reviews and worlds
```

Progress is stored as JSON in Electron's `userData` directory and can be wiped from Settings.

## Notes on running code

Python is located once at startup by trying `py -3`, `python`, then `python3`. Programs run in a temporary
directory with a six-second timeout and their output is captured. There is no sandbox — an exercise runs
whatever you type under your own user account, the same as running a script yourself. If no interpreter is
found, code exercises are skipped automatically and the sandbox lab says so.
