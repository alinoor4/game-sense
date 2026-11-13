# 05 — Phases 5, 6 and 7: tools, canvas demos, lineup maps

All the maths is already in `client/src/lib/` with tests. In these phases you only build the user interface around it. **Never re-implement a formula in a component; import it.**

---

# Phase 5 — Tools index, sensitivity converter, crosshair generator, routine generator

## Step 5.1 — `pages/ToolsPage.jsx`

Title `Tools`. `<h1>Tools</h1>`, a muted line `Try the idea right away. Everything runs in your browser.`, then a `.grid` of `<Link className="card">` for each entry of `TOOLS` (`lib/tools.js`): `<h3>` title, muted description.

Every tool page below starts with `<p><Link to="/tools">← All tools</Link></p>`, then its `<h1>`.

## Step 5.2 — `pages/SensitivityPage.jsx`

Title `Sensitivity Converter`. Imports `SENS_GAMES`, `convertSensitivity`, `edpi`, `cmPer360` from `lib/sensitivity.js`.

State (all strings for inputs, converted with `Number()` when calculating): `fromGame = 'cs2'`, `toGame = 'valorant'`, `sens = '2'`, `fromDpi = '800'`, `differentDpi = false`, `toDpi = '800'`.

Form (`.form-grid` inside a `card`); nothing is submitted, results update on every change:

- "From game" `<select>` and "To game" `<select>`, options from `SENS_GAMES` (`value` = `id`, text = `name`).
- A `btn btn-small` "Swap games" that exchanges the two selections.
- "Your sensitivity in the first game" `<input type="number" min="0" step="0.001">`
- "Mouse DPI" `<input type="number" min="1" step="50">`
- Checkbox "I use a different DPI in the second game". When ticked, show "DPI in the second game".

Results, in a second `card` with `role="status"`. Let `dpiTo = differentDpi ? Number(toDpi) : Number(fromDpi)` and `converted = convertSensitivity({ fromGame, toGame, sens: Number(sens), fromDpi: Number(fromDpi), toDpi: dpiTo })`.

- If `converted === null`: `<p className="muted">Enter positive numbers to see the result.</p>`
- Otherwise a `.demo-stats` row of stat blocks (`.stat` over `.stat-label`):
  - `{converted.toFixed(3)}` — label `Sensitivity in {to game name}`
  - `{Math.round(edpi(fromDpi, sens))}` — label `eDPI in {from game name}`
  - `{Math.round(edpi(dpiTo, converted))}` — label `eDPI in {to game name}`
  - `{cm.toFixed(1)} cm` — label `Mouse travel per 360°`, where `cm = cmPer360({ game: fromGame, sens: Number(sens), dpi: Number(fromDpi) })`
  - `{(cm / 2.54).toFixed(1)} in` — label `The same in inches`
- A `btn` "Copy sensitivity" → `navigator.clipboard.writeText(converted.toFixed(3))`.

Under the cards, a muted explanation: `eDPI only compares settings inside one game. Distance per 360° is what stays the same when you switch games.`

Check: defaults show `0.629`, eDPI `1600` and `503`, `26.0 cm`, `10.2 in`.

## Step 5.3 — `pages/CrosshairPage.jsx`

Title `Crosshair Generator`. Imports from `lib/crosshair.js` and `setupCanvas` from `lib/browser.js`.

State: `c`, initialised with `DEFAULT_CROSSHAIR`. A helper `set = (key, value) => setC((old) => ({ ...old, [key]: value }))`.

Controls (`card`, `.form-grid`):
- "Colour" `<input type="color">` bound to `c.color`
- Three sliders `<input type="range" step="1">` for `length`, `thickness`, `gap` with `min`/`max` from `CROSSHAIR_LIMITS`. Label text shows the value: `Length: 6 px`, `Thickness: 2 px`, `Gap: 3 px`.
- Checkboxes "Centre dot" (`c.dot`) and "Black outline" (`c.outline`)
- `btn btn-small` "Reset" → `setC(DEFAULT_CROSSHAIR)`

