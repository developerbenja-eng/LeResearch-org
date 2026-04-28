'use client';

import { useMemo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

interface ResearchMarkdownViewerProps {
  content: string;
  onHeadingsExtracted?: (headings: { id: string; text: string; level: number }[]) => void;
}

export default function ResearchMarkdownViewer({
  content,
  onHeadingsExtracted
}: ResearchMarkdownViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Extract headings for TOC
  useEffect(() => {
    if (!onHeadingsExtracted) return;

    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const headings: { id: string; text: string; level: number }[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, '').replace(/\*/g, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      headings.push({ id, text, level });
    }

    onHeadingsExtracted(headings);
  }, [content, onHeadingsExtracted]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const components: any = useMemo(() => ({
    // Headings with IDs for scroll-to
    h1: ({ children }: { children?: React.ReactNode }) => {
      const text = String(children);
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return (
        <motion.h1
          id={id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mt-12 mb-6 text-white scroll-mt-24 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          {children}
        </motion.h1>
      );
    },
    h2: ({ children }: { children?: React.ReactNode }) => {
      const text = String(children);
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return (
        <motion.h2
          id={id}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold mt-10 mb-4 text-white scroll-mt-24 border-l-4 border-purple-500 pl-4"
        >
          {children}
        </motion.h2>
      );
    },
    h3: ({ children }: { children?: React.ReactNode }) => {
      const text = String(children);
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return (
        <motion.h3
          id={id}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-xl font-semibold mt-8 mb-3 text-neutral-200 scroll-mt-24"
        >
          {children}
        </motion.h3>
      );
    },
    // Paragraphs
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-neutral-300 leading-relaxed mb-4 text-[16px]">
        {children}
      </p>
    ),
    // Blockquotes - styled as academic quotes
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <motion.blockquote
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="border-l-4 border-purple-500/50 bg-purple-500/5 pl-6 pr-4 py-4 my-6 rounded-r-lg italic text-neutral-300"
      >
        {children}
      </motion.blockquote>
    ),
    // Tables - styled for academic data
    table: ({ children }: { children?: React.ReactNode }) => (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="my-6 overflow-x-auto rounded-xl border border-neutral-800"
      >
        <table className="w-full text-sm">
          {children}
        </table>
      </motion.div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="bg-neutral-800/80 text-neutral-200">
        {children}
      </thead>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-4 py-3 text-left font-semibold border-b border-neutral-700">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-4 py-3 border-b border-neutral-800/50 text-neutral-300">
        {children}
      </td>
    ),
    tr: ({ children }: { children?: React.ReactNode }) => (
      <tr className="hover:bg-neutral-800/30 transition-colors">
        {children}
      </tr>
    ),
    // Lists
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-none space-y-2 my-4 ml-4">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside space-y-2 my-4 ml-4 text-neutral-300">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-neutral-300 flex items-start gap-2">
        <span className="text-purple-400 mt-1.5 text-xs">●</span>
        <span className="flex-1">{children}</span>
      </li>
    ),
    // Code blocks
    code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-purple-300 text-sm font-mono">
            {children}
          </code>
        );
      }
      return (
        <code className={`block bg-neutral-900 p-4 rounded-lg overflow-x-auto text-sm font-mono text-neutral-300 ${className}`}>
          {children}
        </code>
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="my-4">
        {children}
      </pre>
    ),
    // Links
    a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),
    // Strong/Bold
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-white">
        {children}
      </strong>
    ),
    // Emphasis/Italic
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic text-neutral-200">
        {children}
      </em>
    ),
    // Horizontal rule
    hr: () => (
      <motion.hr
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        className="my-8 border-t border-neutral-800 origin-left"
      />
    ),
  }), []);

  return (
    <div ref={contentRef} className="research-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
