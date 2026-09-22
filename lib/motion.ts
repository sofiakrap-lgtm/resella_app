'use client';

import { useApp } from './state';

/** iOS style springs. Only transform and opacity are ever animated. */
export const spring = {
  default: { type: 'spring', stiffness: 170, damping: 26, mass: 1 },
  lively: { type: 'spring', stiffness: 100, damping: 10, mass: 1 },
  sheet: { type: 'spring', stiffness: 130, damping: 18, mass: 1 },
  press: { type: 'spring', stiffness: 400, damping: 30, mass: 0.6 },
} as const;

const reduced = { duration: 0.15, ease: 'easeOut' } as const;

export function useTransition(name: keyof typeof spring = 'default') {
  const { motionEnabled } = useApp();
  return motionEnabled ? spring[name] : reduced;
}

export function useStagger(index: number, step = 0.04) {
  const { motionEnabled } = useApp();
  if (!motionEnabled) return { ...reduced, delay: 0 };
  return { ...spring.default, delay: Math.min(index * step, 0.35) };
}

export function useTapScale(scale = 0.97) {
  const { motionEnabled } = useApp();
  return motionEnabled ? { scale } : undefined;
}
