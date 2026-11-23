import { config } from './config.js';
import { connectDb, disconnectDb } from './db.js';
import { createApp } from './app.js';

const uri = await connectDb();
console.log(`MongoDB connected: ${uri.replace(/\/\/[^@/]*@/, '//***@')}`);

// Express 5 passes a listen error to this callback instead of throwing.
createApp().listen(config.port, async (error) => {
  if (error) {
    const reason = error.code === 'EACCES' ? 'reserved by Windows' : error.code === 'EADDRINUSE' ? 'already in use' : error.message;
    console.error(`Cannot listen on port ${config.port}: ${reason}.`);
    console.error('Set PORT in server/.env to another number (for example 5050), then restart the API and the website dev server.');
    await disconnectDb();
    process.exit(1);
  }
  console.log(`API listening on http://127.0.0.1:${config.port}`);
});
