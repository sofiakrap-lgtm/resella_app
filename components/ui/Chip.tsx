'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTapScale, useTransition } from '@/lib/motion';

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

/** Interactive pill. Keeps a 44pt touch target even though it looks compact. */
export function Chip({ children, selected = false, onClick, icon, className = '', ariaLabel }: ChipProps) {
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
        'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 t-subhead',
        'border transition-colors duration-150',
        selected
          ? 'border-accent bg-accent text-on-accent font-semibold'
          : 'border-separator bg-surface text-ink',
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
  tone?: 'neutral' | 'accent' | 'warn' | 'success' | 'danger';
  icon?: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: 'bg-surface-2 text-ink-secondary',
    accent: 'bg-accent-soft text-accent',
    warn: 'bg-accent-soft text-warning',
    success: 'bg-accent-soft text-success',
    danger: 'bg-accent-soft text-danger',
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 t-caption1 ${tones[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
