'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { animate } from 'framer-motion';
import type { AnimationPlaybackControls } from 'framer-motion';
import { spring } from '@/lib/motion';
import { HYSTERESIS, VelocityTracker, capture, project, release, rubberband } from '@/lib/physics';
import { useApp } from '@/lib/state';

/** The four tab roots are where back has nowhere to go. */
const ROOTS = ['/koti', '/selaa', '/toivelista', '/oma'];

/**
 * Edge swipe back. A drag that starts in the left 20px carries the screen with
 * the finger, and goes back when the throw is heading past a third of the
 * width, judged from the projected endpoint rather than from where the finger
 * happened to stop.
 *
 * The previous screen is not mounted, so there is nothing real to parallax
 * behind this one; a darkened field stands in for it and lightens as the
 * screen moves away, which reads the same way in the hand.
 *
 * Both the commit and the cancel are springs that start at the finger's
 * release velocity, and a new touch during either one stops it where it is,
 * so the gesture can be reversed mid flight.
 */
export function EdgeBack({ target }: { target: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { motionEnabled } = useApp();

  useEffect(() => {
    if (ROOTS.includes(pathname)) return;
    const element = document.getElementById(target);
    if (!element) return;

    let pointerId = -1;
    let startX = 0;
    let startY = 0;
    let startOffset = 0;
    let offset = 0;
    let decided = false;
    let watching = false;
    let playback: AnimationPlaybackControls | null = null;
    const tracker = new VelocityTracker();
    const width = element.clientWidth || window.innerWidth;

    const paint = (value: number) => {
      offset = value;
      element.style.transform = `translateX(${value}px)`;
      // A large surface in motion stays slightly transparent while it travels.
      element.style.opacity = String(1 - Math.min(value / width, 1) * 0.25);
    };

    const clear = () => {
      element.style.willChange = '';
      element.style.transform = '';
      element.style.opacity = '';
      offset = 0;
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') return;
      // Interruption: a screen that is still settling is handed to the finger
      // at its current position, not at where it was going.
      playback?.stop();
      playback = null;
      if (event.clientX > 20 && offset <= 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startOffset = offset;
      decided = offset > 0;
      watching = true;
      tracker.reset();
      tracker.add(event.clientX);
      element.style.willChange = 'transform, opacity';
    };

    const onMove = (event: PointerEvent) => {
      if (!watching || event.pointerId !== pointerId) return;
      tracker.add(event.clientX);
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (!decided) {
        if (Math.abs(dx) < HYSTERESIS && Math.abs(dy) < HYSTERESIS) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          // A vertical intent wins: cancel this one and let the page scroll.
          watching = false;
          element.style.willChange = '';
          return;
        }
        decided = true;
        startX = event.clientX;
        startOffset = offset;
        capture(element, pointerId);
      }

      const raw = startOffset + (event.clientX - startX);
      // The left edge is a soft boundary: pushing the screen further left than
      // it started resists instead of stopping.
      paint(raw < 0 ? -rubberband(-raw, width) : raw);
    };

    const onUp = (event: PointerEvent) => {
      if (!watching || event.pointerId !== pointerId) return;
      watching = false;
      release(element, pointerId);
      if (!decided) {
        element.style.willChange = '';
        return;
      }
      const velocity = tracker.velocity();
      const projected = offset + project(velocity);

      if (projected > width / 3) {
        if (!motionEnabled) {
          clear();
          router.back();
          return;
        }
        playback = animate(offset, width, {
          ...spring.settle,
          velocity,
          onUpdate: paint,
        });
        // The route change is handed over once the screen has visibly left,
        // not after a fixed wait.
        playback.finished
          .then(() => {
            clear();
            router.back();
          })
          .catch(() => undefined);
        return;
      }

      if (!motionEnabled) {
        clear();
        return;
      }
      playback = animate(offset, 0, { ...spring.settle, velocity, onUpdate: paint });
      playback.finished.then(clear).catch(() => undefined);
    };

    element.addEventListener('pointerdown', onDown);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerup', onUp);
    element.addEventListener('pointercancel', onUp);
    return () => {
      playback?.stop();
      element.removeEventListener('pointerdown', onDown);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerup', onUp);
      element.removeEventListener('pointercancel', onUp);
      clear();
    };
  }, [pathname, router, target, motionEnabled]);

  return null;
}
