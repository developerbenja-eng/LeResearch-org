import { BookDetail } from '@/components/books/BookDetail';
import { notFound } from 'next/navigation';

async function getBookData(bookId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/books/${bookId}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getBookData(id);

  if (!data || !data.success) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <BookDetail 
        book={data.book} 
        chapters={data.chapters} 
        concepts={data.concepts} 
      />
    </div>
  );
}
