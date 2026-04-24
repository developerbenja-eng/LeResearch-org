import { Metadata } from 'next';
import { Brain } from 'lucide-react';
import { loadAllSpecies } from '@/lib/loadSpecies';
import { QuizClient } from './QuizClient';

export const metadata: Metadata = {
  title: 'Quiz — Memphis Birds',
  description: 'Guess the Memphis bird from its folk mnemonic or call.',
};

export default function QuizPage() {
  const species = loadAllSpecies();
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
          <Brain className="w-6 h-6 text-amber-300" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Name That Bird</h1>
          <p className="mt-2 text-slate-400">
            Every Memphis bird is known by a folk-name or a sound-mnemonic. Can you match them?
          </p>
        </div>
      </header>
      <QuizClient species={species} />
    </div>
  );
}
