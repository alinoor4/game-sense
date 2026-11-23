import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { progressOfGame } from '../lib/catalog.js';
import { TOOLS } from '../lib/tools.js';

export default function HomePage() {
  usePageTitle('Learn to play better');
  const { catalog, loading, error } = useCatalog();
  const { user } = useAuth();

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

  const completed = user?.completedLessons || [];
  const first = catalog.games[0];

  return (
    <div className="container stack">
      <h1>The W3Schools of competitive gaming.</h1>
      <p>Short lessons, in order, with something to try on every page. Pick a track and start at lesson one.</p>
      <div className="row">
        {first && (
          <Link className="btn btn-primary" to={`/games/${first.slug}`}>
            Start with {first.name}
          </Link>
        )}
        <Link className="btn" to={user ? '/onboarding' : '/register'}>
          Find my weak spot
        </Link>
      </div>

      <h2>Tracks</h2>
      {catalog.games.length === 0 && <p className="muted">No tracks yet.</p>}
      <div className="grid">
        {catalog.games.map((game) => {
          const { done, total, percent } = progressOfGame(catalog, game, completed);
          return (
            <Link key={game.id} className="card" to={`/games/${game.slug}`}>
              <h3>{game.name}</h3>
              <p className="row">
                <span className="badge">{game.genre === 'fps' ? 'Shooter' : 'Fighting'}</span>
                {game.isFundamentals && <span className="badge badge-accent">Fundamentals</span>}
              </p>
              <p className="muted">{game.description}</p>
              <p>
                {total} {total === 1 ? 'lesson' : 'lessons'}
              </p>
              {user && total > 0 && (
                <>
                  <div className="progress">
                    <div style={{ width: `${percent}%` }} />
                  </div>
                  <p className="muted">
                    {done} of {total} done
                  </p>
                </>
              )}
            </Link>
          );
        })}
      </div>

      <h2>Tools</h2>
      <div className="grid">
        {TOOLS.map((tool) => (
          <Link key={tool.path} className="card" to={tool.path}>
            <h3>{tool.title}</h3>
            <p className="muted">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
