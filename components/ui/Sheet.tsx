'use client';

import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useTransition } from '@/lib/motion';
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
 * Bottom sheet with iOS style detents. Liquid Glass lives on the sheet chrome,
 * the content sits on a solid surface so text stays legible.
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
  const transition = useTransition('sheet');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [detentIndex, setDetentIndex] = useState(initialDetentIndex ?? detents.length - 1);

  useLayoutEffect(() => {
    if (!open) return;
    const element = containerRef.current;
    if (!element) return;
    const measure = () => setContainerHeight(element.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [open]);

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

  const maxDetent = detents[detents.length - 1];
  const sheetHeight = containerHeight * maxDetent;
  const offsetFor = useCallback(
    (index: number) => sheetHeight - containerHeight * detents[index],
    [sheetHeight, containerHeight, detents],
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const current = offsetFor(detentIndex);
    const projected = current + info.offset.y + info.velocity.y * 0.08;
    if (dismissible && projected > offsetFor(0) + containerHeight * 0.12) {
      onClose();
      return;
    }
    let nearest = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    detents.forEach((_detent, index) => {
      const distance = Math.abs(offsetFor(index) - projected);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = index;
      }
    });
    setDetentIndex(nearest);
  };

  return (
    <div ref={containerRef} className={`pointer-events-none absolute inset-0 ${zIndexClass}`}>
      <AnimatePresence>
        {open ? (
          <>
            {backdrop ? (
              <motion.button
                type="button"
                aria-label={'Sulje'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="pointer-events-auto absolute inset-0 bg-[rgba(60,36,21,0.35)]"
              />
            ) : null}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel ?? title}
              initial={{ y: sheetHeight || 600 }}
              animate={{ y: offsetFor(detentIndex) }}
              exit={{ y: sheetHeight || 600 }}
              transition={transition}
              drag="y"
              dragElastic={0.04}
              dragConstraints={{ top: 0, bottom: sheetHeight }}
              onDragEnd={handleDragEnd}
              style={{ height: sheetHeight || undefined }}
              className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[22px] bg-surface shadow-raised"
            >
              <div className="glass-flat shrink-0 rounded-t-[22px] border-b border-separator px-4 pb-2 pt-2">
                <div className="mx-auto h-1.5 w-10 rounded-full bg-brown-50" aria-hidden="true" />
                {title ? (
                  <div className="mt-2 flex items-center justify-between">
                    <h2 className="t-headline">{title}</h2>
                    {dismissible ? (
                      <IconButton ariaLabel={'Sulje'} onClick={onClose}>
                        <CloseIcon size={20} />
                      </IconButton>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="hide-scrollbar flex-1 overflow-y-auto overscroll-contain">{children}</div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
