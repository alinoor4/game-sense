import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { gameById, progressOfGame, recommendLessons } from '../lib/catalog.js';
import { SKILL_LABELS } from '../lib/constants.js';
import { generateRoutine } from '../lib/routine.js';

export default function DashboardPage() {
  usePageTitle('Dashboard');
  const { user } = useAuth();
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

  const { profile } = user;
  const assessed = Boolean(profile.game && profile.weakness);
  const recommended = assessed ? recommendLessons(catalog, user, 6) : [];
  const routine = generateRoutine({ minutes: profile.dailyMinutes, weakness: profile.weakness });

  return (
    <div className="container stack">
      <h1>Welcome back, {user.name}</h1>

      {assessed ? (
        <>
          <div className="grid">
            <div className="card">
              <div className="stat-label">Training for</div>
              <div className="stat">{gameById(catalog, profile.game)?.name}</div>
            </div>
            <div className="card">
              <div className="stat-label">Rank goal</div>
              <div className="stat">
                {profile.currentRank || 'Unranked'} → {profile.targetRank || 'Not set'}
              </div>
            </div>
            <div className="card">
              <div className="stat-label">Focus</div>
              <div className="stat">{SKILL_LABELS[profile.weakness]}</div>
            </div>
          </div>
          <p>
            <Link to="/onboarding">Retake the assessment</Link>
          </p>

          <h2>Recommended next</h2>
          {recommended.length === 0 ? (
            <p className="muted">You have finished everything we recommend. Pick any track from the home page.</p>
          ) : (
            <div className="grid">
              {recommended.map(({ lesson, game }) => (
                <Link key={lesson.id} className="card" to={`/games/${game.slug}/${lesson.slug}`}>
                  <h3>{lesson.title}</h3>
                  <p className="row">
                    <span className="badge">{game.name}</span>
                    <span className="badge">{lesson.difficulty}</span>
                  </p>
                  <p className="muted">{lesson.summary}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="card stack">
          <h2>Find your weak spot</h2>
          <p>Two minutes, eight questions. You get a learning path built around the skill that costs you the most rounds.</p>
          <p>
            <Link className="btn btn-primary" to="/onboarding">
              Start the assessment
            </Link>
          </p>
        </div>
      )}

      <h2>Your progress</h2>
      {catalog.games.length === 0 && <p className="muted">No tracks yet.</p>}
      <div className="grid">
        {catalog.games.map((game) => {
          const { done, total, percent } = progressOfGame(catalog, game, user.completedLessons);
          return (
            <Link key={game.id} className="card" to={`/games/${game.slug}`}>
              <h3>{game.name}</h3>
              <div className="progress">
                <div style={{ width: `${percent}%` }} />
              </div>
              <p className="muted">
                {done} of {total}
              </p>
            </Link>
          );
        })}
      </div>

      {assessed && (
        <>
          <h2>Today's routine</h2>
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
                {routine.map((block) => (
                  <tr key={block.key}>
                    <td>{block.minutes}</td>
                    <td>{block.link ? <Link to={block.link}>{block.label}</Link> : block.label}</td>
                    <td>{block.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <Link to="/tools/routine">Change the time or download it</Link>
          </p>
        </>
      )}
    </div>
  );
}
