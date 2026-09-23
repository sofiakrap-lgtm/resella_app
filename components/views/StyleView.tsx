'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { styleBoard, matchesStyle } from '@/lib/style';
import { price } from '@/lib/format';
import { productImage } from '@/lib/imagePath';
import { useApp } from '@/lib/state';
import { useStagger, useTapScale } from '@/lib/motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ProductCard';
import { HeartIcon, SparkleIcon } from '@/components/ui/Icons';

/**
 * Style discovery. Pick the photos you like, and the catalogue is ranked by
 * what it shares with them. It reads the same columns the search does, so
 * every suggestion is an item that is really on a table.
 */
export function StyleView() {
  const { styleLikes, toggleStyleLike } = useApp();
  const [started, setStarted] = useState(styleLikes.length > 0);
  const board = styleBoard();
  const matches = matchesStyle(styleLikes);

  if (!started) {
    return (
      <section className="section screen-x">
        <div className="rounded-[20px] bg-surface p-6 text-center shadow-card">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cream-panel text-terracotta-ink">
            <SparkleIcon size={24} />
          </span>
          <h2 className="t-title2 mt-4">Löydä oma tyylisi</h2>
          <p className="t-body mt-2 text-brown-70">
            Tallenna kuvia, joista pidät, niin näytämme samantyylisiä löytöjä kirpputoreilta.
          </p>
          <div className="mt-6">
            <Button full size="lg" onClick={() => setStarted(true)}>
              Aloita tyylitaulu
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      <section className="section">
        <div className="screen-x">
          <h2 className="t-title3">Mikä näistä on sinun?</h2>
          <p className="t-subhead mt-1 text-brown-70">
            {styleLikes.length === 0
              ? 'Tallenna ensimmäinen kuva, niin tyylisi alkaa muotoutua.'
              : `${styleLikes.length} tallennettua, ${matches.length} samantyylistä löytöä.`}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 screen-x">
          {board.map((product, index) => (
            <StyleTile
              key={product.id}
              index={index}
              liked={styleLikes.includes(product.id)}
              onToggle={() => toggleStyleLike(product.id)}
              image={productImage(product.images[0])}
              label={product.title}
            />
          ))}
        </div>
      </section>

      {matches.length ? (
        <section className="section">
          <h2 className="t-title3 screen-x">Sinun tyylisi</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 screen-x">
            {matches.slice(0, 10).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} fullWidth />
            ))}
          </div>
          <p className="t-caption mt-3 text-center text-brown-70 screen-x">
            {`Halvin osuma ${price(matches[matches.length - 1].priceEur)}.`}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function StyleTile({
  image,
  label,
  liked,
  index,
  onToggle,
}: {
  image: string;
  label: string;
  liked: boolean;
  index: number;
  onToggle: () => void;
}) {
  const transition = useStagger(index, 0.03);
  const tap = useTapScale(0.94);
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={liked}
      aria-label={liked ? `Poista tyylistä: ${label}` : `Lisää tyyliin: ${label}`}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={tap}
      transition={transition}
      className="relative block aspect-square w-full overflow-hidden rounded-[14px] bg-cream-sink"
    >
      <SafeImage src={image} alt={label} label={label} compact className="h-full w-full object-cover" />
      <span
        className="absolute inset-0 transition-opacity"
        style={{ background: 'rgba(60,36,21,0.35)', opacity: liked ? 1 : 0 }}
        aria-hidden="true"
      />
      <span
        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full transition-colors"
        style={{
          background: liked ? 'var(--color-terracotta-ink)' : 'rgba(255,255,255,0.85)',
          color: liked ? 'var(--color-on-terracotta)' : 'var(--color-brown)',
        }}
        aria-hidden="true"
      >
        <HeartIcon size={15} filled={liked} />
      </span>
    </motion.button>
  );
}
