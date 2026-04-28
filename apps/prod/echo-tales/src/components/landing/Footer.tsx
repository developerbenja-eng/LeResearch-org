'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Mail, Twitter, Github, Linkedin, Youtube, Send } from 'lucide-react';
import { BRAND, ICONS } from '@/lib/brand/constants';

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/echocraft', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/echocraft', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/echocraft', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com/@echocraft', label: 'YouTube' },
];

const productLinks = [
  { href: '/play', label: 'Stories' },
  { href: '/music', label: 'Music' },
  { href: '/play?tab=characters', label: 'Characters' },
  { href: '/research', label: 'Research' },
  { href: '/community', label: 'Community' },
];

const companyLinks = [
  { href: '/our-story', label: 'Our Story' },
  { href: '/research', label: 'Research' },
  { href: '/community', label: 'Community' },
];

const legalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-theme-secondary border-t border-theme">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src={ICONS.home}
                  alt={BRAND.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div>
                <span className="text-xl font-bold text-theme-primary">{BRAND.name}</span>
                <p className="text-sm text-theme-muted">{BRAND.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-theme-secondary mb-6 max-w-xs">
              AI-powered learning experiences for the whole family. Stories, music, languages, and more.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-theme hover:bg-purple-100 dark:hover:bg-purple-500/20 flex items-center justify-center text-theme-muted hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-theme-primary mb-4">Product</h3>
            <nav aria-label="Product navigation">
              <ul className="space-y-3">
                {productLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-theme-secondary hover:text-theme-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-theme-primary mb-4">Company</h3>
            <nav aria-label="Company navigation">
              <ul className="space-y-3">
                {companyLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-theme-secondary hover:text-theme-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Legal under Company */}
            <h3 className="font-semibold text-theme-primary mt-6 mb-4">Legal</h3>
            <nav aria-label="Legal navigation">
              <ul className="space-y-3">
                {legalLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-theme-secondary hover:text-theme-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-theme-primary mb-4">Stay Updated</h3>
            <p className="text-sm text-theme-secondary mb-4">
              Get the latest updates on new features and educational content.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Thanks for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-theme bg-theme text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                  aria-label="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-theme-muted">
            &copy; {new Date().getFullYear()} {BRAND.legalEntity}. All rights reserved.
          </p>
          <p className="text-sm text-theme-muted">
            Made with care for families everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
