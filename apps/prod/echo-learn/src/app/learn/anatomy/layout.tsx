'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AnatomyLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/learn/anatomy', label: 'Home', icon: '🏠' },
  { href: '/learn/anatomy/explorer', label: 'Explorer', icon: '🔬' },
  { href: '/learn/anatomy/systems', label: 'Systems', icon: '🫀' },
  { href: '/learn/anatomy/quiz', label: 'Quiz', icon: '📝' },
  { href: '/learn/anatomy/review', label: 'Review', icon: '🔄' },
  { href: '/learn/anatomy/journey', label: 'Journeys', icon: '🗺️' },
];

export default function AnatomyLayout({ children }: AnatomyLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* CSS Variables for anatomy theme */}
      <style jsx global>{`
        :root {
          --anatomy-bg: #0f172a;
          --anatomy-surface: #1e293b;
          --anatomy-border: #334155;
          --anatomy-text: #f1f5f9;
          --anatomy-text-muted: #94a3b8;
          --anatomy-primary: #3b82f6;
          --anatomy-secondary: #22c55e;
          --anatomy-accent: #f59e0b;
          --anatomy-error: #ef4444;

          /* System colors */
          --system-skeletal: #f5f5f4;
          --system-muscular: #dc2626;
          --system-nervous: #fbbf24;
          --system-cardiovascular: #b91c1c;
          --system-respiratory: #60a5fa;
          --system-digestive: #84cc16;
          --system-urinary: #fcd34d;
          --system-endocrine: #c084fc;
          --system-lymphatic: #4ade80;
          --system-integumentary: #fbbf24;
          --system-reproductive: #f472b6;
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/learn/anatomy" className="flex items-center gap-2 font-semibold text-lg">
              <span className="text-2xl">🦴</span>
              <span>Anatomy Hall</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/learn/anatomy' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="mr-1.5" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-slate-400 hover:text-slate-200" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden py-2 border-t border-slate-800">
            <div className="flex flex-wrap gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/learn/anatomy' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3 py-1.5 rounded text-sm ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-slate-400'
                    }`}
                  >
                    <span aria-hidden="true">{item.icon}</span> {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
