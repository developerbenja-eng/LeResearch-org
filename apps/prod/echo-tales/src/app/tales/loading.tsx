export default function TalesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg animate-pulse" />
              <div className="h-5 w-28 bg-purple-100 rounded animate-pulse hidden sm:block" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-purple-100 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <div className="h-40 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3" />
              <div className="h-5 w-24 bg-gray-200 rounded mx-auto mb-2" />
              <div className="h-4 w-32 bg-gray-100 rounded mx-auto" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
