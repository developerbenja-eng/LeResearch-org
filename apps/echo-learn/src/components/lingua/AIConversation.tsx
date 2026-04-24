'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLingua } from '@/context/LinguaContext';
import { useTracking } from './tracking/InteractionTracker';
import { Persona, ConversationTopic } from '@/lib/lingua/ai-chat/personas';
import { CharacterPersona } from '@/lib/lingua/character-persona-bridge';
import { Send, ArrowLeft, User, Mic, Keyboard, Volume2, MessageSquare } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { VoiceMessage } from './VoiceMessage';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  hesitationMs?: number;
  audioUrl?: string;
  audioDuration?: number;
  isVoice?: boolean;
}

interface AIConversationProps {
  persona: Persona | CharacterPersona;
  topic: ConversationTopic;
  characterId?: string; // If provided, use character persona instead of system persona
  onBack: () => void;
}

export function AIConversation({ persona, topic, characterId, onBack }: AIConversationProps) {
  const isCharacterPersona = 'isCharacter' in persona && persona.isCharacter;
  const { user, difficultyLevel } = useLingua();
  const { trackFeatureUsage, isTracking } = useTracking();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStartTime] = useState<number>(Date.now());
  const [conversationSaved, setConversationSaved] = useState(false);
  const inputFocusTime = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice messaging state
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [aiResponseMode, setAiResponseMode] = useState<'text' | 'voice'>('text');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Initialize conversation with greeting
  useEffect(() => {
    const greetingMessage: Message = {
      id: `greeting_${Date.now()}`,
      role: 'assistant',
      content: persona.greetingStyle,
      timestamp: Date.now(),
    };
    setMessages([greetingMessage]);
  }, [persona]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputFocus = () => {
    inputFocusTime.current = Date.now();
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const hesitationMs = inputFocusTime.current > 0 ? Date.now() - inputFocusTime.current : 0;

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: userInput.trim(),
      timestamp: Date.now(),
      hesitationMs,
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    inputFocusTime.current = 0;

    try {
      // Call AI chat API - use characterId if provided, otherwise personaId
      const response = await fetch('/api/lingua/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(characterId ? { characterId } : { personaId: persona.id }),
          topicId: topic.id,
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userContext: {
            name: user?.name || 'User',
            nativeLang: user?.nativeLang || 'en',
            targetLang: user?.targetLang || 'es',
            difficultyLevel,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Track conversation engagement
        if (isTracking) {
          await trackFeatureUsage('ai_conversation', Date.now() - conversationStartTime, {
            personaId: persona.id,
            topicId: topic.id,
            messageCount: messages.length + 2,
            hesitationMs,
            messageLength: userMessage.content.length,
          });
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: '¡Lo siento! / Sorry! I had trouble responding. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceSend = async (recording: { blob: Blob; url: string; duration: number }) => {
    setIsLoading(true);
    setIsRecordingVoice(false);

    try {
      // Upload voice recording and transcribe
      const formData = new FormData();
      formData.append('audio', recording.blob, 'voice-message.webm');
      formData.append('userId', user?.id || 'anonymous');

      const transcribeResponse = await fetch('/api/lingua/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      const transcribeData = await transcribeResponse.json();

      if (!transcribeData.success) {
        throw new Error('Failed to transcribe voice message');
      }

      const transcript = transcribeData.transcript;

      // Add user voice message with transcript
      const userMessage: Message = {
        id: `user_voice_${Date.now()}`,
        role: 'user',
        content: transcript,
        timestamp: Date.now(),
        audioUrl: recording.url,
        audioDuration: recording.duration,
        isVoice: true,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Get AI response - use characterId if provided, otherwise personaId
      const aiResponse = await fetch('/api/lingua/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(characterId ? { characterId } : { personaId: persona.id }),
          topicId: topic.id,
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userContext: {
            name: user?.name || 'User',
            nativeLang: user?.nativeLang || 'en',
            targetLang: user?.targetLang || 'es',
            difficultyLevel,
          },
          responseMode: aiResponseMode, // Request voice or text response
        }),
      });

      const aiData = await aiResponse.json();

      if (aiData.success) {
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: aiData.message,
          timestamp: Date.now(),
          audioUrl: aiData.audioUrl, // NEW: Voice response URL if available
          audioDuration: aiData.audioDuration,
          isVoice: aiResponseMode === 'voice' && aiData.audioUrl,
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Track voice conversation engagement
        if (isTracking) {
          await trackFeatureUsage('ai_voice_conversation', recording.duration * 1000, {
            personaId: persona.id,
            topicId: topic.id,
            messageCount: messages.length + 2,
            voiceDuration: recording.duration,
            aiResponseMode,
          });
        }
      } else {
        throw new Error(aiData.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error sending voice message:', err);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: '¡Lo siento! / Sorry! I had trouble processing your voice message. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAIConversation = async () => {
    if (conversationSaved || messages.length <= 1) return; // Don't save if only greeting

    try {
      // Format conversation for saving
      const formattedMessages = messages.map((m) => ({
        sender: m.role === 'user' ? user?.name || 'You' : persona.name,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString(),
      }));

      const title = `AI Chat with ${persona.name} - ${topic.name}`;
      const conversationDuration = Date.now() - conversationStartTime;

      const response = await fetch('/api/lingua/ai-conversations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: {
            id: persona.id,
            name: persona.name,
            region: persona.region,
          },
          topic: {
            id: topic.id,
            name: topic.name,
          },
          messages: formattedMessages,
          title,
          durationMs: conversationDuration,
        }),
      });

      if (response.ok) {
        setConversationSaved(true);
        console.log('AI conversation saved successfully');
      }
    } catch (err) {
      console.error('Error saving AI conversation:', err);
    }
  };

  const handleBack = async () => {
    await saveAIConversation();
    onBack();
  };

  return (
    <Card variant="elevated" className="w-full h-[calc(100vh-120px)] md:h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b">
        <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              {isCharacterPersona && 'referenceImageUrl' in persona && persona.referenceImageUrl ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={persona.referenceImageUrl}
                    alt={persona.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="text-2xl">{persona.avatar}</span>
              )}
              <span className="font-semibold text-gray-900">{persona.name}</span>
              {isCharacterPersona && (
                <span className="text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full">
                  Character
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {persona.region}, {persona.country}
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Topic: <span className="font-medium">{topic.name}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            {message.role === 'user' ? (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100 text-purple-600">
                <User className="w-4 h-4" />
              </div>
            ) : isCharacterPersona && 'referenceImageUrl' in persona && persona.referenceImageUrl ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={persona.referenceImageUrl}
                  alt={persona.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-600">
                <span className="text-lg">{persona.avatar}</span>
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`flex-1 max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}
            >
              {message.isVoice && message.audioUrl ? (
                <VoiceMessage
                  audioUrl={message.audioUrl}
                  duration={message.audioDuration || 0}
                  isUser={message.role === 'user'}
                  transcript={message.content}
                />
              ) : (
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-900 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              )}
              {message.hesitationMs !== undefined && message.hesitationMs > 3000 && (
                <p className="text-xs text-gray-400 mt-1">
                  Took {Math.round(message.hesitationMs / 1000)}s to respond
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3">
            {isCharacterPersona && 'referenceImageUrl' in persona && persona.referenceImageUrl ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={persona.referenceImageUrl}
                  alt={persona.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-lg">{persona.avatar}</span>
              </div>
            )}
            <div className="bg-gray-100 rounded-lg rounded-tl-none p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t bg-gray-50">
        {/* AI Response Mode Toggle */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-600">AI Responds:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setAiResponseMode('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                aiResponseMode === 'text'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Text
            </button>
            <button
              onClick={() => setAiResponseMode('voice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                aiResponseMode === 'voice'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              Voice
            </button>
          </div>
        </div>

        {/* Input Mode: Text or Voice */}
        {inputMode === 'text' ? (
          <div className="flex gap-2">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onFocus={handleInputFocus}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send)"
              className="flex-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={2}
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isLoading}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setInputMode('voice')}
                variant="outline"
                size="sm"
                disabled={isLoading}
                title="Switch to voice message"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <VoiceRecorder
              onSend={handleVoiceSend}
              onCancel={() => setInputMode('text')}
            />
            <Button
              onClick={() => setInputMode('text')}
              variant="ghost"
              size="sm"
              className="w-full"
              disabled={isRecordingVoice}
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Switch to text
            </Button>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Difficulty: {difficultyLevel}% target language mix
        </p>
      </div>
    </Card>
  );
}
