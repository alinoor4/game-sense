# 01 — Specification (reference for every phase)

## 1. What the product is

A visitor picks a **game track**, reads short **lessons** grouped into **sections** in a left sidebar (like W3Schools), and uses **tools** that let them try the idea immediately. A registered user also gets a skill **quiz**, a personal **dashboard** with recommended lessons, **progress** tracking and a **daily routine**. An **admin** manages all content from an admin panel.

Feature list (each maps to a phase):

| Feature | Where |
|---------|-------|
| The whole API, database, login cookies, seed script | Starter (phase 0) |
| Lesson content: 4 tracks, 33 lessons | Phase 1 |
| Header, search palette opened with Ctrl+K, route guards | Starter (phase 0) |
| Register, log in, log out pages | Phase 2 |
| Game tracks → sections → lessons, sidebar navigation, previous/next | Phase 3 |
| Lesson body in Markdown, copy button on every code block, keyboard-key rendering, optional looping clip, optional drill list with download, mark as complete | Phase 3 |
| Onboarding: choose game, current rank, target rank, then an 8-question diagnostic quiz that finds the weakest skill | Phase 4 |
| Dashboard: recommended lessons, progress per track, today's routine | Phase 4 |
| Sensitivity / eDPI / cm-per-360 converter | Phase 5 |
| Crosshair generator with CS2 console commands and Valorant settings | Phase 5 |
| Daily routine generator | Phase 5 |
| Aim trainer (flick mode and tracking mode) | Phase 6 |
| Peek-advantage demo, counter-strafe demo, crosshair-path comparison | Phase 6 |
| Lineup maps: clickable callouts and grenade lineups | Phase 7 |
| Admin: lessons, games (with sections and ranks), maps (callouts and lineups), users | Phase 8 |
| Production mode, project README | Phase 9 |

## 2. Repository layout

The finished project looks exactly like this. Lines marked `S` come ready-made from the starter (phase 0); you create the rest. Do not add other top-level folders.

```
Game Sense/
├─ plan/                      (this plan; never edit except ticking phases in plan.md)
├─ package.json               S (root: lint + helper scripts)
├─ eslint.config.js           S
├─ .gitignore                 S
├─ README.md                  (written in phase 9)
├─ server/                    S (everything in it; you only add lesson files in phase 1)
│  ├─ package.json
│  ├─ .env.example
│  ├─ src/
│  │  ├─ server.js            (entry: connect DB, listen)
│  │  ├─ app.js               (createApp(): middleware + routes)
│  │  ├─ config.js
│  │  ├─ db.js
│  │  ├─ constants.js
│  │  ├─ util.js              (pick)
│  │  ├─ middleware/auth.js
│  │  ├─ middleware/error.js
│  │  ├─ models/options.js
│  │  ├─ models/User.js
│  │  ├─ models/Game.js
│  │  ├─ models/Lesson.js
│  │  ├─ models/GameMap.js
│  │  ├─ routes/auth.js
│  │  ├─ routes/content.js    (catalog, lesson, map)
│  │  ├─ routes/me.js
│  │  ├─ routes/admin.js
│  │  └─ seed/
│  │     ├─ run.js
│  │     ├─ games.js
│  │     ├─ maps.js
│  │     └─ lessons/<game slug>/<NN>-<lesson slug>.md   (one Markdown file per lesson)
│  ├─ testkit.js              (test helpers; NOT inside test/, or the runner would run it as a test)
│  └─ test/
│     ├─ auth.test.js
│     ├─ content.test.js
│     ├─ me.test.js
│     └─ admin.test.js
└─ client/
   ├─ package.json            S
   ├─ vite.config.js          S
   ├─ index.html              S
   ├─ public/
   │  ├─ favicon.svg          S
   │  └─ maps/training-yard.svg   S
   └─ src/
      ├─ main.jsx             S
      ├─ App.jsx              S placeholder; you replace it in phase 2 (all routes)
      ├─ styles.css           S
      ├─ lib/                 (no React in here: plain functions)
      │  ├─ api.js            S
      │  ├─ browser.js        S (cssVar, downloadText, setupCanvas, canvasPoint)
      │  ├─ constants.js      S
      │  ├─ catalog.js        S (pure helpers over the catalog)
      │  ├─ sensitivity.js    S
      │  ├─ crosshair.js      S
      │  ├─ routine.js        S
      │  ├─ quiz.js           S
      │  ├─ peek.js           S
      │  ├─ *.test.js         S (one per logic file above)
      │  ├─ tools.js          (phase 3)
      │  └─ slug.js, slug.test.js   (phase 8)
      ├─ context/
      │  ├─ AuthContext.jsx   S
      │  └─ CatalogContext.jsx    S
      ├─ hooks/
      │  ├─ useApi.js         S
      │  └─ usePageTitle.js   S
      ├─ components/
      │  ├─ Layout.jsx, SearchPalette.jsx, RequireAuth.jsx, RequireAdmin.jsx, Field.jsx, Markdown.jsx   S
      │  ├─ Sidebar.jsx       (phase 3)
      │  ├─ MapStage.jsx      (phase 7)
      │  └─ AdminNav.jsx, FormError.jsx   (phase 8)
      ├─ demos/               (phase 6: AimTrainer, PeekAdvantage, CounterStrafe, CrosshairCompare, LessonDemo)
      └─ pages/               (one file per route; NotFoundPage.jsx is S; admin pages in pages/admin/)
```

