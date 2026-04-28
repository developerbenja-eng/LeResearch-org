'use client';

import { Book, Mic, Headphones, Monitor, Palette, Shield, CheckCircle, Clock } from 'lucide-react';

const solutions = [
  {
    icon: Book,
    title: 'Physical Book Store',
    description: 'Order printed copies of personalized books',
    status: 'coming-soon',
    statusLabel: 'Coming Soon',
  },
  {
    icon: Mic,
    title: 'Alexa Integration',
    description: 'Voice-activated stories—no screen needed',
    status: 'available',
    statusLabel: 'Available',
  },
  {
    icon: Headphones,
    title: 'Smart Audio Books',
    description: 'ESP32-powered with WiFi/Bluetooth',
    status: 'development',
    statusLabel: 'In Development',
  },
  {
    icon: Monitor,
    title: 'E-ink Reader with Audio',
    description: 'Dedicated device, no blue light, built-in speaker',
    status: 'planned',
    statusLabel: '2026',
  },
  {
    icon: Palette,
    title: 'Coloring Book Versions',
    description: 'B&W printing for offline creative play',
    status: 'available',
    statusLabel: 'Available',
  },
  {
    icon: Shield,
    title: 'You Decide What to Share',
    description: 'Full control over content reaching children',
    status: 'available',
    statusLabel: 'Available',
  },
];

const statusStyles = {
  available: 'bg-green-100 text-green-700',
  'coming-soon': 'bg-yellow-100 text-yellow-700',
  development: 'bg-blue-100 text-blue-700',
  planned: 'bg-purple-100 text-purple-700',
};

const statusIcons = {
  available: CheckCircle,
  'coming-soon': Clock,
  development: Clock,
  planned: Clock,
};

export function ScreenFreeSolutions() {
  return (
    <section className="py-20 bg-gradient-to-b from-purple-900 to-gray-900">
      <div className="container mx-auto px-4">
        {/* Research callout */}
        <div className="text-center mb-12">
          <div className="inline-block bg-red-500/20 border border-red-500/30 rounded-full px-6 py-2 mb-6">
            <span className="text-red-300 font-medium">
              Research Finding: Screen Time Is Parents&apos; #1 Concern
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Screen-Free Solutions for Families
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            We&apos;re building multiple ways to enjoy personalized content without screens
          </p>
        </div>

        {/* Solutions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {solutions.map((solution) => {
            const Icon = solution.icon;
            const StatusIcon = statusIcons[solution.status as keyof typeof statusIcons];
            const statusStyle = statusStyles[solution.status as keyof typeof statusStyles];

            return (
              <div
                key={solution.title}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${statusStyle}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {solution.statusLabel}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{solution.title}</h3>
                <p className="text-gray-400 text-sm">{solution.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
