'use client';

import Link from 'next/link';
import { Search, Bot, Podcast, BookOpen, ArrowRight } from 'lucide-react';

const topics = [
  { name: 'Tantrums', emoji: '😤', category: 'Emotional' },
  { name: 'Sleep Training', emoji: '😴', category: 'Routines' },
  { name: 'Screen Time', emoji: '📱', category: 'Digital' },
  { name: 'Sibling Rivalry', emoji: '👫', category: 'Family' },
  { name: 'Picky Eating', emoji: '🥦', category: 'Nutrition' },
  { name: 'Potty Training', emoji: '🚽', category: 'Development' },
];

const features = [
  { icon: Search, label: '68+ Topics', description: 'Pre-researched parenting challenges' },
  { icon: Bot, label: 'AI Assistant', description: 'Ask custom questions' },
  { icon: Podcast, label: 'AI Podcasts', description: 'Generated audio content' },
  { icon: BookOpen, label: 'My Notebook', description: 'Save notes and insights' },
];

export function ResearchShowcase() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-500/20 rounded-full text-green-700 dark:text-green-300 text-sm font-medium mb-4">
            <span>Parenting Research</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            Research
          </h2>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Evidence-based parenting insights. Browse 68+ pre-researched topics, ask AI for help, and generate podcasts on any parenting challenge.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
          {/* Topics Grid Demo */}
          <div className="card-theme border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-theme-primary">Popular Topics</h4>
              <span className="text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">68+ topics</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {topics.map((topic) => (
                <div
                  key={topic.name}
                  className="px-3 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors cursor-pointer text-center"
                >
                  <span className="text-2xl block mb-1">{topic.emoji}</span>
                  <p className="text-sm font-medium text-theme-primary">{topic.name}</p>
                  <p className="text-xs text-theme-muted">{topic.category}</p>
                </div>
              ))}
            </div>

            {/* AI Assistant Preview */}
            <div className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-500/10 dark:to-teal-500/10 rounded-xl p-4 border border-green-200 dark:border-green-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-theme-primary mb-2">
                    <strong>Research Assistant:</strong> Ask me anything about parenting...
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-white dark:bg-gray-800 text-theme-muted px-2 py-1 rounded">Academic sources</span>
                    <span className="text-xs bg-white dark:bg-gray-800 text-theme-muted px-2 py-1 rounded">Reddit insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {features.map(({ icon: Icon, label, description }) => (
                <div key={label} className="card-theme border rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-medium text-theme-primary mb-1">{label}</h4>
                  <p className="text-sm text-theme-muted">{description}</p>
                </div>
              ))}
            </div>

            {/* Podcast Preview */}
            <div className="card-theme border rounded-xl p-4 bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Podcast className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h4 className="font-medium text-theme-primary">AI Podcasts</h4>
              </div>
              <p className="text-sm text-theme-secondary">
                Generate 5-15 minute podcasts on any topic. AI hosts discuss research in an engaging, conversational format.
              </p>
            </div>

            <Link
              href="/research"
              className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-medium hover:gap-3 transition-all"
            >
              Explore Research
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
