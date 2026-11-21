import { useEffect, useRef, useState } from 'react';
import { canvasPoint, cssVar, setupCanvas } from '../lib/browser.js';
import { ROUND_SECONDS, FLICK_RADIUS, TRACK_RADIUS, spawnTarget, trackingTarget, isInside, accuracy, averageHitMs, onTargetPercent } from '../lib/aim.js';
import Field from '../components/Field.jsx';

const W = 640;
const H = 360;
const INSTRUCTIONS = {
  flick: 'Click Start, then hit as many targets as you can in 30 seconds.',
  tracking: 'Click Start, then keep your cursor inside the moving circle.',
};
const NO_SCORE = { hits: 0, misses: 0, totalHitMs: 0, onTarget: 0 };

export default function AimTrainer() {
  const [mode, setMode] = useState('flick');
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  // Only what the results line shows; the round itself changes every frame and lives in `round`.
  const [score, setScore] = useState(NO_SCORE);
  const canvasRef = useRef(null);
  const round = useRef(null);

  useEffect(() => {
    const ctx = setupCanvas(canvasRef.current, W, H);
    const bg = cssVar('--bg');
    const accent = cssVar('--accent');
    const warn = cssVar('--warn');
    const muted = cssVar('--muted');
    ctx.font = '16px sans-serif';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    if (!running) {
      if (!finished) {
        ctx.fillStyle = muted;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Press Start', W / 2, H / 2);
      }
      return undefined;
    }

    const r = round.current;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    let frame;
    let last = null;
    let shownOnTarget = 0;
    const tick = (now) => {
      const gap = last === null ? 0 : now - last;
      last = now;
      const dt = Math.min(0.05, gap / 1000);
      // Time the cap drops (a background tab) is not part of the round, so it is not part of the time to a hit either.
      r.spawnedAt += Math.max(0, gap - 50);
      r.elapsed = Math.min(ROUND_SECONDS, r.elapsed + dt);
      if (mode === 'tracking') {
        r.target = trackingTarget(r.elapsed);
        r.inside = r.pointer !== null && isInside(r.pointer, r.target, TRACK_RADIUS);
        if (r.inside) r.onTarget += dt;
        const percent = onTargetPercent(r.onTarget, r.elapsed);
        if (percent !== shownOnTarget) {
          shownOnTarget = percent;
          setScore({ ...NO_SCORE, onTarget: percent });
        }
      }
      if (r.elapsed >= ROUND_SECONDS) {
        setRunning(false);
        setFinished(true);
        return;
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = mode === 'flick' || r.inside ? accent : warn;
      ctx.beginPath();
      ctx.arc(r.target.x, r.target.y, mode === 'flick' ? FLICK_RADIUS : TRACK_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = muted;
      ctx.fillText(String(Math.ceil(ROUND_SECONDS - r.elapsed)), 12, 12);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, finished, mode]);

  function start() {
    round.current = { elapsed: 0, target: spawnTarget(), spawnedAt: performance.now(), pointer: null, inside: false, onTarget: 0, hits: 0, misses: 0, totalHitMs: 0 };
    setScore(NO_SCORE);
    setFinished(false);
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    setFinished(true);
  }

  function pointerDown(event) {
    if (!running || event.button !== 0) return;
    const r = round.current;
    const point = canvasPoint(canvasRef.current, event, W, H);
    if (mode === 'tracking') {
      r.pointer = point;
      return;
    }
    const now = performance.now();
    if (isInside(point, r.target, FLICK_RADIUS)) {
      r.hits += 1;
      r.totalHitMs += now - r.spawnedAt;
      r.target = spawnTarget();
      r.spawnedAt = now;
    } else {
      r.misses += 1;
    }
    setScore({ ...NO_SCORE, hits: r.hits, misses: r.misses, totalHitMs: r.totalHitMs });
  }

  function pointerMove(event) {
    if (running && mode === 'tracking') round.current.pointer = canvasPoint(canvasRef.current, event, W, H);
  }

  // A cursor that left the canvas is not on the target, wherever it last was.
  function pointerLeave() {
    if (round.current) round.current.pointer = null;
  }

  return (
    <div className="stack">
      <div className="row demo-controls">
        <Field label="Mode">
          <select
            value={mode}
            disabled={running}
            onChange={(e) => {
              setMode(e.target.value);
              setFinished(false);
              setScore(NO_SCORE);
            }}
          >
            <option value="flick">Flick (click the targets)</option>
            <option value="tracking">Tracking (keep the cursor on the target)</option>
          </select>
        </Field>
        <button type="button" className="btn btn-primary" onClick={running ? stop : start}>
          {running ? 'Stop' : 'Start'}
        </button>
      </div>
      <p>{INSTRUCTIONS[mode]}</p>
      <canvas ref={canvasRef} className="aim-canvas" width={W} height={H} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerLeave={pointerLeave} />
      <div className="demo-stats" role="status">
        {finished && <strong>Round finished.</strong>}
        {mode === 'flick' ? (
          <>
            <span>Hits: {score.hits}</span>
            <span>Accuracy: {accuracy(score.hits, score.misses)}%</span>
            <span>Average time per hit: {averageHitMs(score.totalHitMs, score.hits)} ms</span>
          </>
        ) : (
          <span>On target: {score.onTarget}%</span>
        )}
      </div>
    </div>
  );
}
