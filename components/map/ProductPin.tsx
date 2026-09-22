'use client';

import { motion } from 'framer-motion';
import { formatPrice, type Product } from '@/lib/mockData';
import { useTapScale, useTransition } from '@/lib/motion';

/** Price bubble used when results are shown on the map. */
export function ProductPin({
  product,
  selected = false,
  onClick,
}: {
  product: Product;
  selected?: boolean;
  onClick?: () => void;
}) {
  const tap = useTapScale(0.9);
  const transition = useTransition('press');
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={tap}
      transition={transition}
      aria-label={`${product.title}, ${formatPrice(product.price)}`}
      className="min-h-11 rounded-full px-3 t-caption1 font-semibold shadow-card"
      style={{
        background: selected ? 'var(--color-accent)' : 'var(--color-surface)',
        color: selected ? 'var(--color-on-accent)' : 'var(--color-text)',
      }}
    >
      {formatPrice(product.price)}
    </motion.button>
  );
}
