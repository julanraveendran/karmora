// Scanner webhook — accepts POST /scan { projectId } and runs
// scanProject() for that single project in the background. Responds
// 202 immediately so the caller (Vercel API route) doesn't block.
// The hourly cron still runs untouched.

import 'dotenv/config';
import { createServer } from 'node:http';
import { db } from './db.js';
import { loadProxies } from './proxy.js';
import { scanProject } from './index.js';

const PORT = Number(process.env.WEBHOOK_PORT) || 3001;
const SECRET = process.env.SCANNER_WEBHOOK_SECRET;

if (!SECRET) {
  console.error('[webhook] SCANNER_WEBHOOK_SECRET is required');
  process.exit(1);
}

loadProxies();

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method !== 'POST' || req.url !== '/scan') {
    res.writeHead(404);
    res.end('not found');
    return;
  }

  if (req.headers.authorization !== `Bearer ${SECRET}`) {
    res.writeHead(401);
    res.end('unauthorized');
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    res.writeHead(400);
    res.end('invalid json');
    return;
  }

  const projectId = body?.projectId;
  if (typeof projectId !== 'string' || projectId.length === 0) {
    res.writeHead(400);
    res.end('projectId required');
    return;
  }

  const { data: project, error } = await db
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (error || !project) {
    res.writeHead(404);
    res.end('project not found');
    return;
  }

  res.writeHead(202, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ accepted: true, projectId }));

  scanProject(project).catch((err) => {
    console.error(`[webhook] scanProject failed for ${projectId}:`, err);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[webhook] listening on :${PORT}`);
});
