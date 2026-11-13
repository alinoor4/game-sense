import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer, clearDb, createClient, loginAs, createGameWithLesson } from '../testkit.js';

before(startTestServer);
after(stopTestServer);
beforeEach(clearDb);

const missingId = 'aaaaaaaaaaaaaaaaaaaaaaaa';

test('every /api/me route needs a login', async () => {
  const api = createClient();
  assert.equal((await api('PATCH', '/api/me/profile', { weakness: 'recoil' })).status, 401);
  assert.equal((await api('PUT', `/api/me/progress/${missingId}`)).status, 401);
  assert.equal((await api('DELETE', `/api/me/progress/${missingId}`)).status, 401);
});

test('profile can be saved and comes back on the user', async () => {
  const { game } = await createGameWithLesson();
  const api = await loginAs('user');
  const res = await api('PATCH', '/api/me/profile', {
    game: game.id,
    currentRank: 'Low',
    targetRank: 'High',
    weakness: 'movement',
    dailyMinutes: 90,
  });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.user.profile, { game: game.id, currentRank: 'Low', targetRank: 'High', weakness: 'movement', dailyMinutes: 90 });
  assert.equal(res.body.user.passwordHash, undefined);
  const me = await api('GET', '/api/auth/me');
  assert.equal(me.body.user.profile.weakness, 'movement');
});

test('profile rejects bad values and ignores fields it does not own', async () => {
  const { game } = await createGameWithLesson();
  const api = await loginAs('user');

  const noGame = await api('PATCH', '/api/me/profile', { game: missingId });
  assert.equal(noGame.status, 400);
  assert.ok(noGame.body.error.fields.game);

  const badRank = await api('PATCH', '/api/me/profile', { game: game.id, currentRank: 'Radiant' });
  assert.equal(badRank.status, 400);
  assert.ok(badRank.body.error.fields.currentRank);

  assert.equal((await api('PATCH', '/api/me/profile', { weakness: 'luck' })).status, 400);
  assert.equal((await api('PATCH', '/api/me/profile', { dailyMinutes: 10 })).status, 400);
  assert.equal((await api('PATCH', '/api/me/profile', { dailyMinutes: 60.5 })).status, 400);

  const sneaky = await api('PATCH', '/api/me/profile', { role: 'admin', weakness: 'recoil' });
  assert.equal(sneaky.status, 200);
  assert.equal(sneaky.body.user.role, 'user');

  const cleared = await api('PATCH', '/api/me/profile', { game: null });
  assert.equal(cleared.body.user.profile.game, null);
});

test('progress: mark once, mark twice, unmark', async () => {
  const { lesson } = await createGameWithLesson();
  const api = await loginAs('user');
  assert.deepEqual((await api('PUT', `/api/me/progress/${lesson.id}`)).body.completedLessons, [lesson.id]);
  assert.deepEqual((await api('PUT', `/api/me/progress/${lesson.id}`)).body.completedLessons, [lesson.id]);
  assert.equal((await api('PUT', `/api/me/progress/${missingId}`)).status, 404);
  assert.equal((await api('PUT', '/api/me/progress/not-an-id')).status, 404);
  assert.deepEqual((await api('DELETE', `/api/me/progress/${lesson.id}`)).body.completedLessons, []);
});
