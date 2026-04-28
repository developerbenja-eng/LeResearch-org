'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music2, Sparkles, ChevronRight, ChevronLeft, Play,
  Loader2, Check, History, Lightbulb, Wand2
} from 'lucide-react';
import Link from 'next/link';

// Types
interface SongDraft {
  style: string;
  mood: string;
  progression: ProgressionOption | null;
  structure: StructureTemplate | null;
  lyrics: string;
  title: string;
}

interface ProgressionOption {
  id: string;
  name: string;
  chords: string;
  romanNumerals: string;
  nickname: string | null;
  history: string;
  era: string;
  famousSongs: string[];
  mood: string[];
  color: string;
}

interface StructureTemplate {
  id: string;
  name: string;
  pattern: string[];
  description: string;
  bestFor: string[];
}

// Data
const PROGRESSIONS: ProgressionOption[] = [
  {
    id: 'i-v-vi-iv',
    name: 'I-V-vi-IV',
    chords: 'C - G - Am - F',
    romanNumerals: 'I - V - vi - IV',
    nickname: 'The Axis of Awesome',
    history: 'Emerged from doo-wop in the 1950s-60s, became the most popular progression in modern pop. The "Axis of Awesome" comedy group famously demonstrated 40+ hits using this progression.',
    era: '1950s → Present',
    famousSongs: ['Let It Be - Beatles', 'No Woman No Cry - Bob Marley', 'With or Without You - U2', 'Someone Like You - Adele'],
    mood: ['uplifting', 'emotional', 'anthemic'],
    color: '#ec4899',
  },
  {
    id: 'i-iv-v-i',
    name: 'I-IV-V-I',
    chords: 'C - F - G - C',
    romanNumerals: 'I - IV - V - I',
    nickname: 'The Three Chord Truth',
    history: 'The foundation of Western harmony since the Baroque era. Bach, Mozart, and Beethoven built entire movements on this. Later became the backbone of rock \'n\' roll and country music.',
    era: '1700s → Present',
    famousSongs: ['Twist and Shout - Beatles', 'La Bamba', 'Wild Thing', 'Louie Louie'],
    mood: ['energetic', 'driving', 'classic'],
    color: '#3b82f6',
  },
  {
    id: 'i-vi-iv-v',
    name: 'I-vi-IV-V',
    chords: 'C - Am - F - G',
    romanNumerals: 'I - vi - IV - V',
    nickname: 'The 50s Progression',
    history: 'Defined the sound of 1950s doo-wop and early rock. The minor vi chord adds emotional depth that made teenage love songs so compelling.',
    era: '1950s',
    famousSongs: ['Stand By Me - Ben E. King', 'Earth Angel', 'Every Breath You Take - Police'],
    mood: ['nostalgic', 'romantic', 'dreamy'],
    color: '#8b5cf6',
  },
  {
    id: 'ii-v-i',
    name: 'ii-V-I',
    chords: 'Dm7 - G7 - Cmaj7',
    romanNumerals: 'ii7 - V7 - I',
    nickname: 'The Jazz Cadence',
    history: 'The most important progression in jazz, developed in the 1920s-40s. Creates smooth voice leading that became the language of jazz standards and sophisticated pop.',
    era: '1920s → Present',
    famousSongs: ['Autumn Leaves', 'All The Things You Are', 'Fly Me To The Moon'],
    mood: ['sophisticated', 'smooth', 'jazzy'],
    color: '#f59e0b',
  },
  {
    id: 'i-bvii-iv-i',
    name: 'I-♭VII-IV-I',
    chords: 'C - B♭ - F - C',
    romanNumerals: 'I - ♭VII - IV - I',
    nickname: 'The Mixolydian Vamp',
    history: 'Borrowed from the mixolydian mode, this progression defined 1960s-70s rock. The ♭VII chord creates a "floating" feeling that became synonymous with psychedelic and classic rock.',
    era: '1960s-70s',
    famousSongs: ['Sweet Home Alabama', 'Hey Jude - Beatles', 'Sympathy for the Devil - Rolling Stones'],
    mood: ['rock', 'powerful', 'free'],
    color: '#ef4444',
  },
  {
    id: 'i-v-vi-iii-iv',
    name: 'I-V-vi-iii-IV',
    chords: 'C - G - Am - Em - F',
    romanNumerals: 'I - V - vi - iii - IV',
    nickname: 'Canon Progression',
    history: 'Based on Pachelbel\'s Canon (1680), this progression has been reused countless times. The descending bass line creates a sense of inevitable beauty.',
    era: '1680 → Present',
    famousSongs: ['Canon in D - Pachelbel', 'Basket Case - Green Day', 'Graduation - Vitamin C'],
    mood: ['epic', 'ceremonial', 'beautiful'],
    color: '#22c55e',
  },
];

