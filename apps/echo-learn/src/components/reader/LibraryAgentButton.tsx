'use client';

import React from 'react';
import { Mic, MicOff, Loader2, Library } from 'lucide-react';
import { useLibraryAgent } from '@/context/LibraryAgentContext';

interface LibraryAgentButtonProps {
  className?: string;
  variant?: 'icon' | 'full';
}

export function LibraryAgentButton({
  className = '',
  variant = 'icon',
}: LibraryAgentButtonProps) {
  const { state, session, startSession, endSession } = useLibraryAgent();

  const isActive = session !== null;
  const isLoading = state === 'connecting';

  const handleClick = async () => {
    if (isActive) {
      endSession();
    } else {
      try {
        await startSession();
      } catch (error) {
        console.error('Failed to start library agent:', error);
      }
    }
  };

  const getTooltip = () => {
    if (isLoading) return 'Connecting...';
    if (isActive) return 'End voice conversation (Escape)';
    return 'Ask Echo about your library (Alt+L)';
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

  if (variant === 'full') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        title={getTooltip()}
        aria-label={getTooltip()}
        data-testid="library-agent-button"
        className={`
          relative flex items-center gap-2 px-4 py-2 rounded-lg
          transition-all duration-200
          ${isActive
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
          }
          ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
          disabled:opacity-50
          ${className}
        `}
      >
        <Library className="w-4 h-4" />
        {getIcon()}
        <span className="text-sm font-medium">
          {isActive ? 'End Conversation' : 'Ask Echo'}
        </span>

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

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={getTooltip()}
      aria-label={getTooltip()}
      data-testid="library-agent-button"
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
