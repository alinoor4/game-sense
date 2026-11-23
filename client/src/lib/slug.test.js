import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './slug.js';
import { SLUG_PATTERN } from './constants.js';

test('slugify produces valid slugs', () => {
  assert.equal(slugify('Counter-Strafing 101!'), 'counter-strafing-101');
  assert.equal(slugify('  AK-47 & M4  '), 'ak-47-m4');
  assert.match(slugify('Peeker’s Advantage'), SLUG_PATTERN);
  assert.equal(slugify('!!!'), '');
});
