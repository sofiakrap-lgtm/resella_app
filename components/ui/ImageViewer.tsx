'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productImage } from '@/lib/imagePath';
import { project } from '@/lib/physics';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { IconButton } from './Button';
import { CloseIcon } from './Icons';

/**
 * Full screen photo viewer. The only place in the app where a photograph is
 * fitted rather than filled: here the whole garment has to be visible, and
 * the black field makes the empty edges read as the photograph's own shape
 * rather than as a gap in the layout.
 *
 * Pinch is the browser's own, double tap toggles a 2.5x look, and a drag
 * downwards dismisses.
 */
export function ImageViewer({
  photos,
  startIndex,
  alt,
  onClose,
}: {
  photos: string[];
  startIndex: number;
  alt: string;
  onClose: () => void;
}) {
  const { motionEnabled } = useApp();
  const transition = useTransition('sheet');
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const scroller = useRef<HTMLDivElement | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    element.scrollLeft = element.clientWidth * startIndex;
  }, [startIndex]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) setZoom((current) => (current > 1 ? 1 : 2.5));
    lastTap.current = now;
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      /*
       * It arrives by growing into place and leaves the same way, so the
       * photograph reads as the card opening rather than as a new screen
       * appearing from nowhere.
       */
      initial={motionEnabled ? { opacity: 0, scale: 0.94 } : false}
      animate={{ opacity: 1, scale: 1 }}
      exit={motionEnabled ? { opacity: 0, scale: 0.94 } : { opacity: 0 }}
      transition={transition}
      drag={zoom > 1 ? false : 'y'}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.5}
      onDragEnd={(_, info) => {
        // A slow drag that got far and a flick that got nowhere both have to
        // resolve the same way the hand expects, so the decision is made on
        // where the throw was heading, not on where the finger stopped.
        if (info.offset.y + project(info.velocity.y) > 110) onClose();
      }}
      className="absolute inset-0 z-[60] bg-black"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div
        ref={scroller}
        onScroll={() => {
          const element = scroller.current;
          if (!element) return;
          setIndex(Math.round(element.scrollLeft / element.clientWidth));
        }}
        className="hide-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto"
        style={{ touchAction: zoom > 1 ? 'pinch-zoom' : 'pan-x pinch-zoom' }}
      >
        {photos.map((photo, photoIndex) => (
          <div
            key={photo}
            className="flex h-full w-full shrink-0 snap-center items-center justify-center"
            onClick={onTap}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local mock photos */}
            <img
              src={productImage(photo)}
              alt={`${alt} ${photoIndex + 1}/${photos.length}`}
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{ transform: photoIndex === index ? `scale(${zoom})` : undefined }}
            />
          </div>
        ))}
      </div>

      <div className="absolute right-2 top-2">
        <IconButton ariaLabel="Sulje kuva" onClick={onClose} className="text-white">
          <CloseIcon size={24} />
        </IconButton>
      </div>

      {photos.length > 1 ? (
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-1.5" aria-hidden="true">
          {photos.map((photo, dotIndex) => (
            <span
              key={photo}
              className="h-1.5 w-1.5 rounded-full bg-white"
              style={{ opacity: dotIndex === index ? 1 : 0.4 }}
            />
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

/** Mounts the viewer only while it is open, so nothing animates behind it. */
export function ImageViewerHost({
  open,
  photos,
  startIndex,
  alt,
  onClose,
}: {
  open: boolean;
  photos: string[];
  startIndex: number;
  alt: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <ImageViewer photos={photos} startIndex={startIndex} alt={alt} onClose={onClose} />
      ) : null}
    </AnimatePresence>
  );
}