Preview: a `<canvas>` inside a `.demo` block, drawn in a `useEffect` that depends on `c`:
1. `const ctx = setupCanvas(canvas, 640, 240)`.
2. Fill the left half (0–320) with `#8a94a6` and the right half (320–640) with `#1c2530`, so the crosshair is judged on a light and a dark background.
3. Draw the crosshair twice: centred at (160, 120) and at (480, 120), each **at 4× scale** (multiply every rect value by 4) so it is easy to see.
4. For each rect from `crosshairRects(c)`: if `c.outline`, first `fillStyle = '#000'` and fill the rect grown by 1 unit on every side (before scaling); then `fillStyle = c.color` and fill the rect itself.
5. Text alternative under the canvas: `Preview at 4× size on a light and a dark background.` Give the canvas `role="img"` and `aria-label="Crosshair preview"`.

Outputs:
- `<h2>Counter-Strike 2</h2>`, a muted line `Paste into the console. The conversion from pixels is approximate, so fine-tune the size and gap in game.`, then reuse the Markdown component to get the code block with its Copy button: `<Markdown>{'```\n' + cs2Commands(c) + '\n```'}</Markdown>`.
- `<h2>Valorant</h2>`, a muted line `Enter these by hand in Settings → Crosshair.`, then a table (Setting, Value) from `valorantSettings(c)`.

## Step 5.4 — `pages/RoutinePage.jsx`

Title `Daily Routine`. Imports `generateRoutine`, `routineToText`, `WEAKNESSES`, `SKILL_LABELS`, `downloadText`, `useAuth`.

State: `minutes` (string) and `weakness`, initialised from `user?.profile.dailyMinutes ?? 145` and `user?.profile.weakness ?? ''`.

- "Minutes available today" `<input type="number" min={30} max={480} step={5}>`
- "Focus" `<select>`: `<option value="">No specific focus</option>` then one option per `WEAKNESSES` entry labelled with `SKILL_LABELS`.
- `const blocks = generateRoutine({ minutes: Number(minutes), weakness })` on every render.
- A table: Minutes, Block, Focus. If `block.link` is set, the block name is a `<Link to={block.link}>`. Last row: `Total` and the sum.
- A muted note when `Number(minutes)` is outside 30–480: `Plans are made for 30 to 480 minutes; this one was adjusted.`
- `btn` "Download (.txt)" → `downloadText('daily-routine.txt', routineToText(blocks))`.
- Logged in only: `btn btn-primary` "Save as my daily plan" → `api('PATCH', '/me/profile', { dailyMinutes: total, weakness })` where `total` is the sum of the blocks; then `setUser(data.user)` and show `Saved.`; show errors in an alert. Logged out: `<Link to="/login">Log in</Link> to save this plan to your dashboard.`

## Verify phase 5

1. `npm run check` passes.
2. Converter defaults give `0.629`; swapping games gives `6.364`; clearing the sensitivity shows the "Enter positive numbers" message, never `NaN`.
3. Crosshair: moving every slider changes the preview and the CS2 commands; the default commands include `cl_crosshairsize 2.5` and `cl_crosshairgap -2.5`; Copy works.
4. Routine: 145 minutes → 15 / 30 / 40 / 60. 60 minutes → rows add up to 60. Download gives a 4-line text file. Logged in, "Save" then open the dashboard → Today's routine uses the new total.

Commit `phase 5: converter, crosshair and routine tools`.

---

# Phase 6 — Canvas demos

Four components in `client/src/demos/`, plus a registry. Rules for all of them:

- Drawing surface: `const ctx = setupCanvas(canvasRef.current, W, H)` with `W = 640`, `H = 360` (helpers in `lib/browser.js`). Coordinates below are in these units. Convert pointer events with `canvasPoint(canvas, event, W, H)`.
- Colours: read once per effect with `cssVar('--bg')`, `--surface-2`, `--border`, `--text`, `--muted`, `--accent`, `--warn`, `--danger`.
- Animation: one `requestAnimationFrame` loop started in `useEffect`; the cleanup calls `cancelAnimationFrame`. Compute `dt` in seconds from the frame timestamps and cap it at `0.05` so a background tab does not cause a jump.
- Keep fast-changing values (positions, speed, timers) in `useRef`. Use `useState` only for what is shown as text, and update it at most when it changes.
- Every demo shows instructions above the canvas and results as text in an element with `role="status"` below it.
- Each demo component renders only its controls, canvas and results. The surrounding `.demo` box and heading come from `LessonDemo` or from the tool page.

## Step 6.1 — `demos/AimTrainer.jsx`

Two modes chosen with a `<select>` labelled "Mode": `Flick (click the targets)` and `Tracking (keep the cursor on the target)`. A round lasts **30 seconds**. Buttons: `Start` (becomes `Stop` while running). The mode select is disabled while running. Canvas style `cursor: crosshair` (add a rule under a `/* aim trainer */` comment in `styles.css`: `.aim-canvas { cursor: crosshair; }`).

