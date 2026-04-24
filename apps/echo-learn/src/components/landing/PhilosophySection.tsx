'use client';

import { Lightbulb, Users, Layers, RefreshCw } from 'lucide-react';

const beliefs = [
  {
    icon: Layers,
    title: 'We lean on what the research offers',
    description:
      'Montessori, Reggio Emilia, and a lot of evidence-based work in education are frameworks we take seriously. We try to synthesize what seems to be working, and to stay open to what tomorrow\'s research might change.',
  },
  {
    icon: RefreshCw,
    title: 'Built to change its mind',
    description:
      'Systems that can\'t adapt tend to get outdated. We try to build with evolution at the core — tools that can grow, improve, and change as research advances and as families share what works.',
  },
  {
    icon: Lightbulb,
    title: 'AI can widen what\'s reachable',
    description:
      'You don\'t have to be a musician to express love through a song, or an artist to tell a story where your child is the hero. We think AI can help lower some of those barriers, without replacing human meaning.',
  },
  {
    icon: Users,
    title: 'Environments seem to matter a lot',
    description:
      'Research keeps pointing in the same direction: children develop in response to their environment. We can\'t control everything, but we can try to improve the conditions we create. That possibility is most of what pulls us forward.',
  },
];

export function PhilosophySection() {
  return (
    <section className="py-20 bg-theme-secondary transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            What we&apos;re working from
          </h2>
          <p className="text-lg text-theme-secondary">
            We try to build with the best knowledge currently available, and to design
            systems that can shift as we learn more. Improving the environments children
            grow up in feels, to us, like something the evidence keeps pointing to.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {beliefs.map((belief) => {
            const Icon = belief.icon;
            return (
              <div
                key={belief.title}
                className="card-theme border rounded-xl p-6 hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-500" />
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
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-theme-primary mb-4 text-center">
              Why this moment feels different
            </h3>
            <p className="text-theme-primary text-center leading-relaxed mb-4">
              Over half of online content is now AI-generated, and the old reason
              many of us were given for schooling — &quot;learn this for your job&quot; —
              gets harder to hold when AI can handle much of that work. We tend to
              read this less as a crisis than as an opening.
            </p>
            <p className="text-theme-secondary text-center text-sm">
              For the first time, something like personalized attention at scale
              seems within reach. What we&apos;d like to do with it is help children
              grow into independent thinkers — people comfortable asking
              &quot;why should I believe this?&quot; and forming their own read of the world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
