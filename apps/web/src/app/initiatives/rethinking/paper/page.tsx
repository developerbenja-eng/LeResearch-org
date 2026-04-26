import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';

import { PaperReader } from '../_components/PaperReader';

export const metadata = {
  title: 'Rethinking Education — the paper',
  description:
    'A theoretical framework for educational reform in the AI age. Synthesis, eight principles, the political dimension, implications for practice.',
  publisher: 'LeDesign AI LLC',
};

async function loadPaper(): Promise<string> {
  const file = path.join(process.cwd(), 'public', 'rethinking', 'paper.md');
  return fs.readFile(file, 'utf8');
}

export default async function PaperPage() {
  const md = await loadPaper();

  return (
    <div className="relative min-h-screen bg-[#05070c] text-white">
      <div
        className="absolute top-1/4 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.6), transparent)' }}
      />
      <div
        className="absolute top-2/3 -right-40 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.6), transparent)' }}
      />

      <header className="relative border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/initiatives/rethinking"
            className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 hover:text-white/60 transition-colors"
          >
            ← Rethinking
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/initiatives/rethinking/framework"
              className="text-[10px] font-mono tracking-[0.3em] uppercase text-purple-300/60 hover:text-purple-300/90 transition-colors"
            >
              Framework →
            </Link>
            <a
              href="/initiatives/rethinking/paper.md"
              target="_blank"
              rel="noopener noreferrer"
              download
              className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 hover:text-white/60 transition-colors"
            >
              .md
            </a>
          </div>
        </div>
      </header>

      <div className="relative pt-10">
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-blue-300/50">
            The paper · 2025
          </p>
        </div>
        <PaperReader markdown={md} />
      </div>
    </div>
  );
}