## 3. Shared constants

`server/src/constants.js` and `client/src/lib/constants.js` contain the **same** values. Both come with the starter; shown here for reference:

```js
export const GENRES = ['fps', 'fighting'];

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

// The four skills the quiz can diagnose.
export const WEAKNESSES = ['precision', 'recoil', 'movement', 'decision'];

// Every skill a lesson can be tagged with.
export const SKILLS = [...WEAKNESSES, 'setup', 'mental'];

export const SKILL_LABELS = {
  precision: 'Raw precision',
  recoil: 'Recoil control',
  movement: 'Movement sync',
  decision: 'Decision-making under pressure',
  setup: 'Hardware and setup',
  mental: 'Mental game and review',
};

// Interactive demo a lesson can embed. '' means none.
export const DEMOS = ['aim-trainer', 'peek-advantage', 'counter-strafe', 'crosshair-compare'];

export const DEMO_LABELS = {
  'aim-trainer': 'Aim trainer',
  'peek-advantage': 'Peek advantage model',
  'counter-strafe': 'Counter-strafe timing',
  'crosshair-compare': 'Crosshair path comparison',
};

export const LINEUP_KINDS = ['smoke', 'flash', 'molotov', 'grenade', 'ability'];

export const DRILL_TOOLS = ['Aimlabs', "KovaaK's", 'In-game', 'Game Sense'];

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
```

A **slug** is lowercase letters, digits and single hyphens, for example `counter-strafing`.

## 4. Data models (MongoDB via Mongoose)

Four collections. Every schema uses `schemaOptions` from `models/options.js` (in the starter), which adds `createdAt`/`updatedAt` and makes JSON output use a string `id` instead of `_id`. Subdocuments (sections, callouts, lineups, drills) come out with **both** `id` and `_id`; client code uses `id` only and ignores `_id`.

Notation: **req** = required. Every String has `trim: true` unless it is `body`, `steps` or `passwordHash`.

### 4.1 User

| Field | Type | Rules |
|-------|------|-------|
| `name` | String | req, 2–50 chars |
| `email` | String | req, unique, lowercase, max 254, must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `passwordHash` | String | req, `select: false` |
| `role` | String | `'user'` or `'admin'`, default `'user'` |
| `profile.game` | ObjectId ref `Game` | default `null` |
| `profile.currentRank` | String | default `''`, max 40 |
| `profile.targetRank` | String | default `''`, max 40 |
| `profile.weakness` | String | `''` or one of `WEAKNESSES`, default `''` |
| `profile.dailyMinutes` | Number | integer 30–480, default 145 |
| `completedLessons` | [ObjectId ref `Lesson`] | default `[]` |

### 4.2 Game (a track)

