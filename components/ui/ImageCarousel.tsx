'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { productPhotoUrl } from '@/lib/assets';
import { SafeImage } from './SafeImage';

interface ImageCarouselProps {
  photos: string[];
  alt: string;
  label?: string;
  className?: string;
  /** Shared element transition with the card that opened it. */
  layoutId?: string;
  overlay?: React.ReactNode;
}

/** Swipeable photo carousel with iOS style page dots. */
export function ImageCarousel({ photos, alt, label, className = '', layoutId, overlay }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const scroller = useRef<HTMLDivElement | null>(null);

  const onScroll = () => {
    const element = scroller.current;
    if (!element) return;
    const next = Math.round(element.scrollLeft / element.clientWidth);
    if (next !== index) setIndex(next);
  };

  return (
    <motion.div layoutId={layoutId} className={`relative bg-surface-2 ${className}`}>
      <div
        ref={scroller}
        onScroll={onScroll}
        className="hide-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto"
      >
        {photos.map((photo, photoIndex) => (
          <div key={photo} className="h-full w-full shrink-0 snap-center">
            <SafeImage
              src={productPhotoUrl(photo)}
              alt={`${alt} ${photoIndex + 1}/${photos.length}`}
              label={label}
              className="h-full w-full object-cover"
              priority={photoIndex === 0}
            />
          </div>
        ))}
      </div>

      {photos.length > 1 ? (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
          {photos.map((photo, dotIndex) => (
            <span
              key={photo}
              className="h-1.5 w-1.5 rounded-full transition-opacity"
              style={{
                background: 'var(--color-surface)',
                opacity: dotIndex === index ? 1 : 0.45,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            />
          ))}
        </div>
      ) : null}

      {overlay}
    </motion.div>
  );
}
