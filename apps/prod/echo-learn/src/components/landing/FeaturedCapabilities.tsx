'use client';

import Link from 'next/link';
import { BookOpen, Music, Sparkles, Languages, BookMarked, Brain } from 'lucide-react';
import { BRAND } from '@/lib/brand/constants';

const capabilities = [
  // Echo Tales features
  {
    icon: BookOpen,
    title: 'Personalized Stories',
    description: 'AI-generated books with your child as the hero',
    href: '/play',
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-100 dark:bg-purple-500/20',
    textColor: 'text-purple-600 dark:text-purple-400',
    hub: 'tales',
  },
  {
    icon: Music,
    title: 'Custom Songs',
    description: 'Music created from your storybooks',
    href: '/music',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    hub: 'tales',
  },
  {
    icon: Sparkles,
    title: 'Photo to Illustration',
    description: 'Transform photos into book characters',
    href: '/play?tab=characters',
    gradient: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-100 dark:bg-rose-500/20',
    textColor: 'text-rose-600 dark:text-rose-400',
    hub: 'tales',
  },
  // Echo Learn features
  {
    icon: Languages,
    title: 'Language Learning',
    description: 'AI-powered Spanish & English tutoring',
    href: '/lingua',
    gradient: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-100 dark:bg-rose-500/20',
    textColor: 'text-rose-600 dark:text-rose-400',
    hub: 'learn',
  },
  {
    icon: BookMarked,
    title: 'Paper Reading',
    description: 'Academic papers with AI assistance',
    href: '/reader/library',
    gradient: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-100 dark:bg-indigo-500/20',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    hub: 'learn',
  },
  {
    icon: Brain,
    title: 'Philosophy',
    description: 'Learn from history\'s great thinkers',
    href: '/sophia',
    gradient: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-100 dark:bg-amber-500/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    hub: 'learn',
  },
];

export function FeaturedCapabilities() {
  return (
    <section className="py-16 sm:py-20 bg-theme">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            What You Can Create & Learn
          </h2>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            From personalized storybooks to language mastery, explore the possibilities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {capabilities.map(({ icon: Icon, title, description, href, bgColor, textColor, hub }) => (
            <Link key={title} href={href} className="group">
              <div className="h-full card-theme border rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${textColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-theme-primary group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        hub === 'tales'
                          ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'
                          : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {hub === 'tales' ? BRAND.hubs.tales.name : BRAND.hubs.learn.name}
                      </span>
                    </div>
                    <p className="text-sm text-theme-muted">{description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
