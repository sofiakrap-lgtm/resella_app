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
      {title ? <h2 className="t-footnote px-5 pb-1.5 uppercase tracking-wide text-brown-70">{title}</h2> : null}
      <div className="mx-4 overflow-hidden rounded-[16px] bg-cream shadow-card">{children}</div>
      {footer ? <p className="t-caption px-5 pt-1.5 text-brown-70">{footer}</p> : null}
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
      {icon ? <span className="shrink-0 text-terracotta">{icon}</span> : null}
      <span className="t-body min-w-0 flex-1 truncate" style={destructive ? { color: 'var(--color-danger)' } : undefined}>
        {label}
      </span>
      {value ? <span className="t-body shrink-0 text-brown-70">{value}</span> : null}
      {right ?? (href || onClick ? <ChevronRight size={18} className="shrink-0 text-brown-50" /> : null)}
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
        {description ? <span className="t-caption block text-brown-70">{description}</span> : null}
      </span>
      {/* The input fills a 44pt target, the track and knob are drawn behind it. */}
      <span className="relative inline-flex h-11 w-[52px] shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 h-11 w-[52px] cursor-pointer appearance-none rounded-full"
        />
        <span
          className="pointer-events-none h-8 w-[52px] rounded-full bg-cream-sink transition-colors peer-checked:bg-terracotta"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute left-1 top-[10px] h-6 w-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}
