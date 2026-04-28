'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, StopCircle, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { VoiceAgentIndicator } from './VoiceAgentIndicator';
import { MermaidDiagram } from './MermaidDiagram';
import { TranscriptEntry, GeneratedDiagram } from '@/types/voice-agent';

interface VoiceAgentOverlayProps {
  onClose?: () => void;
}

export function VoiceAgentOverlay({ onClose }: VoiceAgentOverlayProps) {
  const {
    state,
    session,
    transcript,
    diagrams,
    error,
    inputLevel,
    outputLevel,
    endSession,
    interrupt,
  } = useVoiceAgent();

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [showDiagrams, setShowDiagrams] = useState(true);
  const [selectedDiagram, setSelectedDiagram] = useState<GeneratedDiagram | null>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Auto-show diagrams panel when new diagram is added
  useEffect(() => {
    if (diagrams.length > 0) {
      setShowDiagrams(true);
    }
  }, [diagrams.length]);

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
        return 'Looking up information...';
      case 'error':
        return error || 'An error occurred';
      default:
        return 'Ready';
    }
  };

  // Count tools available
  const toolCount = session.tools?.length || 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-lg mx-4 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Mic className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Echo Voice Assistant</h2>
                <p className="text-xs text-gray-400 truncate max-w-[200px]">
                  {session.paperTitle}
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

          {/* Diagrams Section */}
          {diagrams.length > 0 && (
            <div className="border-t border-gray-800">
              <button
                onClick={() => setShowDiagrams(!showDiagrams)}
                className="w-full px-4 py-2 bg-violet-500/10 flex items-center justify-between hover:bg-violet-500/20 transition-colors"
              >
                <span className="text-xs font-medium text-violet-400 uppercase">
                  Generated Diagrams ({diagrams.length})
                </span>
                {showDiagrams ? (
                  <ChevronUp className="w-4 h-4 text-violet-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-violet-400" />
                )}
              </button>
              {showDiagrams && (
                <div className="px-4 py-3 space-y-2 max-h-40 overflow-y-auto">
                  {diagrams.map((diagram) => (
                    <button
                      key={diagram.id}
                      onClick={() => setSelectedDiagram(diagram)}
                      className="w-full p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white truncate">
                          {diagram.concept}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {diagram.diagramType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {diagram.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Transcript */}
          {transcript.length > 0 && (
            <div className="border-t border-gray-800">
              <div className="px-4 py-2 bg-gray-800/50">
                <span className="text-xs font-medium text-gray-500 uppercase">Conversation</span>
              </div>
              <div className="max-h-48 overflow-y-auto px-4 py-3 space-y-3">
                {transcript.map((entry) => (
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
                <span>Searching paper...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full diagram modal */}
      {selectedDiagram && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90">
          <MermaidDiagram
            code={selectedDiagram.mermaidCode}
            title={selectedDiagram.concept}
            description={selectedDiagram.description}
            onClose={() => setSelectedDiagram(null)}
            className="max-w-4xl w-full max-h-[90vh]"
          />
        </div>
      )}
    </>
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
