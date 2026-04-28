'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Mic, MicOff, ChevronDown, ChevronUp,
  Music, AudioWaveform, Volume2, Waves
} from 'lucide-react';
import { useVocalStudio } from '@/hooks/useVocalStudio';
import { PitchContour } from '@/components/music-hall/vocal-studio/PitchContour';
import { VoiceSpectrum } from '@/components/music-hall/vocal-studio/VoiceSpectrum';
import { Oscilloscope } from '@/components/music-hall/vocal-studio/Oscilloscope';
import { VocalInsights } from '@/components/music-hall/vocal-studio/VocalInsights';
import { ConceptCard } from '@/components/music-hall/vocal-studio/ConceptCard';

const CONCEPT_CARDS = [
  {
    title: 'What is Pitch?',
    description:
      'Pitch is how high or low your voice sounds. It\'s determined by how fast your vocal cords vibrate — faster vibration means higher pitch. Watch the contour line move up when you sing higher notes.',
    icon: Music,
    color: '#22c55e',
  },
  {
    title: 'What is Tone / Timbre?',
    description:
      'Two people can sing the exact same note but sound completely different. That\'s timbre — the unique color of your voice. It comes from the mix of harmonics your voice produces. See them in the spectrum view.',
    icon: AudioWaveform,
    color: '#a78bfa',
  },
  {
    title: 'What are Dynamics?',
    description:
      'Dynamics is how loud or soft you sing. Singing louder doesn\'t just increase volume — it changes your sound wave shape and adds more harmonics. Watch the oscilloscope grow as you get louder.',
    icon: Volume2,
    color: '#eab308',
  },
  {
    title: 'What is Vibrato?',
    description:
      'Vibrato is a slight, regular wobble in pitch — about 5 to 7 times per second. It adds warmth and expression to your voice. Try holding a note and gently pulsing. Watch the pitch contour ripple.',
    icon: Waves,
    color: '#ec4899',
  },
];

export default function VocalStudioPage() {
  const studio = useVocalStudio();
  const [showConcepts, setShowConcepts] = useState(true);

  const handleToggle = async () => {
    if (studio.isListening) {
      studio.stop();
    } else {
      await studio.start();
    }
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/learn/music"
            className="inline-flex items-center gap-1 text-music-dim hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Echo Sounds
          </Link>

          <h1 className="text-4xl font-serif font-bold mb-3">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Vocal Studio
            </span>
          </h1>
          <p className="text-music-dim max-w-2xl">
            See your voice. Understand what you hear. Sing into your microphone and watch
            your pitch, tone, and dynamics come alive in real-time.
          </p>
        </motion.div>

        {/* Mic Control */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-center gap-4"
        >
          <button
            onClick={handleToggle}
            className={`
              flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all
              ${studio.isListening
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:opacity-90'
              }
            `}
          >
            {studio.isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Listening
              </>
            )}
          </button>

          {studio.isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-music-dim">Listening...</span>
            </motion.div>
          )}
        </motion.div>

        {/* Error */}
        {studio.error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {studio.error}
          </div>
        )}

        {/* Visualizations */}
        <AnimatePresence>
          {studio.isListening && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 mb-8"
            >
              {/* Pitch Contour — Hero */}
              <div className="bg-music-surface rounded-xl border border-white/10 overflow-hidden">
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <h2 className="text-xs font-medium text-music-dim uppercase tracking-wider">
                    Pitch Contour
                  </h2>
                  <span className="text-xs text-music-dim">
                    Green = on pitch &middot; Yellow = slightly off &middot; Red = off pitch
                  </span>
                </div>
                <div className="h-48">
                  <PitchContour
                    pitchHistory={studio.pitchHistory}
                    vibrato={studio.vibrato}
                    isListening={studio.isListening}
                  />
                </div>
              </div>

              {/* Spectrum + Oscilloscope side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-music-surface rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                    <h2 className="text-xs font-medium text-music-dim uppercase tracking-wider">
                      Voice Spectrum
                    </h2>
                    <span className="text-xs text-music-dim">
                      <span className="text-cyan-400">F&#8320;</span> = fundamental
                      &middot; <span className="text-violet-400">H</span> = harmonics
                    </span>
                  </div>
                  <div className="h-40">
                    <VoiceSpectrum
                      analyserNode={studio.analyserNode}
                      fundamentalFreq={studio.pitchData.frequency}
                      isListening={studio.isListening}
                    />
                  </div>
                </div>

                <div className="bg-music-surface rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-4 pt-3 pb-1">
                    <h2 className="text-xs font-medium text-music-dim uppercase tracking-wider">
                      Oscilloscope
                    </h2>
                  </div>
                  <div className="h-40">
                    <Oscilloscope
                      analyserNode={studio.analyserNode}
                      isListening={studio.isListening}
                      inputLevel={studio.inputLevel}
                    />
                  </div>
                </div>
              </div>

              {/* Vocal Insights */}
              <VocalInsights
                pitchData={studio.pitchData}
                inputLevel={studio.inputLevel}
                vocalRange={studio.vocalRange}
                vibrato={studio.vibrato}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Concept Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: studio.isListening ? 0.3 : 0.2 }}
        >
          {studio.isListening ? (
            <button
              onClick={() => setShowConcepts(!showConcepts)}
              className="flex items-center gap-2 text-sm text-music-dim hover:text-music-text transition-colors mb-4"
            >
              {showConcepts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showConcepts ? 'Hide' : 'Show'} Learning Guide
            </button>
          ) : (
            <h2 className="text-sm font-medium text-music-dim uppercase tracking-wider mb-4">
              What You&apos;ll See
            </h2>
          )}

          <AnimatePresence>
            {showConcepts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden"
              >
                {CONCEPT_CARDS.map((card) => (
                  <ConceptCard key={card.title} {...card} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
