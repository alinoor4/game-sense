import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { api } from '../lib/api.js';
import { downloadText } from '../lib/browser.js';
import { SKILL_LABELS, WEAKNESSES } from '../lib/constants.js';
import { generateRoutine, routineToText } from '../lib/routine.js';
import Field from '../components/Field.jsx';

// Mounted once we know who is logged in, so the fields start from the saved plan.
function Planner() {
  const { user, setUser } = useAuth();
  const [minutes, setMinutes] = useState(String(user?.profile.dailyMinutes ?? 145));
  const [weakness, setWeakness] = useState(user?.profile.weakness ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const blocks = generateRoutine({ minutes: Number(minutes), weakness });
  const total = blocks.reduce((sum, block) => sum + block.minutes, 0);
  const adjusted = Number(minutes) < 30 || Number(minutes) > 480;

  async function save() {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const data = await api('PATCH', '/me/profile', { dailyMinutes: total, weakness });
      setUser(data.user);
      setSaved(true);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="card form-grid">
        <Field label="Minutes available today">
          <input
            type="number"
            min={30}
            max={480}
            step={5}
            value={minutes}
            onChange={(e) => {
              setMinutes(e.target.value);
              setSaved(false);
            }}
          />
        </Field>
        <Field label="Focus">
          <select
            value={weakness}
            onChange={(e) => {
              setWeakness(e.target.value);
              setSaved(false);
            }}
          >
            <option value="">No specific focus</option>
            {WEAKNESSES.map((w) => (
              <option key={w} value={w}>
                {SKILL_LABELS[w]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Minutes</th>
              <th>Block</th>
              <th>Focus</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => (
              <tr key={block.key}>
                <td>{block.minutes}</td>
                <td>{block.link ? <Link to={block.link}>{block.label}</Link> : block.label}</td>
                <td>{block.focus}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>{total}</td>
              <th scope="row">Total</th>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      {adjusted && <p className="muted">Plans are made for 30 to 480 minutes; this one was adjusted.</p>}

      <div className="row">
        <button type="button" className="btn" onClick={() => downloadText('daily-routine.txt', routineToText(blocks))}>
          Download (.txt)
        </button>
        {user && (
          // aria-disabled instead of disabled: a disabled button drops keyboard focus while it saves.
          <button type="button" className="btn btn-primary" aria-disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Save as my daily plan'}
          </button>
        )}
      </div>
      {!user && (
        <p className="muted">
          <Link to="/login">Log in</Link> to save this plan to your dashboard.
        </p>
      )}
      {saved && (
        <p className="alert alert-ok" role="status">
          Saved.
        </p>
      )}
      {error && (
        <p className="alert alert-error" role="alert">
          {error.message}
        </p>
      )}
    </>
  );
}

export default function RoutinePage() {
  usePageTitle('Daily Routine');
  const { loading } = useAuth();

  return (
    <div className="container stack">
      <p>
        <Link to="/tools">← All tools</Link>
      </p>
      <h1>Daily Routine</h1>
      {loading ? <p className="muted">Loading…</p> : <Planner />}
    </div>
  );
}
