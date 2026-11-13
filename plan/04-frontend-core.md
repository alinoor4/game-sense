# 04 — Phases 2, 3 and 4: the core website

Before you start: both dev servers running, database seeded with 33 lessons, and you are logged out.

General rules for every page in this file and the following ones:

- One page = one file in `client/src/pages/`, default export, name from the route table in `01-spec.md` section 6.
- First line inside every page component: `usePageTitle('…')` (from `hooks/usePageTitle.js`).
- Wrap page content in `<div className="container">` unless the page uses the sidebar layout (`.layout`).
- Use the loading / error / form patterns from `02-starter.md` exactly.
- Use only classes from `styles.css`.

---

# Phase 2 — App shell and auth pages

The starter already contains `Layout`, `SearchPalette`, `RequireAuth`, `RequireAdmin`, `Field` and `NotFoundPage`. Read them first.

## Step 2.1 — Replace `client/src/App.jsx`

This is the final shape of the file. **Add each import and its `<Route>` only in the phase where you create that page**, so the build never references a file that does not exist. At the end of phase 8 the file matches this exactly.

```jsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';
import HomePage from './pages/HomePage.jsx';
import GamePage from './pages/GamePage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import ToolsPage from './pages/ToolsPage.jsx';
import SensitivityPage from './pages/SensitivityPage.jsx';
import CrosshairPage from './pages/CrosshairPage.jsx';
import AimTrainerPage from './pages/AimTrainerPage.jsx';
import RoutinePage from './pages/RoutinePage.jsx';
import LineupsPage from './pages/LineupsPage.jsx';
import LineupMapPage from './pages/LineupMapPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AdminLessonsPage from './pages/admin/AdminLessonsPage.jsx';
import AdminLessonEditPage from './pages/admin/AdminLessonEditPage.jsx';
import AdminGamesPage from './pages/admin/AdminGamesPage.jsx';
import AdminGameEditPage from './pages/admin/AdminGameEditPage.jsx';
import AdminMapsPage from './pages/admin/AdminMapsPage.jsx';
import AdminMapEditPage from './pages/admin/AdminMapEditPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/:gameSlug" element={<GamePage />} />
        <Route path="/games/:gameSlug/:lessonSlug" element={<LessonPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/sensitivity" element={<SensitivityPage />} />
        <Route path="/tools/crosshair" element={<CrosshairPage />} />
        <Route path="/tools/aim-trainer" element={<AimTrainerPage />} />
        <Route path="/tools/routine" element={<RoutinePage />} />
        <Route path="/tools/lineups" element={<LineupsPage />} />
        <Route path="/tools/lineups/:mapSlug" element={<LineupMapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLessonsPage />} />
          <Route path="/admin/lessons/new" element={<AdminLessonEditPage />} />
          <Route path="/admin/lessons/:id" element={<AdminLessonEditPage />} />
          <Route path="/admin/games" element={<AdminGamesPage />} />
          <Route path="/admin/games/new" element={<AdminGameEditPage />} />
          <Route path="/admin/games/:id" element={<AdminGameEditPage />} />
          <Route path="/admin/maps" element={<AdminMapsPage />} />
          <Route path="/admin/maps/new" element={<AdminMapEditPage />} />
          <Route path="/admin/maps/:id" element={<AdminMapEditPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
```

For phase 2 the file contains only: `Layout`, `RequireAuth`, `LoginPage`, `RegisterPage`, `NotFoundPage`, and a temporary `/` route that renders `<NotFoundPage />` (you replace it in step 3.2). Delete the `StarterCheck` placeholder entirely.

## Step 2.2 — `pages/LoginPage.jsx`

- Title: `Log in`. Container: `<div className="container container-narrow stack">`.
- If `useAuth().user` is already set: `return <Navigate to="/dashboard" replace />`.
- `<h1>Log in</h1>`, then a `<form>` with two `Field`s:
  - "Email": `<input type="email" required autoComplete="email">`
  - "Password": `<input type="password" required autoComplete="current-password">`
