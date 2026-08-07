// Общий серверный токен Битрикс24 для записи в app.option от имени приложения,
// а не от имени конкретного открывшего его сотрудника.
//
// Почему это нужно: app.option.set в Битрикс24 разрешён только пользователям
// с правами администратора портала — обычный сотрудник, у которого приложение
// открыто в интерфейсе, получает ошибку доступа. Поэтому запись выполняется
// сервером под токеном, полученным один раз от администратора (см.
// maybeCaptureServiceToken), а не напрямую браузером пользователя.
import Redis from 'ioredis';

const SERVICE_TOKEN_KEY = 'iic:bx-service-token';
// Диагностика последней попытки открытия приложения — чтобы можно было
// понять, что произошло, через api/bitrix-status.js, не заходя в логи Vercel.
const LAST_OPEN_KEY = 'iic:bx-last-open';

// Redis Cloud (интеграция Vercel Marketplace) выдаёт обычную TCP-строку
// подключения в REDIS_URL, а не REST API — поэтому обычный клиент, не
// @upstash/redis. Клиент переиспользуется между вызовами в пределах одного
// «тёплого» экземпляра функции, чтобы не упираться в лимит подключений
// бесплатного плана (30 соединений).
let client;
function redis() {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('Redis (REDIS_URL) не подключён к проекту на Vercel');
  }
  if (!client) {
    client = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true });
  }
  return client;
}

async function kvGet(key) {
  const raw = await redis().get(key);
  return raw ? JSON.parse(raw) : null;
}

async function kvSet(key, value) {
  await redis().set(key, JSON.stringify(value));
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
  await kvSet(SERVICE_TOKEN_KEY, fresh);
  return fresh;
}

// Возвращает действующий сервисный токен, обновляя его через refresh_token,
// если он истёк. Бросает понятную ошибку, если токен ещё ни разу не был получен.
export async function getServiceToken() {
  const stored = await kvGet(SERVICE_TOKEN_KEY);
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
export async function maybeCaptureServiceToken(fields, rawKeysSeen) {
  const { domain, authId, authExpires, refreshId } = fields;
  const diag = {
    at: new Date().toISOString(),
    rawKeysSeen: rawKeysSeen || [],
    hasDomain: Boolean(domain),
    hasAuthId: Boolean(authId),
    hasRefreshId: Boolean(refreshId),
    profileOk: null,
    isAdmin: null,
    captured: false,
    error: null,
  };

  if (!domain || !authId || !refreshId) {
    // Битрикс24 прислал POST, но без ожидаемых полей — например, другой Content-Type
    // или формат payload. Сохраняем, какие ключи реально пришли, для диагностики.
    try {
      await kvSet(LAST_OPEN_KEY, diag);
    } catch {
      // Redis недоступен — просто пропускаем, не блокируем открытие страницы
    }
    return;
  }

  try {
    const res = await fetch(`https://${domain}/rest/profile?auth=${encodeURIComponent(authId)}`);
    const data = await res.json();
    diag.profileOk = Boolean(data.result);
    if (!data.result) {
      diag.error = data.error_description || data.error || 'profile lookup failed';
      await kvSet(LAST_OPEN_KEY, diag);
      return;
    }
    diag.isAdmin = Boolean(data.result.ADMIN);
    if (!data.result.ADMIN) {
      // не администратор — не трогаем текущий сервисный токен
      await kvSet(LAST_OPEN_KEY, diag);
      return;
    }

    await kvSet(SERVICE_TOKEN_KEY, {
      access_token: authId,
      refresh_token: refreshId,
      domain,
      expires_at: Date.now() + (Number(authExpires || 3600) - 60) * 1000,
    });
    diag.captured = true;
    await kvSet(LAST_OPEN_KEY, diag);
  } catch (err) {
    diag.error = err instanceof Error ? err.message : String(err);
    try {
      await kvSet(LAST_OPEN_KEY, diag);
    } catch {
      // Redis недоступен — не блокируем открытие страницы
    }
  }
}

// Диагностика последней попытки захвата токена (успешной или нет) — для
// api/bitrix-status.js.
export async function peekLastOpenAttempt() {
  return kvGet(LAST_OPEN_KEY);
}

// Только проверяет наличие сервисного токена, не обновляя его — для
// диагностического эндпоинта api/bitrix-status.js. В отличие от
// getServiceToken() не расходует refresh_token (он одноразовый).
export async function peekServiceToken() {
  const stored = await kvGet(SERVICE_TOKEN_KEY);
  if (!stored) return null;
  return { domain: stored.domain, expiresAt: stored.expires_at, valid: Date.now() < stored.expires_at };
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
