/** Shared types for the ReSello consumer app. */

export type Condition = 'Uusi' | 'Erinomainen' | 'Hyvä' | 'Käytetty';
export type ProductStatus = 'Saatavilla' | 'Varattu' | 'Myyty';

export type CategorySlug =
  | 'naiset'
  | 'miehet'
  | 'lapset'
  | 'koti'
  | 'astiat'
  | 'kengat'
  | 'asusteet'
  | 'viihde';

export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Short line shown under the tile. */
  blurb: string;
  subcategories: Subcategory[];
  sizes: string[];
  brands: string[];
}

export interface OpeningHours {
  open: string;
  close: string;
}

export type Weekday = 'ma' | 'ti' | 'ke' | 'to' | 'pe' | 'la' | 'su';

export interface Market {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  hours: Record<Weekday, OpeningHours | null>;
  lat: number;
  lng: number;
  coverImage: string;
  followerCount: number;
  tableCount: number;
  description: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  followerCount: number;
  /** Where this seller rents a table right now. */
  currentMarketId: string | null;
  tableNumber: string | null;
  /** Finnish short date, for example "5.10." */
  tableValidUntil: string | null;
  isActive: boolean;
}

export interface Product {
  id: string;
  title: string;
  category: CategorySlug;
  subcategory: string;
  size: string | null;
  brand: string | null;
  color: string;
  condition: Condition;
  priceEur: number;
  images: string[];
  sellerId: string;
  marketId: string;
  tableNumber: string;
  status: ProductStatus;
  /** Days since the item was put on the table, 0 means today. */
  addedDaysAgo: number;
  description: string;
}

export interface SavedSearch {
  id: string;
  label: string;
  query: string;
  filters: Partial<Filters>;
  newMatches: number;
}

export interface Filters {
  query: string;
  categories: CategorySlug[];
  sizes: string[];
  colors: string[];
  brands: string[];
  conditions: Condition[];
  minPrice: number;
  maxPrice: number;
  marketIds: string[];
  cities: string[];
  onlyAvailable: boolean;
  onlyNewToday: boolean;
}

export type NotificationKind = 'uusi-tuote' | 'hakuvahti' | 'muistutus' | 'hinta';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  minutesAgo: number;
}

export interface Reservation {
  id: string;
  productId: string;
  kind: 'varaus' | 'osto';
  /** Human readable pickup window, for example "Tänään klo 18.00 mennessä". */
  pickupWindow: string;
  code: string;
  createdAtIso: string;
  totalEur: number;
}
