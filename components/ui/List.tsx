'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from './Icons';

/** iOS grouped list section. */
export function ListSection({
  title,
  footer,
  children,
}: {
  title?: string;
  footer?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6">
      {title ? <h2 className="t-footnote px-5 pb-1.5 uppercase tracking-wide text-ink-secondary">{title}</h2> : null}
      <div className="mx-4 overflow-hidden rounded-[16px] bg-surface shadow-card">{children}</div>
      {footer ? <p className="t-caption1 px-5 pt-1.5 text-ink-secondary">{footer}</p> : null}
    </section>
  );
}

interface ListRowProps {
  label: string;
  value?: ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  right?: ReactNode;
  destructive?: boolean;
}

export function ListRow({ label, value, href, onClick, icon, right, destructive }: ListRowProps) {
  const content = (
    <>
      {icon ? <span className="shrink-0 text-accent">{icon}</span> : null}
      <span className="t-body min-w-0 flex-1 truncate" style={destructive ? { color: 'var(--color-danger)' } : undefined}>
        {label}
      </span>
      {value ? <span className="t-body shrink-0 text-ink-secondary">{value}</span> : null}
      {right ?? (href || onClick ? <ChevronRight size={18} className="shrink-0 text-ink-tertiary" /> : null)}
    </>
  );

  const className =
    'flex min-h-11 w-full items-center gap-3 border-b border-separator px-4 py-3 text-left last:border-b-0';

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }
  return <div className={className}>{content}</div>;
}

/** iOS style switch, keyboard operable and labelled. */
export function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}) {
  return (
    <label className="flex min-h-11 w-full cursor-pointer items-center gap-3 border-b border-separator px-4 py-3 last:border-b-0">
      <span className="min-w-0 flex-1">
        <span className="t-body block">{label}</span>
        {description ? <span className="t-caption1 block text-ink-secondary">{description}</span> : null}
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer h-8 w-[52px] cursor-pointer appearance-none rounded-full bg-surface-2 transition-colors checked:bg-accent"
        />
        <span
          className="pointer-events-none absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}
