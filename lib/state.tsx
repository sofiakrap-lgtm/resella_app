'use client';

/**
 * Client side store for the consumer app. Everything is local: no backend and no
 * account. State is restored after mount so the server and client markup match.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CategorySlug, Filters, Reservation, SavedSearch } from './types';
import { seedSavedSearches } from '@/data/savedSearches';

export interface Toast {
  id: string;
  title: string;
  body?: string;
  href?: string;
}

interface Stored {
  onboarded: boolean;
  city: string;
  interests: CategorySlug[];
  sizes: string[];
  wishlist: string[];
  followedMarkets: string[];
  followedSellers: string[];
  savedSearches: SavedSearch[];
  reservations: Reservation[];
  /** Items this viewer has reserved, shown as "Varattu" to everyone. */
  reservedIds: string[];
  readNotifications: string[];
  recentSearches: string[];
  largeText: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
}

const defaults: Stored = {
  onboarded: false,
  city: 'Helsinki',
  interests: [],
  sizes: [],
  wishlist: [],
  followedMarkets: ['ogeli-hki'],
  followedSellers: ['anni-k'],
  savedSearches: seedSavedSearches,
  reservations: [],
  reservedIds: [],
  readNotifications: [],
  recentSearches: [],
  largeText: false,
  reduceMotion: false,
  highContrast: false,
};

interface Value extends Stored {
  ready: boolean;
  set: <K extends keyof Stored>(key: K, value: Stored[K]) => void;
  toggleWishlist: (productId: string) => void;
  toggleFollowMarket: (marketId: string) => void;
  toggleFollowSeller: (sellerId: string) => void;
  addSavedSearch: (label: string, query: string, filters: Partial<Filters>) => void;
  removeSavedSearch: (id: string) => void;
  addRecentSearch: (query: string) => void;
  reserve: (input: Omit<Reservation, 'id' | 'code' | 'createdAtIso'>) => Reservation;
  cancelReservation: (id: string) => void;
  markNotificationsRead: () => void;
  resetDemo: () => void;
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  motionEnabled: boolean;
}

const AppContext = createContext<Value | null>(null);
const STORAGE_KEY = 'resello-consumer-v1';

function code(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `RS-${out}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(defaults);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    let restored: Partial<Stored> = {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) restored = JSON.parse(raw) as Partial<Stored>;
    } catch {
      restored = {};
    }
    setState((current) => ({ ...current, ...restored }));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private mode, the demo still works without persistence.
    }
  }, [state, ready]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setSystemReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // Accessibility settings are reflected on the document element.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--text-scale', state.largeText ? '1.2' : '1');
    root.dataset.contrast = state.highContrast ? 'high' : 'normal';
    root.dataset.motion = state.reduceMotion ? 'reduce' : 'normal';
  }, [state.largeText, state.highContrast, state.reduceMotion]);

  const set = useCallback(<K extends keyof Stored>(key: K, value: Stored[K]) => {
    setState((current) => ({ ...current, [key]: value }));
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `t-${Date.now()}-${Math.round(Math.random() * 999)}`;
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [value, ...list];

  const value = useMemo<Value>(
    () => ({
      ...state,
      ready,
      toasts,
      pushToast,
      dismissToast,
      motionEnabled: !state.reduceMotion && !systemReducedMotion,
      set,
      toggleWishlist: (productId) =>
        setState((current) => ({ ...current, wishlist: toggle(current.wishlist, productId) })),
      toggleFollowMarket: (marketId) =>
        setState((current) => ({
          ...current,
          followedMarkets: toggle(current.followedMarkets, marketId),
        })),
      toggleFollowSeller: (sellerId) =>
        setState((current) => ({
          ...current,
          followedSellers: toggle(current.followedSellers, sellerId),
        })),
      addSavedSearch: (label, query, filters) =>
        setState((current) => ({
          ...current,
          savedSearches: [
            { id: `vahti-${Date.now()}`, label, query, filters, newMatches: 0 },
            ...current.savedSearches,
          ],
        })),
      removeSavedSearch: (id) =>
        setState((current) => ({
          ...current,
          savedSearches: current.savedSearches.filter((search) => search.id !== id),
        })),
      addRecentSearch: (query) =>
        setState((current) => {
          const trimmed = query.trim();
          if (!trimmed) return current;
          return {
            ...current,
            recentSearches: [trimmed, ...current.recentSearches.filter((q) => q !== trimmed)].slice(
              0,
              8,
            ),
          };
        }),
      reserve: (input) => {
        const reservation: Reservation = {
          ...input,
          id: `res-${Date.now()}`,
          code: code(),
          createdAtIso: new Date().toISOString(),
        };
        setState((current) => ({
          ...current,
          reservations: [reservation, ...current.reservations],
          reservedIds: [...current.reservedIds, input.productId],
        }));
        return reservation;
      },
      cancelReservation: (id) =>
        setState((current) => {
          const target = current.reservations.find((reservation) => reservation.id === id);
          return {
            ...current,
            reservations: current.reservations.filter((reservation) => reservation.id !== id),
            reservedIds: target
              ? current.reservedIds.filter((productId) => productId !== target.productId)
              : current.reservedIds,
          };
        }),
      markNotificationsRead: () =>
        setState((current) => ({ ...current, readNotifications: ['all'] })),
      resetDemo: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        setState(defaults);
        setToasts([]);
      },
    }),
    [state, ready, toasts, set, pushToast, dismissToast, systemReducedMotion],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Value {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

/** Current time, resolved after mount so opening hours never mismatch on hydration. */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}
