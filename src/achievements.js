/* Badges. Each one is a pure predicate over saved state, so they can be re-evaluated
   at any time and never drift out of sync with the numbers on the dashboard. */

export const BADGES = [
  {
    id: 'first_lesson', name: 'First Steps', icon: '1',
    desc: 'Finish your first lesson',
    check: (s, ctx) => ctx.lessonsDone >= 1
  },
  {
    id: 'ten_lessons', name: 'Getting Serious', icon: 'X',
    desc: 'Finish ten lessons',
    check: (s, ctx) => ctx.lessonsDone >= 10
  },
  {
    id: 'flawless', name: 'Flawless', icon: '100',
    desc: 'Finish a lesson without a single mistake',
    check: (s, ctx) => ctx.flags.flawless
  },
  {
    id: 'combo_x2', name: 'On Fire', icon: 'x2',
    desc: 'Reach a x2 answer combo',
    check: (s, ctx) => ctx.flags.comboX2
  },
  {
    id: 'speedster', name: 'Speedster', icon: '<8',
    desc: 'Earn ten speed bonuses',
    check: (s) => (s.counters && s.counters.quick) >= 10
  },
  {
    id: 'streak_3', name: 'Habit Forming', icon: '3d',
    desc: 'Keep a three day streak',
    check: (s) => s.streak >= 3
  },
  {
    id: 'streak_7', name: 'Week Strong', icon: '7d',
    desc: 'Keep a seven day streak',
    check: (s) => s.streak >= 7
  },
  {
    id: 'xp_500', name: 'Five Hundred', icon: '500',
    desc: 'Earn 500 XP in total',
    check: (s) => s.xp >= 500
  },
  {
    id: 'xp_2000', name: 'Two Thousand', icon: '2K',
    desc: 'Earn 2000 XP in total',
    check: (s) => s.xp >= 2000
  },
  {
    id: 'polymath', name: 'Polymath', icon: '5S',
    desc: 'Complete a lesson in every subject',
    check: (s, ctx) => ctx.subjectsTouched >= 5
  },
  {
    id: 'crowned', name: 'Crowned', icon: 'III',
    desc: 'Take one lesson to three crowns',
    check: (s) => Object.values(s.lessons || {}).some((l) => l.crowns >= 3)
  },
  {
    id: 'lab_first', name: 'Lab Coat', icon: 'LAB',
    desc: 'Clear your first lab challenge',
    check: (s, ctx) => ctx.labChallenges >= 1
  },
  {
    id: 'lab_master', name: 'Lab Master', icon: 'ALL',
    desc: 'Clear every challenge in every lab',
    check: (s, ctx) => ctx.labsCleared >= ctx.labsTotal
  },
  {
    id: 'experimenter', name: 'Experimenter', icon: 'RUN',
    desc: 'Run code in the Python sandbox twenty times',
    check: (s) => ((s.labs && s.labs.pylab && s.labs.pylab.runs) || 0) >= 20
  },
  {
    id: 'debugger', name: 'Bug Hunter', icon: 'BUG',
    desc: 'Win a Debug Duel',
    check: (s) => (s.arena.duels || []).some((d) => d.result === 'win' && d.modeName.startsWith('Debug'))
  },
  {
    id: 'oneshot', name: 'One Shot', icon: '1ST',
    desc: 'Win a 1-Shot Vibecode Duel',
    check: (s) => (s.arena.duels || []).some((d) => d.result === 'win' && d.modeName.startsWith('1-Shot'))
  },
  {
    id: 'placed', name: 'Placed', icon: 'RNK',
    desc: 'Finish your five placement duels',
    check: (s) => s.arena.placed
  },
  {
    id: 'duel_streak', name: 'Unstoppable', icon: 'W3',
    desc: 'Win three duels in a row',
    check: (s) => (s.arena.player.streak || 0) >= 3
  },
  {
    id: 'gold_tier', name: 'Gold Standard', icon: 'GLD',
    desc: 'Reach Gold tier or better',
    check: (s, ctx) => ctx.tierRank <= 4
  },
  {
    id: 'diamond_tier', name: 'Diamond Hands', icon: 'DIA',
    desc: 'Reach Diamond tier or better',
    check: (s, ctx) => ctx.tierRank <= 2
  },
  {
    id: 'giant_killer', name: 'Giant Killer', icon: '+',
    desc: 'Beat an opponent rated 200 points above you',
    check: (s, ctx) => ctx.flags.giantKiller
  },
  {
    id: 'scholar', name: 'Scholar', icon: '90',
    desc: 'Hold 90% accuracy over at least 50 answers',
    check: (s, ctx) => ctx.answers >= 50 && ctx.accuracy >= 90
  }
];

const TIER_ORDER = ['grandmaster', 'master', 'diamond', 'platinum', 'gold', 'silver', 'bronze'];

export function tierRank(tierId) {
  const i = TIER_ORDER.indexOf(tierId);
  return i === -1 ? 99 : i;
}

/**
 * Evaluate every badge and return the ones newly unlocked. Flags carry the
 * one-off things that only the moment itself knows, such as a flawless lesson.
 */
export function evaluate(state, context) {
  const owned = new Set(state.badges || []);
  const ctx = Object.assign({ flags: {} }, context);
  const fresh = [];
  BADGES.forEach((b) => {
    if (owned.has(b.id)) return;
    let hit = false;
    try { hit = !!b.check(state, ctx); } catch (err) { hit = false; }
    if (hit) fresh.push(b);
  });
  return fresh;
}

export function getBadge(id) {
  return BADGES.find((b) => b.id === id) || null;
}
