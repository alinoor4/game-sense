# 02 — Phase 0: install the starter and learn what it contains

Goal: the project folder contains the starter, everything installs, `npm run check` passes, and you know what each given file does so you can build on it without rewriting it.

## Steps

1. **Check the tools.** Run `node --version` (must be 22 or higher) and `npm --version`. If Node is older than 22, stop and report.

2. **Copy the starter into the project root.** The project root is the folder that contains `plan/`. Copy the *contents* of `plan/starter/` (including the hidden `.gitignore`) into the project root, so that `package.json`, `eslint.config.js`, `server/` and `client/` sit next to `plan/`.

   From the project root, in Git Bash: `cp -r plan/starter/. .`
   In PowerShell: `Copy-Item -Path plan\starter\* -Destination . -Recurse -Force; Copy-Item plan\starter\.gitignore .`

   Verify: the project root now contains `package.json`, `package-lock.json`, `eslint.config.js`, `.gitignore`, `server/`, `client/`, `plan/`. Do not delete `plan/starter/`; it stays as the pristine reference.

3. **Start git.** If the project root is not a git repository yet, run `git init`. Commit nothing yet.

4. **Install.** From the project root run `npm run install:all`. It installs three folders in turn (root, `server`, `client`) using the lock files, so you get the exact tested versions. This may take several minutes. Verify: `node_modules` exists in the root, in `server/` and in `client/`.

5. **Create the environment file.** Copy `server/.env.example` to `server/.env`. Leave `MONGODB_URI` empty. Set `JWT_SECRET` to any long random string (for example 40 random letters and digits).

6. **Run the full check.** From the project root: `npm run check`.
   - Expect: ESLint prints nothing; server tests report `pass 17`, `fail 0`; client tests report `pass 25`, `fail 0`; Vite prints `✓ built`.
   - First run only: it may sit silent for 10 to 15 minutes while MongoDB downloads (see README, "Things that will surprise you"). Wait.

7. **Seed and look at it.**
   1. `npm run seed`. Expect: `Seeded 4 games, 3 lessons, 1 maps.` and the two demo accounts.
   2. Start the API: `npm --prefix server run dev`. Expect: `API listening on http://127.0.0.1:5000`. (If it says the port is reserved or in use, follow the README: change `PORT` in `server/.env`.)
   3. Start the website in a second terminal: `npm --prefix client run dev`.
   4. Read the address the website command printed (`Local: http://127.0.0.1:<port>/`; on this machine usually port 3000) and open it. This is "the site address" from now on. Expect the site header (GameSense, Tracks, Tools, Search, Log in, Sign up) and a page headed "Game Sense starter" with a green box: `Catalog loaded: 4 games, 3 lessons, 1 maps.`, plus two keyboard keys and a code block with a Copy button. Press Ctrl+K: the search palette opens; typing `strafe` lists "Counter-Strafing".
   5. Open `<site address>/api/catalog`. Expect JSON with `games`, `lessons`, `maps`. (This also proves the website forwards `/api` to the API.)

8. **Read the starter.** Open every file listed in the tour below and read it once. You will call these functions in every later phase.

9. **Commit:** `git add -A` then `git commit -m "phase 0: starter"`. Verify with `git status` that `node_modules`, `server/.data` and `server/.env` are **not** in the commit.

## Tour of the starter

### Root

| File | What it is |
|------|-----------|
| `package.json` | Helper scripts (`check`, `lint`, `test`, `build`, `seed`, `install:all`) and ESLint |
| `eslint.config.js` | Lint rules: Node globals for `server/`, browser globals + React rules for `client/src/` |

### Server (complete; you will not write server code)

