// Counter-strafe model. v is speed as a fraction of full speed, -1 (full speed left) to 1 (right);
// x is the position in canvas units; lastFastAt is when v was last at 90% of full speed or more (ms).

const ACCEL = 1 / 0.12; // reaches full speed in 0.12 s
const FRICTION = 1 / 0.25; // coasts to a stop in 0.25 s
export const ACCURATE_SPEED = 0.34; // shots at or below this fraction of full speed are accurate

export const STANDING = { v: 0, x: 320, lastFastAt: -Infinity };

// One frame. input: 1 while only D is held, -1 while only A is held, else 0. dt in seconds, now in ms.
export function strafeStep({ v, x, lastFastAt }, input, dt, now) {
  if (input !== 0) {
    const opposing = v !== 0 && Math.sign(v) !== input;
    v += input * (ACCEL + (opposing ? FRICTION : 0)) * dt; // the opposite key stops you faster than friction alone
  } else if (v !== 0) {
    const next = v - Math.sign(v) * FRICTION * dt;
    v = Math.sign(next) === Math.sign(v) ? next : 0; // friction never reverses direction
  }
  v = Math.max(-1, Math.min(1, v));
  x += v * 260 * dt;
  if (x < 40) {
    x = 40;
    v = 0;
  }
  if (x > 600) {
    x = 600;
    v = 0;
  }
  if (Math.abs(v) >= 0.9) lastFastAt = now;
  return { v, x, lastFastAt };
}

// 'clean': accurate within 400 ms of moving fast. 'still': accurate, but there was nothing to stop. 'early': still moving too fast.
export function judgeShot({ v, lastFastAt }, now) {
  if (Math.abs(v) > ACCURATE_SPEED) return 'early';
  return now - lastFastAt <= 400 ? 'clean' : 'still';
}
