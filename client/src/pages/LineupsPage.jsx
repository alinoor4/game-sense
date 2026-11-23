import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function LineupsPage() {
  usePageTitle('Lineup Maps');
  const { catalog, loading, error } = useCatalog();

  if (loading) return <p className="container muted">Loading…</p>;
  if (error) {
    return (
      <div className="container">
        <p className="alert alert-error" role="alert">
          {error.message}
        </p>
      </div>
    );
  }

  const groups = catalog.games
    .map((game) => ({ game, maps: catalog.maps.filter((map) => map.game === game.id) }))
    .filter(({ maps }) => maps.length > 0);

  return (
    <div className="container stack">
      <p>
        <Link to="/tools">← All tools</Link>
      </p>
      <h1>Lineup Maps</h1>
      <p className="muted">Click a marker to see where to stand, where it lands and how to throw it.</p>
      {groups.length === 0 && <p className="muted">No maps yet.</p>}
      {groups.map(({ game, maps }) => (
        <Fragment key={game.id}>
          <h2>{game.name}</h2>
          <div className="grid">
            {maps.map((map) => (
              <Link key={map.id} className="card" to={`/tools/lineups/${map.slug}`}>
                <h3>{map.name}</h3>
              </Link>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
