'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Check, X, ChevronRight } from 'lucide-react';
import type { Species } from '@/lib/types';

type Round = {
  clue: string;
  clueType: 'alias' | 'call';
  correct: Species;
  options: Species[];
};

const CALL_CLUES: Record<string, string> = {
  'barred-owl': '"Who cooks for you? Who cooks for you-all?"',
  'carolina-wren': '"Teakettle-teakettle-teakettle!"',
  'white-throated-sparrow': '"Old Sam Peabody, Peabody, Peabody"',
  'northern-cardinal': '"Birdy-birdy-birdy" / "Cheer-cheer-cheer"',
  'yellow-billed-cuckoo': 'A slow wooden "kuk-kuk-kuk-kowlp-kowlp-kowlp"',
  'tufted-titmouse': '"Peter-peter-peter"',
  'eastern-bluebird': 'Soft "cheer-cheerful-charmer"',
  'prothonotary-warbler': 'A ringing "sweet-sweet-sweet-sweet"',
  'mississippi-kite': 'A clear descending "phee-phew"',
  'blue-jay': 'A loud harsh "jaaay! jaaay!"',
  'carolina-chickadee': 'Fast high "chick-a-dee-dee-dee-dee"',
  'northern-mockingbird': 'Every song repeated 3 or more times',
  'brown-thrasher': 'Every song phrase repeated exactly twice',
  'red-tailed-hawk': 'The Hollywood "eagle" scream — a ringing "kee-eeeer"',
  'belted-kingfisher': 'A dry rattle like a tin can of gravel',
  'indigo-bunting': '"Fire-fire, where-where, here-here, see-it-see-it"',
  'summer-tanager': 'A distinctive "pit-a-tuck" call',
  'purple-martin': 'Liquid gurgling "chur-chur" from a martin house',
  'chimney-swift': 'Rapid chittering from flying cigars overhead',
  'great-horned-owl': 'Deep slow "hoo-hoo...hoo-hoo...hoo"',
  'ruby-throated-hummingbird': 'A tiny buzzing wing-hum',
  'american-robin': 'Caroling "cheerily, cheer-up, cheerio"',
  'dark-eyed-junco': 'Soft "tick-tick" from a feeder flock',
  'bald-eagle': 'Surprisingly wimpy "kik-kik-kik-kik"',
  'red-bellied-woodpecker': 'A ringing rolling "churr! churr!"',
  'pileated-woodpecker': 'A loud jungle-laugh "cuk-cuk-cuk-cuk"',
  'wood-duck': 'Female: a rising "oo-EEK! oo-EEK!"',
  'american-white-pelican': 'Mostly silent — soft grunts',
};

export function QuizClient({ species }: { species: Species[] }) {
  const [round, setRound] = useState<Round | null>(null);
  const [guessed, setGuessed] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const pool = useMemo(
    () => species.filter((s) => s.aliases.length > 0 || CALL_CLUES[s.slug]),
    [species],
  );

  useEffect(() => {
    nextRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nextRound() {
    if (pool.length < 4) return;
    const target = pool[Math.floor(Math.random() * pool.length)];
    const call = CALL_CLUES[target.slug];
    const useCall = call && Math.random() > 0.4;
    const clue = useCall
      ? call
      : `"${target.aliases[Math.floor(Math.random() * target.aliases.length)]}"`;
    const clueType: 'alias' | 'call' = useCall ? 'call' : 'alias';

    // 3 distractors from other birds, similar size if possible
    const distractors: Species[] = [];
    const rest = species.filter((s) => s.id !== target.id);
    while (distractors.length < 3) {
      const pick = rest[Math.floor(Math.random() * rest.length)];
      if (!distractors.includes(pick)) distractors.push(pick);
    }
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);
    setRound({ clue, clueType, correct: target, options });
    setGuessed(null);
  }

  function handleGuess(id: string) {
    if (!round || guessed) return;
    setGuessed(id);
    setScore((s) => ({
      correct: s.correct + (id === round.correct.id ? 1 : 0),
      total: s.total + 1,
    }));
  }

  if (!round) {
    return (
      <div className="text-center py-12 text-slate-400">Loading quiz…</div>
    );
  }

  const isCorrect = guessed === round.correct.id;

  return (
    <div>
      {/* Score */}
      <div className="flex items-center justify-between mb-6 text-sm">
        <div className="text-slate-400">
          Round <span className="text-white font-medium">{score.total + (guessed ? 0 : 1)}</span>
        </div>
        <div className="text-slate-400">
          Score{' '}
          <span className="text-white font-medium">
            {score.correct}/{score.total}
          </span>
        </div>
      </div>

      {/* Clue card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-10 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300 mb-3">
          {round.clueType === 'call' ? 'Who says this?' : 'Who\'s also called…'}
        </p>
        <p className="text-2xl md:text-3xl font-semibold text-white leading-tight">
          {round.clue}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {round.options.map((opt) => {
          const isThisCorrect = opt.id === round.correct.id;
          const isGuessed = guessed === opt.id;
          let className =
            'w-full text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer';
          if (!guessed) {
            className +=
              ' border-slate-700 bg-slate-900/60 text-slate-200 hover:border-sky-400 hover:bg-slate-800';
          } else if (isThisCorrect) {
            className += ' border-emerald-400/60 bg-emerald-500/10 text-emerald-100';
          } else if (isGuessed) {
            className += ' border-rose-400/60 bg-rose-500/10 text-rose-100';
          } else {
            className += ' border-slate-800 bg-slate-900/30 text-slate-400';
          }
          return (
            <button
              key={opt.id}
              type="button"
              disabled={Boolean(guessed)}
              onClick={() => handleGuess(opt.id)}
              className={className}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{opt.commonName}</span>
                {guessed && isThisCorrect && (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                {guessed && isGuessed && !isThisCorrect && (
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Result + next */}
      {guessed && (
        <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <Check className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-200">Correct!</span>
              </>
            ) : (
              <>
                <X className="w-5 h-5 text-rose-400" />
                <span className="font-semibold text-rose-200">
                  It was {round.correct.commonName}.
                </span>
              </>
            )}
          </div>
          <Link
            href={`/${round.correct.slug}`}
            className="text-sm text-sky-300 hover:text-sky-200 inline-flex items-center gap-1"
          >
            Read the {round.correct.commonName} profile{' '}
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={nextRound}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Next bird
          </button>
        </div>
      )}
    </div>
  );
}
