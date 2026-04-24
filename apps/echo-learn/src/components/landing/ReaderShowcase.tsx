'use client';

import Link from 'next/link';
import { FileText, Headphones, Highlighter, Brain, ArrowRight, Sparkles } from 'lucide-react';
import { ReaderIcon } from '@/components/brand/subAppIcons';

const samplePaper = {
  title: 'Attention Is All You Need',
  authors: 'Vaswani et al.',
  sections: ['Abstract', 'Introduction', 'Background', 'Model Architecture', 'Training', 'Results', 'Conclusion'],
  concepts: ['Transformers', 'Self-Attention', 'Multi-Head Attention', 'Positional Encoding'],
};

const features = [
  { icon: FileText, label: 'PDF Upload', description: 'Upload any academic paper' },
  { icon: Headphones, label: 'Audio Reading', description: 'Listen with TTS narration' },
  { icon: Highlighter, label: 'Smart Annotations', description: 'Highlight and take notes' },
  { icon: Brain, label: 'Concept Tracking', description: 'SRS review for key concepts' },
];

export function ReaderShowcase() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-full text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
            <ReaderIcon size={16} strokeWidth={1.8} />
            <span>Academic Reading</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ReaderIcon size={28} strokeWidth={1.6} />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-theme-primary">
              Echo Reader
            </h2>
          </div>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Upload academic papers and let AI extract structure, generate summaries, and read aloud. Track concepts with spaced repetition.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
          {/* Paper Preview Demo */}
          <div className="card-theme border rounded-2xl overflow-hidden shadow-lg">
            {/* Paper Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 p-6 text-white">
              <div className="flex items-center gap-2 text-indigo-200 text-sm mb-2">
                <Sparkles className="w-4 h-4" />
                AI-Extracted Structure
              </div>
              <h3 className="text-xl font-bold mb-1">{samplePaper.title}</h3>
              <p className="text-indigo-200 text-sm">{samplePaper.authors}</p>
            </div>

            {/* Sections */}
            <div className="p-4 border-b border-theme">
              <h4 className="text-xs font-medium text-theme-muted uppercase mb-3">Sections</h4>
              <div className="flex flex-wrap gap-2">
                {samplePaper.sections.map((section, idx) => (
                  <span
                    key={section}
                    className={`text-xs px-3 py-1.5 rounded-full ${
                      idx === 0
                        ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-theme-muted'
                    }`}
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>

            {/* Concepts */}
            <div className="p-4">
              <h4 className="text-xs font-medium text-theme-muted uppercase mb-3">Key Concepts</h4>
              <div className="flex flex-wrap gap-2">
                {samplePaper.concepts.map((concept) => (
                  <span
                    key={concept}
                    className="text-xs px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Audio Player Mock */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-theme">
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-indigo-500 rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs text-theme-muted mt-1">
                    <span>2:34</span>
                    <span>8:45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {features.map(({ icon: Icon, label, description }) => (
                <div key={label} className="card-theme border rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="font-medium text-theme-primary mb-1">{label}</h4>
                  <p className="text-sm text-theme-muted">{description}</p>
                </div>
              ))}
            </div>

            <div className="card-theme border rounded-xl p-4 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20">
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                <strong>Demo Papers Available:</strong> Try with &quot;Attention Is All You Need&quot; or &quot;BERT&quot; pre-loaded in the library.
              </p>
            </div>

            <Link
              href="/reader/library"
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:gap-3 transition-all"
            >
              Explore Echo Reader
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
