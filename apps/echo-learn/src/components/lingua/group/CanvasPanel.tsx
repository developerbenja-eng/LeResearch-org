'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Sparkles, Gamepad2, BarChart3, FileText } from 'lucide-react';
import { Artifact, ConversationParticipant, ArtifactType } from '@/types/canvas';
import { WordMatchGame } from './artifacts/WordMatchGame';
import { WordCloudVisualization } from './artifacts/WordCloudVisualization';
import { ConversationQuiz } from './artifacts/ConversationQuiz';

interface CanvasPanelProps {
  conversationId: string;
  artifacts: Artifact[];
  participants: ConversationParticipant[];
  participantId: string;
  onArtifactsUpdate: () => void;
}

export function CanvasPanel({
  conversationId,
  artifacts,
  participants,
  participantId,
  onArtifactsUpdate,
}: CanvasPanelProps) {
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(
    artifacts[0]?.id || null
  );
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const activeArtifact = artifacts.find((a) => a.id === activeArtifactId);

  const handleCreateArtifact = async (type: ArtifactType, title: string) => {
    setIsCreating(true);
    setShowCreateMenu(false);

    try {
      const response = await fetch('/api/lingua/artifacts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          artifactType: type,
          title,
          autoGenerate: true, // Let AI generate config from conversation
        }),
      });

      const data = await response.json();
      if (data.success) {
        onArtifactsUpdate();
        setActiveArtifactId(data.artifact.id);
      }
    } catch (error) {
      console.error('Error creating artifact:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderArtifact = () => {
    if (!activeArtifact) return null;

    switch (activeArtifact.artifactType) {
      case 'word_match':
        return (
          <WordMatchGame
            artifact={activeArtifact}
            participantId={participantId}
            participants={participants}
          />
        );
      case 'word_cloud':
        return (
          <WordCloudVisualization artifact={activeArtifact} conversationId={conversationId} />
        );
      case 'conversation_quiz':
        return (
          <ConversationQuiz
            artifact={activeArtifact}
            participantId={participantId}
            participants={participants}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Artifact type "{activeArtifact.artifactType}" not yet implemented</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Artifact Selector & Actions */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {artifacts.length > 0 ? (
              <select
                value={activeArtifactId || ''}
                onChange={(e) => setActiveArtifactId(e.target.value || null)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {artifacts.map((artifact) => (
                  <option key={artifact.id} value={artifact.id}>
                    {artifact.title}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">No artifacts yet</p>
            )}
          </div>

          <div className="relative">
            <Button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              variant="primary"
              size="sm"
              disabled={isCreating}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create Artifact'}
            </Button>

            {showCreateMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => handleCreateArtifact('word_match', 'Word Match Game')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <Gamepad2 className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Word Match Game</p>
                      <p className="text-xs text-gray-500">Match vocabulary words</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleCreateArtifact('conversation_quiz', 'Conversation Quiz')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <FileText className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-sm font-medium">Conversation Quiz</p>
                      <p className="text-xs text-gray-500">Test comprehension</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleCreateArtifact('word_cloud', 'Word Cloud')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Word Cloud</p>
                      <p className="text-xs text-gray-500">Visualize vocabulary</p>
                    </div>
                  </button>

                  <div className="border-t pt-1 mt-1">
                    <p className="px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      AI-generated from conversation
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Artifact Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeArtifact ? (
          renderArtifact()
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Palette className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Artifacts Yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Create interactive games, visualizations, and presentations from your conversation!
            </p>
            <Button
              onClick={() => setShowCreateMenu(true)}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Create Your First Artifact
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder import - will create this icon
import { Palette } from 'lucide-react';
