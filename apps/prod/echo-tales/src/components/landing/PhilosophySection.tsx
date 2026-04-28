'use client';

import { Lightbulb, Users, Layers, RefreshCw } from 'lucide-react';

const beliefs = [
  {
    icon: Layers,
    title: 'We Use the Best Available',
    description:
      'Montessori, Reggio Emilia, evidence-based practices—education research offers powerful frameworks. We believe in synthesizing them, giving families the best tools available today while staying open to what we\'ll learn tomorrow.',
  },
  {
    icon: RefreshCw,
    title: 'Designed to Evolve',
    description:
      'Any system that can\'t adapt becomes outdated. We build with evolution at the core—our tools are meant to grow, improve, and change as research advances and families share what works.',
  },
  {
    icon: Lightbulb,
    title: 'AI Expands What\'s Possible',
    description:
      'You don\'t need to be a musician to express love through a song. You don\'t need to be an artist to create a story where your child is the hero. AI removes barriers—it doesn\'t replace human meaning, it amplifies it.',
  },
  {
    icon: Users,
    title: 'Environments Matter Most',
    description:
      'Research is clear: children develop based on their environment. We can\'t control everything, but we can improve the conditions we create. That responsibility—and opportunity—drives everything we build.',
  },
];

export function PhilosophySection() {
  return (
    <section className="py-20 bg-theme-secondary transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            What We Believe
          </h2>
          <p className="text-lg text-theme-secondary">
            We believe in building with the best knowledge available, while designing systems
            that evolve as we learn more. Improving children&apos;s environments isn&apos;t
            optional—it&apos;s what the evidence calls for.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {beliefs.map((belief) => {
            const Icon = belief.icon;
            return (
              <div
                key={belief.title}
                className="card-theme border rounded-xl p-6 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-primary mb-2">{belief.title}</h3>
                    <p className="text-theme-secondary text-sm leading-relaxed">{belief.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* The "Why Now" context */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-theme-primary mb-4 text-center">
              Why This Moment Matters
            </h3>
            <p className="text-theme-primary text-center leading-relaxed mb-4">
              Over 50% of online content is now AI-generated. The old justification for
              education—&quot;learn this for your job&quot;—doesn&apos;t hold when AI can perform
              most cognitive tasks. We see this as an opportunity, not a crisis.
            </p>
            <p className="text-theme-secondary text-center text-sm">
              For the first time, we can provide personalized attention at scale. We believe in
              using these tools to help children develop as independent thinkers—people who can
              ask: &quot;Why should I believe this?&quot; and form their own understanding of the world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
