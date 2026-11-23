import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { api } from '../../lib/api.js';
import { progressOfGame } from '../../lib/catalog.js';
import AdminNav from '../../components/AdminNav.jsx';

export default function AdminGamesPage() {
  usePageTitle('Admin: games');
  const { catalog, error, reload } = useCatalog();
  const [actionError, setActionError] = useState(null);

  async function remove(game) {
    if (!window.confirm(`Delete "${game.name}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await api('DELETE', `/admin/games/${game.id}`);
      reload();
    } catch (err) {
      setActionError(err);
    }
  }

  if (error) {
    return (
      <div className="container">
        <p className="alert alert-error" role="alert">
          {error.message}
        </p>
      </div>
    );
  }
  if (!catalog) return <p className="container muted">Loading…</p>;

  return (
    <div className="container stack">
      <AdminNav />
      <div className="row row-between">
        <h1>Games</h1>
        <Link className="btn btn-primary" to="/admin/games/new">
          New game
        </Link>
      </div>
      {actionError && (
        <p className="alert alert-error" role="alert">
          {actionError.message}
        </p>
      )}
      {catalog.games.length === 0 ? (
        <p className="muted">No games yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Genre</th>
                <th>Sections</th>
                <th>Lessons</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {catalog.games.map((game) => (
                <tr key={game.id}>
                  <td>
                    <Link to={`/admin/games/${game.id}`}>{game.name}</Link>
                  </td>
                  <td>{game.slug}</td>
                  <td>{game.genre}</td>
                  <td>{game.sections.length}</td>
                  <td>{progressOfGame(catalog, game, []).total}</td>
                  <td>
                    <button type="button" className="btn btn-small btn-danger" onClick={() => remove(game)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
