import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CROSSHAIR, hexToRgb, crosshairRects, cs2Commands, valorantSettings } from './crosshair.js';

test('hex colours convert to RGB, bad input falls back to green', () => {
  assert.deepEqual(hexToRgb('#FF8000'), { r: 255, g: 128, b: 0 });
  assert.deepEqual(hexToRgb('red'), { r: 0, g: 255, b: 0 });
});

test('four arms, plus a dot when enabled, none when length is 0', () => {
  const rects = crosshairRects(DEFAULT_CROSSHAIR);
  assert.equal(rects.length, 4);
  assert.deepEqual(rects[0], { x: 3, y: -1, w: 6, h: 2 });
  assert.deepEqual(rects[1], { x: -9, y: -1, w: 6, h: 2 });
  assert.equal(crosshairRects({ ...DEFAULT_CROSSHAIR, dot: true }).length, 5);
  assert.deepEqual(crosshairRects({ ...DEFAULT_CROSSHAIR, length: 0, dot: true }), [{ x: -1, y: -1, w: 2, h: 2 }]);
});

test('CS2 commands carry the colour and the converted sizes', () => {
  const lines = cs2Commands(DEFAULT_CROSSHAIR).split('\n');
  assert.equal(lines.length, 13);
  assert.ok(lines.includes('cl_crosshairsize 2.5'));
  assert.ok(lines.includes('cl_crosshairthickness 1'));
  assert.ok(lines.includes('cl_crosshairgap -2.5'));
  assert.ok(lines.includes('cl_crosshaircolor_g 255'));
  assert.ok(lines.includes('cl_crosshairdot 0'));
  assert.ok(lines.includes('cl_crosshair_drawoutline 1'));
});

test('Valorant rows mirror the generator values', () => {
  const rows = Object.fromEntries(valorantSettings({ ...DEFAULT_CROSSHAIR, dot: true }));
  assert.equal(rows['Crosshair Color'], '#00FF00');
  assert.equal(rows['Center Dot'], 'On');
  assert.equal(rows['Inner Line Length'], '6');
  assert.equal(rows['Inner Line Offset'], '3');
});
