/**
 * Design tokens for the ReSello consumer demo.
 * The colour values live in app/globals.css as CSS variables, these exports
 * cover the tokens that components need in JavaScript (springs, spacing, sizes).
 */

export const spring = {
  /** Default UI spring, calm and precise. */
  default: { type: 'spring', stiffness: 170, damping: 26, mass: 1 },
  /** Livelier spring for mascots, badges and celebratory moments. */
  lively: { type: 'spring', stiffness: 100, damping: 10, mass: 1 },
  /** Sheet / modal presentation. */
  sheet: { type: 'spring', stiffness: 130, damping: 18, mass: 1 },
  /** Snappy press feedback. */
  press: { type: 'spring', stiffness: 400, damping: 30, mass: 0.6 },
} as const;

/** Fade used when the user prefers reduced motion. */
export const reducedTransition = { duration: 0.15, ease: 'easeOut' } as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

/** Apple HIG component metrics used by the shell. */
export const metrics = {
  navbarHeight: 44,
  largeTitleExtra: 52,
  tabbarHeight: 49,
  minTouchTarget: 44,
  screenMargin: 16,
  /** iPhone 16 Pro logical viewport. */
  deviceWidth: 402,
  deviceHeight: 874,
} as const;

export const typography = {
  largeTitle: 't-large-title',
  title1: 't-title1',
  title2: 't-title2',
  title3: 't-title3',
  headline: 't-headline',
  body: 't-body',
  callout: 't-callout',
  subhead: 't-subhead',
  footnote: 't-footnote',
  caption1: 't-caption1',
  caption2: 't-caption2',
} as const;
