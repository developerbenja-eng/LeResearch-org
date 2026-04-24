'use client';

import React, { useEffect, useRef } from 'react';
import { Artifact, WordCloudConfig } from '@/types/canvas';

interface WordCloudVisualizationProps {
  artifact: Artifact;
  conversationId: string;
}

export function WordCloudVisualization({ artifact, conversationId }: WordCloudVisualizationProps) {
  const config = artifact.config as WordCloudConfig;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && config.words.length > 0) {
      drawWordCloud();
    }
  }, [config.words]);

  const drawWordCloud = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sort words by frequency
    const sortedWords = [...config.words].sort((a, b) => b.count - a.count);

    // Simple word cloud layout (spiral algorithm would be better, but this works for demo)
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    sortedWords.forEach((word, index) => {
      // Calculate font size based on frequency (scaled)
      const maxCount = sortedWords[0].count;
      const fontSize = Math.max(16, Math.min(72, (word.count / maxCount) * 60 + 20));

      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Color based on language
      if (word.language === 'es') {
        ctx.fillStyle = `rgba(147, 51, 234, ${0.6 + word.count / maxCount * 0.4})`; // Purple
      } else {
        ctx.fillStyle = `rgba(236, 72, 153, ${0.6 + word.count / maxCount * 0.4})`; // Pink
      }

      // Simple spiral placement
      const angle = index * 0.5;
      const radius = index * 15;
      x = centerX + Math.cos(angle) * radius;
      y = centerY + Math.sin(angle) * radius;

      ctx.fillText(word.text, x, y);
    });
  };

  if (config.words.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
        <p className="text-gray-500">No words to display yet</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{artifact.title}</h2>
        {artifact.description && <p className="text-gray-600">{artifact.description}</p>}
      </div>

      <div className="bg-white border rounded-xl overflow-hidden mb-6">
        <canvas ref={canvasRef} className="w-full h-auto" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-50 p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">Spanish Words</h3>
          <p className="text-3xl font-bold text-purple-600">
            {config.words.filter((w) => w.language === 'es').length}
          </p>
        </div>
        <div className="bg-pink-50 p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-pink-900 mb-2">English Words</h3>
          <p className="text-3xl font-bold text-pink-600">
            {config.words.filter((w) => w.language === 'en').length}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Words</h3>
        <div className="space-y-2">
          {config.words
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map((word, i) => (
              <div
                key={`${word.text}-${i}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-400">#{i + 1}</span>
                  <span className="font-medium text-gray-900">{word.text}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      word.language === 'es'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-pink-100 text-pink-700'
                    }`}
                  >
                    {word.language === 'es' ? 'ES' : 'EN'}
                  </span>
                </div>
                <span className="font-semibold text-gray-700">{word.count}×</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
