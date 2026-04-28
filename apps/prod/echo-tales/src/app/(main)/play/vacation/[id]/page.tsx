'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getBooksDb, queryOne, query } from '@/lib/db/turso';
import { verifyToken } from '@/lib/auth/jwt';
import { VacationBook, VacationPhoto, VacationCharacter, VacationPhotoPerson, StoryOutline } from '@/types/vacation';
import { Character } from '@/types/character';
import { VacationProjectEditor } from './components/VacationProjectEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VacationProjectPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('ledesign_sso')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyToken(token);
  if (!payload) {
    redirect('/login');
  }

  const userId = payload.userId;

  // Fetch vacation book with photos
  const vacationBook = await queryOne<VacationBook>(
    getBooksDb(),
    'SELECT * FROM vacation_books WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (!vacationBook) {
    redirect('/play');
  }

  // Fetch photos
  const photos = await query<VacationPhoto>(
    getBooksDb(),
    `SELECT * FROM vacation_photos
     WHERE vacation_book_id = ?
     ORDER BY COALESCE(story_order, upload_order)`,
    [id]
  );

  // Fetch detected people for each photo
  const photoIds = photos.map(p => p.id);
  let photoPeople: VacationPhotoPerson[] = [];
  if (photoIds.length > 0) {
    const placeholders = photoIds.map(() => '?').join(',');
    photoPeople = await query<VacationPhotoPerson>(
      getBooksDb(),
      `SELECT * FROM vacation_photo_people WHERE vacation_photo_id IN (${placeholders})`,
      photoIds
    );
  }

  // Fetch vacation characters
  const vacationCharacters = await query<VacationCharacter>(
    getBooksDb(),
    'SELECT * FROM vacation_characters WHERE vacation_book_id = ?',
    [id]
  );

  // Fetch user's existing characters for linking
  const existingCharacters = await query<Character>(
    getBooksDb(),
    'SELECT * FROM characters WHERE user_id = ? ORDER BY character_name',
    [userId]
  );

  // Combine photos with their people
  const photosWithPeople = photos.map(photo => ({
    ...photo,
    people: photoPeople.filter(p => p.vacation_photo_id === photo.id),
  }));

  // Parse story outline if it exists
  let parsedOutline: StoryOutline | null = null;
  if (vacationBook.story_outline) {
    try {
      parsedOutline = JSON.parse(vacationBook.story_outline as string);
    } catch {
      // Ignore parse errors
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <VacationProjectEditor
        vacationBook={vacationBook}
        initialPhotos={photosWithPeople}
        vacationCharacters={vacationCharacters}
        existingCharacters={existingCharacters}
        initialOutline={parsedOutline}
        initialOutlineStatus={vacationBook.outline_status || 'none'}
        initialIllustrationMode={(vacationBook.illustration_mode as 'auto' | 'manual') || 'auto'}
      />
    </div>
  );
}
