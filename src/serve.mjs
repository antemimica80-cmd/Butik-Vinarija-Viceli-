// Minimal static server for dist/ (clean URLs, 404 fallback)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
const dir = new URL('../' + (process.argv[2] || 'dist') + '/', import.meta.url).pathname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
const port = +process.env.PORT || 4173;
createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = join(dir, p);
  try { if ((await stat(f)).isDirectory()) f = join(f, 'index.html'); } catch {}
  try { const b = await readFile(f); res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' }); res.end(b); }
  catch { const nf = p.startsWith('/en/') ? 'en/404.html' : '404.html'; res.writeHead(404, { 'content-type': types['.html'] }); res.end(await readFile(join(dir, nf)).catch(() => 'Not found')); }
}).listen(port, () => console.log(`http://localhost:${port}`));
