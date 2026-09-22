'use client';

import { useApp } from './state';
import { spring, reducedTransition } from './tokens';

type SpringName = keyof typeof spring;

/**
 * Returns a Framer Motion transition that respects the reduced motion setting
 * (both the OS level one and the in app toggle).
 */
export function useTransition(name: SpringName = 'default') {
  const { motionEnabled } = useApp();
  return motionEnabled ? spring[name] : reducedTransition;
}

/** Staggered list entrance, collapses to a plain fade when motion is reduced. */
export function useStagger(index: number, step = 0.04) {
  const { motionEnabled } = useApp();
  if (!motionEnabled) return { ...reducedTransition, delay: 0 };
  return { ...spring.default, delay: Math.min(index * step, 0.4) };
}

export function useTapScale(scale = 0.97) {
  const { motionEnabled } = useApp();
  return motionEnabled ? { scale } : undefined;
}
