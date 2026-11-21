import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertSensitivity, edpi, cmPer360 } from './sensitivity.js';

const close = (actual, expected, tolerance = 0.001) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);

test('CS2 2.0 converts to Valorant 0.629', () => {
  close(convertSensitivity({ fromGame: 'cs2', toGame: 'valorant', sens: 2, fromDpi: 800 }), 0.6286);
});

test('a DPI change is compensated', () => {
  close(convertSensitivity({ fromGame: 'cs2', toGame: 'cs2', sens: 2, fromDpi: 800, toDpi: 1600 }), 1);
});

test('CS2 2.0 at 800 DPI is about 26 cm per 360', () => {
  close(cmPer360({ game: 'cs2', sens: 2, dpi: 800 }), 25.977, 0.01);
});

test('eDPI multiplies, and bad input returns null instead of NaN', () => {
  assert.equal(edpi(800, 2), 1600);
  assert.equal(edpi(0, 2), null);
  assert.equal(convertSensitivity({ fromGame: 'cs2', toGame: 'valorant', sens: NaN, fromDpi: 800 }), null);
  assert.equal(cmPer360({ game: 'cs2', sens: -1, dpi: 800 }), null);
});
