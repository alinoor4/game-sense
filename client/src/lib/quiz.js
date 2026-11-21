import { WEAKNESSES } from './constants.js';

// The diagnostic quiz. Every question has exactly one option per weakness, always in WEAKNESSES order:
// precision, recoil, movement, decision. The page shuffles nothing; it shows them as written.
// shortcut: questions live in code; move them to the database when admins need to edit them.
export const QUESTIONS = [
  {
    text: 'You lose a duel you expected to win. What usually went wrong?',
    options: [
      'My first shot missed. My crosshair was not on the target.',
      'My first bullets hit, then the rest of the spray went everywhere.',
      'I was still moving when I fired.',
      'I peeked at a bad moment, or without knowing where the enemy was.',
    ],
  },
  {
    text: 'Which practice task feels hardest?',
    options: [
      'Clicking small targets quickly.',
      'Keeping a long spray on one spot.',
      'Stopping cleanly and shooting straight after a strafe.',
      'Deciding where to stand and when to fight.',
    ],
  },
  {
    text: 'In the last seconds of a close round, you tend to…',
    options: [
      'rush my shots and miss easy targets.',
      'hold the trigger down and lose control of the gun.',
      'keep running or jiggling without ever stopping to shoot.',
      'freeze, or make a call I regret a second later.',
    ],
  },
  {
    text: 'At long range you mostly die because…',
    options: [
      'I cannot land the first bullet.',
      'I spray when I should tap or burst.',
      'I peek wide and slowly, which makes me an easy target.',
      'I take long fights that my weapon or position should avoid.',
    ],
  },
  {
    text: 'When you watch a much better player, what stands out most?',
    options: [
      'Their crosshair is already on the head before the enemy appears.',
      'Their sprays stay tight.',
      'Their peeks are crisp and they are never moving when they shoot.',
      'They always seem to be in the right place at the right time.',
    ],
  },
  {
    text: 'Your teammates would most likely say that you…',
    options: [
      'miss shots you should hit.',
      'empty a whole magazine for one kill.',
      'get caught running in the open.',
      'are rarely where the team needs you.',
    ],
  },
  {
    text: 'After a set of 1v1 duels, what do you notice?',
    options: [
      'I flick past the target or stop short of it.',
      'I only win when the fight ends within the first three bullets.',
      'I lose whenever the fight turns into strafing.',
      'I do fine in 1v1s, but real matches still go badly.',
    ],
  },
  {
    text: 'Which sentence is most true for you?',
    options: [
      'My aim is inconsistent from day to day.',
      'I avoid spraying because I cannot control it.',
      "I do not really understand my game's movement accuracy rules.",
      'I often die without knowing where the enemy came from.',
    ],
  },
];

// answers: one option index (0-3) per question, or null for unanswered.
// Returns { scores: { precision, recoil, movement, decision }, weakness, complete }.
// The weakness is the most-picked one; a tie goes to the earlier entry in WEAKNESSES.
export function scoreQuiz(answers) {
  const scores = Object.fromEntries(WEAKNESSES.map((w) => [w, 0]));
  let answered = 0;
  QUESTIONS.forEach((question, i) => {
    const weakness = WEAKNESSES[answers[i]];
    if (weakness) {
      scores[weakness] += 1;
      answered += 1;
    }
  });
  const weakness = answered ? WEAKNESSES.reduce((best, w) => (scores[w] > scores[best] ? w : best)) : '';
  return { scores, weakness, complete: answered === QUESTIONS.length };
}
