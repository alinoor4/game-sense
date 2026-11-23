import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { LINEUP_KINDS } from '../lib/constants.js';
import Field from '../components/Field.jsx';
import MapStage from '../components/MapStage.jsx';
import Markdown from '../components/Markdown.jsx';
import NotFoundPage from './NotFoundPage.jsx';

const capitalise = (text) => text[0].toUpperCase() + text.slice(1);

export default function LineupMapPage() {
  const { mapSlug } = useParams();
  const { data, error, loading } = useApi(`/maps/${mapSlug}`);
  const [selectedId, setSelectedId] = useState(null);
  const [showCallouts, setShowCallouts] = useState(true);
  const [kind, setKind] = useState('');
  const notFound = error?.status === 404;
  // NotFoundPage sets this title too, but a parent's effect runs after its child's and would overwrite it.
  usePageTitle(notFound ? 'Page not found' : data?.map.name);

  if (loading) return <p className="container muted">Loading…</p>;
  if (notFound) return <NotFoundPage />;
  if (error) {
    return (
      <div className="container">
        <p className="alert alert-error" role="alert">
          {error.message}
        </p>
      </div>
    );
  }

  const { map } = data;
  const lineups = map.lineups.filter((lineup) => !kind || lineup.kind === kind);
  const selected = lineups.find((lineup) => lineup.id === selectedId);

  return (
    <div className="container stack">
      <p>
        <Link to="/tools/lineups">← All maps</Link>
      </p>
      <h1>{map.name}</h1>
      <div className="row">
        <label className="row">
          <input type="checkbox" checked={showCallouts} onChange={(e) => setShowCallouts(e.target.checked)} />
          Show callouts
        </label>
        <Field label="Show">
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setSelectedId(null);
            }}
          >
            <option value="">All lineups</option>
            {LINEUP_KINDS.map((k) => (
              <option key={k} value={k}>
                {capitalise(k)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <MapStage map={map} selectedId={selectedId} onSelect={setSelectedId} showCallouts={showCallouts} kind={kind} />
      <p className="muted">Round marker: where it lands. Square marker: where you stand.</p>
      <div className="card" role="status">
        {selected ? (
          <>
            <h2>{selected.title}</h2>
            <span className="badge">{selected.kind}</span>
            <Markdown>{selected.steps}</Markdown>
          </>
        ) : (
          <p>Select a marker on the map, or pick a lineup from the list below.</p>
        )}
      </div>
      <h2>All lineups</h2>
      <div className="row">
        {lineups.map((lineup) => (
          <button
            key={lineup.id}
            type="button"
            className="btn"
            aria-pressed={lineup.id === selectedId}
            onClick={() => setSelectedId(lineup.id)}
          >
            {lineup.title}
          </button>
        ))}
      </div>
      <p className="muted">Positions are approximate. Always test a lineup in a private match first.</p>
    </div>
  );
}
