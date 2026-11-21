import { readFileSync } from 'node:fs';
import net from 'node:net';
import { parseEnv } from 'node:util';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const HOST = '127.0.0.1';
const WEB_PORTS = [5173, 3000, 4173, 8080, 8000, 3333];

// The API port is read from server/.env (PORT), so both dev servers are configured in one place.
function apiPort() {
  try {
    return Number(parseEnv(readFileSync(new URL('../server/.env', import.meta.url), 'utf8')).PORT) || 5000;
  } catch {
    return 5000;
  }
}

// Windows (Hyper-V, Docker, WSL) reserves random port ranges and 5173 is often inside one.
// Vite only moves on when a port is busy, not when it is reserved, so we test the ports ourselves.
function canListen(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.listen(port, HOST, () => probe.close(() => resolve(true)));
  });
}

async function firstUsablePort() {
  for (const port of WEB_PORTS) {
    if (await canListen(port)) return port;
  }
  throw new Error(`None of these ports can be used: ${WEB_PORTS.join(', ')}. Add another one to WEB_PORTS in client/vite.config.js.`);
}

export default defineConfig(async ({ command }) => ({
  plugins: [react()],
  server:
    command === 'serve'
      ? {
          host: HOST,
          port: await firstUsablePort(),
          strictPort: true,
          // The browser only ever talks to one origin, so no CORS setup is needed.
          proxy: { '/api': `http://127.0.0.1:${apiPort()}` },
        }
      : undefined,
}));
