/**
 * Skeleton loaders — Instagram-style placeholder shimmer
 */
export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-lg ${className}`} />
);

export const WorkerCardSkeleton = () => (
  <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 flex gap-3">
    <Skeleton className="w-14 h-14 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  </div>
);

export const BookingCardSkeleton = () => (
  <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-3 w-full" />
    <div className="flex justify-between pt-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

export const ListSkeleton = ({ count = 3, type = 'worker' }: { count?: number; type?: 'worker' | 'booking' }) => (
  <div className="space-y-3 px-4">
    {Array.from({ length: count }).map((_, i) =>
      type === 'booking' ? <BookingCardSkeleton key={i} /> : <WorkerCardSkeleton key={i} />
    )}
  </div>
);
