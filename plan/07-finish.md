# 07 — Phase 9: production mode, README, final checks

## Step 9.1 — Run it as one server

The server already serves `client/dist` when `NODE_ENV=production` (see the end of `server/src/app.js`). Prove that it works:

1. Stop both dev servers.
2. `npm run build`.
3. Create a file `server/.env.production.example` with this content (documentation only, never read by the code):

   ```
   NODE_ENV=production
   PORT=5000
   # Required: a MongoDB connection string, for example from a free MongoDB Atlas cluster
   MONGODB_URI=
   # Required: a long random string
   JWT_SECRET=
   ```

4. Production needs a real `MONGODB_URI`; the private development database refuses to start in production on purpose. **If the user has not given you a connection string, skip the live production run**, say so in your final report, and continue with step 9.2. Do not invent a URI and do not weaken the check in `db.js`.
5. If you do have a URI: put `NODE_ENV=production`, `MONGODB_URI` and `JWT_SECRET` in `server/.env`, run `npm --prefix server run seed -- --force` once (it asks for `--force` because seeding deletes content; note the command differs from the usual `npm run seed` so the flag reaches the script), then `npm start`, and open http://127.0.0.1:5000 (or the `PORT` you set). The whole site must work from that single address, including a page reload on `/games/cs2/practice-config`. In production the login cookie is marked `Secure`; Chrome, Edge and Firefox still accept it on `127.0.0.1`, but if login does not "stick" in this local run, that is the reason and it is not a bug: on a real host the site runs behind https. Afterwards restore `server/.env` to its development content (empty `MONGODB_URI`, no `NODE_ENV`).

## Step 9.2 — Project `README.md` (in the project root)

Write it for a lecturer who has never seen the project. Plain language, these sections, in this order:

1. **Game Sense** — two sentences on what it is.
2. **Features** — a bullet list grouped as Visitors, Registered users, Admins (take them from `01-spec.md` section 1).
3. **Tech stack** — the table from `plan/plan.md`, plus one line each on: JWT in an httpOnly cookie, bcrypt password hashing, Markdown lessons rendered without raw HTML.
4. **Run it locally** — the exact commands: `npm run install:all`, copy `server/.env.example` to `server/.env`, `npm run seed`, the two dev commands, the URL. Include the warning about the one-time 780 MB MongoDB download and that no MongoDB installation is needed.
5. **Demo accounts** — the table of the two seeded accounts, with the sentence `These are for local demonstration only. Change or delete them before putting the site online.`
6. **Tests** — `npm run check` and what it covers (API tests for auth, content, profile, progress and admin; unit tests for the tool maths).
7. **Project structure** — the tree from `01-spec.md` section 2, shortened to two levels.
8. **API overview** — one table: method, path, access (public / user / admin), purpose. Take it from `01-spec.md` section 5.
9. **Known limits** — copy the "deliberately not in this project" list from `plan/plan.md`, and add: lesson facts are general guidance and may not match the current patch of a game; the Training Yard map is fictional; the crosshair conversion to CS2 units is approximate.
10. **Credits** — `Built for the Web Technologies course. Not affiliated with or endorsed by any game publisher. Game names are trademarks of their owners.`

Do not include screenshots, badges or emoji.

## Step 9.3 — Final sweep

Run each check and fix what it finds.

**Automated**

1. `npm run check` → no lint output, server `pass 17`, client `pass 26`, build succeeds.
2. Search the code you wrote (`client/src` except `lib/` starter files) for each of these; every hit is a defect to remove: `TODO`, `FIXME`, `console.log`, `dangerouslySetInnerHTML`, `localStorage`, `eslint-disable`, `import React`.
3. `git status` shows no `node_modules`, `dist`, `.data` or `.env` files as tracked or staged.
4. `client/src/App.jsx` matches the final route table in `04-frontend-core.md` exactly.

**In the browser, logged out**

5. Every link in the header, the home page and the tools page leads to a working page.
6. Reload the page on a lesson URL and on a tool URL: it still works (no blank page).
7. At 380px width (phone): no horizontal scrolling on the home page, a lesson, the converter and the lineup map.
8. Keyboard only: Tab through the home page; focus is always visible; Ctrl+K opens search, arrow keys move, Enter opens the lesson.
9. The browser console shows no errors or warnings while you click through one lesson of each track and each tool. (A single `401` for `/api/auth/me` while logged out is expected.)

**Logged in as the demo player**

10. Do the assessment, open the dashboard, complete one lesson, save a routine. Log out, log in again: all of it is still there.

**Logged in as admin**

11. Create, edit and delete one lesson. Then `npm run seed` to restore the content.

## Step 9.4 — Final report to the user

Write a short report with exactly these parts:

- **Built:** one line per phase.
- **Checks:** the output summary of `npm run check`.
- **Not done or not verified:** anything skipped (for example the live production run in step 9.1), with the reason.
- **How to run:** the three commands.
- **Known limits:** the same list as in the project README.

Commit `phase 9: readme and final checks`.

## Done when

- [ ] All eleven sweep checks pass.
- [ ] `README.md` exists in the project root with the ten sections.
- [ ] All ten phases are ticked in `plan/plan.md`.
- [ ] The final report is written.
