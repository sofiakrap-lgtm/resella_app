'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { products, type Product, type StyleTag } from '@/lib/mockData';
import { demoImageUrl } from '@/lib/assets';
import { useApp } from '@/lib/state';
import type { StringKey } from '@/lib/i18n';
import { useTransition } from '@/lib/motion';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { Mascot } from '@/components/ui/Mascot';
import { SafeImage } from '@/components/ui/SafeImage';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickView } from '@/components/product/QuickView';
import { ProductCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateViews';
import { SparkleIcon, CameraIcon } from '@/components/ui/Icons';

/**
 * Style search.
 *
 * Real world constraint, documented so the demo does not over promise: reading
 * public boards needs Pinterest API Standard access (a manual review), the
 * August 2026 developer guidelines forbid training AI models on Pinterest
 * material, storing it, scraping it or imitating Pinterest's design. A shippable
 * version therefore connects with OAuth, analyses the board on the fly and
 * matches the result against ReSello's own product index without persisting
 * anything. Everything below is mocked.
 */

type Phase = 'idle' | 'connecting' | 'analyzing' | 'connected' | 'error';

const DETECTED_STYLE: StyleTag[] = ['skandi', 'vintage', 'maanläheinen'];

interface PresetImage {
  id: string;
  labelKey: StringKey;
  match: StyleTag[];
}

const PRESET_IMAGES: PresetImage[] = [
  { id: 'demo-style-1', labelKey: 'pinterest.style1', match: ['minimalistinen', 'maanläheinen'] },
  { id: 'demo-style-2', labelKey: 'pinterest.style2', match: ['skandi', 'minimalistinen'] },
  { id: 'demo-style-3', labelKey: 'pinterest.style3', match: ['vintage', 'maanläheinen'] },
];

export default function PinterestPage() {
  return (
    <Suspense fallback={<Skeleton className="m-4 h-72 rounded-[18px]" />}>
      <PinterestContent />
    </Suspense>
  );
}

function PinterestContent() {
  const search = useSearchParams();
  const { t, pinterestConnected, set } = useApp();
  const transition = useTransition();
  const [phase, setPhase] = useState<Phase>(pinterestConnected ? 'connected' : 'idle');
  const [imageSearch, setImageSearch] = useState<{ id: string; results: Product[] } | null>(null);
  const [searching, setSearching] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const styleFeed = products.filter(
    (product) => product.status !== 'sold' && product.style.some((tag) => DETECTED_STYLE.includes(tag)),
  );

  useEffect(() => {
    // Demo switch: append ?demo=error to show the error state.
    if (search.get('demo') === 'error') setPhase('error');
  }, [search]);

  const connect = () => {
    setPhase('connecting');
    window.setTimeout(() => setPhase('analyzing'), 900);
    window.setTimeout(() => {
      set('pinterestConnected', true);
      setPhase('connected');
    }, 2600);
  };

  const runImageSearch = (preset: PresetImage) => {
    setSearching(true);
    setImageSearch(null);
    window.setTimeout(() => {
      const results = products
        .filter((product) => product.style.some((tag) => preset.match.includes(tag)))
        .slice(0, 8);
      setImageSearch({ id: preset.id, results });
      setSearching(false);
    }, 900);
  };

  return (
    <div className="pb-8">
      <ScreenHeader title={t('pinterest.title')} back />

      {phase === 'error' ? (
        <ErrorState onRetry={() => setPhase('idle')} />
      ) : phase === 'idle' ? (
        <section className="px-4 pt-6 text-center">
          <Mascot pose="search" size={120} className="mx-auto" />
          <h2 className="t-title2 mt-4">{t('pinterest.introTitle')}</h2>
          <p className="t-subhead mt-2 text-ink-secondary">{t('pinterest.introBody')}</p>
          <Button className="mt-5" size="lg" full onClick={connect} icon={<SparkleIcon size={20} />}>
            {t('pinterest.connect')}
          </Button>
          <p className="t-caption1 mt-3 text-ink-secondary">{t('pinterest.privacyNote')}</p>
        </section>
      ) : phase === 'connecting' || phase === 'analyzing' ? (
        <section className="flex flex-col items-center px-8 pt-16 text-center">
          <Mascot pose={phase === 'analyzing' ? 'search' : 'default'} size={120} />
          <p className="t-headline mt-5">
            {phase === 'analyzing' ? t('pinterest.analyzing') : t('pinterest.connecting')}
          </p>
          <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full w-1/3 rounded-full bg-accent"
              animate={{ x: ['-100%', '260%'] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div className="mt-8 flex gap-3">
            {[0, 1, 2].map((key) => (
              <ProductCardSkeleton key={key} />
            ))}
          </div>
        </section>
      ) : (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
          <div className="px-4 pt-4">
            <p className="t-footnote text-ink-secondary">{t('pinterest.styleTitle')}</p>
            <h2 className="t-title2 mt-1">{t('pinterest.styleSummary')}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DETECTED_STYLE.map((tag) => (
                <Tag key={tag} tone="accent">
                  {tag}
                </Tag>
              ))}
            </div>
            <Button
              className="mt-3"
              size="sm"
              variant="plain"
              onClick={() => {
                set('pinterestConnected', false);
                setPhase('idle');
              }}
            >
              {t('pinterest.disconnect')}
            </Button>
          </div>

          <section className="mt-5">
            <h3 className="t-title3 px-4">{t('pinterest.feedTitle')}</h3>
            <div className="mt-2 grid grid-cols-2 gap-3 px-4">
              {styleFeed.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onQuickView={setQuickView}
                  fullWidth
                />
              ))}
            </div>
          </section>
        </motion.section>
      )}

      {/* Visual search, the same idea without a board connection */}
      <section className="mt-8 border-t border-separator pt-5">
        <div className="px-4">
          <h3 className="t-title3 inline-flex items-center gap-2">
            <CameraIcon size={20} className="text-accent" />
            {t('pinterest.imageSearch')}
          </h3>
          <p className="t-subhead mt-1 text-ink-secondary">{t('pinterest.imageSearchBody')}</p>
        </div>
        <div className="hide-scrollbar mt-3 flex gap-3 overflow-x-auto px-4">
          {PRESET_IMAGES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => runImageSearch(preset)}
              aria-label={`${t('pinterest.pickImage')}: ${t(preset.labelKey)}`}
              className="w-[132px] shrink-0 text-left"
            >
              <span
                className="block h-[132px] w-full overflow-hidden rounded-[16px] shadow-card"
                style={{
                  outline: imageSearch?.id === preset.id ? '2px solid var(--color-accent)' : undefined,
                }}
              >
                <SafeImage
                  src={demoImageUrl(preset.id)}
                  alt={t(preset.labelKey)}
                  label={t(preset.labelKey)}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="t-caption1 mt-1.5 block">{t(preset.labelKey)}</span>
            </button>
          ))}
        </div>

        {searching ? (
          <div className="hide-scrollbar mt-4 flex gap-3 px-4">
            {[0, 1, 2].map((key) => (
              <ProductCardSkeleton key={key} />
            ))}
          </div>
        ) : null}

        {imageSearch ? (
          <div className="hide-scrollbar mt-4 flex gap-3 overflow-x-auto px-4">
            {imageSearch.results.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onQuickView={setQuickView} />
            ))}
          </div>
        ) : null}
      </section>

      <p className="t-caption1 mt-8 px-4 text-center text-ink-secondary">{t('pinterest.privacyNote')}</p>

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}
