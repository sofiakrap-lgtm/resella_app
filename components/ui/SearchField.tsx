'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/state';
import { SearchIcon, CloseCircleIcon } from './Icons';

interface SearchFieldProps {
  value: string;
  /** Fires as the viewer types, 200ms after they stop. */
  onSearch: (value: string) => void;
  /** Fires on every keystroke, for the field's own text. */
  onChange?: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  ariaLabel?: string;
}

/**
 * The search field, iOS shaped: one 36pt rounded rectangle that carries the
 * magnifier and the clear glyph inside it, with Peruuta sliding in beside it
 * while the field has focus. There is no separate search button: the results
 * follow the typing.
 */
export function SearchField({
  value,
  onSearch,
  onChange,
  placeholder = 'Hae tuotetta, merkkiä tai kirppistä',
  autoFocus = false,
  ariaLabel = 'Hae',
}: SearchFieldProps) {
  const { motionEnabled } = useApp();
  const [text, setText] = useState(value);
  const [focused, setFocused] = useState(false);
  const field = useRef<HTMLInputElement | null>(null);

  useEffect(() => setText(value), [value]);

  /**
   * Every keystroke reaches the screen immediately through onChange, so a
   * search filters as it is typed. There used to be a 200ms debounce in front
   * of onSearch here, which meant two things that were both wrong: the first
   * letter typed on the browse screen navigated away to a search for one
   * letter, and on the search screen the results lagged the typing by a fifth
   * of a second for no work being done. onSearch is now the commit, and it
   * only runs when the search is actually submitted.
   */
  const type = (next: string) => {
    setText(next);
    onChange?.(next);
  };

  const submitNow = (next: string) => {
    onSearch(next);
  };

  return (
    <div className="flex items-center gap-2" role="search">
      <div className="flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-[10px] bg-cream-sink pl-2.5 pr-1">
        <SearchIcon size={17} className="shrink-0 text-brown" />
        <input
          ref={field}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoFocus={autoFocus}
          value={text}
          aria-label={ariaLabel}
          placeholder={placeholder}
          onChange={(event) => type(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submitNow(text);
              field.current?.blur();
            }
          }}
          className="t-body min-w-0 flex-1 bg-transparent outline-none placeholder:text-brown-70 [&::-webkit-search-cancel-button]:appearance-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        />
        {text ? (
          <button
            type="button"
            aria-label="Tyhjennä haku"
            // Mousedown, so the field does not lose focus before the clear lands.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setText('');
              onChange?.('');
              submitNow('');
              field.current?.focus();
            }}
            className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center text-brown-70"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <CloseCircleIcon size={17} />
          </button>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {focused || text ? (
          <motion.button
            type="button"
            initial={motionEnabled ? { opacity: 0, x: 16 } : false}
            animate={{ opacity: 1, x: 0 }}
            exit={motionEnabled ? { opacity: 0, x: 16 } : { opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setText('');
              onChange?.('');
              submitNow('');
              setFocused(false);
              field.current?.blur();
            }}
            className="t-card-title min-h-11 shrink-0 whitespace-nowrap px-1 font-normal text-terracotta-ink"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Peruuta
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
