import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getMotif, applyMotifColors, type Motif } from '../lib/motifs';
import { loadSettings, saveSettings, getEffectiveTheme, type ThemeMode, type AppSettings } from '../lib/settings';

interface ThemeContextValue {
  settings: AppSettings;
  effectiveTheme: 'light' | 'dark';
  motif: Motif;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const ThemeContext = createContext<ThemeContextValue>(null!);

export function useTheme() {
  return useContext(ThemeContext);
}

let fontLink: HTMLLinkElement | null = null;

function loadFonts(url: string) {
  if (fontLink?.href === url) return;
  if (fontLink) fontLink.remove();
  fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = url;
  document.head.appendChild(fontLink);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() =>
    getEffectiveTheme(settings.themeMode)
  );

  const motif = getMotif(settings.motifId);

  const apply = useCallback(() => {
    const theme = getEffectiveTheme(settings.themeMode);
    setEffectiveTheme(theme);
    const colors = theme === 'dark' ? motif.dark : motif.light;
    applyMotifColors(colors, motif.fonts);
    loadFonts(motif.fonts.url);
  }, [settings.themeMode, motif]);

  useEffect(() => {
    apply();
    if (settings.themeMode === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => apply();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [apply, settings.themeMode]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, effectiveTheme, motif, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}
