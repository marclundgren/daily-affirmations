export interface MotifColors {
  bg: string;
  bgRaised: string;
  bgInput: string;
  border: string;
  borderFocus: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentSoftText: string;
  textOnAccent: string;
  success: string;
  successSoft: string;
  danger: string;
  progressBg: string;
  bullet: string;
  badgeWeekly: string;
  badgeWeeklyText: string;
  badgeMonthly: string;
  badgeMonthlyText: string;
}

export interface Motif {
  id: string;
  name: string;
  description: string;
  emoji: string;
  fonts: {
    display: string;
    body: string;
    url: string;
  };
  light: MotifColors;
  dark: MotifColors;
}

export const motifs: Motif[] = [
  {
    id: 'midnight-bloom',
    name: 'Midnight Bloom',
    description: 'Deep navy with luminous indigo. Elegant and mystical.',
    emoji: '🌙',
    fonts: {
      display: '"Cormorant Garamond", Georgia, serif',
      body: '"DM Sans", system-ui, sans-serif',
      url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap',
    },
    dark: {
      bg: '#080b16',
      bgRaised: '#111827',
      bgInput: '#1e293b',
      border: '#1e293b',
      borderFocus: '#6366f1',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#475569',
      accent: '#818cf8',
      accentHover: '#6366f1',
      accentSoft: 'rgba(99,102,241,0.15)',
      accentSoftText: '#a5b4fc',
      textOnAccent: '#ffffff',
      success: '#34d399',
      successSoft: 'rgba(52,211,153,0.15)',
      danger: '#f87171',
      progressBg: '#1e293b',
      bullet: '#818cf8',
      badgeWeekly: 'rgba(251,191,36,0.15)',
      badgeWeeklyText: '#fbbf24',
      badgeMonthly: 'rgba(52,211,153,0.15)',
      badgeMonthlyText: '#34d399',
    },
    light: {
      bg: '#f1f3f9',
      bgRaised: '#ffffff',
      bgInput: '#eef0f6',
      border: '#d8dce8',
      borderFocus: '#4f46e5',
      text: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
      accent: '#4f46e5',
      accentHover: '#4338ca',
      accentSoft: 'rgba(79,70,229,0.1)',
      accentSoftText: '#4f46e5',
      textOnAccent: '#ffffff',
      success: '#059669',
      successSoft: 'rgba(5,150,105,0.1)',
      danger: '#dc2626',
      progressBg: '#d8dce8',
      bullet: '#4f46e5',
      badgeWeekly: 'rgba(217,119,6,0.1)',
      badgeWeeklyText: '#b45309',
      badgeMonthly: 'rgba(5,150,105,0.1)',
      badgeMonthlyText: '#059669',
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm amber sunrise. Optimistic morning energy.',
    emoji: '🌅',
    fonts: {
      display: '"Playfair Display", Georgia, serif',
      body: '"Lora", Georgia, serif',
      url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:wght@400;500;600&display=swap',
    },
    dark: {
      bg: '#140e05',
      bgRaised: '#1f1508',
      bgInput: '#2a1c0b',
      border: '#3d2a10',
      borderFocus: '#f59e0b',
      text: '#fef3c7',
      textSecondary: '#d4a053',
      textMuted: '#92702f',
      accent: '#f59e0b',
      accentHover: '#d97706',
      accentSoft: 'rgba(245,158,11,0.15)',
      accentSoftText: '#fbbf24',
      textOnAccent: '#1a0e03',
      success: '#a3e635',
      successSoft: 'rgba(163,230,53,0.15)',
      danger: '#ef4444',
      progressBg: '#3d2a10',
      bullet: '#f59e0b',
      badgeWeekly: 'rgba(251,146,60,0.15)',
      badgeWeeklyText: '#fb923c',
      badgeMonthly: 'rgba(163,230,53,0.15)',
      badgeMonthlyText: '#a3e635',
    },
    light: {
      bg: '#fefbf3',
      bgRaised: '#ffffff',
      bgInput: '#fef7e8',
      border: '#f3e5c8',
      borderFocus: '#d97706',
      text: '#451a03',
      textSecondary: '#78350f',
      textMuted: '#b8860b',
      accent: '#d97706',
      accentHover: '#b45309',
      accentSoft: 'rgba(217,119,6,0.1)',
      accentSoftText: '#b45309',
      textOnAccent: '#ffffff',
      success: '#65a30d',
      successSoft: 'rgba(101,163,13,0.1)',
      danger: '#dc2626',
      progressBg: '#f3e5c8',
      bullet: '#d97706',
      badgeWeekly: 'rgba(234,88,12,0.1)',
      badgeWeeklyText: '#c2410c',
      badgeMonthly: 'rgba(101,163,13,0.1)',
      badgeMonthlyText: '#65a30d',
    },
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    description: 'Minimalist stone and moss. Calm and meditative.',
    emoji: '🪨',
    fonts: {
      display: '"Crimson Pro", Georgia, serif',
      body: '"Karla", system-ui, sans-serif',
      url: 'https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Karla:wght@400;500;600&display=swap',
    },
    dark: {
      bg: '#0d110e',
      bgRaised: '#161e18',
      bgInput: '#1e2a21',
      border: '#2a3b2e',
      borderFocus: '#6b8f71',
      text: '#d4ddd6',
      textSecondary: '#8fa894',
      textMuted: '#4a6350',
      accent: '#6b8f71',
      accentHover: '#5a7d60',
      accentSoft: 'rgba(107,143,113,0.15)',
      accentSoftText: '#8fb896',
      textOnAccent: '#ffffff',
      success: '#6b8f71',
      successSoft: 'rgba(107,143,113,0.15)',
      danger: '#c25550',
      progressBg: '#2a3b2e',
      bullet: '#8fb896',
      badgeWeekly: 'rgba(180,160,120,0.15)',
      badgeWeeklyText: '#c4b078',
      badgeMonthly: 'rgba(107,143,113,0.15)',
      badgeMonthlyText: '#8fb896',
    },
    light: {
      bg: '#f4f1eb',
      bgRaised: '#faf8f4',
      bgInput: '#edeae3',
      border: '#d4cfc5',
      borderFocus: '#4a6741',
      text: '#1a231c',
      textSecondary: '#4a5a4d',
      textMuted: '#8a9a8d',
      accent: '#4a6741',
      accentHover: '#3d5636',
      accentSoft: 'rgba(74,103,65,0.1)',
      accentSoftText: '#3d5636',
      textOnAccent: '#ffffff',
      success: '#4a6741',
      successSoft: 'rgba(74,103,65,0.1)',
      danger: '#b91c1c',
      progressBg: '#d4cfc5',
      bullet: '#4a6741',
      badgeWeekly: 'rgba(140,120,80,0.12)',
      badgeWeeklyText: '#6b5b32',
      badgeMonthly: 'rgba(74,103,65,0.1)',
      badgeMonthlyText: '#3d5636',
    },
  },
  {
    id: 'retrowave',
    name: 'Retrowave',
    description: 'Neon energy. Bold, fun, and motivational.',
    emoji: '🕹️',
    fonts: {
      display: '"Rubik", system-ui, sans-serif',
      body: '"Rubik", system-ui, sans-serif',
      url: 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap',
    },
    dark: {
      bg: '#0a0118',
      bgRaised: '#150330',
      bgInput: '#1f0545',
      border: '#2d0a5a',
      borderFocus: '#ff2d95',
      text: '#f0e6ff',
      textSecondary: '#b388ff',
      textMuted: '#7c4dff',
      accent: '#ff2d95',
      accentHover: '#e91e8c',
      accentSoft: 'rgba(255,45,149,0.2)',
      accentSoftText: '#ff6eb4',
      textOnAccent: '#ffffff',
      success: '#00ff9f',
      successSoft: 'rgba(0,255,159,0.15)',
      danger: '#ff4444',
      progressBg: '#2d0a5a',
      bullet: '#00e5ff',
      badgeWeekly: 'rgba(0,229,255,0.15)',
      badgeWeeklyText: '#00e5ff',
      badgeMonthly: 'rgba(0,255,159,0.15)',
      badgeMonthlyText: '#00ff9f',
    },
    light: {
      bg: '#fef5fa',
      bgRaised: '#ffffff',
      bgInput: '#fdeef5',
      border: '#f5c6e0',
      borderFocus: '#d6249f',
      text: '#2d0a3e',
      textSecondary: '#6b2fa0',
      textMuted: '#b06ec3',
      accent: '#d6249f',
      accentHover: '#b01d85',
      accentSoft: 'rgba(214,36,159,0.12)',
      accentSoftText: '#b01d85',
      textOnAccent: '#ffffff',
      success: '#00c77b',
      successSoft: 'rgba(0,199,123,0.1)',
      danger: '#e53935',
      progressBg: '#f5c6e0',
      bullet: '#d6249f',
      badgeWeekly: 'rgba(0,180,200,0.1)',
      badgeWeeklyText: '#0097a7',
      badgeMonthly: 'rgba(0,199,123,0.1)',
      badgeMonthlyText: '#00c77b',
    },
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    description: 'Soft pinks and dusty roses. Gentle and romantic.',
    emoji: '🌸',
    fonts: {
      display: '"Cormorant", Georgia, serif',
      body: '"Nunito", system-ui, sans-serif',
      url: 'https://fonts.googleapis.com/css2?family=Cormorant:wght@400;600;700&family=Nunito:wght@400;500;600&display=swap',
    },
    dark: {
      bg: '#160d12',
      bgRaised: '#221620',
      bgInput: '#2e1d2a',
      border: '#3d2838',
      borderFocus: '#ec4899',
      text: '#fce4ec',
      textSecondary: '#d48aa8',
      textMuted: '#8a5570',
      accent: '#ec4899',
      accentHover: '#db2777',
      accentSoft: 'rgba(236,72,153,0.15)',
      accentSoftText: '#f472b6',
      textOnAccent: '#ffffff',
      success: '#6bcf9a',
      successSoft: 'rgba(107,207,154,0.15)',
      danger: '#f87171',
      progressBg: '#3d2838',
      bullet: '#f472b6',
      badgeWeekly: 'rgba(196,140,180,0.15)',
      badgeWeeklyText: '#dba0c4',
      badgeMonthly: 'rgba(107,207,154,0.15)',
      badgeMonthlyText: '#6bcf9a',
    },
    light: {
      bg: '#fdf2f8',
      bgRaised: '#ffffff',
      bgInput: '#fce7f3',
      border: '#f5c6e0',
      borderFocus: '#be185d',
      text: '#500724',
      textSecondary: '#831843',
      textMuted: '#c084a8',
      accent: '#be185d',
      accentHover: '#9d174d',
      accentSoft: 'rgba(190,24,93,0.1)',
      accentSoftText: '#9d174d',
      textOnAccent: '#ffffff',
      success: '#059669',
      successSoft: 'rgba(5,150,105,0.1)',
      danger: '#dc2626',
      progressBg: '#f5c6e0',
      bullet: '#be185d',
      badgeWeekly: 'rgba(160,80,130,0.1)',
      badgeWeeklyText: '#9d174d',
      badgeMonthly: 'rgba(5,150,105,0.1)',
      badgeMonthlyText: '#059669',
    },
  },
  {
    id: 'emerald-dusk',
    name: 'Emerald Dusk',
    description: 'Deep forest greens and gold. Rich and grounding.',
    emoji: '🌿',
    fonts: {
      display: '"Bitter", Georgia, serif',
      body: '"Work Sans", system-ui, sans-serif',
      url: 'https://fonts.googleapis.com/css2?family=Bitter:wght@400;600;700&family=Work+Sans:wght@400;500;600&display=swap',
    },
    dark: {
      bg: '#060f0b',
      bgRaised: '#0c1a14',
      bgInput: '#132a20',
      border: '#1a3c2b',
      borderFocus: '#10b981',
      text: '#d1fae5',
      textSecondary: '#6ee7b7',
      textMuted: '#2d7a57',
      accent: '#10b981',
      accentHover: '#059669',
      accentSoft: 'rgba(16,185,129,0.15)',
      accentSoftText: '#34d399',
      textOnAccent: '#ffffff',
      success: '#10b981',
      successSoft: 'rgba(16,185,129,0.15)',
      danger: '#f87171',
      progressBg: '#1a3c2b',
      bullet: '#34d399',
      badgeWeekly: 'rgba(180,160,60,0.15)',
      badgeWeeklyText: '#d4c840',
      badgeMonthly: 'rgba(16,185,129,0.15)',
      badgeMonthlyText: '#34d399',
    },
    light: {
      bg: '#f0fdf4',
      bgRaised: '#ffffff',
      bgInput: '#ecfdf5',
      border: '#bbf7d0',
      borderFocus: '#047857',
      text: '#022c22',
      textSecondary: '#065f46',
      textMuted: '#6b9f85',
      accent: '#047857',
      accentHover: '#065f46',
      accentSoft: 'rgba(4,120,87,0.1)',
      accentSoftText: '#065f46',
      textOnAccent: '#ffffff',
      success: '#047857',
      successSoft: 'rgba(4,120,87,0.1)',
      danger: '#dc2626',
      progressBg: '#bbf7d0',
      bullet: '#047857',
      badgeWeekly: 'rgba(120,100,20,0.1)',
      badgeWeeklyText: '#6b5e1a',
      badgeMonthly: 'rgba(4,120,87,0.1)',
      badgeMonthlyText: '#065f46',
    },
  },
];

export function getMotif(id: string): Motif {
  return motifs.find(m => m.id === id) || motifs[0];
}

export function applyMotifColors(colors: MotifColors, fonts: Motif['fonts']) {
  const root = document.documentElement;
  root.style.setProperty('--bg', colors.bg);
  root.style.setProperty('--bg-raised', colors.bgRaised);
  root.style.setProperty('--bg-input', colors.bgInput);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--border-focus', colors.borderFocus);
  root.style.setProperty('--text', colors.text);
  root.style.setProperty('--text-secondary', colors.textSecondary);
  root.style.setProperty('--text-muted', colors.textMuted);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--accent-hover', colors.accentHover);
  root.style.setProperty('--accent-soft', colors.accentSoft);
  root.style.setProperty('--accent-soft-text', colors.accentSoftText);
  root.style.setProperty('--text-on-accent', colors.textOnAccent);
  root.style.setProperty('--success', colors.success);
  root.style.setProperty('--success-soft', colors.successSoft);
  root.style.setProperty('--danger', colors.danger);
  root.style.setProperty('--progress-bg', colors.progressBg);
  root.style.setProperty('--bullet', colors.bullet);
  root.style.setProperty('--badge-weekly', colors.badgeWeekly);
  root.style.setProperty('--badge-weekly-text', colors.badgeWeeklyText);
  root.style.setProperty('--badge-monthly', colors.badgeMonthly);
  root.style.setProperty('--badge-monthly-text', colors.badgeMonthlyText);
  root.style.setProperty('--font-display', fonts.display);
  root.style.setProperty('--font-body', fonts.body);
}
