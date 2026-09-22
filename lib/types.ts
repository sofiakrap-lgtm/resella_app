/** Shared types for the ReSello consumer app. */

/** The four grades used in the product sheet. */
export type Condition = 'Erinomainen' | 'Hyvä' | 'Kohtalainen' | 'Kulunut';
export type ProductStatus = 'Saatavilla' | 'Varattu' | 'Myyty';

/** Who a size is cut for. "Ei kokoa" covers dishes and homeware. */
export type Audience = 'Naisten' | 'Miesten' | 'Unisex' | 'Lasten' | 'Ei kokoa';

/**
 * Categories come from the product sheet, so this is a plain string rather
 * than a union: adding a row with a new category must not break the build.
 */
export type CategorySlug = string;

/** Icon key, see categoryIcons in components/ui/Icons.tsx. */
export type CategoryIcon =
  | 'shoe' | 'shirt' | 'bag' | 'coat' | 'jacket' | 'shell' | 'blazer'
  | 'glasses' | 'cup' | 'trousers' | 'child' | 'sport' | 'dress'
  | 'lamp' | 'skirt' | 'cushion';

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Short line shown under the tile. */
  blurb: string;
  icon: CategoryIcon;
  subcategories: string[];
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
  /** Null for unbranded items, listed in the sheet as "Merkitön". */
  brand: string | null;
  audience: Audience;
  color: string;
  condition: Condition;
  priceEur: number;
  /** Search terms from the sheet, matched alongside the title and brand. */
  keywords: string[];
  /** File names as dropped into /assets/product-photos, extension included. */
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
  audiences: Audience[];
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