| Field | Type | Rules |
|-------|------|-------|
| `name` | String | req, 2–60 chars |
| `slug` | String | req, unique, matches `SLUG_PATTERN`, max 60 |
| `description` | String | req, max 300 |
| `genre` | String | req, one of `GENRES` |
| `isFundamentals` | Boolean | default `false`. `true` = game-agnostic track whose lessons apply to every game of that genre |
| `ranks` | [String] | lowest rank first. May be empty. Each max 40 chars |
| `sections` | [{ `title`: String req max 60 }] | array order = display order. Each element gets its own id |
| `order` | Number | default 0. Tracks are listed by `order`, then `name` |

### 4.3 Lesson

| Field | Type | Rules |
|-------|------|-------|
| `game` | ObjectId ref `Game` | req, indexed |
| `section` | ObjectId | req. Must be the id of one of that game's `sections` (checked in the route, not the schema) |
| `title` | String | req, 2–100 chars |
| `slug` | String | req, matches `SLUG_PATTERN`, max 100. Unique **per game**: `lessonSchema.index({ game: 1, slug: 1 }, { unique: true })` |
| `summary` | String | req, max 200. One sentence shown in lists and search |
| `body` | String | req, max 20000. Markdown |
| `order` | Number | default 0. Lessons in a section are sorted by `order`, then `title` |
| `difficulty` | String | req, one of `DIFFICULTIES` |
| `skill` | String | `''` or one of `SKILLS`, default `''` |
| `demo` | String | `''` or one of `DEMOS`, default `''` |
| `clipUrl` | String | default `''`. If not empty must match `/^https:\/\/\S+\.(webm|mp4)$/`, max 500 |
| `drills` | [{ `name`: String req max 80, `tool`: one of `DRILL_TOOLS` req, `minutes`: integer 1–120 req }] | default `[]` |
| `playlistCode` | String | default `''`, max 100. A real Aimlabs/KovaaK's share code an admin may paste. Seed data leaves it empty |
| `published` | Boolean | default `false`. Unpublished lessons are visible to admins only |

### 4.4 GameMap (the model is named `GameMap` because `Map` is a JavaScript built-in)

Positions are fractions of the map image: `x` 0 = left edge, 1 = right edge; `y` 0 = top, 1 = bottom. Define one reusable sub-schema `point = { x: Number req min 0 max 1, y: Number req min 0 max 1 }` with `_id: false`.

| Field | Type | Rules |
|-------|------|-------|
| `game` | ObjectId ref `Game` | req |
| `name` | String | req, 2–60 chars |
| `slug` | String | req, unique, matches `SLUG_PATTERN`, max 60 |
| `imageUrl` | String | req, max 500, must match `/^(\/maps\/[a-z0-9-]+\.(svg|png|jpg|webp)|https:\/\/\S+)$/` |
| `callouts` | [{ `name`: String req max 40, `x`, `y` (same rules as point) }] | default `[]` |
| `lineups` | [{ `title`: String req max 80, `kind`: one of `LINEUP_KINDS` req, `from`: point req, `to`: point req, `steps`: String req max 1000 }] | default `[]`. `from` = where the player stands, `to` = where the utility lands. The field is called `kind`, never `type` (`type` is a reserved word in Mongoose schemas) |

## 5. API contract

Base path `/api`. Requests and responses are JSON. Authentication is an httpOnly cookie named `gs_token` holding a JWT; the browser sends it automatically.

**Error shape, always:** `{ "error": { "message": "text", "fields": { "fieldName": "text" } } }`. `fields` is present only for validation errors.

**Status codes:** 200 OK, 201 created, 204 no content, 400 validation or malformed input, 401 not logged in, 403 logged in but not admin, 404 not found, 409 conflict (duplicate, or delete blocked), 429 rate limited, 500 server error.

**User object** (wherever a response says `user`): `{ id, name, email, role, profile: { game, currentRank, targetRank, weakness, dailyMinutes }, completedLessons: [ids], createdAt, updatedAt }`. `profile.game` is a game id string or `null`. Never `passwordHash`.

The server in the starter already implements everything in this section. You only call it.

### 5.1 Auth — `routes/auth.js`

| Method & path | Body | Success | Errors |
|---------------|------|---------|--------|
| POST `/api/auth/register` | `{ name, email, password }` | 201 `{ user }`, sets cookie | 400 (password not 8–72 chars, bad name/email), 409 (email taken) |
| POST `/api/auth/login` | `{ email, password }` | 200 `{ user }`, sets cookie | 401 `Wrong email or password` |
| POST `/api/auth/logout` | — | 204, clears cookie | — |
| GET `/api/auth/me` | — | 200 `{ user }` | 401 |

