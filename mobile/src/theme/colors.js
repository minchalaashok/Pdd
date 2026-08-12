// LifeLink Mobile — Shared Design Tokens (matches website theme)
export const COLORS = {
  // Backgrounds
  bgMain:   '#0B0F17',
  bgCard:   '#161C28',
  bgCard2:  '#1E2638',
  border:   '#263147',

  // Brand
  primary:  '#E53935',
  primaryDark: '#C62828',
  secondary: '#1976D2',
  accent:   '#43A047',
  warning:  '#FB8C00',

  // Text
  textMain:  '#F1F5F9',
  textMuted: '#94A3B8',
  textLight: '#CBD5E1',

  // Status
  success: '#43A047',
  danger:  '#E53935',
  info:    '#1976D2',

  // Gradients (used as array for LinearGradient)
  gradientPrimary: ['#E53935', '#C62828'],
  gradientDark:    ['#0B0F17', '#161C28'],
  gradientBlue:    ['#1565C0', '#1976D2'],
};

export const FONTS = {
  regular: { fontFamily: 'System' },
  bold:    { fontFamily: 'System', fontWeight: '700' },
  heavy:   { fontFamily: 'System', fontWeight: '800' },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primary: {
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};
