'use client';

import { useEffect, useRef, useState } from 'react';

interface GlossaryEntry {
  plain: string;
  also?: string;
}

// Plain-English translations for the jargon the parent reviewer flagged.
// Key by the term as it appears in prose, lowercased.
export const GLOSSARY: Record<string, GlossaryEntry> = {
  'cascading causation': {
    plain: 'The idea that any behavior has many causes stacked on top of each other — a split-second nervous-system event, a morning hormone, a childhood experience, a cultural pattern — and you cannot cleanly separate them.',
  },
  'actualizing tendency': {
    plain: 'The pull every living thing has to grow into what it can become — given the chance. Rogers compared it to a potato sending shoots toward any light it can find.',
  },
  'divergent thinking': {
    plain: 'Coming up with many possible answers instead of just the one the test wants. The kind of thinking most schools quietly turn off over time.',
  },
  'epistemic humility': {
    plain: 'Knowing when you might be wrong. Asking "why should I believe this?" and "who benefits from me believing it?" before you decide.',
  },
  'metacognition': {
    plain: 'Thinking about how you think. Noticing when you focus best, what explanations work for your brain, when to rest. Schools rarely teach it explicitly.',
  },
  'paradigm': {
    plain: 'The whole set of assumptions everyone inside a field shares without arguing about them. Reforms that stay inside the paradigm cannot fix problems the paradigm itself creates.',
    also: 'paradigmatic',
  },
  'hegemony': {
    plain: 'Power that works through agreement, not force. People "choose" what an arrangement wants them to choose — because the arrangement shaped what looks like a reasonable choice.',
  },
  'ideological state apparatus': {
    plain: 'An institution whose real job is keeping society arranged the way it is — through ideas, not police. Althusser\u2019s name for what schools mostly do.',
  },
  'conscientização': {
    plain: 'A Portuguese word Freire uses for "critical consciousness" — learning to see your situation as something history built, and therefore something that can be unbuilt.',
  },
  'zone of proximal development': {
    plain: 'The gap between what a learner can do alone and what they can do with a little help. Vygotsky\u2019s claim: it\u2019s the only zone where teaching actually does anything.',
    also: 'zpd',
  },
  'paideia': {
    plain: 'The ancient Greek word for education as the full formation of a person — not job training, not content delivery.',
  },
  'banking model': {
    plain: 'Freire\u2019s name for schooling that treats students as empty accounts into which teachers deposit content. The alternative he called problem-posing education.',
  },
  'compatibilism': {
    plain: 'The philosophical position that determinism (nothing happens without a cause) and "free will worth wanting" (responding to reasons, changing your mind with evidence) are not opposites. Dennett\u2019s argument.',
  },
  'anthropological': {
    plain: 'Relating to what humans actually are, biologically and developmentally. In this paper: a principle that starts from how people are shaped by conditions, not from what we wish they would do.',
  },
  'paradigmatic': {
    plain: 'About the set of assumptions a field runs on. Most reforms move chairs inside the paradigm; genuine change requires a different paradigm altogether.',
  },
  'epistemic': {
    plain: 'About knowledge — how we come to believe what we believe, and when we should doubt it. Pairs with "why should I believe this?"',
  },
  'hidden curriculum': {
    plain: 'What the structure of school teaches regardless of the subject — how to wait in rows, follow bells, defer to authority, compete for grades. Often more powerful than the explicit lessons.',
  },
};

interface TermProps {
  name: string;
  children: React.ReactNode;
}

export function Term({ name, children }: TermProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const entry = GLOSSARY[name.toLowerCase()];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        popRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!entry) return <>{children}</>;

  return (
    <span className="relative inline-block">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="underline decoration-dotted decoration-1 underline-offset-4 text-white/85 hover:text-white transition-colors cursor-help"
        style={{ textDecorationColor: 'rgba(167,139,250,0.55)' }}
        aria-expanded={open}
      >
        {children}
      </button>
      {open && (
        <span
          ref={popRef as React.Ref<HTMLDivElement>}
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 sm:w-80 z-40 rounded-lg border p-4 text-left shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(10,14,22,0.98) 60%, rgba(8,11,18,1) 100%)',
            borderColor: 'rgba(167,139,250,0.35)',
          }}
        >
          <span className="block text-[10px] font-mono tracking-[0.3em] uppercase text-purple-300/70 mb-2">
            {name}
          </span>
          <span className="block text-sm text-white/75 font-light leading-relaxed">
            {entry.plain}
          </span>
        </span>
      )}
    </span>
  );
}
