import { test } from 'node:test';
import assert from 'node:assert/strict';
import { peekAdvantage, sightThresholds } from './peek.js';

test('the player farther from the corner sees first', () => {
  // peeker hugging the wall, defender far back: defender sees the shoulder 72 ms early
  assert.deepEqual(peekAdvantage({ peekerDist: 1, defenderDist: 10 }), { geoMs: 72, netMs: 72, winner: 'defender' });
  // roles reversed: the peeker wins by a lot
  assert.equal(peekAdvantage({ peekerDist: 10, defenderDist: 1 }).winner, 'peeker');
  assert.equal(peekAdvantage({ peekerDist: 10, defenderDist: 1 }).netMs, -720);
  assert.equal(peekAdvantage({ peekerDist: 4, defenderDist: 4 }).winner, 'even');
});

test('latency moves the advantage towards the peeker', () => {
  const result = peekAdvantage({ peekerDist: 1, defenderDist: 10, latencyMs: 100 });
  assert.equal(result.netMs, -28);
  assert.equal(result.winner, 'peeker');
});

test('invalid distances return null', () => {
  assert.equal(peekAdvantage({ peekerDist: 0, defenderDist: 5 }), null);
  assert.equal(peekAdvantage({ peekerDist: 5, defenderDist: NaN }), null);
});

test('drawing thresholds agree with the advantage formula', () => {
  const t = sightThresholds({ peekerDist: 1, defenderDist: 10, defenderOffset: 1 });
  // the gap between the two moments is the geometric advantage in metres: 0.4 * (1 - 1/10) = 0.36
  assert.ok(Math.abs(t.peekerSeesAt - t.defenderSeesAt - 0.36) < 1e-9);
  assert.ok(t.defenderSeesAt < t.peekerSeesAt);
});
