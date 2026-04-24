'use client';

import { useState, useEffect, useRef } from 'react';
import { formatTime } from '@/lib/utils/time';
import {
  Mic,
  Play,
  Pause,
  Settings,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  Volume2,
  Users,
  User,
  Clock,
  Sparkles,
  Download,
  FileText,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';

// Available voices and styles from the generator
const VOICES = [
  { id: 'Aoede', label: 'Aoede', description: 'Breezy' },
  { id: 'Charon', label: 'Charon', description: 'Informative' },
  { id: 'Puck', label: 'Puck', description: 'Upbeat' },
  { id: 'Fenrir', label: 'Fenrir', description: 'Excitable' },
  { id: 'Kore', label: 'Kore', description: 'Firm' },
  { id: 'Achird', label: 'Achird', description: 'Friendly' },
  { id: 'Sulafat', label: 'Sulafat', description: 'Warm' },
  { id: 'Gacrux', label: 'Gacrux', description: 'Mature' },
  { id: 'Zephyr', label: 'Zephyr', description: 'Bright' },
  { id: 'Umbriel', label: 'Umbriel', description: 'Easy-going' },
];

const STYLES = [
  { id: 'educational', label: 'Educational', description: 'Clear explanations with examples' },
  { id: 'casual', label: 'Casual', description: 'Relaxed chat between friends' },
  { id: 'debate', label: 'Debate', description: 'Exploring different perspectives' },
  { id: 'interview', label: 'Interview', description: 'Deep-dive Q&A format' },
  { id: 'narrative', label: 'Narrative', description: 'Single narrator storytelling' },
];

const DURATIONS = [
  { id: 'short', label: 'Short', description: '~5 minutes' },
  { id: 'medium', label: 'Medium', description: '~10 minutes' },
  { id: 'long', label: 'Long', description: '~20 minutes' },
];

interface Podcast {
  podcastId: string;
  paperId: string;
  speakers: number;
  style: string;
  duration: string;
  host1Name: string;
  host2Name: string;
  host1Voice: string;
  host2Voice: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  progressMessage: string;
  errorMessage?: string;
  audioUrl?: string;
  audioDuration?: number;
  transcript?: string;
  createdAt: string;
}

interface PodcastGeneratorProps {
  paperId: string;
  paperTitle: string;
  compact?: boolean;
}

export default function PodcastGenerator({ paperId, paperTitle, compact = false }: PodcastGeneratorProps) {
  // Config state
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [speakers, setSpeakers] = useState<1 | 2>(2);
  const [style, setStyle] = useState('educational');
  const [duration, setDuration] = useState('medium');
  const [host1Name, setHost1Name] = useState('Alex');
  const [host2Name, setHost2Name] = useState('Jordan');
  const [host1Voice, setHost1Voice] = useState('Aoede');
  const [host2Voice, setHost2Voice] = useState('Charon');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingMessage, setGeneratingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Podcasts list
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Player state
  const [playingPodcastId, setPlayingPodcastId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch existing podcasts
  useEffect(() => {
    fetchPodcasts();
  }, [paperId]);

  const fetchPodcasts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reader/papers/${paperId}/podcast`);
      if (response.ok) {
        const data = await response.json();
        setPodcasts(data.podcasts || []);
      }
    } catch (err) {
      console.error('Failed to fetch podcasts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for progress if generating
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/reader/papers/${paperId}/podcast`);
        if (response.ok) {
          const data = await response.json();
          const latestPodcast = data.podcasts?.[0];

          if (latestPodcast) {
            if (latestPodcast.status === 'completed') {
              setIsGenerating(false);
              setGeneratingProgress(100);
              setGeneratingMessage('Podcast complete!');
              setPodcasts(data.podcasts);
            } else if (latestPodcast.status === 'failed') {
              setIsGenerating(false);
              setError(latestPodcast.errorMessage || 'Generation failed');
            } else {
              setGeneratingProgress(latestPodcast.progress || 0);
              setGeneratingMessage(latestPodcast.progressMessage || 'Generating...');
            }
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isGenerating, paperId]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setGeneratingProgress(0);
      setGeneratingMessage('Starting generation...');

      const response = await fetch(`/api/reader/papers/${paperId}/podcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speakers,
          style,
          duration,
          host1Name,
          host2Name,
          host1Voice,
          host2Voice,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate podcast');
      }

      const data = await response.json();

      if (data.success) {
        setIsGenerating(false);
        setGeneratingProgress(100);
        setGeneratingMessage('Complete!');
        await fetchPodcasts();
      }
    } catch (err) {
      setIsGenerating(false);
      setError(err instanceof Error ? err.message : 'Generation failed');
    }
  };

  // Audio player controls
  const playPodcast = (podcast: Podcast) => {
    if (!podcast.audioUrl) return;

    if (playingPodcastId === podcast.podcastId && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // Switch to new podcast
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(podcast.audioUrl);
    audioRef.current = audio;
    setPlayingPodcastId(podcast.podcastId);
    setCurrentTime(0);
    setPlayerDuration(podcast.audioDuration || 0);

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      setPlayerDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    audio.play();
    setIsPlaying(true);
  };

  const seekAudio = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 15,
        audioRef.current.duration
      );
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    }
  };

  const completedPodcasts = podcasts.filter(p => p.status === 'completed');
  const hasCompletedPodcasts = completedPodcasts.length > 0;

  return (
    <div className={`bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-100 dark:border-orange-800 overflow-hidden ${compact ? 'text-sm' : ''}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between hover:bg-orange-100/50 dark:hover:bg-orange-900/30 transition-colors ${compact ? 'px-3 py-2.5' : 'px-6 py-4'}`}
      >
        <div className="flex items-center gap-2">
          <div className={`rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}>
            <Mic size={compact ? 16 : 20} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className={`font-semibold text-gray-900 dark:text-white flex items-center gap-2 ${compact ? 'text-sm' : ''}`}>
              AI Podcast
              {!compact && (
                <span className="text-xs px-2 py-0.5 bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-full">
                  NotebookLM Style
                </span>
              )}
            </h3>
            <p className={`text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
              {hasCompletedPodcasts
                ? `${completedPodcasts.length} available`
                : compact ? 'Generate discussion' : 'Generate an audio discussion about this paper'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={compact ? 16 : 20} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={compact ? 16 : 20} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className={`space-y-4 ${compact ? 'px-3 pb-3' : 'px-6 pb-6'}`}>
          {/* Quick generate button */}
          {!isGenerating && !showSettings && (
            <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
              >
                <Sparkles size={compact ? 14 : 18} />
                {compact ? 'Generate' : 'Generate Podcast'}
              </button>
              {!compact && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-3 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
                  title="Configure podcast settings"
                >
                  <Settings size={20} />
                </button>
              )}
            </div>
          )}

          {/* Generation progress */}
          {isGenerating && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 size={20} className="text-orange-500 animate-spin" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {generatingMessage}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${generatingProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This may take a few minutes...
              </p>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-500 hover:underline mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Settings panel */}
          {showSettings && !isGenerating && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Podcast Settings</h4>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ChevronUp size={18} />
                </button>
              </div>

              {/* Speakers */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSpeakers(2)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      speakers === 2
                        ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-orange-300'
                    }`}
                  >
                    <Users size={16} />
                    Two Hosts
                  </button>
                  <button
                    onClick={() => {
                      setSpeakers(1);
                      setStyle('narrative');
                    }}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      speakers === 1
                        ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-orange-300'
                    }`}
                  >
                    <User size={16} />
                    Solo Narrator
                  </button>
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STYLES.filter(s => speakers === 1 ? s.id === 'narrative' : s.id !== 'narrative').map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        style === s.id
                          ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-orange-300'
                      }`}
                      title={s.description}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDuration(d.id)}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                        duration === d.id
                          ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-orange-300'
                      }`}
                    >
                      <Clock size={14} />
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Host names and voices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    {speakers === 1 ? 'Narrator' : 'Host 1'}
                  </label>
                  <input
                    type="text"
                    value={host1Name}
                    onChange={(e) => setHost1Name(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                    placeholder="Name"
                  />
                  <select
                    value={host1Voice}
                    onChange={(e) => setHost1Voice(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label} ({v.description})
                      </option>
                    ))}
                  </select>
                </div>
                {speakers === 2 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Host 2
                    </label>
                    <input
                      type="text"
                      value={host2Name}
                      onChange={(e) => setHost2Name(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                      placeholder="Name"
                    />
                    <select
                      value={host2Voice}
                      onChange={(e) => setHost2Voice(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {VOICES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label} ({v.description})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Generate button in settings */}
              <button
                onClick={() => {
                  setShowSettings(false);
                  handleGenerate();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
              >
                <Sparkles size={18} />
                Generate with these settings
              </button>
            </div>
          )}

          {/* Completed podcasts */}
          {hasCompletedPodcasts && (
            <div className={compact ? 'space-y-2' : 'space-y-3'}>
              {!compact && (
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Generated Podcasts
                </h4>
              )}
              {completedPodcasts.map((podcast) => (
                <div
                  key={podcast.podcastId}
                  className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${compact ? 'p-2' : 'p-4'}`}
                >
                  {compact ? (
                    /* Compact player */
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => playPodcast(podcast)}
                        className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:scale-105 transition-transform shadow flex-shrink-0"
                      >
                        {playingPodcastId === podcast.podcastId && isPlaying ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} className="ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div
                          className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
                          onClick={(e) => {
                            if (playingPodcastId !== podcast.podcastId) {
                              playPodcast(podcast);
                            }
                            const rect = e.currentTarget.getBoundingClientRect();
                            const percent = (e.clientX - rect.left) / rect.width;
                            const time = percent * playerDuration;
                            seekAudio(time);
                          }}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all"
                            style={{
                              width: `${
                                playingPodcastId === podcast.podcastId
                                  ? (currentTime / playerDuration) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                          <span>{playingPodcastId === podcast.podcastId ? formatTime(currentTime) : '0:00'}</span>
                          <span>{podcast.audioDuration ? formatTime(podcast.audioDuration) : '--:--'}</span>
                        </div>
                      </div>
                      {podcast.audioUrl && (
                        <a
                          href={podcast.audioUrl}
                          download
                          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                          title="Download MP3"
                        >
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  ) : (
                    /* Full player */
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">
                              {podcast.style}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {podcast.speakers === 1 ? podcast.host1Name : `${podcast.host1Name} & ${podcast.host2Name}`}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {podcast.audioDuration
                              ? `${Math.floor(podcast.audioDuration / 60)}:${(podcast.audioDuration % 60).toString().padStart(2, '0')}`
                              : podcast.duration}{' '}
                            • Created {new Date(podcast.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {podcast.audioUrl && (
                            <a
                              href={podcast.audioUrl}
                              download
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="Download MP3"
                            >
                              <Download size={16} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Player controls */}
                      {podcast.audioUrl && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => skipBackward()}
                              disabled={playingPodcastId !== podcast.podcastId}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                            >
                              <SkipBack size={18} />
                            </button>
                            <button
                              onClick={() => playPodcast(podcast)}
                              className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:scale-105 transition-transform shadow-lg"
                            >
                              {playingPodcastId === podcast.podcastId && isPlaying ? (
                                <Pause size={20} />
                              ) : (
                                <Play size={20} className="ml-0.5" />
                              )}
                            </button>
                            <button
                              onClick={() => skipForward()}
                              disabled={playingPodcastId !== podcast.podcastId}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                            >
                              <SkipForward size={18} />
                            </button>

                            {/* Progress bar */}
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 tabular-nums w-10">
                                {playingPodcastId === podcast.podcastId ? formatTime(currentTime) : '0:00'}
                              </span>
                              <div
                                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
                                onClick={(e) => {
                                  if (playingPodcastId !== podcast.podcastId) {
                                    playPodcast(podcast);
                                  }
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const percent = (e.clientX - rect.left) / rect.width;
                                  const time = percent * playerDuration;
                                  seekAudio(time);
                                }}
                              >
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all"
                                  style={{
                                    width: `${
                                      playingPodcastId === podcast.podcastId
                                        ? (currentTime / playerDuration) * 100
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 tabular-nums w-10">
                                {podcast.audioDuration
                                  ? formatTime(podcast.audioDuration)
                                  : formatTime(playerDuration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Transcript toggle */}
                      {podcast.transcript && (
                        <details className="mt-3">
                          <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                            <FileText size={12} />
                            View Transcript
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs text-gray-600 dark:text-gray-400 max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {podcast.transcript}
                          </div>
                        </details>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty state when loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-orange-500 animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
