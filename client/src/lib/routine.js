// Daily routine generator. Four blocks in the proportions 15 : 30 : 40 : 60 (a 145-minute day).

const ISOLATION = {
  precision: 'Static and micro-flick clicking drills. Slow down until you hit 90%, then speed up.',
  recoil: 'Spray one magazine at a wall from 10 metres, then practise 3-bullet bursts. Reset between sprays.',
  movement: 'Strafe, stop, shoot one bullet. Alternate left and right for the whole block.',
  decision: 'Aim maintenance only: mixed flick and tracking drills at a comfortable pace.',
  '': 'Mixed drills: half clicking, half tracking.',
};

const RANKED = {
  precision: 'crosshair at head height before every corner',
  recoil: 'burst at range, spray only up close',
  movement: 'come to a full stop before every shot',
  decision: 'say out loud where the enemy is before you peek',
  '': 'play your normal game and note one mistake per death',
};

const roundTo5 = (n) => Math.max(5, Math.round(n / 5) * 5);

// minutes: total time available today (30-480). weakness: '' or one of WEAKNESSES.
// Returns [{ key, label, minutes, focus, link }]. The block minutes always add up to the (rounded) total.
export function generateRoutine({ minutes = 145, weakness = '' } = {}) {
  const total = Math.min(480, Math.max(30, roundTo5(Number(minutes) || 145)));
  const focus = weakness in ISOLATION ? weakness : '';
  const warmup = roundTo5((total * 15) / 145);
  const isolation = roundTo5((total * 30) / 145);
  const gamesense = roundTo5((total * 40) / 145);
  const ranked = total - warmup - isolation - gamesense;
  return [
    { key: 'warmup', label: 'Warm-up', minutes: warmup, focus: 'Game Sense aim trainer: tracking mode first, then flick mode.', link: '/tools/aim-trainer' },
    { key: 'isolation', label: 'Isolation', minutes: isolation, focus: ISOLATION[focus], link: '' },
    {
      key: 'gamesense',
      label: 'Game sense',
      minutes: gamesense,
      focus:
        focus === 'decision'
          ? 'Review one loss. Pause at every death and name the mistake before you watch the kill.'
          : 'Review one loss for half the block, then study one position you keep dying in.',
      link: '',
    },
    { key: 'ranked', label: 'Ranked', minutes: ranked, focus: `Live application. One focus only: ${RANKED[focus]}.`, link: '' },
  ];
}

// Plain-text version for the Download button.
export function routineToText(blocks) {
  return blocks.map((b) => `[ ${b.minutes} min ] ${b.label} -> ${b.focus}`).join('\n');
}
