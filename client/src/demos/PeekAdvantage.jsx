import { useEffect, useRef, useState } from 'react';
import { cssVar, setupCanvas } from '../lib/browser.js';
import { PEEK_DEFAULTS, peekAdvantage, sightThresholds } from '../lib/peek.js';
import Field from '../components/Field.jsx';

const W = 640;
const H = 360;
const S = 11; // pixels per metre
const CORNER = { x: 320, y: 180 };

export default function PeekAdvantage() {
  const [p, setP] = useState(2);
  const [d, setD] = useState(8);
  const [latency, setLatency] = useState(40);
  const canvasRef = useRef(null);
  const r = peekAdvantage({ peekerDist: p, defenderDist: d, latencyMs: latency });
  const winner = r.winner;

  useEffect(() => {
    const ctx = setupCanvas(canvasRef.current, W, H);
    const bg = cssVar('--bg');
    const border = cssVar('--border');
    const text = cssVar('--text');
    const muted = cssVar('--muted');
    const accent = cssVar('--accent');
    const warn = cssVar('--warn');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = border;
    ctx.fillRect(0, 174, 320, 12);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = muted;
    ctx.fillText('wall', 20, 168);

    const radius = Math.max(4, PEEK_DEFAULTS.shoulder * S);
    const defender = { x: CORNER.x - 1 * S, y: CORNER.y - d * S };
    const t = sightThresholds({ peekerDist: p, defenderDist: d, defenderOffset: 1 });
    // the moment both can see each other
    const px = Math.max(t.defenderSeesAt, t.peekerSeesAt);
    const peeker = { x: CORNER.x + px * S, y: CORNER.y + p * S };

    ctx.strokeStyle = muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(defender.x, defender.y);
    ctx.lineTo(peeker.x, peeker.y);
    ctx.stroke();

    ctx.textBaseline = 'middle';
    const players = [
      { side: 'defender', at: defender, label: 'Defender' },
      { side: 'peeker', at: peeker, label: 'Peeker' },
    ];
    for (const { side, at, label } of players) {
      ctx.fillStyle = winner === 'even' ? muted : winner === side ? accent : warn;
      ctx.beginPath();
      ctx.arc(at.x, at.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = text;
      ctx.fillText(label, at.x + radius + 6, at.y);
    }
    ctx.fillStyle = muted;
    ctx.fillText('strafes →', peeker.x + radius + 6 + ctx.measureText('Peeker').width + 8, peeker.y);
  }, [p, d, winner]);

  const result = {
    defender: `The defender sees the peeker first, by about ${r.netMs} ms.`,
    peeker: `The peeker sees the defender first, by about ${Math.abs(r.netMs)} ms.`,
    even: 'Neither side has a meaningful advantage.',
  }[winner];

  return (
    <div className="stack">
      <p>Move the sliders to change where each player stands and how much network delay there is.</p>
      <div>
        <Field label={`Peeker's distance from the corner: ${p} m`}>
          <input type="range" min="1" max="15" step="0.5" value={p} onChange={(e) => setP(Number(e.target.value))} />
        </Field>
        <Field label={`Defender's distance from the corner: ${d} m`}>
          <input type="range" min="1" max="15" step="0.5" value={d} onChange={(e) => setD(Number(e.target.value))} />
        </Field>
        <Field label={`Network delay: ${latency} ms`}>
          <input type="range" min="0" max="150" step="5" value={latency} onChange={(e) => setLatency(Number(e.target.value))} />
        </Field>
      </div>
      <canvas ref={canvasRef} width={W} height={H} role="img" aria-label="Top-down diagram of a peeker and a defender around a corner" />
      <div role="status">
        <p>{result}</p>
        <p className="muted">
          Geometry alone gives {Math.abs(r.geoMs)} ms to the {r.geoMs >= 0 ? 'defender' : 'peeker'}. Network delay gives {latency} ms to the peeker.
        </p>
        <p className="muted">Simplified top-down model: both players are 0.8 m wide and the peeker strafes at 5 m/s.</p>
      </div>
    </div>
  );
}
