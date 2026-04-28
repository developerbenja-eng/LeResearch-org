import Link from 'next/link';

export default function BookNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6">
          <span className="text-6xl">📚</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Book Not Found</h1>
        <p className="text-white/70 mb-8 max-w-md">
          The book you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have permission to view it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/home"
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/play"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Create a Book
          </Link>
        </div>
      </div>
    </div>
  );
}
