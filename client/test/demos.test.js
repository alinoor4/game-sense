import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROUND_SECONDS, FLICK_RADIUS, TRACK_RADIUS, spawnTarget, trackingTarget, isInside, accuracy, averageHitMs, onTargetPercent } from '../src/lib/aim.js';
import { ACCURATE_SPEED, STANDING, strafeStep, judgeShot } from '../src/lib/strafe.js';
import { TARGET, ENEMY_AT, typicalPath, trainedPath, travelPx } from '../src/lib/placement.js';
import { peekAdvantage } from '../src/lib/peek.js';

const fits = ({ x, y }, radius) => x - radius >= 0 && x + radius <= 640 && y - radius >= 0 && y + radius <= 360;

test('aim trainer: a click on the edge of the target is a hit, just past it is a miss', () => {
  const target = { x: 100, y: 100 };
  assert.ok(isInside({ x: 118, y: 100 }, target, FLICK_RADIUS));
  assert.ok(isInside({ x: 100, y: 82 }, target, FLICK_RADIUS));
  assert.ok(isInside({ x: 110, y: 110 }, target, FLICK_RADIUS)); // 14.1 from the centre
  assert.ok(!isInside({ x: 118.1, y: 100 }, target, FLICK_RADIUS));
  assert.ok(!isInside({ x: 113, y: 113 }, target, FLICK_RADIUS)); // 18.4 from the centre
  assert.ok(isInside({ x: 122, y: 100 }, target, TRACK_RADIUS));
});

test('aim trainer: flick targets always land fully on the canvas', () => {
  assert.deepEqual(spawnTarget(() => 0), { x: 30, y: 30 });
  for (const random of [0, 0.5, 1 - Number.EPSILON]) {
    const target = spawnTarget(() => random);
    assert.ok(fits(target, FLICK_RADIUS), `${target.x}, ${target.y}`);
  }
});

test('aim trainer: the tracking target stays fully on the canvas for the whole round', () => {
  for (let t = 0; t <= ROUND_SECONDS; t += 0.01) {
    const target = trackingTarget(t);
    assert.ok(fits(target, TRACK_RADIUS), `t = ${t}: ${target.x}, ${target.y}`);
  }
});

test('aim trainer: results are 0 before anything is counted, never NaN', () => {
  assert.equal(accuracy(0, 0), 0);
  assert.equal(averageHitMs(0, 0), 0);
  assert.equal(onTargetPercent(0, 0), 0);
  assert.equal(accuracy(3, 1), 75);
  assert.equal(accuracy(1, 2), 33);
  assert.equal(averageHitMs(1000, 3), 333);
});

test('aim trainer: following the target for half the round scores 50% on target', () => {
  // The same bookkeeping as the demo: each frame adds dt to onTarget while the pointer is inside the circle.
  const dt = 1 / 60;
  let elapsed = 0;
  let onTarget = 0;
  while (elapsed < ROUND_SECONDS) {
    elapsed = Math.min(ROUND_SECONDS, elapsed + dt);
    const target = trackingTarget(elapsed);
    const pointer = elapsed <= ROUND_SECONDS / 2 ? target : { x: 10, y: 10 };
    if (isInside(pointer, target, TRACK_RADIUS)) onTarget += dt;
  }
  assert.equal(onTargetPercent(onTarget, elapsed), 50);
});

// Runs the counter-strafe model at 60 frames per second, like the demo's animation loop.
const FRAME = 1 / 60;
function play({ state, now }, input, frames) {
  for (let i = 0; i < frames; i += 1) {
    now += 1000 * FRAME;
    state = strafeStep(state, input, FRAME, now);
  }
  return { state, now };
}
function framesUntilAccurate(run, input) {
  let frames = 0;
  while (Math.abs(run.state.v) > ACCURATE_SPEED) {
    run = play(run, input, 1);
    frames += 1;
  }
  return frames;
}
const strafing = play({ state: STANDING, now: 0 }, 1, 30); // half a second holding D: full speed

test('counter-strafe: releasing the key and shooting at once is too early', () => {
  assert.equal(strafing.state.v, 1);
  const released = play(strafing, 0, 1);
  assert.equal(judgeShot(released.state, released.now), 'early');
});

test('counter-strafe: a short tap of the opposite key, then a shot, is clean', () => {
  const tapped = play(strafing, -1, 4); // A for four frames, about 67 ms
  assert.ok(Math.abs(tapped.state.v) <= ACCURATE_SPEED);
  assert.equal(judgeShot(tapped.state, tapped.now), 'clean');
});

test('counter-strafe: the opposite key stops you in 4 frames, friction alone needs 10', () => {
  assert.equal(framesUntilAccurate(strafing, -1), 4);
  assert.equal(framesUntilAccurate(strafing, 0), 10);
});

test('counter-strafe: a shot long after stopping, or without moving, is accurate but not a counter-strafe', () => {
  assert.equal(judgeShot(STANDING, 1000), 'still');
  const stopped = play(strafing, 0, 60);
  assert.equal(judgeShot(stopped.state, stopped.now), 'still');
});

test('counter-strafe: friction stops at exactly 0 and the edges of the box stop the player', () => {
  assert.equal(play(strafing, 0, 60).state.v, 0);
  const right = play(strafing, 1, 300).state;
  assert.deepEqual([right.x, right.v], [600, 0]);
  assert.equal(play({ state: STANDING, now: 0 }, -1, 300).state.x, 40);
});

test('peek advantage: the lesson numbers, 2 m vs 8 m at 40 ms and 8 m vs 8 m', () => {
  assert.deepEqual(peekAdvantage({ peekerDist: 2, defenderDist: 8, latencyMs: 40 }), { geoMs: 60, netMs: 20, winner: 'defender' });
  assert.deepEqual(peekAdvantage({ peekerDist: 8, defenderDist: 8, latencyMs: 40 }), { geoMs: 0, netMs: -40, winner: 'peeker' });
});

test('crosshair comparison: the typical habit travels about 185 px, the trained one about 5 px', () => {
  assert.equal(travelPx(typicalPath), 185);
  assert.equal(travelPx(trainedPath), 5);
});

test('crosshair comparison: on target 0.60 s and 0.33 s after the enemy appears, not before', () => {
  const onTarget = (path, t) => Math.hypot(path(t).x - TARGET.x, path(t).y - TARGET.y) < 1e-9;
  assert.ok(onTarget(typicalPath, ENEMY_AT + 0.6) && !onTarget(typicalPath, ENEMY_AT + 0.59));
  assert.ok(onTarget(trainedPath, ENEMY_AT + 0.33) && !onTarget(trainedPath, ENEMY_AT + 0.32));
});
