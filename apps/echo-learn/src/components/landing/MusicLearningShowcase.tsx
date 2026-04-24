'use client';

import Link from 'next/link';
import { Piano, Music, Eye, BookOpen, ArrowRight } from 'lucide-react';
import { MusicIcon } from '@/components/brand/subAppIcons';

const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const chords = [
  { name: 'C Major', notes: ['C', 'E', 'G'], color: 'from-red-400 to-red-500' },
  { name: 'G Major', notes: ['G', 'B', 'D'], color: 'from-orange-400 to-orange-500' },
  { name: 'A Minor', notes: ['A', 'C', 'E'], color: 'from-purple-400 to-purple-500' },
  { name: 'F Major', notes: ['F', 'A', 'C'], color: 'from-blue-400 to-blue-500' },
];

const features = [
  { icon: Piano, label: 'Piano Roll', description: 'Visual note placement' },
  { icon: Eye, label: 'See Chords', description: 'Color-coded harmony' },
  { icon: Music, label: 'Learn Songs', description: 'Popular melodies' },
  { icon: BookOpen, label: 'Theory Basics', description: 'Scales & intervals' },
];

export function MusicLearningShowcase() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-full text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-4">
            <MusicIcon size={16} strokeWidth={1.8} />
            <span>Visual Music Education</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <MusicIcon size={28} strokeWidth={1.6} />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-theme-primary">
              Music Learning
            </h2>
          </div>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Learn music theory visually. See notes, chords, and scales come alive with our interactive piano roll and chord visualizations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
          {/* Piano Visualization Demo */}
          <div className="card-theme border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-theme-primary">Piano Roll</h4>
              <span className="text-xs bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-full">Interactive</span>
            </div>

            {/* Mini Piano Keys */}
            <div className="flex justify-center mb-6">
              <div className="flex gap-0.5">
                {notes.map((note, idx) => {
                  const isHighlighted = chords[0].notes.includes(note);
                  const hasBlackKey = !['E', 'B'].includes(note);
                  return (
                    <div key={note} className="relative">
                      <div
                        className={`w-10 h-24 rounded-b-lg border border-gray-300 dark:border-gray-600 flex items-end justify-center pb-2 transition-colors ${
                          isHighlighted
                            ? 'bg-gradient-to-b from-red-200 to-red-300 dark:from-red-500/40 dark:to-red-600/40'
                            : 'bg-white dark:bg-gray-800'
                        }`}
                      >
                        <span className={`text-xs font-medium ${isHighlighted ? 'text-red-700 dark:text-red-300' : 'text-theme-muted'}`}>
                          {note}
                        </span>
                      </div>
                      {hasBlackKey && (
                        <div className="absolute -right-2.5 top-0 w-5 h-14 bg-gray-900 dark:bg-black rounded-b z-10" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chord Grid */}
            <div className="grid grid-cols-2 gap-3">
              {chords.map((chord) => (
                <div
                  key={chord.name}
                  className={`p-3 rounded-lg bg-gradient-to-r ${chord.color} bg-opacity-20`}
                >
                  <p className="text-sm font-medium text-white">{chord.name}</p>
                  <p className="text-xs text-white/80">{chord.notes.join(' - ')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {features.map(({ icon: Icon, label, description }) => (
                <div key={label} className="card-theme border rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h4 className="font-medium text-theme-primary mb-1">{label}</h4>
                  <p className="text-sm text-theme-muted">{description}</p>
                </div>
              ))}
            </div>

            {/* Coming Soon Note */}
            <div className="card-theme border rounded-xl p-4 bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Music className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h4 className="font-medium text-theme-primary">Visual Learning</h4>
              </div>
              <p className="text-sm text-theme-secondary">
                Watch notes animate in real-time. Color-coded keys help you learn chord progressions faster than traditional methods.
              </p>
            </div>

            <Link
              href="/learn/music"
              className="inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-medium hover:gap-3 transition-all"
            >
              Start Learning Music
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
