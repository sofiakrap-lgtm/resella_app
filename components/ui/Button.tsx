'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTapScale, useTransition } from '@/lib/motion';

/**
 * Five button variants, and nothing else. Anything that looked like a button
 * in this app now picks one of these, so a control's weight is a decision
 * rather than whatever class happened to be nearest.
 */
type Variant = 'prominent' | 'glass' | 'bordered' | 'plain' | 'icon';
type Size = 'lg' | 'md' | 'sm';

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  /** Only 'sm' does anything: it drops a tall variant to the bordered height. */
  size?: Size;
  full?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  ariaLabel?: string;
}

interface ButtonProps extends BaseProps {
  onClick?: () => void;
  type?: 'button' | 'submit';
  href?: never;
}

interface LinkProps extends BaseProps {
  href: string;
  onClick?: () => void;
}

const variants: Record<Variant, string> = {
  prominent:
    'h-[50px] rounded-[14px] px-5 bg-terracotta-ink text-on-terracotta t-headline',
  glass:
    'h-[50px] rounded-[14px] px-5 bg-[rgba(60,36,21,0.06)] border-[0.5px] border-[rgba(60,36,21,0.10)] text-terracotta-ink t-headline',
  bordered:
    'tap-44 h-9 rounded-[10px] px-4 bg-surface border-[0.5px] border-hairline text-brown t-card-title',
  plain: 'tap-44 min-h-11 px-2 text-terracotta-ink t-card-title font-normal',
  icon: 'h-11 w-11 rounded-full text-brown',
};

/** A short button keeps the bordered height whatever its colour is. */
const shortened: Partial<Record<Variant, string>> = {
  prominent:
    'tap-44 h-9 rounded-[10px] px-4 bg-terracotta-ink text-on-terracotta t-card-title font-semibold',
  glass:
    'tap-44 h-9 rounded-[10px] px-4 bg-[rgba(60,36,21,0.06)] border-[0.5px] border-[rgba(60,36,21,0.10)] text-terracotta-ink t-card-title font-semibold',
};

function classesFor({ variant, size, full, disabled, className = '' }: BaseProps) {
  const kind = variant ?? 'prominent';
  const shape = size === 'sm' ? (shortened[kind] ?? variants[kind]) : variants[kind];
  return [
    'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap transition-colors duration-150',
    shape,
    full ? 'w-full' : '',
    disabled ? 'opacity-40' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

const noHighlight = { WebkitTapHighlightColor: 'transparent' } as const;

export function Button(props: ButtonProps | LinkProps) {
  const tap = useTapScale(0.96);
  const transition = useTransition('press');
  const press = props.disabled ? undefined : tap;
  const content = (
    <>
      {props.icon}
      {props.children}
    </>
  );

  if ('href' in props && props.href) {
    return (
      <motion.div
        whileTap={press}
        transition={transition}
        className={props.full ? 'w-full' : 'inline-flex'}
        style={noHighlight}
      >
        <Link
          href={props.href}
          onClick={props.onClick}
          aria-label={props.ariaLabel}
          className={classesFor(props)}
          style={noHighlight}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  const buttonProps = props as ButtonProps;
  return (
    <motion.button
      type={buttonProps.type ?? 'button'}
      onClick={buttonProps.onClick}
      disabled={buttonProps.disabled}
      aria-label={props.ariaLabel}
      whileTap={press}
      transition={transition}
      className={classesFor(props)}
      style={noHighlight}
    >
      {content}
    </motion.button>
  );
}

/** The icon variant, always a 44pt target whatever the glyph measures. */
export function IconButton({
  children,
  onClick,
  ariaLabel,
  active = false,
  className = '',
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  active?: boolean;
  className?: string;
  href?: string;
}) {
  const tap = useTapScale(0.96);
  const transition = useTransition('press');
  const classes = [
    'inline-flex h-11 w-11 items-center justify-center rounded-full',
    active ? 'text-terracotta-ink' : 'text-brown',
    className,
  ].join(' ');

  if (href) {
    return (
      <motion.div whileTap={tap} transition={transition} className="inline-flex" style={noHighlight}>
        <Link href={href} aria-label={ariaLabel} className={classes} style={noHighlight}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      whileTap={tap}
      transition={transition}
      className={classes}
      style={noHighlight}
    >
      {children}
    </motion.button>
  );
}