Instructions text: `Click Start, then hit as many targets as you can in 30 seconds.` (flick) / `Click Start, then keep your cursor inside the moving circle.` (tracking).

**Flick mode**
- One target: a filled circle, radius 18, colour `--accent`. It spawns at a random point with `x` in 30…610 and `y` in 30…330.
- `pointerdown` on the canvas while running: if the distance from the pointer to the target centre is ≤ 18 → hit: `hits += 1`, add `(now - spawnedAt)` to `totalHitMs`, spawn a new target. Otherwise `misses += 1`.
- Text stats: `Hits: {hits}`, `Accuracy: {hits + misses ? Math.round(100 * hits / (hits + misses)) : 0}%`, `Average time per hit: {hits ? Math.round(totalHitMs / hits) : 0} ms`.

**Tracking mode**
- One target: circle radius 22. With `t` = seconds since start: `x = 320 + 220 * Math.sin(t * 1.3)`, `y = 180 + 90 * Math.sin(t * 2.1 + 1)`.
- Remember the last pointer position from `pointermove`. Each frame, if the pointer is inside the circle add `dt` to `onTarget`. Draw the circle in `--accent` while the pointer is inside, `--warn` otherwise.
- Text stat: `On target: {Math.round(100 * onTarget / elapsed)}%` (0 when `elapsed` is 0).

**Both modes**
- Each frame: clear with `--bg`; draw the target; draw the remaining seconds (`Math.ceil`) in the top-left corner in `--muted`, 16px `sans-serif`.
- When 30 seconds have passed, or Stop is pressed: stop the loop, clear the canvas, and show the final stats with the prefix `Round finished.`
- Before the first round the canvas shows the text `Press Start` centred.
- Scores are not saved anywhere.

## Step 6.2 — `demos/PeekAdvantage.jsx`

No animation; redraw when a slider changes. Imports `peekAdvantage`, `sightThresholds`, `PEEK_DEFAULTS` from `lib/peek.js`.

Controls, three `<input type="range">` with their value in the label:
- `Peeker's distance from the corner: {p} m` — min 1, max 15, step 0.5, default 2
- `Defender's distance from the corner: {d} m` — min 1, max 15, step 0.5, default 8
- `Network delay: {latency} ms` — min 0, max 150, step 5, default 40

Result text (`role="status"`), from `const r = peekAdvantage({ peekerDist: p, defenderDist: d, latencyMs: latency })`:
- `r.winner === 'defender'`: `The defender sees the peeker first, by about {r.netMs} ms.`
- `'peeker'`: `The peeker sees the defender first, by about {Math.abs(r.netMs)} ms.`
- `'even'`: `Neither side has a meaningful advantage.`
- Second line, muted: `Geometry alone gives {Math.abs(r.geoMs)} ms to the {r.geoMs >= 0 ? 'defender' : 'peeker'}. Network delay gives {latency} ms to the peeker.`
- Third line, muted: `Simplified top-down model: both players are 0.8 m wide and the peeker strafes at 5 m/s.`

Canvas (top-down view), scale `S = 11` pixels per metre, corner point at `(320, 180)`:
1. Clear with `--bg`.
2. Wall: filled rectangle from `x = 0` to `x = 320`, `y = 174` to `y = 186`, colour `--border`. Label `wall` in `--muted` at (20, 168).
3. Defender: circle centre `(320 - 1 * S, 180 - d * S)`, radius `Math.max(4, PEEK_DEFAULTS.shoulder * S)`. Label `Defender` to its right.
4. Peeker: let `t = sightThresholds({ peekerDist: p, defenderDist: d, defenderOffset: 1 })` and `px = Math.max(t.defenderSeesAt, t.peekerSeesAt)` (the moment both can see each other). Circle centre `(320 + px * S, 180 + p * S)`, same radius. Label `Peeker` to its right.
5. Colour the winner's circle `--accent` and the other `--warn`; both `--muted` when even.
6. A thin `--muted` line between the two centres (the line of sight), and a small arrow or the text `strafes →` next to the peeker.

Canvas `role="img"` with `aria-label="Top-down diagram of a peeker and a defender around a corner"`.

## Step 6.3 — `demos/CounterStrafe.jsx`

The player strafes a dot left and right and tries to shoot only after stopping.

