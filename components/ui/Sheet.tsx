'use client';

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import type { AnimationPlaybackControls } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { spring, useMotionAllowed } from '@/lib/motion';
import { HYSTERESIS, VelocityTracker, nearest, project, rubberband, capture, release } from '@/lib/physics';
import { haptic } from '@/lib/haptics';
import { openedSheet, closedSheet } from '@/lib/sheets';
import { IconButton } from './Button';
import { CloseIcon } from './Icons';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** Visible fractions of the container height, ascending. */
  detents?: number[];
  initialDetentIndex?: number;
  /** Dragging below the smallest detent closes the sheet. */
  dismissible?: boolean;
  ariaLabel?: string;
  /** Stacking layer, lowered on the map so the tab bar stays reachable. */
  zIndexClass?: string;
  /** Hides the dimmed backdrop, used by the always visible map sheet. */
  backdrop?: boolean;
}

/**
 * Bottom sheet with iOS style detents.
 *
 * The drag is written by hand rather than handed to a drag helper, because
 * four things have to be true at once and no helper gives all four:
 *
 * 1:1 tracking. The sheet moves with the finger from wherever it was grabbed,
 * including mid flight, so the grab offset is read off the live transform.
 *
 * Interruptible. Grabbing a sheet that is still animating stops it where it
 * is and hands it to the finger. Nothing waits for an animation to finish.
 *
 * Momentum. The detent is chosen from where the throw is heading, not from
 * where the finger let go, and the spring then starts at the finger's exact
 * release velocity so there is no seam between dragging and animating.
 *
 * Soft edges. Past the top detent the sheet keeps moving but follows less and
 * less, so the boundary reads as resistance rather than as a frozen frame.
 */
