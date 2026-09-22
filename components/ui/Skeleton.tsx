export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-md ${className}`} aria-hidden="true" />;
}

/** Card shaped placeholder used by the product rows and grids. */
export function ProductCardSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className={wide ? 'w-full' : 'w-[164px] shrink-0'}>
      <Skeleton className="aspect-[4/5] w-full rounded-[16px]" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-1.5 h-3 w-1/2" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <Skeleton className="h-[88px] w-[88px] rounded-[14px]" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
