'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SYSTEM_METADATA, type AnatomyJourney, type AnatomyJourneyProgress, type JourneyStep } from '@/types/anatomy';

export default function JourneyDetailPage() {
  const params = useParams();
  const journeyId = params.journeyId as string;

  const [journey, setJourney] = useState<AnatomyJourney | null>(null);
  const [progress, setProgress] = useState<AnatomyJourneyProgress | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    fetchJourney();
  }, [journeyId]);

  const fetchJourney = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/anatomy/journeys/${journeyId}`);
      const data = await res.json();
      setJourney(data.journey);
    } catch (error) {
      console.error('Error fetching journey:', error);
    } finally {
      setLoading(false);
    }
  };

  const startJourney = async () => {
    try {
      const res = await fetch(`/api/anatomy/journeys/${journeyId}/progress`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
        setCurrentStep(data.progress.currentStep);
        setStarted(true);
      }
    } catch (error) {
      console.error('Error starting journey:', error);
    }
  };

  const completeStep = async () => {
    if (!progress || !journey) return;

    const newCompletedSteps = [...(progress.completedSteps || [])];
    if (!newCompletedSteps.includes(currentStep)) {
      newCompletedSteps.push(currentStep);
    }

    const nextStep = currentStep + 1;

    try {
      await fetch(`/api/anatomy/journeys/${journeyId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: nextStep,
          completedSteps: newCompletedSteps,
        }),
      });

      setProgress({
        ...progress,
        currentStep: nextStep,
        completedSteps: newCompletedSteps,
      });

      if (nextStep < journey.steps.length) {
        setCurrentStep(nextStep);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Journey not found</h1>
        <Link href="/learn/anatomy/journey" className="text-blue-400 hover:underline mt-4 inline-block">
          ← Back to Journeys
        </Link>
      </div>
    );
  }

  // Journey overview (not started)
  if (!started) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4"
            style={{ backgroundColor: journey.color + '20' }}
          >
            {journey.emoji}
          </div>
          <h1 className="text-3xl font-bold mb-2">{journey.title}</h1>
          <p className="text-slate-400">{journey.description}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {journey.system && (
              <span
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: SYSTEM_METADATA[journey.system]?.color + '20' }}
              >
                {SYSTEM_METADATA[journey.system]?.emoji} {SYSTEM_METADATA[journey.system]?.label}
              </span>
            )}
            <span className="px-3 py-1 bg-slate-700 rounded-full text-sm capitalize">
              {journey.difficulty}
            </span>
            <span className="px-3 py-1 bg-slate-700 rounded-full text-sm">
              ⏱️ {journey.estimatedMinutes} min
            </span>
          </div>
        </div>

        {/* Steps Preview */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-lg font-semibold mb-4">Journey Outline</h2>
          <div className="space-y-3">
            {journey.steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-slate-400 capitalize">{step.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startJourney}
          className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-lg"
        >
          Start Journey
        </button>
      </div>
    );
  }

  // Active journey
  const step = journey.steps[currentStep];
  const isComplete = currentStep >= journey.steps.length;
  const completedSteps = progress?.completedSteps || [];

  if (isComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-2">Journey Complete!</h1>
        <p className="text-slate-400 mb-8">
          Congratulations on completing "{journey.title}"!
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/learn/anatomy/journey"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium"
          >
            More Journeys
          </Link>
          <Link
            href="/learn/anatomy/quiz"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
          >
            Test Your Knowledge
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Step {currentStep + 1} of {journey.steps.length}</span>
          <span>{Math.round(((currentStep) / journey.steps.length) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(currentStep / journey.steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {journey.steps.map((s, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;

          return (
            <button
              key={s.id}
              onClick={() => index <= currentStep && setCurrentStep(index)}
              disabled={index > currentStep}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-all ${
                isCurrent
                  ? 'bg-blue-500 text-white'
                  : isCompleted
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-slate-700 text-slate-400'
              } ${index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
            >
              {isCompleted ? '✓' : index + 1}
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 bg-slate-700 rounded text-xs capitalize">{step.type}</span>
        </div>
        <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
        <div className="prose prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{step.content}</p>
        </div>

        {step.structureIds && step.structureIds.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Related Structures</h3>
            <div className="flex flex-wrap gap-2">
              {step.structureIds.map((id) => (
                <Link
                  key={id}
                  href={`/learn/anatomy/structures/${id}`}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
                >
                  {id}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium"
        >
          ← Previous
        </button>
        <button
          onClick={completeStep}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
        >
          {currentStep < journey.steps.length - 1 ? 'Complete & Continue' : 'Complete Journey'}
        </button>
      </div>
    </div>
  );
}
