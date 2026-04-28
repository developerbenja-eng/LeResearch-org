'use client';

import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { PaperContext } from '@/types/voice-agent';

interface VoiceAgentButtonProps {
  paperId: string;
  paperContext: PaperContext;
  className?: string;
}

export function VoiceAgentButton({
  paperId,
  paperContext,
  className = '',
}: VoiceAgentButtonProps) {
  const { state, session, startSession, endSession } = useVoiceAgent();

  const isActive = session !== null;
  const isLoading = state === 'connecting';

  const handleClick = async () => {
    if (isActive) {
      endSession();
    } else {
      try {
        await startSession(paperId, paperContext);
      } catch (error) {
        console.error('Failed to start voice agent:', error);
      }
    }
  };

  const getTooltip = () => {
    if (isLoading) return 'Connecting...';
    if (isActive) return 'End voice conversation (Escape)';
    return 'Ask Echo about this paper (Alt+V)';
  };

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (isActive) {
      return <MicOff className="w-4 h-4" />;
    }
    return <Mic className="w-4 h-4" />;
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={getTooltip()}
      aria-label={getTooltip()}
      data-testid="voice-agent-button"
      className={`
        relative flex items-center justify-center
        w-9 h-9 rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
        }
        ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
        disabled:opacity-50
        ${className}
      `}
    >
      {getIcon()}

      {/* Active indicator dot */}
      {isActive && !isLoading && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5">
          <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-75 animate-ping" />
          <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-red-500" />
        </span>
      )}
    </button>
  );
}
