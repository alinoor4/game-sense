import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Field from '../components/Field.jsx';

export default function LoginPage() {
  usePageTitle('Log in');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await login(email, password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  }

  // Navigations render as transitions, after setUser; while our own submit is saving, this redirect must not win the race.
  if (user && !saving) return <Navigate to="/dashboard" replace />;

  return (
    <div className="container container-narrow stack">
      <h1>Log in</h1>
      <form onSubmit={onSubmit}>
        <Field label="Email">
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && (
          <p className="alert alert-error" role="alert">
            {error.message}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p>
        No account yet? <Link to="/register">Sign up</Link>
      </p>
      <p className="muted">Demo accounts are listed in the README.</p>
    </div>
  );
}
