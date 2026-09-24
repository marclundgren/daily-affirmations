import type { Affirmation } from './types';

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Local calendar day as YYYY-MM-DD (not UTC — progress resets at local midnight). */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, delta: number): string {
  const date = parseDay(key);
  date.setDate(date.getDate() + delta);
  return dayKey(date);
}

export function isDue(aff: Affirmation, date: Date): boolean {
  if (aff.archived) return false;
  switch (aff.cadence) {
    case 'daily':
      return true;
    case 'weekly':
      return aff.days.includes(date.getDay());
    case 'monthly': {
      const today = date.getDate();
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      // A day that doesn't exist this month (e.g. the 31st) falls on the last day.
      return aff.days.some(d => d === today || (d > lastDay && today === lastDay));
    }
  }
}

function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
  return `${n}${suffix}`;
}

export function describeSchedule(aff: Pick<Affirmation, 'cadence' | 'days'>): string {
  const days = [...aff.days].sort((a, b) => a - b);
  switch (aff.cadence) {
    case 'daily':
      return 'Every day';
    case 'weekly':
      return days.length ? `Weekly · ${days.map(d => WEEKDAYS[d]).join(', ')}` : 'Weekly · no days set';
    case 'monthly':
      return days.length ? `Monthly · the ${days.map(ordinal).join(', ')}` : 'Monthly · no day set';
  }
}

/** Consecutive days (ending today, or yesterday if today isn't started yet) with at least one reading. */
export function streak(readDays: Set<string>, today: string): number {
  let day = readDays.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (readDays.has(day)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}