const STRUCTURES: StructureTemplate[] = [
  {
    id: 'verse-chorus',
    name: 'Verse-Chorus',
    pattern: ['Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus'],
    description: 'The most common pop structure. Verses tell the story, chorus delivers the hook.',
    bestFor: ['Pop', 'Rock', 'Country'],
  },
  {
    id: 'aaba',
    name: 'AABA (32-bar)',
    pattern: ['A', 'A', 'B', 'A'],
    description: 'Classic jazz standard form. Two verses, a contrasting bridge, return to verse.',
    bestFor: ['Jazz', 'Standards', 'Broadway'],
  },
  {
    id: 'verse-prechorus-chorus',
    name: 'Verse-PreChorus-Chorus',
    pattern: ['Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus'],
    description: 'Modern pop structure with added pre-chorus for extra build-up.',
    bestFor: ['Modern Pop', 'EDM', 'Dance'],
  },
  {
    id: 'through-composed',
    name: 'Through-Composed',
    pattern: ['Section A', 'Section B', 'Section C', 'Section D'],
    description: 'Each section is unique - no repetition. Used for storytelling songs.',
    bestFor: ['Art Rock', 'Progressive', 'Ballads'],
  },
];

const STYLES = [
  { id: 'pop', name: 'Pop', emoji: '🎵', color: '#ec4899' },
  { id: 'rock', name: 'Rock', emoji: '🎸', color: '#ef4444' },
  { id: 'jazz', name: 'Jazz', emoji: '🎷', color: '#f59e0b' },
  { id: 'acoustic', name: 'Acoustic', emoji: '🪕', color: '#22c55e' },
  { id: 'electronic', name: 'Electronic', emoji: '🎹', color: '#3b82f6' },
  { id: 'hip-hop', name: 'Hip-Hop', emoji: '🎤', color: '#8b5cf6' },
  { id: 'country', name: 'Country', emoji: '🤠', color: '#f97316' },
  { id: 'rnb', name: 'R&B', emoji: '💜', color: '#a855f7' },
];

