import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { api } from '../lib/api.js';
import { gameById } from '../lib/catalog.js';
import { QUESTIONS, scoreQuiz } from '../lib/quiz.js';
import Field from '../components/Field.jsx';

// Mounted only once the catalog is loaded, so the first game can be the initial choice.
function Assessment({ catalog }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [gameId, setGameId] = useState(user.profile.game || catalog.games[0]?.id || '');
  const [currentRank, setCurrentRank] = useState(user.profile.currentRank);
  const [targetRank, setTargetRank] = useState(user.profile.targetRank);
  const [dailyMinutes, setDailyMinutes] = useState(user.profile.dailyMinutes ?? 145);
  const [answers, setAnswers] = useState(() => QUESTIONS.map(() => null));
  const [triedNext, setTriedNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const heading = useRef(null);
  const shownStep = useRef(step);

  // The button that changed the step is gone; put keyboard focus on the new step's heading instead of losing it.
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    heading.current?.focus();
  }, [step]);

  const ranks = gameById(catalog, gameId)?.ranks || [];
  const rankOrderWrong = Boolean(currentRank && targetRank) && ranks.indexOf(targetRank) < ranks.indexOf(currentRank);
  const result = scoreQuiz(answers);
  const answered = answers.filter((a) => a !== null).length;
  const fields = error?.fields || {};

  function onNext(event) {
    event.preventDefault();
    setTriedNext(true);
    if (!rankOrderWrong) setStep(2);
  }

  async function onFinish(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = await api('PATCH', '/me/profile', {
        game: gameId,
        currentRank,
        targetRank,
        dailyMinutes: Number(dailyMinutes),
        weakness: result.weakness,
      });
      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
      if (Object.keys(err.fields).length) setStep(1);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container stack">
      <h1>Skill assessment</h1>
      {step === 1 ? (
        <>
          <h2 ref={heading} tabIndex={-1}>
            Step 1 of 2: about you
          </h2>
          <form onSubmit={onNext}>
            <Field label="Which game are you training for?" error={fields.game}>
              <select
                value={gameId}
                onChange={(e) => {
                  setGameId(e.target.value);
                  setCurrentRank('');
                  setTargetRank('');
                }}
              >
                {catalog.games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </Field>
            {ranks.length > 0 && (
              <div className="form-grid">
                <Field label="Current rank" error={fields.currentRank}>
                  <select value={currentRank} onChange={(e) => setCurrentRank(e.target.value)}>
                    <option value="">Not ranked yet</option>
                    {ranks.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Target rank"
                  error={triedNext && rankOrderWrong ? 'Target rank must be at or above your current rank.' : fields.targetRank}
                >
                  <select value={targetRank} onChange={(e) => setTargetRank(e.target.value)}>
                    <option value="">Not ranked yet</option>
                    {ranks.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
            <Field label="Minutes you can train per day" error={fields.dailyMinutes}>
              <input
                type="number"
                min={30}
                max={480}
                step={5}
                required
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(e.target.value)}
              />
            </Field>
            {error && (
              <p className="alert alert-error" role="alert">
                {error.message}
              </p>
            )}
            <button type="submit" className="btn btn-primary">
              Next: 8 quick questions
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 ref={heading} tabIndex={-1}>
            Step 2 of 2: which sounds most like you?
          </h2>
          <form className="stack" onSubmit={onFinish}>
            {QUESTIONS.map((question, i) => (
              <fieldset key={question.text} className="card">
                <legend>
                  {i + 1}. {question.text}
                </legend>
                {question.options.map((option, j) => (
                  <label key={option} className="row">
                    <input
                      type="radio"
                      name={`q${i}`}
                      checked={answers[i] === j}
                      onChange={() => setAnswers((prev) => prev.map((a, k) => (k === i ? j : a)))}
                    />
                    {option}
                  </label>
                ))}
              </fieldset>
            ))}
            <p className="muted">
              {answered} of {QUESTIONS.length} answered
            </p>
            {error && (
              <p className="alert alert-error" role="alert">
                {error.message}
              </p>
            )}
            <div className="row">
              <button type="button" className="btn" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={!result.complete || saving}>
                {saving ? 'Saving…' : 'See my result'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  usePageTitle('Skill assessment');
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
  return <Assessment catalog={catalog} />;
}
