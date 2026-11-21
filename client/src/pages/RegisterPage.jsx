import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Field from '../components/Field.jsx';

export default function RegisterPage() {
  usePageTitle('Sign up');
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await register(name, email, password);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  }

  // Navigations render as transitions, after setUser; while our own submit is saving, this redirect must not win the race.
  if (user && !saving) return <Navigate to="/dashboard" replace />;

  return (
    <div className="container container-narrow stack">
      <h1>Sign up</h1>
      <form onSubmit={onSubmit}>
        <Field label="Name" error={error?.fields.name}>
          <input
            type="text"
            required
            minLength={2}
            maxLength={50}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Email" error={error?.fields.email}>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" error={error?.fields.password}>
          <input
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="muted">8 to 72 characters.</span>
        </Field>
        {error && (
          <p className="alert alert-error" role="alert">
            {error.message}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
