export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-[#EAE6EF] p-4 space-y-3">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  );
}

export function BrandCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-[#EAE6EF] p-6 lg:p-8 space-y-3">
      <Skeleton className="w-20 h-20 mx-auto rounded-xl" />
      <Skeleton className="h-4 w-24 mx-auto" />
      <Skeleton className="h-3 w-16 mx-auto" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#EAE6EF]">
          <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
