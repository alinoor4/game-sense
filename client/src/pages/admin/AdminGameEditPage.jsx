import { useEffect, useId, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { api } from '../../lib/api.js';
import { gameById } from '../../lib/catalog.js';
import { GENRES } from '../../lib/constants.js';
import { slugify } from '../../lib/slug.js';
import AdminNav from '../../components/AdminNav.jsx';
import Field from '../../components/Field.jsx';
import FormError from '../../components/FormError.jsx';
import NotFoundPage from '../NotFoundPage.jsx';

const GENRE_LABELS = { fps: 'Shooter', fighting: 'Fighting' };

const sectionRows = (sections) => sections.map((s) => ({ id: s.id, key: s.id, title: s.title }));

function GameForm({ game, reloadCatalog }) {
  const navigate = useNavigate();
  const location = useLocation();
  const uid = useId();
  const [form, setForm] = useState(() => ({
    name: game?.name ?? '',
    slug: game?.slug ?? '',
    description: game?.description ?? '',
    genre: game?.genre ?? GENRES[0],
    isFundamentals: game?.isFundamentals ?? false,
    order: game?.order ?? 0,
    ranks: game?.ranks.join('\n') ?? '',
  }));
  const [sections, setSections] = useState(() => sectionRows(game?.sections ?? []));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(location.state?.saved));
  const [error, setError] = useState(null);
  const fieldErrors = error?.fields || {};

  // "Saved." after a create should show once, not again when the page is refreshed.
  useEffect(() => {
    if (location.state?.saved) navigate(location.pathname, { replace: true, state: { ...location.state, saved: false } });
  }, [location, navigate]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function changeSections(next) {
    setSections(next);
    setSaved(false);
  }

  function move(index, by) {
    const next = [...sections];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    changeSections(next);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      genre: form.genre,
      isFundamentals: form.isFundamentals,
      order: Number(form.order),
      ranks: form.ranks
        .split('\n')
        .map((rank) => rank.trim())
        .filter(Boolean),
      sections: sections.map((s) => (s.id ? { id: s.id, title: s.title } : { title: s.title })),
    };
    try {
      if (game) {
        const data = await api('PUT', `/admin/games/${game.id}`, payload);
        // New sections only get their ids from the server; without them a second save would create them again.
        setSections(sectionRows(data.game.sections));
        setSaved(true);
        reloadCatalog();
      } else {
        const data = await api('POST', '/admin/games', payload);
        reloadCatalog();
        navigate(`/admin/games/${data.game.id}`, { replace: true, state: { saved: true, game: data.game } });
      }
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <FormError error={error} />
      <div className="form-grid">
        <Field label="Name" error={fieldErrors.name}>
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <div>
          <Field label="Slug" error={fieldErrors.slug}>
            <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)} />
          </Field>
          <button type="button" className="btn btn-small" onClick={() => set('slug', slugify(form.name))}>
            Generate from name
          </button>
        </div>
        <Field label="Genre" error={fieldErrors.genre}>
          <select value={form.genre} onChange={(e) => set('genre', e.target.value)}>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {GENRE_LABELS[g]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Order" error={fieldErrors.order}>
          <input type="number" value={form.order} onChange={(e) => set('order', e.target.value)} />
          <span className="muted">Position on the home page.</span>
        </Field>
      </div>
      <Field label="Description" error={fieldErrors.description}>
        <textarea rows={3} maxLength={300} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </Field>
      <div>
        <label className="row">
          <input type="checkbox" checked={form.isFundamentals} onChange={(e) => set('isFundamentals', e.target.checked)} />
          Fundamentals track
        </label>
        <p className="muted">Tick for a game-agnostic track. Its lessons are recommended to players of every game in this genre.</p>
      </div>
      <Field label="Ranks" error={fieldErrors.ranks}>
        <textarea rows={6} value={form.ranks} onChange={(e) => set('ranks', e.target.value)} />
        <span className="muted">One rank per line, lowest first. Leave empty for no ranks.</span>
      </Field>

      <h2>Sections</h2>
      {sections.map((section, i) => (
        <div key={section.key} className="row">
          <label className="sr-only" htmlFor={`${uid}-section-${i}`}>
            Section title
          </label>
          <input
            id={`${uid}-section-${i}`}
            className="input admin-row-input"
            type="text"
            value={section.title}
            onChange={(e) => changeSections(sections.map((s, j) => (j === i ? { ...s, title: e.target.value } : s)))}
          />
          <button type="button" className="btn btn-small" disabled={i === 0} onClick={() => move(i, -1)}>
            Up
          </button>
          <button type="button" className="btn btn-small" disabled={i === sections.length - 1} onClick={() => move(i, 1)}>
            Down
          </button>
          <button type="button" className="btn btn-small" onClick={() => changeSections(sections.filter((_, j) => j !== i))}>
            Remove
          </button>
        </div>
      ))}
      <p>
        <button
          type="button"
          className="btn btn-small"
          onClick={() => changeSections([...sections, { id: undefined, key: crypto.randomUUID(), title: '' }])}
        >
          Add section
        </button>
      </p>
      <p className="muted">A section that still contains lessons cannot be removed.</p>

      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save game'}
        </button>
        <Link to="/admin/games">Cancel</Link>
      </div>
      {saved && (
        <p className="alert alert-ok" role="status">
          Saved.
        </p>
      )}
    </form>
  );
}

export default function AdminGameEditPage() {
  const { id } = useParams();
  const location = useLocation();
  const { catalog, error, reload } = useCatalog();
  // Straight after creating, the catalog may not have reloaded yet; the server's copy from the save fills that gap.
  const game = id && catalog ? (gameById(catalog, id) ?? location.state?.game ?? null) : null;
  const notFound = Boolean(id && catalog && !game);
  usePageTitle(notFound ? 'Page not found' : id ? 'Admin: edit game' : 'Admin: new game');

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
  if (notFound) return <NotFoundPage />;

  return (
    <div className="container stack">
      <AdminNav />
      <h1>{id ? 'Edit game' : 'New game'}</h1>
      <GameForm key={id ?? 'new'} game={game} reloadCatalog={reload} />
    </div>
  );
}
