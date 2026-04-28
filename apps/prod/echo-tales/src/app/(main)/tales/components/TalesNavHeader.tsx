'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BRAND, ICONS, getTalesFeatures } from '@/lib/brand/constants';

function TalesFeatureDropdown({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const items = getTalesFeatures();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30`}
      >
        <span className="text-sm font-medium">Rooms</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item) => {
            const isActive = pathname === item.route || pathname?.startsWith(item.route + '/');
            return (
              <Link
                key={item.route}
                href={item.route}
                onClick={onToggle}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors ${
                  isActive ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
              >
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image
                    src={item.icon}
                    alt={item.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div>
                  <div className={`text-sm font-medium ${isActive ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TalesNavHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const pathname = usePathname();

  // Fetch real coin balance
  useEffect(() => {
    if (!isAuthenticated) return;

    fetch('/api/coins/balance', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCoinBalance(data.data.balance);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const isActive = (href: string) => pathname === href;

  const talesFeatures = getTalesFeatures();

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Tales Logo */}
          <Link href="/tales/home" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/icons/tales/echo-tales-logo.svg"
                alt={BRAND.hubs.tales.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-purple-900 dark:text-purple-100">{BRAND.hubs.tales.name}</h1>
              <p className="text-xs text-purple-500 dark:text-purple-400">{BRAND.hubs.tales.tagline}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/tales/home"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/tales/home')
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
            >
              <div className="relative w-5 h-5">
                <Image
                  src={ICONS.home}
                  alt="Home"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-medium">Home</span>
            </Link>

            <TalesFeatureDropdown
              isOpen={isDropdownOpen}
              onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  {(user.role === 'admin' || user.role === 'superadmin' || user.role === 'owner') && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <span>&#x2699;&#xFE0F;</span>
                      <span>Admin</span>
                    </Link>
                  )}

                  <Link href="/store" className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                    <span className="text-lg">&#x1FA99;</span>
                    <span className="font-semibold text-yellow-700 dark:text-yellow-300">{coinBalance ?? '...'}</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {user.name || user.email}
                    </span>
                    <button
                      onClick={logout}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 touch-feedback"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/tales/login"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/tales/register"
                    className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: Coin Badge */}
            {isAuthenticated && user && (
              <Link href="/store" className="flex sm:hidden items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                <span className="text-sm">&#x1FA99;</span>
                <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">{coinBalance ?? '...'}</span>
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg touch-feedback"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-purple-100 dark:border-purple-900/30 animate-in slide-in-from-top-2 duration-200">
            {/* Tales Rooms */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {talesFeatures.map((feature) => (
                <Link
                  key={feature.id}
                  href={feature.route}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <div className="relative w-8 h-8">
                    <Image
                      src={feature.icon}
                      alt={feature.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="text-xs font-medium text-center">{feature.name}</span>
                </Link>
              ))}
            </div>

            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <span className="text-lg">&#x1F464;</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {user.name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium touch-feedback"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/tales/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/tales/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center py-3 bg-purple-600 text-white rounded-lg text-sm font-medium touch-feedback"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
