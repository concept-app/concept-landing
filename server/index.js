import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createOAuthBroker } from './oauth-broker/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

loadEnv();

const PORT = Number(process.env.PORT ?? 5173);
const HOST = process.env.HOST ?? '0.0.0.0';
const isProd = process.env.NODE_ENV === 'production';

const broker = createOAuthBroker();
let vite;

if (!isProd) {
  vite = await createViteServer({
    root: rootDir,
    server: { middlewareMode: true },
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (await broker.handle(req, res)) {
      return;
    }

    if (!isProd && vite) {
      vite.middlewares(req, res, (error) => {
        if (error) {
          vite.ssrFixStacktrace(error);
          res.statusCode = 500;
          res.end(error.stack);
          return;
        }
        if (res.writableEnded) return;
        serveViteIndex(req, res, vite).catch((err) => {
          vite.ssrFixStacktrace(err);
          res.statusCode = 500;
          res.end(err.stack ?? err.message);
        });
      });
      return;
    }

    if (await serveStatic(req, res)) {
      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  } catch (error) {
    res.statusCode = 500;
    res.end(error.message ?? 'Server error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Concept Landing server listening on http://${HOST}:${PORT}`);
  console.log(`OAuth broker paths: ${broker.paths.basePath}`);
});

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
};

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

async function serveStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return false;
  }

  const requestUrl = new URL(req.url || '/', `http://${req.headers.host ?? 'localhost'}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const candidatePaths = [];

  if (pathname.endsWith('/')) {
    candidatePaths.push(`${pathname}index.html`);
  } else {
    candidatePaths.push(pathname);
    if (!path.extname(pathname)) {
      candidatePaths.push(`${pathname}/index.html`);
    }
  }

  for (const candidate of candidatePaths) {
    const filePath = resolveStaticPath(candidate);
    if (!filePath) continue;
    const served = await tryServeFile(filePath, req, res);
    if (served) return true;
  }

  const acceptHeader = req.headers.accept ?? '';
  if (acceptHeader.includes('text/html')) {
    const fallbackPath = resolveStaticPath('/index.html');
    if (fallbackPath && (await tryServeFile(fallbackPath, req, res))) {
      return true;
    }
  }

  return false;
}

async function serveViteIndex(req, res, viteServer) {
  const url = req.url || '/';
  const template = await fs.promises.readFile(path.join(rootDir, 'index.html'), 'utf-8');
  const html = await viteServer.transformIndexHtml(url, template);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(html);
}

function resolveStaticPath(urlPath) {
  const normalized = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  const filePath = path.resolve(distDir, `.${normalized}`);
  if (!filePath.startsWith(distDir)) {
    return null;
  }
  return filePath;
}

async function tryServeFile(filePath, req, res) {
  try {
    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) return false;

    res.writeHead(200, {
      'Content-Type': getContentType(filePath),
      'Content-Length': stat.size,
    });

    if (req.method === 'HEAD') {
      res.end();
      return true;
    }

    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}
