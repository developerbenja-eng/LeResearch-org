import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyToken } from '@/lib/auth/jwt';
import { getBookWithPages } from '@/lib/db/books';
import { BookViewer, BookViewerSkeleton } from './components/BookViewer';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookWithPages(id);

  if (!book) {
    return {
      title: 'Book Not Found - Echo Home System',
    };
  }

  return {
    title: `${book.title} - Echo Home System`,
    description: book.description || `Read ${book.title}`,
    openGraph: {
      title: book.title,
      description: book.description || undefined,
      images: book.cover_image_url ? [book.cover_image_url] : undefined,
    },
  };
}

async function BookContent({ bookId }: { bookId: string }) {
  // Get authenticated user if available
  const cookieStore = await cookies();
  const token = cookieStore.get('ledesign_sso')?.value;
  let userId: string | undefined;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      userId = payload.userId;
    }
  }

  // Fetch book with pages
  const book = await getBookWithPages(bookId, userId);

  if (!book) {
    notFound();
  }

  // Check if book has pages
  if (book.pages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Book In Progress</h1>
          <p className="text-white/70 mb-6">
            This book is still being generated. Please check back soon!
          </p>
          <Link
            href="/play"
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors inline-block"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return <BookViewer book={book} />;
}

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<BookViewerSkeleton />}>
      <BookContent bookId={id} />
    </Suspense>
  );
}
