import { BookList } from '@/components/books/BookList';

async function getBooks() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/books`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch books');
    }
    
    const data = await res.json();
    return data.books || [];
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Book Discussions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore books through multiple learning modes. Discover how you learn best.
          </p>
        </div>

        <BookList books={books} />
      </div>
    </div>
  );
}
