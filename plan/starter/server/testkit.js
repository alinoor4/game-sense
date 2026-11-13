// Shared helpers for the API tests. This file must stay outside test/ so the runner does not treat it as a test.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = '';

const { default: mongoose } = await import('mongoose');
const { default: bcrypt } = await import('bcryptjs');
const { connectDb, disconnectDb } = await import('./src/db.js');
const { createApp } = await import('./src/app.js');
const { User } = await import('./src/models/User.js');
const { Game } = await import('./src/models/Game.js');
const { Lesson } = await import('./src/models/Lesson.js');

let server;
let baseUrl;

export async function startTestServer() {
  await connectDb();
  await new Promise((resolve) => {
    server = createApp().listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
}

export async function stopTestServer() {
  await new Promise((resolve) => server.close(resolve));
  await disconnectDb();
}

export async function clearDb() {
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
}

// A client keeps its own cookies, like one browser. Returns { status, body }.
export function createClient() {
  let cookie = '';
  return async function request(method, path, body) {
    const res = await fetch(baseUrl + path, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const setCookie = res.headers.getSetCookie();
    if (setCookie.length) cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  };
}

// Creates an account with the given role and returns a logged-in client for it.
export async function loginAs(role, email = `${role}@example.com`) {
  const passwordHash = await bcrypt.hash('password123', 4);
  await User.create({ name: `Test ${role}`, email, passwordHash, role });
  const api = createClient();
  const res = await api('POST', '/api/auth/login', { email, password: 'password123' });
  if (res.status !== 200) throw new Error(`loginAs failed with status ${res.status}`);
  return api;
}

// One game with two sections and one published lesson in the first section.
export async function createGameWithLesson() {
  const game = await Game.create({
    name: 'Test Game',
    slug: 'test-game',
    description: 'A game used by tests',
    genre: 'fps',
    ranks: ['Low', 'Mid', 'High'],
    sections: [{ title: 'Aiming' }, { title: 'Movement' }],
  });
  const lesson = await Lesson.create({
    game: game._id,
    section: game.sections[0]._id,
    title: 'Crosshair Placement',
    slug: 'crosshair-placement',
    summary: 'Keep the crosshair where heads appear.',
    body: '## Why it matters\n\nLess distance to move.',
    difficulty: 'beginner',
    skill: 'precision',
    published: true,
  });
  return { game, lesson };
}
