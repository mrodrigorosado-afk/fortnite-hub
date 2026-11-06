// Servidor Node.js sem dependências: serve o site (dist/) e faz proxy com cache da Fortnite-API.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { TtlCache } from './cache.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const UPSTREAM = process.env.FORTNITE_API || 'https://fortnite-api.com/v2';
const DIST = path.resolve(process.env.DIST_DIR || path.join(here, 'dist'));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const cache = new TtlCache(300);
const ttlFor = p => (p.startsWith('/shop') ? 60_000 : p.startsWith('/news') ? 300_000 : 3_600_000);
const SEC = { 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' };

function send(res, status, body, headers = {}) { res.writeHead(status, { ...SEC, ...headers }); res.end(body); }

async function proxy(req, res, url) {
  const route = url.pathname.slice(4);
  const key = route + url.search;
  let entry = cache.get(key), state = 'HIT';
  if (!entry) {
    state = 'MISS';
    try {
      const r = await fetch(UPSTREAM + key, { signal: AbortSignal.timeout(60_000) });
      entry = { status: r.status, gz: zlib.gzipSync(Buffer.from(await r.arrayBuffer())) };
      if (r.ok) cache.set(key, entry, ttlFor(route));
    } catch {
      return send(res, 502, JSON.stringify({ error: 'Fortnite-API indisponível' }), { 'content-type': 'application/json' });
    }
  }
  const h = { 'content-type': 'application/json; charset=utf-8', 'x-cache': state, 'cache-control': 'public, max-age=30' };
  if (/\bgzip\b/.test(req.headers['accept-encoding'] || '')) send(res, entry.status, entry.gz, { ...h, 'content-encoding': 'gzip' });
  else send(res, entry.status, zlib.gunzipSync(entry.gz), h);
}

async function serveStatic(res, url) {
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'Pedido inválido'); }
  if (rel.endsWith('/')) rel += 'index.html';
  let file = path.resolve(path.join(DIST, rel));
  if (file !== DIST && !file.startsWith(DIST + path.sep)) return send(res, 403, 'Proibido');
  let data;
  try { data = await readFile(file); } catch {
    file = path.join(DIST, 'index.html');
    try { data = await readFile(file); } catch { return send(res, 404, 'Executa "npm run build" primeiro.'); }
  }
  const immutable = file.includes(path.sep + 'assets' + path.sep);
  send(res, 200, data, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache' });
}

http.createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Método não permitido');
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/health') return send(res, 200, 'ok');
    if (url.pathname.startsWith('/api/')) return await proxy(req, res, url);
    await serveStatic(res, url);
  } catch { send(res, 500, 'Erro interno'); }
}).listen(PORT, () => console.log(`Fortnite Hub em http://localhost:${PORT}`));
