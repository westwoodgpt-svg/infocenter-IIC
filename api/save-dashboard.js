// Принимает изменения дашборда от ЛЮБОГО авторизованного сотрудника портала и
// сохраняет их в app.option от имени сервисного (администраторского) токена —
// см. api/_bitrixAuth.js о том, почему это нужно.
import { verifyUserToken, bxAppOptionSet } from './_bitrixAuth.js';

const OPTION_KEY = 'iic_dashboard_v1';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  let payload;
  try {
    const raw = await readBody(req);
    payload = JSON.parse(raw);
  } catch {
    res.status(400).json({ ok: false, error: 'некорректный JSON в теле запроса' });
    return;
  }

  const { state, auth } = payload || {};
  if (!state || !auth || !auth.access_token || !auth.domain) {
    res.status(400).json({ ok: false, error: 'отсутствует state или auth' });
    return;
  }

  const isValidUser = await verifyUserToken({ accessToken: auth.access_token, domain: auth.domain });
  if (!isValidUser) {
    res.status(403).json({ ok: false, error: 'сессия Битрикс24 недействительна — обновите страницу' });
    return;
  }

  try {
    await bxAppOptionSet(OPTION_KEY, JSON.stringify(state));
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
}
