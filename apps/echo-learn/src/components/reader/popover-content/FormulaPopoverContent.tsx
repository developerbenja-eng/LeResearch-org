'use client';

import { useState } from 'react';
import { Sigma, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import type { ReaderFormula } from '@/types/reader';

interface FormulaPopoverContentProps {
  formula: ReaderFormula;
  paperId: string;
}

export function FormulaPopoverContent({ formula, paperId }: FormulaPopoverContentProps) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(formula.ai_explanation);

  const copyLatex = async () => {
    await navigator.clipboard.writeText(formula.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateAIExplanation = async () => {
    if (aiExplanation || isGeneratingAI) return;

    setIsGeneratingAI(true);
    try {
      const response = await fetch(`/api/reader/papers/${paperId}/describe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'formula',
          itemId: formula.id,
          content: formula.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiExplanation(data.description);
      }
    } catch (error) {
      console.error('Failed to generate AI explanation:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Clean up LaTeX content for display
  const displayContent = formula.content
    .replace(/^\$+|\$+$/g, '') // Remove surrounding $ signs
    .trim();

  // Check if it's inline math or display math
  const isDisplayMath = formula.content.includes('\\begin{') ||
                        formula.content.includes('\\[') ||
                        formula.content.startsWith('$$');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sigma className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            Equation {formula.label || `#${formula.formula_order}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {formula.page_number && (
            <span className="text-xs text-gray-500">Page {formula.page_number}</span>
          )}
          <button
            onClick={copyLatex}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-600 transition-colors"
            title="Copy LaTeX"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Formula Display */}
      <div className={`bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 ${isDisplayMath ? 'text-center' : ''}`}>
        <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
          {displayContent}
        </code>
      </div>

      {/* LaTeX hint */}
      <p className="text-xs text-gray-500 italic">
        LaTeX formula - copy to render in your preferred editor
      </p>

      {/* AI Explanation */}
      {aiExplanation ? (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">AI Explanation</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {aiExplanation}
          </p>
        </div>
      ) : (
        <button
          onClick={generateAIExplanation}
          disabled={isGeneratingAI}
          className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
        >
          {isGeneratingAI ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating explanation...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              Explain this equation
            </>
          )}
        </button>
      )}
    </div>
  );
}
