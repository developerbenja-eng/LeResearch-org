'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Play, Pause, Download, Loader2 } from 'lucide-react';
import { useReader } from '@/context/ReaderContext';
import { TextWithInlineReferences } from './TextWithInlineReferences';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type {
  ReaderSection,
  ReaderReference,
  ReaderFigure,
  ReaderTable,
  ReaderFormula,
  SectionType,
  EnrichedReference,
} from '@/types/reader';

interface SectionContentProps {
  section: ReaderSection;
  isActive: boolean;
  references?: ReaderReference[];
  figures?: ReaderFigure[];
  tables?: ReaderTable[];
  formulas?: ReaderFormula[];
  paperId?: string;
  onEnrichReference?: (refId: string) => Promise<EnrichedReference | null>;
  onViewFigure?: (figureId: string) => void;
  onViewTable?: (tableId: string) => void;
}

const sectionTypeColors: Record<SectionType | 'default', string> = {
  abstract: 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10',
  introduction: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10',
  methods: 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10',
  results: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10',
  discussion: 'border-l-pink-500 bg-pink-50/50 dark:bg-pink-900/10',
  conclusions: 'border-l-violet-500 bg-violet-50/50 dark:bg-violet-900/10',
  references: 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/10',
  acknowledgments: 'border-l-teal-500 bg-teal-50/50 dark:bg-teal-900/10',
  supplementary: 'border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10',
  other: 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/10',
  default: 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/10',
};

export default function SectionContent({
  section,
  isActive,
  references = [],
  figures = [],
  tables = [],
  formulas = [],
  paperId,
  onEnrichReference,
  onViewFigure,
  onViewTable,
}: SectionContentProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { playSection, togglePlay, isPlaying, isLoading, currentSectionIndex, sections } = useReader();

  const sectionIndex = sections.findIndex(s => s.section_id === section.section_id);
  const isCurrentSection = sectionIndex === currentSectionIndex;
  const isCurrentlyPlaying = isCurrentSection && isPlaying;
  const colorClass = sectionTypeColors[section.section_type] || sectionTypeColors.default;

  const handleDownloadAudio = async () => {
    setIsDownloading(true);
    try {
      // If audio_url exists, download directly
      if (section.audio_url) {
        const link = document.createElement('a');
        link.href = section.audio_url;
        link.download = `${section.section_name.replace(/[^a-z0-9]/gi, '_')}.mp3`;
        link.click();
        setIsDownloading(false);
        return;
      }

      // Generate audio via TTS endpoint
      if (!paperId) {
        setIsDownloading(false);
        return;
      }

      // First, generate the audio
      const response = await fetch(`/api/reader/papers/${paperId}/sections/${section.section_id}/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'edge',
          skipCitations: true,
          skipFootnotes: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audio_url) {
          // Download the generated audio
          const link = document.createElement('a');
          link.href = data.audio_url;
          link.download = `${section.section_name.replace(/[^a-z0-9]/gi, '_')}.mp3`;
          link.click();
        }
      } else {
        console.error('Failed to generate audio:', await response.text());
      }
    } catch (error) {
      console.error('Failed to download audio:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (isActive && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isActive]);

  const handlePlayClick = () => {
    if (isCurrentSection) {
      togglePlay();
    } else {
      playSection(section);
    }
  };

  // Check if we have any reference data to enable inline references
  const hasReferenceData = references.length > 0 || figures.length > 0 || tables.length > 0 || formulas.length > 0;

  // Detect if content contains markdown syntax
  const isMarkdownContent = useMemo(() => {
    const content = section.content;
    // Check for common markdown patterns
    return /(?:^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s|\*\*.+\*\*|`.+`|\[.+\]\(.+\)|^>\s|^\|.+\|)/m.test(content);
  }, [section.content]);

  // Markdown component overrides for reader theme
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markdownComponents: any = useMemo(() => ({
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-xl font-bold mt-5 mb-2 text-gray-900 dark:text-white">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">{children}</h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-4 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-purple-500/50 bg-purple-50/50 dark:bg-purple-900/10 pl-4 pr-3 py-2 my-4 rounded-r-lg italic text-gray-600 dark:text-gray-400">
        {children}
      </blockquote>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside space-y-1 my-3 ml-2 text-gray-700 dark:text-gray-300">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside space-y-1 my-3 ml-2 text-gray-700 dark:text-gray-300">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-gray-700 dark:text-gray-300">{children}</li>
    ),
    code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400 text-sm font-mono">
            {children}
          </code>
        );
      }
      return (
        <code className={`block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200 ${className}`}>
          {children}
        </code>
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="my-4">{children}</pre>
    ),
    a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-600 underline underline-offset-2 transition-colors">
        {children}
      </a>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{children}</thead>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700">{children}</th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">{children}</td>
    ),
    hr: () => <hr className="my-6 border-t border-gray-200 dark:border-gray-700" />,
  }), []);

  // Format content with paragraphs and interactive inline references
  const formattedContent = isMarkdownContent ? (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {section.content}
    </ReactMarkdown>
  ) : (
    section.content
      .split(/\n\n+/)
      .filter(p => p.trim())
      .map((paragraph, index) => (
        <p key={index} className="mb-4 last:mb-0">
          {hasReferenceData && paperId ? (
            <TextWithInlineReferences
              text={paragraph}
              figures={figures}
              tables={tables}
              formulas={formulas}
              references={references}
              paperId={paperId}
              onEnrichReference={onEnrichReference}
              onViewFigure={onViewFigure}
              onViewTable={onViewTable}
            />
          ) : (
            paragraph
          )}
        </p>
      ))
  );

  return (
    <div
      ref={sectionRef}
      id={`section-${section.section_id}`}
      className={`rounded-xl border-l-4 ${colorClass} ${
        isActive ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-950' : ''
      } transition-all`}
    >
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {section.section_name}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {section.section_type}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Download button */}
          <button
            onClick={handleDownloadAudio}
            disabled={isDownloading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Download audio"
          >
            {isDownloading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
          </button>

          {/* Play button */}
          <button
            onClick={handlePlayClick}
            disabled={isLoading && isCurrentSection}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isCurrentlyPlaying
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {isLoading && isCurrentSection ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isCurrentlyPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="ml-0.5" />
            )}
            <span className="text-sm font-medium">
              {isCurrentlyPlaying ? 'Pause' : 'Listen'}
            </span>
          </button>
        </div>
      </div>

      {/* Section content */}
      <div className="px-6 py-4" data-reader-content>
        <div className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
          {formattedContent}
        </div>
      </div>
    </div>
  );
}
