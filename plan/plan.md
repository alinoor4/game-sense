# Game Sense — implementation plan

You are the engineer building **Game Sense**: a "W3Schools for gamers". It teaches people how to play competitive games better (aim, movement, positioning, mindset) through short structured lessons in a sidebar layout, plus interactive tools. It is a university Web Technologies project on the **MERN stack** (MongoDB, Express, React, Node) with user accounts, a database and an admin panel.

This folder is the complete specification. Follow it exactly. Where it describes behaviour, implement that behaviour and nothing more.

**Good news:** the hard, easy-to-get-wrong parts are already written and tested in `plan/starter/`: the whole server (API, database, auth, tests), the seed script, and the client's logic layer (API client, auth and catalog state, and the maths behind every tool). Your work is: install the starter, write the lesson content, and build the React pages on top.

## How to work

1. Read this file and `01-spec.md` completely before doing anything. `01-spec.md` is the reference you return to in every phase.
2. Do the phases **in order**. Do not start a phase until every item in the previous phase's "Done when" list is true.
3. Inside a phase file, do the numbered steps in order, one at a time.
4. At the end of every phase run `npm run check` from the project root. It must finish with no errors. Then tick the phase in the table below and make a local git commit named `phase N: <title>`. Never run `git push`.
5. When a step says "Verify", actually run the command or open the page and compare with what the step says. Do not assume.

## The phases

| # | File | Title | Done |
|---|------|-------|------|
| 0 | `02-starter.md` | Install the starter and learn what it contains | [x] |
| 1 | `03-content.md` | Write the 30 remaining seed lessons | [x] |
| 2 | `04-frontend-core.md` | App shell, shared components, auth pages | [x] |
| 3 | `04-frontend-core.md` | Home, track page, lesson page, search | [x] |
| 4 | `04-frontend-core.md` | Onboarding quiz, dashboard, progress | [x] |
| 5 | `05-tools.md` | Sensitivity converter, crosshair generator, routine generator | [x] |
| 6 | `05-tools.md` | Canvas demos: aim trainer, peek advantage, counter-strafe, crosshair comparison | [x] |
| 7 | `05-tools.md` | Lineup maps | [x] |
| 8 | `06-admin.md` | Admin panel | [x] |
| 9 | `07-finish.md` | Production mode, README, final checks | [x] |

## Fixed technology choices

These are decided and installed by the starter. Do not change, upgrade, replace or add to them.

| Area | Choice |
|------|--------|
| Runtime | Node.js 22 or newer (this machine has 24), npm |
| Language | JavaScript only, ES modules (`import`/`export`) everywhere. **No TypeScript.** |
| Server | Express 5, Mongoose 9, `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `helmet`, `express-rate-limit`, `mongodb-memory-server` |
| Client | React 19, `react-router-dom` 7, Vite 8, `react-markdown`, `remark-gfm` |
| Styling | One hand-written stylesheet, `client/src/styles.css` (in the starter). **No Tailwind, no Bootstrap, no CSS-in-JS, no component library.** |
| Tests | Node's built-in runner (`node --test`) with `node:assert/strict`. **No Jest, no Vitest, no supertest.** |
| Lint | ESLint 9 (not 10: the React plugin does not support 10 yet) |

**Never run `npm install <anything>`.** The only install command in this whole plan is `npm run install:all`. Forbidden in particular: axios, Redux, Zustand, React Query, SWR, dotenv, nodemon, cors, concurrently, cross-env, multer, Tailwind, any UI kit, icon package, chart, date or form library. The platform already covers them: `fetch`, React state and context, `process.loadEnvFile`, `node --watch`, the Vite proxy, `<dialog>`, `<canvas>`.

If you believe you need another package, the approach is wrong. Re-read the step. If still blocked, stop and report (see "When you are stuck").

## Rules that apply to every line you write

1. **Scope.** Build what the plan says. No extra features, pages, fields, endpoints, options, animations or abstractions. No TODO comments, no placeholder pages.
2. **Starter files are finished.** Do not edit any file that came from `plan/starter/`, with exactly three exceptions that the plan names: `client/src/App.jsx` (you replace it in phase 2), `client/src/styles.css` (you may append page-specific rules at the bottom), and the seed lessons folder (you add files in phase 1). If a starter file seems wrong, stop and report.
3. **The API contract in `01-spec.md` is law.** The server already implements it. Call it exactly as documented.
4. **Names.** Use the exact file paths, component names, function names and CSS class names given.
5. **Security, never skip:**
   - Never render user or admin text with `dangerouslySetInnerHTML`. Lesson bodies go through the `Markdown` component only.
   - Never store the user or a token in `localStorage`. Login state lives in the httpOnly cookie and in `AuthContext`.
   - Hiding a link is not protection: admin pages also check `user.role` (the `RequireAdmin` component), and the server enforces it again.
   - Never put secrets in client code. Never commit `server/.env`.
6. **Accessibility, never skip:** every input has a visible label; every button is a `<button>` and every navigation is a `<Link>` or `<a>`; images have `alt`; every canvas tool has text instructions and shows its results as text too; focus must stay visible (do not remove outlines).
7. **Three states.** Every page that loads data shows loading, error (with the server's message) and loaded. Every form shows the server's field errors next to the fields.
8. **Comments.** Only to explain *why* something non-obvious is done.
9. **Tests.** Never delete, skip or weaken a test. Fix the code. If a starter test fails, you broke something or the environment is wrong: stop and report.
10. **Content honesty.** Lessons teach principles. Do not invent exact game statistics (damage numbers, patch numbers, cooldowns), pro player quotes or playlist share codes. Do not copy text from other websites. Do not download or use images, logos, map art or footage from any game.

## Commands

All from the project root unless stated. The project path contains spaces, so always quote it.

| Command | What it does |
|---------|--------------|
| `npm run install:all` | Installs root, server and client dependencies (phase 0 only) |
| `npm run check` | Lint, then all tests, then the client build. Must pass at the end of every phase |
| `npm run lint` | ESLint over server and client |
| `npm test` | Server API tests, then client unit tests |
| `npm run build` | Builds the client into `client/dist` |
| `npm run seed` | Deletes all games, lessons and maps, loads the seed content and the two demo accounts |
| `npm --prefix server run dev` | Starts the API on http://127.0.0.1:5000 (restarts on file changes) |
| `npm --prefix client run dev` | Starts the website and prints its address, for example `Local: http://127.0.0.1:3000/` |

