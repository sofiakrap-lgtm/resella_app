'use client';

import { useEffect, useRef } from 'react';
import { useApp } from '@/lib/state';
import { SearchIcon, CloseIcon } from '@/components/ui/Icons';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  loading?: boolean;
}

/** iOS style search field with an inline clear button and a cancel action. */
export function SearchField({
  value,
  onChange,
  onSubmit,
  onCancel,
  autoFocus = false,
  placeholder,
  loading = false,
}: SearchFieldProps) {
  const { t } = useApp();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <form
        className="flex min-h-11 flex-1 items-center gap-2 rounded-[12px] bg-surface-2 px-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.();
        }}
        role="search"
      >
        <SearchIcon size={18} className="shrink-0 text-ink-secondary" />
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder ?? t('search.placeholder')}
          aria-label={t('common.search')}
          enterKeyHint="search"
          className="t-body min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-ink-secondary"
        />
        {loading ? (
          <span
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-ink-tertiary border-t-accent"
            aria-hidden="true"
          />
        ) : null}
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={t('search.clearRecent')}
            className="flex h-11 w-8 shrink-0 items-center justify-center text-ink-secondary"
          >
            <CloseIcon size={16} />
          </button>
        ) : null}
        <button type="submit" className="sr-only">
          {t('common.search')}
        </button>
      </form>
      {onCancel ? (
        <button type="button" onClick={onCancel} className="min-h-11 shrink-0 px-1 t-body text-accent">
          {t('common.cancel')}
        </button>
      ) : null}
    </div>
  );
}