### 5.2 Content, public — `routes/content.js`

**GET `/api/catalog`** → 200. The whole content tree without lesson bodies. The client loads it once and derives the home page, sidebars, search, recommendations and progress from it.

```json
{
  "games": [
    { "id": "…", "name": "Valorant", "slug": "valorant", "description": "…", "genre": "fps",
      "isFundamentals": false, "ranks": ["Iron", "…"], "order": 2,
      "sections": [ { "id": "…", "title": "Gun Guides" } ] }
  ],
  "lessons": [
    { "id": "…", "game": "<game id>", "section": "<section id>", "title": "…", "slug": "…",
      "summary": "…", "order": 1, "difficulty": "beginner", "skill": "precision", "demo": "" }
  ],
  "maps": [ { "id": "…", "game": "<game id>", "name": "Training Yard", "slug": "training-yard" } ]
}
```

- `games` sorted by `order` then `name`. `lessons`: **published only**, sorted by `order` then `title`. `maps` sorted by `name`.
- Lessons carry exactly those ten fields (use `.select()`); maps exactly those four.

**GET `/api/lessons/:gameSlug/:lessonSlug`** → 200 `{ lesson }` with every Lesson field. 404 if the game or lesson does not exist, or if the lesson is unpublished and the requester is not an admin.

**GET `/api/maps/:slug`** → 200 `{ map }` with every GameMap field. 404 if missing.

### 5.3 Current user — `routes/me.js`. All require login (401 otherwise).

| Method & path | Body | Success | Errors |
|---------------|------|---------|--------|
| PATCH `/api/me/profile` | any of `{ game, currentRank, targetRank, weakness, dailyMinutes }` | 200 `{ user }` | 400 see below |
| PUT `/api/me/progress/:lessonId` | — | 200 `{ completedLessons }` | 404 if no published lesson has that id |
| DELETE `/api/me/progress/:lessonId` | — | 200 `{ completedLessons }` | — |

PATCH rules: only the five listed keys are read. `game` is a game id or `null`; an id that matches no game → 400 with `fields.game`. After applying the changes, if the profile has a game whose `ranks` is not empty, then `currentRank` and `targetRank` must each be `''` or one of that game's ranks, else 400 with `fields.currentRank` / `fields.targetRank`. `weakness` and `dailyMinutes` are validated by the schema. PUT progress is idempotent (marking twice keeps one entry; use `$addToSet`-like logic).

### 5.4 Admin — `routes/admin.js`. All require an admin (401 not logged in, 403 not admin).

| Method & path | Body | Success | Errors |
|---------------|------|---------|--------|
| GET `/api/admin/lessons` | — | 200 `{ lessons }`: **all** lessons (published or not), the ten catalog fields plus `published` | |
| GET `/api/admin/lessons/:id` | — | 200 `{ lesson }` full | 404 |
| POST `/api/admin/lessons` | lesson fields | 201 `{ lesson }` | 400, 409 (slug taken in that game) |
| PUT `/api/admin/lessons/:id` | lesson fields | 200 `{ lesson }` | 400, 404, 409 |
| DELETE `/api/admin/lessons/:id` | — | 204. Also removes the id from every user's `completedLessons` | 404 |
| POST `/api/admin/games` | game fields | 201 `{ game }` | 400, 409 (slug taken) |
| PUT `/api/admin/games/:id` | game fields | 200 `{ game }` | 400, 404, 409 |
| DELETE `/api/admin/games/:id` | — | 204 | 404, 409 `Delete this game's lessons and maps first` if any lesson or map references it |
| POST `/api/admin/maps` | map fields | 201 `{ map }` | 400, 409 |
| PUT `/api/admin/maps/:id` | map fields | 200 `{ map }` | 400, 404, 409 |
| DELETE `/api/admin/maps/:id` | — | 204 | 404 |
| GET `/api/admin/users` | — | 200 `{ users }` sorted by `createdAt` descending | |
| PATCH `/api/admin/users/:id` | `{ role }` | 200 `{ user }` | 400 (bad role; or changing your own role: `You cannot change your own role`), 404 |
| DELETE `/api/admin/users/:id` | — | 204 | 400 `You cannot delete your own account`, 404 |

