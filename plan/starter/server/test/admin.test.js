import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer, clearDb, createClient, loginAs, createGameWithLesson } from '../testkit.js';

before(startTestServer);
after(stopTestServer);
beforeEach(clearDb);

const missingId = 'aaaaaaaaaaaaaaaaaaaaaaaa';

const lessonBody = (game, extra = {}) => ({
  game: game.id,
  section: game.sections[0].id,
  title: 'Counter-Strafing',
  slug: 'counter-strafing',
  summary: 'Stop instantly so the first bullet is accurate.',
  body: '## How\n\nTap the opposite key.',
  difficulty: 'intermediate',
  skill: 'movement',
  demo: 'counter-strafe',
  drills: [{ name: 'Strafe, stop, shoot', tool: 'In-game', minutes: 10 }],
  published: true,
  ...extra,
});

test('admin routes reject visitors (401) and normal users (403)', async () => {
  assert.equal((await createClient()('GET', '/api/admin/users')).status, 401);
  assert.equal((await (await loginAs('user'))('GET', '/api/admin/users')).status, 403);
  assert.equal((await (await loginAs('user', 'u2@example.com'))('POST', '/api/admin/games', {})).status, 403);
});

test('lessons: create, validate, list, update, delete', async () => {
  const { game, lesson: first } = await createGameWithLesson();
  const admin = await loginAs('admin');

  const created = await admin('POST', '/api/admin/lessons', lessonBody(game));
  assert.equal(created.status, 201);
  assert.equal(created.body.lesson.drills[0].name, 'Strafe, stop, shoot');
  const id = created.body.lesson.id;

  assert.equal((await admin('POST', '/api/admin/lessons', lessonBody(game))).status, 409);

  const wrongSection = await admin('POST', '/api/admin/lessons', lessonBody(game, { slug: 'other', section: missingId }));
  assert.equal(wrongSection.status, 400);
  assert.ok(wrongSection.body.error.fields.section);

  const wrongGame = await admin('POST', '/api/admin/lessons', lessonBody(game, { slug: 'other', game: missingId }));
  assert.equal(wrongGame.status, 400);
  assert.ok(wrongGame.body.error.fields.game);

  const invalid = await admin('POST', '/api/admin/lessons', lessonBody(game, { slug: 'Bad Slug', difficulty: 'godlike', clipUrl: 'http://x.com/a.gif', title: '' }));
  assert.equal(invalid.status, 400);
  for (const field of ['slug', 'difficulty', 'clipUrl', 'title']) assert.ok(invalid.body.error.fields[field], `expected an error for ${field}`);

  const updated = await admin('PUT', `/api/admin/lessons/${id}`, { title: 'Counter-Strafing Basics', published: false, clipUrl: 'https://example.com/clip.webm' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.lesson.title, 'Counter-Strafing Basics');
  assert.equal(updated.body.lesson.slug, 'counter-strafing');

  const list = await admin('GET', '/api/admin/lessons');
  assert.equal(list.body.lessons.length, 2);
  assert.equal(list.body.lessons.find((l) => l.id === id).published, false);
  assert.equal(list.body.lessons[0].body, undefined);
  assert.equal((await admin('GET', `/api/admin/lessons/${id}`)).body.lesson.body, '## How\n\nTap the opposite key.');
  assert.equal((await createClient()('GET', '/api/catalog')).body.lessons.length, 1);

  // deleting a lesson also removes it from users' progress
  const player = await loginAs('user');
  await player('PUT', `/api/me/progress/${first.id}`);
  assert.equal((await admin('DELETE', `/api/admin/lessons/${first.id}`)).status, 204);
  assert.deepEqual((await player('GET', '/api/auth/me')).body.user.completedLessons, []);
  assert.equal((await admin('DELETE', `/api/admin/lessons/${first.id}`)).status, 404);
  assert.equal((await admin('PUT', '/api/admin/lessons/not-an-id', {})).status, 404);
});

test('games: create, edit sections safely, delete only when empty', async () => {
  const { game, lesson } = await createGameWithLesson();
  const admin = await loginAs('admin');

  const created = await admin('POST', '/api/admin/games', {
    name: 'Second Game',
    slug: 'second-game',
    description: 'Another track',
    genre: 'fighting',
    ranks: ['Bronze', 'Gold'],
    sections: [{ title: 'Basics' }],
    order: 5,
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.game.sections[0].title, 'Basics');
  assert.equal((await admin('POST', '/api/admin/games', { name: 'Dup', slug: 'second-game', description: 'x', genre: 'fps' })).status, 409);
  const invalid = await admin('POST', '/api/admin/games', { name: 'X', slug: 'ok', description: '', genre: 'moba' });
  assert.equal(invalid.status, 400);
  for (const field of ['name', 'description', 'genre']) assert.ok(invalid.body.error.fields[field], `expected an error for ${field}`);

  // rename the first section, keep the second, add a third: ids of kept sections do not change
  const [aiming, movement] = game.sections;
  const renamed = await admin('PUT', `/api/admin/games/${game.id}`, {
    sections: [{ id: aiming.id, title: 'Aim' }, { id: movement.id, title: 'Movement' }, { title: 'Game Sense' }],
  });
  assert.equal(renamed.status, 200);
  assert.deepEqual(renamed.body.game.sections.map((s) => s.title), ['Aim', 'Movement', 'Game Sense']);
  assert.equal(renamed.body.game.sections[0].id, aiming.id);
  assert.equal(renamed.body.game.name, 'Test Game');

  // the first section still has a lesson, so it cannot be removed
  const blocked = await admin('PUT', `/api/admin/games/${game.id}`, { sections: [{ id: movement.id, title: 'Movement' }] });
  assert.equal(blocked.status, 409);
  assert.match(blocked.body.error.message, /Aim/);

  assert.equal((await admin('DELETE', `/api/admin/games/${game.id}`)).status, 409);
  await admin('DELETE', `/api/admin/lessons/${lesson.id}`);
  assert.equal((await admin('PUT', `/api/admin/games/${game.id}`, { sections: [{ id: movement.id, title: 'Movement' }] })).status, 200);

  // a user who picked the game goes back to "no game" when it is deleted
  const player = await loginAs('user');
  await player('PATCH', '/api/me/profile', { game: game.id, currentRank: 'Low' });
  assert.equal((await admin('DELETE', `/api/admin/games/${game.id}`)).status, 204);
  const profile = (await player('GET', '/api/auth/me')).body.user.profile;
  assert.equal(profile.game, null);
  assert.equal(profile.currentRank, '');
});

test('maps: create, validate, update, delete', async () => {
  const { game } = await createGameWithLesson();
  const admin = await loginAs('admin');
  const body = {
    game: game.id,
    name: 'Training Yard',
    slug: 'training-yard',
    imageUrl: '/maps/training-yard.svg',
    callouts: [{ name: 'Mid', x: 0.5, y: 0.5 }],
    lineups: [{ title: 'Mid smoke', kind: 'smoke', from: { x: 0.1, y: 0.9 }, to: { x: 0.5, y: 0.5 }, steps: 'Aim at the lamp and throw.' }],
  };
  const created = await admin('POST', '/api/admin/maps', body);
  assert.equal(created.status, 201);
  const id = created.body.map.id;

  assert.equal((await admin('POST', '/api/admin/maps', body)).status, 409);
  assert.ok((await admin('POST', '/api/admin/maps', { ...body, slug: 'm2', game: missingId })).body.error.fields.game);
  assert.equal((await admin('POST', '/api/admin/maps', { ...body, slug: 'm3', imageUrl: 'javascript:alert(1)' })).status, 400);
  assert.equal((await admin('POST', '/api/admin/maps', { ...body, slug: 'm4', callouts: [{ name: 'Out', x: 1.5, y: 0.5 }] })).status, 400);
  assert.equal((await admin('POST', '/api/admin/maps', { ...body, slug: 'm5', lineups: [{ ...body.lineups[0], kind: 'nuke' }] })).status, 400);

  const updated = await admin('PUT', `/api/admin/maps/${id}`, { callouts: [], imageUrl: 'https://example.com/map.png' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.map.callouts.length, 0);
  assert.equal(updated.body.map.lineups.length, 1);

  assert.equal((await admin('DELETE', `/api/admin/maps/${id}`)).status, 204);
  assert.equal((await createClient()('GET', '/api/maps/training-yard')).status, 404);
});

test('users: list, change role, protect your own account, delete', async () => {
  const admin = await loginAs('admin');
  const player = await loginAs('user');
  const me = (await admin('GET', '/api/auth/me')).body.user;
  const other = (await player('GET', '/api/auth/me')).body.user;

  const list = await admin('GET', '/api/admin/users');
  assert.equal(list.body.users.length, 2);
  assert.equal(list.body.users[0].passwordHash, undefined);

  const promoted = await admin('PATCH', `/api/admin/users/${other.id}`, { role: 'admin' });
  assert.equal(promoted.body.user.role, 'admin');
  assert.equal((await player('GET', '/api/admin/users')).status, 200);
  assert.equal((await admin('PATCH', `/api/admin/users/${other.id}`, { role: 'owner' })).status, 400);
  assert.equal((await admin('PATCH', `/api/admin/users/${me.id}`, { role: 'user' })).status, 400);
  assert.equal((await admin('DELETE', `/api/admin/users/${me.id}`)).status, 400);
  assert.equal((await admin('DELETE', `/api/admin/users/${other.id}`)).status, 204);
  assert.equal((await player('GET', '/api/auth/me')).status, 401);
  assert.equal((await admin('DELETE', `/api/admin/users/${missingId}`)).status, 404);
});
