'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Download, Copy, Check, X, Maximize2, Minimize2 } from 'lucide-react';

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#8b5cf6',
    primaryTextColor: '#f3f4f6',
    primaryBorderColor: '#6d28d9',
    lineColor: '#9ca3af',
    secondaryColor: '#1f2937',
    tertiaryColor: '#374151',
    background: '#111827',
    mainBkg: '#1f2937',
    nodeBorder: '#6d28d9',
    clusterBkg: '#374151',
    clusterBorder: '#4b5563',
    titleColor: '#f9fafb',
    edgeLabelBackground: '#1f2937',
  },
  flowchart: {
    curve: 'basis',
    padding: 20,
  },
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
});

interface MermaidDiagramProps {
  code: string;
  title?: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export function MermaidDiagram({
  code,
  title,
  description,
  onClose,
  className = '',
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code || !containerRef.current) return;

      try {
        // Generate unique ID for this diagram
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Clean the code (remove markdown code blocks if present)
        let cleanCode = code.trim();
        if (cleanCode.startsWith('```')) {
          cleanCode = cleanCode.replace(/^```(?:mermaid)?\n?/, '').replace(/\n?```$/, '');
        }

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, cleanCode);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error('[MermaidDiagram] Render error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        setSvg('');
      }
    };

    renderDiagram();
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!svg) return;

    // Create a blob and download
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'diagram'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className={`bg-red-500/10 border border-red-500/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-400">Diagram Error</span>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-red-500/20 rounded">
              <X className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
        <p className="text-xs text-red-300">{error}</p>
        <details className="mt-2">
          <summary className="text-xs text-gray-400 cursor-pointer">Show code</summary>
          <pre className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-300 overflow-x-auto">
            {code}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-gray-900 border border-gray-700 rounded-lg overflow-hidden
        ${isExpanded ? 'fixed inset-4 z-50' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-medium text-white truncate">{title}</h4>
          )}
          {description && (
            <p className="text-xs text-gray-400 truncate">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            title="Copy Mermaid code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            title="Download SVG"
            disabled={!svg}
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-gray-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Diagram */}
      <div
        ref={containerRef}
        className={`
          flex items-center justify-center p-4 overflow-auto
          ${isExpanded ? 'h-[calc(100%-3rem)]' : 'max-h-80'}
        `}
      >
        {svg ? (
          <div
            className="mermaid-diagram"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
          </div>
        )}
      </div>

      {/* Expanded backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/60 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}

// Inline diagram for transcript entries (smaller, simpler)
export function InlineMermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>('');
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    const render = async () => {
      try {
        const id = `inline-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        let cleanCode = code.trim();
        if (cleanCode.startsWith('```')) {
          cleanCode = cleanCode.replace(/^```(?:mermaid)?\n?/, '').replace(/\n?```$/, '');
        }
        const { svg: renderedSvg } = await mermaid.render(id, cleanCode);
        setSvg(renderedSvg);
      } catch {
        setSvg('');
      }
    };
    render();
  }, [code]);

  if (!svg) return null;

  return (
    <>
      <button
        onClick={() => setShowFull(true)}
        className="mt-2 w-full p-2 bg-gray-900/50 rounded border border-gray-700 hover:border-violet-500/50 transition-colors"
      >
        <div
          className="max-h-24 overflow-hidden opacity-80"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="text-xs text-violet-400 mt-1">Click to expand</p>
      </button>

      {showFull && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <MermaidDiagram
            code={code}
            title="Generated Diagram"
            onClose={() => setShowFull(false)}
            className="max-w-4xl w-full"
          />
        </div>
      )}
    </>
  );
}
