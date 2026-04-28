'use client';

import { useState, useEffect, useId } from 'react';
import { Sparkles, Music, Loader2, CheckCircle, XCircle, Play, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
}

interface Generation {
  id: string;
  prompt: string;
  style: string;
  language: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_song_id?: string;
  song_title?: string;
  error_message?: string;
  created_at: string;
}

interface SunoGeneratorProps {
  vocabulary?: VocabularyWord[];
  onSongGenerated?: (songId: string) => void;
}

const MUSIC_STYLES = [
  { id: 'pop', label: 'Pop', emoji: '🎤' },
  { id: 'latin', label: 'Latin', emoji: '💃' },
  { id: 'folk', label: 'Folk', emoji: '🎸' },
  { id: 'electronic', label: 'Electronic', emoji: '🎧' },
  { id: 'jazz', label: 'Jazz', emoji: '🎷' },
  { id: 'rock', label: 'Rock', emoji: '🎸' },
  { id: 'r&b', label: 'R&B', emoji: '🎵' },
  { id: 'acoustic', label: 'Acoustic', emoji: '🎻' },
];

export function SunoGenerator({ vocabulary = [], onSongGenerated }: SunoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('pop');
  const [language, setLanguage] = useState('es');
  const [selectedVocab, setSelectedVocab] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [dailyRemaining, setDailyRemaining] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState(true);

  // Generate unique IDs for accessibility
  const promptId = useId();
  const styleId = useId();
  const languageId = useId();
  const vocabId = useId();
  const errorId = useId();

  // Fetch existing generations on mount
  useEffect(() => {
    fetchGenerations();
  }, []);

  // Poll for status updates
  useEffect(() => {
    if (!pollingId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/lingua/music/suno/status/${pollingId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setPollingId(null);
          fetchGenerations();
          if (data.song_id) {
            onSongGenerated?.(data.song_id);
          }
        } else if (data.status === 'failed') {
          setPollingId(null);
          setError(data.error || 'Generation failed');
          fetchGenerations();
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pollingId, onSongGenerated]);

  const fetchGenerations = async () => {
    setIsLoadingGenerations(true);
    try {
      const response = await fetch('/api/lingua/music/suno/generate');
      const data = await response.json();
      setGenerations(data.generations || []);
      setDailyRemaining(data.remainingToday ?? 5);
    } catch (err) {
      console.error('Failed to fetch generations:', err);
    } finally {
      setIsLoadingGenerations(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the song you want to create');
      return;
    }

    if (dailyRemaining <= 0) {
      setError('Daily limit reached. Try again tomorrow!');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/lingua/music/suno/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style,
          language,
          vocabulary_words: selectedVocab,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      // Start polling for status
      setPollingId(data.generation_id);
      setPrompt('');
      setSelectedVocab([]);
      setDailyRemaining((prev) => prev - 1);
      fetchGenerations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleVocab = (word: string) => {
    setSelectedVocab((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Create AI Song</h3>
          <span className="ml-auto text-sm text-purple-600">
            {dailyRemaining}/5 remaining today
          </span>
        </div>

        {/* Prompt Input */}
        <div className="mb-4">
          <label htmlFor={promptId} className="block text-sm font-medium text-gray-700 mb-1">
            Describe your song
          </label>
          <textarea
            id={promptId}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (error) setError(null);
            }}
            placeholder="A cheerful song about daily routines, perfect for beginners learning common verbs..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-shadow text-base"
            rows={3}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={!!error}
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Be specific about the theme, mood, and vocabulary level
          </p>
        </div>

        {/* Style Selection */}
        <fieldset className="mb-4">
          <legend id={styleId} className="block text-sm font-medium text-gray-700 mb-2">
            Music Style
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={styleId}>
            {MUSIC_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                role="radio"
                aria-checked={style === s.id}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                  style === s.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <span aria-hidden="true">{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Language Selection */}
        <fieldset className="mb-4">
          <legend id={languageId} className="block text-sm font-medium text-gray-700 mb-2">
            Song Language
          </legend>
          <div className="flex gap-2" role="radiogroup" aria-labelledby={languageId}>
            <button
              type="button"
              onClick={() => setLanguage('es')}
              role="radio"
              aria-checked={language === 'es'}
              className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                language === 'es'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <span aria-hidden="true">🇪🇸</span> Spanish
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              role="radio"
              aria-checked={language === 'en'}
              className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                language === 'en'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <span aria-hidden="true">🇺🇸</span> English
            </button>
          </div>
        </fieldset>

        {/* Vocabulary Selection */}
        {vocabulary.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include vocabulary words (optional)
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-white rounded-lg border border-gray-200">
              {vocabulary.slice(0, 20).map((v) => (
                <button
                  key={v.id}
                  onClick={() => toggleVocab(v.word)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    selectedVocab.includes(v.word)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  {v.word}
                </button>
              ))}
            </div>
            {selectedVocab.length > 0 && (
              <p className="text-xs text-purple-600 mt-1">
                {selectedVocab.length} words selected
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            id={errorId}
            role="alert"
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3 animate-in slide-in-from-top-2 duration-200"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 p-1"
              aria-label="Dismiss error"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || dailyRemaining <= 0 || !prompt.trim()}
          className="w-full h-12 text-base"
          aria-describedby={dailyRemaining <= 0 ? 'limit-warning' : undefined}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating your song...
            </>
          ) : dailyRemaining <= 0 ? (
            <>
              <AlertCircle className="w-5 h-5 mr-2" />
              Daily limit reached
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Song
            </>
          )}
        </Button>

        {dailyRemaining <= 0 && (
          <p id="limit-warning" className="text-center text-sm text-amber-600 mt-2">
            Come back tomorrow for more generations!
          </p>
        )}
      </div>

      {/* Generations List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Your AI Songs</h4>
          <button
            onClick={fetchGenerations}
            disabled={isLoadingGenerations}
            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
            aria-label="Refresh generations"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingGenerations ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingGenerations && generations.length === 0 ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : generations.length > 0 ? (
          <div className="space-y-3">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className={`flex items-center gap-3 p-4 bg-white rounded-xl border transition-all ${
                  gen.status === 'processing' || gen.status === 'pending'
                    ? 'border-purple-200 bg-purple-50/50'
                    : gen.status === 'failed'
                    ? 'border-red-200'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {gen.status === 'completed' ? (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  ) : gen.status === 'failed' ? (
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {gen.song_title || `${gen.style.charAt(0).toUpperCase() + gen.style.slice(1)} song in ${gen.language === 'es' ? 'Spanish' : 'English'}`}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{gen.prompt}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(gen.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {gen.status === 'processing' && (
                      <span className="ml-2 text-purple-600">Creating your song...</span>
                    )}
                    {gen.status === 'pending' && (
                      <span className="ml-2 text-purple-600">Queued</span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                {gen.status === 'completed' && gen.result_song_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSongGenerated?.(gen.result_song_id!)}
                    className="flex-shrink-0"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Play
                  </Button>
                )}

                {gen.status === 'failed' && (
                  <span className="text-xs text-red-500 flex-shrink-0 max-w-[100px] truncate">
                    {gen.error_message || 'Generation failed'}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No songs yet</p>
            <p className="text-sm">Create your first AI-generated song above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
