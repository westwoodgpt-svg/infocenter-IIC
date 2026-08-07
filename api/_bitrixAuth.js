// Общий серверный токен Битрикс24 для записи в app.option от имени приложения,
// а не от имени конкретного открывшего его сотрудника.
//
// Почему это нужно: app.option.set в Битрикс24 разрешён только пользователям
// с правами администратора портала — обычный сотрудник, у которого приложение
// открыто в интерфейсе, получает ошибку доступа. Поэтому запись выполняется
// сервером под токеном, полученным один раз от администратора (см.
// maybeCaptureServiceToken), а не напрямую браузером пользователя.
import { Redis } from '@upstash/redis';

const SERVICE_TOKEN_KEY = 'iic:bx-service-token';

// Поддерживаем оба варианта имён переменных окружения — Vercel Marketplace
// (интеграция «Upstash for Redis» / бывший Vercel KV) выставляет KV_REST_API_*,
// прямая интеграция Upstash — UPSTASH_REDIS_REST_*.
function redis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Redis (KV_REST_API_URL/KV_REST_API_TOKEN) не подключён к проекту на Vercel');
  }
  return new Redis({ url, token });
}

// Единая точка OAuth для облачных порталов Битрикс24 (domain передаётся в
// запросе/ответе, отдельный per-portal URL не нужен).
const OAUTH_TOKEN_URL = 'https://oauth.bitrix.info/oauth/token/';

async function refreshServiceToken(stored) {
  const clientId = process.env.BITRIX_CLIENT_ID;
  const clientSecret = process.env.BITRIX_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('BITRIX_CLIENT_ID/BITRIX_CLIENT_SECRET не заданы на сервере');
  }

  const url = new URL(OAUTH_TOKEN_URL);
  url.searchParams.set('grant_type', 'refresh_token');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('client_secret', clientSecret);
  url.searchParams.set('refresh_token', stored.refresh_token);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'не удалось обновить токен Битрикс24');
  }

  const fresh = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    domain: data.domain || stored.domain,
    expires_at: Date.now() + (Number(data.expires_in || 3600) - 60) * 1000,
  };
  await redis().set(SERVICE_TOKEN_KEY, fresh);
  return fresh;
}

// Возвращает действующий сервисный токен, обновляя его через refresh_token,
// если он истёк. Бросает понятную ошибку, если токен ещё ни разу не был получен.
export async function getServiceToken() {
  const stored = await redis().get(SERVICE_TOKEN_KEY);
  if (!stored) {
    throw new Error(
      'Сервисный токен ещё не получен — попросите администратора один раз открыть приложение в Битрикс24'
    );
  }
  if (Date.now() < stored.expires_at) return stored;
  return refreshServiceToken(stored);
}

// Вызывается из api/serve.js при каждом открытии приложения (Битрикс24 шлёт
// POST с AUTH_ID/REFRESH_ID открывшего пользователя). Если это администратор
// портала — обновляем сервисный токен, которым потом пользуется
// api/save-dashboard.js от имени любого сотрудника. Обычных пользователей
// открытие приложения никак не затрагивает — текущий сервисный токен просто
// не трогается.
export async function maybeCaptureServiceToken({ domain, authId, authExpires, refreshId }) {
  if (!domain || !authId || !refreshId) return;
  try {
    const res = await fetch(`https://${domain}/rest/profile?auth=${encodeURIComponent(authId)}`);
    const data = await res.json();
    if (!data.result || !data.result.ADMIN) return;

    await redis().set(SERVICE_TOKEN_KEY, {
      access_token: authId,
      refresh_token: refreshId,
      domain,
      expires_at: Date.now() + (Number(authExpires || 3600) - 60) * 1000,
    });
  } catch {
    // портал недоступен / сеть — просто пропускаем попытку, не блокируем открытие страницы
  }
}

// Лёгкая проверка, что запрос на сохранение действительно пришёл от текущего
// авторизованного сотрудника этого портала (а не произвольного POST извне).
// Не проверяет права — только то, что токен валиден прямо сейчас.
export async function verifyUserToken({ accessToken, domain }) {
  if (!accessToken || !domain) return false;
  try {
    const res = await fetch(`https://${domain}/rest/profile?auth=${encodeURIComponent(accessToken)}`);
    const data = await res.json();
    return Boolean(data.result);
  } catch {
    return false;
  }
}

export async function bxAppOptionSet(key, value) {
  const token = await getServiceToken();
  const body = new URLSearchParams();
  body.set('auth', token.access_token);
  body.set(`options[${key}]`, value);

  const res = await fetch(`https://${token.domain}/rest/app.option.set`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  return data.result;
}
