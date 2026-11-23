import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { DEFAULT_CROSSHAIR, CROSSHAIR_LIMITS, crosshairRects, cs2Commands, valorantSettings } from '../lib/crosshair.js';
import { setupCanvas } from '../lib/browser.js';
import Field from '../components/Field.jsx';
import Markdown from '../components/Markdown.jsx';

const SCALE = 4;
const CENTRES = [160, 480];

export default function CrosshairPage() {
  usePageTitle('Crosshair Generator');
  const [c, setC] = useState(DEFAULT_CROSSHAIR);
  const set = (key, value) => setC((old) => ({ ...old, [key]: value }));
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = setupCanvas(canvasRef.current, 640, 240);
    ctx.fillStyle = '#8a94a6';
    ctx.fillRect(0, 0, 320, 240);
    ctx.fillStyle = '#1c2530';
    ctx.fillRect(320, 0, 320, 240);
    const rects = crosshairRects(c);
    const fill = (cx, r, grow) => ctx.fillRect(cx + (r.x - grow) * SCALE, 120 + (r.y - grow) * SCALE, (r.w + 2 * grow) * SCALE, (r.h + 2 * grow) * SCALE);
    for (const cx of CENTRES) {
      // All outlines before any colour: where arms meet (gap 0) a later outline would paint over an earlier arm.
      if (c.outline) {
        ctx.fillStyle = '#000';
        for (const r of rects) fill(cx, r, 1);
      }
      ctx.fillStyle = c.color;
      for (const r of rects) fill(cx, r, 0);
    }
  }, [c]);

  return (
    <div className="container stack">
      <p>
        <Link to="/tools">← All tools</Link>
      </p>
      <h1>Crosshair Generator</h1>

      <div className="card">
        <div className="form-grid">
          <Field label="Colour">
            <input type="color" value={c.color} onChange={(e) => set('color', e.target.value)} />
          </Field>
          <Field label={`Length: ${c.length} px`}>
            <input type="range" step="1" min={CROSSHAIR_LIMITS.length[0]} max={CROSSHAIR_LIMITS.length[1]} value={c.length} onChange={(e) => set('length', Number(e.target.value))} />
          </Field>
          <Field label={`Thickness: ${c.thickness} px`}>
            <input type="range" step="1" min={CROSSHAIR_LIMITS.thickness[0]} max={CROSSHAIR_LIMITS.thickness[1]} value={c.thickness} onChange={(e) => set('thickness', Number(e.target.value))} />
          </Field>
          <Field label={`Gap: ${c.gap} px`}>
            <input type="range" step="1" min={CROSSHAIR_LIMITS.gap[0]} max={CROSSHAIR_LIMITS.gap[1]} value={c.gap} onChange={(e) => set('gap', Number(e.target.value))} />
          </Field>
        </div>
        <div className="row">
          <label className="row">
            <input type="checkbox" checked={c.dot} onChange={(e) => set('dot', e.target.checked)} />
            Centre dot
          </label>
          <label className="row">
            <input type="checkbox" checked={c.outline} onChange={(e) => set('outline', e.target.checked)} />
            Black outline
          </label>
          <button type="button" className="btn btn-small" onClick={() => setC(DEFAULT_CROSSHAIR)}>
            Reset
          </button>
        </div>
      </div>

      <div className="demo">
        <canvas ref={canvasRef} role="img" aria-label="Crosshair preview" />
        <p className="muted">Preview at 4× size on a light and a dark background.</p>
      </div>

      <h2>Counter-Strike 2</h2>
      <p className="muted">Paste into the console. The conversion from pixels is approximate, so fine-tune the size and gap in game.</p>
      <Markdown>{'```\n' + cs2Commands(c) + '\n```'}</Markdown>

      <h2>Valorant</h2>
      <p className="muted">Enter these by hand in Settings → Crosshair.</p>
      <table>
        <thead>
          <tr>
            <th>Setting</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {valorantSettings(c).map(([setting, value]) => (
            <tr key={setting}>
              <td>{setting}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
