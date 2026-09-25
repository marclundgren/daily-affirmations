import { addDays } from '../../shared/schedule';

/**
 * Days on which a person finished everything that was due, kept in localStorage on this device.
 * Recorded as it happens, so later library edits don't rewrite history.
 */

const KEEP_DAYS = 400;
const key = (profileId: number) => `daily-affirmations:completed:${profileId}`;

export function loadCompletedDays(profileId: number): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key(profileId)) ?? '[]'));
  } catch {
    return new Set();
  }
}

export function saveCompletedDay(profileId: number, day: string, completed: boolean): Set<string> {
  const days = loadCompletedDays(profileId);
  if (completed) days.add(day);
  else days.delete(day);
  const cutoff = addDays(day, -KEEP_DAYS);
  const kept = [...days].filter(d => d >= cutoff).sort();
  try {
    localStorage.setItem(key(profileId), JSON.stringify(kept));
  } catch {
    // Private mode or full storage — the streak just won't persist.
  }
  return new Set(kept);
}
