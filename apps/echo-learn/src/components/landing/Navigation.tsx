'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/lib/brand/constants';
import { EchoLearnLogo } from '@/components/brand/EchoLearnLogo';
import { authUrls, useAuth } from '@/context/AuthContext';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const urls = authUrls();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white">
            <EchoLearnLogo size={40} className="drop-shadow-lg" />
            <div className="hidden sm:block">
              <span className="text-xl font-bold">{BRAND.name}</span>
              <span className="block text-xs text-white/70">{BRAND.tagline}</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/lingua" className="text-white/80 hover:text-white transition-colors">
              Lingua
            </Link>
            <Link href="/reader/library" className="text-white/80 hover:text-white transition-colors">
              Reader
            </Link>
            <Link href="/sophia" className="text-white/80 hover:text-white transition-colors">
              Sophia
            </Link>
            <Link href="/our-story" className="text-white/80 hover:text-white transition-colors">
              Our Story
            </Link>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <Button
                variant="ghost"
                onClick={logout}
                className="text-white hover:bg-white/10"
              >
                Sign out
              </Button>
            ) : (
              <>
                <a href={urls.login}>
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </a>
                <a href={urls.register}>
                  <Button variant="secondary">Get Started</Button>
                </a>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-white/20">
            <div className="flex flex-col gap-4">
              <Link
                href="/lingua"
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Lingua
              </Link>
              <Link
                href="/reader/library"
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Reader
              </Link>
              <Link
                href="/sophia"
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sophia
              </Link>
              <Link
                href="/our-story"
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Our Story
              </Link>
              <div className="flex gap-2">
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="w-full text-white hover:bg-white/10"
                  >
                    Sign out
                  </Button>
                ) : (
                  <>
                    <a href={urls.login} className="flex-1">
                      <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                        Sign In
                      </Button>
                    </a>
                    <a href={urls.register} className="flex-1">
                      <Button variant="secondary" className="w-full">
                        Get Started
                      </Button>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
