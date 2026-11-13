import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer, clearDb, createClient, loginAs, createGameWithLesson } from '../testkit.js';
import { Lesson } from '../src/models/Lesson.js';
import { GameMap } from '../src/models/GameMap.js';

before(startTestServer);
after(stopTestServer);
beforeEach(clearDb);

async function addDraft(game) {
  return Lesson.create({
    game: game._id,
    section: game.sections[1]._id,
    title: 'Draft Lesson',
    slug: 'draft-lesson',
    summary: 'Not published yet.',
    body: 'Draft body',
    difficulty: 'advanced',
  });
}

test('catalog lists games, published lessons without bodies, and maps', async () => {
  const { game, lesson } = await createGameWithLesson();
  await addDraft(game);
  await GameMap.create({ game: game._id, name: 'Yard', slug: 'yard', imageUrl: '/maps/yard.svg' });

  const res = await createClient()('GET', '/api/catalog');
  assert.equal(res.status, 200);
  assert.equal(res.body.games.length, 1);
  assert.equal(res.body.games[0].slug, 'test-game');
  assert.equal(res.body.games[0].sections.length, 2);
  assert.equal(typeof res.body.games[0].sections[0].id, 'string');

  assert.equal(res.body.lessons.length, 1);
  const listed = res.body.lessons[0];
  assert.equal(listed.id, lesson.id);
  assert.equal(listed.game, game.id);
  assert.equal(listed.section, game.sections[0].id);
  assert.equal(listed.skill, 'precision');
  assert.equal(listed.body, undefined);

  assert.deepEqual(Object.keys(res.body.maps[0]).sort(), ['game', 'id', 'name', 'slug']);
});

test('a lesson is fetched by game slug and lesson slug', async () => {
  await createGameWithLesson();
  const api = createClient();
  const res = await api('GET', '/api/lessons/test-game/crosshair-placement');
  assert.equal(res.status, 200);
  assert.match(res.body.lesson.body, /Why it matters/);
  assert.equal((await api('GET', '/api/lessons/test-game/nope')).status, 404);
  assert.equal((await api('GET', '/api/lessons/nope/crosshair-placement')).status, 404);
});

test('an unpublished lesson is visible to admins only', async () => {
  const { game } = await createGameWithLesson();
  await addDraft(game);
  const path = '/api/lessons/test-game/draft-lesson';
  assert.equal((await createClient()('GET', path)).status, 404);
  assert.equal((await (await loginAs('user'))('GET', path)).status, 404);
  assert.equal((await (await loginAs('admin'))('GET', path)).status, 200);
});

test('a map is fetched by slug with its callouts and lineups', async () => {
  const { game } = await createGameWithLesson();
  await GameMap.create({
    game: game._id,
    name: 'Yard',
    slug: 'yard',
    imageUrl: '/maps/yard.svg',
    callouts: [{ name: 'Mid', x: 0.5, y: 0.5 }],
    lineups: [{ title: 'Mid smoke', kind: 'smoke', from: { x: 0.1, y: 0.9 }, to: { x: 0.5, y: 0.5 }, steps: 'Stand in the corner.' }],
  });
  const api = createClient();
  const res = await api('GET', '/api/maps/yard');
  assert.equal(res.status, 200);
  assert.equal(res.body.map.callouts[0].name, 'Mid');
  assert.deepEqual(res.body.map.lineups[0].to, { x: 0.5, y: 0.5 });
  assert.equal(typeof res.body.map.lineups[0].id, 'string');
  assert.equal((await api('GET', '/api/maps/nope')).status, 404);
});
