// This file exists twice with identical content: server/src/constants.js and client/src/lib/constants.js. Change both.
export const GENRES = ['fps', 'fighting'];

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

// The four skills the quiz can diagnose.
export const WEAKNESSES = ['precision', 'recoil', 'movement', 'decision'];

// Every skill a lesson can be tagged with.
export const SKILLS = [...WEAKNESSES, 'setup', 'mental'];

export const SKILL_LABELS = {
  precision: 'Raw precision',
  recoil: 'Recoil control',
  movement: 'Movement sync',
  decision: 'Decision-making under pressure',
  setup: 'Hardware and setup',
  mental: 'Mental game and review',
};

// Interactive demo a lesson can embed. '' means none.
export const DEMOS = ['aim-trainer', 'peek-advantage', 'counter-strafe', 'crosshair-compare'];

export const DEMO_LABELS = {
  'aim-trainer': 'Aim trainer',
  'peek-advantage': 'Peek advantage model',
  'counter-strafe': 'Counter-strafe timing',
  'crosshair-compare': 'Crosshair path comparison',
};

export const LINEUP_KINDS = ['smoke', 'flash', 'molotov', 'grenade', 'ability'];

export const DRILL_TOOLS = ['Aimlabs', "KovaaK's", 'In-game', 'Game Sense'];

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
