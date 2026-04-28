export interface Song {
  id: string;
  book_id: string;
  song_name: string | null;
  song_url: string;
  duration: number; // in seconds
  style: string;
  lyrics: string | null;
  is_main: boolean;
  created_at: string;
  // Character theme support
  character_id: string | null;
  is_character_theme: boolean;
}

export interface Album {
  id: string;
  user_id: string;
  title: string;
  cover_image_url: string | null;
  theme: string | null;
  song_count: number;
  total_duration: number;
  created_at: string;
}

export interface AlbumWithSongs extends Album {
  songs: Song[];
}

export type MusicStyle =
  | 'playful'
  | 'lullaby'
  | 'adventure'
  | 'educational'
  | 'pop'
  | 'disco'
  | 'electronic'
  | 'rock'
  | 'hip-hop'
  | 'country'
  | 'tropical'
  | 'acoustic'
  | 'jazz'
  | 'orchestral';

export const MUSIC_STYLES: { id: MusicStyle; name: string; icon: string }[] = [
  { id: 'playful', name: 'Playful', icon: '🎪' },
  { id: 'lullaby', name: 'Lullaby', icon: '🌙' },
  { id: 'adventure', name: 'Adventure', icon: '🗺️' },
  { id: 'educational', name: 'Educational', icon: '📚' },
  { id: 'pop', name: 'Pop', icon: '🎤' },
  { id: 'disco', name: 'Disco', icon: '🪩' },
  { id: 'electronic', name: 'Electronic', icon: '🎹' },
  { id: 'rock', name: 'Rock', icon: '🎸' },
  { id: 'hip-hop', name: 'Hip-Hop', icon: '🎧' },
  { id: 'country', name: 'Country', icon: '🤠' },
  { id: 'tropical', name: 'Tropical', icon: '🌴' },
  { id: 'acoustic', name: 'Acoustic', icon: '🪕' },
  { id: 'jazz', name: 'Jazz', icon: '🎷' },
  { id: 'orchestral', name: 'Orchestral', icon: '🎻' },
];
