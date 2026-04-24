export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="h-32 bg-blue-100 dark:bg-gray-800 rounded-2xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
              <div className="w-14 h-14 bg-blue-100 dark:bg-gray-700 rounded-xl mx-auto mb-4" />
              <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
              <div className="h-4 w-40 bg-gray-100 dark:bg-gray-600 rounded mx-auto" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
