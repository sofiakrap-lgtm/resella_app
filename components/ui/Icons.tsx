/**
 * Small inline icon set in an SF Symbols style. Stroke based, 24x24 grid,
 * inherits currentColor. Decorative by default, the surrounding control
 * carries the accessible label.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z" />
    <path d="M9.5 20.5v-6h5v6" />
  </Base>
);

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Base>
);

export const MapIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 4 3.5 6.2v13.3L9 17.3l6 2.2 5.5-2.2V4L15 6.2 9 4Z" />
    <path d="M9 4v13.3M15 6.2v13.3" />
  </Base>
);

export const HeartIcon = ({ filled = false, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3C19.5 15.4 12 20 12 20Z" />
  </Base>
);

export const PersonIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.8 20c.9-3.6 3.8-5.6 7.2-5.6s6.3 2 7.2 5.6" />
  </Base>
);

export const ChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="m9.5 5 7 7-7 7" />
  </Base>
);

export const ChevronLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.5 5 7.5 12l7 7" />
  </Base>
);

export const ChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 9.5 7 7 7-7" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Base>
);

export const FilterIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M7 12h10M10 17h4" />
  </Base>
);

export const SortIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 4v16M7 20l-3-3M17 20V4M17 4l3 3" />
  </Base>
);

export const ShareIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5v11M12 3.5 8.5 7M12 3.5 15.5 7" />
    <path d="M5.5 11v8.5h13V11" />
  </Base>
);

export const SparkleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    <path d="m18.5 15.5.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
  </Base>
);

export const LocationIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s6.5-6.1 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 14.9 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2.4" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Base>
);

export const TagIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 11.5V5a1 1 0 0 1 1-1h6.5L20 12.5 12.5 20 4 11.5Z" />
    <circle cx="8.2" cy="8.2" r="1.4" fill="currentColor" stroke="none" />
  </Base>
);

export const BellIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10Z" />
    <path d="M10.2 18.5a2 2 0 0 0 3.6 0" />
  </Base>
);

export const BookmarkIcon = ({ filled = false, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M6.5 4.5h11v15L12 15.8 6.5 19.5v-15Z" />
  </Base>
);

export const ArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 12h15M14 6.5l5.5 5.5L14 17.5" />
  </Base>
);

export const RouteIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M8.5 6h4.5a3.5 3.5 0 0 1 0 7h-2a3.5 3.5 0 0 0 0 5h4.5" />
  </Base>
);

export const LeafIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 4.5C9.5 4.5 4 9 4 15.5c0 2 .8 3.5.8 3.5S9 12 20 9.5c0 0-4 8-11.5 9.5" />
  </Base>
);

export const CameraIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 8.5h3l1.5-2.5h7L17 8.5h3v11H4v-11Z" />
    <circle cx="12" cy="13.5" r="3.4" />
  </Base>
);

export const SettingsIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
  </Base>
);

export const StarIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 4.5 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 10.2l5.4-.8L12 4.5Z" />
  </Base>
);

export const QrIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 4.5h5v5h-5zM14.5 4.5h5v5h-5zM4.5 14.5h5v5h-5z" />
    <path d="M14.5 14.5h2v2h-2zM17.5 17.5h2v2h-2z" />
  </Base>
);

export const GridIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z" />
  </Base>
);

/* ---------------------------------------------------------------------------
   Category icons. One per top level category, so Selaa reads as pictures
   before it reads as words.
--------------------------------------------------------------------------- */

const DressIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 3h6l-1 4 3 5-2 11H7L5 12l3-5-1-4Z" />
    <path d="M10 3c0 1.2.9 2 2 2s2-.8 2-2" />
  </Base>
);

const ShirtIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 4 3.5 7.5 6 10.5l1-.9V20h10v-10.4l1 .9 2.5-3L16 4l-2 1.8h-4L8 4Z" />
  </Base>
);

const ChildIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 3 6 5.5l2 3V13l-1 8h4v-6h2v6h4l-1-8V8.5l2-3L15 3H9Z" />
    <path d="M12 3v5" />
  </Base>
);

const LampIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 3h6l4 8H5l4-8Z" />
    <path d="M12 11v7" />
    <path d="M8.5 21h7" />
  </Base>
);

const CupIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 5h11v8a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V5Z" />
    <path d="M16 7h2a2.5 2.5 0 0 1 0 5h-2" />
    <path d="M4 21h14" />
  </Base>
);

const ShoeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 16V9h4l2.5 2.5L13 12l5 1.6a3 3 0 0 1 2 2.8V17H3Z" />
    <path d="M3 17h17" />
  </Base>
);

const BagIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 8h12l1 12H5L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </Base>
);

const DiscIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2" />
  </Base>
);

/** Keyed by category slug, see data/categories.ts. */
export const categoryIcons: Record<string, (p: IconProps) => React.ReactElement> = {
  naiset: DressIcon,
  miehet: ShirtIcon,
  lapset: ChildIcon,
  koti: LampIcon,
  astiat: CupIcon,
  kengat: ShoeIcon,
  asusteet: BagIcon,
  viihde: DiscIcon,
};