- Submit button: `btn btn-primary`, text `Log in` / `Logging in…` while saving.
- On submit: `await login(email, password)`, then `navigate(location.state?.from || '/dashboard', { replace: true })`.
- On error show `error.message` in an `alert alert-error`.
- Below the form: `No account yet? <Link to="/register">Sign up</Link>`.
- Below that, a muted line: `Demo accounts are listed in the README.` (Do not print passwords on the page.)

## Step 2.3 — `pages/RegisterPage.jsx`

- Title: `Sign up`. Same narrow container.
- If already logged in: `<Navigate to="/dashboard" replace />`.
- Fields: "Name" (`type="text" required minLength={2} maxLength={50} autoComplete="name"`), "Email" (`type="email" required autoComplete="email"`), "Password" (`type="password" required minLength={8} maxLength={72} autoComplete="new-password"`), with the hint text `8 to 72 characters.` as a muted line under the password field.
- Each `Field` gets `error={error?.fields.name}` (and `.email`, `.password`).
- Submit: `Create account` / `Creating…`. On success: `navigate('/onboarding', { replace: true })`.
- A 409 comes back with the message `email already exists`; show `error.message` in the alert as usual.
- Below: `Already have an account? <Link to="/login">Log in</Link>`.

## Verify phase 2

1. `npm run check` passes.
2. In the browser: the header shows the brand, "Tracks", "Tools", a Search button, "Log in", "Sign up".
3. Sign up with a new email → you land on `/onboarding`, which shows "Page not found" for now (the page comes in phase 4). The header now shows your name, "Dashboard" and "Log out".
4. Log out → header shows "Log in" again. Log in as `admin@gamesense.test` → the header also shows "Admin".
5. Wrong password → the red alert says `Wrong email or password`.
6. Sign up with a 3-character password is blocked by the browser; sign up with an existing email shows the red alert.
7. Press Ctrl+K → the search palette opens; type `strafe` → "Counter-Strafing" is listed; Escape closes it.

**Done when** all seven checks pass. Commit `phase 2: app shell and auth pages`.

---

# Phase 3 — Home, track page, lesson page

## Step 3.1 — `client/src/lib/tools.js`

One list, used by the home page and the tools index:

```js
export const TOOLS = [
  { path: '/tools/sensitivity', title: 'Sensitivity Converter', description: 'Convert your sensitivity between games and see your eDPI and cm/360.' },
  { path: '/tools/aim-trainer', title: 'Aim Trainer', description: 'A quick flick or tracking drill, right in the browser.' },
  { path: '/tools/crosshair', title: 'Crosshair Generator', description: 'Design a crosshair and copy the settings for CS2 or Valorant.' },
  { path: '/tools/routine', title: 'Daily Routine', description: 'Turn the time you have today into a four-block training plan.' },
  { path: '/tools/lineups', title: 'Lineup Maps', description: 'Clickable maps with callouts and grenade lineups.' },
];
```

## Step 3.2 — `pages/HomePage.jsx`

Title: `Learn to play better`. Uses `useCatalog()` and `useAuth()`. Show the loading and error states of the catalog. Layout, top to bottom, inside `container stack`:

1. **Hero.** `<h1>The W3Schools of competitive gaming.</h1>` and a paragraph: `Short lessons, in order, with something to try on every page. Pick a track and start at lesson one.` Then a `.row` with two buttons:
   - `btn btn-primary`, text `Start with <first game name>`, link to `/games/<catalog.games[0].slug>` (render it only if there is at least one game).
   - `btn`, text `Find my weak spot`, link to `/onboarding` if logged in, otherwise `/register`.
