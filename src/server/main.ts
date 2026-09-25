import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { openStore } from './db';
import { createApi } from './app';

const port = Number(process.env.PORT ?? 4410);
const host = process.env.HOST ?? '127.0.0.1';
const dataDir = process.env.DATA_DIR ?? 'data';
const clientDir = process.env.CLIENT_DIR ?? 'dist/client';

const app = new Hono()
  .route('/api', createApi(openStore(dataDir)))
  .use('/assets/*', serveStatic({ root: clientDir, onFound: (_path, c) => c.header('Cache-Control', 'public, max-age=31536000, immutable') }))
  .use('*', serveStatic({ root: clientDir }))
  // Client-side routes fall back to the app shell.
  .get('*', serveStatic({ root: clientDir, path: 'index.html' }));

serve({ fetch: app.fetch, port, hostname: host }, ({ address, port }) => {
  console.log(`Daily Affirmations listening on http://${address}:${port}`);
});
