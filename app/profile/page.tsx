'use client';

import Link from 'next/link';

/**
 * Konsta types `linkComponent` as a string, but it is rendered as a component,
 * so next/link can be passed through to keep client side navigation.
 */
const LinkComponent = Link as unknown as string;
import { formatPrice, marketById, productById } from '@/lib/mockData';
import { useApp } from '@/lib/state';
import { ScreenHeader, LargeTitle } from '@/components/ui/ScreenHeader';
import { BlockTitle, List, ListItem } from 'konsta/react';
import { Mascot } from '@/components/ui/Mascot';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { LeafIcon, SettingsIcon, SparkleIcon } from '@/components/ui/Icons';

export default function ProfilePage() {
  const { t, name, city, reservations, wishlist, savedSearches, favoriteMarkets } = useApp();

  const purchases = reservations.filter((entry) => entry.kind === 'purchase');
  const bookings = reservations.filter((entry) => entry.kind === 'reservation');
  const found = purchases.length + wishlist.length;

  return (
    <div>
      <ScreenHeader
        title={t('profile.title')}
        largeTitleBelow
        transparent
        right={
          <Button href="/settings" variant="plain" size="sm" ariaLabel={t('settings.title')}>
            <SettingsIcon size={20} />
          </Button>
        }
      />
      <LargeTitle>{t('profile.title')}</LargeTitle>

      <div className="flex items-center gap-4 px-4 pt-2">
        <span className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-accent-soft">
          <Mascot pose="wave" size={64} animate={false} />
        </span>
        <span>
          <span className="t-title3 block">{name}</span>
          <span className="t-subhead block text-ink-secondary">{city}</span>
        </span>
      </div>

      <div className="mx-4 mt-4 flex items-start gap-2 rounded-[16px] bg-accent-soft px-4 py-3">
        <LeafIcon size={18} className="mt-0.5 shrink-0 text-accent" />
        <p className="t-subhead text-accent">{t('profile.impact', { count: found })}</p>
      </div>

      <BlockTitle>{t('profile.reservations')}</BlockTitle>
      <List strong inset dividers>
        {bookings.length === 0 ? (
          <ListItem title={t('profile.noReservations')} />
        ) : (
          bookings.map((reservation) => {
            const product = productById(reservation.productId);
            const market = product ? marketById(product.marketId) : undefined;
            return (
              <ListItem
                key={reservation.id}
                title={product?.title ?? reservation.code}
                after={<Tag tone="accent">{market?.name ?? reservation.code}</Tag>}
                link
                linkComponent={LinkComponent}
                linkProps={{ href: `/receipt/${reservation.id}` }}
              />
            );
          })
        )}
      </List>

      <BlockTitle>{t('profile.purchases')}</BlockTitle>
      <List strong inset dividers>
        {purchases.length === 0 ? (
          <ListItem title={t('profile.noReservations')} />
        ) : (
          purchases.map((reservation) => {
            const product = productById(reservation.productId);
            return (
              <ListItem
                key={reservation.id}
                title={product?.title ?? reservation.code}
                after={formatPrice(reservation.total)}
                link
                linkComponent={LinkComponent}
                linkProps={{ href: `/receipt/${reservation.id}` }}
              />
            );
          })
        )}
      </List>

      <BlockTitle>{t('saved.title')}</BlockTitle>
      <List strong inset dividers>
        <ListItem
          title={t('profile.wishlists')}
          after={String(wishlist.length)}
          link
          linkComponent={LinkComponent}
          linkProps={{ href: '/saved' }}
        />
        <ListItem
          title={t('profile.alerts')}
          after={String(savedSearches.length)}
          link
          linkComponent={LinkComponent}
          linkProps={{ href: '/saved' }}
        />
        <ListItem
          title={t('profile.favoriteMarkets')}
          after={String(favoriteMarkets.length)}
          link
          linkComponent={LinkComponent}
          linkProps={{ href: '/map' }}
        />
        <ListItem
          title={t('profile.style')}
          media={<SparkleIcon size={20} className="text-accent" />}
          link
          linkComponent={LinkComponent}
          linkProps={{ href: '/pinterest' }}
        />
        <ListItem
          title={t('profile.settings')}
          media={<SettingsIcon size={20} className="text-accent" />}
          link
          linkComponent={LinkComponent}
          linkProps={{ href: '/settings' }}
        />
      </List>
    </div>
  );
}
