import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SENS_GAMES, convertSensitivity, edpi, cmPer360 } from '../src/lib/sensitivity.js';
import { DEFAULT_CROSSHAIR, CROSSHAIR_LIMITS, crosshairRects, cs2Commands, valorantSettings } from '../src/lib/crosshair.js';
import { generateRoutine } from '../src/lib/routine.js';
import { WEAKNESSES, SKILL_LABELS } from '../src/lib/constants.js';

// The converter page keeps its inputs as strings and converts them with Number(), like this.
const convert = ({ fromGame = 'cs2', toGame = 'valorant', sens = '2', fromDpi = '800', toDpi = fromDpi } = {}) =>
  convertSensitivity({ fromGame, toGame, sens: Number(sens), fromDpi: Number(fromDpi), toDpi: Number(toDpi) });

const sum = (blocks) => blocks.reduce((total, block) => total + block.minutes, 0);

test('converter: the defaults show 0.629, eDPI 1600 and 503, 26.0 cm and 10.2 in', () => {
  const converted = convert();
  const cm = cmPer360({ game: 'cs2', sens: 2, dpi: 800 });
  assert.equal(converted.toFixed(3), '0.629');
  assert.equal(Math.round(edpi(800, 2)), 1600);
  assert.equal(Math.round(edpi(800, converted)), 503);
  assert.equal(cm.toFixed(1), '26.0');
  assert.equal((cm / 2.54).toFixed(1), '10.2');
});

test('converter: swapping the games gives 6.364, a second DPI of 1600 halves the result', () => {
  assert.equal(convert({ fromGame: 'valorant', toGame: 'cs2' }).toFixed(3), '6.364');
  assert.equal(convert({ toDpi: '1600' }).toFixed(3), '0.314');
});

test('converter: an empty, zero or negative field gives null, so the page shows its message instead of NaN', () => {
  for (const bad of ['', '0', '-1']) {
    assert.equal(convert({ sens: bad }), null, `sensitivity "${bad}"`);
    assert.equal(convert({ fromDpi: bad }), null, `DPI "${bad}"`);
    assert.equal(convert({ toDpi: bad }), null, `second DPI "${bad}"`);
  }
});

test('converter: the result keeps the same distance per 360° for every pair of games', () => {
  for (const from of SENS_GAMES) {
    for (const to of SENS_GAMES) {
      const sens = convertSensitivity({ fromGame: from.id, toGame: to.id, sens: 1.5, fromDpi: 800, toDpi: 1600 });
      const before = cmPer360({ game: from.id, sens: 1.5, dpi: 800 });
      const after = cmPer360({ game: to.id, sens, dpi: 1600 });
      assert.ok(Math.abs(after - before) < 1e-9, `${from.id} to ${to.id}: ${before} cm became ${after} cm`);
    }
  }
});

test('crosshair: every control changes the CS2 commands and the Valorant settings', () => {
  const cs2 = cs2Commands(DEFAULT_CROSSHAIR);
  const valorant = valorantSettings(DEFAULT_CROSSHAIR);
  const changes = [
    ...Object.entries(CROSSHAIR_LIMITS).flatMap(([key, [min, max]]) => [{ [key]: min }, { [key]: max }]),
    { color: '#ff3366' },
    { dot: true },
    { outline: false },
  ];
  for (const change of changes) {
    const c = { ...DEFAULT_CROSSHAIR, ...change };
    assert.notEqual(cs2Commands(c), cs2, JSON.stringify(change));
    assert.notDeepEqual(valorantSettings(c), valorant, JSON.stringify(change));
  }
});

test('crosshair: every slider position gives numeric CS2 values and a visible thickness', () => {
  for (const [key, [min, max]] of Object.entries(CROSSHAIR_LIMITS)) {
    for (let value = min; value <= max; value += 1) {
      const commands = Object.fromEntries(cs2Commands({ ...DEFAULT_CROSSHAIR, [key]: value }).split('\n').map((line) => line.split(' ')));
      assert.ok(Object.values(commands).every((v) => Number.isFinite(Number(v))), `${key} ${value}`);
      assert.ok(Number(commands.cl_crosshairthickness) >= 0.5, `${key} ${value}`);
    }
  }
});

test('crosshair: nine Valorant rows, and nothing to draw means the inner lines are off', () => {
  assert.equal(valorantSettings(DEFAULT_CROSSHAIR).length, 9);
  const empty = { ...DEFAULT_CROSSHAIR, length: 0, dot: false };
  assert.deepEqual(crosshairRects(empty), []);
  assert.equal(Object.fromEntries(valorantSettings(empty))['Show Inner Lines'], 'Off');
});

test('routine: whatever the minutes field holds, the total is a whole number from 30 to 480', () => {
  // "Save as my daily plan" sends this total as profile.dailyMinutes, which the API accepts only as an integer 30-480.
  const inputs = [...Array.from({ length: 601 }, (_, i) => String(i)), '', '37.5', '-20'];
  for (const minutes of inputs) {
    const total = sum(generateRoutine({ minutes: Number(minutes) }));
    assert.ok(Number.isInteger(total) && total >= 30 && total <= 480, `"${minutes}" gives ${total}`);
  }
});

test('routine: every choice in the Focus list has a label and its own drills and ranked focus', () => {
  const mixed = generateRoutine({ weakness: '' });
  for (const weakness of WEAKNESSES) {
    const blocks = generateRoutine({ weakness });
    assert.ok(SKILL_LABELS[weakness], `label for ${weakness}`);
    assert.notEqual(blocks[1].focus, mixed[1].focus, `isolation drills for ${weakness}`);
    assert.notEqual(blocks[3].focus, mixed[3].focus, `ranked focus for ${weakness}`);
  }
});
