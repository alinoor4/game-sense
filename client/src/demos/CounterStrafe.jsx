import { useEffect, useRef, useState } from 'react';
import { cssVar, setupCanvas } from '../lib/browser.js';
import { ACCURATE_SPEED, STANDING, strafeStep, judgeShot } from '../lib/strafe.js';

const W = 640;
const H = 360;
const SHOT_MS = 150;

export default function CounterStrafe() {
  const [aDown, setADown] = useState(false);
  const [dDown, setDDown] = useState(false);
  const [message, setMessage] = useState('');
  const [streak, setStreak] = useState(0);
  const canvasRef = useRef(null);
  // The animation loop reads these every frame; the two states above only light up the keycaps.
  const keys = useRef({ a: false, d: false });
  const player = useRef(STANDING);
  const shotAt = useRef(-Infinity);

  useEffect(() => {
    const ctx = setupCanvas(canvasRef.current, W, H);
    const bg = cssVar('--bg');
    const border = cssVar('--border');
    const text = cssVar('--text');
    const muted = cssVar('--muted');
    const accent = cssVar('--accent');
    const warn = cssVar('--warn');
    const danger = cssVar('--danger');
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    let frame;
    let last = null;
    const tick = (now) => {
      const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      player.current = strafeStep(player.current, (keys.current.d ? 1 : 0) - (keys.current.a ? 1 : 0), dt, now);
      const { x, v } = player.current;
      const speed = Math.abs(v);
      const accurate = speed <= ACCURATE_SPEED;

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 250);
      ctx.lineTo(W, 250);
      ctx.stroke();

      ctx.fillStyle = accurate ? accent : warn;
      ctx.beginPath();
      ctx.arc(x, 232, 16, 0, 2 * Math.PI);
      ctx.fill();

      // speed bar: the green zone, the current speed over it, then the outline
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = accent;
      ctx.fillRect(120, 30, 400 * ACCURATE_SPEED, 20);
      ctx.globalAlpha = 1;
      ctx.fillStyle = accurate ? accent : danger;
      ctx.fillRect(120, 30, 400 * speed, 20);
      ctx.lineWidth = 1;
      ctx.strokeRect(120, 30, 400, 20);
      ctx.fillStyle = muted;
      ctx.fillText('speed', 110, 40);

      if (now - shotAt.current < SHOT_MS) {
        ctx.strokeStyle = text;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 208);
        ctx.lineTo(x, 180);
        ctx.stroke();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  function press(key, down) {
    keys.current[key] = down;
    (key === 'a' ? setADown : setDDown)(down);
  }

  function shoot() {
    const now = performance.now();
    const pct = Math.round(Math.abs(player.current.v) * 100);
    const result = judgeShot(player.current, now);
    shotAt.current = now;
    if (result === 'clean') {
      setMessage(`Clean counter-strafe: shot at ${pct}% speed.`);
      setStreak((n) => n + 1);
    } else if (result === 'still') {
      setMessage('Accurate, but you were already standing still. Strafe first, then stop.');
    } else {
      setMessage(`Too early: you were still moving at ${pct}% speed.`);
      setStreak(0);
    }
  }

  function keyDown(event) {
    if (event.code === 'Space') {
      event.preventDefault();
      if (!event.repeat) shoot();
    } else if (event.code === 'KeyA') {
      press('a', true);
    } else if (event.code === 'KeyD') {
      press('d', true);
    }
  }

  function keyUp(event) {
    if (event.code === 'KeyA') press('a', false);
    else if (event.code === 'KeyD') press('d', false);
  }

  // Focus moving to a button inside the box keeps the keys held; leaving the box releases them.
  function blur(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    press('a', false);
    press('d', false);
  }

  // Mouse and touch: the button is held like the key.
  const hold = (key) => ({
    onPointerDown: (event) => event.button === 0 && press(key, true),
    onPointerUp: () => press(key, false),
    onPointerLeave: () => press(key, false),
  });

  return (
    <div className="stack">
      <p>Click the box, then hold A or D to strafe. To stop fast, tap the opposite key, then press Space to shoot. Shoot inside the green zone.</p>
      <div className="strafe-area stack" tabIndex={0} role="group" aria-label="Counter-strafe practice area" onKeyDown={keyDown} onKeyUp={keyUp} onBlur={blur}>
        <canvas ref={canvasRef} width={W} height={H} onPointerDown={(event) => event.button === 0 && shoot()} />
        <div className="row">
          <kbd className={aDown ? 'pressed' : undefined} aria-hidden="true">
            A
          </kbd>
          <kbd className={dDown ? 'pressed' : undefined} aria-hidden="true">
            D
          </kbd>
          <button type="button" className="btn" {...hold('a')}>
            ◀ Strafe left
          </button>
          <button type="button" className="btn" {...hold('d')}>
            Strafe right ▶
          </button>
          <button type="button" className="btn" onClick={shoot}>
            Shoot
          </button>
        </div>
      </div>
      <div role="status">
        {message && <p>{message}</p>}
        <p>Clean counter-strafes in a row: {streak}</p>
      </div>
    </div>
  );
}
