'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';
import { Mascot } from '@/components/ui/Mascot';
import { BrandWordmark } from '@/components/ui/BrandMark';

/** Splash and router: returning visitors go straight to the feed. */
export default function EntryPage() {
  const { ready, onboarded } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(onboarded ? '/koti' : '/onboarding');
  }, [ready, onboarded, router]);

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
      <Mascot pose="wave" size={120} />
      <BrandWordmark />
    </div>
  );
}
