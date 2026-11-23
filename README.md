# Game Sense

Game Sense is a "W3Schools for gamers": short, structured lessons that teach how to play competitive games better (aim, movement, positioning and the mental game), organised into game tracks with a sidebar. Interactive tools and in-lesson demos let you try each idea right away in the browser.

Built on the MERN stack (MongoDB, Express, React, Node.js) for a university Web Technologies course.

> [!NOTE]
> **Work in progress.** Lessons, accounts, the dashboard, all tools and the lineup maps are done. The admin panel pages and the production setup are still being built; the admin API they will use is already finished and tested. See [plan/plan.md](plan/plan.md) for the phase-by-phase status.

## Features

**Visitors**

- Four game tracks (FPS Fundamentals, Valorant, Counter-Strike 2, Fighting Game Fundamentals) with 33 lessons grouped into sections, a sidebar and previous/next links.
- Lessons written in Markdown, with copy buttons on code blocks, keyboard-key rendering and optional drill lists you can download.
- Search across all lessons with <kbd>Ctrl</kbd>+<kbd>K</kbd>.
- Tools: sensitivity / eDPI / cm-per-360 converter, crosshair generator (CS2 console commands and Valorant settings), daily routine generator, aim trainer (flick and tracking), and lineup maps with callouts and grenade lineups.
- Interactive demos inside lessons: peeker's advantage, counter-strafe timing and crosshair placement.

**Registered users**

- Onboarding: choose a game, current and target rank, then an 8-question quiz that finds your weakest skill.
- Dashboard with recommended lessons, progress per track and today's routine.
- Mark lessons as complete; progress is saved to your account.

**Admins**

- Manage lessons, games (with their sections and ranks), maps (callouts and lineups) and users. *(API done, admin pages in progress.)*

## Tech stack

| Area | Choice |
|------|--------|
| Runtime | Node.js 22 or newer, npm |
| Language | JavaScript only, ES modules |
| Server | Express 5, Mongoose 9, jsonwebtoken, bcryptjs, cookie-parser, helmet, express-rate-limit, mongodb-memory-server |
| Client | React 19, react-router-dom 7, Vite 8, react-markdown, remark-gfm |
| Styling | One hand-written stylesheet, [`client/src/styles.css`](client/src/styles.css) |
| Tests | Node's built-in test runner (`node --test`) with `node:assert/strict` |
| Lint | ESLint 9 |

- **Login:** a JWT stored in an httpOnly cookie, so page scripts can never read the token.
- **Passwords:** hashed with bcrypt; the hash is never sent to the browser.
- **Lessons:** Markdown rendered by react-markdown without raw HTML, so lesson text cannot inject scripts.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or newer (includes npm)
- Git

**No MongoDB installation is needed.** In development the server starts its own private database, stored in `server/.data/`.

> [!WARNING]
> The **first** run on a computer downloads a MongoDB binary of about 780 MB into `~/.cache/mongodb-binaries`. It can take 10 to 15 minutes and may print nothing. Let it finish; later starts take a few seconds.

### Install and seed

```bash
git clone https://github.com/alinoor4/game-sense.git
cd game-sense
npm run install:all
cp server/.env.example server/.env     # Windows (cmd/PowerShell): copy server\.env.example server\.env
npm run seed
```

