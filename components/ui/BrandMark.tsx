'use client';

import { logos } from '@/lib/imagePath';
import { SafeImage } from './SafeImage';

/** Small logo mark, drawn inline so tiny placements never depend on a file. */
export function BrandMark({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="9" fill="var(--color-brown)" />
      <path
        d="M11 22V10.5h5.4a3.6 3.6 0 0 1 0 7.2H13l5.4 4.3"
        stroke="var(--color-cream)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="11.5" r="2.2" fill="var(--color-terracotta)" />
    </svg>
  );
}

/**
 * The real wordmark from /assets/logos. If the file is not there yet, the
 * drawn mark and the name stand in, so the layout never breaks.
 */
export function BrandWordmark({
  height = 28,
  light = false,
  className = '',
}: {
  height?: number;
  light?: boolean;
  className?: string;
}) {
  return (
    <SafeImage
      src={light ? logos.wordmarkLight : logos.wordmark}
      alt="ReSello"
      fallbackType="logo"
      className={className}
      style={{ height, width: 'auto' }}
      fallback={
        <span className={`inline-flex items-center gap-2 ${className}`}>
          <BrandMark size={Math.round(height * 0.8)} />
          <span className="t-title3 tracking-tight">ReSello</span>
        </span>
      }
    />
  );
}
