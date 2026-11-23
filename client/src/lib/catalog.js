// Pure helpers over the catalog object returned by GET /api/catalog:
// { games: [...], lessons: [...], maps: [...] }. No React and no fetching in this file.
import { DIFFICULTIES } from './constants.js';

export const gameBySlug = (catalog, slug) => catalog.games.find((g) => g.slug === slug) || null;

export const gameById = (catalog, id) => catalog.games.find((g) => g.id === id) || null;

// [{ section, lessons }] in display order. catalog.lessons is already sorted by order, then title.
export function sectionsWithLessons(catalog, game) {
  return game.sections.map((section) => ({
    section,
    lessons: catalog.lessons.filter((l) => l.game === game.id && l.section === section.id),
  }));
}

// Every lesson of a game in sidebar order.
export function orderedLessons(catalog, game) {
  return sectionsWithLessons(catalog, game).flatMap((group) => group.lessons);
}

export function neighbours(catalog, game, lessonId) {
  const list = orderedLessons(catalog, game);
  const i = list.findIndex((l) => l.id === lessonId);
  return {
    prev: i > 0 ? list[i - 1] : null,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : null,
  };
}

export function progressOfGame(catalog, game, completedIds) {
  const lessons = orderedLessons(catalog, game);
  const done = lessons.filter((l) => completedIds.includes(l.id)).length;
  return { done, total: lessons.length, percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
}

// shortcut: filters the in-memory catalog; move to a MongoDB text index when lessons exceed about 1,000.
// Returns [{ lesson, game }], title matches first.
export function searchLessons(catalog, query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results = [];
  for (const lesson of catalog.lessons) {
    const game = gameById(catalog, lesson.game);
    if (!game) continue;
    const inTitle = lesson.title.toLowerCase().includes(q);
    const inRest = `${lesson.summary} ${game.name}`.toLowerCase().includes(q);
    if (inTitle || inRest) results.push({ lesson, game, rank: inTitle ? 0 : 1 });
  }
  return results
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map(({ lesson, game }) => ({ lesson, game }));
}

// Maps a rank to a lesson difficulty: bottom third of the ladder = beginner, middle = intermediate, top = advanced.
export function tierForRank(game, rank) {
  const i = game ? game.ranks.indexOf(rank) : -1;
  if (i < 0) return DIFFICULTIES[0];
  return DIFFICULTIES[Math.min(2, Math.floor((i / game.ranks.length) * 3))];
}

// Lessons the user should do next: from their game plus the fundamentals track of the same genre,
// not completed yet, weakest skill first, then lessons at their rank's difficulty. Returns [{ lesson, game }].
export function recommendLessons(catalog, user, limit = 6) {
  const game = user?.profile?.game ? gameById(catalog, user.profile.game) : null;
  if (!game) return [];
  const fundamentals = catalog.games.filter((g) => g.isFundamentals && g.genre === game.genre && g.id !== game.id);
  const tier = tierForRank(game, user.profile.currentRank);
  const done = user.completedLessons || [];
  const score = ({ lesson }) =>
    (lesson.skill && lesson.skill === user.profile.weakness ? 2 : 0) + (lesson.difficulty === tier ? 1 : 0);
  return [...fundamentals, game]
    .flatMap((g) => orderedLessons(catalog, g).map((lesson) => ({ lesson, game: g })))
    .filter(({ lesson }) => !done.includes(lesson.id))
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}
