'use client';

import { useEffect } from 'react';

export default function ReaderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Reader error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-4">📖</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Reader Error
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Something went wrong loading the reader. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/reader/library"
            className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Library
          </a>
        </div>
      </div>
    </div>
  );
}
