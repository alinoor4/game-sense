import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { SENS_GAMES, convertSensitivity, edpi, cmPer360 } from '../lib/sensitivity.js';
import Field from '../components/Field.jsx';

const gameName = (id) => SENS_GAMES.find((g) => g.id === id).name;

export default function SensitivityPage() {
  usePageTitle('Sensitivity Converter');
  const [fromGame, setFromGame] = useState('cs2');
  const [toGame, setToGame] = useState('valorant');
  const [sens, setSens] = useState('2');
  const [fromDpi, setFromDpi] = useState('800');
  const [differentDpi, setDifferentDpi] = useState(false);
  const [toDpi, setToDpi] = useState('800');
  const [copied, setCopied] = useState(false);

  const dpiTo = differentDpi ? Number(toDpi) : Number(fromDpi);
  const converted = convertSensitivity({ fromGame, toGame, sens: Number(sens), fromDpi: Number(fromDpi), toDpi: dpiTo });
  const cm = cmPer360({ game: fromGame, sens: Number(sens), dpi: Number(fromDpi) });

  async function copy() {
    await navigator.clipboard.writeText(converted.toFixed(3));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const gameOptions = SENS_GAMES.map((g) => (
    <option key={g.id} value={g.id}>
      {g.name}
    </option>
  ));

  return (
    <div className="container stack">
      <p>
        <Link to="/tools">← All tools</Link>
      </p>
      <h1>Sensitivity Converter</h1>

      <div className="card">
        <div className="form-grid">
          <Field label="From game">
            <select value={fromGame} onChange={(e) => setFromGame(e.target.value)}>
              {gameOptions}
            </select>
          </Field>
          <Field label="To game">
            <select value={toGame} onChange={(e) => setToGame(e.target.value)}>
              {gameOptions}
            </select>
          </Field>
        </div>
        <p>
          <button
            type="button"
            className="btn btn-small"
            onClick={() => {
              setFromGame(toGame);
              setToGame(fromGame);
            }}
          >
            Swap games
          </button>
        </p>
        <div className="form-grid">
          <Field label="Your sensitivity in the first game">
            <input type="number" min="0" step="0.001" value={sens} onChange={(e) => setSens(e.target.value)} />
          </Field>
          <Field label="Mouse DPI">
            <input type="number" min="1" step="50" value={fromDpi} onChange={(e) => setFromDpi(e.target.value)} />
          </Field>
          {differentDpi && (
            <Field label="DPI in the second game">
              <input type="number" min="1" step="50" value={toDpi} onChange={(e) => setToDpi(e.target.value)} />
            </Field>
          )}
        </div>
        <label className="row">
          <input type="checkbox" checked={differentDpi} onChange={(e) => setDifferentDpi(e.target.checked)} />I use a
          different DPI in the second game
        </label>
      </div>

      <div className="card stack" role="status">
        {converted === null ? (
          <p className="muted">Enter positive numbers to see the result.</p>
        ) : (
          <>
            <div className="demo-stats">
              <div>
                <div className="stat">{converted.toFixed(3)}</div>
                <div className="stat-label">Sensitivity in {gameName(toGame)}</div>
              </div>
              <div>
                <div className="stat">{Math.round(edpi(Number(fromDpi), Number(sens)))}</div>
                <div className="stat-label">eDPI in {gameName(fromGame)}</div>
              </div>
              <div>
                <div className="stat">{Math.round(edpi(dpiTo, converted))}</div>
                <div className="stat-label">eDPI in {gameName(toGame)}</div>
              </div>
              <div>
                <div className="stat">{cm.toFixed(1)} cm</div>
                <div className="stat-label">Mouse travel per 360°</div>
              </div>
              <div>
                <div className="stat">{(cm / 2.54).toFixed(1)} in</div>
                <div className="stat-label">The same in inches</div>
              </div>
            </div>
            <p>
              <button type="button" className="btn" onClick={copy}>
                {copied ? 'Copied' : 'Copy sensitivity'}
              </button>
            </p>
          </>
        )}
      </div>

      <p className="muted">
        eDPI only compares settings inside one game. Distance per 360° is what stays the same when you switch games.
      </p>
    </div>
  );
}