| File | What it does |
|------|--------------|
| `src/server.js` | Entry point: connects the database, starts listening |
| `src/app.js` | `createApp()`: security headers, JSON body parsing, cookies, `loadUser`, all routes, 404, error handler. In production it also serves `client/dist` |
| `src/config.js` | Reads `server/.env` and exposes `config` (`port`, `mongoUri`, `jwtSecret`, `isProd`, `isTest`) |
| `src/db.js` | `connectDb()` / `disconnectDb()`. Starts the private MongoDB when `MONGODB_URI` is empty |
| `src/constants.js` | Shared constant lists (same content as the client's copy) |
| `src/util.js` | `pick(body, keys)` and `isId(value)` |
| `src/middleware/auth.js` | Cookie + JWT: `setAuthCookie`, `clearAuthCookie`, `loadUser`, `requireAuth`, `requireAdmin` |
| `src/middleware/error.js` | `HttpError`, `notFound`, `errorHandler` (turns every error into the JSON error shape) |
| `src/models/*.js` | `User`, `Game`, `Lesson`, `GameMap` exactly as in `01-spec.md` section 4 |
| `src/routes/auth.js` | `/api/auth/*` |
| `src/routes/content.js` | `/api/catalog`, `/api/lessons/:gameSlug/:lessonSlug`, `/api/maps/:slug` |
| `src/routes/me.js` | `/api/me/profile`, `/api/me/progress/:lessonId` |
| `src/routes/admin.js` | `/api/admin/*` |
| `src/seed/run.js` | The seed script. Reads `games.js`, `maps.js` and every file under `seed/lessons/` |
| `testkit.js`, `test/*.test.js` | API tests. Read `test/admin.test.js` to see real request and response examples for every admin endpoint |

### Client

| File | What it gives you |
|------|-------------------|
| `vite.config.js` | Dev server on `127.0.0.1`, on the first usable port of 5173, 3000, 4173, 8080, 8000, 3333. Forwards `/api` to the API port read from `server/.env` |
| `src/main.jsx` | Mounts `<App />` inside `BrowserRouter`, `AuthProvider`, `CatalogProvider`; imports `styles.css`. Finished |
| `src/App.jsx` | **Placeholder.** You replace it in phase 2 |
| `src/styles.css` | The whole design system (see `01-spec.md` section 7) |
| `src/lib/api.js` | `api(method, path, body)` and `ApiError` |
| `src/hooks/useApi.js` | `useApi(path)` → `{ data, error, loading, reload }` for GET requests |
| `src/context/AuthContext.jsx` | `useAuth()` → `{ user, loading, setUser, login, register, logout }` |
| `src/context/CatalogContext.jsx` | `useCatalog()` → `{ catalog, loading, error, reload }` |
| `src/hooks/usePageTitle.js` | `usePageTitle('Tools')` sets the tab title |
| `src/components/Layout.jsx` | Header (brand, navigation, search, login state), `<main>` with `<Outlet />`, footer. Finished |
| `src/components/SearchPalette.jsx` | The Search button and the Ctrl+K palette. Finished |
| `src/components/RequireAuth.jsx` | Route wrapper: redirects logged-out visitors to `/login` |
| `src/components/RequireAdmin.jsx` | Route wrapper: shows "Page not found" to non-admins |
| `src/components/Field.jsx` | `<Field label="Email" error={error?.fields.email}><input … /></Field>` |
| `src/pages/NotFoundPage.jsx` | The "Page not found" page. Finished |
| `src/components/Markdown.jsx` | `<Markdown>{text}</Markdown>`: safe Markdown, Copy button on code blocks, `` `key:A` `` renders as a keyboard key |
| `src/lib/browser.js` | `cssVar(name)`, `downloadText(filename, text)`, `setupCanvas(canvas, w, h)`, `canvasPoint(canvas, event, w, h)` |
| `src/lib/constants.js` | `GENRES`, `DIFFICULTIES`, `WEAKNESSES`, `SKILLS`, `SKILL_LABELS`, `DEMOS`, `DEMO_LABELS`, `LINEUP_KINDS`, `DRILL_TOOLS`, `SLUG_PATTERN` |
| `src/lib/catalog.js` | `gameBySlug`, `gameById`, `sectionsWithLessons`, `orderedLessons`, `neighbours`, `progressOfGame`, `searchLessons`, `tierForRank`, `recommendLessons` |
| `src/lib/sensitivity.js` | `SENS_GAMES`, `convertSensitivity`, `edpi`, `cmPer360` |
| `src/lib/crosshair.js` | `DEFAULT_CROSSHAIR`, `CROSSHAIR_LIMITS`, `hexToRgb`, `crosshairRects`, `cs2Commands`, `valorantSettings` |
| `src/lib/routine.js` | `generateRoutine`, `routineToText` |
| `src/lib/quiz.js` | `QUESTIONS`, `scoreQuiz` |
| `src/lib/peek.js` | `PEEK_DEFAULTS`, `peekAdvantage`, `sightThresholds` |
| `src/lib/*.test.js` | Unit tests for the files above. They double as usage examples |

### The patterns you will reuse on every page

**Loading data (GET):**

```jsx
const { data, error, loading } = useApi(`/maps/${mapSlug}`);
if (loading) return <p className="muted">Loading…</p>;
if (error) return <p className="alert alert-error" role="alert">{error.message}</p>;
const { map } = data;
```

**Sending data (POST / PUT / PATCH / DELETE) from a form:**

```jsx
const [saving, setSaving] = useState(false);
const [error, setError] = useState(null); // an ApiError or null

async function onSubmit(event) {
  event.preventDefault();
  setSaving(true);
  setError(null);
  try {
    const data = await api('PATCH', '/me/profile', { weakness });
    setUser(data.user);
  } catch (err) {
    setError(err);
  } finally {
    setSaving(false);
  }
}
// in the JSX:
// {error && <p className="alert alert-error" role="alert">{error.message}</p>}
// under a field:  {error?.fields.weakness && <span className="error-text">{error.fields.weakness}</span>}
```

**Paths:** `api()` and `useApi()` take the path **without** `/api`: `api('GET', '/catalog')`.

**The user object** always comes back whole from the server. After any request that returns `{ user }`, call `setUser(data.user)`. After `PUT`/`DELETE /me/progress/...`, which return `{ completedLessons }`, call `setUser({ ...user, completedLessons: data.completedLessons })`.

## Done when

- [ ] `npm run check` passes (17 server tests, 25 client tests, build succeeds, no lint output).
- [ ] `npm run seed` prints `Seeded 4 games, 3 lessons, 1 maps.`
- [ ] The site address shows the green "Catalog loaded" box.
- [ ] You have read every file in the tour.
- [ ] One commit exists: `phase 0: starter`.
