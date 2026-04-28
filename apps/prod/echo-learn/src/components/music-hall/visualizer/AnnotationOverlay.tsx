'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Annotation } from '@/types/visualizer';

interface AnnotationOverlayProps {
  annotations: Annotation[];
}

export function AnnotationOverlay({ annotations }: AnnotationOverlayProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {annotations.map((annotation) => (
        <div
          key={annotation.id}
          className="absolute pointer-events-auto"
          style={{
            left: `${annotation.x * 100}%`,
            top: `${annotation.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Dot */}
          <button
            onClick={() => setExpandedId(expandedId === annotation.id ? null : annotation.id)}
            className="relative z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-125"
            style={{
              borderColor: annotation.color,
              backgroundColor: `${annotation.color}30`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: annotation.color }}
            />
          </button>

          {/* Label */}
          <AnimatePresence>
            {expandedId === annotation.id ? (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute top-7 left-1/2 -translate-x-1/2 z-20 w-56"
              >
                <div
                  className="rounded-lg p-3 text-xs shadow-lg border"
                  style={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    borderColor: `${annotation.color}40`,
                  }}
                >
                  <p className="font-medium text-white mb-1">{annotation.text}</p>
                  {annotation.detail && (
                    <p className="text-white/60 leading-relaxed">{annotation.detail}</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
              >
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    color: annotation.color,
                    backgroundColor: `${annotation.color}15`,
                  }}
                >
                  {annotation.text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
