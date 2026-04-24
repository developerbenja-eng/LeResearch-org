'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, Sparkles, Music, Users, Languages, BookMarked, Brain, FlaskConical, Piano } from 'lucide-react';
import { BRAND } from '@/lib/brand/constants';

const talesFeatures = [
  { icon: BookOpen, label: 'Personalized Stories', description: 'AI-generated books with your child as the hero' },
  { icon: Music, label: 'Custom Songs', description: 'Music created from your storybooks' },
  { icon: Sparkles, label: 'Character Creation', description: 'Transform photos into book illustrations' },
  { icon: Users, label: 'Family Community', description: 'Share and connect with other families' },
];

const learnFeatures = [
  { icon: Languages, label: 'Echo Lingua', description: 'AI-powered language learning' },
  { icon: BookMarked, label: 'Echo Reader', description: 'Academic paper reading with AI' },
  { icon: Brain, label: 'Sophia', description: 'Philosophy with great thinkers' },
  { icon: FlaskConical, label: 'Research', description: 'Evidence-based parenting insights' },
  { icon: Piano, label: 'Music Learning', description: 'Visual music education' },
];

export function DualHubShowcase() {
  return (
    <section className="py-16 sm:py-20 bg-theme">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            Two Hubs, One Platform
          </h2>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Choose your path: creative storytelling for children or powerful learning tools for the whole family.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Echo Tales Hub */}
          <Link href="/tales" className="group">
            <div className="h-full card-theme border rounded-2xl p-6 sm:p-8 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-theme-primary">{BRAND.hubs.tales.name}</h3>
                  <p className="text-sm text-theme-secondary">{BRAND.hubs.tales.tagline}</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="space-y-4 mb-6">
                {talesFeatures.map(({ icon: Icon, label, description }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-theme-primary">{label}</h4>
                      <p className="text-sm text-theme-muted">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-theme">
                <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:translate-x-1 transition-transform">
                  Explore Echo Tales
                </span>
                <span className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </div>
          </Link>

          {/* Echo Learn Hub */}
          <Link href="/learn" className="group">
            <div className="h-full card-theme border rounded-2xl p-6 sm:p-8 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-theme-primary">{BRAND.hubs.learn.name}</h3>
                  <p className="text-sm text-theme-secondary">{BRAND.hubs.learn.tagline}</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="space-y-4 mb-6">
                {learnFeatures.map(({ icon: Icon, label, description }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-theme-primary">{label}</h4>
                      <p className="text-sm text-theme-muted">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-theme">
                <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                  Explore Echo Learn
                </span>
                <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
