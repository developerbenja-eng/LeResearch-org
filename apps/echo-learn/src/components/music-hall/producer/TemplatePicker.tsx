'use client';

import { X, FileAudio } from 'lucide-react';
import { PROJECT_TEMPLATES, type ProjectTemplate } from '@/lib/audio/project-templates';

interface TemplatePickerProps {
  onSelect: (template: ProjectTemplate) => void;
  onBlank: () => void;
  onClose: () => void;
}

export function TemplatePicker({ onSelect, onBlank, onClose }: TemplatePickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-music-surface border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">New Project</h2>
            <p className="text-sm text-music-dim">Start from a template or blank canvas</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-music-dim hover:text-music-text rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Blank option */}
          <button
            onClick={onBlank}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/20 hover:border-cyan-500/40 hover:bg-white/[0.02] transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
              <FileAudio className="w-6 h-6 text-music-dim group-hover:text-cyan-400 transition-colors" />
            </div>
            <div>
              <div className="text-sm font-medium text-music-text">Blank Project</div>
              <div className="text-xs text-music-dim">Start from scratch with an empty canvas</div>
            </div>
          </button>

          {/* Template cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROJECT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="flex items-start gap-3 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-all text-left group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${template.color}20` }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: template.color }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-music-text">{template.name}</div>
                  <div className="text-xs text-music-dim mt-0.5">{template.description}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${template.color}15`, color: template.color }}
                    >
                      {template.genre}
                    </span>
                    <span className="text-[10px] text-music-dim">
                      {template.data.bpm} BPM
                    </span>
                    <span className="text-[10px] text-music-dim">
                      {template.data.bars.length} bars
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
