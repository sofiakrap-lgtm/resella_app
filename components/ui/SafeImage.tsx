'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { BrandMark } from './BrandMark';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Short label shown on the placeholder when the real file is missing. */
  label?: string;
  /** Optional custom placeholder, for example the mascot drawing. */
  fallback?: ReactNode;
  priority?: boolean;
}

/** Warm, brand adjacent placeholder tints, picked deterministically per image. */
const TINTS: Array<[string, string]> = [
  ['#F1E2C6', '#DFCBA6'],
  ['#EDE0CC', '#D8C3A2'],
  ['#F2E0D2', '#E0C3AC'],
  ['#E9E2D0', '#D3C8AC'],
  ['#F0E6D6', '#DCCBB0'],
  ['#EADCC8', '#D4BE9C'],
];

function tintFor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

/**
 * Renders a local image and falls back to a branded placeholder when the file
 * has not been added to /assets yet, so the demo never shows a broken image.
 */
export function SafeImage({ src, alt, className = '', label, fallback, priority }: SafeImageProps) {
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
        className={`flex flex-col items-center justify-center gap-2 text-ink-secondary ${className}`}
        style={{ background: `linear-gradient(145deg, ${from} 0%, ${to} 100%)` }}
      >
        <BrandMark size={26} />
        {label ? <span className="t-caption1 px-3 text-center leading-tight">{label}</span> : null}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local mock photos, the optimizer is off
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      // The server rendered <img> can fail before React attaches onError, so the
      // ref checks whether the browser already gave up on the file.
      ref={(node) => {
        if (node && node.complete && node.naturalWidth === 0) setFailed(true);
      }}
      onError={() => setFailed(true)}
    />
  );
}
