'use client';

import { useState } from 'react';
import { Settings, X, Mic, Gauge, Sparkles, Zap } from 'lucide-react';
import { useReader } from '@/context/ReaderContext';
import type { TTSProvider } from '@/types/reader';

// Voice options for each provider
const EDGE_VOICES = [
  { id: 'en-US-AriaNeural', name: 'Aria', style: 'Formal', gender: 'Female' },
  { id: 'en-US-JennyNeural', name: 'Jenny', style: 'Conversational', gender: 'Female' },
  { id: 'en-US-GuyNeural', name: 'Guy', style: 'Conversational', gender: 'Male' },
  { id: 'en-US-DavisNeural', name: 'Davis', style: 'Formal', gender: 'Male' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', style: 'Academic', gender: 'Female' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', style: 'Academic', gender: 'Male' },
];

const GEMINI_VOICES = [
  { id: 'Charon', name: 'Charon', style: 'Informative', description: 'Clear and informative' },
  { id: 'Kore', name: 'Kore', style: 'Firm', description: 'Authoritative tone' },
  { id: 'Puck', name: 'Puck', style: 'Upbeat', description: 'Energetic and engaging' },
  { id: 'Aoede', name: 'Aoede', style: 'Breezy', description: 'Light and friendly' },
  { id: 'Fenrir', name: 'Fenrir', style: 'Excitable', description: 'Dynamic and expressive' },
  { id: 'Iapetus', name: 'Iapetus', style: 'Clear', description: 'Articulate narration' },
];

export default function AudioSettingsPanel() {
  const { audioSettings, setAudioSettings } = useReader();
  const [isOpen, setIsOpen] = useState(false);

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const currentVoices = audioSettings.provider === 'gemini' ? GEMINI_VOICES : EDGE_VOICES;

  const handleProviderChange = (provider: TTSProvider) => {
    // When switching providers, also switch to a default voice for that provider
    const defaultVoice = provider === 'gemini' ? 'Charon' : 'en-US-AriaNeural';
    setAudioSettings({ provider, voice: defaultVoice });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="Audio settings"
      >
        <Settings size={18} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-20 right-4 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
              <h3 className="font-semibold text-gray-900 dark:text-white">Audio Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-5">
              {/* TTS Provider */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Sparkles size={16} />
                  TTS Engine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleProviderChange('edge')}
                    className={`px-4 py-3 rounded-lg text-sm text-left transition-all border-2 ${
                      audioSettings.provider === 'edge'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap size={16} className={audioSettings.provider === 'edge' ? 'text-purple-500' : 'text-gray-400'} />
                      <span className={`font-medium ${audioSettings.provider === 'edge' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        Edge TTS
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Free, fast, reliable
                    </p>
                  </button>

                  <button
                    onClick={() => handleProviderChange('gemini')}
                    className={`px-4 py-3 rounded-lg text-sm text-left transition-all border-2 ${
                      audioSettings.provider === 'gemini'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className={audioSettings.provider === 'gemini' ? 'text-purple-500' : 'text-gray-400'} />
                      <span className={`font-medium ${audioSettings.provider === 'gemini' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        Gemini 2.5
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                        Premium
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Natural, expressive
                    </p>
                  </button>
                </div>
              </div>

              {/* Speed */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Gauge size={16} />
                  Playback Speed
                </label>
                <div className="flex flex-wrap gap-2">
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setAudioSettings({ speed })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        audioSettings.speed === speed
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mic size={16} />
                  Voice {audioSettings.provider === 'gemini' && <span className="text-xs text-purple-500">(Gemini)</span>}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {currentVoices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setAudioSettings({ voice: voice.id })}
                      className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        audioSettings.voice === voice.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">{voice.name}</div>
                      <div className={`text-xs ${audioSettings.voice === voice.id ? 'text-purple-200' : 'text-gray-500'}`}>
                        {voice.style}
                        {'gender' in voice && ` · ${voice.gender}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-play options */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-800">
                <label className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Auto-play next section</span>
                  <input
                    type="checkbox"
                    checked={audioSettings.autoAdvanceSection}
                    onChange={(e) => setAudioSettings({ autoAdvanceSection: e.target.checked })}
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Auto-play on load</span>
                  <input
                    type="checkbox"
                    checked={audioSettings.autoPlay}
                    onChange={(e) => setAudioSettings({ autoPlay: e.target.checked })}
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                </label>
              </div>
            </div>

            {/* Info about caching */}
            <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Audio is generated and cached on first play. Subsequent plays stream from cloud storage.
              </p>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">Shortcuts:</span>{' '}
                Space = play/pause, ← → = seek 15s, ↑ ↓ = volume
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
