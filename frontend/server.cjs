// Zero-dependency static server + React Router (SPA) fallback.
// Put this file NEXT TO the "dist" folder and use it as the Node.js start file.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.map': 'application/json',
};

function send(res, file, status = 200) {
  const ext = path.extname(file).toLowerCase();
  const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream' };
  headers['Cache-Control'] = file.includes(`${path.sep}assets${path.sep}`)
    ? 'public, max-age=31536000, immutable'
    : 'no-cache';
  res.writeHead(status, headers);
  fs.createReadStream(file).pipe(res);
}

http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(req.url.split('?')[0]); }
  catch { res.writeHead(400); return res.end('Bad request'); }

  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) return send(res, filePath);
    // A missing file with an extension (e.g. /assets/x.js) is a real 404
    if (path.extname(urlPath)) { res.writeHead(404); return res.end('Not found'); }
    // Any other route -> React app
    send(res, path.join(ROOT, 'index.html'));
  });
}).listen(PORT, () => console.log(`Frontend running on port ${PORT}`));
