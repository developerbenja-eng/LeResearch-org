'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, AlertTriangle, Sparkles, RefreshCw, Users, ChevronDown, ExternalLink } from 'lucide-react';

// Mystery card component
function MysteryCard({
  mystery,
  isExpanded,
  onToggle,
}: {
  mystery: {
    id: string;
    title: string;
    category: 'contested' | 'unknown' | 'emerging' | 'debunked';
    summary: string;
    details: string;
    positions: { side: string; evidence: string }[];
    sources?: { title: string; url?: string }[];
  };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const categoryColors = {
    contested: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    unknown: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    emerging: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    debunked: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  };

  const categoryLabels = {
    contested: 'Actively Debated',
    unknown: 'Unknown',
    emerging: 'Emerging Science',
    debunked: 'Myth Debunked',
  };

  const colors = categoryColors[mystery.category];

  return (
    <motion.div
      layout
      className={`bg-nutrition-surface rounded-2xl border ${colors.border} overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className="w-full p-6 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} mb-3`}>
              {categoryLabels[mystery.category]}
            </span>
            <h3 className="text-xl font-bold text-nutrition-text mb-2">{mystery.title}</h3>
            <p className="text-nutrition-dim">{mystery.summary}</p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-nutrition-dim shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4">
              <p className="text-nutrition-text text-sm leading-relaxed">{mystery.details}</p>

              {/* Positions */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-nutrition-dim uppercase tracking-wider">
                  The Debate
                </p>
                {mystery.positions.map((pos, i) => (
                  <div
                    key={i}
                    className="p-4 bg-nutrition-surface-light rounded-xl"
                  >
                    <p className="text-green-400 font-medium text-sm mb-1">{pos.side}</p>
                    <p className="text-nutrition-dim text-sm">{pos.evidence}</p>
                  </div>
                ))}
              </div>

              {/* Sources */}
              {mystery.sources && mystery.sources.length > 0 && (
                <div className="pt-4 border-t border-nutrition">
                  <p className="text-xs text-nutrition-dim mb-2">Further reading:</p>
                  <div className="flex flex-wrap gap-2">
                    {mystery.sources.map((source, i) => (
                      <a
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
                      >
                        {source.title}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Replication crisis explainer
function ReplicationCrisisSection() {
  const [expanded, setExpanded] = useState(false);

  const failedStudies = [
    { claim: 'Red wine is good for your heart', status: 'Resveratrol benefits not replicated in humans', year: '2014 reversal' },
    { claim: 'Breakfast is the most important meal', status: 'No evidence it helps weight loss', year: '2019 meta-analysis' },
    { claim: 'Eggs raise cholesterol dangerously', status: 'Dietary cholesterol has minimal effect', year: '2015 guidelines change' },
    { claim: 'Vitamins prevent cancer', status: 'Large trials showed no benefit, some harm', year: '2012 review' },
  ];

  return (
    <div className="bg-nutrition-surface rounded-2xl p-6 border border-nutrition">
      <div className="flex items-start gap-3 mb-4">
        <RefreshCw className="w-6 h-6 text-red-400" />
        <div>
          <h3 className="text-xl font-bold text-nutrition-text">
            The Nutrition Replication Crisis
          </h3>
          <p className="text-nutrition-dim text-sm">
            Many landmark findings have failed to replicate
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {failedStudies.map((study, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-nutrition-surface-light rounded-lg">
            <div className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
            <div>
              <p className="text-nutrition-text text-sm font-medium">{study.claim}</p>
              <p className="text-nutrition-dim text-xs">{study.status}</p>
              <p className="text-red-400/70 text-xs">{study.year}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
      >
        <span>{expanded ? 'Hide' : 'Why does this happen?'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3 text-sm">
              <p className="text-nutrition-text font-medium">Why nutrition research is uniquely challenging:</p>
              <ul className="space-y-2 text-nutrition-dim">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span><strong>Self-reported diets:</strong> People misremember or misreport what they eat</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span><strong>Confounding variables:</strong> People who eat vegetables also exercise more, sleep better, etc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span><strong>Long timescales:</strong> Diet affects health over decades, not weeks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span><strong>Publication bias:</strong> Exciting results get published; null results don't</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span><strong>Industry funding:</strong> Many studies are funded by food companies</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual variation section
function IndividualVariationSection() {
  const responses = [
    { person: 'Person A', food: 'White bread', glucose: 85, color: '#22c55e' },
    { person: 'Person B', food: 'White bread', glucose: 180, color: '#ef4444' },
    { person: 'Person A', food: 'Ice cream', glucose: 150, color: '#f59e0b' },
    { person: 'Person B', food: 'Ice cream', glucose: 60, color: '#22c55e' },
  ];

  return (
    <div className="bg-nutrition-surface rounded-2xl p-6 border border-nutrition">
      <div className="flex items-start gap-3 mb-4">
        <Users className="w-6 h-6 text-purple-400" />
        <div>
          <h3 className="text-xl font-bold text-nutrition-text">
            One Diet Doesn't Fit All
          </h3>
          <p className="text-nutrition-dim text-sm">
            Your body responds differently to food than everyone else's
          </p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-nutrition-text mb-4">
          The PREDICT study gave identical foods to different people and measured blood sugar response.
          The results were shocking:
        </p>

        <div className="bg-nutrition-surface-light rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            {responses.map((r, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-nutrition-dim mb-1">{r.person}: {r.food}</p>
                <div className="relative h-24 flex items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(r.glucose / 200) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="w-12 rounded-t-lg"
                    style={{ backgroundColor: r.color }}
                  />
                </div>
                <p className="text-lg font-bold mt-2" style={{ color: r.color }}>
                  {r.glucose}
                </p>
                <p className="text-xs text-nutrition-dim">mg/dL spike</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-nutrition-dim mt-4 text-center">
          Same food, same portion, completely different metabolic responses
        </p>
      </div>

      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
        <p className="text-sm text-purple-400 font-medium">What determines your response?</p>
        <ul className="text-xs text-nutrition-dim mt-2 space-y-1">
          <li>• Gut microbiome composition</li>
          <li>• Genetics (insulin sensitivity genes)</li>
          <li>• Sleep quality the night before</li>
          <li>• Exercise timing</li>
          <li>• Stress levels</li>
          <li>• What you ate earlier that day</li>
        </ul>
      </div>
    </div>
  );
}

export default function MysteriesPage() {
  const [expandedMystery, setExpandedMystery] = useState<string | null>(null);

  const mysteries = [
    {
      id: 'saturated-fat',
      title: 'Is Saturated Fat Actually Bad?',
      category: 'contested' as const,
      summary: 'For 50 years we were told saturated fat causes heart disease. The evidence is more complex than we thought.',
      details: 'The original Seven Countries Study by Ancel Keys showed correlation between saturated fat intake and heart disease. This led to decades of low-fat diet recommendations. However, recent meta-analyses have failed to find a strong link between saturated fat and mortality. The relationship appears to depend on what you replace fat with—replacing it with sugar or refined carbs may be worse.',
      positions: [
        { side: 'Saturated fat is harmful', evidence: 'Raises LDL cholesterol; epidemiological studies link it to heart disease; major health organizations still recommend limiting it' },
        { side: 'The evidence is weak', evidence: '2020 Cochrane review found reducing saturated fat may slightly reduce cardiovascular events but not mortality; effects depend on replacement foods' },
      ],
      sources: [
        { title: '2020 Cochrane Systematic Review', url: 'https://www.cochranelibrary.com/' },
      ],
    },
    {
      id: 'microbiome',
      title: 'The Microbiome: New Frontier',
      category: 'emerging' as const,
      summary: 'The bacteria in your gut may matter more than your genes for determining how you respond to food.',
      details: 'Your gut contains trillions of bacteria that help digest food, produce vitamins, and communicate with your immune system. Research suggests these bacteria may explain why people respond so differently to the same foods. Companies now offer microbiome testing to personalize nutrition advice, but the science is still young.',
      positions: [
        { side: 'Microbiome is revolutionary', evidence: 'Studies show gut bacteria composition predicts blood sugar response better than genetics; can be modified through diet' },
        { side: 'Too early for applications', evidence: 'We don\'t yet know what an "optimal" microbiome looks like; interventions haven\'t shown consistent benefits' },
      ],
    },
    {
      id: 'breakfast',
      title: 'Is Breakfast Really Important?',
      category: 'debunked' as const,
      summary: 'The claim that "breakfast is the most important meal" was largely created by cereal companies.',
      details: 'The idea that skipping breakfast is harmful gained popularity in the early 20th century, heavily promoted by companies like Kellogg\'s and General Mills. Observational studies showed breakfast eaters were healthier, but this may be because health-conscious people are more likely to eat breakfast. Randomized controlled trials show no weight loss benefit from eating breakfast.',
      positions: [
        { side: 'Marketing origin', evidence: 'Edward Bernays (Sigmund Freud\'s nephew) ran PR campaigns promoting "hearty American breakfast" for bacon industry' },
        { side: 'Still may help some people', evidence: 'Some individuals perform better with morning food; children may benefit for school performance' },
      ],
    },
    {
      id: 'supplements',
      title: 'Do Vitamin Supplements Work?',
      category: 'contested' as const,
      summary: 'Most people don\'t need supplements, and some may cause harm. But the industry is worth $50 billion.',
      details: 'Large randomized trials have consistently failed to show benefits from multivitamins or antioxidant supplements for preventing cancer, heart disease, or cognitive decline. Some trials were stopped early because supplements increased harm. However, specific deficiencies (vitamin D, B12, iron) can benefit from supplementation.',
      positions: [
        { side: 'Supplements are unnecessary', evidence: 'A 2018 meta-analysis of 179 studies found no benefit for mortality; nutrients from food may work differently' },
        { side: 'Some supplements help', evidence: 'Vitamin D for deficiency, B12 for vegans, folic acid during pregnancy all have strong evidence' },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 py-8 border-b border-nutrition">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-nutrition-text mb-2">
            What We Don't Know
          </h1>
          <p className="text-nutrition-dim text-lg">
            Contested science, myths debunked, and emerging frontiers in nutrition research
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <HelpCircle className="w-8 h-8 text-purple-400 shrink-0" />
              <div>
                <p className="text-nutrition-text text-lg font-medium mb-2">
                  Science is a process, not a destination
                </p>
                <p className="text-nutrition-dim">
                  Nutrition science is younger than you think. We're still learning the basics, and
                  many "facts" you learned growing up have been revised or overturned. This section
                  explores what we're still figuring out.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Replication Crisis */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ReplicationCrisisSection />
          </motion.section>

          {/* Mysteries */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-nutrition-text mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Active Debates
            </h2>
            <div className="space-y-4">
              {mysteries.map((mystery) => (
                <MysteryCard
                  key={mystery.id}
                  mystery={mystery}
                  isExpanded={expandedMystery === mystery.id}
                  onToggle={() => setExpandedMystery(expandedMystery === mystery.id ? null : mystery.id)}
                />
              ))}
            </div>
          </motion.section>

          {/* Individual Variation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <IndividualVariationSection />
          </motion.section>

          {/* Closing thought */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center py-8"
          >
            <p className="text-nutrition-dim text-lg italic">
              "The more we learn, the more we realize how little we knew."
            </p>
            <p className="text-nutrition-dim/60 text-sm mt-2">
              — A theme in the history of nutrition science
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
