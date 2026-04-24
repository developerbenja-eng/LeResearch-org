'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SYSTEM_METADATA, type BodySystem, type AnatomyDifficulty, type QuizType } from '@/types/anatomy';

const quizTypes: { type: QuizType; label: string; description: string; emoji: string }[] = [
  { type: 'identification', label: 'Identification', description: 'Identify structures from descriptions', emoji: '🔍' },
  { type: 'labeling', label: 'Labeling', description: 'Match Latin names to structures', emoji: '🏷️' },
  { type: 'function', label: 'Function', description: 'Match structures to their functions', emoji: '⚙️' },
  { type: 'relationships', label: 'Relationships', description: 'Connect structures to their systems', emoji: '🔗' },
  { type: 'mixed', label: 'Mixed', description: 'All question types combined', emoji: '🎲' },
];

export default function QuizPage() {
  const router = useRouter();
  const [quizType, setQuizType] = useState<QuizType>('identification');
  const [focusSystem, setFocusSystem] = useState<BodySystem | ''>('');
  const [difficulty, setDifficulty] = useState<AnatomyDifficulty>('beginner');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/anatomy/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizType,
          focusSystem: focusSystem || undefined,
          difficulty,
          questionCount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate quiz');
      }

      const data = await res.json();

      // Store quiz data in sessionStorage and navigate to quiz session
      sessionStorage.setItem('anatomyQuiz', JSON.stringify(data));
      router.push(`/learn/anatomy/quiz/${data.session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Anatomy Quiz</h1>
      <p className="text-slate-400 mb-8">
        Test your knowledge of human anatomy with customized quizzes.
      </p>

      {/* Quiz Type Selection */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quiz Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quizTypes.map((qt) => (
            <button
              key={qt.type}
              onClick={() => setQuizType(qt.type)}
              className={`p-4 rounded-xl border text-left transition-all ${
                quizType === qt.type
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="text-2xl mb-2">{qt.emoji}</div>
              <div className="font-medium">{qt.label}</div>
              <div className="text-xs text-slate-400 mt-1">{qt.description}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Focus System */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Focus Area (Optional)</h2>
        <select
          value={focusSystem}
          onChange={(e) => setFocusSystem(e.target.value as BodySystem | '')}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All body systems</option>
          {(Object.entries(SYSTEM_METADATA) as [BodySystem, typeof SYSTEM_METADATA[BodySystem]][]).map(
            ([system, meta]) => (
              <option key={system} value={system}>
                {meta.emoji} {meta.label} System
              </option>
            )
          )}
        </select>
      </section>

      {/* Difficulty */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Difficulty</h2>
        <div className="flex gap-3">
          {(['beginner', 'intermediate', 'advanced'] as AnatomyDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all capitalize ${
                difficulty === d
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      {/* Question Count */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Number of Questions</h2>
        <div className="flex gap-3">
          {[5, 10, 15, 20].map((count) => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                questionCount === count
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={startQuiz}
        disabled={loading}
        className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Generating Quiz...
          </span>
        ) : (
          'Start Quiz'
        )}
      </button>
    </div>
  );
}
