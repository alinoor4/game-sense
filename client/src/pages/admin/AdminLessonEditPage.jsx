import { useEffect, useId, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi.js';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { api } from '../../lib/api.js';
import { gameById } from '../../lib/catalog.js';
import { DEMOS, DEMO_LABELS, DIFFICULTIES, DRILL_TOOLS, SKILLS, SKILL_LABELS } from '../../lib/constants.js';
import { slugify } from '../../lib/slug.js';
import AdminNav from '../../components/AdminNav.jsx';
import Field from '../../components/Field.jsx';
import FormError from '../../components/FormError.jsx';
import Markdown from '../../components/Markdown.jsx';
import NotFoundPage from '../NotFoundPage.jsx';

function initialForm(catalog, lesson) {
  if (lesson) {
    return {
      ...lesson,
      drills: lesson.drills.map((drill) => ({ ...drill, key: drill.id })),
    };
  }
  const game = catalog.games[0];
  return {
    game: game?.id ?? '',
    section: game?.sections[0]?.id ?? '',
    title: '',
    slug: '',
    summary: '',
    body: '',
    order: 0,
    difficulty: 'beginner',
    skill: '',
    demo: '',
    clipUrl: '',
    playlistCode: '',
    published: false,
    drills: [],
  };
}

const viewPath = (catalog, lesson) => `/games/${gameById(catalog, lesson.game)?.slug}/${lesson.slug}`;

function LessonForm({ catalog, lesson, reloadCatalog }) {
  const navigate = useNavigate();
  const location = useLocation();
  const uid = useId();
  const [form, setForm] = useState(() => initialForm(catalog, lesson));
  const [view, setView] = useState(lesson ? viewPath(catalog, lesson) : null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(location.state?.saved));
  const [error, setError] = useState(null);
  const fieldErrors = error?.fields || {};
  const sections = gameById(catalog, form.game)?.sections ?? [];

  // "Saved." after a create should show once, not again when the page is refreshed.
  useEffect(() => {
    if (location.state?.saved) navigate(location.pathname, { replace: true, state: { ...location.state, saved: false } });
  }, [location, navigate]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function setDrill(index, key, value) {
    set('drills', form.drills.map((drill, i) => (i === index ? { ...drill, [key]: value } : drill)));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const payload = {
      game: form.game,
      section: form.section,
      title: form.title,
      slug: form.slug,
      summary: form.summary,
      body: form.body,
      order: Number(form.order),
      difficulty: form.difficulty,
      skill: form.skill,
      demo: form.demo,
      clipUrl: form.clipUrl,
      playlistCode: form.playlistCode,
      published: form.published,
      drills: form.drills.map(({ name, tool, minutes }) => ({ name, tool, minutes: Number(minutes) })),
    };
    try {
      if (lesson) {
        const data = await api('PUT', `/admin/lessons/${lesson.id}`, payload);
        setView(viewPath(catalog, data.lesson));
        setSaved(true);
        reloadCatalog();
      } else {
        const data = await api('POST', '/admin/lessons', payload);
        reloadCatalog();
        navigate(`/admin/lessons/${data.lesson.id}`, { replace: true, state: { saved: true } });
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
      {view && (
        <p>
          <Link to={view}>View lesson</Link>
        </p>
      )}
      <div className="form-grid">
        <Field label="Game" error={fieldErrors.game}>
          <select
            value={form.game}
            onChange={(e) => {
              set('game', e.target.value);
              set('section', gameById(catalog, e.target.value)?.sections[0]?.id ?? '');
            }}
          >
            {catalog.games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </Field>
        {sections.length > 0 ? (
          <Field label="Section" error={fieldErrors.section}>
            <select value={form.section} onChange={(e) => set('section', e.target.value)}>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <p className="alert alert-error">This game has no sections yet. Add one under Games.</p>
        )}
        <Field label="Title" error={fieldErrors.title}>
          <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <div>
          <Field label="Slug" error={fieldErrors.slug}>
            <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)} />
          </Field>
          <button type="button" className="btn btn-small" onClick={() => set('slug', slugify(form.title))}>
            Generate from title
          </button>
        </div>
      </div>
      <Field label="Summary" error={fieldErrors.summary}>
        <textarea rows={2} maxLength={200} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
        <span className="muted">{form.summary.length}/200</span>
      </Field>
      <div className="form-grid">
        <Field label="Difficulty" error={fieldErrors.difficulty}>
          <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Skill" error={fieldErrors.skill}>
          <select value={form.skill} onChange={(e) => set('skill', e.target.value)}>
            <option value="">None</option>
            {SKILLS.map((s) => (
              <option key={s} value={s}>
                {SKILL_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Interactive demo" error={fieldErrors.demo}>
          <select value={form.demo} onChange={(e) => set('demo', e.target.value)}>
            <option value="">None</option>
            {DEMOS.map((d) => (
              <option key={d} value={d}>
                {DEMO_LABELS[d]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Order" error={fieldErrors.order}>
          <input type="number" value={form.order} onChange={(e) => set('order', e.target.value)} />
          <span className="muted">Lower numbers come first inside a section.</span>
        </Field>
        <Field label="Clip URL (optional)" error={fieldErrors.clipUrl}>
          <input type="text" value={form.clipUrl} onChange={(e) => set('clipUrl', e.target.value)} />
          <span className="muted">An https link ending in .webm or .mp4</span>
        </Field>
        <Field label="Playlist code (optional)" error={fieldErrors.playlistCode}>
          <input type="text" value={form.playlistCode} onChange={(e) => set('playlistCode', e.target.value)} />
          <span className="muted">A real Aimlabs or KovaaK&apos;s share code. Leave empty if you do not have one.</span>
        </Field>
      </div>
      <div>
        <label className="row">
          <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
          Published
        </label>
        <p className="muted">Drafts are visible to admins only.</p>
      </div>

      <h2>Practice drills</h2>
      {form.drills.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Drill name</th>
                <th>Tool</th>
                <th>Minutes</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {form.drills.map((drill, i) => (
                <tr key={drill.key}>
                  <td>
                    <label className="sr-only" htmlFor={`${uid}-name-${i}`}>
                      Drill {i + 1} name
                    </label>
                    <input id={`${uid}-name-${i}`} className="input" type="text" value={drill.name} onChange={(e) => setDrill(i, 'name', e.target.value)} />
                  </td>
                  <td>
                    <label className="sr-only" htmlFor={`${uid}-tool-${i}`}>
                      Drill {i + 1} tool
                    </label>
                    <select id={`${uid}-tool-${i}`} className="input" value={drill.tool} onChange={(e) => setDrill(i, 'tool', e.target.value)}>
                      {DRILL_TOOLS.map((tool) => (
                        <option key={tool} value={tool}>
                          {tool}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <label className="sr-only" htmlFor={`${uid}-minutes-${i}`}>
                      Drill {i + 1} minutes
                    </label>
                    <input
                      id={`${uid}-minutes-${i}`}
                      className="input"
                      type="number"
                      min={1}
                      max={120}
                      value={drill.minutes}
                      onChange={(e) => setDrill(i, 'minutes', e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => set('drills', form.drills.filter((_, j) => j !== i))}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p>
        <button
          type="button"
          className="btn btn-small"
          onClick={() => set('drills', [...form.drills, { key: crypto.randomUUID(), name: '', tool: 'In-game', minutes: 5 }])}
        >
          Add drill
        </button>
      </p>

      <h2>Lesson body (Markdown)</h2>
      <div className="grid admin-split">
        <div>
          <Field label="Body" error={fieldErrors.body}>
            <textarea rows={24} value={form.body} onChange={(e) => set('body', e.target.value)} />
          </Field>
          <p className="muted">
            Use ## headings. Keys: <code>key:A</code>. Commands: a fenced code block.
          </p>
        </div>
        <section className="card">
          <h2>Preview</h2>
          <Markdown>{form.body}</Markdown>
        </section>
      </div>

      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={saving || sections.length === 0}>
          {saving ? 'Saving…' : 'Save lesson'}
        </button>
        <Link to="/admin">Cancel</Link>
      </div>
      {saved && (
        <p className="alert alert-ok" role="status">
          Saved.
        </p>
      )}
    </form>
  );
}

export default function AdminLessonEditPage() {
  const { id } = useParams();
  const { catalog, error: catalogError, reload: reloadCatalog } = useCatalog();
  const { data, error } = useApi(id ? `/admin/lessons/${id}` : null);
  const notFound = error?.status === 404;
  // NotFoundPage sets this title too, but a parent's effect runs after its child's and would overwrite it.
  usePageTitle(notFound ? 'Page not found' : id ? 'Admin: edit lesson' : 'Admin: new lesson');

  if (notFound) return <NotFoundPage />;
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
  if (!catalog || (id && !data)) return <p className="container muted">Loading…</p>;

  return (
    <div className="container stack">
      <AdminNav />
      <h1>{id ? 'Edit lesson' : 'New lesson'}</h1>
      {/* key: a new lesson becomes an edited one after its first save; start that form fresh from the server copy. */}
      <LessonForm key={id ?? 'new'} catalog={catalog} lesson={data?.lesson} reloadCatalog={reloadCatalog} />
    </div>
  );
}
