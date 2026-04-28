'use client';

import { useState } from 'react';
import { QuickCapture } from './QuickCapture';
import type { UserNote, NoteType } from '@/types/notebook';

interface MyNotesProps {
  notes: UserNote[];
  onNotesChange: () => void;
}

export function MyNotes({ notes, onNotesChange }: MyNotesProps) {
  const [filter, setFilter] = useState<NoteType | 'all'>('all');
  const [showCapture, setShowCapture] = useState(false);

  const filteredNotes = notes.filter((note) => filter === 'all' || note.note_type === filter);
  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.is_pinned);
  const sortedNotes = [...pinnedNotes, ...unpinnedNotes];

  const filters: { value: NoteType | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'thought', label: 'Thoughts' },
    { value: 'book_idea', label: 'Book Ideas' },
    { value: 'insight', label: 'Insights' },
    { value: 'question', label: 'Questions' },
    { value: 'action', label: 'Actions' },
  ];

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;

    try {
      const response = await fetch(`/api/notebook/notes?id=${noteId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onNotesChange();
      }
    } catch (err) {
      console.error('[MyNotes] Error deleting note:', err);
    }
  };

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      const response = await fetch('/api/notebook/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: noteId, is_pinned: !currentPinned }),
      });
      if (response.ok) {
        onNotesChange();
      }
    } catch (err) {
      console.error('[MyNotes] Error toggling pin:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto">
          {filters.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap transition-all text-[10px] font-mono tracking-[0.2em] uppercase"
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
                {f.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowCapture(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5 shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(10,14,22,0.9) 100%)',
            border: '1px solid rgba(167,139,250,0.35)',
            color: 'rgba(230,220,255,0.95)',
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New note</span>
        </button>
      </div>

      {/* Notes Grid */}
      {sortedNotes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={() => handleDelete(note.id)}
              onTogglePin={() => handleTogglePin(note.id, note.is_pinned)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreateClick={() => setShowCapture(true)} />
      )}

      {/* Quick Capture Modal */}
      {showCapture && (
        <QuickCapture
          onClose={() => setShowCapture(false)}
          onSaved={() => {
            onNotesChange();
            setShowCapture(false);
          }}
        />
      )}
    </div>
  );
}

function NoteCard({
  note,
  onDelete,
  onTogglePin,
}: {
  note: UserNote;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const typeConfig: Record<NoteType, { label: string }> = {
    thought: { label: 'Thought' },
    book_idea: { label: 'Book Idea' },
    insight: { label: 'Insight' },
    question: { label: 'Question' },
    action: { label: 'Action' },
  };

  const config = typeConfig[note.note_type] || typeConfig.thought;
  const timeAgo = getTimeAgo(new Date(note.created_at));

  return (
    <div
      className="relative rounded-xl p-5 transition-all"
      style={{
        background:
          'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
        border: note.is_pinned ? '1px solid rgba(167,139,250,0.38)' : '1px solid rgba(167,139,250,0.18)',
        boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
      }}
    >
      <span
        className="absolute top-0 left-5 right-5 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
      />
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-[10px] font-mono tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border"
          style={{
            background: 'rgba(167,139,250,0.1)',
            borderColor: 'rgba(167,139,250,0.25)',
            color: 'rgba(201,178,255,0.85)',
          }}
        >
          {config.label}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePin}
            className="p-1.5 rounded-lg transition-colors"
            style={
              note.is_pinned
                ? { color: 'rgba(201,178,255,0.95)' }
                : { color: 'rgba(255,255,255,0.35)' }
            }
            title={note.is_pinned ? 'Unpin' : 'Pin'}
            aria-label={note.is_pinned ? 'Unpin' : 'Pin'}
          >
            <svg className="w-3.5 h-3.5" fill={note.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l14 14M12 3l2 6h7l-5.5 4 2 7-6-4.5L5.5 20l2-7L2 9h7z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-white/35 hover:text-white/75 rounded-lg transition-colors"
            title="Delete"
            aria-label="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {note.title && (
        <h4 className="text-base font-light text-white/90 leading-snug tracking-tight mb-2">{note.title}</h4>
      )}
      <p className="text-[13px] leading-relaxed text-white/55 font-light line-clamp-3">{note.content}</p>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono tracking-wider uppercase text-white/30">
        <span>{timeAgo}</span>
        {note.captured_topic && (
          <span className="px-2 py-0.5 rounded border border-white/10 text-white/45 truncate max-w-[140px] normal-case tracking-normal">
            {note.captured_topic}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div
      className="relative rounded-xl p-10 text-center overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(10,14,22,0.92) 55%, rgba(8,11,18,0.96) 100%)',
        border: '1px solid rgba(167,139,250,0.18)',
        boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)',
      }}
    >
      <span
        className="absolute top-0 left-5 right-5 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
      />
      <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-3">
        Notebook · Empty
      </p>
      <h3 className="text-xl md:text-2xl font-extralight tracking-tight text-white/90 mb-3">
        Your first note
      </h3>
      <p className="text-sm text-white/45 font-light max-w-md mx-auto mb-6 leading-relaxed">
        Capture thoughts, questions, and insights as the research unfolds.
      </p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-all hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(10,14,22,0.9) 100%)',
          border: '1px solid rgba(167,139,250,0.35)',
          color: 'rgba(230,220,255,0.95)',
        }}
      >
        Create your first note
      </button>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
