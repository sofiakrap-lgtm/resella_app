'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTapScale, useTransition } from '@/lib/motion';

export function Chip({
  children,
  selected = false,
  onClick,
  icon,
  className = '',
  ariaLabel,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const tap = useTapScale();
  const transition = useTransition('press');
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel}
      whileTap={tap}
      transition={transition}
      className={[
        'inline-flex min-h-11 max-w-full shrink-0 items-center gap-1.5 rounded-full px-4 t-subhead',
        'border transition-colors duration-150',
        selected
          ? 'border-terracotta-ink bg-terracotta-ink text-on-terracotta font-semibold'
          : 'border-separator bg-surface text-brown',
        className,
      ].join(' ')}
    >
      {icon}
      {children}
    </motion.button>
  );
}

/** Static label, not interactive. */
export function Tag({
  children,
  tone = 'neutral',
  icon,
  className = '',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'positive' | 'warning' | 'danger';
  icon?: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: 'bg-cream-sink text-brown-70',
    accent: 'bg-cream-panel text-terracotta-ink',
    positive: 'bg-cream-panel text-positive',
    warning: 'bg-cream-panel text-warning',
    danger: 'bg-cream-panel text-danger',
  } as const;
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 t-caption ${tones[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
