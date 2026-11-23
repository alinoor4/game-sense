import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi.js';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { api } from '../../lib/api.js';
import { LINEUP_KINDS } from '../../lib/constants.js';
import { slugify } from '../../lib/slug.js';
import AdminNav from '../../components/AdminNav.jsx';
import Field from '../../components/Field.jsx';
import FormError from '../../components/FormError.jsx';
import MapStage from '../../components/MapStage.jsx';
import NotFoundPage from '../NotFoundPage.jsx';

const HINTS = {
  idle: () => 'Select a marker to edit it, or choose an action above.',
  callout: (name) => `Click the map where "${name}" belongs.`,
  from: () => 'Click where the player stands.',
  to: () => 'Now click where it lands.',
};

const withKeys = (items) => items.map((item) => ({ ...item, key: item.id }));

function MapForm({ catalog, map, reloadCatalog }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(() => ({
    game: map?.game ?? catalog.games[0]?.id ?? '',
    name: map?.name ?? '',
    slug: map?.slug ?? '',
    imageUrl: map?.imageUrl ?? '',
    callouts: withKeys(map?.callouts ?? []),
    lineups: withKeys(map?.lineups ?? []),
  }));
  const [mode, setMode] = useState('idle');
  const [pendingFrom, setPendingFrom] = useState(null);
  const [calloutName, setCalloutName] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(location.state?.saved));
  const [error, setError] = useState(null);
  const fieldErrors = error?.fields || {};
  const selected = form.lineups.find((lineup) => lineup.key === selectedKey);

  // "Saved." after a create should show once, not again when the page is refreshed.
  useEffect(() => {
    if (location.state?.saved) navigate(location.pathname, { replace: true, state: { ...location.state, saved: false } });
  }, [location, navigate]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function updateSelected(key, value) {
    set('lineups', form.lineups.map((lineup) => (lineup.key === selectedKey ? { ...lineup, [key]: value } : lineup)));
  }

  function cancelMode() {
    setMode('idle');
    setPendingFrom(null);
  }

  function handleStageClick({ x, y }) {
    if (mode === 'callout') {
      set('callouts', [...form.callouts, { key: crypto.randomUUID(), name: calloutName.trim(), x, y }]);
      setCalloutName('');
      setMode('idle');
    } else if (mode === 'from') {
      setPendingFrom({ x, y });
      setMode('to');
    } else if (mode === 'to') {
      const key = crypto.randomUUID();
      set('lineups', [...form.lineups, { key, title: 'New lineup', kind: 'smoke', from: pendingFrom, to: { x, y }, steps: '' }]);
      setSelectedKey(key);
      setPendingFrom(null);
      setMode('idle');
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const payload = {
      game: form.game,
      name: form.name,
      slug: form.slug,
      imageUrl: form.imageUrl,
      callouts: form.callouts.map(({ name, x, y }) => ({ name, x, y })),
      lineups: form.lineups.map(({ title, kind, from, to, steps }) => ({
        title,
        kind,
        from: { x: from.x, y: from.y },
        to: { x: to.x, y: to.y },
        steps,
      })),
    };
    try {
      if (map) {
        await api('PUT', `/admin/maps/${map.id}`, payload);
        setSaved(true);
        reloadCatalog();
      } else {
        const data = await api('POST', '/admin/maps', payload);
        reloadCatalog();
        navigate(`/admin/maps/${data.map.id}`, { replace: true, state: { saved: true, map: data.map } });
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
        <Field label="Game" error={fieldErrors.game}>
          <select value={form.game} onChange={(e) => set('game', e.target.value)}>
            {catalog.games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </Field>
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
      </div>
      <Field label="Image URL" error={fieldErrors.imageUrl}>
        <input type="text" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} />
        <span className="muted">
          Either /maps/&lt;file&gt; for an image you placed in client/public/maps/, or an https link. Use a square image. Only use
          images you made or have permission to use.
        </span>
      </Field>

      {form.imageUrl && (
        <>
          <h2>Callouts and lineups</h2>
          <div className="row">
            <label htmlFor="new-callout-name">New callout name</label>
            <input
              id="new-callout-name"
              className="input admin-row-input"
              type="text"
              value={calloutName}
              onChange={(e) => setCalloutName(e.target.value)}
            />
            <button type="button" className="btn btn-small" disabled={!calloutName.trim()} onClick={() => setMode('callout')}>
              Place callout
            </button>
            <button type="button" className="btn btn-small" onClick={() => setMode('from')}>
              Add lineup
            </button>
            {mode !== 'idle' && (
              <button type="button" className="btn btn-small" onClick={cancelMode}>
                Cancel
              </button>
            )}
          </div>
          <p className="muted" role="status">
            {HINTS[mode](calloutName)}
          </p>
          <MapStage
            map={form}
            selectedId={selectedKey}
            onSelect={setSelectedKey}
            showCallouts
            kind=""
            onStageClick={mode === 'idle' ? undefined : handleStageClick}
          />

          {selected && (
            <section className="card stack">
              <h3>Selected lineup</h3>
              <Field label="Title" error={fieldErrors[`lineups.${form.lineups.indexOf(selected)}.title`]}>
                <input type="text" value={selected.title} onChange={(e) => updateSelected('title', e.target.value)} />
              </Field>
              <Field label="Kind">
                <select value={selected.kind} onChange={(e) => updateSelected('kind', e.target.value)}>
                  {LINEUP_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Steps" error={fieldErrors[`lineups.${form.lineups.indexOf(selected)}.steps`]}>
                <textarea rows={6} value={selected.steps} onChange={(e) => updateSelected('steps', e.target.value)} />
                <span className="muted">Numbered steps, then one sentence on what it achieves.</span>
              </Field>
              <p>
                <button
                  type="button"
                  className="btn btn-small btn-danger"
                  onClick={() => {
                    set('lineups', form.lineups.filter((lineup) => lineup.key !== selectedKey));
                    setSelectedKey(null);
                  }}
                >
                  Delete this lineup
                </button>
              </p>
            </section>
          )}

          <h3>Callouts</h3>
          {form.callouts.length === 0 ? (
            <p className="muted">No callouts yet.</p>
          ) : (
            <ul>
              {form.callouts.map((callout) => (
                <li key={callout.key} className="row">
                  {callout.name}
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    aria-label={`Remove callout ${callout.name}`}
                    onClick={() => set('callouts', form.callouts.filter((c) => c.key !== callout.key))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3>Lineups</h3>
          {form.lineups.length === 0 ? (
            <p className="muted">No lineups yet.</p>
          ) : (
            <div className="row">
              {form.lineups.map((lineup) => (
                <button
                  key={lineup.key}
                  type="button"
                  className="btn btn-small"
                  aria-pressed={lineup.key === selectedKey}
                  onClick={() => setSelectedKey(lineup.key)}
                >
                  {lineup.title}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save map'}
        </button>
        <Link to="/admin/maps">Cancel</Link>
      </div>
      {saved && (
        <p className="alert alert-ok" role="status">
          Saved.
        </p>
      )}
    </form>
  );
}

export default function AdminMapEditPage() {
  const { id } = useParams();
  const location = useLocation();
  const { catalog, error: catalogError, reload } = useCatalog();
  // The catalog only lists id, name and slug; the full map comes from the public map endpoint.
  // Straight after creating, the catalog may not have reloaded yet; the server's copy from the save fills that gap.
  const found = id && catalog ? (catalog.maps.find((m) => m.id === id) ?? location.state?.map ?? null) : null;
  const { data, error } = useApi(found ? `/maps/${found.slug}` : null);
  const notFound = Boolean(id && catalog && !found) || error?.status === 404;
  usePageTitle(notFound ? 'Page not found' : id ? 'Admin: edit map' : 'Admin: new map');

  const loadError = catalogError || error;
  if (notFound) return <NotFoundPage />;
  if (loadError) {
    return (
      <div className="container">
        <p className="alert alert-error" role="alert">
          {loadError.message}
        </p>
      </div>
    );
  }
  if (!catalog || (id && !data)) return <p className="container muted">Loading…</p>;

  return (
    <div className="container stack">
      <AdminNav />
      <h1>{id ? 'Edit map' : 'New map'}</h1>
      <MapForm key={id ?? 'new'} catalog={catalog} map={data?.map} reloadCatalog={reload} />
    </div>
  );
}
