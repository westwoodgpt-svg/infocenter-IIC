import { DashboardState } from './types';

// Общее хранилище дашборда на уровне приложения Битрикс24 (app.option) —
// один и тот же ключ виден всем пользователям портала, установившим
// локальное приложение. В отличие от localStorage (per-browser), это даёт
// действительно общие данные для всех, кто открывает инфоцентр из Битрикс24.

const OPTION_KEY = 'iic_dashboard_v1';
const INIT_TIMEOUT_MS = 4000;

declare global {
  interface Window {
    BX24?: {
      init: (cb: () => void) => void;
      callMethod: (method: string, params: Record<string, unknown>, cb: (result: BXResult) => void) => void;
    };
  }
}

interface BXResult {
  error: () => { ex?: { error_description?: string }; error_description?: string } | null;
  data: () => Record<string, string>;
}

export function isInIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

export function hasBX24(): boolean {
  return typeof window !== 'undefined' && !!window.BX24;
}

export function bx24Init(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!hasBX24()) {
      resolve(false);
      return;
    }
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    try {
      window.BX24!.init(() => finish(true));
    } catch {
      finish(false);
    }
    setTimeout(() => finish(hasBX24()), INIT_TIMEOUT_MS);
  });
}

function bxErrorMessage(result: BXResult): string {
  const err = result.error();
  if (!err) return '';
  return err.ex?.error_description || err.error_description || 'неизвестная ошибка';
}

export function fetchDashboardOption(): Promise<{ state: DashboardState | null; error: string | null }> {
  return new Promise((resolve) => {
    if (!hasBX24()) {
      resolve({ state: null, error: null });
      return;
    }
    window.BX24!.callMethod('app.option.get', {}, (result) => {
      if (result.error()) {
        resolve({ state: null, error: bxErrorMessage(result) });
        return;
      }
      const options = result.data() || {};
      const raw = options[OPTION_KEY];
      if (!raw) {
        resolve({ state: null, error: null });
        return;
      }
      try {
        resolve({ state: JSON.parse(raw) as DashboardState, error: null });
      } catch {
        resolve({ state: null, error: 'повреждённые данные в app.option' });
      }
    });
  });
}

export function saveDashboardOption(state: DashboardState): Promise<{ ok: boolean; error: string | null }> {
  return new Promise((resolve) => {
    if (!hasBX24()) {
      resolve({ ok: false, error: 'нет соединения с Битрикс24' });
      return;
    }
    window.BX24!.callMethod('app.option.set', { options: { [OPTION_KEY]: JSON.stringify(state) } }, (result) => {
      if (result.error()) {
        resolve({ ok: false, error: bxErrorMessage(result) });
        return;
      }
      resolve({ ok: true, error: null });
    });
  });
}
