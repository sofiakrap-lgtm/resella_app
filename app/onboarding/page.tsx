'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { kidsSizes, adultSizes } from '@/lib/mockData';
import { Mascot } from '@/components/ui/Mascot';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { BrandWordmark } from '@/components/ui/BrandMark';

const TASTE_OPTIONS = ['Vaatteet', 'Lastentarvikkeet', 'Astiat', 'Sisustus', 'Vintage'];
const ONBOARDING_CITIES = [
  'Helsinki',
  'Espoo',
  'Vantaa',
  'Tampere',
  'Turku',
  'Oulu',
  'Lahti',
  'Jyväskylä',
];

export default function OnboardingPage() {
  const { t, set, city, tasteCategories, preferredSize } = useApp();
  const router = useRouter();
  const transition = useTransition();
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const pages = 4;

  const finish = () => {
    set('onboarded', true);
    router.replace('/home');
  };

  const go = (next: number) => {
    if (next < 0) return;
    if (next >= pages) {
      finish();
      return;
    }
    setDirection(next > page ? 1 : -1);
    setPage(next);
  };

  return (
    <div className="flex min-h-[100%] flex-col px-6 pb-8 pt-4">
      <div className="flex items-center justify-between">
        <BrandWordmark />
        <button type="button" onClick={finish} className="min-h-11 px-2 t-subhead text-accent">
          {t('common.skip')}
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={transition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(page + 1);
              if (info.offset.x > 60) go(page - 1);
            }}
            className="flex h-full flex-col justify-center py-6"
          >
            {page === 0 ? (
              <Slide
                pose="wave"
                title={t('onboarding.welcomeTitle')}
                body={t('onboarding.welcomeBody')}
              />
            ) : null}

            {page === 1 ? (
              <Slide pose="search" title={t('onboarding.findTitle')} body={t('onboarding.findBody')} />
            ) : null}

            {page === 2 ? (
              <div>
                <Mascot pose="default" size={92} className="mx-auto" />
                <h2 className="t-title1 mt-5 text-center">{t('onboarding.cityTitle')}</h2>
                <p className="t-subhead mt-2 text-center text-ink-secondary">{t('onboarding.cityBody')}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {ONBOARDING_CITIES.map((name) => (
                    <Chip key={name} selected={city === name} onClick={() => set('city', name)}>
                      {name}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}

            {page === 3 ? (
              <div>
                <h2 className="t-title1 text-center">{t('onboarding.tasteTitle')}</h2>
                <p className="t-subhead mt-2 text-center text-ink-secondary">{t('onboarding.tasteBody')}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {TASTE_OPTIONS.map((option) => {
                    const selected = tasteCategories.includes(option);
                    return (
                      <Chip
                        key={option}
                        selected={selected}
                        onClick={() =>
                          set(
                            'tasteCategories',
                            selected
                              ? tasteCategories.filter((item) => item !== option)
                              : [...tasteCategories, option],
                          )
                        }
                      >
                        {option}
                      </Chip>
                    );
                  })}
                </div>

                <p className="t-headline mt-7 text-center">{t('onboarding.sizeLabel')}</p>
                <p className="t-footnote mt-1 text-center text-ink-secondary">{t('onboarding.sizeHint')}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {[...adultSizes, ...kidsSizes.slice(4, 9)].map((size) => (
                    <Chip
                      key={size}
                      selected={preferredSize === size}
                      onClick={() => set('preferredSize', preferredSize === size ? null : size)}
                    >
                      {size}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label={t('app.name')}>
        {Array.from({ length: pages }).map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`${index + 1}/${pages}`}
            aria-selected={index === page}
            role="tab"
            onClick={() => go(index)}
            className="flex h-11 w-6 items-center justify-center"
          >
            <motion.span
              animate={{ width: index === page ? 22 : 7, opacity: index === page ? 1 : 0.35 }}
              transition={transition}
              className="block h-[7px] rounded-full bg-accent"
            />
          </button>
        ))}
      </div>

      <div className="mt-3">
        <Button full size="lg" onClick={() => go(page + 1)}>
          {page === pages - 1 ? t('common.start') : t('common.continue')}
        </Button>
        <p className="t-caption1 mt-3 text-center text-ink-secondary">{t('onboarding.noAccount')}</p>
      </div>
    </div>
  );
}

function Slide({ pose, title, body }: { pose: 'wave' | 'search'; title: string; body: string }) {
  return (
    <div className="text-center">
      <Mascot pose={pose} size={148} className="mx-auto" />
      <h2 className="t-large-title mt-6">{title}</h2>
      <p className="t-body mt-3 text-ink-secondary">{body}</p>
    </div>
  );
}
