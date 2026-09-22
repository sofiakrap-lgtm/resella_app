'use client';

import { motion } from 'framer-motion';
import { useApp } from '@/lib/state';
import { Mascot } from '@/components/ui/Mascot';

/** Three bouncing dots while the mocked answer is being prepared. */
export function TypingIndicator() {
  const { t, motionEnabled } = useApp();
  return (
    <div className="flex items-center gap-2 px-4" role="status" aria-live="polite">
      <span className="h-7 w-7 shrink-0">
        <Mascot pose="search" size={28} animate={false} />
      </span>
      <div className="flex items-center gap-1.5 rounded-[18px] bg-surface px-3.5 py-3 shadow-card">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-2 w-2 rounded-full bg-ink-tertiary"
            animate={motionEnabled ? { y: [0, -4, 0], opacity: [0.5, 1, 0.5] } : undefined}
            transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.15 }}
          />
        ))}
        <span className="sr-only">{t('ai.thinking')}</span>
      </div>
    </div>
  );
}
