'use client';

import { useState } from 'react';
import type { NoteType, NoteCreateRequest } from '@/types/notebook';

interface QuickCaptureProps {
  onClose: () => void;
  onSaved: () => void;
  initialTopic?: string;
  initialContext?: string;
}

export function QuickCapture({
  onClose,
  onSaved,
  initialTopic,
  initialContext,
}: QuickCaptureProps) {
  const [noteType, setNoteType] = useState<NoteType>('thought');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noteTypes: { value: NoteType; label: string; placeholder: string }[] = [
    { value: 'thought', label: 'Thought', placeholder: 'What\'s on your mind…' },
    { value: 'book_idea', label: 'Book Idea', placeholder: 'A story concept for your child…' },
    { value: 'insight', label: 'Insight', placeholder: 'Something you learned…' },
    { value: 'question', label: 'Question', placeholder: 'Something to explore further…' },
    { value: 'action', label: 'Action', placeholder: 'Something to try…' },
  ];

  const currentType = noteTypes.find((t) => t.value === noteType) || noteTypes[0];

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const request: NoteCreateRequest = {
        note_type: noteType,
        content: content.trim(),
        title: title.trim() || undefined,
        captured_topic: initialTopic,
        captured_context: initialContext,
      };

      const response = await fetch('/api/notebook/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      onSaved();
    } catch (err) {
      console.error('[QuickCapture] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(10,14,22,0.96) 55%, rgba(8,11,18,0.98) 100%)',
          border: '1px solid rgba(167,139,250,0.25)',
          boxShadow: '0 24px 64px -16px rgba(0,0,0,0.7)',
        }}
      >
        <span
          className="absolute top-0 left-6 right-6 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
        />
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-1">
              Capture
            </p>
            <h3 className="text-lg font-extralight tracking-tight text-white/90">Quick note</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Note Type Selector */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-2">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {noteTypes.map((type) => {
                const active = noteType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => setNoteType(type.value)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase transition-all"
                    style={
                      active
                        ? {
                            background: 'rgba(167,139,250,0.15)',
                            borderColor: 'rgba(167,139,250,0.45)',
                            color: 'rgba(230,220,255,0.95)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.02)',
                            borderColor: 'rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.45)',
                          }
                    }
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title (optional) */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-2">
              Title <span className="text-white/25 normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your note a title…"
              className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={currentType.placeholder}
              rows={4}
              className="w-full px-3 py-2.5 text-sm font-light text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-purple-400/40 focus:bg-white/[0.05] transition-colors resize-none"
            />
          </div>

          {/* Context indicator */}
          {initialTopic && (
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-white/45">
              <svg className="w-3.5 h-3.5 text-purple-300/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Linked to: <span className="text-white/70">{initialTopic}</span></span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg text-sm font-light" style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', color: 'rgba(254,205,211,0.95)' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-5 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[11px] font-mono tracking-[0.2em] uppercase text-white/50 border border-white/10 rounded-full hover:text-white/85 hover:border-white/25 bg-white/[0.02] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(10,14,22,0.9) 100%)',
              border: '1px solid rgba(167,139,250,0.35)',
              color: 'rgba(230,220,255,0.95)',
            }}
          >
            {isSaving ? 'Saving…' : 'Save note'}
          </button>
        </div>
      </div>
    </div>
  );
}
