import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRoutine, routineToText } from './routine.js';

const minutesOf = (blocks) => blocks.map((b) => b.minutes);
const sum = (blocks) => minutesOf(blocks).reduce((a, b) => a + b, 0);

test('145 minutes gives the 15 / 30 / 40 / 60 split', () => {
  const blocks = generateRoutine({ minutes: 145, weakness: 'movement' });
  assert.deepEqual(minutesOf(blocks), [15, 30, 40, 60]);
  assert.deepEqual(blocks.map((b) => b.key), ['warmup', 'isolation', 'gamesense', 'ranked']);
  assert.match(blocks[1].focus, /Strafe, stop, shoot/);
  assert.match(blocks[3].focus, /full stop/);
  assert.equal(blocks[0].link, '/tools/aim-trainer');
});

test('blocks always add up to the total and never drop below 5 minutes', () => {
  for (const minutes of [30, 45, 60, 90, 120, 200, 480]) {
    const blocks = generateRoutine({ minutes });
    assert.equal(sum(blocks), minutes, `total for ${minutes}`);
    assert.ok(minutesOf(blocks).every((m) => m >= 5), `no tiny block for ${minutes}`);
  }
});

test('odd input is clamped and unknown weakness falls back to the mixed plan', () => {
  assert.equal(sum(generateRoutine({ minutes: 5 })), 30);
  assert.equal(sum(generateRoutine({ minutes: 9999 })), 480);
  assert.equal(sum(generateRoutine({ minutes: 'abc' })), 145);
  assert.equal(sum(generateRoutine()), 145);
  assert.match(generateRoutine({ weakness: 'luck' })[1].focus, /Mixed drills/);
});

test('text export has one line per block', () => {
  const text = routineToText(generateRoutine({ minutes: 145 }));
  assert.equal(text.split('\n').length, 4);
  assert.match(text, /^\[ 15 min \] Warm-up -> /);
});
