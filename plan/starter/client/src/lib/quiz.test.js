import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, scoreQuiz } from './quiz.js';

test('there are 8 questions with 4 options each', () => {
  assert.equal(QUESTIONS.length, 8);
  for (const q of QUESTIONS) assert.equal(q.options.length, 4);
});

test('the most-picked weakness wins', () => {
  const result = scoreQuiz([1, 1, 1, 0, 2, 3, 1, 1]);
  assert.equal(result.weakness, 'recoil');
  assert.deepEqual(result.scores, { precision: 1, recoil: 5, movement: 1, decision: 1 });
  assert.equal(result.complete, true);
});

test('a tie goes to the earlier weakness, and unanswered questions are reported', () => {
  assert.equal(scoreQuiz([2, 2, 3, 3, 0, 0, 1, 1]).weakness, 'precision');
  const partial = scoreQuiz([3, null, null, null, null, null, null, null]);
  assert.equal(partial.weakness, 'decision');
  assert.equal(partial.complete, false);
  assert.equal(scoreQuiz([]).weakness, '');
});
