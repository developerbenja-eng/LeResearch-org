import { RoomCardSkeleton } from './components/RoomCard';

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Nav Skeleton */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse hidden sm:block" />
            </div>
            <div className="hidden md:flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-20 bg-yellow-100 rounded-full animate-pulse hidden sm:block" />
              <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Skeleton */}
        <section className="text-center mb-8 py-8">
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-gray-100 rounded mx-auto animate-pulse" />
        </section>

        {/* Rooms Grid Skeleton */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </div>
        </section>

        {/* Quick Actions Skeleton */}
        <section className="mb-8">
          <div className="h-7 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-200 rounded mx-auto mb-2" />
                <div className="h-4 w-20 bg-gray-100 rounded mx-auto" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
