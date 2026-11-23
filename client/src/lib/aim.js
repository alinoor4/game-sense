// Aim trainer rules, in canvas units (640 x 360).

export const ROUND_SECONDS = 30;
export const FLICK_RADIUS = 18;
export const TRACK_RADIUS = 22;

// A flick target appears where it fits on the canvas: x 30-610, y 30-330.
export const spawnTarget = (random = Math.random) => ({ x: 30 + 580 * random(), y: 30 + 300 * random() });

// Where the tracking target is, t seconds into the round.
export const trackingTarget = (t) => ({ x: 320 + 220 * Math.sin(t * 1.3), y: 180 + 90 * Math.sin(t * 2.1 + 1) });

export const isInside = (point, centre, radius) => Math.hypot(point.x - centre.x, point.y - centre.y) <= radius;

// The results, as whole numbers. Each is 0 until there is something to count.
export const accuracy = (hits, misses) => (hits + misses ? Math.round((100 * hits) / (hits + misses)) : 0);
export const averageHitMs = (totalHitMs, hits) => (hits ? Math.round(totalHitMs / hits) : 0);
export const onTargetPercent = (onTarget, elapsed) => (elapsed ? Math.round((100 * onTarget) / elapsed) : 0);
