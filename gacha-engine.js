/* Codex: the summon roster, pull rates with pity, and team battle resolution.
   Lives in the main process for the same reason the rating engine does — the client
   should not be able to roll its own five stars or decide its own battles.

   Every character here is original to Codingo. Each one personifies an idea from the
   course, so a pull is also a piece of revision. */

const SUBJECTS = ['code', 'math', 'physics', 'chem', 'bio'];
const CLASSES = ['attack', 'guard', 'tech'];

// attack beats tech, tech beats guard, guard beats attack
const BEATS = { attack: 'tech', tech: 'guard', guard: 'attack' };

const ROSTER = [
  /* ------------------------------------------------------------ 5 star */
  {
    id: 'nullwyrm', name: 'Nullwyrm', title: 'The Undefined',
    subject: 'code', klass: 'tech', rarity: 5, power: 210,
    form: 'dragon', features: ['horns', 'wings', 'tail'],
    palette: ['#a560ff', '#2b1a4a', '#ffc800'],
    lore: 'Every variable it touches becomes None. Ask it a question and it returns nothing, politely.',
    skill: 'Void Return — wins a lane outright if its power is within 10% of the defender.'
  },
  {
    id: 'recursa', name: 'Recursa', title: 'She Who Calls Herself',
    subject: 'code', klass: 'attack', rarity: 5, power: 198,
    form: 'elemental', features: ['halo', 'orbits'],
    palette: ['#58cc02', '#0f2a10', '#eaf0fb'],
    lore: 'To understand Recursa you must first understand Recursa. Her base case is a well kept secret.',
    skill: 'Stack Frame — gains 6% power for each other Coding character on the team.'
  },
  {
    id: 'quanta', name: 'Quanta', title: 'Both Places at Once',
    subject: 'physics', klass: 'tech', rarity: 5, power: 205,
    form: 'elemental', features: ['orbits', 'visor'],
    palette: ['#1cb0f6', '#04243a', '#ffffff'],
    lore: 'Measured in one lane, found in another. Her position is a probability and her damage is not.',
    skill: 'Superposition — swaps to the weakest enemy lane before the first clash.'
  },
  {
    id: 'primearch', name: 'Primearch', title: 'Indivisible',
    subject: 'math', klass: 'guard', rarity: 5, power: 202,
    form: 'construct', features: ['crown', 'shield'],
    palette: ['#ffc800', '#3a2a02', '#0f1420'],
    lore: 'Divisible by one and by itself. Every attempt to factor it has ended in a long, quiet proof.',
    skill: 'Fundamental — cannot lose a lane by less than 5% power.'
  },
  {
    id: 'helixia', name: 'Helixia', title: 'Twice Written',
    subject: 'bio', klass: 'attack', rarity: 5, power: 196,
    form: 'beast', features: ['tail', 'crown'],
    palette: ['#2ec4b6', '#052e2a', '#ff4b4b'],
    lore: 'Carries a copy of every ally she has ever fought beside, coiled in four letters.',
    skill: 'Transcription — copies 15% of the strongest ally power.'
  },
  {
    id: 'catalys', name: 'Catalys', title: 'Unconsumed',
    subject: 'chem', klass: 'tech', rarity: 5, power: 200,
    form: 'elemental', features: ['orbits', 'halo'],
    palette: ['#ce82ff', '#2a0f3a', '#58cc02'],
    lore: 'Lowers the energy every fight needs and walks away from all of them unchanged.',
    skill: 'Activation — the whole team clashes 10% harder on the first lane.'
  },

  /* ------------------------------------------------------------ 4 star */
  {
    id: 'segfaultling', name: 'Segfaultling', title: 'Out of Bounds',
    subject: 'code', klass: 'attack', rarity: 4, power: 128,
    form: 'sprite', features: ['horns'],
    palette: ['#ff4b4b', '#3a0d0d', '#ffc800'],
    lore: 'Reads one index past the end of things. Sometimes finds treasure, usually finds a crash.',
    skill: 'Overflow — 20% power against Guard class.'
  },
  {
    id: 'lambdroid', name: 'Lambdroid', title: 'Anonymous',
    subject: 'code', klass: 'tech', rarity: 4, power: 122,
    form: 'construct', features: ['visor'],
    palette: ['#58cc02', '#12240a', '#1cb0f6'],
    lore: 'Has no name of its own, only one expression, and it returns it immediately.',
    skill: 'One Liner — never varies; its lane roll has no randomness.'
  },
  {
    id: 'loopwarden', name: 'Loopwarden', title: 'Until False',
    subject: 'code', klass: 'guard', rarity: 4, power: 126,
    form: 'construct', features: ['shield', 'crown'],
    palette: ['#1cb0f6', '#062435', '#eaf0fb'],
    lore: 'Stands its ground while the condition holds. Nobody has told it the condition changed.',
    skill: 'Sentinel — takes 15% less in the first lane.'
  },
  {
    id: 'fractala', name: 'Fractala', title: 'Self Similar',
    subject: 'math', klass: 'tech', rarity: 4, power: 124,
    form: 'elemental', features: ['orbits'],
    palette: ['#1cb0f6', '#08243a', '#ce82ff'],
    lore: 'Zoom in on any part of her and you will find the whole of her, smaller and just as sharp.',
    skill: 'Iteration — 8% power for each lane already won.'
  },
  {
    id: 'vectra', name: 'Vectra', title: 'Magnitude and Direction',
    subject: 'math', klass: 'attack', rarity: 4, power: 130,
    form: 'sprite', features: ['wings'],
    palette: ['#ffc800', '#3a2c02', '#ff4b4b'],
    lore: 'Speed alone bores her. She insists on knowing exactly where the speed is pointed.',
    skill: 'Resultant — 12% power when placed in the middle lane.'
  },
  {
    id: 'thetaform', name: 'Thetaform', title: 'The Third Angle',
    subject: 'math', klass: 'guard', rarity: 4, power: 120,
    form: 'construct', features: ['shield'],
    palette: ['#58cc02', '#0d2410', '#ffc800'],
    lore: 'Whatever the other two do, it makes the total one hundred and eighty. Every time.',
    skill: 'Supplement — fills 10% of whatever the weakest ally lacks.'
  },
  {
    id: 'photonet', name: 'Photonet', title: 'Three Hundred Million',
    subject: 'physics', klass: 'attack', rarity: 4, power: 132,
    form: 'sprite', features: ['halo', 'wings'],
    palette: ['#ffc800', '#3a3202', '#ffffff'],
    lore: 'Arrives before the sound of its own arrival. Massless, tireless, always first.',
    skill: 'First Light — always resolves the opening lane.'
  },
  {
    id: 'entrope', name: 'Entrope', title: 'Only Increases',
    subject: 'physics', klass: 'guard', rarity: 4, power: 127,
    form: 'beast', features: ['tail', 'horns'],
    palette: ['#ff9600', '#3a2002', '#8d9bb5'],
    lore: 'Does not fight so much as wait. Order costs energy; disorder is free and patient.',
    skill: 'Heat Death — drains 6% from every enemy after each lane.'
  },
  {
    id: 'ohmengar', name: 'Ohmengar', title: 'Voltage Over Current',
    subject: 'physics', klass: 'tech', rarity: 4, power: 121,
    form: 'construct', features: ['visor', 'orbits'],
    palette: ['#ffc800', '#2a2202', '#1cb0f6'],
    lore: 'Resists exactly as much as it is pushed, and turns the difference into light.',
    skill: 'Resistance — converts 20% of damage taken into lane power.'
  },
  {
    id: 'isotopia', name: 'Isotopia', title: 'Same but Heavier',
    subject: 'chem', klass: 'guard', rarity: 4, power: 129,
    form: 'elemental', features: ['orbits', 'shield'],
    palette: ['#ce82ff', '#240c33', '#eaf0fb'],
    lore: 'Identical to her sisters in every way that reacts, and unmistakable on a mass spectrometer.',
    skill: 'Extra Neutron — 10% power, and 10% slower to act.'
  },
  {
    id: 'acidra', name: 'Acidra', title: 'pH One',
    subject: 'chem', klass: 'attack', rarity: 4, power: 133,
    form: 'beast', features: ['horns', 'tail'],
    palette: ['#ff4b4b', '#360b0b', '#ffc800'],
    lore: 'Donates protons to anyone who will take them, and to plenty who would rather not.',
    skill: 'Corrode — strips 12% from Guard class enemies.'
  },
  {
    id: 'valence', name: 'Valence', title: 'Outer Shell',
    subject: 'chem', klass: 'tech', rarity: 4, power: 123,
    form: 'elemental', features: ['orbits'],
    palette: ['#2ec4b6', '#052c28', '#ffc800'],
    lore: 'Counts the electrons nobody else bothers to count, then predicts the entire reaction.',
    skill: 'Bonding — 7% power for each different subject on the team.'
  },
  {
    id: 'mitosia', name: 'Mitosia', title: 'One Becomes Two',
    subject: 'bio', klass: 'tech', rarity: 4, power: 125,
    form: 'sprite', features: ['halo'],
    palette: ['#58cc02', '#0e2a0c', '#1cb0f6'],
    lore: 'Answers every question twice, identically, and considers the matter settled.',
    skill: 'Division — if it wins a lane, 25% of its power carries to the next.'
  },
  {
    id: 'chloros', name: 'Chloros', title: 'Light Into Sugar',
    subject: 'bio', klass: 'guard', rarity: 4, power: 128,
    form: 'beast', features: ['crown', 'wings'],
    palette: ['#58cc02', '#0a2408', '#ffc800'],
    lore: 'Turns sunlight into food and the leftovers into the air you are breathing right now.',
    skill: 'Photosynthesis — regains 8% power between lanes.'
  },
  {
    id: 'apexon', name: 'Apexon', title: 'Top of the Chain',
    subject: 'bio', klass: 'attack', rarity: 4, power: 131,
    form: 'beast', features: ['horns', 'tail', 'crown'],
    palette: ['#ff9600', '#331d02', '#ff4b4b'],
    lore: 'Ten percent of the energy makes it up to him, so he makes every bite of it count.',
    skill: 'Trophic — 15% power when the team holds no other Attack.'
  },

  /* ------------------------------------------------------------ 3 star */
  {
    id: 'printling', name: 'Printling', title: 'Hello There',
    subject: 'code', klass: 'attack', rarity: 3, power: 68,
    form: 'sprite', features: [],
    palette: ['#58cc02', '#12240a', '#eaf0fb'],
    lore: 'The first spirit anyone ever summons. Says exactly what it is told to say, and nothing more.',
    skill: 'Standard Out — no tricks, no surprises.'
  },
  {
    id: 'indexid', name: 'Indexid', title: 'Starts at Zero',
    subject: 'code', klass: 'tech', rarity: 3, power: 64,
    form: 'construct', features: ['visor'],
    palette: ['#1cb0f6', '#07202f', '#eaf0fb'],
    lore: 'Counts from nothing, which has confused more newcomers than any other creature alive.',
    skill: 'Off By One — 5% power in the first lane, 5% less in the last.'
  },
  {
    id: 'boolette', name: 'Boolette', title: 'True or Otherwise',
    subject: 'code', klass: 'guard', rarity: 3, power: 62,
    form: 'sprite', features: ['shield'],
    palette: ['#ffc800', '#2f2603', '#0f1420'],
    lore: 'Has exactly two opinions and holds both of them very firmly, one at a time.',
    skill: 'Short Circuit — stops evaluating once a lane is decided.'
  },
  {
    id: 'fracton', name: 'Fracton', title: 'Part of a Whole',
    subject: 'math', klass: 'guard', rarity: 3, power: 66,
    form: 'construct', features: ['shield'],
    palette: ['#1cb0f6', '#062231', '#ffc800'],
    lore: 'Insists on a common denominator before it will agree to anything at all.',
    skill: 'Common Ground — 5% power when allies share its subject.'
  },
  {
    id: 'meanling', name: 'Meanling', title: 'Sum Over Count',
    subject: 'math', klass: 'tech', rarity: 3, power: 60,
    form: 'sprite', features: [],
    palette: ['#58cc02', '#102a10', '#eaf0fb'],
    lore: 'Sits precisely in the middle of everyone, which one outlier can ruin instantly.',
    skill: 'Average — its lane roll always lands near the middle.'
  },
  {
    id: 'newtonid', name: 'Newtonid', title: 'Equal and Opposite',
    subject: 'physics', klass: 'guard', rarity: 3, power: 67,
    form: 'construct', features: ['shield', 'horns'],
    palette: ['#ff9600', '#331f02', '#eaf0fb'],
    lore: 'Pushes back with exactly the force it is pushed with. Arguing with it is pointless.',
    skill: 'Third Law — returns 10% of the power it loses to.'
  },
  {
    id: 'joulet', name: 'Joulet', title: 'Never Destroyed',
    subject: 'physics', klass: 'attack', rarity: 3, power: 63,
    form: 'sprite', features: ['halo'],
    palette: ['#ffc800', '#332a02', '#ff9600'],
    lore: 'Changes shape constantly and never once goes missing. Check under the heat.',
    skill: 'Conservation — power lost in a lane is added to the next ally.'
  },
  {
    id: 'moleen', name: 'Moleen', title: 'Six Point Oh Two',
    subject: 'chem', klass: 'tech', rarity: 3, power: 65,
    form: 'elemental', features: ['orbits'],
    palette: ['#ce82ff', '#210b2e', '#eaf0fb'],
    lore: 'Never arrives alone. Brings six hundred and two sextillion friends, every single time.',
    skill: 'Avogadro — 4% power for each ally, allies included.'
  },
  {
    id: 'saltid', name: 'Saltid', title: 'Acid Meets Base',
    subject: 'chem', klass: 'guard', rarity: 3, power: 61,
    form: 'construct', features: ['shield'],
    palette: ['#eaf0fb', '#1d2537', '#1cb0f6'],
    lore: 'The calm left over when two furious things finish arguing. Also seasons chips.',
    skill: 'Neutralise — reduces enemy skill bonuses by 10% in its lane.'
  },
  {
    id: 'cellet', name: 'Cellet', title: 'Smallest Living Thing',
    subject: 'bio', klass: 'tech', rarity: 3, power: 66,
    form: 'sprite', features: [],
    palette: ['#2ec4b6', '#062824', '#58cc02'],
    lore: 'The unit everything alive is built from, and quietly proud of that fact.',
    skill: 'Membrane — lets 5% of incoming power straight through, keeps the rest out.'
  },
  {
    id: 'enzymo', name: 'Enzymo', title: 'Lock and Key',
    subject: 'bio', klass: 'attack', rarity: 3, power: 64,
    form: 'beast', features: ['tail'],
    palette: ['#58cc02', '#0d2609', '#ffc800'],
    lore: 'Fits one shape and one shape only, but against that shape it is unstoppable.',
    skill: 'Specific — 18% power against one random enemy lane.'
  },
  {
    id: 'osmona', name: 'Osmona', title: 'Down the Gradient',
    subject: 'bio', klass: 'guard', rarity: 3, power: 62,
    form: 'elemental', features: [],
    palette: ['#1cb0f6', '#062331', '#2ec4b6'],
    lore: 'Always moves toward whoever needs her most, and never needs to be asked.',
    skill: 'Diffusion — evens out 8% of the power gap in her lane.'
  }
];

