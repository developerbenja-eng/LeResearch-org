'use client';

import React from 'react';
import { Mic, Volume2, Loader2, Wrench } from 'lucide-react';
import { VoiceAgentState } from '@/types/voice-agent';

interface VoiceAgentIndicatorProps {
  state: VoiceAgentState;
  inputLevel?: number;   // 0-1
  outputLevel?: number;  // 0-1
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VoiceAgentIndicator({
  state,
  inputLevel = 0,
  outputLevel = 0,
  size = 'md',
  className = '',
}: VoiceAgentIndicatorProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const getStateStyles = () => {
    switch (state) {
      case 'listening':
        return {
          bgColor: 'bg-violet-500/20',
          ringColor: 'ring-violet-500',
          iconColor: 'text-violet-400',
          icon: <Mic className={iconSizes[size]} />,
          pulse: true,
          level: inputLevel,
        };
      case 'processing':
        return {
          bgColor: 'bg-amber-500/20',
          ringColor: 'ring-amber-500',
          iconColor: 'text-amber-400',
          icon: <Loader2 className={`${iconSizes[size]} animate-spin`} />,
          pulse: false,
          level: 0,
        };
      case 'tool_call':
        return {
          bgColor: 'bg-cyan-500/20',
          ringColor: 'ring-cyan-500',
          iconColor: 'text-cyan-400',
          icon: <Wrench className={`${iconSizes[size]} animate-pulse`} />,
          pulse: true,
          level: 0.5,
        };
      case 'speaking':
        return {
          bgColor: 'bg-emerald-500/20',
          ringColor: 'ring-emerald-500',
          iconColor: 'text-emerald-400',
          icon: <Volume2 className={iconSizes[size]} />,
          pulse: true,
          level: outputLevel,
        };
      case 'connecting':
        return {
          bgColor: 'bg-blue-500/20',
          ringColor: 'ring-blue-500',
          iconColor: 'text-blue-400',
          icon: <Loader2 className={`${iconSizes[size]} animate-spin`} />,
          pulse: false,
          level: 0,
        };
      case 'error':
        return {
          bgColor: 'bg-red-500/20',
          ringColor: 'ring-red-500',
          iconColor: 'text-red-400',
          icon: <Mic className={iconSizes[size]} />,
          pulse: false,
          level: 0,
        };
      default:
        return {
          bgColor: 'bg-gray-500/20',
          ringColor: 'ring-gray-500',
          iconColor: 'text-gray-400',
          icon: <Mic className={iconSizes[size]} />,
          pulse: false,
          level: 0,
        };
    }
  };

  const styles = getStateStyles();
  const ringScale = 1 + styles.level * 0.3; // Scale ring based on audio level

  return (
    <div
      className={`
        relative flex items-center justify-center
        ${sizeClasses[size]} rounded-full
        ${styles.bgColor}
        transition-all duration-150
        ${className}
      `}
    >
      {/* Animated ring for audio level */}
      {styles.pulse && (
        <div
          className={`
            absolute inset-0 rounded-full ring-2 ${styles.ringColor}
            opacity-50 transition-transform duration-75
          `}
          style={{ transform: `scale(${ringScale})` }}
        />
      )}

      {/* Pulsing background for listening/speaking */}
      {styles.pulse && styles.level > 0.1 && (
        <div
          className={`
            absolute inset-0 rounded-full ${styles.bgColor}
            animate-pulse
          `}
        />
      )}

      {/* Icon */}
      <div className={`relative z-10 ${styles.iconColor}`}>
        {styles.icon}
      </div>
    </div>
  );
}

// Waveform visualization for more detailed feedback
export function VoiceAgentWaveform({
  level,
  bars = 5,
  className = '',
}: {
  level: number;
  bars?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-0.5 h-6 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => {
        // Create a wave effect with phase offset
        const phase = (i / bars) * Math.PI;
        const height = Math.max(0.2, Math.sin(Date.now() / 200 + phase) * 0.3 + level * 0.7);

        return (
          <div
            key={i}
            className="w-1 bg-current rounded-full transition-all duration-75"
            style={{ height: `${height * 100}%` }}
          />
        );
      })}
    </div>
  );
}
