import { useCallback, useEffect, useState } from 'react';
import { AnyCard, DashboardState, TabId } from './types';
import { SEED_DATA, EMPTY_DASHBOARD } from './seedData';

const STORAGE_KEY = 'iic-dashboard-v1';

function loadInitial(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DashboardState;
  } catch {
    // ignore corrupt storage, fall back to seed
  }
  return SEED_DATA;
}

function persist(state: DashboardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode, quota) — edits stay in-memory only
  }
}

let counter = 0;
export function newCardId() {
  counter += 1;
  return `card-${Date.now()}-${counter}`;
}

export function useDashboardStore() {
  const [state, setState] = useState<DashboardState>(() => loadInitial());

  useEffect(() => {
    persist(state);
  }, [state]);

  const addCard = useCallback((tab: TabId, card: AnyCard) => {
    setState((prev) => ({ ...prev, [tab]: [...prev[tab], card] }));
  }, []);

  const updateCard = useCallback((tab: TabId, card: AnyCard) => {
    setState((prev) => ({
      ...prev,
      [tab]: prev[tab].map((c) => (c.id === card.id ? card : c)),
    }));
  }, []);

  const deleteCard = useCallback((tab: TabId, cardId: string) => {
    setState((prev) => ({
      ...prev,
      [tab]: prev[tab].filter((c) => c.id !== cardId),
    }));
  }, []);

  const moveCard = useCallback((tab: TabId, cardId: string, direction: -1 | 1) => {
    setState((prev) => {
      const list = [...prev[tab]];
      const idx = list.findIndex((c) => c.id === cardId);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= list.length) return prev;
      [list[idx], list[target]] = [list[target], list[idx]];
      return { ...prev, [tab]: list };
    });
  }, []);

  const resetToSeed = useCallback(() => setState(SEED_DATA), []);
  const clearAll = useCallback(() => setState(EMPTY_DASHBOARD), []);
  const replaceAll = useCallback((next: DashboardState) => setState(next), []);

  return { state, addCard, updateCard, deleteCard, moveCard, resetToSeed, clearAll, replaceAll };
}
