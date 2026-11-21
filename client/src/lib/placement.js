// Crosshair placement comparison, per 320 x 360 panel: the enemy's head appears at TARGET when the 4-second loop reaches ENEMY_AT.

export const TARGET = { x: 175, y: 140 };
export const ENEMY_AT = 2;
const lerp = (a, b, k) => a + (b - a) * Math.min(1, Math.max(0, k));

// rests low and near the wall, reacts late, travels far
export function typicalPath(t) {
  const rest = { x: 90 + 60 * Math.sin(Math.min(t, 2.25) * 2), y: 250 + 15 * Math.sin(Math.min(t, 2.25) * 3) };
  const k = (t - 2.25) / 0.35;
  return { x: lerp(rest.x, TARGET.x, k), y: lerp(rest.y, TARGET.y, k) };
}

// rests at head height just outside the corner, needs a tiny correction
export function trainedPath(t) {
  const rest = { x: 172 + 2 * Math.sin(Math.min(t, 2.25) * 2), y: 141 };
  const k = (t - 2.25) / 0.08;
  return { x: lerp(rest.x, TARGET.x, k), y: lerp(rest.y, TARGET.y, k) };
}

// Pixels from where the crosshair is when it starts to move (2.25 s) to the head.
export function travelPx(path) {
  const start = path(2.25);
  return Math.round(Math.hypot(TARGET.x - start.x, TARGET.y - start.y));
}
