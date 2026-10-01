import { BrandMark } from '@/components/ui/BrandMark';

/**
 * Shown while a screen is being fetched. A full pale field with one slow
 * pulse, so a wait reads as the app breathing rather than as a stall. It
 * stands still under prefers-reduced-motion.
 */
export default function Loading() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-5 bg-cream"
      role="status"
      aria-live="polite"
    >
      <span className="loading-mark">
        <BrandMark size={56} />
      </span>
      <span className="sr-only">Ladataan</span>
      <span className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span key={index} className="loading-dot" style={{ animationDelay: `${index * 0.16}s` }} />
        ))}
      </span>
    </div>
  );
}
