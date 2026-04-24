'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Languages, Sparkles, User, Check } from 'lucide-react';
import { LinguaLanguage } from '@/types/lingua';

interface LinguaProfileSetupProps {
  userName: string;
  onProfileCreated: (profile: {
    id: string;
    name: string;
    nativeLanguage: string;
    targetLanguage: string;
  }) => void;
}

interface LanguageOption {
  code: LinguaLanguage;
  name: string;
  flag: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
];

export function LinguaProfileSetup({ userName, onProfileCreated }: LinguaProfileSetupProps) {
  const [step, setStep] = useState<'name' | 'native' | 'target'>('name');
  const [name, setName] = useState(userName);
  const [nativeLanguage, setNativeLanguage] = useState<LinguaLanguage | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<LinguaLanguage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleNameSubmit = () => {
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    setStep('native');
  };

  const handleNativeSelect = (lang: LinguaLanguage) => {
    setNativeLanguage(lang);
    setError('');
    setStep('target');
  };

  const handleTargetSelect = async (lang: LinguaLanguage) => {
    if (lang === nativeLanguage) {
      setError('Target language must be different from native language');
      return;
    }

    setTargetLanguage(lang);
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/lingua/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          nativeLanguage: nativeLanguage,
          targetLanguage: lang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create profile');
      }

      onProfileCreated(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      setIsSubmitting(false);
    }
  };

  const getAvailableTargetLanguages = () => {
    return languages.filter((lang) => lang.code !== nativeLanguage);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Echo-Lin</h1>
          <p className="text-gray-600 mt-2">Let&apos;s set up your language learning profile</p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {['name', 'native', 'target'].map((s, i) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                step === s
                  ? 'bg-purple-500 scale-125'
                  : i < ['name', 'native', 'target'].indexOf(step)
                  ? 'bg-purple-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Step 1: Name */}
        {step === 'name' && (
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>What should we call you?</CardTitle>
              <CardDescription>This name will appear on your learning dashboard</CardDescription>
            </CardHeader>
            <div className="mt-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              />
              <Button
                className="w-full mt-4"
                onClick={handleNameSubmit}
                disabled={name.trim().length < 2}
              >
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Native Language */}
        {step === 'native' && (
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Languages className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>What&apos;s your native language?</CardTitle>
              <CardDescription>Select the language you speak fluently</CardDescription>
            </CardHeader>
            <div className="mt-6 space-y-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleNativeSelect(lang.code)}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-purple-700">
                      {lang.name}
                    </p>
                    <p className="text-sm text-gray-500">{lang.nativeName}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('name')}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
            >
              Back to name
            </button>
          </Card>
        )}

        {/* Step 3: Target Language */}
        {step === 'target' && (
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>What language do you want to learn?</CardTitle>
              <CardDescription>
                Select the language you&apos;re learning
                {nativeLanguage && (
                  <span className="block mt-1">
                    Native: {languages.find((l) => l.code === nativeLanguage)?.flag}{' '}
                    {languages.find((l) => l.code === nativeLanguage)?.name}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <div className="mt-6 space-y-3">
              {getAvailableTargetLanguages().map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleTargetSelect(lang.code)}
                  disabled={isSubmitting}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-green-700">
                      {lang.name}
                    </p>
                    <p className="text-sm text-gray-500">{lang.nativeName}</p>
                  </div>
                  {isSubmitting && targetLanguage === lang.code ? (
                    <div className="w-6 h-6 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                  ) : (
                    <Check className="w-6 h-6 text-gray-300 group-hover:text-green-500" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('native')}
              disabled={isSubmitting}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm disabled:opacity-50"
            >
              Change native language
            </button>
          </Card>
        )}

        {/* Privacy note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Your learning data is private and only visible to you and connected family members.
        </p>
      </div>
    </div>
  );
}
