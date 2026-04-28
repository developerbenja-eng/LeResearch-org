'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Character } from '@/types/character';
import { Book } from '@/types';
import { CreateBookModal } from '@/app/(main)/play/components/CreateBookModal';
import { CreateCharacterModal } from '@/app/(main)/play/components/CreateCharacterModal';
import { CreateVacationBookModal } from '@/app/(main)/play/components/CreateVacationBookModal';

interface QuickAction {
  id: string;
  href?: string;
  iconUrl: string;
  label: string;
  openModal?: 'create-book' | 'create-character' | 'group-photo';
}

const actions: QuickAction[] = [
  {
    id: 'create-book',
    iconUrl:
      'https://storage.googleapis.com/children-books-images-prod-2025/app-icons/create-book/icon_512_nobg_1764637492103.png',
    label: 'Create New Book',
    openModal: 'create-book',
  },
  {
    id: 'add-character',
    iconUrl:
      'https://storage.googleapis.com/children-books-images-prod-2025/icons/add-character_1764684645709.png',
    label: 'Add Character',
    openModal: 'create-character',
  },
  {
    id: 'group-photo',
    iconUrl:
      'https://storage.googleapis.com/children-books-images-prod-2025/icons/group-photo_1764684661890.png',
    label: 'Group Photo',
    openModal: 'group-photo',
  },
  {
    id: 'browse-music',
    href: '/music',
    iconUrl:
      'https://storage.googleapis.com/children-books-images-prod-2025/icons/audio_1763241189734.png',
    label: 'Browse Music',
  },
  {
    id: 'research',
    href: '/research',
    iconUrl:
      'https://storage.googleapis.com/children-books-images-prod-2025/app-icons/insights/icon_512_nobg_1764566500555.png',
    label: 'Ask Research Question',
  },
];

export function QuickActions() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);
  const [showCreateVacationBook, setShowCreateVacationBook] = useState(false);

  // Fetch characters when needed for CreateBookModal
  useEffect(() => {
    if (showCreateBook) {
      fetchCharacters();
    }
  }, [showCreateBook]);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.data?.items || []);
      }
    } catch {
      // Ignore errors
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.openModal === 'create-book') {
      setShowCreateBook(true);
    } else if (action.openModal === 'create-character') {
      setShowCreateCharacter(true);
    } else if (action.openModal === 'group-photo') {
      setShowCreateVacationBook(true);
    }
  };

  const handleBookCreated = (book: Book) => {
    // Navigate to the play room to see the new book
    router.push('/play');
  };

  const handleCharacterCreated = (character: Character) => {
    // Add to local state in case user opens book modal next
    setCharacters((prev) => [character, ...prev]);
    // Navigate to the play room to see the new character
    router.push('/play');
  };

  const handleVacationBookCreated = async (vacationBookId: string) => {
    // Navigate to the vacation book editor
    router.push(`/play/vacation/${vacationBookId}`);
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {actions.map((action) =>
          action.href ? (
            <Link key={action.id} href={action.href}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-700 transition-all text-center cursor-pointer group">
                <div className="relative w-10 h-10 mx-auto mb-2">
                  <Image
                    src={action.iconUrl}
                    alt={action.label}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform"
                    unoptimized
                  />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {action.label}
                </span>
              </div>
            </Link>
          ) : (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-700 transition-all text-center cursor-pointer group"
            >
              <div className="relative w-10 h-10 mx-auto mb-2">
                <Image
                  src={action.iconUrl}
                  alt={action.label}
                  fill
                  className="object-contain group-hover:scale-110 transition-transform"
                  unoptimized
                />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {action.label}
              </span>
            </button>
          )
        )}
      </div>

      {/* Modals */}
      <CreateBookModal
        isOpen={showCreateBook}
        onClose={() => setShowCreateBook(false)}
        characters={characters}
        onCreated={handleBookCreated}
      />
      <CreateCharacterModal
        isOpen={showCreateCharacter}
        onClose={() => setShowCreateCharacter(false)}
        onCreated={handleCharacterCreated}
      />
      <CreateVacationBookModal
        isOpen={showCreateVacationBook}
        onClose={() => setShowCreateVacationBook(false)}
        onCreated={handleVacationBookCreated}
      />
    </section>
  );
}
