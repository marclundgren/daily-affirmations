import { Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { motifs } from '../lib/motifs';
import type { ThemeMode } from '../lib/settings';

const themeModes: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'auto', label: 'Auto', icon: '💻' },
];

export default function Settings() {
  const { settings, effectiveTheme, updateSettings } = useTheme();

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 backdrop-blur-lg border-b px-5 py-4"
        style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Link to="/today" className="transition-colors" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold font-[family-name:var(--font-display)]" style={{ color: 'var(--text)' }}>
            Settings
          </h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-8 max-w-2xl mx-auto">
        {/* Theme Mode */}
        <section>
          <h2
            className="text-sm font-semibold uppercase tracking-wider mb-3 font-[family-name:var(--font-body)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Theme
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {themeModes.map(mode => (
              <button
                key={mode.value}
                onClick={() => updateSettings({ themeMode: mode.value })}
                className="py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97] font-[family-name:var(--font-body)]"
                style={{
                  background: settings.themeMode === mode.value ? 'var(--accent)' : 'var(--bg-raised)',
                  color: settings.themeMode === mode.value ? 'var(--text-on-accent)' : 'var(--text)',
                  border: settings.themeMode === mode.value ? 'none' : '1px solid var(--border)',
                }}
              >
                <span className="mr-1.5">{mode.icon}</span>
                {mode.label}
              </button>
            ))}
          </div>
          <p className="text-xs mt-2 font-[family-name:var(--font-body)]" style={{ color: 'var(--text-muted)' }}>
            Currently using {effectiveTheme} mode
          </p>
        </section>

        {/* Motif Selection */}
        <section>
          <h2
            className="text-sm font-semibold uppercase tracking-wider mb-3 font-[family-name:var(--font-body)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Motif
          </h2>
          <div className="space-y-3">
            {motifs.map(motif => {
              const isSelected = settings.motifId === motif.id;
              const previewColors = effectiveTheme === 'dark' ? motif.dark : motif.light;
              return (
                <button
                  key={motif.id}
                  onClick={() => updateSettings({ motifId: motif.id })}
                  className="w-full text-left rounded-xl transition-all active:scale-[0.98] overflow-hidden"
                  style={{
                    border: isSelected ? `2px solid var(--accent)` : '1px solid var(--border)',
                    background: 'var(--bg-raised)',
                    padding: isSelected ? '15px' : '16px',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Color preview swatch */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden relative" style={{ background: previewColors.bg }}>
                      <div
                        className="absolute inset-x-1 top-1 h-3 rounded"
                        style={{ background: previewColors.accent }}
                      />
                      <div
                        className="absolute inset-x-1 top-5 h-2 rounded"
                        style={{ background: previewColors.bgRaised }}
                      />
                      <div
                        className="absolute inset-x-1 top-8 h-2 rounded"
                        style={{ background: previewColors.bgRaised }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{motif.emoji}</span>
                        <span
                          className="font-semibold font-[family-name:var(--font-body)]"
                          style={{ color: 'var(--text)' }}
                        >
                          {motif.name}
                        </span>
                        {isSelected && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'var(--accent-soft)', color: 'var(--accent-soft-text)' }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <p
                        className="text-sm mt-0.5 font-[family-name:var(--font-body)]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {motif.description}
                      </p>
                    </div>
                  </div>
                  {/* Font preview */}
                  <div
                    className="mt-3 pt-3 text-xs"
                    style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  >
                    <span style={{ fontFamily: motif.fonts.display }}>Display Font</span>
                    <span className="mx-2">·</span>
                    <span style={{ fontFamily: motif.fonts.body }}>Body Font</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
