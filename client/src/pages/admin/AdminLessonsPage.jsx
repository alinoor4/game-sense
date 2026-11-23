import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi.js';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { api } from '../../lib/api.js';
import { gameById } from '../../lib/catalog.js';
import AdminNav from '../../components/AdminNav.jsx';
import Field from '../../components/Field.jsx';

export default function AdminLessonsPage() {
  usePageTitle('Admin: lessons');
  const { data, error, reload } = useApi('/admin/lessons');
  const { catalog, error: catalogError, reload: reloadCatalog } = useCatalog();
  const [gameFilter, setGameFilter] = useState('');
  const [actionError, setActionError] = useState(null);

  async function remove(lesson) {
    if (!window.confirm(`Delete "${lesson.title}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await api('DELETE', `/admin/lessons/${lesson.id}`);
      reload();
      reloadCatalog();
    } catch (err) {
      setActionError(err);
    }
  }

  const loadError = error || catalogError;
  if (loadError) {
    return (
      <div className="container">
        <p className="alert alert-error" role="alert">
          {loadError.message}
        </p>
      </div>
    );
  }
  // Checking data, not loading, keeps the table on screen while it reloads after a delete.
  if (!data || !catalog) return <p className="container muted">Loading…</p>;

  const rows = data.lessons
    .filter((lesson) => !gameFilter || lesson.game === gameFilter)
    .map((lesson) => ({ lesson, game: gameById(catalog, lesson.game) }))
    .sort((a, b) => (a.game?.name ?? '').localeCompare(b.game?.name ?? '') || a.lesson.order - b.lesson.order);

  return (
    <div className="container stack">
      <AdminNav />
      <h1>Lessons</h1>
      <div className="row row-between">
        <Field label="Game">
          <select value={gameFilter} onChange={(e) => setGameFilter(e.target.value)}>
            <option value="">All games</option>
            {catalog.games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </Field>
        <Link className="btn btn-primary" to="/admin/lessons/new">
          New lesson
        </Link>
      </div>
      {actionError && (
        <p className="alert alert-error" role="alert">
          {actionError.message}
        </p>
      )}
      {rows.length === 0 ? (
        <p className="muted">No lessons yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Game</th>
                <th>Section</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ lesson, game }) => (
                <tr key={lesson.id}>
                  <td>
                    <Link to={`/admin/lessons/${lesson.id}`}>{lesson.title}</Link>
                  </td>
                  <td>{game?.name}</td>
                  <td>{game?.sections.find((s) => s.id === lesson.section)?.title}</td>
                  <td>{lesson.difficulty}</td>
                  <td>
                    {lesson.published ? (
                      <span className="badge badge-accent">Published</span>
                    ) : (
                      <span className="badge badge-warn">Draft</span>
                    )}
                  </td>
                  <td>
                    <div className="row">
                      {game && <Link to={`/games/${game.slug}/${lesson.slug}`}>View</Link>}
                      <button type="button" className="btn btn-small btn-danger" onClick={() => remove(lesson)}>
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
