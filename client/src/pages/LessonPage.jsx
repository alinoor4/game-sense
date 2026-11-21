import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { api } from '../lib/api.js';
import { downloadText } from '../lib/browser.js';
import { gameBySlug, neighbours } from '../lib/catalog.js';
import { SKILL_LABELS } from '../lib/constants.js';
import Markdown from '../components/Markdown.jsx';
import Sidebar from '../components/Sidebar.jsx';
import NotFoundPage from './NotFoundPage.jsx';

function DrillList({ lesson }) {
  if (lesson.drills.length === 0) return null;
  const total = lesson.drills.reduce((sum, drill) => sum + drill.minutes, 0);
  const text = [lesson.title, '', ...lesson.drills.map((d) => `[ ${d.minutes} min ] ${d.name} (${d.tool})`)].join('\n');

  return (
    <section className="card stack">
      <h2>Practice routine</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Drill</th>
              <th>Tool</th>
              <th>Minutes</th>
            </tr>
          </thead>
          <tbody>
            {lesson.drills.map((drill) => (
              <tr key={drill.id}>
                <td>{drill.name}</td>
                <td>{drill.tool}</td>
                <td>{drill.minutes}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td />
              <td>{total}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {lesson.playlistCode && (
        <p>
          Playlist code: <code>{lesson.playlistCode}</code>{' '}
          <button type="button" className="btn btn-small" onClick={() => navigator.clipboard.writeText(lesson.playlistCode)}>
            Copy
          </button>
        </p>
      )}
      <p>
        <button type="button" className="btn" onClick={() => downloadText(`${lesson.slug}-routine.txt`, text)}>
          Download routine (.txt)
        </button>
      </p>
    </section>
  );
}

function CompleteButton({ lesson }) {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!lesson.published) return null;
  if (!user) {
    return (
      <p className="muted">
        <Link to="/login">Log in</Link> to track your progress.
      </p>
    );
  }

  const done = user.completedLessons.includes(lesson.id);

  async function toggle() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const data = await api(done ? 'DELETE' : 'PUT', `/me/progress/${lesson.id}`);
      setUser({ ...user, completedLessons: data.completedLessons });
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <p className="row">
        {done && <span className="badge badge-accent">Completed ✓</span>}
        {/* One button in a fixed position, with aria-disabled instead of disabled (a disabled button drops
            keyboard focus), so focus stays on it while it switches between the two states. */}
        <button type="button" className={done ? 'btn btn-small' : 'btn btn-primary'} aria-disabled={saving} onClick={toggle}>
          {saving ? 'Saving…' : done ? 'Undo' : 'Mark as complete'}
        </button>
      </p>
      {error && (
        <p className="alert alert-error" role="alert">
          {error.message}
        </p>
      )}
    </>
  );
}

export default function LessonPage() {
  const { gameSlug, lessonSlug } = useParams();
  const { data, error, loading } = useApi(`/lessons/${gameSlug}/${lessonSlug}`);
  const { catalog, loading: catalogLoading, error: catalogError } = useCatalog();
  const game = catalog ? gameBySlug(catalog, gameSlug) : null;
  const notFound = error?.status === 404 || (catalog && !game);
  // NotFoundPage sets this title too, but a parent's effect runs after its child's and would overwrite it.
  usePageTitle(notFound ? 'Page not found' : data?.lesson.title);

  // Between lessons the previous one stays up until the next arrives, so the sidebar keeps its scroll position.
  if (catalogLoading || (loading && !data)) return <p className="container muted">Loading…</p>;
  if (catalogError) {
    return (
      <div className="container">
        <p className="alert alert-error" role="alert">
          {catalogError.message}
        </p>
      </div>
    );
  }
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

  const { lesson } = data;
  const sectionTitle = game.sections.find((s) => s.id === lesson.section)?.title;
  const { prev, next } = neighbours(catalog, game, lesson.id);

  return (
    <div className="layout">
      <Sidebar game={game} />
      <article className="content stack">
        <p className="muted">
          <Link to={`/games/${game.slug}`}>{game.name}</Link> › {sectionTitle}
        </p>
        <h1>{lesson.title}</h1>
        <p className="row">
          <span className="badge">{lesson.difficulty}</span>
          {lesson.skill && <span className="badge">{SKILL_LABELS[lesson.skill]}</span>}
          {!lesson.published && <span className="badge badge-warn">Draft</span>}
        </p>
        <p className="muted">{lesson.summary}</p>
        {lesson.clipUrl && (
          <video src={lesson.clipUrl} autoPlay loop muted playsInline controls aria-label={`Clip: ${lesson.title}`} />
        )}
        <Markdown>{lesson.body}</Markdown>
        <DrillList lesson={lesson} />
        <CompleteButton key={lesson.id} lesson={lesson} />
        <nav className="row row-between" aria-label="Lesson navigation">
          {prev ? (
            <Link className="btn" to={`/games/${game.slug}/${prev.slug}`}>
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="btn" to={`/games/${game.slug}/${next.slug}`}>
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  );
}
