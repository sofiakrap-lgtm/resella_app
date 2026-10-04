'use client';

import { useSyncExternalStore } from 'react';

/**
 * How many sheets are open right now. The tab bar steps out of the way while
 * one is, the way iOS hides it behind a modal, and a sheet cannot know about
 * the bar on its own.
 */
let openCount = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function openedSheet() {
  openCount += 1;
  emit();
}

export function closedSheet() {
  openCount = Math.max(0, openCount - 1);
  emit();
}

export function useSheetOpen() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => openCount > 0,
    () => false,
  );
}