export function Sheet({
  open,
  onClose,
  children,
  title,
  detents = [0.9],
  initialDetentIndex,
  dismissible = true,
  ariaLabel,
  zIndexClass = 'z-50',
  backdrop = true,
}: SheetProps) {
  const motionAllowed = useMotionAllowed();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [mounted, setMounted] = useState(false);
  /** Whether the sheet's own content has moved under its header yet. */
  const [scrolled, setScrolled] = useState(false);
  const [detentIndex, setDetentIndex] = useState(initialDetentIndex ?? detents.length - 1);

  const y = useMotionValue(0);
  const playback = useRef<AnimationPlaybackControls | null>(null);
  const tracker = useRef(new VelocityTracker());
  /** Set by the release handler so the detent effect does not re animate it. */
  const handledByGesture = useRef(false);

  const maxDetent = detents[detents.length - 1];
  const sheetHeight = containerHeight * maxDetent;

  const offsetFor = useCallback(
    (index: number) => sheetHeight - containerHeight * detents[index],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sheetHeight, containerHeight, detents.join(',')],
  );

  /** The scrim thins as the sheet is dragged away, so the drag reads the whole way down. */
  const scrimOpacity = useTransform(y, [offsetFor(0), sheetHeight || 1], [1, 0], { clamp: true });

  useEffect(() => {
    if (!open) return;
    openedSheet();
    return closedSheet;
  }, [open]);

  // Measured whether or not the sheet is open, so an opening animation has a
  // real distance to travel on the very first frame.
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = () => setContainerHeight(element.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (open) setDetentIndex(initialDetentIndex ?? detents.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /**
   * Enter and exit travel the same path, down past the bottom edge, because a
   * thing that leaves the way it arrived is a thing you can predict.
   *
   * Arriving and leaving are two effects rather than one. A single effect that
   * also watched the detent would stop and restart the exit animation every
   * time anything else changed, and a stopped animation never reports that it
   * finished, which left the sheet mounted with an invisible scrim over the
   * whole screen. Nothing the exit depends on can change while it runs now.
   */
  useEffect(() => {
    if (!open || !containerHeight) return;

    if (!mounted) {
      y.set(sheetHeight);
      // Cleared here as well as where it is read: a drag that settled back on
      // the detent it started from leaves no state change behind to clear it,
      // and a stale flag would swallow the next opening animation and leave
      // the sheet mounted below the edge where nothing could reach it.
      handledByGesture.current = false;
      setMounted(true);
      return;
    }

    // The release handler already animated this one, with the velocity the
    // finger had. Re animating it here would throw that away.
    if (handledByGesture.current) {
      handledByGesture.current = false;
      return;
    }

    playback.current?.stop();
    const target = offsetFor(detentIndex);
    if (!motionAllowed) {
      y.set(target);
      return;
    }
    playback.current = animate(y, target, spring.sheet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted, containerHeight, sheetHeight, detentIndex, offsetFor, motionAllowed]);

  useEffect(() => {
    if (open || !mounted) return;
    playback.current?.stop();
    if (!motionAllowed || !containerHeight) {
      setMounted(false);
      return;
    }
    const exiting = animate(y, sheetHeight, spring.settle);
    playback.current = exiting;
    exiting.finished.then(() => setMounted(false)).catch(() => undefined);
    // A sheet that is on its way out is never allowed to stay: whatever
    // happens to the animation, it is gone shortly after it was closed.
    const backstop = window.setTimeout(() => setMounted(false), 700);
    return () => {
      window.clearTimeout(backstop);
      exiting.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted]);

  /** Soft boundaries: resistance that grows the further past the edge the finger is. */
  const resist = (value: number) => {
    const top = offsetFor(detents.length - 1);
    const bottom = dismissible ? sheetHeight : offsetFor(0);
    if (value < top) return top - rubberband(top - value, sheetHeight);
    if (value > bottom) return bottom + rubberband(value - bottom, sheetHeight);
    return value;
  };

  const drag = useRef({
    active: false,
    pointerId: -1,
    startY: 0,
    startOffset: 0,
    /** Whether this pointer has proved it is dragging the sheet, not scrolling it. */
    decided: false,
    captured: false,
  });

  const onPointerDown = (event: React.PointerEvent) => {
    // Dragging stays available when movement is reduced: direct manipulation
    // is the user's own motion, not the interface's. Only the spring goes.
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const insideScroll = scrollRef.current?.contains(event.target as Node) ?? false;
    // Interruption: whatever the sheet was doing, it now belongs to the finger,
    // and it starts from where it actually is on screen.
    playback.current?.stop();
    tracker.current.reset();
    tracker.current.add(event.clientY);
    drag.current = {
      active: true,
      pointerId: event.pointerId,
      startY: event.clientY,
      startOffset: y.get(),
      decided: !insideScroll,
      captured: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const state = drag.current;
    if (!state.active || event.pointerId !== state.pointerId) return;
    tracker.current.add(event.clientY);
    const delta = event.clientY - state.startY;

    if (!state.decided) {
      // Both gestures are watched from the first move, and the loser is only
      // cancelled once the intent is clear.
      if (Math.abs(delta) < HYSTERESIS) return;
      const atTop = (scrollRef.current?.scrollTop ?? 0) <= 0;
      if (delta > 0 && atTop) {
        state.decided = true;
        // Re-anchor, so the first pixel after the threshold is still 1:1.
        state.startY = event.clientY;
        state.startOffset = y.get();
      } else {
        state.active = false;
        return;
      }
    }

    if (!state.captured) {
      capture(panelRef.current, state.pointerId);
      state.captured = true;
    }
    y.set(resist(state.startOffset + (event.clientY - state.startY)));
  };

  const finishDrag = (event: React.PointerEvent) => {
    const state = drag.current;
    if (!state.active || event.pointerId !== state.pointerId) return;
    state.active = false;
    if (state.captured) {
      release(panelRef.current, state.pointerId);
      state.captured = false;
    }
    if (!state.decided) return;

    const velocity = tracker.current.velocity();
    // Where the throw is going, not where the finger stopped.
    const projected = y.get() + project(velocity);

    if (dismissible && projected > offsetFor(0) + containerHeight * 0.12) {
      haptic('commit');
      onClose();
      return;
    }

    const offsets = detents.map((_detent, index) => offsetFor(index));
    const target = nearest(projected, offsets);
    const index = offsets.indexOf(target);
    handledByGesture.current = true;
    setDetentIndex(index);
    if (Math.abs(target - y.get()) > 1) haptic('snap');
    playback.current?.stop();
    if (!motionAllowed) {
      y.set(target);
      return;
    }
    // The spring picks up at the finger's exact speed, so there is no seam
    // between the drag and the animation. Bounce is earned here: a throw
    // preceded it.
    playback.current = animate(y, target, { ...spring.sheet, velocity });
  };

  return (
    <div ref={containerRef} className={`pointer-events-none absolute inset-0 ${zIndexClass}`}>
      <AnimatePresence>
        {mounted ? (
          <>
            {backdrop ? (
              <motion.button
                type="button"
                aria-label="Sulje"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ opacity: scrimOpacity, pointerEvents: open ? 'auto' : 'none' }}
                onClick={onClose}
                className="absolute inset-0 bg-[rgba(60,36,21,0.35)]"
              />
            ) : null}
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel ?? title}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              style={{ y, height: sheetHeight || undefined, willChange: 'transform' }}
              className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[22px] bg-surface shadow-raised"
            >
              <div
                data-scrolled={scrolled ? 'true' : 'false'}
                className="glass-thick scroll-edge relative z-10 shrink-0 rounded-t-[22px] px-4 pb-2 pt-2"
                style={{ touchAction: 'none' }}
              >
                <div className="mx-auto h-[5px] w-9 rounded-full bg-brown-50" aria-hidden="true" />
                {title ? (
                  <div className="mt-2 flex items-center justify-between">
                    <h2 className="t-headline on-glass">{title}</h2>
                    {dismissible ? (
                      <IconButton ariaLabel="Sulje" onClick={onClose}>
                        <CloseIcon size={20} />
                      </IconButton>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div
                ref={scrollRef}
                onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 2)}
                className="hide-scrollbar flex-1 overflow-y-auto overscroll-contain"
              >
                {children}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