`npm run seed` loads the lessons, games, the lineup map and the two [demo accounts](#demo-accounts). Every setting in [`server/.env.example`](server/.env.example) is optional in development.

### Run

Start the API and the website, each in its own terminal:

```bash
npm --prefix server run dev      # API on http://127.0.0.1:5000
```

```bash
npm --prefix client run dev      # website, prints its address
```

Open the address the second command prints, usually <http://127.0.0.1:5173>. The website forwards every `/api` request to the API, so the browser only talks to one address.

> [!TIP]
> - Use `127.0.0.1`, not `localhost`. The login cookie belongs to one host name, and mixing the two looks like being logged out.
> - If the website port is taken, the dev server tries other ports and prints the one it used. If the API says port 5000 is reserved or in use, change `PORT` in `server/.env` (for example to 5050) and restart both dev servers.
> - Stop the API before running `npm run seed` again: only one process can use the database folder at a time.

## Demo accounts

Created by `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| admin | `admin@gamesense.test` | `Admin#12345` |
| user | `player@gamesense.test` | `Player#12345` |

> [!IMPORTANT]
> These are for local demonstration only. Change or delete them before putting the site online.

## Tests

```bash
npm run check
```

This runs ESLint, then the tests, then the production build. The server tests call the real API against an in-memory database and cover auth, content, profile, progress and admin. The client tests cover the maths behind every tool and demo (sensitivity conversion, crosshair codes, routine split, quiz scoring, peek advantage, aim trainer, counter-strafe).

| Command | What it does |
|---------|--------------|
| `npm run lint` | ESLint over server and client |
| `npm test` | Server API tests, then client unit tests |
| `npm run build` | Builds the client into `client/dist` |

## Project structure

```text
game-sense/
├─ package.json        root scripts: install:all, check, lint, test, build, seed, start
├─ eslint.config.js
├─ server/             Express API
│  ├─ src/             app, config, database, models, routes, middleware, seed content
│  ├─ test/            API tests
│  └─ testkit.js       test helpers
├─ client/             React website (Vite)
│  ├─ public/          favicon and map images
│  └─ src/             pages, components, demos, context, hooks, lib (plain logic + unit tests)
└─ plan/               the implementation plan and specification
```

## API overview

All paths start with `/api`. Requests and responses are JSON. Errors look like `{ "error": { "message": "...", "fields": { ... } } }`. Login state is the httpOnly cookie `gs_token`, sent by the browser automatically.

<details>
<summary>All endpoints</summary>

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| POST | `/auth/register` | public | Create an account and log in |
| POST | `/auth/login` | public | Log in |
| POST | `/auth/logout` | public | Log out |
| GET | `/auth/me` | user | The logged-in user |
| GET | `/catalog` | public | All games, published lesson summaries and maps |
| GET | `/lessons/:gameSlug/:lessonSlug` | public | One lesson with its body |
| GET | `/maps/:slug` | public | One map with callouts and lineups |
| PATCH | `/me/profile` | user | Update game, ranks, weakness, daily minutes |
| PUT | `/me/progress/:lessonId` | user | Mark a lesson complete |
| DELETE | `/me/progress/:lessonId` | user | Unmark a lesson |
| GET | `/admin/lessons` | admin | All lessons, including unpublished |
| GET | `/admin/lessons/:id` | admin | One lesson in full |
| POST | `/admin/lessons` | admin | Create a lesson |
| PUT | `/admin/lessons/:id` | admin | Update a lesson |
| DELETE | `/admin/lessons/:id` | admin | Delete a lesson (and remove it from everyone's progress) |
| POST | `/admin/games` | admin | Create a game |
| PUT | `/admin/games/:id` | admin | Update a game |
| DELETE | `/admin/games/:id` | admin | Delete a game that has no lessons or maps |
| POST | `/admin/maps` | admin | Create a map |
| PUT | `/admin/maps/:id` | admin | Update a map |
| DELETE | `/admin/maps/:id` | admin | Delete a map |
| GET | `/admin/users` | admin | All users, newest first |
| PATCH | `/admin/users/:id` | admin | Change a user's role (not your own) |
| DELETE | `/admin/users/:id` | admin | Delete a user (not yourself) |

</details>

The full contract, with every status code, is in [plan/01-spec.md](plan/01-spec.md#5-api-contract).

## Known limits

- Dark theme only.
- No file or image uploads (admins paste a URL, or put a file in `client/public/maps/`).
- No email (verification, password reset), social login, payments, comments, ratings, leaderboards or saved drill scores.
- No real game footage, real game maps, real spray patterns or real playlist share codes. The data model has fields (`clipUrl`, `playlistCode`, map `imageUrl`) where an admin can add their own.
- No server-side search, pagination, translations, recoil trainer, 3D or WebGL.
- Not deployed to a host.
- Lesson facts are general guidance and may not match the current patch of a game.
- The Training Yard map is fictional.
- The crosshair conversion to CS2 units is approximate.

## Credits

Built for the Web Technologies course. Not affiliated with or endorsed by any game publisher. Game names are trademarks of their owners.