2. **`<h2>Tracks</h2>`** then `<div className="grid">` with one `<Link className="card">` per game → `/games/<slug>`. Inside each card:
   - `<h3>{game.name}</h3>`
   - badges: `<span className="badge">{game.genre === 'fps' ? 'Shooter' : 'Fighting'}</span>`, plus `<span className="badge badge-accent">Fundamentals</span>` when `game.isFundamentals`
   - `<p className="muted">{game.description}</p>`
   - `<p>{total} lessons</p>` where `total` comes from `progressOfGame(catalog, game, completed)`
   - when logged in: `<div className="progress"><div style={{ width: `${percent}%` }} /></div>` and a muted `{done} of {total} done`
   - `completed` is `user?.completedLessons || []`
3. **`<h2>Tools</h2>`** then a `.grid` of `<Link className="card">` for each entry of `TOOLS`: `<h3>` title, muted description.

## Step 3.3 — `components/Sidebar.jsx`

Props: `game` (a catalog game object). Uses `useCatalog()` and `useAuth()`.

```
<nav className="sidebar" aria-label={`${game.name} lessons`}>
  <Link to={`/games/${game.slug}`}><strong>{game.name}</strong></Link>
  for each { section, lessons } of sectionsWithLessons(catalog, game), skipping sections with no lessons:
    <h2>{section.title}</h2>
    <ul>
      <li key={lesson.id}>
        <NavLink to={`/games/${game.slug}/${lesson.slug}`} className={done ? 'done' : undefined}>{lesson.title}</NavLink>
```

`done` is true when `user?.completedLessons.includes(lesson.id)`. `NavLink` adds the `active` class by itself; because you pass a string `className`, write it as a function so both classes apply: `className={({ isActive }) => [isActive && 'active', done && 'done'].filter(Boolean).join(' ') || undefined}`.

## Step 3.4 — `pages/GamePage.jsx`

Title: the game's name. `const { gameSlug } = useParams()`. Catalog loading/error states first. `const game = gameBySlug(catalog, gameSlug)`; if `null` → `return <NotFoundPage />`.

```
<div className="layout">
  <Sidebar game={game} />
  <div className="content stack">
    <h1>{game.name}</h1>
    <p className="muted">{game.description}</p>
    (logged in) progress bar + "{done} of {total} lessons done"
    (if catalog.maps has maps with map.game === game.id) <p><Link to="/tools/lineups">Lineup maps for this track</Link></p>
    for each section with lessons:
      <h2>{section.title}</h2>
      <div className="grid">
        <Link className="card" to lesson> <h3>{lesson.title}{done ? ' ✓' : ''}</h3>
          <span className="badge">{lesson.difficulty}</span> <span className="badge">{SKILL_LABELS[lesson.skill]}</span> (only if skill is set)
          <p className="muted">{lesson.summary}</p>
```

If the game has no lessons at all, show `<p className="muted">No lessons yet.</p>`.

## Step 3.5 — `pages/LessonPage.jsx`

`const { gameSlug, lessonSlug } = useParams()`.
Data: `const { data, error, loading } = useApi(`/lessons/${gameSlug}/${lessonSlug}`)`, plus `useCatalog()` and `useAuth()`.

Order of checks: catalog loading or lesson loading → "Loading…"; catalog error → alert; `error?.status === 404` or game not found → `<NotFoundPage />`; other `error` → alert.

Title: the lesson title (pass `data?.lesson.title` so it updates when loaded). Scroll to the top when the lesson changes: `useEffect(() => { window.scrollTo(0, 0); }, [lessonSlug]);`

Render:

```
<div className="layout">
  <Sidebar game={game} />
  <article className="content">
    <p className="muted"><Link to={`/games/${game.slug}`}>{game.name}</Link> › {section title}</p>
    <h1>{lesson.title}</h1>
    <p className="row">
      <span className="badge">{lesson.difficulty}</span>
      {lesson.skill && <span className="badge">{SKILL_LABELS[lesson.skill]}</span>}
      {!lesson.published && <span className="badge badge-warn">Draft</span>}
    </p>
    <p className="muted">{lesson.summary}</p>
    {lesson.clipUrl && <video src={lesson.clipUrl} autoPlay loop muted playsInline controls aria-label={`Clip: ${lesson.title}`} />}
    <Markdown>{lesson.body}</Markdown>
    (phase 6 adds the demo here)
    <DrillList lesson={lesson} />
    <CompleteButton lesson={lesson} />
    <nav className="row row-between" aria-label="Lesson navigation"> prev link | next link </nav>
  </article>
</div>
```