Markup, top to bottom:
- Instructions: `Click the box, then hold A or D to strafe. To stop fast, tap the opposite key, then press Space to shoot. Shoot inside the green zone.`
- A wrapper `<div tabIndex={0} role="group" aria-label="Counter-strafe practice area">` that owns the keyboard: `onKeyDown` / `onKeyUp` read `event.code` (`KeyA`, `KeyD`, `Space`). Call `event.preventDefault()` for `Space` so the page does not scroll. Ignore `event.repeat` for `Space`. On `onBlur`, release both keys.
- Inside the wrapper: the canvas, then a `.row` with two keycaps `<kbd className={aDown ? 'pressed' : undefined}>A</kbd>` and the same for D (this is the keybind overlay), then three buttons for mouse and touch users: `◀ Strafe left` and `Strafe right ▶` (press = `onPointerDown`, release = `onPointerUp` and `onPointerLeave`) and `Shoot`.
- Result text (`role="status"`) and `Clean counter-strafes in a row: {streak}`.

Physics, each frame, with `v` = speed as a fraction of full speed (−1…1) and `x` = position:

```
const ACCEL = 1 / 0.12;     // reaches full speed in 0.12 s
const FRICTION = 1 / 0.25;  // coasts to a stop in 0.25 s
const input = (dDown ? 1 : 0) - (aDown ? 1 : 0);
if (input !== 0) {
  const opposing = v !== 0 && Math.sign(v) !== input;
  v += input * (ACCEL + (opposing ? FRICTION : 0)) * dt;   // the opposite key stops you faster than friction alone
} else if (v !== 0) {
  const next = v - Math.sign(v) * FRICTION * dt;
  v = Math.sign(next) === Math.sign(v) ? next : 0;          // friction never reverses direction
}
v = Math.max(-1, Math.min(1, v));
x += v * 260 * dt;
if (x < 40) { x = 40; v = 0; }
if (x > 600) { x = 600; v = 0; }
if (Math.abs(v) >= 0.9) lastFastAt = now;
```

Shooting (Space, the Shoot button, or `pointerdown` on the canvas), with `speed = Math.abs(v)`, accurate when `speed <= 0.34`:
- accurate **and** `now - lastFastAt <= 400` → message `Clean counter-strafe: shot at {pct}% speed.`, `streak += 1`
- accurate but not recently fast → message `Accurate, but you were already standing still. Strafe first, then stop.` (streak unchanged)
- not accurate → message `Too early: you were still moving at {pct}% speed.`, `streak = 0`
- `pct = Math.round(speed * 100)`

Drawing each frame:
1. Clear with `--bg`. A ground line at `y = 250` in `--border`.
2. The player: circle radius 16 at `(x, 232)`, `--accent` when `speed <= 0.34`, otherwise `--warn`.
3. Speed bar at the top: outline rectangle `x = 120…520`, `y = 30…50`. Fill the part `120…(120 + 400 * 0.34)` faintly with `--accent` at `globalAlpha = 0.25` (the green zone). Fill `120…(120 + 400 * speed)` with `--accent` if accurate, else `--danger`. Label `speed` in `--muted` to the left.
4. For 150 ms after a shot, draw a short vertical line above the player in `--text` (the shot).

## Step 6.4 — `demos/CrosshairCompare.jsx`

An illustration that loops every 4 seconds: two panels show where a crosshair rests before an enemy appears and how far it must travel afterwards.

Geometry (per panel, panel width 320; the right panel is the left one shifted by `ox = 320`):
- Wall block: rectangle `x = 0…150`, `y = 60…300`, colour `--surface-2`.
- Floor: line at `y = 300`, colour `--border`.
- Head-height guide: dashed line at `y = 140` from `x = 150` to `x = 320`, colour `--border`.
- Enemy head: circle radius 10 at `(175, 140)`, colour `--danger`. Visible only when `t >= 2`.
- Panel titles at `(12, 28)` in `--text`: `Typical habit` (left) and `Trained habit` (right). A vertical divider at `x = 320`.

Crosshair position as a pure function of `t` (seconds within the loop, 0…4). Write these two functions at the top of the file:

