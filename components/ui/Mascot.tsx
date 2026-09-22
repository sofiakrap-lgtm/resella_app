'use client';

import { motion } from 'framer-motion';
import { mascot, type MascotPose } from '@/lib/imagePath';
import { useTransition } from '@/lib/motion';
import { SafeImage } from './SafeImage';

/**
 * The Connector: a small wordless character that links people and things.
 * The drawing below is the fallback until the real SVG files are added.
 */
export function Mascot({
  pose = 'default',
  size = 96,
  className = '',
  animate = true,
}: {
  pose?: MascotPose;
  size?: number;
  className?: string;
  animate?: boolean;
}) {
  const transition = useTransition('lively');
  const drawing = <Drawing pose={pose} size={size} />;

  const content = (
    <SafeImage src={mascot[pose]} alt="ReSellon hahmo" className={className} fallback={drawing} />
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ scale: 0.72, opacity: 0, rotate: -6 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={transition}
      className={className}
      style={{ width: size, height: size }}
    >
      {content}
    </motion.div>
  );
}

function Drawing({ pose, size }: { pose: MascotPose; size: number }) {
  const eyeY = pose === 'empty' ? 54 : 50;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path
        d="M14 92 C 34 78, 86 78, 106 92"
        stroke="var(--color-terracotta)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={pose === 'empty' ? '6 8' : undefined}
        opacity="0.8"
      />
      <circle cx="14" cy="92" r="5" fill="var(--color-terracotta)" />
      <circle cx="106" cy="92" r="5" fill="var(--color-terracotta)" opacity={pose === 'empty' ? 0.35 : 1} />
      <path
        d="M60 14c20 0 32 14 32 32 0 18-12 30-32 30S28 64 28 46c0-18 12-32 32-32Z"
        fill="var(--color-brown)"
      />
      <circle cx="49" cy={eyeY} r="4.4" fill="var(--color-cream)" />
      <circle cx="71" cy={eyeY} r="4.4" fill="var(--color-cream)" />
      {pose === 'empty' ? (
        <path d="M52 64c4-3 12-3 16 0" stroke="var(--color-cream)" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d="M52 61c4 4 12 4 16 0" stroke="var(--color-cream)" strokeWidth="3" strokeLinecap="round" />
      )}
      {pose === 'wave' ? (
        <path d="M90 44c8-4 12-12 11-20" stroke="var(--color-brown)" strokeWidth="6" strokeLinecap="round" />
      ) : null}
      {pose === 'celebrate' ? (
        <>
          <path d="M88 42c7-6 10-14 9-22" stroke="var(--color-brown)" strokeWidth="6" strokeLinecap="round" />
          <path d="M32 42c-7-6-10-14-9-22" stroke="var(--color-brown)" strokeWidth="6" strokeLinecap="round" />
          <path d="M104 16l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="var(--color-terracotta)" />
          <path d="M16 10l1.6 4.8L22 16l-4.4 1.2L16 22l-1.6-4.8L10 16l4.4-1.2L16 10Z" fill="var(--color-terracotta)" />
        </>
      ) : null}
      {pose === 'search' ? (
        <>
          <circle cx="96" cy="40" r="13" stroke="var(--color-terracotta)" strokeWidth="5" fill="var(--color-cream)" />
          <path d="M105 50l9 9" stroke="var(--color-terracotta)" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}
