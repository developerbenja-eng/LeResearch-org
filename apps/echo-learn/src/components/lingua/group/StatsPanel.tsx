'use client';

import React, { useEffect, useState } from 'react';
import { ConversationStats, GroupMessage, ConversationParticipant } from '@/types/canvas';
import { MessageSquare, Clock, Languages, Mic, TrendingUp } from 'lucide-react';

interface StatsPanelProps {
  conversationId: string;
  messages: GroupMessage[];
  participants: ConversationParticipant[];
}

export function StatsPanel({ conversationId, messages, participants }: StatsPanelProps) {
  const [stats, setStats] = useState<ConversationStats | null>(null);

  useEffect(() => {
    calculateStats();
  }, [messages]);

  const calculateStats = () => {
    // Basic stats calculation from messages
    const totalMessages = messages.length;
    const userMessages = messages.filter((m) => m.participantType === 'user').length;
    const personaMessages = messages.filter((m) => m.participantType === 'persona').length;
    const voiceMessages = messages.filter((m) => m.messageType === 'voice').length;

    // Word counting (simple approximation)
    let spanishWords = 0;
    let englishWords = 0;
    let totalWords = 0;

    messages.forEach((m) => {
      const words = m.content.split(/\s+/).length;
      totalWords += words;
      // Simple heuristic: if message has Spanish characters, count as Spanish
      if (/[áéíóúüñ¿¡]/i.test(m.content)) {
        spanishWords += words;
      } else {
        englishWords += words;
      }
    });

    const calculatedStats: ConversationStats = {
      id: `stats_${conversationId}`,
      conversationId,
      totalMessages,
      totalWords,
      totalDurationMs: 0,
      spanishWordCount: spanishWords,
      englishWordCount: englishWords,
      userMessageCount: userMessages,
      personaMessageCount: personaMessages,
      voiceMessageCount: voiceMessages,
      totalVoiceDurationSec: 0,
      uniqueWordsUsed: 0,
      newWordsLearned: 0,
      artifactsCreated: 0,
      gamesPlayed: 0,
      calculatedAt: new Date().toISOString(),
    };

    setStats(calculatedStats);
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Calculating stats...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Conversation Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {/* Total Messages */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <p className="text-sm font-medium text-purple-900">Total Messages</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.totalMessages}</p>
        </div>

        {/* Total Words */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-5 h-5 text-pink-600" />
            <p className="text-sm font-medium text-pink-900">Total Words</p>
          </div>
          <p className="text-3xl font-bold text-pink-600">{stats.totalWords}</p>
        </div>

        {/* Voice Messages */}
        {stats.voiceMessageCount > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">Voice Messages</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.voiceMessageCount}</p>
          </div>
        )}
      </div>

      {/* Language Breakdown */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Breakdown</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Spanish</span>
              <span className="text-sm font-bold text-purple-600">
                {stats.spanishWordCount} words
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                style={{
                  width: `${(stats.spanishWordCount / stats.totalWords) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">English</span>
              <span className="text-sm font-bold text-pink-600">
                {stats.englishWordCount} words
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full"
                style={{
                  width: `${(stats.englishWordCount / stats.totalWords) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants</h3>
        <div className="space-y-3">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg">
                  {p.avatar || (p.participantType === 'user' ? '👤' : '🤖')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{p.displayName}</p>
                  <p className="text-xs text-gray-500 capitalize">{p.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  {messages.filter((m) => m.participantId === p.id).length}
                </p>
                <p className="text-xs text-gray-500">messages</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
