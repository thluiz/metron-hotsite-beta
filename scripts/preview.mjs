// Serves dist/ on http://localhost:4321 the way Cloudflare Pages does, so
// the Playwright suite sees the same URLs as production:
//   - /dir      -> 308 /dir/        (directory with an index.html)
//   - /page.html -> 308 /page       and /page serves page.html
//   - rules from _redirects          (exact paths and a trailing /* splat)
// One deliberate difference: an unknown path is a 404 here. Cloudflare,
// without a 404.html, answers it with the home page and a 200, which would
// hide broken links from the tests.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const ROOT = 'dist';
const PORT = Number(process.env.PORT) || 4321;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.zip': 'application/zip', '.txt': 'text/plain; charset=utf-8',
};

const rules = existsSync(join(ROOT, '_redirects'))
  ? readFileSync(join(ROOT, '_redirects'), 'utf8').split('\n')
      .map(l => l.trim()).filter(l => l && !l.startsWith('#'))
      .map(l => { const [from, to, code = '302'] = l.split(/\s+/); return { from, to, code: Number(code) }; })
  : [];

const redirectFor = path => {
  for (const { from, to, code } of rules) {
    if (from.endsWith('/*')) {
      const base = from.slice(0, -1);
      if (path.startsWith(base)) return { to: to.replace(':splat', path.slice(base.length)), code };
    } else if (path === from) return { to, code };
  }
  return null;
};

const isFile = p => existsSync(p) && statSync(p).isFile();

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const path = decodeURIComponent(url.pathname);
  const send = (code, headers = {}) => { res.writeHead(code, headers); res.end(); };

  const r = redirectFor(path);
  if (r) return send(r.code, { Location: r.to.replace(/\/{2,}/g, '/') || '/' });

  const disk = normalize(join(ROOT, path));
  if (!disk.startsWith(normalize(ROOT))) return send(403);

  let file = null;
  if (path.endsWith('.html') && isFile(disk)) {
    const clean = path.endsWith('/index.html') ? path.slice(0, -10) : path.slice(0, -5);
    return send(308, { Location: clean + url.search });
  }
  if (path.endsWith('/')) file = isFile(join(disk, 'index.html')) ? join(disk, 'index.html') : null;
  else if (isFile(disk) && !path.endsWith('/_redirects')) file = disk;
  else if (isFile(join(disk, 'index.html'))) return send(308, { Location: path + '/' + url.search });
  else if (isFile(disk + '.html')) file = disk + '.html';

  if (!file) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`dist/ on http://localhost:${PORT}`));
