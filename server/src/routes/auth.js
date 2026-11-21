import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { User } from '../models/User.js';
import { HttpError } from '../middleware/error.js';
import { setAuthCookie, clearAuthCookie, requireAuth } from '../middleware/auth.js';

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: { error: { message: 'Too many attempts. Try again in 15 minutes.' } },
});

function readCredentials(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  return { email, password };
}

router.post('/register', limiter, async (req, res) => {
  const { email, password } = readCredentials(req.body);
  const name = typeof req.body?.name === 'string' ? req.body.name : '';
  // bcrypt ignores everything after 72 bytes, so cap the length.
  if (password.length < 8 || password.length > 72) {
    throw new HttpError(400, 'Validation failed', { password: 'Password must be 8 to 72 characters' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  setAuthCookie(res, user);
  res.status(201).json({ user });
});

router.post('/login', limiter, async (req, res) => {
  const { email, password } = readCredentials(req.body);
  const user = email ? await User.findOne({ email }).select('+passwordHash') : null;
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) throw new HttpError(401, 'Wrong email or password');
  setAuthCookie(res, user);
  res.json({ user });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