- Section title: `game.sections.find((s) => s.id === lesson.section)?.title`.
- Prev/next: `neighbours(catalog, game, lesson.id)`. Render `← {prev.title}` and `{next.title} →` as `btn` links; render an empty `<span />` in place of a missing one so the other stays on its side.

Two small components in the same file (not exported):

**`DrillList`** — returns `null` if `lesson.drills.length === 0`. Otherwise a `card stack`:
- `<h2>Practice routine</h2>`
- a table inside `.table-wrap` with columns Drill, Tool, Minutes; a last row `Total` with the sum
- if `lesson.playlistCode` is not empty: `Playlist code: <code>{playlistCode}</code>` and a `btn btn-small` "Copy" that calls `navigator.clipboard.writeText(lesson.playlistCode)`
- a `btn` "Download routine (.txt)" calling `downloadText(`${lesson.slug}-routine.txt`, text)` from `lib/browser.js`, where `text` is the lesson title, a blank line, then one line per drill: `[ 10 min ] Sixshot (Aimlabs)`

**`CompleteButton`** — uses `useAuth()`:
- logged out: `<p className="muted"><Link to="/login">Log in</Link> to track your progress.</p>`
- logged in, not completed: `btn btn-primary` "Mark as complete" → `api('PUT', `/me/progress/${lesson.id}`)`
- logged in, completed: `<span className="badge badge-accent">Completed ✓</span>` and a `btn btn-small` "Undo" → `api('DELETE', …)`
- after either call: `setUser({ ...user, completedLessons: data.completedLessons })`. Disable the button while the request runs. On error show the message in an alert.
- An unpublished lesson (admin preview) cannot be completed: render nothing when `!lesson.published`.

## Verify phase 3

1. `npm run check` passes.
2. Home shows 4 track cards (19, 5, 5 and 4 lessons) and 5 tool cards.
3. `/games/fps-fundamentals`: sidebar with four section headings and 19 links; the page lists the same lessons as cards.
4. Open "Counter-Strafing": the keys A and D render as keyboard keys, the table renders, the drill card lists two drills with total 15 minutes, "Download routine" downloads a text file.
5. Open `/games/cs2/practice-config`: the code block has a Copy button and copying works.
6. Next/previous walk through the track in sidebar order; the first lesson has no previous, the last no next.
7. Logged in as the demo player: "Mark as complete" → the sidebar link gets a ✓, home shows progress; reload the page → still complete; "Undo" removes it.
8. `/games/nope` and `/games/cs2/nope` show "Page not found".
9. Narrow the browser below 800px: the sidebar moves above the content and nothing overflows sideways.

**Done when** all nine checks pass. Commit `phase 3: tracks and lessons`.

---

# Phase 4 — Onboarding quiz, dashboard

## Step 4.1 — `pages/OnboardingPage.jsx`

Title: `Skill assessment`. Container `container stack`, max one step visible at a time. Uses `useCatalog()`, `useAuth()`, `QUESTIONS` and `scoreQuiz` from `lib/quiz.js`.

