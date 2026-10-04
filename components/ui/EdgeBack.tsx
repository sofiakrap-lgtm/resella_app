'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';

/** The four tab roots are where back has nowhere to go. */
const ROOTS = ['/koti', '/selaa', '/toivelista', '/oma'];

/**
 * Edge swipe back. A drag that starts in the left 20px carries the screen
 * with the finger and goes back when it passes a third of the width.
 *
 * The previous screen is not mounted, so there is nothing real to parallax
 * behind this one; a darkened field stands in for it and lightens as the
 * screen moves away, which reads the same way in the hand.
 */
export function EdgeBack({ target }: { target: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { motionEnabled } = useApp();

  useEffect(() => {
    if (ROOTS.includes(pathname)) return;
    const element = document.getElementById(target);
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let dragging = false;
    const width = element.clientWidth || window.innerWidth;

    const paint = (dx: number) => {
      element.style.transition = '';
      element.style.transform = `translateX(${dx}px)`;
      element.style.opacity = String(1 - Math.min(dx / width, 1) * 0.25);
    };

    const reset = (animate: boolean) => {
      element.style.transition = animate ? 'transform 220ms ease-out, opacity 220ms ease-out' : '';
      element.style.transform = '';
      element.style.opacity = '';
    };

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || touch.clientX > 20) return;
      startX = touch.clientX;
      startY = touch.clientY;
      dragging = true;
    };

    const onMove = (event: TouchEvent) => {
      if (!dragging) return;
      const touch = event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = Math.abs(touch.clientY - startY);
      if (dy > Math.abs(dx) && dy > 12) {
        dragging = false;
        reset(true);
        return;
      }
      if (dx > 0 && motionEnabled) paint(dx);
    };

    const onEnd = (event: TouchEvent) => {
      if (!dragging) return;
      dragging = false;
      const touch = event.changedTouches[0];
      const dx = touch ? touch.clientX - startX : 0;
      if (dx > width / 3) {
        element.style.transition = 'transform 180ms ease-out, opacity 180ms ease-out';
        element.style.transform = `translateX(${width}px)`;
        element.style.opacity = '0.7';
        window.setTimeout(() => {
          reset(false);
          router.back();
        }, 170);
        return;
      }
      reset(true);
    };

    element.addEventListener('touchstart', onStart, { passive: true });
    element.addEventListener('touchmove', onMove, { passive: true });
    element.addEventListener('touchend', onEnd, { passive: true });
    element.addEventListener('touchcancel', onEnd, { passive: true });
    return () => {
      element.removeEventListener('touchstart', onStart);
      element.removeEventListener('touchmove', onMove);
      element.removeEventListener('touchend', onEnd);
      element.removeEventListener('touchcancel', onEnd);
      reset(false);
    };
  }, [pathname, router, target, motionEnabled]);

  return null;
}
