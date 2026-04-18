/**
 * Design Tokens — fonte única de verdade para cores, espaçamentos,
 * tipografia, sombras e raios de borda.
 *
 * Use sempre estas constantes nos componentes em vez de valores literais.
 * Para classes Tailwind, os tokens já estão mapeados em tailwind.config.js
 * e index.css via variáveis CSS.
 */

export const colors = {
  /* Brand / Purple */
  purple50:  'var(--purple-50)',
  purple100: 'var(--purple-100)',
  purple200: 'var(--purple-200)',
  purple300: 'var(--purple-300)',
  purple400: 'var(--purple-400)',
  purple500: 'var(--purple-500)',
  purple600: 'var(--purple-600)',
  purple700: 'var(--purple-700)',
  purple800: 'var(--purple-800)',
  purple900: 'var(--purple-900)',

  /* Grays */
  gray50:  'var(--gray-50)',
  gray100: 'var(--gray-100)',
  gray150: 'var(--gray-150)',
  gray200: 'var(--gray-200)',
  gray300: 'var(--gray-300)',
  gray400: 'var(--gray-400)',
  gray500: 'var(--gray-500)',
  gray600: 'var(--gray-600)',
  gray700: 'var(--gray-700)',
  gray800: 'var(--gray-800)',
  gray900: 'var(--gray-900)',

  /* Semantic */
  green50:  'var(--green-50)',
  green500: 'var(--green-500)',
  green600: 'var(--green-600)',
  red50:    'var(--red-50)',
  red400:   'var(--red-400)',
  red500:   'var(--red-500)',
  red600:   'var(--red-600)',
  orange50:  'var(--orange-50)',
  orange400: 'var(--orange-400)',
  orange500: 'var(--orange-500)',
  blue50:   'var(--blue-50)',
  blue500:  'var(--blue-500)',
  yellow50:  'var(--yellow-50)',
  yellow500: 'var(--yellow-500)',

  white: '#ffffff',
  black: '#000000',
};

export const shadows = {
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
};

export const radii = {
  xs:   'var(--r-xs)',   // 8px
  sm:   'var(--r-sm)',   // 12px
  md:   'var(--r-md)',   // 16px
  lg:   'var(--r-lg)',   // 20px
  xl:   'var(--r-xl)',   // 24px
  '2xl':'var(--r-2xl)',  // 32px
  full: 'var(--r-full)', // 9999px
};

export const spacing = {
  pagePad:    'var(--page-pad)',    // 20px
  sectionGap: 'var(--section-gap)',// 16px
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  '2xl': 48,
  '3xl': 64,
};

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  sizes: {
    xs:   11,
    sm:   12,
    base: 14,
    md:   15,
    lg:   17,
    xl:   20,
    '2xl': 22,
    '3xl': 28,
    '4xl': 32,
  },
  weights: {
    regular:   400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
    black:     900,
  },
  lineHeights: {
    tight:  1.25,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const zIndex = {
  base:    1,
  overlay: 1000,
  modal:   1001,
  toast:   1100,
};

export const transitions = {
  fast:   'all 0.15s ease',
  normal: 'all 0.2s ease',
  slow:   'all 0.35s ease',
};