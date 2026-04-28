'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Book, VacationBook } from '@/types';
import { Character } from '@/types/character';
import { BookCard, BookCardSkeleton } from './BookCard';
import { CharacterCard, CharacterCardSkeleton } from './CharacterCard';
import { CreateCharacterModal } from './CreateCharacterModal';
import { CreateBookModal } from './CreateBookModal';
import { CreateVacationBookModal } from './CreateVacationBookModal';
import { EditCharacterModal } from './EditCharacterModal';
import { EditBookModal } from './EditBookModal';
import { StoryContentEditor } from './story-editor';
import { CharacterVariationsModal } from './CharacterVariationsModal';
import { CharacterDetailsModal } from './CharacterDetailsModal';
import { RelationshipManager } from '@/components/relationships';
import { ConfirmDialog } from './ConfirmDialog';

interface PlayRoomDashboardProps {
  initialBooks: Book[];
  initialCharacters: Character[];
  initialVacationProjects?: VacationBook[];
  sourceTopicId?: string;
  sourceTopicTitle?: string;
  openCreate?: boolean;
}

export function PlayRoomDashboard({
  initialBooks,
  initialCharacters,
  initialVacationProjects = [],
  sourceTopicId,
  sourceTopicTitle,
  openCreate = false,
}: PlayRoomDashboardProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [vacationProjects, setVacationProjects] = useState<VacationBook[]>(initialVacationProjects);
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [showCreateVacationBook, setShowCreateVacationBook] = useState(false);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [isLoadingVacationProjects, setIsLoadingVacationProjects] = useState(false);

  // Edit/Delete state
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingCharacter, setDeletingCharacter] = useState<Character | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingVacationId, setDeletingVacationId] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Outfits/Variations state
  const [viewingOutfits, setViewingOutfits] = useState<Character | null>(null);

  // Relationships state
  const [managingRelationships, setManagingRelationships] = useState<Character | null>(null);

  // Character details modal state
  const [viewingCharacterDetails, setViewingCharacterDetails] = useState<Character | null>(null);

  // Story content editor state
  const [editingStoryBook, setEditingStoryBook] = useState<Book | null>(null);

  // Auto-open create modal when coming from Research pipeline
  useEffect(() => {
    if (openCreate && characters.length > 0) {
      setShowCreateBook(true);
    }
  }, [openCreate, characters.length]);

  // Poll for book updates (for generating books)
  useEffect(() => {
    const generatingBooks = books.filter((b) => b.status === 'generating');
    if (generatingBooks.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/books', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setBooks(data.data.items);
        }
      } catch {
        // Ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [books]);

  const handleCharacterCreated = (character: Character) => {
    setCharacters((prev) => [character, ...prev]);
  };

  const handleBookCreated = (book: Book) => {
    setBooks((prev) => [book, ...prev]);
  };

  const handleVacationBookCreated = async (vacationBookId: string) => {
    // Refresh vacation projects to include the new one
    await refreshVacationProjects();
  };

  const handleCharacterUpdated = (updatedCharacter: Character) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === updatedCharacter.id ? updatedCharacter : c))
    );
  };

  const handleBookUpdated = (updatedBook: Book) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
    );
  };

  const handleDeleteCharacter = async () => {
    if (!deletingCharacter) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/characters/${deletingCharacter.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete character');
      }

      setCharacters((prev) => prev.filter((c) => c.id !== deletingCharacter.id));
      setDeletingCharacter(null);
    } catch (error) {
      console.error('Error deleting character:', error);
      setErrorToast(error instanceof Error ? error.message : 'Failed to delete character');
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!deletingBook) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/books/${deletingBook.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete book');
      }

      setBooks((prev) => prev.filter((b) => b.id !== deletingBook.id));
      setDeletingBook(null);
    } catch (error) {
      console.error('Error deleting book:', error);
      setErrorToast(error instanceof Error ? error.message : 'Failed to delete book');
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const refreshBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const response = await fetch('/api/books', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data.data.items);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const refreshCharacters = async () => {
    setIsLoadingCharacters(true);
    try {
      const response = await fetch('/api/characters', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.data.items);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoadingCharacters(false);
    }
  };

  const refreshVacationProjects = async () => {
    setIsLoadingVacationProjects(true);
    try {
      const response = await fetch('/api/vacation', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setVacationProjects(data.data || []);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoadingVacationProjects(false);
    }
  };

  const handleDeleteVacationProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/vacation/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setVacationProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
    } catch (error) {
      console.error('Error deleting vacation project:', error);
    }
  };

  const totalBooks = books.length;
  const totalCharacters = characters.length;
  const totalVacations = vacationProjects.length;

  return (
    <div className="space-y-8">
      {/* Error Toast */}
      {errorToast && (
        <div role="alert" className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-3">
          <span>{errorToast}</span>
          <button onClick={() => setErrorToast(null)} aria-label="Dismiss" className="p-1 hover:bg-red-500 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 shadow-sm text-center sm:text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalBooks}</div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Books</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 shadow-sm text-center sm:text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalCharacters}</div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Characters</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 shadow-sm text-center sm:text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalVacations}</div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Vacations</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowCreateBook(true)}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          Create New Book
        </button>
        <button
          onClick={() => setShowCreateVacationBook(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg shadow-orange-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Vacation Book
        </button>
        <button
          onClick={() => setShowCreateCharacter(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Add Character
        </button>
      </div>

      {/* Books Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Books</h2>
          <button
            onClick={refreshBooks}
            disabled={isLoadingBooks}
            className="text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
          >
            {isLoadingBooks ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {books.length === 0 ? (
          <div className="space-y-4">
            {/* Welcome message */}
            <div className="text-center mb-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Your story adventure starts here
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Create personalized books with AI — pick a path to get started
              </p>
            </div>

            {/* Guided start cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Bedtime story */}
              <button
                onClick={() => setShowCreateBook(true)}
                className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🌙</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Bedtime Story</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">A calming story to end the day with your child as the star</p>
              </button>

              {/* Learning adventure */}
              <button
                onClick={() => setShowCreateBook(true)}
                className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📚</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Learning Adventure</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Stories that teach kindness, bravery, or social skills through play</p>
              </button>

              {/* From research */}
              <Link
                href="/tales/research"
                className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🔬</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">From Your Research</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Turn parenting research into a story tailored to your situation</p>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                showActions
                onEdit={setEditingBook}
                onEditStory={setEditingStoryBook}
                onDelete={setDeletingBook}
              />
            ))}
          </div>
        )}
      </section>

      {/* Vacation Projects Section */}
      {vacationProjects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🏖️</span> Vacation Projects
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {vacationProjects.length} project{vacationProjects.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={refreshVacationProjects}
                disabled={isLoadingVacationProjects}
                className="text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
              >
                {isLoadingVacationProjects ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vacationProjects.map((project) => (
              <Link
                key={project.id}
                href={`/play/vacation/${project.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                    <span className="text-2xl">🏖️</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeletingVacationId(project.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                  {project.destination}
                </h3>
                {project.trip_dates && (
                  <p className="text-sm text-gray-500 mb-2">{project.trip_dates}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {project.photo_count || 0} photos
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    project.analysis_status === 'optimized'
                      ? 'bg-green-100 text-green-700'
                      : project.analysis_status === 'analyzing'
                      ? 'bg-purple-100 text-purple-700'
                      : project.analysis_status === 'analyzed' || project.analysis_status === 'mapped'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {project.analysis_status === 'optimized'
                      ? 'Ready'
                      : project.analysis_status === 'analyzing'
                      ? 'Analyzing...'
                      : project.analysis_status === 'analyzed' || project.analysis_status === 'mapped'
                      ? 'In Progress'
                      : 'Draft'}
                  </span>
                </div>
              </Link>
            ))}
            {/* Add Vacation Project Button */}
            <button
              onClick={() => setShowCreateVacationBook(true)}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all flex flex-col items-center justify-center min-h-[150px]"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-orange-600">New Vacation Project</span>
            </button>
          </div>
        </section>
      )}

      {/* Characters Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Characters</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {characters.length} character{characters.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={refreshCharacters}
              disabled={isLoadingCharacters}
              className="text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
            >
              {isLoadingCharacters ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {characters.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50 flex items-center justify-center">
              <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Bring your characters to life
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create characters that will star in your stories. Give them names, personalities, and watch them come alive.
            </p>
            <button
              onClick={() => setShowCreateCharacter(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Your First Character
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                showActions
                onSelect={setViewingCharacterDetails}
                onEdit={setEditingCharacter}
                onDelete={setDeletingCharacter}
                onOutfits={setViewingOutfits}
                onRelationships={setManagingRelationships}
              />
            ))}
            {/* Add Character Button */}
            <button
              onClick={() => setShowCreateCharacter(true)}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all flex flex-col items-center justify-center min-h-[150px]"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-purple-600">
                Add Character
              </span>
            </button>
          </div>
        )}
      </section>

      {/* Create Modals */}
      <CreateCharacterModal
        isOpen={showCreateCharacter}
        onClose={() => setShowCreateCharacter(false)}
        onCreated={handleCharacterCreated}
      />
      <CreateBookModal
        isOpen={showCreateBook}
        onClose={() => setShowCreateBook(false)}
        characters={characters}
        onCreated={handleBookCreated}
        onCharacterCreated={handleCharacterCreated}
        sourceTopicId={sourceTopicId}
        sourceTopicTitle={sourceTopicTitle}
      />
      <CreateVacationBookModal
        isOpen={showCreateVacationBook}
        onClose={() => setShowCreateVacationBook(false)}
        onCreated={handleVacationBookCreated}
      />

      {/* Edit Modals */}
      <EditCharacterModal
        isOpen={!!editingCharacter}
        character={editingCharacter}
        onClose={() => setEditingCharacter(null)}
        onUpdated={handleCharacterUpdated}
      />
      <EditBookModal
        isOpen={!!editingBook}
        book={editingBook}
        onClose={() => setEditingBook(null)}
        onUpdated={handleBookUpdated}
      />
      <StoryContentEditor
        isOpen={!!editingStoryBook}
        book={editingStoryBook}
        onClose={() => setEditingStoryBook(null)}
        onUpdated={handleBookUpdated}
      />

      {/* Outfits/Variations Modal */}
      <CharacterVariationsModal
        isOpen={!!viewingOutfits}
        character={viewingOutfits}
        onClose={() => setViewingOutfits(null)}
      />

      {/* Character Details Modal */}
      <CharacterDetailsModal
        isOpen={!!viewingCharacterDetails}
        character={viewingCharacterDetails}
        allCharacters={characters}
        onClose={() => setViewingCharacterDetails(null)}
        onEdit={setEditingCharacter}
        onOutfits={setViewingOutfits}
        onRelationships={setManagingRelationships}
        onDelete={setDeletingCharacter}
      />

      {/* Relationships Manager Modal */}
      <RelationshipManager
        isOpen={!!managingRelationships}
        character={managingRelationships}
        allCharacters={characters}
        onClose={() => setManagingRelationships(null)}
      />

      {/* Delete Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!deletingCharacter}
        title="Delete Character"
        message={`Are you sure you want to delete "${deletingCharacter?.character_name}"? This character will be removed from all stories.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteCharacter}
        onCancel={() => setDeletingCharacter(null)}
      />
      <ConfirmDialog
        isOpen={!!deletingBook}
        title="Delete Book"
        message={`Are you sure you want to delete "${deletingBook?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteBook}
        onCancel={() => setDeletingBook(null)}
      />
      <ConfirmDialog
        isOpen={!!deletingVacationId}
        title="Delete Vacation Project"
        message="Are you sure you want to delete this vacation project? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => {
          if (deletingVacationId) {
            handleDeleteVacationProject(deletingVacationId);
          }
          setDeletingVacationId(null);
        }}
        onCancel={() => setDeletingVacationId(null)}
      />
    </div>
  );
}

export function PlayRoomDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Quick Actions Skeleton */}
      <div className="flex gap-3">
        <div className="w-40 h-12 bg-purple-200 rounded-xl animate-pulse" />
        <div className="w-36 h-12 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      {/* Books Section Skeleton */}
      <section>
        <div className="h-7 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Characters Section Skeleton */}
      <section>
        <div className="h-7 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CharacterCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
