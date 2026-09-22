'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { categories } from '@/data/categories';
import { cities } from '@/data/markets';
import type { CategorySlug } from '@/lib/types';
import { Mascot } from '@/components/ui/Mascot';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { BrandWordmark } from '@/components/ui/BrandMark';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', '98', '104', '110', '116', '122', '128'];

/** Three light steps. No account, nothing blocking. */
export default function OnboardingPage() {
  const { set, city, interests, sizes } = useApp();
  const router = useRouter();
  const transition = useTransition();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const finish = () => {
    set('onboarded', true);
    router.replace('/koti');
  };

  const go = (next: number) => {
    if (next < 0) return;
    if (next > 2) {
      finish();
      return;
    }
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
      <div className="flex items-center justify-between">
        <BrandWordmark height={24} />
        <button type="button" onClick={finish} className="min-h-11 px-2 t-subhead text-terracotta-ink">
          Ohita
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={transition}
            className="flex h-full flex-col justify-center py-6"
          >
            {step === 0 ? (
              <div className="text-center">
                <Mascot pose="wave" size={148} className="mx-auto" />
                <h1 className="t-large-title mt-6">Tervetuloa</h1>
                <p className="t-body mt-3 text-brown-70">
                  Löydä juuri etsimäsi second hand. Näet myös, millä kirpputorilla ja missä pöydässä
                  tuote odottaa sinua.
                </p>
              </div>
            ) : null}

            {step === 1 ? (
              <div>
                <h1 className="t-title1 text-center">Mikä kiinnostaa?</h1>
                <p className="t-subhead mt-2 text-center text-brown-70">
                  Valitse yksi tai useampi. Voit muuttaa valintoja myöhemmin.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {categories.map((category) => (
                    <Chip
                      key={category.slug}
                      selected={interests.includes(category.slug)}
                      onClick={() =>
                        set('interests', toggle(interests, category.slug) as CategorySlug[])
                      }
                    >
                      {category.name}
                    </Chip>
                  ))}
                </div>

                <p className="t-headline mt-7 text-center">Tavallisimmat kokosi</p>
                <p className="t-footnote mt-1 text-center text-brown-70">
                  Vapaaehtoinen, auttaa nostamaan sopivat löydöt esiin.
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {SIZE_OPTIONS.map((size) => (
                    <Chip
                      key={size}
                      selected={sizes.includes(size)}
                      onClick={() => set('sizes', toggle(sizes, size))}
                    >
                      {size}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <Mascot pose="search" size={110} className="mx-auto" />
                <h1 className="t-title1 mt-5 text-center">Missä liikut?</h1>
                <p className="t-subhead mt-2 text-center text-brown-70">
                  Näytämme lähimmät kirpputorit ensin.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {cities.map((option) => (
                    <Chip key={option} selected={city === option} onClick={() => set('city', option)}>
                      {option}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            type="button"
            aria-label={`Vaihe ${index + 1}/3`}
            onClick={() => go(index)}
            className="flex h-11 w-11 items-center justify-center"
          >
            <motion.span
              animate={{ width: index === step ? 22 : 7, opacity: index === step ? 1 : 0.35 }}
              transition={transition}
              className="block h-[7px] rounded-full bg-terracotta"
            />
          </button>
        ))}
      </div>

      <div className="mt-3">
        <Button full size="lg" onClick={() => go(step + 1)}>
          {step === 2 ? 'Valmista' : 'Jatka'}
        </Button>
        <p className="t-caption mt-3 text-center text-brown-70">
          Ei tarvitse luoda tiliä. Voit selata heti.
        </p>
      </div>
    </div>
  );
}
