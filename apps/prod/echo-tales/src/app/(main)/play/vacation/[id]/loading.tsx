export default function VacationLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header skeleton */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="w-48 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              <div className="w-24 h-9 bg-purple-200 dark:bg-purple-900/30 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - Photo grid skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip details */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
              <div className="h-7 w-64 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
              <div className="h-4 w-96 max-w-full bg-gray-100 dark:bg-gray-800/60 rounded mb-2" />
              <div className="h-4 w-72 bg-gray-100 dark:bg-gray-800/60 rounded" />
            </div>

            {/* Photo grid */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
              <div className="h-6 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-gray-100 dark:bg-gray-800/60 rounded-lg" />
                <div className="h-10 bg-gray-100 dark:bg-gray-800/60 rounded-lg" />
                <div className="h-10 bg-gray-100 dark:bg-gray-800/60 rounded-lg" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800/60 rounded" />
                <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800/60 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
