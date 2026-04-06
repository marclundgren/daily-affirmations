import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Affirmation } from '../lib/types';

const STORAGE_KEY = 'affirmations_completions';

function getCompletedIds(date: string): number[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return stored[date] || [];
  } catch { return []; }
}

function setCompletedIds(date: string, ids: number[]) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    stored[date] = ids;
    // Keep only the last 7 days to avoid unbounded growth
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    for (const key of Object.keys(stored)) {
      if (key < cutoff.toISOString().split('T')[0]) delete stored[key];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {}
}

export function useTodayAffirmations() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [completedIds, setCompletedIdsState] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const refresh = useCallback(async () => {
    setLoading(true);
    const affs = await api.getTodayAffirmations();
    setAffirmations(affs);
    setCompletedIdsState(getCompletedIds(today));
    setLoading(false);
  }, [today]);

  useEffect(() => { refresh(); }, [refresh]);

  const markComplete = useCallback((affirmationId: number) => {
    const updated = [...getCompletedIds(today), affirmationId];
    setCompletedIds(today, updated);
    setCompletedIdsState(updated);
  }, [today]);

  const undoComplete = useCallback((affirmationId: number) => {
    const updated = getCompletedIds(today).filter(id => id !== affirmationId);
    setCompletedIds(today, updated);
    setCompletedIdsState(updated);
  }, [today]);

  const isCompleted = useCallback((affirmationId: number) => {
    return completedIds.includes(affirmationId);
  }, [completedIds]);

  return { affirmations, loading, markComplete, undoComplete, isCompleted, refresh };
}
