import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer, clearDb, createClient } from '../testkit.js';

before(startTestServer);
after(stopTestServer);
beforeEach(clearDb);

const alice = { name: 'Alice', email: 'alice@example.com', password: 'password123' };

test('register logs the user in and never returns the password hash', async () => {
  const api = createClient();
  const res = await api('POST', '/api/auth/register', alice);
  assert.equal(res.status, 201);
  assert.equal(res.body.user.email, 'alice@example.com');
  assert.equal(res.body.user.role, 'user');
  assert.equal(res.body.user.passwordHash, undefined);
  const me = await api('GET', '/api/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.user.name, 'Alice');
});

test('register rejects a duplicate email, a short password and a bad email', async () => {
  const api = createClient();
  await api('POST', '/api/auth/register', alice);
  assert.equal((await api('POST', '/api/auth/register', alice)).status, 409);
  assert.equal((await api('POST', '/api/auth/register', { ...alice, email: 'b@example.com', password: 'short' })).status, 400);
  const bad = await api('POST', '/api/auth/register', { ...alice, email: 'not-an-email' });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.error.fields.email);
});

test('login works with the right password only, and logout ends the session', async () => {
  await createClient()('POST', '/api/auth/register', alice);
  const api = createClient();
  assert.equal((await api('GET', '/api/auth/me')).status, 401);
  assert.equal((await api('POST', '/api/auth/login', { email: alice.email, password: 'wrong-password' })).status, 401);
  assert.equal((await api('POST', '/api/auth/login', { email: { $gt: '' }, password: { $gt: '' } })).status, 401);
  assert.equal((await api('POST', '/api/auth/login', { email: 'ALICE@example.com', password: alice.password })).status, 200);
  assert.equal((await api('GET', '/api/auth/me')).status, 200);
  assert.equal((await api('POST', '/api/auth/logout')).status, 204);
  assert.equal((await api('GET', '/api/auth/me')).status, 401);
});

test('unknown api routes return a JSON 404', async () => {
  const api = createClient();
  const res = await api('GET', '/api/nope');
  assert.equal(res.status, 404);
  assert.equal(res.body.error.message, 'Not found');
});
