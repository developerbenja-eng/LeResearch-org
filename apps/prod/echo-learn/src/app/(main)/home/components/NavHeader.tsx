'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BRAND, ICONS, getTalesFeatures, getLearnFeatures } from '@/lib/brand/constants';

interface DropdownProps {
  label: string;
  items: Array<{ name: string; description: string; route: string; icon: string }>;
  isOpen: boolean;
  onToggle: () => void;
  colorClass: string;
}

function HubDropdown({ label, items, isOpen, onToggle, colorClass }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const isHubActive = items.some(item => pathname === item.route || pathname?.startsWith(item.route + '/'));

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
          isHubActive
            ? colorClass === 'purple' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
              : colorClass === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <span className="text-sm font-medium">{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200" role="menu">
          {items.map((item) => {
            const isActive = pathname === item.route || pathname?.startsWith(item.route + '/');
            return (
              <Link
                key={item.route}
                href={item.route}
                onClick={onToggle}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  isActive ? 'bg-purple-50 dark:bg-purple-900/30' : ''
                }`}
                role="menuitem"
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
                  <div className={`text-sm font-medium ${isActive ? 'text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
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

export function NavHeader() {
  const { user, logout, isAuthenticated, hasHubAccess } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'tales' | 'learn' | null>(null);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const pathname = usePathname();

  // Fetch real coin balance
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/coins/balance', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.balance != null) setCoinBalance(data.balance); })
      .catch(() => { setCoinBalance(0); });
  }, [isAuthenticated]);

  const isActive = (href: string) => pathname === href;

  const talesFeatures = getTalesFeatures();
  const learnFeatures = getLearnFeatures();

  // Determine auth route prefix based on current hub context
  const isTalesContext = pathname?.startsWith('/tales') || pathname?.startsWith('/play') ||
    pathname?.startsWith('/music') || pathname?.startsWith('/characters') || pathname?.startsWith('/community');
  const authPrefix = isTalesContext ? '/tales' : '';

  // Check which hubs to show based on user preferences
  const showTales = hasHubAccess('tales');
  const showLearn = hasHubAccess('learn');

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src={ICONS.home}
                alt={BRAND.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{BRAND.name}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{BRAND.tagline}</p>
            </div>
          </Link>

          {/* Hub Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {/* Home Link */}
            <Link
              href="/home"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/home')
                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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

            {/* Echo Tales Dropdown - conditional based on user preference */}
            {showTales && (
              <HubDropdown
                label={BRAND.hubs.tales.name}
                items={talesFeatures}
                isOpen={openDropdown === 'tales'}
                onToggle={() => setOpenDropdown(openDropdown === 'tales' ? null : 'tales')}
                colorClass="purple"
              />
            )}

            {/* Echo Learn Dropdown - conditional based on user preference */}
            {showLearn && (
              <HubDropdown
                label={BRAND.hubs.learn.name}
                items={learnFeatures}
                isOpen={openDropdown === 'learn'}
                onToggle={() => setOpenDropdown(openDropdown === 'learn' ? null : 'learn')}
                colorClass="blue"
              />
            )}
          </div>

          {/* Right side: User Menu + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Desktop User Menu */}
            <div className="hidden sm:flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  {/* Admin Button - only show for admin/superadmin/owner */}
                  {(user.role === 'admin' || user.role === 'superadmin' || user.role === 'owner') && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <span>⚙️</span>
                      <span>Admin</span>
                    </Link>
                  )}

                  {/* Coin Balance */}
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full">
                    <span className="text-lg">🪙</span>
                    {coinBalance === null ? (
                      <span className="w-6 h-4 bg-yellow-200 dark:bg-yellow-800 rounded animate-pulse" />
                    ) : (
                      <span className="font-semibold text-yellow-700 dark:text-yellow-400">{coinBalance}</span>
                    )}
                  </div>

                  {/* User Avatar/Name */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {user.name || user.email}
                    </span>
                    <button
                      onClick={logout}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 touch-feedback"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={`${authPrefix}/login`}
                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={`${authPrefix}/register`}
                    className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: Coin Badge (always show for auth users) */}
            {isAuthenticated && user && (
              <div className="flex md:hidden items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                <span className="text-sm">🪙</span>
                {coinBalance === null ? (
                  <span className="w-4 h-3 bg-yellow-200 dark:bg-yellow-800 rounded animate-pulse" />
                ) : (
                  <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">{coinBalance}</span>
                )}
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg touch-feedback"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-200">
            {/* Hub Links for Mobile - conditional based on user preference */}
            <div className={`grid gap-2 mb-4 ${showTales && showLearn ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {showTales && (
                <Link
                  href="/tales"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  <div className="relative w-10 h-10">
                    <Image
                      src={ICONS.playRoom}
                      alt={BRAND.hubs.tales.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="text-sm font-medium">{BRAND.hubs.tales.name}</span>
                </Link>
              )}
              {showLearn && (
                <Link
                  href="/learn"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <div className="relative w-10 h-10">
                    <Image
                      src={ICONS.reader}
                      alt={BRAND.hubs.learn.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="text-sm font-medium">{BRAND.hubs.learn.name}</span>
                </Link>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {user.name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Admin Button */}
                  {(user.role === 'admin' || user.role === 'superadmin' || user.role === 'owner') && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 bg-purple-100 text-purple-700 px-3 py-3 rounded-lg text-sm font-medium touch-feedback"
                    >
                      <span>⚙️</span>
                      Admin
                    </Link>
                  )}

                  {/* Settings/Account placeholder */}
                  <Link
                    href="/store"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-3 rounded-lg text-sm font-medium touch-feedback"
                  >
                    <span>🪙</span>
                    Get Coins
                  </Link>
                </div>

                {/* Sign Out */}
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium touch-feedback"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href={`${authPrefix}/login`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href={`${authPrefix}/register`}
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
