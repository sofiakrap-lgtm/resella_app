'use client';

import type { ReactNode } from 'react';
import { useApp } from '@/lib/state';
import { Mascot } from './Mascot';
import { Button } from './Button';

export function EmptyState({
  title,
  body,
  action,
  pose = 'empty',
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  pose?: 'empty' | 'search' | 'default' | 'wave' | 'celebrate';
}) {
  return (
    <div className="flex flex-col items-center px-8 py-12 text-center">
      <Mascot pose={pose} size={112} />
      <h2 className="t-title3 mt-4">{title}</h2>
      {body ? <p className="t-subhead mt-2 text-ink-secondary">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useApp();
  return (
    <div className="flex flex-col items-center px-8 py-12 text-center">
      <Mascot pose="empty" size={104} />
      <h2 className="t-title3 mt-4">{t('common.errorTitle')}</h2>
      <p className="t-subhead mt-2 text-ink-secondary">{t('common.errorBody')}</p>
      <Button className="mt-5" onClick={onRetry} variant="secondary">
        {t('common.retry')}
      </Button>
    </div>
  );
}
