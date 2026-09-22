'use client';

/**
 * Single client side store for the demo. Everything is local: no backend, no
 * accounts. State is persisted to localStorage so the demo survives reloads,
 * and it is only read after mount to keep server and client markup identical.
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
import { Language, StringKey, translate } from './i18n';
import { Filters, emptyFilters } from './search';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface SavedSearch {
  id: string;
  label: string;
  filters: Filters;
  notify: boolean;
  lastMatchDaysAgo: number | null;
}

export interface Reservation {
  id: string;
  productId: string;
  kind: 'reservation' | 'purchase';
  pickupHours: number;
  createdAtIso: string;
  code: string;
  name?: string;
  phone?: string;
  total: number;
}

export interface Toast {
  id: string;
  title: string;
  body?: string;
  href?: string;
}

export interface AppState {
  ready: boolean;
  onboarded: boolean;
  language: Language;
  theme: ThemePreference;
  city: string;
  name: string;
  tasteCategories: string[];
  preferredSize: string | null;
  wishlist: string[];
  favoriteMarkets: string[];
  savedSearches: SavedSearch[];
  reservations: Reservation[];
  recentSearches: string[];
  pinterestConnected: boolean;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  increaseContrast: boolean;
  reduceTransparency: boolean;
}

const defaultState: AppState = {
  ready: false,
  onboarded: false,
  language: 'fi',
  theme: 'system',
  city: 'Helsinki',
  name: 'Sofia',
  tasteCategories: [],
  preferredSize: null,
  wishlist: [],
  favoriteMarkets: ['m-ogeli'],
  savedSearches: [],
  reservations: [],
  recentSearches: [],
  pinterestConnected: false,
  notificationsEnabled: true,
  locationEnabled: false,
  largeText: false,
  reduceMotion: false,
  increaseContrast: false,
  reduceTransparency: false,
};

interface AppContextValue extends AppState {
  t: (key: StringKey, params?: Record<string, string | number>) => string;
  set: <K extends keyof AppState>(key: K, value: AppState[K]) => void;
  toggleWishlist: (productId: string) => void;
  toggleFavoriteMarket: (marketId: string) => void;
  addSavedSearch: (label: string, filters: Filters) => void;
  removeSavedSearch: (id: string) => void;
  toggleSavedSearchNotify: (id: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAtIso' | 'code'>) => Reservation;
  resetDemo: () => void;
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  motionEnabled: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'resello-demo-v1';

function randomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `RS-${code}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [systemDark, setSystemDark] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  // Restore persisted state after mount, never during render.
  useEffect(() => {
    let restored: Partial<AppState> = {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) restored = JSON.parse(raw) as Partial<AppState>;
    } catch {
      restored = {};
    }
    setState((current) => ({ ...current, ...restored, ready: true }));
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    try {
      const { ready, ...persisted } = state;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Storage can be unavailable in private mode, the demo still works.
    }
  }, [state]);

  useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setSystemDark(darkQuery.matches);
      setSystemReducedMotion(motionQuery.matches);
    };
    sync();
    darkQuery.addEventListener('change', sync);
    motionQuery.addEventListener('change', sync);
    return () => {
      darkQuery.removeEventListener('change', sync);
      motionQuery.removeEventListener('change', sync);
    };
  }, []);

  // Reflect the accessibility and theme choices on the document element.
  useEffect(() => {
    const root = document.documentElement;
    const dark = state.theme === 'dark' || (state.theme === 'system' && systemDark);
    root.classList.toggle('dark', dark);
    root.style.setProperty('--text-scale', state.largeText ? '1.22' : '1');
    root.dataset.contrast = state.increaseContrast ? 'high' : 'normal';
    root.dataset.motion = state.reduceMotion ? 'reduce' : 'normal';
    root.dataset.transparency = state.reduceTransparency ? 'reduce' : 'normal';
    root.lang = state.language;
  }, [
    state.theme,
    state.largeText,
    state.increaseContrast,
    state.reduceMotion,
    state.reduceTransparency,
    state.language,
    systemDark,
  ]);

  const set = useCallback(<K extends keyof AppState>(key: K, value: AppState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const t = (key: StringKey, params?: Record<string, string | number>) =>
      translate(state.language, key, params);

    return {
      ...state,
      t,
      set,
      toasts,
      pushToast,
      dismissToast,
      motionEnabled: !state.reduceMotion && !systemReducedMotion,
      toggleWishlist: (productId) =>
        setState((current) => ({
          ...current,
          wishlist: current.wishlist.includes(productId)
            ? current.wishlist.filter((id) => id !== productId)
            : [productId, ...current.wishlist],
        })),
      toggleFavoriteMarket: (marketId) =>
        setState((current) => ({
          ...current,
          favoriteMarkets: current.favoriteMarkets.includes(marketId)
            ? current.favoriteMarkets.filter((id) => id !== marketId)
            : [marketId, ...current.favoriteMarkets],
        })),
      addSavedSearch: (label, filters) =>
        setState((current) => ({
          ...current,
          savedSearches: [
            {
              id: `alert-${Date.now()}`,
              label,
              filters,
              notify: true,
              lastMatchDaysAgo: null,
            },
            ...current.savedSearches,
          ],
        })),
      removeSavedSearch: (id) =>
        setState((current) => ({
          ...current,
          savedSearches: current.savedSearches.filter((search) => search.id !== id),
        })),
      toggleSavedSearchNotify: (id) =>
        setState((current) => ({
          ...current,
          savedSearches: current.savedSearches.map((search) =>
            search.id === id ? { ...search, notify: !search.notify } : search,
          ),
        })),
      addRecentSearch: (query) =>
        setState((current) => {
          const trimmed = query.trim();
          if (!trimmed) return current;
          return {
            ...current,
            recentSearches: [trimmed, ...current.recentSearches.filter((item) => item !== trimmed)].slice(
              0,
              8,
            ),
          };
        }),
      clearRecentSearches: () => setState((current) => ({ ...current, recentSearches: [] })),
      addReservation: (input) => {
        const reservation: Reservation = {
          ...input,
          id: `res-${Date.now()}`,
          createdAtIso: new Date().toISOString(),
          code: randomCode(),
        };
        setState((current) => ({
          ...current,
          reservations: [reservation, ...current.reservations],
        }));
        return reservation;
      },
      resetDemo: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        setState({ ...defaultState, ready: true });
        setToasts([]);
      },
    };
  }, [state, set, toasts, pushToast, dismissToast, systemReducedMotion]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

/** Convenience hook for components that only need the translator. */
export function useT() {
  return useApp().t;
}

/**
 * Current time, resolved after mount so opening hour badges never differ
 * between the server rendered markup and the client.
 */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export { emptyFilters };
