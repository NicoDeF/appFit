export const colors = {
  bg: '#07070f',
  card: '#0d0d1a',
  surface: '#131320',
  border: '#1c1c2e',
  accent: '#e84c3d',
  accentSoft: 'rgba(232,76,61,0.1)',
  accentGlow: 'rgba(232,76,61,0.25)',
  green: '#22c55e',
  greenSoft: 'rgba(34,197,94,0.1)',
  blue: '#60a5fa',
  blueSoft: 'rgba(96,165,250,0.1)',
  yellow: '#fbbf24',
  yellowSoft: 'rgba(251,191,36,0.1)',
  purple: '#a78bfa',
  purpleSoft: 'rgba(167,139,250,0.1)',
  text: '#f2f2fa',
  textMuted: '#6a6a88',
  textDim: '#2d2d45',
};

// Legacy default export for template compatibility
export default { light: { text: colors.text, background: colors.bg, tint: colors.accent, tabIconDefault: colors.textMuted, tabIconSelected: colors.accent }, dark: { text: colors.text, background: colors.bg, tint: colors.accent, tabIconDefault: colors.textMuted, tabIconSelected: colors.accent } };
