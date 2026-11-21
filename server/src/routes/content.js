import { Router } from 'express';
import { Game } from '../models/Game.js';
import { Lesson } from '../models/Lesson.js';
import { GameMap } from '../models/GameMap.js';
import { HttpError } from '../middleware/error.js';

// The lesson fields sent in lists. The body is only sent by the single-lesson route.
export const LESSON_INDEX_FIELDS = 'game section title slug summary order difficulty skill demo';

const router = Router();

// shortcut: the whole content tree in one response; split per game or paginate when lessons exceed about 1,000.
router.get('/catalog', async (req, res) => {
  const [games, lessons, maps] = await Promise.all([
    Game.find().sort({ order: 1, name: 1 }),
    Lesson.find({ published: true }).select(LESSON_INDEX_FIELDS).sort({ order: 1, title: 1 }),
    GameMap.find().select('game name slug').sort({ name: 1 }),
  ]);
  res.json({ games, lessons, maps });
});

router.get('/lessons/:gameSlug/:lessonSlug', async (req, res) => {
  const game = await Game.findOne({ slug: req.params.gameSlug });
  const lesson = game ? await Lesson.findOne({ game: game._id, slug: req.params.lessonSlug }) : null;
  const visible = lesson && (lesson.published || req.user?.role === 'admin');
  if (!visible) throw new HttpError(404, 'Lesson not found');
  res.json({ lesson });
});

router.get('/maps/:slug', async (req, res) => {
  const map = await GameMap.findOne({ slug: req.params.slug });
  if (!map) throw new HttpError(404, 'Map not found');
  res.json({ map });
});

export default router;
