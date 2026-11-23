import { useEffect, useRef, useState } from 'react';
import { cssVar, setupCanvas } from '../lib/browser.js';
import { TARGET, ENEMY_AT, typicalPath, trainedPath, travelPx } from '../lib/placement.js';

const W = 640;
const H = 360;
const LOOP = 4; // seconds
const PAUSED_AT = 2.6; // both crosshairs are on the head, with the way they came still visible
const TRAIL = 40;
const FRAME = 1 / 60;
const PANELS = [
  { ox: 0, title: 'Typical habit', path: typicalPath },
  { ox: 320, title: 'Trained habit', path: trainedPath },
];
const TYPICAL_PX = travelPx(typicalPath);
const TRAINED_PX = travelPx(trainedPath);

export default function CrosshairCompare() {
  // Read once: with reduced motion the demo starts paused.
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const canvasRef = useRef(null);
  const time = useRef(0);

  useEffect(() => {
    const ctx = setupCanvas(canvasRef.current, W, H);
    const bg = cssVar('--bg');
    const surface2 = cssVar('--surface-2');
    const border = cssVar('--border');
    const text = cssVar('--text');
    const muted = cssVar('--muted');
    const accent = cssVar('--accent');
    const danger = cssVar('--danger');
    ctx.font = '16px sans-serif';

    function draw(t) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      for (const { ox, title, path } of PANELS) {
        ctx.fillStyle = surface2;
        ctx.fillRect(ox, 60, 150, 240);
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ox, 300);
        ctx.lineTo(ox + 320, 300);
        ctx.stroke();
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(ox + 150, 140);
        ctx.lineTo(ox + 320, 140);
        ctx.stroke();
        ctx.setLineDash([]);
        if (t >= ENEMY_AT) {
          ctx.fillStyle = danger;
          ctx.beginPath();
          ctx.arc(ox + TARGET.x, TARGET.y, 10, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.fillStyle = text;
        ctx.fillText(title, ox + 12, 28);

        // The trail: the 40 positions before this one (one per frame at 60 fps), oldest faintest.
        ctx.fillStyle = muted;
        for (let k = TRAIL; k >= 1; k -= 1) {
          if (t - k * FRAME < 0) continue;
          const at = path(t - k * FRAME);
          ctx.globalAlpha = 1 - k / (TRAIL + 1);
          ctx.beginPath();
          ctx.arc(ox + at.x, at.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        const at = path(t);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox + at.x - 7, at.y);
        ctx.lineTo(ox + at.x + 7, at.y);
        ctx.moveTo(ox + at.x, at.y - 7);
        ctx.lineTo(ox + at.x, at.y + 7);
        ctx.stroke();
      }
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(320, 0);
      ctx.lineTo(320, H);
      ctx.stroke();
    }

    if (paused) {
      // Play continues from the frame on screen.
      time.current = PAUSED_AT;
      draw(PAUSED_AT);
      return undefined;
    }
    let frame;
    let last = null;
    const tick = (now) => {
      const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      time.current = (time.current + dt) % LOOP;
      draw(time.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  return (
    <div className="stack">
      <p>Watch where each crosshair rests before the enemy appears, and how far it has to travel afterwards.</p>
      <canvas ref={canvasRef} width={W} height={H} role="img" aria-label="Animation: a typical and a trained crosshair moving to an enemy's head as it appears at a corner" />
      <p>
        <button type="button" className="btn btn-small" onClick={() => setPaused((was) => !was)}>
          {paused ? 'Play' : 'Pause'}
        </button>
      </p>
      <div role="status">
        <p>Typical habit: the crosshair travels about {TYPICAL_PX} px and is on target 0.60 s after the enemy appears.</p>
        <p>Trained habit: about {TRAINED_PX} px, on target after 0.33 s.</p>
        <p className="muted">Illustration of the principle, not recorded match data.</p>
      </div>
    </div>
  );
}
