'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTapScale, useTransition } from '@/lib/motion';

type Variant = 'primary' | 'secondary' | 'glass' | 'plain' | 'danger';
type Size = 'lg' | 'md' | 'sm';

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
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
  primary: 'bg-accent text-on-accent shadow-card',
  secondary: 'bg-surface text-ink border border-separator shadow-card',
  glass: 'glass text-ink',
  plain: 'text-accent',
  danger: 'bg-surface text-danger border border-separator',
};

const sizes: Record<Size, string> = {
  lg: 'min-h-[52px] px-6 t-headline',
  md: 'min-h-[44px] px-5 t-callout font-semibold',
  sm: 'min-h-[44px] px-4 t-subhead font-semibold',
};

function classesFor({ variant = 'primary', size = 'md', full, disabled, className = '' }: BaseProps) {
  return [
    'inline-flex items-center justify-center gap-2 rounded-full select-none',
    'transition-colors duration-150',
    variants[variant],
    sizes[size],
    full ? 'w-full' : '',
    disabled ? 'opacity-40 pointer-events-none' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Button(props: ButtonProps | LinkProps) {
  const tap = useTapScale();
  const transition = useTransition('press');
  const { children, icon, ariaLabel } = props;
  const content = (
    <>
      {icon}
      {children}
    </>
  );

  if ('href' in props && props.href) {
    return (
      <motion.div whileTap={tap} transition={transition} className={props.full ? 'w-full' : 'inline-flex'}>
        <Link
          href={props.href}
          onClick={props.onClick}
          aria-label={ariaLabel}
          className={classesFor(props)}
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
      aria-label={ariaLabel}
      whileTap={tap}
      transition={transition}
      className={classesFor(props)}
    >
      {content}
    </motion.button>
  );
}

/** Circular icon button, always a 44x44 touch target. */
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
  const tap = useTapScale(0.92);
  const transition = useTransition('press');
  const classes = [
    'inline-flex h-11 w-11 items-center justify-center rounded-full',
    active ? 'text-accent-2' : 'text-ink',
    className,
  ].join(' ');

  if (href) {
    return (
      <motion.div whileTap={tap} transition={transition} className="inline-flex">
        <Link href={href} aria-label={ariaLabel} className={classes}>
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
    >
      {children}
    </motion.button>
  );
}