Allowed body fields (everything else in the body is ignored):

- lesson: `game, section, title, slug, summary, body, order, difficulty, skill, demo, clipUrl, drills, playlistCode, published`
- game: `name, slug, description, genre, isFundamentals, ranks, sections, order`
- map: `game, name, slug, imageUrl, callouts, lineups`

Extra rules:

- **Lesson create/update:** load the lesson's game; if it does not exist → 400 `fields.game = 'Game not found'`. If `section` is not the id of one of that game's sections → 400 `fields.section = 'Section does not belong to this game'`.
- **Game update with `sections`:** each incoming section is `{ id?, title }`. A section with an `id` keeps that id (map `id` to `_id` before assigning). A section without `id` is new. If any existing section id is missing from the incoming list **and** at least one lesson references it → 409 `Move or delete the lessons in "<section title>" first`.
- **Map create/update:** if `game` matches no game → 400 `fields.game = 'Game not found'`.

## 6. Client routes

All routes live in `client/src/App.jsx`. `Layout` = header + footer wrapper. "Auth" = redirect to `/login` if not logged in. "Admin" = show the Not Found page if not an admin.

| Path | Page component (file in `pages/`) | Access |
|------|-----------------------------------|--------|
| `/` | `HomePage` | public |
| `/games/:gameSlug` | `GamePage` (track overview) | public |
| `/games/:gameSlug/:lessonSlug` | `LessonPage` | public |
| `/tools` | `ToolsPage` (index of tools) | public |
| `/tools/sensitivity` | `SensitivityPage` | public |
| `/tools/crosshair` | `CrosshairPage` | public |
| `/tools/aim-trainer` | `AimTrainerPage` | public |
| `/tools/routine` | `RoutinePage` | public |
| `/tools/lineups` | `LineupsPage` (list of maps) | public |
| `/tools/lineups/:mapSlug` | `LineupMapPage` | public |
| `/login` | `LoginPage` | public |
| `/register` | `RegisterPage` | public |
| `/onboarding` | `OnboardingPage` | Auth |
| `/dashboard` | `DashboardPage` | Auth |
| `/admin` | `admin/AdminLessonsPage` | Admin |
| `/admin/lessons/new`, `/admin/lessons/:id` | `admin/AdminLessonEditPage` | Admin |
| `/admin/games` | `admin/AdminGamesPage` | Admin |
| `/admin/games/new`, `/admin/games/:id` | `admin/AdminGameEditPage` | Admin |
| `/admin/maps` | `admin/AdminMapsPage` | Admin |
| `/admin/maps/new`, `/admin/maps/:id` | `admin/AdminMapEditPage` | Admin |
| `/admin/users` | `admin/AdminUsersPage` | Admin |
| `*` | `NotFoundPage` | public |

Every page calls `usePageTitle('<Page name>')` (from `hooks/usePageTitle.js`), which sets the tab title to `<Page name> · Game Sense`.

## 7. Design system

Dark, high-contrast, no decoration. One accent colour. The complete stylesheet is below; the starter already contains it as `client/src/styles.css`. Use only these classes. If a page needs a layout that these classes cannot express, add a small rule at the bottom of this file under a comment naming the page; do not use inline `style` except for values computed at runtime (marker positions, progress widths, canvas sizes).

