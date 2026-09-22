'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { FallbackType } from '@/lib/imagePath';
import { BrandMark } from './BrandMark';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  label?: string;
  fallbackType?: FallbackType;
  fallback?: ReactNode;
  priority?: boolean;
  /** Small thumbnails show the mark only, a caption would be clipped. */
  compact?: boolean;
  style?: CSSProperties;
}

/** Warm placeholder tints, picked deterministically so a grid stays varied. */
const TINTS: Array<[string, string]> = [
  ['#F7ECDD', '#E8D4BC'],
  ['#F3E7DC', '#E0CAB4'],
  ['#F6E9E1', '#E5CBBB'],
  ['#EFE9DD', '#DCCFB8'],
  ['#F5EADF', '#E4D0B6'],
  ['#F1E6D8', '#DDC9AE'],
];

function tintFor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

const GLYPHS: Record<FallbackType, ReactNode> = {
  tuote: (
    <path d="M6 9h12l1.5 11H4.5L6 9Zm2.5 0a3.5 3.5 0 0 1 7 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  ),
  kirpputori: (
    <path d="M4 10.5 12 5l8 5.5V19H4v-8.5ZM9.5 19v-5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  myyja: (
    <>
      <circle cx="12" cy="9" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 20c1-3.4 3.6-5.2 6.5-5.2s5.5 1.8 6.5 5.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  logo: <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />,
};

/**
 * Renders a local image and falls back to a branded placeholder when the file
 * has not been added to /assets yet. A broken image is never shown.
 */
export function SafeImage({
  src,
  alt,
  className = '',
  label,
  fallbackType = 'tuote',
  fallback,
  priority,
  compact = false,
  style,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    if (fallback) return <>{fallback}</>;
    const [from, to] = tintFor(label ?? src);
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-1.5 overflow-hidden text-brown-70 ${className}`}
        style={{ background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)`, ...style }}
      >
        <span className="flex items-center gap-1.5">
          <BrandMark size={compact ? 16 : 20} />
          <svg
            width={compact ? 18 : 22}
            height={compact ? 18 : 22}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {GLYPHS[fallbackType]}
          </svg>
        </span>
        {label && !compact ? (
          <span className="line-clamp-2 t-caption px-3 text-center leading-tight">{label}</span>
        ) : null}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local mock photos, optimizer is off
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      ref={(node) => {
        // A server rendered <img> can fail before React attaches onError.
        if (node && node.complete && node.naturalWidth === 0) setFailed(true);
      }}
      onError={() => setFailed(true)}
    />
  );
}
