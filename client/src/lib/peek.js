// Peek advantage model (top-down, simplified).
//
// A wall ends at a corner. The defender holds the angle on one side, the peeker strafes out on the other.
// Each player is a circle of radius `shoulder`; their eyes are at the centre. Whoever is FARTHER from the
// corner sees the other's shoulder before their own eyes are exposed. Network latency helps the peeker,
// because the defender sees the peek late.
//
// Distances are measured at right angles to the wall, in metres.
//
// geoMetres = shoulder * (1 - peekerDist / defenderDist)
//   > 0: the defender sees the peeker first; the peeker walks this far before seeing the defender.
//   < 0: the peeker sees the defender first.

export const PEEK_DEFAULTS = { shoulder: 0.4, speed: 5 };

export function peekAdvantage({ peekerDist, defenderDist, latencyMs = 0, shoulder = PEEK_DEFAULTS.shoulder, speed = PEEK_DEFAULTS.speed }) {
  if (!(peekerDist > 0) || !(defenderDist > 0) || !(speed > 0)) return null;
  const geoMetres = shoulder * (1 - peekerDist / defenderDist);
  const geoMs = (geoMetres / speed) * 1000;
  // positive = defender advantage, negative = peeker advantage
  const netMs = Math.round(geoMs - latencyMs);
  const winner = netMs > 5 ? 'defender' : netMs < -5 ? 'peeker' : 'even';
  return { geoMs: Math.round(geoMs), netMs, winner };
}

// For drawing. The corner is at x = 0; the wall covers x < 0. The defender stands `defenderOffset` metres
// behind the wall edge (x = -defenderOffset). Returns the peeker's x position at the two key moments:
//   defenderSeesAt: the defender's eye first sees the peeker's leading shoulder
//   peekerSeesAt:   the peeker's eye first sees the defender's shoulder
export function sightThresholds({ peekerDist, defenderDist, defenderOffset = 1, shoulder = PEEK_DEFAULTS.shoulder }) {
  const ratio = peekerDist / defenderDist;
  return {
    defenderSeesAt: defenderOffset * ratio - shoulder,
    peekerSeesAt: (defenderOffset - shoulder) * ratio,
  };
}
