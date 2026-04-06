export type ThemeMode = 'light' | 'dark' | 'auto';

export interface AppSettings {
  themeMode: ThemeMode;
  motifId: string;
}

const STORAGE_KEY = 'affirmations_settings';

const defaults: AppSettings = {
  themeMode: 'auto',
  motifId: 'midnight-bloom',
};

export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaults, ...JSON.parse(stored) };
  } catch {}
  return defaults;
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'auto') return mode;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
