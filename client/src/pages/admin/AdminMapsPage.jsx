import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { api } from '../../lib/api.js';
import { gameById } from '../../lib/catalog.js';
import AdminNav from '../../components/AdminNav.jsx';

export default function AdminMapsPage() {
  usePageTitle('Admin: maps');
  const { catalog, error, reload } = useCatalog();
  const [actionError, setActionError] = useState(null);

  async function remove(map) {
    if (!window.confirm(`Delete "${map.name}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await api('DELETE', `/admin/maps/${map.id}`);
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
        <h1>Maps</h1>
        <Link className="btn btn-primary" to="/admin/maps/new">
          New map
        </Link>
      </div>
      {actionError && (
        <p className="alert alert-error" role="alert">
          {actionError.message}
        </p>
      )}
      {catalog.maps.length === 0 ? (
        <p className="muted">No maps yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Game</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {catalog.maps.map((map) => (
                <tr key={map.id}>
                  <td>
                    <Link to={`/admin/maps/${map.id}`}>{map.name}</Link>
                  </td>
                  <td>{gameById(catalog, map.game)?.name}</td>
                  <td>
                    <div className="row">
                      <Link to={`/tools/lineups/${map.slug}`}>View</Link>
                      <button type="button" className="btn btn-small btn-danger" onClick={() => remove(map)}>
                        Delete
                      </button>
                    </div>
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
