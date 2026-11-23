import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  gameBySlug,
  sectionsWithLessons,
  orderedLessons,
  neighbours,
  progressOfGame,
  searchLessons,
  tierForRank,
  recommendLessons,
} from './catalog.js';

const lesson = (id, game, section, title, extra = {}) => ({
  id, game, section, title, slug: id, summary: `About ${title}`, order: 0, difficulty: 'beginner', skill: '', demo: '', ...extra,
});

const catalog = {
  games: [
    { id: 'g1', name: 'FPS Fundamentals', slug: 'fps-fundamentals', genre: 'fps', isFundamentals: true, ranks: ['B', 'I', 'A'], sections: [{ id: 's1', title: 'Aim' }, { id: 's2', title: 'Movement' }] },
    { id: 'g2', name: 'Valorant', slug: 'valorant', genre: 'fps', isFundamentals: false, ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'], sections: [{ id: 's3', title: 'Gunplay' }] },
    { id: 'g3', name: 'Fighting', slug: 'fighting', genre: 'fighting', isFundamentals: true, ranks: [], sections: [{ id: 's4', title: 'Core' }] },
  ],
  lessons: [
    lesson('l1', 'g1', 's1', 'Crosshair Placement', { skill: 'precision' }),
    lesson('l2', 'g1', 's2', 'Counter-Strafing', { skill: 'movement', difficulty: 'intermediate' }),
    lesson('l3', 'g1', 's1', 'Recoil Control', { skill: 'recoil', difficulty: 'intermediate' }),
    lesson('l4', 'g2', 's3', 'Phantom or Vandal', { skill: 'recoil', difficulty: 'advanced' }),
    lesson('l5', 'g3', 's4', 'Frame Data'),
  ],
  maps: [],
};
const [fps, valorant] = catalog.games;

test('lessons are grouped by section in section order', () => {
  const groups = sectionsWithLessons(catalog, fps);
  assert.deepEqual(groups.map((g) => g.section.title), ['Aim', 'Movement']);
  assert.deepEqual(groups[0].lessons.map((l) => l.id), ['l1', 'l3']);
  assert.deepEqual(orderedLessons(catalog, fps).map((l) => l.id), ['l1', 'l3', 'l2']);
  assert.equal(gameBySlug(catalog, 'valorant').id, 'g2');
  assert.equal(gameBySlug(catalog, 'nope'), null);
});

test('previous and next follow sidebar order', () => {
  assert.deepEqual(neighbours(catalog, fps, 'l1'), { prev: null, next: catalog.lessons[2] });
  assert.equal(neighbours(catalog, fps, 'l3').prev.id, 'l1');
  assert.equal(neighbours(catalog, fps, 'l2').next, null);
  assert.deepEqual(neighbours(catalog, fps, 'missing'), { prev: null, next: null });
});

test('progress counts completed lessons of one game', () => {
  assert.deepEqual(progressOfGame(catalog, fps, ['l1', 'l4']), { done: 1, total: 3, percent: 33 });
  assert.deepEqual(progressOfGame(catalog, { id: 'x', sections: [] }, []), { done: 0, total: 0, percent: 0 });
});

test('search matches title first, then summary and game name', () => {
  assert.deepEqual(searchLessons(catalog, '  '), []);
  assert.deepEqual(searchLessons(catalog, 'RECOIL').map((r) => r.lesson.id), ['l3']);
  assert.deepEqual(searchLessons(catalog, 'valorant').map((r) => r.lesson.id), ['l4']);
  assert.equal(searchLessons(catalog, 'o', 2).length, 2);
});

test('rank maps to a difficulty tier', () => {
  assert.equal(tierForRank(valorant, 'Iron'), 'beginner');
  assert.equal(tierForRank(valorant, 'Gold'), 'intermediate');
  assert.equal(tierForRank(valorant, 'Radiant'), 'advanced');
  assert.equal(tierForRank(valorant, ''), 'beginner');
  assert.equal(tierForRank(null, 'Gold'), 'beginner');
});

test('recommendations: own game plus same-genre fundamentals, weakness first, completed removed', () => {
  const user = { profile: { game: 'g2', currentRank: 'Gold', weakness: 'recoil' }, completedLessons: ['l1'] };
  // l3: weakness + tier = 3, l4: weakness = 2, l2: tier = 1; l1 is done; l5 is another genre
  assert.deepEqual(recommendLessons(catalog, user).map((r) => r.lesson.id), ['l3', 'l4', 'l2']);
  assert.equal(recommendLessons(catalog, user)[0].game.id, 'g1');
  assert.equal(recommendLessons(catalog, user, 1).length, 1);
  assert.deepEqual(recommendLessons(catalog, { profile: { game: null }, completedLessons: [] }), []);
  assert.deepEqual(recommendLessons(catalog, null), []);
});
