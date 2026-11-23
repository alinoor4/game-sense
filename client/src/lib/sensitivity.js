// yaw = degrees the view turns per mouse count at sensitivity 1.
// shortcut: static table; move to the database when admins need to add converter games without a code change.
export const SENS_GAMES = [
  { id: 'cs2', name: 'Counter-Strike 2', yaw: 0.022 },
  { id: 'valorant', name: 'Valorant', yaw: 0.07 },
  { id: 'apex', name: 'Apex Legends', yaw: 0.022 },
  { id: 'overwatch2', name: 'Overwatch 2', yaw: 0.0066 },
  { id: 'cod', name: 'Call of Duty (MW / Warzone)', yaw: 0.0066 },
  { id: 'fortnite', name: 'Fortnite', yaw: 0.005555 },
  { id: 'r6', name: 'Rainbow Six Siege', yaw: 0.00572957795 },
];

const yawOf = (id) => {
  const game = SENS_GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Unknown game: ${id}`);
  return game.yaw;
};

const isPositive = (n) => typeof n === 'number' && Number.isFinite(n) && n > 0;

// Sensitivity in the target game that gives the same physical mouse distance per turn.
export function convertSensitivity({ fromGame, toGame, sens, fromDpi, toDpi = fromDpi }) {
  if (![sens, fromDpi, toDpi].every(isPositive)) return null;
  return (sens * yawOf(fromGame) * fromDpi) / (yawOf(toGame) * toDpi);
}

export function edpi(dpi, sens) {
  return isPositive(dpi) && isPositive(sens) ? dpi * sens : null;
}

// Centimetres of mouse travel for one full 360 degree turn.
export function cmPer360({ game, sens, dpi }) {
  if (![sens, dpi].every(isPositive)) return null;
  return (360 / (dpi * sens * yawOf(game))) * 2.54;
}
