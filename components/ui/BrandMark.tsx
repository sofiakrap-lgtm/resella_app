/** ReSello logo mark, drawn inline so the app never depends on a file. */
export function BrandMark({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="9" fill="var(--color-brown)" />
      <path
        d="M11 22V10.5h5.4a3.6 3.6 0 0 1 0 7.2H13l5.4 4.3"
        stroke="var(--color-cream)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="11.5" r="2.2" fill="var(--color-terracotta)" />
    </svg>
  );
}

export function BrandWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandMark size={22} />
      <span className="t-headline tracking-tight">ReSello</span>
    </span>
  );
}
