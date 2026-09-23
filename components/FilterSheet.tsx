'use client';

import { useEffect, useState } from 'react';
import type { Filters } from '@/lib/types';
import { categories, allColors, allConditions, allAudiences } from '@/data/categories';
import { markets, cities } from '@/data/markets';
import { PRICE_MAX, activeFilterCount } from '@/lib/filters';
import { Sheet } from './ui/Sheet';
import { Chip, Tag } from './ui/Chip';
import { Button } from './ui/Button';
import { CloseIcon } from './ui/Icons';

/**
 * Filter panel. Price, size, colour, brand and condition are the five filters
 * shoppers expect, and every one of them allows multiple choices.
 */
export function FilterSheet({
  open,
  onClose,
  filters,
  onApply,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
  resultCount: number;
}) {
  const [draft, setDraft] = useState<Filters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const sizes = Array.from(
    new Set(
      categories
        .filter((category) => !draft.categories.length || draft.categories.includes(category.slug))
        .flatMap((category) => category.sizes),
    ),
  );
  const brands = Array.from(
    new Set(
      categories
        .filter((category) => !draft.categories.length || draft.categories.includes(category.slug))
        .flatMap((category) => category.brands),
    ),
  );

  return (
    <Sheet open={open} onClose={onClose} title="Suodata" detents={[0.55, 0.92]}>
      <div className="px-4 pb-32 pt-3">
        {activeFilterCount(draft) > 0 ? (
          <section className="mb-5">
            <h3 className="t-footnote mb-2 text-brown-70">Valitut suodattimet</h3>
            <div className="flex flex-wrap gap-1.5">
              {draft.categories.map((slug) => (
                <Tag key={slug} tone="accent">
                  {categories.find((category) => category.slug === slug)?.name ?? slug}
                </Tag>
              ))}
              {draft.audiences.map((audience) => (
                <Tag key={audience} tone="accent">
                  {audience}
                </Tag>
              ))}
              {draft.sizes.map((size) => (
                <Tag key={size} tone="accent">{`Koko ${size}`}</Tag>
              ))}
              {draft.colors.map((color) => (
                <Tag key={color} tone="accent">
                  {color}
                </Tag>
              ))}
              {draft.brands.map((brand) => (
                <Tag key={brand} tone="accent">
                  {brand}
                </Tag>
              ))}
              {draft.conditions.map((condition) => (
                <Tag key={condition} tone="accent">
                  {condition}
                </Tag>
              ))}
              {draft.maxPrice < PRICE_MAX ? <Tag tone="accent">{`Enintään ${draft.maxPrice} €`}</Tag> : null}
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    categories: [],
                    audiences: [],
                    sizes: [],
                    colors: [],
                    brands: [],
                    conditions: [],
                    minPrice: 0,
                    maxPrice: PRICE_MAX,
                    marketIds: [],
                    cities: [],
                    onlyAvailable: false,
                    onlyNewToday: false,
                  })
                }
                className="inline-flex min-h-11 items-center gap-1 px-2 t-footnote text-terracotta-ink"
              >
                <CloseIcon size={14} />
                Tyhjennä kaikki
              </button>
            </div>
          </section>
        ) : null}

        <Group title={`Hinta, ${draft.minPrice} - ${draft.maxPrice >= PRICE_MAX ? `${PRICE_MAX}+` : draft.maxPrice} €`}>
          <div className="flex items-center gap-3">
            <label className="flex-1">
              <span className="t-caption block text-brown-70">Vähintään</span>
              <input
                type="number"
                min={0}
                max={PRICE_MAX}
                value={draft.minPrice}
                onChange={(event) => setDraft({ ...draft, minPrice: Number(event.target.value) })}
                className="t-body mt-1 min-h-11 w-full rounded-[12px] bg-cream px-3 shadow-card outline-none"
              />
            </label>
            <label className="flex-1">
              <span className="t-caption block text-brown-70">Enintään</span>
              <input
                type="number"
                min={0}
                max={PRICE_MAX}
                value={draft.maxPrice}
                onChange={(event) => setDraft({ ...draft, maxPrice: Number(event.target.value) })}
                className="t-body mt-1 min-h-11 w-full rounded-[12px] bg-cream px-3 shadow-card outline-none"
              />
            </label>
          </div>
          <input
            type="range"
            min={5}
            max={PRICE_MAX}
            step={5}
            value={draft.maxPrice}
            onChange={(event) => setDraft({ ...draft, maxPrice: Number(event.target.value) })}
            aria-label="Enimmäishinta"
            className="mt-2 h-11 w-full accent-[var(--color-terracotta)]"
          />
        </Group>

        <Group title="Kenelle">
          <div className="flex flex-wrap gap-2">
            {allAudiences
              .filter((audience) => audience !== 'Ei kokoa')
              .map((audience) => (
                <Chip
                  key={audience}
                  selected={draft.audiences.includes(audience)}
                  onClick={() => setDraft({ ...draft, audiences: toggle(draft.audiences, audience) })}
                >
                  {audience}
                </Chip>
              ))}
          </div>
        </Group>

        <Group title="Koko">
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
        </Group>

        <Group title="Väri">
          <div className="flex flex-wrap gap-2">
            {allColors.map((color) => (
              <Chip
                key={color}
                selected={draft.colors.includes(color)}
                onClick={() => setDraft({ ...draft, colors: toggle(draft.colors, color) })}
              >
                {color}
              </Chip>
            ))}
          </div>
        </Group>

        <Group title="Merkki">
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <Chip
                key={brand}
                selected={draft.brands.includes(brand)}
                onClick={() => setDraft({ ...draft, brands: toggle(draft.brands, brand) })}
              >
                {brand}
              </Chip>
            ))}
          </div>
        </Group>

        <Group title="Kunto">
          <div className="flex flex-wrap gap-2">
            {allConditions.map((condition) => (
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

        <Group title="Kategoria">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Chip
                key={category.slug}
                selected={draft.categories.includes(category.slug)}
                onClick={() => setDraft({ ...draft, categories: toggle(draft.categories, category.slug) })}
              >
                {category.name}
              </Chip>
            ))}
          </div>
        </Group>

        <Group title="Kaupunki">
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Chip
                key={city}
                selected={draft.cities.includes(city)}
                onClick={() => setDraft({ ...draft, cities: toggle(draft.cities, city) })}
              >
                {city}
              </Chip>
            ))}
          </div>
        </Group>

        <Group title="Kirpputori">
          <div className="flex flex-wrap gap-2">
            {markets
              .filter((market) => !draft.cities.length || draft.cities.includes(market.city))
              .map((market) => (
                <Chip
                  key={market.id}
                  selected={draft.marketIds.includes(market.id)}
                  onClick={() => setDraft({ ...draft, marketIds: toggle(draft.marketIds, market.id) })}
                >
                  {market.name}
                </Chip>
              ))}
          </div>
        </Group>

        <Group title="Muut">
          <div className="flex flex-wrap gap-2">
            <Chip
              selected={draft.onlyAvailable}
              onClick={() => setDraft({ ...draft, onlyAvailable: !draft.onlyAvailable })}
            >
              Vain saatavilla
            </Chip>
            <Chip
              selected={draft.onlyNewToday}
              onClick={() => setDraft({ ...draft, onlyNewToday: !draft.onlyNewToday })}
            >
              Uutta tänään
            </Chip>
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
          Näytä tulokset ({resultCount})
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
