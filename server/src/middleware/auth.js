import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';
import { HttpError } from './error.js';

const COOKIE = 'gs_token';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// shortcut: CSRF protection relies on SameSite=Strict + JSON-only API; add CSRF tokens if the API is ever called cross-site.
const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: config.isProd, path: '/' };

export function setAuthCookie(res, user) {
  const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: '7d' });
  res.cookie(COOKIE, token, { ...cookieOptions, maxAge: WEEK_MS });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE, cookieOptions);
}

// Sets req.user when a valid cookie is present; never rejects.
export async function loadUser(req, res, next) {
  const token = req.cookies?.[COOKIE];
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(payload.sub);
    } catch {
      req.user = null;
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) throw new HttpError(401, 'Please log in');
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) throw new HttpError(401, 'Please log in');
  if (req.user.role !== 'admin') throw new HttpError(403, 'Admin only');
  next();
}
