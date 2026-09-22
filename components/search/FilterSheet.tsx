'use client';

import { useEffect, useState } from 'react';
import {
  adultSizes,
  categories,
  cities,
  conditions,
  kidsSizes,
  markets,
  shoeSizes,
  type Category,
  type Condition,
} from '@/lib/mockData';
import { activeFilterCount, type Filters } from '@/lib/search';
import { useApp } from '@/lib/state';
import { Sheet } from '@/components/ui/Sheet';
import { Chip, Tag } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { CloseIcon } from '@/components/ui/Icons';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
  resultCount: number;
}

/** Filter panel. The size filter is expanded first, per list and filtering UX research. */
export function FilterSheet({ open, onClose, filters, onApply, resultCount }: FilterSheetProps) {
  const { t } = useApp();
  const [draft, setDraft] = useState<Filters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return (
    <Sheet open={open} onClose={onClose} title={t('search.filtersTitle')} detents={[0.55, 0.92]}>
      <div className="px-4 pb-32 pt-3">
        {activeFilterCount(draft) > 0 ? (
          <section className="mb-5">
            <h3 className="t-footnote mb-2 text-ink-secondary">{t('search.applied')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {draft.categories.map((category) => (
                <Tag key={category} tone="accent">
                  {category}
                </Tag>
              ))}
              {draft.sizes.map((size) => (
                <Tag key={size} tone="accent">{`${t('product.size')} ${size}`}</Tag>
              ))}
              {draft.conditions.map((condition) => (
                <Tag key={condition} tone="accent">
                  {condition}
                </Tag>
              ))}
              {draft.maxPrice !== null ? <Tag tone="accent">{`${t('search.maxPrice')} ${draft.maxPrice} €`}</Tag> : null}
              {draft.maxDistanceKm !== null ? (
                <Tag tone="accent">{`${t('search.maxDistance')} ${draft.maxDistanceKm} km`}</Tag>
              ) : null}
              {draft.city ? <Tag tone="accent">{draft.city}</Tag> : null}
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    categories: [],
                    sizes: [],
                    conditions: [],
                    maxPrice: null,
                    maxDistanceKm: null,
                    marketId: null,
                  })
                }
                className="inline-flex min-h-11 items-center gap-1 px-2 t-footnote text-accent"
              >
                <CloseIcon size={14} />
                {t('search.clearFilters')}
              </button>
            </div>
          </section>
        ) : null}

        <Group title={t('search.filterSize')}>
          <SizeGroup label="Lasten koot" sizes={kidsSizes} draft={draft} setDraft={setDraft} toggle={toggle} />
          <SizeGroup label="Aikuisten koot" sizes={adultSizes} draft={draft} setDraft={setDraft} toggle={toggle} />
          <SizeGroup label="Kengät" sizes={shoeSizes} draft={draft} setDraft={setDraft} toggle={toggle} />
        </Group>

        <Group title={t('search.filterCategory')}>
          <div className="flex flex-wrap gap-2">
            {categories.map((category: Category) => (
              <Chip
                key={category}
                selected={draft.categories.includes(category)}
                onClick={() => setDraft({ ...draft, categories: toggle(draft.categories, category) })}
              >
                {category}
              </Chip>
            ))}
          </div>
        </Group>

        <Group title={t('search.filterCondition')}>
          <div className="flex flex-wrap gap-2">
            {conditions.map((condition: Condition) => (
              <Chip
                key={condition}
                selected={draft.conditions.includes(condition)}
                onClick={() => setDraft({ ...draft, conditions: toggle(draft.conditions, condition) })}
              >
                {condition}
              </Chip>
            ))}
          </div>
        </Group>

        <Group title={`${t('search.filterPrice')}, ${t('search.maxPrice').toLowerCase()} ${draft.maxPrice ?? 150} €`}>
          <input
            type="range"
            min={5}
            max={150}
            step={5}
            value={draft.maxPrice ?? 150}
            onChange={(event) =>
              setDraft({
                ...draft,
                maxPrice: Number(event.target.value) >= 150 ? null : Number(event.target.value),
              })
            }
            aria-label={t('search.filterPrice')}
            className="h-11 w-full accent-[var(--color-accent)]"
          />
        </Group>

        <Group
          title={`${t('search.filterDistance')}, ${t('search.maxDistance').toLowerCase()} ${
            draft.maxDistanceKm ?? 50
          } km`}
        >
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={draft.maxDistanceKm ?? 50}
            onChange={(event) =>
              setDraft({
                ...draft,
                maxDistanceKm: Number(event.target.value) >= 50 ? null : Number(event.target.value),
              })
            }
            aria-label={t('search.filterDistance')}
            className="h-11 w-full accent-[var(--color-accent)]"
          />
        </Group>

        <Group title={t('search.filterCity')}>
          <div className="flex flex-wrap gap-2">
            <Chip selected={!draft.city} onClick={() => setDraft({ ...draft, city: null, marketId: null })}>
              {t('search.allCities')}
            </Chip>
            {cities.map((city) => (
              <Chip
                key={city}
                selected={draft.city === city}
                onClick={() => setDraft({ ...draft, city, marketId: null })}
              >
                {city}
              </Chip>
            ))}
          </div>
        </Group>

        <Group title={t('search.filterMarket')}>
          <div className="flex flex-wrap gap-2">
            {markets
              .filter((market) => !draft.city || market.city === draft.city)
              .map((market) => (
                <Chip
                  key={market.id}
                  selected={draft.marketId === market.id}
                  onClick={() =>
                    setDraft({ ...draft, marketId: draft.marketId === market.id ? null : market.id })
                  }
                >
                  {market.name}
                </Chip>
              ))}
          </div>
        </Group>
      </div>

      <div className="glass absolute inset-x-0 bottom-0 px-4 pb-5 pt-3">
        <Button
          full
          size="lg"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          {t('search.apply')} ({resultCount})
        </Button>
      </div>
    </Sheet>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="t-headline mb-2">{title}</h3>
      {children}
    </section>
  );
}

function SizeGroup({
  label,
  sizes,
  draft,
  setDraft,
  toggle,
}: {
  label: string;
  sizes: string[];
  draft: Filters;
  setDraft: (filters: Filters) => void;
  toggle: <T>(list: T[], value: T) => T[];
}) {
  return (
    <div className="mb-3">
      <p className="t-footnote mb-1.5 text-ink-secondary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <Chip
            key={size}
            selected={draft.sizes.includes(size)}
            onClick={() => setDraft({ ...draft, sizes: toggle(draft.sizes, size) })}
          >
            {size}
          </Chip>
        ))}
      </div>
    </div>
  );
}