State: `step` (1 or 2), `gameId`, `currentRank`, `targetRank`, `dailyMinutes`, `answers` (array of 8, each `null` or 0–3), plus `saving` and `error`. Initialise the first four from `user.profile` (`gameId` falls back to the first catalog game's id, `dailyMinutes` to 145).

**Step 1 — "About you"** (`<h1>Skill assessment</h1>`, `<h2>Step 1 of 2: about you</h2>`), a form:
- "Which game are you training for?" — `<select>` of all catalog games (`value` = game id). When it changes, reset both ranks to `''`.
- "Current rank" and "Target rank" — `<select>`s listing the selected game's `ranks`, first option `<option value="">Not ranked yet</option>`. Hide both fields if the game has no ranks.
- "Minutes you can train per day" — `<input type="number" min={30} max={480} step={5}>`.
- Client check on submit: if both ranks are chosen and the target's index in `ranks` is lower than the current's, show `Target rank must be at or above your current rank.` under the target field and stay on step 1.
- Button `Next: 8 quick questions` → `setStep(2)`.

**Step 2 — "Diagnostic"** (`<h2>Step 2 of 2: which sounds most like you?</h2>`):
- For each question `i`: `<fieldset className="card">` with `<legend>{i + 1}. {question.text}</legend>` and four `<label className="row"><input type="radio" name={`q${i}`} checked={answers[i] === j} onChange=… /> {option}</label>`.
- Under the questions: `{answered} of 8 answered`.
- Buttons: `Back` (to step 1) and `btn btn-primary` `See my result` — disabled until `scoreQuiz(answers).complete`.
- On submit: `api('PATCH', '/me/profile', { game: gameId, currentRank, targetRank, dailyMinutes: Number(dailyMinutes), weakness })` where `weakness = scoreQuiz(answers).weakness`; then `setUser(data.user)` and `navigate('/dashboard')`.
- Server field errors (`error.fields.currentRank`, `.targetRank`, `.dailyMinutes`, `.game`): go back to step 1 and show them under the matching fields.

## Step 4.2 — `pages/DashboardPage.jsx`

Title: `Dashboard`. Uses `useAuth()`, `useCatalog()`, `recommendLessons`, `progressOfGame`, `gameById`, `generateRoutine`, `SKILL_LABELS`.

`<h1>Welcome back, {user.name}</h1>`.

If `!user.profile.game || !user.profile.weakness`: a `card stack` with `<h2>Find your weak spot</h2>`, `Two minutes, eight questions. You get a learning path built around the skill that costs you the most rounds.` and a `btn btn-primary` link "Start the assessment" → `/onboarding`. Then still show section 3 (progress) below.

Otherwise, in order:

1. **Profile summary** — a `.grid` of three cards, each with a `.stat-label` and a `.stat`:
   - `Training for` → game name
   - `Rank goal` → `{currentRank || 'Unranked'} → {targetRank || 'Not set'}`
   - `Focus` → `SKILL_LABELS[weakness]`
   Under the grid: `<Link to="/onboarding">Retake the assessment</Link>`.
2. **`<h2>Recommended next</h2>`** — `recommendLessons(catalog, user, 6)` as a `.grid` of `<Link className="card">` → `/games/<game.slug>/<lesson.slug>` with `<h3>` title, badges (game name, difficulty), muted summary. If the list is empty: `You have finished everything we recommend. Pick any track from the home page.`
3. **`<h2>Your progress</h2>`** — for every catalog game: name, the `.progress` bar, `{done} of {total}`.
4. **`<h2>Today's routine</h2>`** — `generateRoutine({ minutes: user.profile.dailyMinutes, weakness: user.profile.weakness })` as a table: Minutes, Block, Focus. If a block has a `link`, the block name is a `<Link>`. Under it: `<Link to="/tools/routine">Change the time or download it</Link>`.

## Verify phase 4

1. `npm run check` passes.
2. Logged out, open `/dashboard` → you are sent to `/login`; after logging in you land on `/dashboard`.
3. A fresh account sees "Find your weak spot". Do the assessment: choose Valorant, Gold → Diamond, 90 minutes; pick the second option on every question → the dashboard shows Focus "Recoil control", rank goal "Gold → Diamond", and the recommended list starts with recoil lessons.
4. Choose a target rank below the current rank → the message appears and you stay on step 1.
5. "See my result" stays disabled until all 8 questions are answered.
6. Today's routine shows four rows whose minutes add up to 90.
7. Mark a recommended lesson complete → it disappears from the recommended list and the progress bar moves.
8. Reload the dashboard → everything is still there (it is stored on the server).

**Done when** all eight checks pass. Commit `phase 4: onboarding and dashboard`.