```js
const TARGET = { x: 175, y: 140 };
const lerp = (a, b, k) => a + (b - a) * Math.min(1, Math.max(0, k));

// rests low and near the wall, reacts late, travels far
function typicalPath(t) {
  const rest = { x: 90 + 60 * Math.sin(Math.min(t, 2.25) * 2), y: 250 + 15 * Math.sin(Math.min(t, 2.25) * 3) };
  const k = (t - 2.25) / 0.35;
  return { x: lerp(rest.x, TARGET.x, k), y: lerp(rest.y, TARGET.y, k) };
}

// rests at head height just outside the corner, needs a tiny correction
function trainedPath(t) {
  const rest = { x: 172 + 2 * Math.sin(Math.min(t, 2.25) * 2), y: 141 };
  const k = (t - 2.25) / 0.08;
  return { x: lerp(rest.x, TARGET.x, k), y: lerp(rest.y, TARGET.y, k) };
}
```

Each frame: draw both panels; for each panel draw the last 40 crosshair positions as a fading trail (small dots, `--muted`) and the current position as a plus sign (two lines of length 14) in `--accent`.

Text under the canvas (`role="status"`, static, computed once from the functions above):
- `Typical habit: the crosshair travels about {n} px and is on target 0.60 s after the enemy appears.` where `n` = rounded distance between `typicalPath(2.25)` and `TARGET`.
- `Trained habit: about {m} px, on target after 0.33 s.` where `m` = rounded distance between `trainedPath(2.25)` and `TARGET`.
- Muted: `Illustration of the principle, not recorded match data.`

Motion preference: read `window.matchMedia('(prefers-reduced-motion: reduce)').matches` once. If true, start paused. Provide one button that toggles `Pause` / `Play`. While paused, draw the frame for `t = 2.6`.

## Step 6.5 — `demos/LessonDemo.jsx` and wiring

```jsx
import { DEMO_LABELS } from '../lib/constants.js';
import AimTrainer from './AimTrainer.jsx';
import PeekAdvantage from './PeekAdvantage.jsx';
import CounterStrafe from './CounterStrafe.jsx';
import CrosshairCompare from './CrosshairCompare.jsx';

const DEMO_COMPONENTS = {
  'aim-trainer': AimTrainer,
  'peek-advantage': PeekAdvantage,
  'counter-strafe': CounterStrafe,
  'crosshair-compare': CrosshairCompare,
};

// Renders the interactive demo a lesson asks for. Unknown or empty names render nothing.
export default function LessonDemo({ name }) {
  const Demo = DEMO_COMPONENTS[name];
  if (!Demo) return null;
  return (
    <section className="demo" aria-label={DEMO_LABELS[name]}>
      <h2>Try it: {DEMO_LABELS[name]}</h2>
      <Demo />
    </section>
  );
}
```

Then:
1. In `pages/LessonPage.jsx`, directly after `<Markdown>{lesson.body}</Markdown>`, add `<LessonDemo key={lesson.id} name={lesson.demo} />` (the `key` resets the demo when the lesson changes).
2. Create `pages/AimTrainerPage.jsx`: title `Aim Trainer`, back link, `<h1>Aim Trainer</h1>`, a muted line `A warm-up, not a replacement for a full aim trainer. Use it before your first match.`, then `<section className="demo"><AimTrainer /></section>`.

## Verify phase 6

1. `npm run check` passes with **no** `react-hooks/exhaustive-deps` warnings.
2. `/tools/aim-trainer`: flick mode counts hits and misses and ends after 30 s with final stats; tracking mode shows a percentage that rises while the cursor is on the target. Leaving the page mid-round causes no console errors.
3. Lesson "Angle Advantage and Peeker's Advantage": with peeker 2 m, defender 8 m, delay 40 ms the text says the defender sees first by about 20 ms; drag the peeker to 8 m → the peeker wins by about 40 ms; the circle colours follow.
4. Lesson "Counter-Strafing": holding D moves the dot and lights the D keycap; releasing and pressing Space immediately gives "Too early"; tapping A then Space gives "Clean counter-strafe" and the streak grows. Space does not scroll the page while the box is focused.
5. Lesson "Crosshair Placement": the animation loops, Pause/Play works, the two text lines show a large and a small pixel distance.
6. Lesson "Flicking vs Tracking" shows the aim trainer inside the lesson.
7. Switching between two lessons that both have demos shows the correct demo each time.

Commit `phase 6: canvas demos`.

---

# Phase 7 — Lineup maps

## Step 7.1 — `components/MapStage.jsx`

One component draws a map with its callouts and lineups. The viewer (this phase) and the admin editor (phase 8) both use it. Positions are fractions 0–1 (see `01-spec.md` 4.4); turn them into CSS with `` `${value * 100}%` ``.

Props:

