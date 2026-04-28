import { Suspense } from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserBooks } from '@/lib/db/books';
import { getUserCharacters } from '@/lib/db/characters';
import { getBooksDb, query } from '@/lib/db/turso';
import { VacationBook } from '@/types';
import { PlayRoomDashboard, PlayRoomDashboardSkeleton } from './components/PlayRoomDashboard';
import { TalesNavHeader } from '../tales/components/TalesNavHeader';

export const metadata: Metadata = {
  title: 'Stories - Echo Tales',
  description: 'Create personalized storybooks with AI-generated illustrations and your own characters.',
};

export const dynamic = 'force-dynamic';

async function PlayRoomContent({ sourceTopicId, sourceTopicTitle, openCreate }: { sourceTopicId?: string; sourceTopicTitle?: string; openCreate?: boolean }) {
  // Get authenticated user
  const cookieStore = await cookies();
  const token = cookieStore.get('ledesign_sso')?.value;

  if (!token) {
    redirect('/login?redirect=/play');
  }

  const payload = verifyToken(token);
  if (!payload) {
    redirect('/login?redirect=/play');
  }

  // Fetch user's books, characters, and vacation projects in parallel
  const [booksResult, charactersResult, vacationProjects] = await Promise.all([
    getUserBooks(payload.userId, { limit: 20 }),
    getUserCharacters(payload.userId, { limit: 50 }),
    query<VacationBook>(
      getBooksDb(),
      `SELECT vb.*,
              (SELECT COUNT(*) FROM vacation_photos WHERE vacation_book_id = vb.id) as photo_count
       FROM vacation_books vb
       WHERE vb.user_id = ?
       ORDER BY vb.created_at DESC`,
      [payload.userId]
    ),
  ]);

  // Serialize data to ensure plain JSON objects (removes BigInt, Date objects, etc.)
  const serializedBooks = JSON.parse(JSON.stringify(booksResult.books));
  const serializedCharacters = JSON.parse(JSON.stringify(charactersResult.characters));
  const serializedVacationProjects = JSON.parse(JSON.stringify(vacationProjects));

  return (
    <PlayRoomDashboard
      initialBooks={serializedBooks}
      initialCharacters={serializedCharacters}
      initialVacationProjects={serializedVacationProjects}
      sourceTopicId={sourceTopicId}
      sourceTopicTitle={sourceTopicTitle}
      openCreate={openCreate}
    />
  );
}

async function PlayRoomContentWrapper({
  searchParams,
}: {
  searchParams: Promise<{ sourceTopicId?: string; sourceTopicTitle?: string; openCreate?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<PlayRoomDashboardSkeleton />}>
      <PlayRoomContent
        sourceTopicId={params.sourceTopicId}
        sourceTopicTitle={params.sourceTopicTitle}
        openCreate={params.openCreate === 'true'}
      />
    </Suspense>
  );
}

export default function PlayRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ sourceTopicId?: string; sourceTopicTitle?: string; openCreate?: string }>;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <TalesNavHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-32">
        {/* Hero Section */}
        <section className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-500 p-8 sm:p-10 text-white">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,100 Q100,20 200,80 T400,60 T600,90 T800,40 V200 H0 Z" fill="white"/>
              <path d="M0,120 Q150,60 300,100 T600,70 T800,90 V200 H0 Z" fill="white" opacity="0.5"/>
            </svg>
          </div>
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                Create Magical Stories
              </h2>
              <p className="text-white/80 max-w-xl text-lg">
                Build your cast of characters and bring them to life in personalized
                storybooks that your family will treasure.
              </p>
            </div>
          </div>
        </section>

        {/* Dashboard */}
        <PlayRoomContentWrapper searchParams={searchParams} />
      </main>
    </div>
  );
}
