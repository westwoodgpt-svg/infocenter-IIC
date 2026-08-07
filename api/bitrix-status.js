// Диагностический эндпоинт: показывает, поймал ли сервер сервисный токен
// администратора, без раскрытия самого токена. Открыть в браузере:
// https://infocenter-iic.vercel.app/api/bitrix-status
import { peekServiceToken } from './_bitrixAuth.js';

export default async function handler(req, res) {
  const hasRedisUrl = Boolean(process.env.REDIS_URL);
  const hasBitrixCreds = Boolean(process.env.BITRIX_CLIENT_ID && process.env.BITRIX_CLIENT_SECRET);

  if (!hasRedisUrl || !hasBitrixCreds) {
    res.status(200).json({
      ok: false,
      hasRedisUrl,
      hasBitrixCreds,
      serviceToken: null,
      hint: 'Не заданы переменные окружения на Vercel — проверьте REDIS_URL / BITRIX_CLIENT_ID / BITRIX_CLIENT_SECRET и сделайте Redeploy.',
    });
    return;
  }

  try {
    const token = await peekServiceToken();
    res.status(200).json({
      ok: true,
      hasRedisUrl,
      hasBitrixCreds,
      serviceToken: token
        ? { domain: token.domain, valid: token.valid, expiresAt: new Date(token.expiresAt).toISOString() }
        : null,
      hint: token
        ? null
        : 'Сервисный токен ещё не сохранён — администратору нужно заново открыть приложение в Битрикс24 (полная перезагрузка, не просто переключение вкладки).',
    });
  } catch (err) {
    res.status(200).json({
      ok: false,
      hasRedisUrl,
      hasBitrixCreds,
      serviceToken: null,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
