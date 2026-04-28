'use client';

import type { LucideIcon } from 'lucide-react';

interface ConceptCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export function ConceptCard({ title, description, icon: Icon, color }: ConceptCardProps) {
  return (
    <div className="bg-music-surface rounded-xl p-5 border border-white/10">
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-music-text mb-1">{title}</h3>
          <p className="text-xs text-music-dim leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