```css
:root {
  --bg: #0b0e14;
  --surface: #131822;
  --surface-2: #1b2230;
  --border: #2a3344;
  --text: #e8edf5;
  --muted: #9aa7bb;
  --accent: #3ddc97;
  --accent-ink: #06231a;
  --danger: #ff6b6b;
  --warn: #ffc857;
  --radius: 8px;
  --font: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, 'Cascadia Code', Consolas, 'Courier New', monospace;
  color-scheme: dark;
}

*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: 16px;
  line-height: 1.6;
}

h1, h2, h3 { line-height: 1.25; margin: 0 0 0.5em; }
h1 { font-size: 2rem; }
h2 { font-size: 1.4rem; margin-top: 1.6em; }
h3 { font-size: 1.1rem; margin-top: 1.2em; }
p { margin: 0 0 1em; }
a { color: var(--accent); }
a:hover { text-decoration: none; }
img, video, canvas { max-width: 100%; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.sr-only {
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap;
}
.muted { color: var(--muted); }
.error-text { color: var(--danger); }
.stack > * + * { margin-top: 1rem; }
.row { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
.row-between { justify-content: space-between; }

/* ---------- page frame ---------- */
.site-header {
  position: sticky; top: 0; z-index: 10;
  display: flex; flex-wrap: wrap; align-items: center; gap: 1rem;
  padding: 0.6rem 1rem;
  background: var(--surface); border-bottom: 1px solid var(--border);
}
.brand { font-weight: 700; font-size: 1.15rem; color: var(--text); text-decoration: none; }
.brand span { color: var(--accent); }
.site-nav { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-right: auto; }
.site-nav a, .sidebar a {
  display: block; padding: 0.35rem 0.6rem; border-radius: 6px;
  color: var(--muted); text-decoration: none;
}
.site-nav a:hover, .sidebar a:hover { color: var(--text); background: var(--surface-2); }
.site-nav a.active, .sidebar a.active { color: var(--accent-ink); background: var(--accent); }
.site-footer { padding: 2rem 1rem; text-align: center; color: var(--muted); border-top: 1px solid var(--border); margin-top: 3rem; }
.container { max-width: 1100px; margin: 0 auto; padding: 1.5rem 1rem; }
.container-narrow { max-width: 480px; }

/* ---------- lesson layout ---------- */
.layout { display: grid; grid-template-columns: 270px minmax(0, 1fr); align-items: start; }
.sidebar {
  position: sticky; top: 3.4rem; max-height: calc(100vh - 3.4rem); overflow-y: auto;
  padding: 1rem; border-right: 1px solid var(--border);
}
.sidebar h2 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin: 1.2em 0 0.3em; }
.sidebar ul { list-style: none; margin: 0; padding: 0; }
.sidebar .done::after { content: ' ✓'; }
.content { padding: 1.5rem; max-width: 820px; }
@media (max-width: 800px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: static; max-height: 40vh; border-right: 0; border-bottom: 1px solid var(--border); }
}

/* ---------- components ---------- */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.5rem 0.95rem; border: 1px solid var(--border); border-radius: 6px;
  background: var(--surface-2); color: var(--text);
  font: inherit; text-decoration: none; cursor: pointer;
}
.btn:hover { border-color: var(--muted); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); font-weight: 600; }
.btn-danger { color: var(--danger); border-color: var(--danger); background: transparent; }
.btn-small { padding: 0.2rem 0.55rem; font-size: 0.85rem; }

.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.1rem; }
a.card { display: block; color: inherit; text-decoration: none; }
a.card:hover { border-color: var(--accent); }
.card h3 { margin-top: 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }

.badge {
  display: inline-block; padding: 0.05rem 0.5rem; border-radius: 999px;
  font-size: 0.75rem; border: 1px solid var(--border); color: var(--muted);
}
.badge-accent { color: var(--accent); border-color: var(--accent); }
.badge-warn { color: var(--warn); border-color: var(--warn); }

.field { display: block; margin-bottom: 1rem; }
.field > span, .field > label { display: block; margin-bottom: 0.3rem; font-size: 0.9rem; color: var(--muted); }
.input, .field input, .field select, .field textarea {
  width: 100%; padding: 0.5rem 0.65rem; border: 1px solid var(--border); border-radius: 6px;
  background: var(--bg); color: var(--text); font: inherit;
}
.field textarea { min-height: 8rem; font-family: var(--mono); font-size: 0.9rem; resize: vertical; }
.field input[type='checkbox'], .field input[type='radio'], .field input[type='range'], .field input[type='color'] { width: auto; }
.field .error-text { display: block; margin-top: 0.25rem; font-size: 0.85rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0 1rem; }

.alert { padding: 0.7rem 0.9rem; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); }
.alert-error { border-color: var(--danger); color: var(--danger); }
.alert-ok { border-color: var(--accent); color: var(--accent); }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.5rem 0.6rem; text-align: left; border-bottom: 1px solid var(--border); vertical-align: top; }
th { color: var(--muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; }

.progress { height: 8px; background: var(--surface-2); border-radius: 999px; overflow: hidden; }
.progress > div { height: 100%; background: var(--accent); }

.stat { font-family: var(--mono); font-size: 1.6rem; color: var(--accent); }
.stat-label { font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }

kbd {
  display: inline-block; min-width: 1.7em; padding: 0.05rem 0.4rem; text-align: center;
  font-family: var(--mono); font-size: 0.85em;
  background: var(--surface-2); border: 1px solid var(--border); border-bottom-width: 3px; border-radius: 5px;
}
kbd.pressed { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }

/* ---------- lesson prose (Markdown output) ---------- */
.prose code { font-family: var(--mono); font-size: 0.9em; background: var(--surface-2); padding: 0.1em 0.35em; border-radius: 4px; }
.prose ul, .prose ol { padding-left: 1.4rem; margin: 0 0 1em; }
.prose blockquote { margin: 0 0 1em; padding: 0.2rem 1rem; border-left: 3px solid var(--accent); color: var(--muted); }
.prose table { margin-bottom: 1em; }
.codeblock { position: relative; margin: 0 0 1em; }
.codeblock pre { margin: 0; padding: 0.9rem 1rem; padding-right: 5rem; overflow-x: auto; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
.codeblock pre code { background: none; padding: 0; font-family: var(--mono); font-size: 0.9rem; }
.codeblock-copy { position: absolute; top: 0.5rem; right: 0.5rem; }

/* ---------- demos and tools ---------- */
.demo { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; margin: 1.5rem 0; }
.demo canvas { display: block; width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; touch-action: none; }
.demo-stats { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 0.8rem; }

/* ---------- search palette ---------- */
dialog.palette { width: min(560px, 92vw); padding: 0; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); color: var(--text); }
dialog.palette::backdrop { background: rgba(0, 0, 0, 0.6); }
.palette input { width: 100%; padding: 0.9rem 1rem; border: 0; border-bottom: 1px solid var(--border); background: transparent; color: var(--text); font: inherit; }
.palette ul { list-style: none; margin: 0; padding: 0.4rem; max-height: 50vh; overflow-y: auto; }
.palette li.muted { padding: 0.5rem 0.6rem; }
.palette li a { display: block; padding: 0.5rem 0.6rem; border-radius: 6px; color: var(--text); text-decoration: none; }
.palette li[aria-selected='true'] a, .palette li a:hover { background: var(--surface-2); }

/* ---------- lineup map ---------- */
.map-stage { position: relative; width: 100%; max-width: 640px; aspect-ratio: 1 / 1; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--surface); }
.map-stage img, .map-stage svg.map-lines { position: absolute; inset: 0; width: 100%; height: 100%; }
.map-stage svg.map-lines { pointer-events: none; }
.map-marker {
  position: absolute; transform: translate(-50%, -50%);
  width: 22px; height: 22px; padding: 0; border-radius: 50%;
  border: 2px solid var(--bg); background: var(--accent); cursor: pointer;
}
.map-marker.from { background: var(--warn); border-radius: 4px; }
.map-marker.selected { outline: 3px solid var(--text); }
.map-callout {
  position: absolute; transform: translate(-50%, -50%);
  padding: 0 0.35rem; font-size: 0.75rem; border-radius: 4px;
  background: rgba(11, 14, 20, 0.8); color: var(--text); border: 1px solid var(--border);
}
.map-stage.editing { cursor: crosshair; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

### UI text and behaviour conventions

- Buttons say what they do: "Save lesson", "Delete", "Mark as complete". Loading state: the button is `disabled` and its text becomes "Saving…".
- Destructive actions ask `window.confirm('Delete "<name>"? This cannot be undone.')` first.
- Loading state of a page: `<p className="muted">Loading…</p>`. Error state: `<p className="alert alert-error" role="alert">{message}</p>`.
- Success after saving: `<p className="alert alert-ok" role="status">Saved.</p>`.
- Dates: `new Date(value).toLocaleDateString()`.
- Canvas drawing colours: read them from the stylesheet so they match, with `cssVar('--accent')` from `lib/browser.js`.
