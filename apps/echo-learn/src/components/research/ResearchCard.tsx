'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  Briefcase,
  Radio,
  TrendingUp,
  Leaf,
  Factory,
  BookOpen,
  Clock,
  ArrowRight
} from 'lucide-react';

export interface ResearchTimeline {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: 'education' | 'social' | 'employment' | 'communication' | 'markets' | 'environment' | 'industrial';
  color: string;
  scholars: string[];
  lastUpdated: string;
}

const iconMap = {
  education: GraduationCap,
  social: Users,
  employment: Briefcase,
  communication: Radio,
  markets: TrendingUp,
  environment: Leaf,
  industrial: Factory,
};

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20'
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20'
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20'
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/20'
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20'
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    glow: 'shadow-green-500/20'
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    glow: 'shadow-orange-500/20'
  },
};

interface ResearchCardProps {
  timeline: ResearchTimeline;
  index: number;
  onSelect: (id: string) => void;
  isSelected?: boolean;
}

export default function ResearchCard({
  timeline,
  index,
  onSelect,
  isSelected = false
}: ResearchCardProps) {
  const Icon = iconMap[timeline.icon] || BookOpen;
  const colors = colorMap[timeline.color] || colorMap.purple;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(timeline.id)}
      className={`
        relative w-full text-left p-6 rounded-2xl border transition-all duration-300
        ${isSelected
          ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
          : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
        }
      `}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${colors.bg}`} />

      <div className="relative z-10">
        {/* Icon and Title */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
            >
              Selected
            </motion.div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-1">{timeline.title}</h3>
        <p className={`text-sm ${colors.text} mb-3`}>{timeline.subtitle}</p>

        {/* Description */}
        <p className="text-sm text-neutral-400 line-clamp-2 mb-4">
          {timeline.description}
        </p>

        {/* Scholars */}
        <div className="flex flex-wrap gap-1 mb-4">
          {timeline.scholars.slice(0, 3).map((scholar) => (
            <span
              key={scholar}
              className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-400"
            >
              {scholar}
            </span>
          ))}
          {timeline.scholars.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-500">
              +{timeline.scholars.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Updated {timeline.lastUpdated}</span>
          </div>
          <div className={`flex items-center gap-1 ${colors.text}`}>
            <span>Read</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
