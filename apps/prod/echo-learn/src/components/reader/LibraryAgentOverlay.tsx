'use client';

import React, { useEffect, useRef } from 'react';
import { X, Mic, StopCircle, Wrench, Library, ArrowRight, BookOpen } from 'lucide-react';
import { useLibraryAgent } from '@/context/LibraryAgentContext';
import { VoiceAgentIndicator } from './VoiceAgentIndicator';
import { TranscriptEntry } from '@/types/voice-agent';

interface LibraryAgentOverlayProps {
  onClose?: () => void;
}

export function LibraryAgentOverlay({ onClose }: LibraryAgentOverlayProps) {
  const {
    state,
    session,
    transcript,
    error,
    pendingNavigation,
    inputLevel,
    outputLevel,
    endSession,
    interrupt,
    confirmNavigation,
    cancelNavigation,
  } = useLibraryAgent();

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Don't render if no session
  if (!session) return null;

  const handleClose = () => {
    endSession();
    onClose?.();
  };

  const handleInterrupt = () => {
    if (state === 'speaking') {
      interrupt();
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'connecting':
        return 'Connecting...';
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Thinking...';
      case 'speaking':
        return 'Echo is speaking...';
      case 'tool_call':
        return 'Searching library...';
      case 'error':
        return error || 'An error occurred';
      default:
        return 'Ready';
    }
  };

  // Count tools available
  const toolCount = session.tools?.length || 0;

  // Library stats from context
  const libraryStats = session.context;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Library className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Echo Library Assistant</h2>
              <p className="text-xs text-gray-400">
                {libraryStats.totalPapers} papers, {libraryStats.totalNotes} notes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {toolCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs">
                <Wrench className="w-3 h-3" />
                {toolCount} tools
              </span>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="Close (Escape)"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation Confirmation */}
        {pendingNavigation && (
          <div className="px-6 py-4 bg-violet-500/10 border-b border-violet-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-violet-400" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Ready to open paper
                  </p>
                  <p className="text-xs text-gray-400">
                    Press Enter to navigate or continue talking
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelNavigation}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmNavigation}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-violet-500 text-white hover:bg-violet-600 transition-colors"
                >
                  Go
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Indicator */}
        <div className="flex flex-col items-center justify-center py-8 px-6">
          <VoiceAgentIndicator
            state={state}
            inputLevel={inputLevel}
            outputLevel={outputLevel}
            size="lg"
          />
          <p className="mt-4 text-sm text-gray-400">{getStatusText()}</p>

          {/* Interrupt button when speaking */}
          {state === 'speaking' && (
            <button
              onClick={handleInterrupt}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <StopCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">Interrupt</span>
            </button>
          )}
        </div>

        {/* Quick Stats */}
        {libraryStats.recentPapers.length > 0 && transcript.length === 0 && (
          <div className="px-6 py-3 border-t border-gray-800 bg-gray-800/30">
            <p className="text-xs text-gray-500 mb-2">Recent papers:</p>
            <div className="flex flex-wrap gap-2">
              {libraryStats.recentPapers.slice(0, 3).map((paper) => (
                <span
                  key={paper.paperId}
                  className="px-2 py-1 rounded bg-gray-800 text-xs text-gray-400 truncate max-w-[150px]"
                  title={paper.title}
                >
                  {paper.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Transcript */}
        {transcript.length > 0 && (
          <div className="border-t border-gray-800">
            <div className="px-4 py-2 bg-gray-800/50">
              <span className="text-xs font-medium text-gray-500 uppercase">Conversation</span>
            </div>
            <div className="max-h-48 overflow-y-auto px-4 py-3 space-y-3">
              {transcript.map((entry: TranscriptEntry) => (
                <TranscriptEntryItem key={entry.id} entry={entry} />
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && state === 'error' && (
          <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Footer with hints */}
        <div className="px-6 py-3 border-t border-gray-800 bg-gray-800/30">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">Escape</kbd> to close</span>
            {state === 'speaking' && (
              <span>Speak to interrupt</span>
            )}
            {state === 'tool_call' && (
              <span>Searching library...</span>
            )}
            {state === 'listening' && (
              <span>Try: "What papers do I have?"</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TranscriptEntryItem({ entry }: { entry: TranscriptEntry }) {
  const isUser = entry.role === 'user';
  const isTool = entry.role === 'tool';

  // Tool entries have a special style
  if (isTool) {
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs">
          <Wrench className="w-3 h-3" />
          <span>{entry.toolName || 'Tool'}</span>
          {entry.isFinal && <span className="text-cyan-300">completed</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%] px-3 py-2 rounded-lg text-sm
          ${isUser
            ? 'bg-violet-500/20 text-violet-100'
            : 'bg-gray-800 text-gray-200'
          }
          ${!entry.isFinal ? 'opacity-70' : ''}
        `}
      >
        <p>{entry.content}</p>
        {!entry.isFinal && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse" />
        )}
      </div>
    </div>
  );
}
