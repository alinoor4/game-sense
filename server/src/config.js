import { fileURLToPath } from 'node:url';

// Load server/.env if it exists. Real environment variables win over the file.
try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
} catch {
  // no .env file: defaults below are used
}

const env = process.env.NODE_ENV || 'development';

export const config = {
  env,
  isProd: env === 'production',
  isTest: env === 'test',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
};

if (!config.jwtSecret) {
  if (config.isProd) throw new Error('JWT_SECRET is required in production');
  config.jwtSecret = 'dev-only-secret-do-not-use-in-production';
}
