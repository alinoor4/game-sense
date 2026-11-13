import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { config } from './config.js';
import { loadUser } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';
import adminRoutes from './routes/admin.js';
import contentRoutes from './routes/content.js';

const clientDist = fileURLToPath(new URL('../../client/dist', import.meta.url));

export function createApp() {
  const app = express();
  app.set('trust proxy', config.isProd ? 1 : false);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // lesson images and clips may be hosted on other https sites
          'img-src': ["'self'", 'data:', 'https:'],
          'media-src': ["'self'", 'https:'],
        },
      },
    }),
  );
  app.use(express.json({ limit: '200kb' }));
  app.use(cookieParser());
  app.use(loadUser);

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/me', meRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', contentRoutes);
  app.use('/api', notFound);

  // In production the same server also serves the built React app.
  if (config.isProd && existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile('index.html', { root: clientDist });
    });
  }

  app.use(errorHandler);
  return app;
}
