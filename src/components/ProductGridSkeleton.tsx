const PAGE_LIMIT = 10;

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="h-36 animate-pulse bg-gray-200 sm:h-44 md:h-48" />

      <div className="flex flex-1 flex-col gap-2 p-2.5 sm:p-4">
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-gray-200" />

        <div className="hidden space-y-1.5 sm:block">
          <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="mt-auto flex items-center justify-between pt-1 sm:pt-2">
          <div className="h-5 w-16 animate-pulse rounded-md bg-gray-200" />
          <div className="h-4 w-14 animate-pulse rounded-md bg-gray-200" />
        </div>

        <div className="mt-1 flex flex-col gap-1.5 sm:gap-2">
          <div className="h-8 w-full animate-pulse rounded-lg bg-gray-200 sm:h-9" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-gray-100 sm:h-9" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGridSkeleton() {
  return (
    <div className="px-3 py-4 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-5 w-32 animate-pulse rounded-md bg-gray-200" />
        <div className="h-9 w-24 animate-pulse rounded-xl bg-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