/* ------------------------------------------------------------- rates */

const RATES = { 5: 0.02, 4: 0.13 };      // the rest are 3 star
const PITY_5 = 40;                        // guaranteed 5 star
const PITY_4 = 10;                        // guaranteed 4 star or better
const PULL_COST = 60;
const MULTI_COST = 540;                   // ten pulls for the price of nine
const AWAKEN_STEP = 0.08;                 // power per duplicate
const AWAKEN_MAX = 6;
const DUPLICATE_GEMS = { 3: 15, 4: 40, 5: 120 };

function byRarity(rarity) {
  return ROSTER.filter((c) => c.rarity === rarity);
}

function pickOf(rarity) {
  const pool = byRarity(rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Roll one character. Pity counters come in from the client's saved state and go
 * back out updated, so the guarantee survives a restart without a server session.
 */
function rollOne(pity) {
  const since5 = pity.since5 || 0;
  const since4 = pity.since4 || 0;
  let rarity;

  if (since5 + 1 >= PITY_5) rarity = 5;
  else if (Math.random() < RATES[5]) rarity = 5;
  else if (since4 + 1 >= PITY_4) rarity = 4;
  else if (Math.random() < RATES[4]) rarity = 4;
  else rarity = 3;

  const next = {
    since5: rarity === 5 ? 0 : since5 + 1,
    since4: rarity >= 4 ? 0 : since4 + 1
  };
  return { character: pickOf(rarity), rarity, pity: next, guaranteed: since5 + 1 >= PITY_5 };
}

function pull(count, pity, owned) {
  let carry = { since5: pity.since5 || 0, since4: pity.since4 || 0 };
  const have = new Set(Object.keys(owned || {}));
  const results = [];

  for (let i = 0; i < count; i++) {
    const roll = rollOne(carry);
    carry = roll.pity;
    const isNew = !have.has(roll.character.id);
    have.add(roll.character.id);
    results.push({
      id: roll.character.id,
      rarity: roll.rarity,
      isNew,
      guaranteed: roll.guaranteed,
      gems: isNew ? 0 : DUPLICATE_GEMS[roll.rarity]
    });
  }
  return { results, pity: carry };
}

/* ------------------------------------------------------------- power */

function characterPower(char, copies) {
  const awakening = Math.min(AWAKEN_MAX, Math.max(0, (copies || 1) - 1));
  return Math.round(char.power * (1 + awakening * AWAKEN_STEP));
}

/** Team bonuses: matching subjects reward focus, all-different rewards breadth. */
function teamSynergy(chars) {
  const subjects = new Set(chars.map((c) => c.subject));
  if (subjects.size === 1) return { mult: 1.2, label: 'Single discipline +20%' };
  if (subjects.size === chars.length) return { mult: 1.12, label: 'Broad curriculum +12%' };
  return { mult: 1.06, label: 'Shared discipline +6%' };
}

function teamPower(entries) {
  const chars = entries.map((e) => e.char);
  const base = entries.reduce((n, e) => n + characterPower(e.char, e.copies), 0);
  const syn = teamSynergy(chars);
  return { base, total: Math.round(base * syn.mult), synergy: syn };
}

/* ------------------------------------------------------------ battle */

function classMultiplier(mine, theirs) {
  if (BEATS[mine] === theirs) return 1.25;
  if (BEATS[theirs] === mine) return 0.8;
  return 1;
}

/** Build an opposing team near a target power, so fights stay close. */
function makeOpponentTeam(targetPower, seedName) {
  const perSlot = targetPower / 3;
  const team = [];
  const used = new Set();

  for (let slot = 0; slot < 3; slot++) {
    const wanted = perSlot * (0.85 + Math.random() * 0.3);
    const options = ROSTER
      .filter((c) => !used.has(c.id))
      .sort((a, b) => Math.abs(a.power - wanted) - Math.abs(b.power - wanted))
      .slice(0, 5);
    const chosen = options[Math.floor(Math.random() * options.length)];
    used.add(chosen.id);
    const copies = 1 + Math.floor(Math.random() * 3);
    team.push({ id: chosen.id, copies, power: characterPower(chosen, copies) });
  }
  return { name: seedName || 'Rival', team };
}

/**
 * Lane by lane: slot 1 against slot 1 and so on, class triangle applied, a little
 * variance so identical teams do not always give identical results. Best of three.
 */
function resolveBattle(mine, theirs) {
  const lanes = [];
  let myWins = 0;
  let theirWins = 0;
  let carry = 0;                 // Conservation-style carry between lanes

  for (let i = 0; i < 3; i++) {
    const a = mine[i];
    const b = theirs[i];
    const aMult = classMultiplier(a.klass, b.klass);
    const bMult = classMultiplier(b.klass, a.klass);
    const aRoll = a.power * aMult * (0.88 + Math.random() * 0.24) + carry;
    const bRoll = b.power * bMult * (0.88 + Math.random() * 0.24);
    const win = aRoll >= bRoll;
    carry = win ? 0 : Math.round((bRoll - aRoll) * 0.1);
    if (win) myWins++; else theirWins++;
    lanes.push({
      index: i,
      mine: { id: a.id, power: Math.round(aRoll), klass: a.klass, mult: aMult },
      theirs: { id: b.id, power: Math.round(bRoll), klass: b.klass, mult: bMult },
      won: win
    });
  }

  return { lanes, myWins, theirWins, won: myWins >= 2 };
}

/**
 * Set up and resolve a full battle. Lives here rather than in the IPC handler so the
 * verification script can simulate thousands of fights through the exact same path.
 *
 * The player's synergy bonus is applied to their lane powers, and the opponent target
 * is drawn from that same synergy-inclusive total, so both sides are measured alike.
 */
function runBattle(entries, owned, opponentName) {
  const resolved = entries.map((e) => ({ char: byId(e.id), copies: e.copies }));
  if (resolved.some((r) => !r.char)) return null;

  const totals = teamPower(resolved);
  const mine = resolved.map((r) => ({
    id: r.char.id,
    klass: r.char.klass,
    power: Math.round(characterPower(r.char, r.copies) * totals.synergy.mult)
  }));

  const target = Math.round(totals.total * (0.82 + Math.random() * 0.42));
  const foe = makeOpponentTeam(target, opponentName);
  const theirs = foe.team.map((t) => ({ id: t.id, klass: byId(t.id).klass, power: t.power }));

  const outcome = resolveBattle(mine, theirs);
  const have = owned || {};

  return {
    opponent: { name: foe.name, team: foe.team, power: theirs.reduce((n, t) => n + t.power, 0) },
    myPower: totals,
    lanes: outcome.lanes,
    myWins: outcome.myWins,
    theirWins: outcome.theirWins,
    won: outcome.won,
    // Chosen here so the client cannot pick its own prize: a spirit it lacks if possible.
    prize: outcome.won
      ? (foe.team.map((t) => t.id).find((id) => !have[id]) || foe.team[Math.floor(Math.random() * foe.team.length)].id)
      : null
  };
}

function byId(id) {
  return ROSTER.find((c) => c.id === id) || null;
}

module.exports = {
  ROSTER, SUBJECTS, CLASSES, BEATS, RATES, PITY_5, PITY_4,
  runBattle,
  PULL_COST, MULTI_COST, AWAKEN_STEP, AWAKEN_MAX, DUPLICATE_GEMS,
  byId,
  pull, characterPower, teamPower, teamSynergy, makeOpponentTeam, resolveBattle, classMultiplier
};
