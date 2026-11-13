# 06 — Phase 8: admin panel

The admin API already exists and is tested. `server/test/admin.test.js` shows a real request and response for every endpoint; read it before you start. Log in as `admin@gamesense.test` for this phase.

All admin pages live in `client/src/pages/admin/`. They are reachable only through the `RequireAdmin` route wrapper (already in `App.jsx`'s final shape).

**After every successful create, update or delete of a lesson, game or map, call `reload()` from `useCatalog()`** so the public pages and sidebars show the change.

## Step 8.1 — Three small shared pieces

**`components/AdminNav.jsx`** — rendered at the top of every admin page:

```jsx
import { NavLink } from 'react-router-dom';

export default function AdminNav() {
  return (
    <nav className="site-nav" aria-label="Admin">
      <NavLink to="/admin" end>Lessons</NavLink>
      <NavLink to="/admin/games">Games</NavLink>
      <NavLink to="/admin/maps">Maps</NavLink>
      <NavLink to="/admin/users">Users</NavLink>
    </nav>
  );
}
```

**`components/FormError.jsx`** — shows an `ApiError` completely, including field errors such as `drills.0.name` that have no single input to sit under:

```jsx
// error: an ApiError or null
export default function FormError({ error }) {
  if (!error) return null;
  const fields = Object.entries(error.fields);
  return (
    <div className="alert alert-error" role="alert">
      <p>{error.message}</p>
      {fields.length > 0 && (
        <ul>
          {fields.map(([name, message]) => (
            <li key={name}>
              <strong>{name}:</strong> {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**`lib/slug.js`** and **`lib/slug.test.js`**:

```js
// "Counter-Strafing 101!" -> "counter-strafing-101"
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './slug.js';
import { SLUG_PATTERN } from './constants.js';

test('slugify produces valid slugs', () => {
  assert.equal(slugify('Counter-Strafing 101!'), 'counter-strafing-101');
  assert.equal(slugify('  AK-47 & M4  '), 'ak-47-m4');
  assert.match(slugify('Peeker’s Advantage'), SLUG_PATTERN);
  assert.equal(slugify('!!!'), '');
});
```

Every admin form below follows the same skeleton: `<AdminNav />`, `<h1>`, `<form className="stack" onSubmit>`, `<FormError error={error} />` at the top of the form, the fields, then a `.row` with the save button (`btn btn-primary`, "Save …" / "Saving…") and a "Cancel" link back to the list. After a successful save show `<p className="alert alert-ok" role="status">Saved.</p>`.

Every "Slug" field has, next to it, a `btn btn-small` "Generate from title/name" that sets the slug to `slugify(title)`.

## Step 8.2 — `AdminLessonsPage.jsx` (route `/admin`)

Title `Admin: lessons`. Data: `useApi('/admin/lessons')` and the catalog (for game and section names).

- `<AdminNav />`, `<h1>Lessons</h1>`, a `.row.row-between` with a "Game" filter `<select>` (`All games` + each game) and a `btn btn-primary` link "New lesson" → `/admin/lessons/new`.
- A table in `.table-wrap`: Title (link to `/admin/lessons/<id>`), Game, Section, Difficulty, Status, Actions.
  - Status: `<span className="badge badge-accent">Published</span>` or `<span className="badge badge-warn">Draft</span>`.
  - Actions: "View" link to `/games/<game slug>/<lesson slug>` (drafts are viewable by admins too) and a `btn btn-small btn-danger` "Delete".
- Sort rows by game name, then by `order`.
- Delete: `window.confirm('Delete "<title>"? This cannot be undone.')`, then `api('DELETE', `/admin/lessons/${id}`)`, then reload both this list (`reload` from `useApi`) and the catalog. Show a failure in an alert above the table.
- Empty state: `No lessons yet.`

## Step 8.3 — `AdminLessonEditPage.jsx` (routes `/admin/lessons/new` and `/admin/lessons/:id`)

Title `Admin: new lesson` / `Admin: edit lesson`. `const { id } = useParams()`; editing when `id` is set: load with `useApi(id ? `/admin/lessons/${id}` : null)` and copy the lesson into the form state **once** when it arrives (a `useEffect` on `data`).

Form state `form`, with these defaults for a new lesson:

```js
{ game: firstGameId, section: firstSectionIdOfThatGame, title: '', slug: '', summary: '', body: '',
  order: 0, difficulty: 'beginner', skill: '', demo: '', clipUrl: '', playlistCode: '', published: false, drills: [] }
```

Fields (use `.form-grid` for the short ones):

| Label | Control | Notes |
|-------|---------|-------|
| Game | select of catalog games | on change, set `section` to the new game's first section id |
| Section | select of the chosen game's sections | if the game has no sections show `This game has no sections yet. Add one under Games.` and disable Save |
| Title | text | |
| Slug | text + "Generate from title" | |
| Summary | `<textarea rows={2} maxLength={200}>` | show `{length}/200` muted |
| Difficulty | select of `DIFFICULTIES` | |
| Skill | select: `None` (`''`) + `SKILLS` labelled with `SKILL_LABELS` | |
| Interactive demo | select: `None` (`''`) + `DEMOS` labelled with `DEMO_LABELS` | |
| Order | number | lower numbers come first inside a section |
| Clip URL (optional) | text | hint: `An https link ending in .webm or .mp4` |
| Playlist code (optional) | text | hint: `A real Aimlabs or KovaaK's share code. Leave empty if you do not have one.` |
| Published | checkbox | hint: `Drafts are visible to admins only.` |

**Drills editor** (`<h2>Practice drills</h2>`): one row per drill with "Drill name" (text), "Tool" (select of `DRILL_TOOLS`), "Minutes" (number 1–120) and a `btn btn-small btn-danger` "Remove". Under the rows a `btn btn-small` "Add drill" that appends `{ name: '', tool: 'In-game', minutes: 5 }`. Every input needs a label; use `<label className="sr-only">` for inputs inside the rows and a visible header row.

**Body** (`<h2>Lesson body (Markdown)</h2>`): two columns using `.grid` — left a `Field` with `<textarea rows={24}>`, right a `card` headed `Preview` containing `<Markdown>{form.body}</Markdown>`. Under the textarea a muted hint: ``Use ## headings. Keys: `key:A`. Commands: a fenced code block.``

Save: send exactly these keys (convert `order` and each drill's `minutes` with `Number()`; send drills as `{ name, tool, minutes }` without ids):
`game, section, title, slug, summary, body, order, difficulty, skill, demo, clipUrl, playlistCode, published, drills`
- new: `api('POST', '/admin/lessons', body)` → `navigate(`/admin/lessons/${data.lesson.id}`, { replace: true })`
- edit: `api('PUT', `/admin/lessons/${id}`, body)` → stay, show "Saved."
- both: reload the catalog.

When editing, also show a link "View lesson" to the public page.

## Step 8.4 — `AdminGamesPage.jsx` and `AdminGameEditPage.jsx`

**List** (`/admin/games`, title `Admin: games`): rows come straight from the catalog. Columns: Name (link to `/admin/games/<id>`), Slug, Genre, Sections (count), Lessons (count of **published** lessons, from `progressOfGame(...).total`), Actions ("Delete"). Button "New game". Delete uses confirm → `api('DELETE', `/admin/games/${id}`)` → reload catalog. A 409 arrives as `Delete this game's lessons and maps first`: show it in the alert.

**Edit** (`/admin/games/new`, `/admin/games/:id`): when editing, initialise the form **once** from `gameById(catalog, id)`; if the catalog is loaded and the game is missing → `<NotFoundPage />`.

| Label | Control | Notes |
|-------|---------|-------|
| Name | text | |
| Slug | text + "Generate from name" | |
| Description | `<textarea rows={3} maxLength={300}>` | |
| Genre | select of `GENRES` (`fps` → "Shooter", `fighting` → "Fighting") | |
| Fundamentals track | checkbox | hint: `Tick for a game-agnostic track. Its lessons are recommended to players of every game in this genre.` |
| Order | number | position on the home page |
| Ranks | `<textarea rows={6}>` | hint: `One rank per line, lowest first. Leave empty for no ranks.` Split on newlines, trim, drop empty lines when saving; join with `\n` when loading |

**Sections editor** (`<h2>Sections</h2>`): state is an array of `{ id, key, title }`. Existing sections keep their `id`; new ones have `id: undefined`. `key` is only for React: use the id for existing ones and `crypto.randomUUID()` for new ones.
- Each row: a text input (label `Section title`, `sr-only`), and three `btn btn-small` buttons: "Up" (disabled on the first row), "Down" (disabled on the last), "Remove".
- "Add section" appends an empty row.
- Hint under the list: `A section that still contains lessons cannot be removed.`

Save body: `{ name, slug, description, genre, isFundamentals, order: Number(order), ranks: [...], sections: sections.map((s) => (s.id ? { id: s.id, title: s.title } : { title: s.title })) }`.
- new: `POST /admin/games` → navigate to `/admin/games/<new id>`; edit: `PUT /admin/games/<id>` → after success, **re-initialise the sections state from `data.game.sections`** so new sections get their real ids.
- reload the catalog.
- A 409 such as `Move or delete the lessons in "Aiming" first` appears through `FormError`.

## Step 8.5 — `AdminMapsPage.jsx` and `AdminMapEditPage.jsx`

**List** (`/admin/maps`, title `Admin: maps`): rows from `catalog.maps`. Columns: Name (link to `/admin/maps/<id>`), Game, Actions ("View" → `/tools/lineups/<slug>`, "Delete"). Button "New map".

**Edit** (`/admin/maps/new`, `/admin/maps/:id`): the catalog only has a map's id, name and slug, so when editing: find the map in `catalog.maps` by `id`, then load everything with `useApi(found ? `/maps/${found.slug}` : null)` and copy it into the form state once. Not found → `<NotFoundPage />`.

Form state: `{ game, name, slug, imageUrl, callouts: [], lineups: [] }`. Give every callout and lineup held in state a `key` (`item.id` for loaded ones, `crypto.randomUUID()` for new ones).

Top fields: Game (select), Name, Slug (+ generate), Image URL with the hint ``Either /maps/<file> for an image you placed in client/public/maps/, or an https link. Use a square image. Only use images you made or have permission to use.``

**Map editor** (`<h2>Callouts and lineups</h2>`), shown only when `imageUrl` is not empty. State: `mode` (`'idle'`, `'callout'`, `'from'`, `'to'`), `pendingFrom` (a point or `null`), `calloutName` (string), `selectedKey`.

Controls above the stage, in a `.row`:
- text input "New callout name" + `btn btn-small` "Place callout" (disabled while the name is empty) → `mode = 'callout'`
- `btn btn-small` "Add lineup" → `mode = 'from'`
- `btn btn-small` "Cancel" (only when `mode !== 'idle'`) → `mode = 'idle'`, `pendingFrom = null`

A hint line with `role="status"` that always says what a click will do:
- idle: `Select a marker to edit it, or choose an action above.`
- callout: `Click the map where "{calloutName}" belongs.`
- from: `Click where the player stands.`
- to: `Now click where it lands.`

The stage: `<MapStage map={form} selectedId={selectedKey} onSelect={setSelectedKey} showCallouts kind="" onStageClick={mode === 'idle' ? undefined : handleStageClick} />`

`handleStageClick({ x, y })`:
- `callout` → append `{ key, name: calloutName.trim(), x, y }`, clear `calloutName`, `mode = 'idle'`
- `from` → `pendingFrom = { x, y }`, `mode = 'to'`
- `to` → append `{ key, title: 'New lineup', kind: 'smoke', from: pendingFrom, to: { x, y }, steps: '' }`, select it, `pendingFrom = null`, `mode = 'idle'`

Below the stage:
- **Selected lineup** (`card`, only when one is selected): "Title" (text), "Kind" (select of `LINEUP_KINDS`), "Steps" (`<textarea rows={6}>`, hint `Numbered steps, then one sentence on what it achieves.`), and a `btn btn-small btn-danger` "Delete this lineup". Edits update the lineup inside `form.lineups` immediately.
- **Callouts** list: each name with a `btn btn-small btn-danger` "Remove".
- **Lineups** list: each title as a `btn btn-small` that selects it.

Save body: `{ game, name, slug, imageUrl, callouts: callouts.map(({ name, x, y }) => ({ name, x, y })), lineups: lineups.map(({ title, kind, from, to, steps }) => ({ title, kind, from: { x: from.x, y: from.y }, to: { x: to.x, y: to.y }, steps })) }`.
- new: `POST /admin/maps` → navigate to `/admin/maps/<new id>`; edit: `PUT /admin/maps/<id>` → show "Saved.".
- reload the catalog.
- A lineup without steps is rejected by the server (`lineups.0.steps: Steps are required`); `FormError` shows it.

## Step 8.6 — `AdminUsersPage.jsx`

Title `Admin: users`. Data: `useApi('/admin/users')`. `const { user: me } = useAuth()`.

Table: Name, Email, Role, Joined (`new Date(createdAt).toLocaleDateString()`), Actions.
- Role: a `<select>` (`user`, `admin`) with an `aria-label` of `Role of <name>`. On change → `api('PATCH', `/admin/users/${id}`, { role })` → `reload()`. Disabled for your own row.
- Actions: `btn btn-small btn-danger` "Delete" → confirm → `api('DELETE', …)` → `reload()`. Disabled for your own row.
- Your own row shows a `<span className="badge">You</span>` next to the name.
- Errors in an alert above the table.

## Verify phase 8

1. `npm run check` passes (including the new `slug.test.js`, so client tests report `pass 26`).
2. As the demo player, `/admin` shows "Page not found" and the header has no Admin link. As admin, it shows the lessons table with 33 rows.
3. Create a lesson: game Valorant, section Gunplay, title "Test Lesson", generate the slug, summary, a body with a `##` heading and a code block, one drill, leave Published off → saved, appears as Draft, is **not** in the Valorant sidebar, but "View" shows it with a Draft badge.
4. Tick Published and save → it appears in the sidebar and in Ctrl+K search without reloading the page.
5. Save a lesson with an empty title → the red box lists `title: Title is required`.
6. Games: add a section "Test Section" to Valorant, move it up, save → the track page shows the new order once a lesson is in it. Move "Test Lesson" into it, then try to remove that section → the 409 message appears. Delete the lesson, remove the section, save → works.
7. Maps: create a map "Test Map" using image `/maps/training-yard.svg`, place one callout and one lineup (two clicks), fill in its steps, save → it opens correctly at `/tools/lineups/test-map`. Delete it afterwards.
8. Users: promote the demo player to admin and back; your own row's controls are disabled.
9. Finally run `npm run seed` (stop the API first) to restore the clean seed content.

**Done when** all nine checks pass. Commit `phase 8: admin panel`.
