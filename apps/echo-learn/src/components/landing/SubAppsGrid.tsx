'use client';

import { useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import {
  LinguaIcon,
  ReaderIcon,
  SophiaIcon,
  MusicIcon,
  NourishIcon,
  AlchemyIcon,
  AnatomyIcon,
  OriginsIcon,
} from '@/components/brand/subAppIcons';

interface SubAppIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

interface SubApp {
  id: string;
  name: string;
  tagline: string;
  blurb: string;
  detail: string;
  features: { title: string; description: string }[];
  route: string;
  gradient: string;
  accent: string;
  Icon: ComponentType<SubAppIconProps>;
  status?: 'live' | 'building';
}

const SUB_APPS: SubApp[] = [
  {
    id: 'lingua',
    name: 'Echo Lingua',
    tagline: 'Languages',
    blurb: 'Conversations with AI tutors that move at your pace.',
    detail:
      'Spanish and English through dialogue, not drills. The tutor adjusts vocabulary, speed, and grammar load to where you actually are — not where a textbook assumes you should be.',
    features: [
      { title: 'AI conversations', description: 'Talk with tutors that adapt tone and difficulty' },
      { title: 'Spaced repetition', description: 'Vocabulary surfaces when you\'re about to forget it' },
      { title: 'Family mode', description: 'Learners at different levels, one shared environment' },
    ],
    route: '/lingua',
    gradient: 'from-rose-500 to-pink-500',
    accent: 'rose',
    Icon: LinguaIcon,
    status: 'live',
  },
  {
    id: 'reader',
    name: 'Echo Reader',
    tagline: 'Academic reading',
    blurb: 'A reader that bends to the paper you\'re actually trying to understand.',
    detail:
      'Upload a PDF. The reader pulls out structure, summarizes sections, reads aloud, and keeps track of the concepts you\'ve actually seen — so a paper can be studied, not just survived.',
    features: [
      { title: 'PDF structure', description: 'Sections, figures, references extracted automatically' },
      { title: 'Audio reading', description: 'Listen to papers with TTS narration' },
      { title: 'Concept tracking', description: 'Spaced-repetition review for what you\'ve read' },
    ],
    route: '/reader/library',
    gradient: 'from-indigo-500 to-violet-500',
    accent: 'indigo',
    Icon: ReaderIcon,
    status: 'live',
  },
  {
    id: 'sophia',
    name: 'Sophia',
    tagline: 'Philosophy',
    blurb: 'A table of thinkers you can actually ask.',
    detail:
      'Philosophers, neuroscientists, and mystics — Sapolsky, Watts, Ram Dass, McKenna, and others — responding in their own voice to the questions you bring. Watch them disagree, trace a concept, or walk a guided journey.',
    features: [
      { title: 'Philosophers\' table', description: 'Ask; get perspectives from multiple thinkers' },
      { title: 'Concept universe', description: '3D map of ideas and the connections between them' },
      { title: 'Dialectic mode', description: 'Watch two thinkers disagree in real time' },
    ],
    route: '/sophia',
    gradient: 'from-amber-500 to-orange-500',
    accent: 'amber',
    Icon: SophiaIcon,
    status: 'live',
  },
  {
    id: 'music',
    name: 'Music Learning',
    tagline: 'Visual music theory',
    blurb: 'Theory you can see — notes, chords, and scales as living shapes.',
    detail:
      'Color-coded keys, animated chord progressions, and a piano roll that shows theory as geometry. Built for learners who&apos;ve been told they aren&apos;t musical — usually by someone with a stiff textbook.',
    features: [
      { title: 'Piano roll', description: 'Visual note placement, interactive' },
      { title: 'See chords', description: 'Color-coded harmony across keys' },
      { title: 'Theory basics', description: 'Scales and intervals, made geometric' },
    ],
    route: '/learn/music',
    gradient: 'from-cyan-500 to-teal-500',
    accent: 'cyan',
    Icon: MusicIcon,
    status: 'live',
  },
  {
    id: 'nourish',
    name: 'Echo Nourish',
    tagline: 'Nutrition',
    blurb: 'How we know what we know about food.',
    detail:
      'Not a diet tracker. A way to look at the evidence behind nutrition claims — what the studies actually said, how they were designed, and why the consensus keeps shifting.',
    features: [
      { title: 'Evidence view', description: 'Trace a claim back to the studies under it' },
      { title: 'Study design', description: 'Understand sample sizes, controls, and limits' },
      { title: 'Consensus drift', description: 'See how recommendations have changed over time' },
    ],
    route: '/learn/nutrition',
    gradient: 'from-green-500 to-emerald-600',
    accent: 'green',
    Icon: NourishIcon,
    status: 'building',
  },
  {
    id: 'alchemy',
    name: 'Echo Alchemy',
    tagline: 'Food science',
    blurb: 'Flavor molecules across cultural cuisines.',
    detail:
      'Every cuisine is a library of molecules in conversation. Alchemy lets you browse the actual compounds — esters, pyrazines, sulfur aromatics — and see which foods share them and why they pair.',
    features: [
      { title: 'Molecule browser', description: 'Look up flavor compounds by category' },
      { title: 'Pairing logic', description: 'See why two ingredients taste right together' },
      { title: 'Cuisine cross-section', description: 'Compare molecular fingerprints across traditions' },
    ],
    route: '/learn/alchemy',
    gradient: 'from-amber-600 to-orange-700',
    accent: 'amber',
    Icon: AlchemyIcon,
    status: 'building',
  },
  {
    id: 'anatomy',
    name: 'Anatomy Hall',
    tagline: 'Human body',
    blurb: 'A 3D body you can rotate, peel, and ask questions of.',
    detail:
      'Interactive anatomy — systems you can isolate, annotate, and probe. Built so a curious kid, a nursing student, and a parent helping with homework can all find their level in the same model.',
    features: [
      { title: '3D systems', description: 'Skeletal, muscular, circulatory — layer by layer' },
      { title: 'Labelled view', description: 'Tap any structure for its name and function' },
      { title: 'Guided tours', description: 'Walk through a system at your own speed' },
    ],
    route: '/learn/anatomy',
    gradient: 'from-red-500 to-rose-600',
    accent: 'red',
    Icon: AnatomyIcon,
    status: 'building',
  },
  {
    id: 'origins',
    name: 'Echo Origins',
    tagline: 'Systems & history',
    blurb: 'The systems that shaped how we learn, work, and think.',
    detail:
      'School, work, money, medicine — each arrived at a moment, for a reason, usually not the one we assume. Origins traces where the defaults came from, so you can see which of them you actually want to keep.',
    features: [
      { title: 'System timelines', description: 'How each institution came to look the way it does' },
      { title: 'Decision archaeology', description: 'Who made which choice, and what was possible instead' },
      { title: 'Contemporary echoes', description: 'What each origin still shapes today' },
    ],
    route: '/learn/origins',
    gradient: 'from-purple-500 to-amber-500',
    accent: 'purple',
    Icon: OriginsIcon,
    status: 'building',
  },
];

function SubAppCard({ app, onOpen }: { app: SubApp; onOpen: () => void }) {
  const { Icon } = app;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative text-left card-theme border rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      <div className="flex items-start gap-3 mb-3">
        <span
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${app.gradient} text-white flex items-center justify-center shadow-md shrink-0`}
        >
          <Icon size={24} strokeWidth={1.6} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-theme-primary truncate">{app.name}</h3>
            {app.status === 'building' && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-theme-muted border border-white/10 rounded px-1.5 py-px">
                Building
              </span>
            )}
          </div>
          <p className="text-[11px] font-mono tracking-wider uppercase text-theme-muted">
            {app.tagline}
          </p>
        </div>
      </div>

      <p className="text-sm text-theme-secondary leading-relaxed">{app.blurb}</p>

      <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-theme-muted group-hover:text-theme-primary transition-colors">
        Learn more
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function SubAppModal({ app, onClose }: { app: SubApp; onClose: () => void }) {
  const { Icon } = app;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-lg card-theme border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1.5 w-full bg-gradient-to-r ${app.gradient}`} />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-theme-muted hover:text-theme-primary transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-3 mb-4">
            <span
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.gradient} text-white flex items-center justify-center shadow-lg`}
            >
              <Icon size={32} strokeWidth={1.6} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono uppercase tracking-widest text-theme-muted mb-1">
                {app.tagline}
              </p>
              <h3 className="text-2xl font-bold text-theme-primary">{app.name}</h3>
            </div>
          </div>

          <p className="text-[15px] text-theme-secondary leading-relaxed mb-5">{app.detail}</p>

          <div className="space-y-2.5 mb-6">
            {app.features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${app.gradient} shrink-0`}
                />
                <div>
                  <p className="text-sm font-medium text-theme-primary">{f.title}</p>
                  <p className="text-sm text-theme-muted">{f.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {app.status === 'building' ? (
              <span className="text-xs font-mono uppercase tracking-wider text-theme-muted">
                Still being built — drop by later
              </span>
            ) : (
              <Link
                href={app.route}
                className={`inline-flex items-center gap-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r ${app.gradient} px-4 py-2.5 shadow-md hover:shadow-lg transition-shadow`}
              >
                Open {app.name}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SubAppsGrid() {
  const [openId, setOpenId] = useState<string | null>(null);
  const activeApp = SUB_APPS.find((a) => a.id === openId) ?? null;

  return (
    <section className="py-16 sm:py-20 bg-theme transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-3">
            Where the frontend bends
          </h2>
          <p className="text-lg text-theme-secondary">
            Eight places to learn, each with its own shape. Pick one.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {SUB_APPS.map((app) => (
            <SubAppCard key={app.id} app={app} onOpen={() => setOpenId(app.id)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeApp && <SubAppModal app={activeApp} onClose={() => setOpenId(null)} />}
      </AnimatePresence>
    </section>
  );
}
