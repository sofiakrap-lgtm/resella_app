'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useApp } from '@/lib/state';
import { IconButton } from './Button';
import { ChevronLeft } from './Icons';

interface ScreenHeaderProps {
  title: string;
  /** When the screen renders a large title below, the inline one fades in on scroll. */
  largeTitleBelow?: boolean;
  back?: boolean | string;
  right?: ReactNode;
  /** Keeps the bar transparent until the content scrolls under it. */
  transparent?: boolean;
}

/** 44pt navigation bar that picks up the Liquid Glass edge blur on scroll. */
export function ScreenHeader({
  title,
  largeTitleBelow = false,
  back = false,
  right,
  transparent = false,
}: ScreenHeaderProps) {
  const { t } = useApp();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const container = document.getElementById('app-scroll');
    if (!container) return;
    const onScroll = () => setScrolled(container.scrollTop > 28);
    onScroll();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const showTitle = largeTitleBelow ? scrolled : true;
  const glass = transparent ? scrolled : true;

  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-200 ${
        glass ? 'glass-flat border-b border-separator' : 'border-b border-transparent'
      }`}
    >
      <div className="flex min-h-[44px] items-center gap-1 px-2">
        <div className="flex w-11 shrink-0 items-center">
          {back ? (
            <IconButton
              ariaLabel={t('common.back')}
              onClick={() => (typeof back === 'string' ? router.push(back) : router.back())}
            >
              <ChevronLeft size={24} />
            </IconButton>
          ) : null}
        </div>
        <h1
          className="t-headline flex-1 truncate text-center transition-opacity duration-200"
          style={{ opacity: showTitle ? 1 : 0 }}
        >
          {title}
        </h1>
        <div className="flex min-w-11 shrink-0 items-center justify-end gap-0.5">{right}</div>
      </div>
    </header>
  );
}

/** Large title that lives in the content flow and scrolls away. */
export function LargeTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="px-4 pb-1 pt-1">
      <h2 className="t-large-title">{children}</h2>
      {subtitle ? <p className="t-subhead mt-1 text-ink-secondary">{subtitle}</p> : null}
    </div>
  );
}
