'use client';

import { useState } from 'react';
import { Search, BookMarked, Lightbulb, Sparkles, ChevronDown } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'EXPLORE',
    icon: Search,
    color: 'from-blue-500 to-cyan-500',
    features: [
      { title: 'Pre-Built Topics', desc: '60+ expert-curated parenting challenges' },
      { title: 'AI Research Chat', desc: 'Aggregates from academic papers, Reddit, YouTube, community' },
    ],
    sources: ['Academic', 'Reddit', 'YouTube', 'Community'],
  },
  {
    number: 2,
    title: 'SAVE',
    icon: BookMarked,
    color: 'from-green-500 to-emerald-500',
    features: [
      { title: 'Quick Capture', desc: 'Capture thoughts anytime' },
      { title: 'One-Click Save', desc: 'Save from any source with one click' },
      { title: 'Organize', desc: 'By type: thoughts, insights, questions' },
      { title: 'Sync', desc: 'Access across all devices' },
    ],
  },
  {
    number: 3,
    title: 'DEVELOP',
    icon: Lightbulb,
    color: 'from-yellow-500 to-orange-500',
    features: [
      { title: 'Generate Podcasts', desc: 'On any topic (5-15 min)' },
      { title: 'AI Insights', desc: 'Extract insights from research' },
      { title: 'Book Concepts', desc: 'Auto-generate from notes' },
      { title: 'Value Alignment', desc: 'Find content aligned with your values' },
    ],
  },
  {
    number: 4,
    title: 'CREATE',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    features: [
      { title: 'Books', desc: 'With your child as the hero' },
      { title: 'Songs', desc: 'With personalized lyrics' },
      { title: 'Videos', desc: 'Educational content' },
      { title: 'Consistent Characters', desc: 'Same characters across all content' },
    ],
    tagline: '2 clicks to create · Refine everything',
  },
];

export function ParentPlayground() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="py-20 bg-theme-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            Your Research Playground
          </h2>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            From research to creation in four simple steps
          </p>
        </div>

        {/* Desktop Flow */}
        <div className="hidden md:flex justify-center gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;

            return (
              <div
                key={step.number}
                className="flex-1 relative"
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-12 left-[60%] w-[80%] h-0.5 border-theme bg-current opacity-30" />
                )}

                <div
                  className={`relative card-theme backdrop-blur border rounded-xl p-6 transition-all duration-300 ${
                    isActive ? 'scale-105 border-purple-500/50 shadow-lg shadow-purple-500/10' : ''
                  }`}
                >
                  {/* Step number */}
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-theme-primary mb-2">
                    Step {step.number}: {step.title}
                  </h3>

                  {/* Features (shown on hover) */}
                  <div
                    className={`space-y-2 overflow-hidden transition-all duration-300 ${
                      isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {step.features.map((feature, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-purple-500 dark:text-purple-400 font-medium">{feature.title}:</span>{' '}
                        <span className="text-theme-secondary">{feature.desc}</span>
                      </div>
                    ))}
                    {step.sources && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {step.sources.map((source) => (
                          <span
                            key={source}
                            className="text-xs px-2 py-1 bg-theme-tertiary rounded text-theme-secondary"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                    {step.tagline && (
                      <p className="text-purple-500 dark:text-purple-400 text-sm mt-3 font-medium">{step.tagline}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Flow */}
        <div className="md:hidden space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;

            return (
              <div
                key={step.number}
                className="card-theme backdrop-blur border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveStep(isActive ? null : index)}
                  className="w-full p-4 flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-theme-primary font-semibold">
                      Step {step.number}: {step.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-theme-muted transition-transform ${
                      isActive ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`px-4 overflow-hidden transition-all duration-300 ${
                    isActive ? 'max-h-96 pb-4' : 'max-h-0'
                  }`}
                >
                  <div className="space-y-2 pl-14">
                    {step.features.map((feature, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-purple-500 dark:text-purple-400 font-medium">{feature.title}:</span>{' '}
                        <span className="text-theme-secondary">{feature.desc}</span>
                      </div>
                    ))}
                    {step.sources && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {step.sources.map((source) => (
                          <span
                            key={source}
                            className="text-xs px-2 py-1 bg-theme-tertiary rounded text-theme-secondary"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
