'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CONVERSATION_TOPICS, Persona, ConversationTopic } from '@/lib/lingua/ai-chat/personas';
import { CharacterPersona } from '@/lib/lingua/character-persona-bridge';
import { MessageCircle, Target, Sparkles, Users, Book, Loader2 } from 'lucide-react';
import Image from 'next/image';

type PersonaType = 'system' | 'character';

interface PersonaSelectorProps {
  onSelect: (
    persona: Persona | CharacterPersona,
    topic: ConversationTopic,
    type: PersonaType,
    characterId?: string
  ) => void;
}

export function PersonaSelector({ onSelect }: PersonaSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<PersonaType>('system');
  const [systemPersonas, setSystemPersonas] = useState<Persona[]>([]);
  const [characterPersonas, setCharacterPersonas] = useState<CharacterPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<Persona | CharacterPersona | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null>(null);
  const [selectedType, setSelectedType] = useState<PersonaType>('system');

  // Fetch personas on mount
  useEffect(() => {
    async function fetchPersonas() {
      try {
        const response = await fetch('/api/lingua/personas');
        const data = await response.json();

        if (data.success) {
          setSystemPersonas(data.systemPersonas || []);
          setCharacterPersonas(data.characterPersonas || []);
        }
      } catch (error) {
        console.error('Error fetching personas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPersonas();
  }, []);

  const handlePersonaSelect = (persona: Persona | CharacterPersona, type: PersonaType) => {
    setSelectedPersona(persona);
    setSelectedType(type);
  };

  const handleStart = () => {
    if (selectedPersona && selectedTopic) {
      const characterId =
        selectedType === 'character' && 'characterId' in selectedPersona
          ? selectedPersona.characterId
          : undefined;
      onSelect(selectedPersona, selectedTopic, selectedType, characterId);
    }
  };

  const currentPersonas = selectedTab === 'system' ? systemPersonas : characterPersonas;

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card variant="bordered" padding="md" className="bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Practice with AI Conversation Partners
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              Chat with regional characters who speak authentically, your own storybook characters,
              or practice with Echo, our meta-learning coach who helps you understand HOW you learn.
            </p>
            <p className="text-xs text-gray-600">
              💡 All conversations adapt to your difficulty level and learning style!
            </p>
          </div>
        </div>
      </Card>

      {/* Persona Tab Selection */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>1. Choose Your Conversation Partner</span>
          {selectedPersona && <span className="text-green-600">✓</span>}
        </h4>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedTab('system')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedTab === 'system'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Regional Personas
          </button>
          <button
            onClick={() => setSelectedTab('character')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedTab === 'character'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Book className="w-4 h-4" />
            My Characters
            {characterPersonas.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                {characterPersonas.length}
              </span>
            )}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading personas...</span>
          </div>
        )}

        {/* Persona Grid */}
        {!loading && (
          <>
            {selectedTab === 'character' && characterPersonas.length === 0 ? (
              <Card variant="bordered" padding="md" className="bg-gray-50">
                <div className="text-center py-4">
                  <Book className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <h5 className="font-medium text-gray-700 mb-1">No Characters Unlocked</h5>
                  <p className="text-sm text-gray-500 mb-3">
                    Unlock your storybook characters for Lingua to chat with them!
                  </p>
                  <a
                    href="/characters"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Go to Characters →
                  </a>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentPersonas.map((persona) => {
                  const isCharacter = 'isCharacter' in persona && (persona as CharacterPersona).isCharacter === true;
                  const characterPersona = isCharacter ? (persona as CharacterPersona) : null;
                  const isSelected =
                    selectedPersona?.id === persona.id && selectedType === selectedTab;

                  return (
                    <button
                      key={persona.id}
                      onClick={() => handlePersonaSelect(persona, selectedTab)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {/* Avatar - show image for characters with reference, emoji otherwise */}
                        {characterPersona?.referenceImageUrl ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={characterPersona.referenceImageUrl}
                              alt={persona.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-3xl">{persona.avatar}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900">{persona.name}</h5>
                          <p className="text-xs text-gray-600">
                            {persona.region}, {persona.country}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                        {persona.backstory}
                      </p>
                      {persona.id === 'echo' && (
                        <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                          <Sparkles className="w-3 h-3" />
                          Meta-Learning Coach
                        </div>
                      )}
                      {characterPersona && (
                        <div className="flex items-center gap-1 text-xs text-pink-600 font-medium">
                          <Book className="w-3 h-3" />
                          From Your Stories
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Topic Selection */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>2. Pick a Conversation Topic</span>
          {selectedTopic && <span className="text-green-600">✓</span>}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONVERSATION_TOPICS.map((topic) => {
            const isMetaTopic = topic.id === 'metacognition';
            const isRecommendedForPersona = selectedPersona?.favoriteTopics.includes(topic.id);

            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedTopic?.id === topic.id
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h5 className="font-semibold text-gray-900 text-sm">{topic.name}</h5>
                  {isRecommendedForPersona && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                  {isMetaTopic && (
                    <div className="flex items-center gap-1 text-xs text-purple-600">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600">{topic.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleStart}
          disabled={!selectedPersona || !selectedTopic}
          size="lg"
          className="min-w-[200px]"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Start Conversation
        </Button>
      </div>

      {/* Selected Info */}
      {selectedPersona && selectedTopic && (
        <Card variant="bordered" padding="sm" className="bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-green-600" />
            <span className="text-green-800">
              Ready to chat with <strong>{selectedPersona.name}</strong>
              {selectedType === 'character' && ' (your character)'} about{' '}
              <strong>{selectedTopic.name}</strong>!
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
