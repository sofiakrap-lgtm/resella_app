import type { AppNotification } from '@/lib/types';

/** Seeded notifications. Tapping one opens the screen it talks about. */
export const seedNotifications: AppNotification[] = [
  {
    id: 'n-1',
    kind: 'uusi-tuote',
    title: 'Anni K. lisäsi uuden tuotteen',
    body: 'Villakangastakki, koko M, 48,00 €',
    href: '/tuote/p-naiset-001',
    minutesAgo: 12,
  },
  {
    id: 'n-2',
    kind: 'hakuvahti',
    title: 'Hakuvahti osui',
    body: 'Lasten haalari, koko 122: 2 uutta osumaa',
    href: '/haku?q=haalari&cat=lapset&size=122',
    minutesAgo: 95,
  },
  {
    id: 'n-3',
    kind: 'uusi-tuote',
    title: 'Ogelin kirppis, uutta tänään',
    body: '6 uutta tuotetta seuraamallasi kirpputorilla',
    href: '/kirpputori/ogeli-hki',
    minutesAgo: 240,
  },
  {
    id: 'n-4',
    kind: 'hinta',
    title: 'Toivelistan tuote halpeni',
    body: 'Vintage nahkalaukku, nyt 45,00 €',
    href: '/tuote/p-asusteet-051',
    minutesAgo: 1450,
  },
];
