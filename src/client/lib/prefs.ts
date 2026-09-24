import { useCallback, useEffect, useSyncExternalStore } from 'react';

/** Small per-device preferences, kept in localStorage. */
export interface Prefs {
  profileId: number | null;
  theme: 'system' | 'light' | 'dark';
  autoAdvance: boolean;
}

const KEY = 'daily-affirmations:prefs';
const DEFAULTS: Prefs = { profileId: null, theme: 'system', autoAdvance: true };
const listeners = new Set<() => void>();

function read(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return DEFAULTS;
  }
}

let current = read();

export function setPrefs(patch: Partial<Prefs>) {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // Private mode — preferences last for this session only.
  }
  listeners.forEach(l => l());
}

export function usePrefs(): [Prefs, (patch: Partial<Prefs>) => void] {
  const prefs = useSyncExternalStore(
    l => (listeners.add(l), () => listeners.delete(l)),
    () => current,
  );
  return [prefs, useCallback(setPrefs, [])];
}

/** Applies the theme preference to <html>, following the OS when set to "system". */
export function useThemeEffect(theme: Prefs['theme']) {
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: light)');
    const apply = () => {
      const resolved = theme === 'system' ? (media.matches ? 'light' : 'dark') : theme;
      document.documentElement.dataset.theme = resolved;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'light' ? '#f8f4f0' : '#0e0c10');
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
}
