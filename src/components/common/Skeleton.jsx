const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton
        key={index}
        className={`h-3 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`}
      />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="rounded-xl bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="w-full space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="overflow-hidden rounded-xl bg-white shadow-sm">
    <div className="grid gap-4 border-b border-gray-100 bg-gray-50 p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: columns }, (_, index) => (
        <Skeleton key={index} className="h-3 w-20" />
      ))}
    </div>
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList = ({ rows = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1">
            <SkeletonText lines={3} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonGrid = ({ items = 6 }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className="rounded-lg border border-gray-200 p-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div className="rounded-xl bg-white p-6 text-center shadow-sm">
      <Skeleton className="mx-auto mb-4 h-32 w-32 rounded-full" />
      <Skeleton className="mx-auto h-5 w-40" />
      <Skeleton className="mx-auto mt-3 h-4 w-28" />
    </div>
    <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Skeleton;