To use the site you need **both** dev commands running, each in its own terminal or as background processes. **Open the address the website command prints** (called "the site address" in this plan). It is not always the same port: see the first surprise below. The website dev server forwards every `/api` request to the API, so the browser only ever talks to one origin.

When you are finished with a dev server, stop it with Ctrl+C in its terminal, or by stopping the exact process you started. **Never stop processes by port number or by name** (for example "kill whatever is on port 3000" or "kill all node"): other programs on this computer use those too.

Demo accounts created by `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| admin | `admin@gamesense.test` | `Admin#12345` |
| user | `player@gamesense.test` | `Player#12345` |

### Things that will surprise you if you do not know them

- **Windows reserves ports on this machine.** Port 5173, Vite's usual port, is reserved here, so the website normally comes up on `http://127.0.0.1:3000` instead. `client/vite.config.js` handles this by testing a list of ports and using the first one that works; always read the address it prints. If the **API** prints `Cannot listen on port 5000: reserved by Windows` (or `already in use`), change `PORT` in `server/.env` to another number such as 5050 and restart **both** dev servers (the website reads the same line to find the API). Do not try to free a port by stopping other programs.
- **Always use `127.0.0.1`, not `localhost`,** in the browser and in any command. The login cookie belongs to one host name, and mixing the two looks like being logged out.
- **The database needs no installation.** There is no MongoDB on this machine and you must not install one. When `MONGODB_URI` is not set, the server starts its own private MongoDB through `mongodb-memory-server`, storing data in `server/.data/` (development) or in memory (tests). The first time on a machine it downloads a MongoDB binary of about **780 MB** into `~/.cache/mongodb-binaries`. That can take 10 to 15 minutes and may print nothing. **Wait. Do not cancel, do not start a second copy, do not switch approach.** On this machine it has probably been downloaded already, in which case tests start in about 3 seconds.
- **One process per database folder.** Stop the API dev server before running `npm run seed`, then start it again. Tests never touch `server/.data/`, so they can run while the dev server runs.
- **Windows.** Do not set environment variables inline in commands. Use `server/.env` (copy `server/.env.example`).
- **Express 5**, not 4: an error thrown inside an `async` route handler reaches the error middleware by itself.
- **Mongoose 9**: no callbacks, no `pre`/`post` hooks. `sanitizeFilter` is on.
- **React 19**: do not `import React from 'react'`. Import only the hooks you use.
- **`react-router-dom`**: use only `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`, `Navigate`, `Outlet`, `useParams`, `useNavigate`, `useLocation`. No loaders, no actions, no `createBrowserRouter`.
- **ESLint is strict about hooks and undefined names.** An undefined component or variable fails `npm run check`. Warnings from `react-hooks/exhaustive-deps` must be fixed by listing the dependency, not by disabling the rule.

## When you are stuck

Stop and write a short report to the user (which step, what you ran, the exact error) instead of improvising, when any of these happens:

- A starter file or starter test does not work as described.
- You need a package, an endpoint, a model field or a page that the plan does not contain.
- Two parts of the plan contradict each other. (`01-spec.md` wins until the user answers.)
- The same error survives three different fix attempts.

Never work around a problem by deleting a feature, loosening validation, disabling a lint rule or skipping a test.

## What is deliberately not in this project

Do not build these. If the user asks for one later, it is new work.

- Light theme (the site is dark only).
- File or image uploads (admins paste a URL, or put a file in `client/public/maps/`).
- Email (verification, password reset), social login, payments, comments, ratings, leaderboards, saved drill scores.
- Real game footage, real game maps, real spray patterns, real playlist share codes. The data model has fields (`clipUrl`, `playlistCode`, map `imageUrl`) where an admin can add their own later.
- Server-side search, pagination, translations, a recoil trainer, 3D or WebGL.
- Deployment to a host. Phase 9 makes the app runnable as one Node service; it does not deploy it.
