'use client';

import type { ReactNode } from 'react';
import { Mascot } from './Mascot';
import { Button } from './Button';
import type { MascotPose } from '@/lib/imagePath';

export function EmptyState({
  title,
  body,
  action,
  pose = 'empty',
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  pose?: MascotPose;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-12 text-center">
      <Mascot pose={pose} size={108} />
      <h2 className="t-title3 mt-4">{title}</h2>
      {body ? <p className="t-subhead mt-2 text-brown-70">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center px-8 py-12 text-center">
      <Mascot pose="empty" size={104} />
      <h2 className="t-title3 mt-4">Jotain meni pieleen</h2>
      <p className="t-subhead mt-2 text-brown-70">
        Emme saaneet tietoja juuri nyt. Kokeile hetken päästä uudelleen.
      </p>
      <Button className="mt-5" onClick={onRetry} variant="secondary">
        Yritä uudelleen
      </Button>
    </div>
  );
}
