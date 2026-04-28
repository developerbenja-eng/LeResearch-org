'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTracking } from '../tracking/InteractionTracker';
import { Check, X } from 'lucide-react';

interface ConjugationForm {
  pronoun: string;
  form: string;
}

const SPANISH_PRONOUNS = ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos/ellas'];
const TENSES = ['present', 'preterite', 'imperfect', 'future'];

export function VerbConjugator() {
  const { trackFeatureUsage, isTracking } = useTracking();
  const [verb, setVerb] = useState('');
  const [tense, setTense] = useState<string>('present');
  const [conjugations, setConjugations] = useState<Record<string, string>>({});
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [startTime] = useState(Date.now());

  const handleVerbChange = (newVerb: string) => {
    setVerb(newVerb);
    setConjugations({});
    setUserInputs({});
    setFeedback({});
  };

  const handleLoadConjugations = async () => {
    if (!verb) return;

    setIsLoading(true);
    setFeedback({});

    try {
      // Track feature usage
      if (isTracking) {
        await trackFeatureUsage('verb_conjugator', Date.now() - startTime, {
          verb,
          tense,
        });
      }

      // TODO: Call API to get conjugations from Gemini
      // For now, use mock data
      const mockConjugations: Record<string, string> = {
        yo: verb === 'hablar' ? 'hablo' : verb + 'o',
        tú: verb === 'hablar' ? 'hablas' : verb + 's',
        'él/ella': verb === 'hablar' ? 'habla' : verb,
        nosotros: verb === 'hablar' ? 'hablamos' : verb + 'mos',
        vosotros: verb === 'hablar' ? 'habláis' : verb + 'is',
        'ellos/ellas': verb === 'hablar' ? 'hablan' : verb + 'n',
      };

      setConjugations(mockConjugations);
    } catch (error) {
      console.error('Error loading conjugations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (pronoun: string, value: string) => {
    setUserInputs({ ...userInputs, [pronoun]: value });
    // Clear feedback when user changes input
    const newFeedback = { ...feedback };
    delete newFeedback[pronoun];
    setFeedback(newFeedback);
  };

  const handleCheck = (pronoun: string) => {
    const userAnswer = userInputs[pronoun]?.trim().toLowerCase();
    const correctAnswer = conjugations[pronoun]?.trim().toLowerCase();

    setFeedback({
      ...feedback,
      [pronoun]: userAnswer === correctAnswer,
    });
  };

  const handleCheckAll = () => {
    const newFeedback: Record<string, boolean> = {};

    SPANISH_PRONOUNS.forEach((pronoun) => {
      const userAnswer = userInputs[pronoun]?.trim().toLowerCase();
      const correctAnswer = conjugations[pronoun]?.trim().toLowerCase();
      newFeedback[pronoun] = userAnswer === correctAnswer;
    });

    setFeedback(newFeedback);
  };

  const handleReveal = () => {
    const revealedInputs: Record<string, string> = {};
    SPANISH_PRONOUNS.forEach((pronoun) => {
      revealedInputs[pronoun] = conjugations[pronoun] || '';
    });
    setUserInputs(revealedInputs);
    setFeedback({});
  };

  return (
    <Card variant="elevated" className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Verb Conjugator</h3>
          <p className="text-sm text-gray-600">
            Practice verb conjugations with instant feedback
          </p>
        </div>

        {/* Verb Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={verb}
            onChange={(e) => handleVerbChange(e.target.value)}
            placeholder="Enter a verb (e.g., hablar)"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={tense}
            onChange={(e) => setTense(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {TENSES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <Button onClick={handleLoadConjugations} disabled={!verb || isLoading}>
            {isLoading ? 'Loading...' : 'Load'}
          </Button>
        </div>

        {/* Conjugation Practice */}
        {Object.keys(conjugations).length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-3">
              {SPANISH_PRONOUNS.map((pronoun) => (
                <div key={pronoun} className="flex items-center gap-3">
                  <span className="w-24 text-sm font-medium text-gray-700">
                    {pronoun}
                  </span>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={userInputs[pronoun] || ''}
                      onChange={(e) => handleInputChange(pronoun, e.target.value)}
                      placeholder="Type conjugation..."
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        feedback[pronoun] !== undefined
                          ? feedback[pronoun]
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : ''
                      }`}
                    />
                    {feedback[pronoun] !== undefined && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {feedback[pronoun] ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCheck(pronoun)}
                    disabled={!userInputs[pronoun]}
                  >
                    Check
                  </Button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleReveal}>
                Reveal Answers
              </Button>
              <Button onClick={handleCheckAll}>Check All</Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {Object.keys(conjugations).length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <p>Enter a Spanish verb and select a tense to start practicing!</p>
          </div>
        )}
      </div>
    </Card>
  );
}
