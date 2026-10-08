'use client';

import { useApp } from './state';

/**
 * Springs, specified the way Apple's designers specify them: a damping ratio
 * and a response time, not mass, stiffness and damping.
 *
 * bounce 0 is critically damped, it reaches the target and stops. Anything
 * above 0 overshoots, and overshoot is only honest when the gesture that
 * started the motion carried momentum of its own. A sheet that just appeared
 * has no momentum to inherit, so it gets bounce 0.
 *
 * response is how long the value takes to visually arrive. It is not a
 * duration: the spring has no fixed length, and a new target mid flight only
 * changes where it is heading.
 *
 * The two numbers are converted to stiffness and damping here rather than
 * handed to Framer as bounce and visualDuration, because Framer throws away
 * the initial velocity of any spring that was specified by time, and the
 * release velocity of a drag is the whole point of a gesture driven spring.
 */
export function springFor(bounce: number, response: number) {
  const root = (2 * Math.PI) / (response * 1.2);
  const stiffness = root * root;
  const damping = 2 * Math.min(Math.max(1 - bounce, 0.05), 1) * root;
  return { type: 'spring' as const, stiffness, damping, mass: 1 };
}

export const spring = {
  /** Move or reposition, the house default. Apple ships damping 1.0, response 0.4. */
  default: springFor(0, 0.4),
  /** A flick or a throw landed this, so a little overshoot is earned. */
  lively: springFor(0.25, 0.4),
  /** Drawer and sheet. Apple ships damping 0.8, response 0.3. */
  sheet: springFor(0.2, 0.3),
  /** Press feedback has to arrive under the finger, so it is the fastest. */
  press: springFor(0, 0.18),
  /** Settling a gesture that ended without momentum: no bounce to inherit. */
  settle: springFor(0, 0.3),
} as const;

/**
 * Reduced motion is not the absence of feedback, it is a cross fade instead
 * of a slide. Overshoot and travel go; the change still reads.
 */
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

/** Whether springs and travel are allowed at all, for hand written gestures. */
export function useMotionAllowed() {
  return useApp().motionEnabled;
}