const MOODS = [
  { id: 'happy', name: 'Happy', emoji: '😊' },
  { id: 'sad', name: 'Sad', emoji: '😢' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡' },
  { id: 'chill', name: 'Chill', emoji: '😌' },
  { id: 'romantic', name: 'Romantic', emoji: '💕' },
  { id: 'angry', name: 'Angry', emoji: '😤' },
  { id: 'nostalgic', name: 'Nostalgic', emoji: '🌅' },
  { id: 'epic', name: 'Epic', emoji: '🏔️' },
];

const STEPS = [
  { id: 'style', title: 'Style & Mood', icon: Music2 },
  { id: 'progression', title: 'Chord Progression', icon: Sparkles },
  { id: 'structure', title: 'Song Structure', icon: History },
  { id: 'lyrics', title: 'Write Lyrics', icon: Wand2 },
  { id: 'generate', title: 'Generate', icon: Play },
];

export default function SongCreatorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState<SongDraft>({
    style: '',
    mood: '',
    progression: null,
    structure: null,
    lyrics: '',
    title: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSong, setGeneratedSong] = useState<{ audioUrl: string; id: string } | null>(null);
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);

  const canProceed = () => {
    switch (currentStep) {
      case 0: return draft.style && draft.mood;
      case 1: return draft.progression !== null;
      case 2: return draft.structure !== null;
      case 3: return draft.lyrics.trim().length > 20 && draft.title.trim().length > 0;
      default: return true;
    }
  };

  const generateLyricsWithAI = async () => {
    setIsGeneratingLyrics(true);
    try {
      const response = await fetch('/api/music-hall/create/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: draft.style,
          mood: draft.mood,
          progression: draft.progression?.name,
          structure: draft.structure?.pattern,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDraft(prev => ({
          ...prev,
          lyrics: data.lyrics,
          title: data.title,
        }));
      }
    } catch (error) {
      console.error('Failed to generate lyrics:', error);
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  const generateSong = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/lingua/music/suno/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: draft.lyrics,
          style: draft.style,
          language: 'en',
          title: draft.title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Generation failed:', data.error);
        setIsGenerating(false);
        return;
      }

      pollGenerationStatus(data.generation_id);
    } catch (error) {
      console.error('Failed to generate song:', error);
      setIsGenerating(false);
    }
  };

  const pollGenerationStatus = async (generationId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/lingua/music/suno/status/${generationId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'completed' && data.audio_url) {
            setGeneratedSong({ audioUrl: data.audio_url, id: generationId });
            setIsGenerating(false);
            return;
          } else if (data.status === 'failed') {
            setIsGenerating(false);
            return;
          }
        }
        setTimeout(checkStatus, 3000);
      } catch {
        setIsGenerating(false);
      }
    };
    checkStatus();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
              <Wand2 className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">AI-Powered Song Creation</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Song Creator Workshop
            </h1>
            <p className="text-music-dim max-w-xl mx-auto">
              Create your own song step by step. Learn the history behind chord progressions,
              structure your song, write lyrics with AI help, and generate with Suno.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-music-surface text-music-dim'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-music-surface'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 0: Style & Mood */}
            {currentStep === 0 && (
              <motion.div
                key="style"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-music-text mb-4">Choose Your Style</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setDraft(prev => ({ ...prev, style: style.id }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          draft.style === style.id
                            ? 'border-white bg-white/10'
                            : 'border-music hover:border-white/50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{style.emoji}</div>
                        <div className="text-music-text font-medium">{style.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-music-text mb-4">Set the Mood</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => setDraft(prev => ({ ...prev, mood: mood.id }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          draft.mood === mood.id
                            ? 'border-white bg-white/10'
                            : 'border-music hover:border-white/50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{mood.emoji}</div>
                        <div className="text-music-text font-medium">{mood.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Chord Progression */}
            {currentStep === 1 && (
              <motion.div
                key="progression"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-music-text mb-2">Choose Your Chord Progression</h2>
                <p className="text-music-dim mb-6">
                  Each progression has its own history and emotional character. Click to learn more!
                </p>

                <div className="space-y-4">
                  {PROGRESSIONS.map((prog) => (
                    <div
                      key={prog.id}
                      onClick={() => setDraft(prev => ({ ...prev, progression: prog }))}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        draft.progression?.id === prog.id
                          ? 'border-white bg-white/5'
                          : 'border-music hover:border-white/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <span
                              className="text-2xl font-bold"
                              style={{ color: prog.color }}
                            >
                              {prog.name}
                            </span>
                            {prog.nickname && (
                              <span className="px-2 py-1 bg-music-surface rounded text-sm text-music-dim">
                                "{prog.nickname}"
                              </span>
                            )}
                          </div>
                          <div className="text-music-dim font-mono mt-1">{prog.chords}</div>
                        </div>
                        <span className="text-sm text-music-dim">{prog.era}</span>
                      </div>

                      {/* History */}
                      <div className="flex items-start gap-2 mb-3 p-3 bg-music-surface rounded-lg">
                        <History className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-music-text">{prog.history}</p>
                      </div>

                      {/* Famous Songs */}
                      <div className="flex flex-wrap gap-2">
                        {prog.famousSongs.map((song, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-music-surface-light rounded text-xs text-music-dim"
                          >
                            {song}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Structure */}
            {currentStep === 2 && (
              <motion.div
                key="structure"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-music-text mb-2">Choose Your Song Structure</h2>
                <p className="text-music-dim mb-6">
                  The structure defines how your song flows from section to section.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {STRUCTURES.map((struct) => (
                    <div
                      key={struct.id}
                      onClick={() => setDraft(prev => ({ ...prev, structure: struct }))}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        draft.structure?.id === struct.id
                          ? 'border-white bg-white/5'
                          : 'border-music hover:border-white/50'
                      }`}
                    >
                      <h3 className="text-xl font-bold text-music-text mb-2">{struct.name}</h3>
                      <p className="text-sm text-music-dim mb-3">{struct.description}</p>

                      {/* Pattern visualization */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {struct.pattern.map((section, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded text-sm font-medium"
                            style={{
                              backgroundColor: getSectionColor(section) + '30',
                              color: getSectionColor(section),
                            }}
                          >
                            {section}
                          </span>
                        ))}
                      </div>

                      <div className="text-xs text-music-dim">
                        Best for: {struct.bestFor.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Lyrics */}
            {currentStep === 3 && (
              <motion.div
                key="lyrics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-music-text">Write Your Lyrics</h2>
                    <p className="text-music-dim">
                      Write your own lyrics or let AI help you get started.
                    </p>
                  </div>
                  <button
                    onClick={generateLyricsWithAI}
                    disabled={isGeneratingLyrics}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {isGeneratingLyrics ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    Generate with AI
                  </button>
                </div>

                {/* Context reminder */}
                <div className="mb-4 p-4 bg-music-surface rounded-lg border border-music">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="text-sm text-music-dim">
                      <strong className="text-music-text">Your choices:</strong>{' '}
                      {draft.style} • {draft.mood} • {draft.progression?.name} • {draft.structure?.name}
                    </div>
                  </div>
                </div>

                {/* Title input */}
                <div className="mb-4">
                  <label className="block text-sm text-music-dim mb-2">Song Title</label>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter your song title..."
                    className="w-full px-4 py-3 bg-music-surface border border-music rounded-lg text-music-text placeholder-music-dim focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Lyrics textarea */}
                <div>
                  <label className="block text-sm text-music-dim mb-2">Lyrics</label>
                  <textarea
                    value={draft.lyrics}
                    onChange={(e) => setDraft(prev => ({ ...prev, lyrics: e.target.value }))}
                    placeholder={`[Verse 1]\nWrite your first verse here...\n\n[Chorus]\nWrite your catchy chorus...\n\n[Verse 2]\nContinue the story...`}
                    rows={16}
                    className="w-full px-4 py-3 bg-music-surface border border-music rounded-lg text-music-text placeholder-music-dim focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Generate */}
            {currentStep === 4 && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                {!generatedSong ? (
                  <>
                    <h2 className="text-2xl font-bold text-music-text mb-4">Ready to Create!</h2>
                    <p className="text-music-dim mb-8 max-w-md mx-auto">
                      Your song is ready to be generated. Click below to bring it to life with Suno AI.
                    </p>

                    {/* Summary */}
                    <div className="max-w-md mx-auto mb-8 p-6 bg-music-surface rounded-xl border border-music text-left">
                      <h3 className="font-bold text-music-text mb-4">Song Summary</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-music-dim">Title</span>
                          <span className="text-music-text font-medium">{draft.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-music-dim">Style</span>
                          <span className="text-music-text capitalize">{draft.style}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-music-dim">Mood</span>
                          <span className="text-music-text capitalize">{draft.mood}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-music-dim">Progression</span>
                          <span className="text-music-text">{draft.progression?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-music-dim">Structure</span>
                          <span className="text-music-text">{draft.structure?.name}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={generateSong}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-lg font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Generating... (this may take a minute)
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Generate My Song
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-music-text mb-4">Your Song is Ready!</h2>
                    <p className="text-music-dim mb-8">{draft.title}</p>

                    <audio
                      controls
                      src={generatedSong.audioUrl}
                      className="w-full max-w-md mx-auto mb-8"
                    />

                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => {
                          setCurrentStep(0);
                          setDraft({ style: '', mood: '', progression: null, structure: null, lyrics: '', title: '' });
                          setGeneratedSong(null);
                        }}
                        className="px-6 py-3 bg-music-surface text-music-text rounded-lg hover:bg-music-surface-light transition-colors"
                      >
                        Create Another
                      </button>
                      <Link
                        href="/learn/music/creations"
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Go to My Creations
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-music-bg via-music-bg to-transparent">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 bg-music-surface text-music-text rounded-lg hover:bg-music-surface-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {currentStep === 3 ? 'Review & Generate' : 'Continue'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getSectionColor(section: string): string {
  const colors: Record<string, string> = {
    'Verse': '#3b82f6',
    'Chorus': '#ec4899',
    'Pre-Chorus': '#8b5cf6',
    'Bridge': '#f59e0b',
    'Intro': '#6b7280',
    'Outro': '#6b7280',
    'A': '#3b82f6',
    'B': '#ec4899',
    'C': '#22c55e',
    'D': '#f59e0b',
    'Section A': '#3b82f6',
    'Section B': '#ec4899',
    'Section C': '#22c55e',
    'Section D': '#f59e0b',
  };
  return colors[section] || '#6b7280';
}
