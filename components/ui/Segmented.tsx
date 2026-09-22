'use client';

import { motion } from 'framer-motion';
import { useTransition } from '@/lib/motion';

interface SegmentedProps<T extends string> {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

/** iOS style segmented control with a sliding indicator. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: SegmentedProps<T>) {
  const transition = useTransition();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`relative flex rounded-full bg-cream-sink p-1 ${className}`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className="relative z-10 min-h-11 min-w-0 flex-1 truncate rounded-full px-3 t-subhead font-semibold"
            style={{ color: selected ? 'var(--color-brown)' : 'var(--color-brown-70)' }}
          >
            {selected ? (
              <motion.span
                layoutId={`segmented-${ariaLabel}`}
                transition={transition}
                className="absolute inset-0 -z-10 rounded-full bg-cream shadow-card"
              />
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
