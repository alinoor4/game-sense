// npm run seed  — replaces ALL games, lessons and maps with the seed content and (re)creates the two demo accounts.
// Other user accounts are kept, but their progress and chosen game are cleared because lesson and game ids change.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { connectDb, disconnectDb } from '../db.js';
import { User } from '../models/User.js';
import { Game } from '../models/Game.js';
import { Lesson } from '../models/Lesson.js';
import { GameMap } from '../models/GameMap.js';
import { games } from './games.js';
import { maps } from './maps.js';

const DEMO_ACCOUNTS = [
  { name: 'Admin', email: 'admin@gamesense.test', password: 'Admin#12345', role: 'admin' },
  { name: 'Demo Player', email: 'player@gamesense.test', password: 'Player#12345', role: 'user' },
];

if (config.isProd && !process.argv.includes('--force')) {
  console.error('Refusing to seed in production: it deletes all content. Run with --force if you really mean it.');
  process.exit(1);
}

const lessonsDir = fileURLToPath(new URL('./lessons', import.meta.url));

// A lesson file is: a line "---", a JSON object, a line "---", then the Markdown body.
// Path: lessons/<game slug>/<NN>-<lesson slug>.md   (NN sets the order)
function readLessonFile(gameSlug, fileName) {
  const where = `lessons/${gameSlug}/${fileName}`;
  const name = /^(\d+)-([a-z0-9-]+)\.md$/.exec(fileName);
  if (!name) throw new Error(`${where}: file name must look like 03-counter-strafing.md`);
  const text = readFileSync(path.join(lessonsDir, gameSlug, fileName), 'utf8').replace(/\r\n/g, '\n');
  const end = text.indexOf('\n---\n', 4);
  if (!text.startsWith('---\n') || end < 0) throw new Error(`${where}: must start with ---, a JSON object, then ---`);
  let meta;
  try {
    meta = JSON.parse(text.slice(4, end));
  } catch (err) {
    throw new Error(`${where}: the header is not valid JSON (${err.message})`);
  }
  return { ...meta, order: Number(name[1]), slug: name[2], body: text.slice(end + 5).trim() };
}

await connectDb();
await Promise.all([Game.deleteMany({}), Lesson.deleteMany({}), GameMap.deleteMany({})]);
await User.updateMany(
  {},
  { $set: { completedLessons: [], 'profile.game': null, 'profile.currentRank': '', 'profile.targetRank': '' } },
);

const gameBySlug = new Map();
for (const g of games) {
  const game = await Game.create({ ...g, sections: g.sections.map((title) => ({ title })) });
  gameBySlug.set(game.slug, game);
}

let lessonCount = 0;
for (const gameSlug of readdirSync(lessonsDir).sort()) {
  const game = gameBySlug.get(gameSlug);
  if (!game) throw new Error(`lessons/${gameSlug}: no game with that slug in games.js`);
  for (const fileName of readdirSync(path.join(lessonsDir, gameSlug)).sort()) {
    const { section: sectionTitle, ...fields } = readLessonFile(gameSlug, fileName);
    const section = game.sections.find((s) => s.title === sectionTitle);
    if (!section) throw new Error(`lessons/${gameSlug}/${fileName}: "${sectionTitle}" is not a section of ${game.name}`);
    await Lesson.create({ ...fields, game: game._id, section: section._id, published: true });
    lessonCount += 1;
  }
}

for (const m of maps) {
  const game = gameBySlug.get(m.game);
  if (!game) throw new Error(`Map "${m.name}": no game with slug "${m.game}"`);
  await GameMap.create({ ...m, game: game._id });
}

for (const account of DEMO_ACCOUNTS) {
  const user = (await User.findOne({ email: account.email })) || new User({ email: account.email });
  user.name = account.name;
  user.role = account.role;
  user.passwordHash = await bcrypt.hash(account.password, 10);
  await user.save();
}

console.log(`Seeded ${games.length} games, ${lessonCount} lessons, ${maps.length} maps.`);
for (const a of DEMO_ACCOUNTS) console.log(`  ${a.role.padEnd(5)}  ${a.email}  /  ${a.password}`);
await disconnectDb();
