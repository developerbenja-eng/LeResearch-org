import { PlayRoomDashboardSkeleton } from './components/PlayRoomDashboard';

export default function PlayRoomLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-px bg-gray-200" />
            <div className="w-32 h-7 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Skeleton */}
        <section className="text-center mb-8">
          <div className="h-9 w-64 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-gray-100 rounded mx-auto animate-pulse" />
        </section>

        <PlayRoomDashboardSkeleton />
      </main>
    </div>
  );
}
