import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { gameBySlug, progressOfGame, sectionsWithLessons } from '../lib/catalog.js';
import { SKILL_LABELS } from '../lib/constants.js';
import Sidebar from '../components/Sidebar.jsx';
import NotFoundPage from './NotFoundPage.jsx';

export default function GamePage() {
  const { gameSlug } = useParams();
  const { catalog, loading, error } = useCatalog();
  const { user } = useAuth();
  const game = catalog ? gameBySlug(catalog, gameSlug) : null;
  // NotFoundPage sets this title too, but a parent's effect runs after its child's and would overwrite it.
  usePageTitle(catalog && !game ? 'Page not found' : game?.name);

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
  if (!game) return <NotFoundPage />;

  const completed = user?.completedLessons || [];
  const { done, total, percent } = progressOfGame(catalog, game, completed);
  const groups = sectionsWithLessons(catalog, game).filter(({ lessons }) => lessons.length > 0);
  const hasMaps = catalog.maps.some((map) => map.game === game.id);

  return (
    <div className="layout">
      <Sidebar game={game} />
      <div className="content stack">
        <h1>{game.name}</h1>
        <p className="muted">{game.description}</p>
        {user && total > 0 && (
          <>
            <div className="progress">
              <div style={{ width: `${percent}%` }} />
            </div>
            <p className="muted">
              {done} of {total} lessons done
            </p>
          </>
        )}
        {hasMaps && (
          <p>
            <Link to="/tools/lineups">Lineup maps for this track</Link>
          </p>
        )}
        {groups.length === 0 && <p className="muted">No lessons yet.</p>}
        {groups.map(({ section, lessons }) => (
          <Fragment key={section.id}>
            <h2>{section.title}</h2>
            <div className="grid">
              {lessons.map((lesson) => (
                <Link key={lesson.id} className="card" to={`/games/${game.slug}/${lesson.slug}`}>
                  <h3>
                    {lesson.title}
                    {completed.includes(lesson.id) ? ' ✓' : ''}
                  </h3>
                  <p className="row">
                    <span className="badge">{lesson.difficulty}</span>
                    {lesson.skill && <span className="badge">{SKILL_LABELS[lesson.skill]}</span>}
                  </p>
                  <p className="muted">{lesson.summary}</p>
                </Link>
              ))}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
