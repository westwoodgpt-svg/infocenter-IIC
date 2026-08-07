// Vercel Serverless Function — раздаёт собранный dist/ для ЛЮБОГО HTTP-метода.
// Битрикс24 открывает локальное приложение POST-запросом (передаёт токен
// авторизации во внутренний iframe); обычная статическая раздача Vercel/CDN
// отвечает на POST ошибкой 405, поэтому здесь принудительно отдаём файл
// напрямую из функции. Тот же приём, что и в infocenter-RCK.
import { readFileSync, existsSync } from 'fs';
import { join, extname, normalize } from 'path';
import { maybeCaptureServiceToken } from './_bitrixAuth.js';

const DIST = join(process.cwd(), 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', () => resolve(''));
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Битрикс24 открывает локальные приложения POST-запросом с AUTH_ID/REFRESH_ID
    // открывшего пользователя. Если это администратор портала — обновляем
    // сервисный токен для api/save-dashboard.js (см. _bitrixAuth.js). Не блокируем
    // отдачу страницы этим запросом — обрабатываем его в фоне.
    readBody(req)
      .then((raw) => {
        const params = new URLSearchParams(raw);
        return maybeCaptureServiceToken({
          domain: params.get('DOMAIN'),
          authId: params.get('AUTH_ID'),
          authExpires: params.get('AUTH_EXPIRES'),
          refreshId: params.get('REFRESH_ID'),
        });
      })
      .catch(() => {});
  }

  const host = req.headers.host || 'localhost';
  const url = new URL(req.url, `http://${host}`);
  let pathname = normalize(decodeURIComponent(url.pathname));

  if (pathname === '/' || pathname === '.') pathname = '/index.html';

  let filePath = join(DIST, pathname);

  if (!filePath.startsWith(DIST) || !existsSync(filePath)) {
    filePath = join(DIST, 'index.html');
  }

  const ext = extname(filePath);
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  res.status(200).send(readFileSync(filePath));
}
