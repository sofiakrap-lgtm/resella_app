'use client';

import { motion } from 'framer-motion';
import { mascot, type MascotPose } from '@/lib/assets';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { SafeImage } from './SafeImage';

interface MascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  /** Animates in with a spring, used on hero moments. */
  animate?: boolean;
}

/**
 * The Connector: a small wordless character that connects people and things.
 * Consumer side only, it never appears in the operator facing POS.
 *
 * The drawing below is the fallback. As soon as the real SVG files are dropped
 * into /assets/graphics, <SafeImage> renders those instead.
 */
export function Mascot({ pose = 'default', size = 96, className = '', animate = true }: MascotProps) {
  const { t } = useApp();
  const transition = useTransition('lively');

  const drawing = <MascotDrawing pose={pose} size={size} />;

  const content = (
    <SafeImage
      src={mascot[pose]}
      alt={t('a11y.mascot')}
      className={className}
      fallback={drawing}
    />
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, rotate: -6 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={transition}
      className={className}
      style={{ width: size, height: size }}
    >
      {content}
    </motion.div>
  );
}

function MascotDrawing({ pose, size }: { pose: MascotPose; size: number }) {
  const eyeY = pose === 'empty' ? 54 : 50;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      {/* connecting thread, the character always links two things together */}
      <path
        d="M14 92 C 34 78, 86 78, 106 92"
        stroke="var(--color-accent-2)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={pose === 'empty' ? '6 8' : undefined}
        opacity="0.75"
      />
      <circle cx="14" cy="92" r="5" fill="var(--color-accent-2)" />
      <circle cx="106" cy="92" r="5" fill="var(--color-accent-2)" opacity={pose === 'empty' ? 0.35 : 1} />

      {/* body */}
      <path
        d="M60 14c20 0 32 14 32 32 0 18-12 30-32 30S28 64 28 46c0-18 12-32 32-32Z"
        fill="var(--color-accent)"
      />

      {/* eyes and mouth */}
      <circle cx="49" cy={eyeY} r="4.4" fill="#fff" />
      <circle cx="71" cy={eyeY} r="4.4" fill="#fff" />
      {pose === 'empty' ? (
        <path d="M52 64c4-3 12-3 16 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d="M52 61c4 4 12 4 16 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      )}

      {/* arms */}
      {pose === 'wave' ? (
        <path d="M90 44c8-4 12-12 11-20" stroke="var(--color-accent)" strokeWidth="6" strokeLinecap="round" />
      ) : null}
      {pose === 'celebrate' ? (
        <>
          <path d="M88 42c7-6 10-14 9-22" stroke="var(--color-accent)" strokeWidth="6" strokeLinecap="round" />
          <path d="M32 42c-7-6-10-14-9-22" stroke="var(--color-accent)" strokeWidth="6" strokeLinecap="round" />
          <path d="M104 16l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="var(--color-accent-2)" />
          <path d="M16 10l1.6 4.8L22 16l-4.4 1.2L16 22l-1.6-4.8L10 16l4.4-1.2L16 10Z" fill="var(--color-accent-2)" />
        </>
      ) : null}
      {pose === 'search' ? (
        <>
          <circle cx="96" cy="40" r="13" stroke="var(--color-accent-2)" strokeWidth="5" fill="var(--color-surface)" />
          <path d="M105 50l9 9" stroke="var(--color-accent-2)" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}
