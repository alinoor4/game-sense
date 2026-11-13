import { Router } from 'express';
import { User } from '../models/User.js';
import { Game } from '../models/Game.js';
import { Lesson } from '../models/Lesson.js';
import { GameMap } from '../models/GameMap.js';
import { HttpError } from '../middleware/error.js';
import { requireAdmin } from '../middleware/auth.js';
import { pick, isId } from '../util.js';
import { LESSON_INDEX_FIELDS } from './content.js';

const LESSON_FIELDS = ['game', 'section', 'title', 'slug', 'summary', 'body', 'order', 'difficulty', 'skill', 'demo', 'clipUrl', 'drills', 'playlistCode', 'published'];
const GAME_FIELDS = ['name', 'slug', 'description', 'genre', 'isFundamentals', 'ranks', 'sections', 'order'];
const MAP_FIELDS = ['game', 'name', 'slug', 'imageUrl', 'callouts', 'lineups'];

const router = Router();
router.use(requireAdmin);

async function findOr404(Model, id, label) {
  const doc = isId(id) ? await Model.findById(id) : null;
  if (!doc) throw new HttpError(404, `${label} not found`);
  return doc;
}

// ---------- lessons ----------

async function assertLessonRefs(lesson) {
  const game = lesson.game ? await Game.findById(lesson.game) : null;
  if (!game) throw new HttpError(400, 'Validation failed', { game: 'Game not found' });
  if (!lesson.section || !game.sections.id(lesson.section)) {
    throw new HttpError(400, 'Validation failed', { section: 'Section does not belong to this game' });
  }
}

router.get('/lessons', async (req, res) => {
  const lessons = await Lesson.find().select(`${LESSON_INDEX_FIELDS} published`).sort({ order: 1, title: 1 });
  res.json({ lessons });
});

router.get('/lessons/:id', async (req, res) => {
  res.json({ lesson: await findOr404(Lesson, req.params.id, 'Lesson') });
});

router.post('/lessons', async (req, res) => {
  const lesson = new Lesson(pick(req.body, LESSON_FIELDS));
  await assertLessonRefs(lesson);
  await lesson.save();
  res.status(201).json({ lesson });
});

router.put('/lessons/:id', async (req, res) => {
  const lesson = await findOr404(Lesson, req.params.id, 'Lesson');
  Object.assign(lesson, pick(req.body, LESSON_FIELDS));
  await assertLessonRefs(lesson);
  await lesson.save();
  res.json({ lesson });
});

router.delete('/lessons/:id', async (req, res) => {
  const lesson = await findOr404(Lesson, req.params.id, 'Lesson');
  await lesson.deleteOne();
  await User.updateMany({}, { $pull: { completedLessons: lesson._id } });
  res.status(204).end();
});

// ---------- games ----------

// The client sends sections as { id?, title }. Keeping the id keeps lessons attached to a renamed section.
function sectionsFromBody(sections) {
  if (!Array.isArray(sections)) return sections;
  return sections.map((s) => ({ ...(isId(s?.id) ? { _id: s.id } : {}), title: s?.title }));
}

router.post('/games', async (req, res) => {
  const fields = pick(req.body, GAME_FIELDS);
  if (fields.sections !== undefined) fields.sections = sectionsFromBody(fields.sections);
  const game = await Game.create(fields);
  res.status(201).json({ game });
});

router.put('/games/:id', async (req, res) => {
  const game = await findOr404(Game, req.params.id, 'Game');
  const fields = pick(req.body, GAME_FIELDS);
  if (fields.sections !== undefined) {
    fields.sections = sectionsFromBody(fields.sections);
    const kept = new Set(Array.isArray(fields.sections) ? fields.sections.map((s) => String(s._id)) : []);
    for (const section of game.sections) {
      if (!kept.has(section.id) && (await Lesson.exists({ game: game._id, section: section._id }))) {
        throw new HttpError(409, `Move or delete the lessons in "${section.title}" first`);
      }
    }
  }
  Object.assign(game, fields);
  await game.save();
  res.json({ game });
});

router.delete('/games/:id', async (req, res) => {
  const game = await findOr404(Game, req.params.id, 'Game');
  const inUse = (await Lesson.exists({ game: game._id })) || (await GameMap.exists({ game: game._id }));
  if (inUse) throw new HttpError(409, "Delete this game's lessons and maps first");
  await game.deleteOne();
  // users who had picked this game go back to "no game chosen"
  await User.updateMany(
    { 'profile.game': game._id },
    { $set: { 'profile.game': null, 'profile.currentRank': '', 'profile.targetRank': '' } },
  );
  res.status(204).end();
});

// ---------- maps ----------

async function assertMapGame(map) {
  if (!map.game || !(await Game.exists({ _id: map.game }))) {
    throw new HttpError(400, 'Validation failed', { game: 'Game not found' });
  }
}

router.post('/maps', async (req, res) => {
  const map = new GameMap(pick(req.body, MAP_FIELDS));
  await assertMapGame(map);
  await map.save();
  res.status(201).json({ map });
});

router.put('/maps/:id', async (req, res) => {
  const map = await findOr404(GameMap, req.params.id, 'Map');
  Object.assign(map, pick(req.body, MAP_FIELDS));
  await assertMapGame(map);
  await map.save();
  res.json({ map });
});

router.delete('/maps/:id', async (req, res) => {
  const map = await findOr404(GameMap, req.params.id, 'Map');
  await map.deleteOne();
  res.status(204).end();
});

// ---------- users ----------

router.get('/users', async (req, res) => {
  res.json({ users: await User.find().sort({ createdAt: -1 }) });
});

router.patch('/users/:id', async (req, res) => {
  const user = await findOr404(User, req.params.id, 'User');
  if (user.id === req.user.id) throw new HttpError(400, 'You cannot change your own role');
  const role = req.body?.role;
  if (role !== 'user' && role !== 'admin') {
    throw new HttpError(400, 'Validation failed', { role: 'Role must be user or admin' });
  }
  user.role = role;
  await user.save();
  res.json({ user });
});

router.delete('/users/:id', async (req, res) => {
  const user = await findOr404(User, req.params.id, 'User');
  if (user.id === req.user.id) throw new HttpError(400, 'You cannot delete your own account');
  await user.deleteOne();
  res.status(204).end();
});

export default router;
