import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { config } from './config.js';

// Wraps object values in query filters with $eq, which blocks NoSQL operator injection.
// Consequence: to use an operator such as $in in a filter you must wrap it in mongoose.trusted().
mongoose.set('sanitizeFilter', true);

let memoryServer = null;

export async function connectDb() {
  let uri = config.mongoUri;
  if (!uri) {
    if (config.isProd) throw new Error('MONGODB_URI is required in production');
    // shortcut: no MONGODB_URI means we run a private local mongod, fine for dev and tests; set MONGODB_URI (Atlas) for any shared or deployed use.
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const instance = { storageEngine: 'wiredTiger' };
    if (!config.isTest) {
      instance.dbPath = fileURLToPath(new URL('../.data/db', import.meta.url));
      mkdirSync(instance.dbPath, { recursive: true });
    }
    memoryServer = await MongoMemoryServer.create({ instance });
    uri = memoryServer.getUri('gamesense');
  }
  await mongoose.connect(uri);
  // Wait for unique indexes, otherwise the first duplicate could slip through.
  await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));
  return uri;
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
