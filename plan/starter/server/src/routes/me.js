import { Router } from 'express';
import { Game } from '../models/Game.js';
import { Lesson } from '../models/Lesson.js';
import { HttpError } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';
import { pick, isId } from '../util.js';

const router = Router();
router.use(requireAuth);

router.patch('/profile', async (req, res) => {
  const user = req.user;
  const changes = pick(req.body, ['game', 'currentRank', 'targetRank', 'weakness', 'dailyMinutes']);

  if (changes.game !== undefined) {
    if (changes.game === null || changes.game === '') {
      changes.game = null;
    } else if (!isId(changes.game) || !(await Game.exists({ _id: changes.game }))) {
      throw new HttpError(400, 'Validation failed', { game: 'Game not found' });
    }
  }
  Object.assign(user.profile, changes);

  // Ranks are free text in the schema; here they must belong to the chosen game.
  const game = user.profile.game ? await Game.findById(user.profile.game) : null;
  if (game && game.ranks.length) {
    const fields = {};
    for (const key of ['currentRank', 'targetRank']) {
      if (user.profile[key] && !game.ranks.includes(user.profile[key])) fields[key] = `Pick one of the ${game.name} ranks`;
    }
    if (Object.keys(fields).length) throw new HttpError(400, 'Validation failed', fields);
  }

  await user.save();
  res.json({ user });
});

router.put('/progress/:lessonId', async (req, res) => {
  const { lessonId } = req.params;
  const exists = isId(lessonId) && (await Lesson.exists({ _id: lessonId, published: true }));
  if (!exists) throw new HttpError(404, 'Lesson not found');
  req.user.completedLessons.addToSet(lessonId);
  await req.user.save();
  res.json({ completedLessons: req.user.completedLessons });
});

router.delete('/progress/:lessonId', async (req, res) => {
  if (isId(req.params.lessonId)) {
    req.user.completedLessons.pull(req.params.lessonId);
    await req.user.save();
  }
  res.json({ completedLessons: req.user.completedLessons });
});

export default router;