| Prop | Meaning |
|------|---------|
| `map` | `{ name, imageUrl, callouts, lineups }` |
| `selectedId` | id of the selected lineup, or `null` |
| `onSelect(id)` | called when a landing marker is activated |
| `showCallouts` | boolean, default `true` |
| `kind` | `''` for all, or one of `LINEUP_KINDS`: only lineups of that kind are drawn |
| `onStageClick({ x, y })` | optional. When given, the stage gets the extra class `editing` and reports clicks on the image |

Lineups and callouts created in the admin editor before saving have no `id` yet. Use `item.id ?? item.key` everywhere an identifier is needed (the editor supplies `key`).

Render:

```
<div className={onStageClick ? 'map-stage editing' : 'map-stage'} onClick={handleStageClick}>
  <img src={map.imageUrl} alt={`Map of ${map.name}`} />
  <svg className="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    (only for the selected lineup) <line x1={from.x*100} y1={from.y*100} x2={to.x*100} y2={to.y*100}
       stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 1.5" />
  </svg>
  (if showCallouts) for each callout: <span className="map-callout" style={{ left, top }}>{name}</span>
  for each visible lineup: <button type="button" className={selected ? 'map-marker selected' : 'map-marker'}
       style={{ left: to.x, top: to.y }} aria-label={`${title} (${kind})`} aria-pressed={selected}
       onClick={(e) => { e.stopPropagation(); onSelect(id); }} />
  (for the selected lineup) <span className="map-marker from" style={{ left: from.x, top: from.y }} aria-hidden="true" />
</div>
```

`handleStageClick(event)`: do nothing unless `onStageClick` is given. Otherwise take `event.currentTarget.getBoundingClientRect()`, compute `x = (clientX - left) / width`, `y = (clientY - top) / height`, clamp both to 0…1, round to 3 decimals, call `onStageClick({ x, y })`.

Give the svg `style={{ color: 'var(--accent)' }}` so `currentColor` is the accent.

## Step 7.2 — `pages/LineupsPage.jsx`

Title `Lineup Maps`. Back link, `<h1>Lineup Maps</h1>`, muted line `Click a marker to see where to stand, where it lands and how to throw it.` From the catalog: for each game that has at least one map, `<h2>{game.name}</h2>` and a `.grid` of `<Link className="card" to={`/tools/lineups/${map.slug}`}><h3>{map.name}</h3></Link>`. If there are no maps at all: `No maps yet.`

## Step 7.3 — `pages/LineupMapPage.jsx`

`const { mapSlug } = useParams()`, `useApi(`/maps/${mapSlug}`)`; 404 → `<NotFoundPage />`. Title: the map name.

State: `selectedId` (`null`), `showCallouts` (`true`), `kind` (`''`).

Layout inside `container stack`:
1. `<p><Link to="/tools/lineups">← All maps</Link></p>`, `<h1>{map.name}</h1>`.
2. Controls `.row`: checkbox "Show callouts"; `<select>` labelled "Show" with `All lineups` plus one option per `LINEUP_KINDS` (capitalised). Changing the filter clears the selection.
3. `<MapStage map={map} selectedId={selectedId} onSelect={setSelectedId} showCallouts={showCallouts} kind={kind} />`
4. Legend, muted: `Round marker: where it lands. Square marker: where you stand.`
5. Details `card` with `role="status"`: if a lineup is selected → `<h2>{title}</h2>`, `<span className="badge">{kind}</span>`, `<Markdown>{steps}</Markdown>`; else `Select a marker on the map, or pick a lineup from the list below.`
6. `<h2>All lineups</h2>`: a list of `btn` buttons, one per lineup that passes the filter, text = title, `aria-pressed` when selected, `onClick` selects it. This list is how keyboard and screen-reader users reach every lineup.
7. Muted note: `Positions are approximate. Always test a lineup in a private match first.`

## Verify phase 7

1. `npm run check` passes.
2. `/tools/lineups` lists "Training Yard" under "FPS Fundamentals"; the FPS Fundamentals track page links to the lineups.
3. The map shows 8 callout labels and 4 round markers. Clicking a marker draws a dashed line to a square marker and shows the title, kind and numbered steps.
4. Filtering by "Smoke" leaves 2 markers; unticking "Show callouts" hides the labels.
5. Tab reaches every marker and every button in the list; Enter selects.
6. `/tools/lineups/nope` shows "Page not found".

Commit `phase 7: lineup maps`.
