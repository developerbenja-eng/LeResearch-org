'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Lightbulb, CheckCircle, AlertCircle, Quote, ExternalLink } from 'lucide-react';
import { THINKER_METADATA, type ThinkerId } from '@/types/origins';

// Full thinker data
const THINKERS_FULL: Record<ThinkerId, {
  field: string;
  era: string;
  bio: string;
  coreInsight: string;
  keyWorks: { title: string; year: number; description: string }[];
  implications: string[];
  evidence: string[];
  counterArguments: string[];
  quotes: { text: string; source: string }[];
  watchLearn?: { title: string; url: string; type: 'TED' | 'YouTube' | 'Article' }[];
}> = {
  sapolsky: {
    field: 'Neuroscience & Biology',
    era: '1957 - Present',
    bio: 'Robert Sapolsky is a neuroendocrinologist and professor at Stanford University. He has spent decades studying stress in primates and humans, leading to profound insights about the biological basis of behavior.',
    coreInsight: 'Free will is an illusion - behavior emerges from biology, environment, and history interacting across timescales from milliseconds to millennia.',
    keyWorks: [
      { title: 'Determined: A Science of Life Without Free Will', year: 2023, description: 'His definitive argument against free will, synthesizing neuroscience, genetics, and evolutionary biology.' },
      { title: 'Behave: The Biology of Humans at Our Best and Worst', year: 2017, description: 'Explores how context shapes behavior from seconds before an action to evolutionary timescales.' },
      { title: 'Why Zebras Don\'t Get Ulcers', year: 1994, description: 'Groundbreaking work on stress and its effects on the body and brain.' },
    ],
    implications: [
      'Punishment and blame may be unjustified if behavior is determined',
      'Environment design becomes more important than individual willpower',
      'Understanding preconditions enables better intervention',
      'Compassion becomes more rational than judgment',
    ],
    evidence: [
      'Brain imaging shows decisions made before conscious awareness',
      'Childhood environment shapes adult behavior through epigenetics',
      'Hormone levels predict behavior more reliably than stated intentions',
      'Criminal behavior correlates with brain abnormalities and childhood trauma',
    ],
    counterArguments: [
      'Determinism may reduce motivation for self-improvement',
      'Legal and moral systems require some notion of responsibility',
      'Subjective experience of choice feels real and meaningful',
      'Quantum indeterminacy may allow for genuine randomness',
    ],
    quotes: [
      { text: 'Show me the brain scan, show me the genes, show me the childhood, show me the culture, and I\'ll show you the behavior.', source: 'Determined' },
      { text: 'We are not the captain of our ship; we are the ship.', source: 'Lecture' },
    ],
    watchLearn: [
      { title: 'The Biology of Good and Evil', url: 'https://www.youtube.com/watch?v=ORthzIOEf30', type: 'YouTube' },
    ],
  },
  rogers: {
    field: 'Humanistic Psychology',
    era: '1902 - 1987',
    bio: 'Carl Rogers was one of the founders of humanistic psychology and person-centered therapy. He revolutionized psychotherapy by emphasizing empathy, authenticity, and unconditional positive regard.',
    coreInsight: 'Humans naturally grow toward their potential when given unconditional positive regard, empathy, and authentic relationships. Dysfunction comes from conditions placed on acceptance.',
    keyWorks: [
      { title: 'On Becoming a Person', year: 1961, description: 'His most influential work on personal growth and the therapeutic relationship.' },
      { title: 'Freedom to Learn', year: 1969, description: 'Applied his insights to education, arguing for student-centered learning.' },
      { title: 'A Way of Being', year: 1980, description: 'Reflections on his philosophy and approach to life and therapy.' },
    ],
    implications: [
      'Learning environments should be accepting, not judgmental',
      'People don\'t need to be fixed - they need conditions for growth',
      'Relationships are the primary vehicle for change',
      'Authenticity is more powerful than technique',
    ],
    evidence: [
      'Therapy outcomes correlate with therapist empathy, not technique',
      'Secure attachment in childhood predicts adult wellbeing',
      'Autonomy-supportive environments increase intrinsic motivation',
      'Unconditional acceptance reduces defensive behavior',
    ],
    counterArguments: [
      'Some conditions (e.g., violence) should not be accepted',
      'Structure and boundaries may be necessary for growth',
      'Not all people respond equally to person-centered approaches',
      'Cultural contexts may require different approaches',
    ],
    quotes: [
      { text: 'The curious paradox is that when I accept myself just as I am, then I can change.', source: 'On Becoming a Person' },
      { text: 'The only person who is educated is the one who has learned how to learn and change.', source: 'Freedom to Learn' },
    ],
    watchLearn: [
      { title: 'Carl Rogers and Gloria - Counselling', url: 'https://www.youtube.com/watch?v=24d-FEptYj8', type: 'YouTube' },
    ],
  },
  robinson: {
    field: 'Education & Creativity',
    era: '1950 - 2020',
    bio: 'Sir Ken Robinson was a British author and education advisor. His TED Talk "Do Schools Kill Creativity?" is one of the most viewed of all time. He advocated for transforming education to nurture individual talents.',
    coreInsight: 'Schools systematically educate people out of creativity by prioritizing standardization, conformity, and a narrow hierarchy of subjects over individual talents and diverse forms of intelligence.',
    keyWorks: [
      { title: 'The Element: How Finding Your Passion Changes Everything', year: 2009, description: 'Explores how people find their calling when ability meets passion.' },
      { title: 'Creative Schools', year: 2015, description: 'Practical blueprint for transforming education.' },
      { title: 'Out of Our Minds', year: 2001, description: 'Argues that creativity is as important as literacy.' },
    ],
    implications: [
      'Education should be personalized, not standardized',
      'Arts and movement deserve equal status with academics',
      'Intelligence is diverse, dynamic, and distinct',
      'Creativity can be taught and nurtured',
    ],
    evidence: [
      'Creativity test scores decline as children progress through school',
      'Successful people often struggled in traditional education',
      'Countries with diverse education models perform well academically',
      'Arts education correlates with improved academic performance',
    ],
    counterArguments: [
      'Basic skills (reading, math) require some standardization',
      'Not everyone can be a creative professional',
      'Measurement of creativity is difficult and subjective',
      'Economic pressures require practical skill development',
    ],
    quotes: [
      { text: 'Creativity is as important in education as literacy, and we should treat it with the same status.', source: 'TED Talk' },
      { text: 'If you\'re not prepared to be wrong, you\'ll never come up with anything original.', source: 'TED Talk' },
    ],
    watchLearn: [
      { title: 'Do Schools Kill Creativity?', url: 'https://www.ted.com/talks/sir_ken_robinson_do_schools_kill_creativity', type: 'TED' },
    ],
  },
  kuhn: {
    field: 'Philosophy of Science',
    era: '1922 - 1996',
    bio: 'Thomas Kuhn was a physicist and philosopher of science. His book "The Structure of Scientific Revolutions" transformed how we understand scientific progress, introducing the concept of paradigm shifts.',
    coreInsight: 'Science doesn\'t progress smoothly through accumulation of facts. Paradigms - shared frameworks of assumptions - resist change until anomalies accumulate and force revolutionary shifts.',
    keyWorks: [
      { title: 'The Structure of Scientific Revolutions', year: 1962, description: 'Introduced "paradigm shift" and transformed philosophy of science.' },
      { title: 'The Essential Tension', year: 1977, description: 'Essays on the balance between tradition and innovation in science.' },
    ],
    implications: [
      'What seems obviously true depends on your paradigm',
      'Education socializes us into existing paradigms',
      'Paradigm shifts require generational change',
      'Anomalies signal potential for new understanding',
    ],
    evidence: [
      'Scientific revolutions (Copernican, Darwinian, Einsteinian) follow the pattern',
      'Scientists initially resist anomalous data',
      'Textbooks rewrite history to seem like smooth progress',
      'New paradigms often come from outsiders or young scientists',
    ],
    counterArguments: [
      'Some scientific progress is genuinely cumulative',
      'Paradigm concept may be too vague to be useful',
      'Relativism risks undermining scientific authority',
      'Not all fields experience revolutionary change',
    ],
    quotes: [
      { text: 'Normal science does not aim at novelties of fact or theory and, when successful, finds none.', source: 'Structure of Scientific Revolutions' },
      { text: 'The historian of science may be tempted to exclaim that when paradigms change, the world itself changes with them.', source: 'Structure of Scientific Revolutions' },
    ],
  },
  gramsci: {
    field: 'Political Philosophy',
    era: '1891 - 1937',
    bio: 'Antonio Gramsci was an Italian Marxist philosopher who wrote most of his influential work while imprisoned by Mussolini\'s fascist regime. His concept of cultural hegemony remains central to understanding power.',
    coreInsight: 'Power maintains itself not primarily through force, but through cultural hegemony - making the constructed seem natural, the contingent seem inevitable, and the interests of the powerful seem universal.',
    keyWorks: [
      { title: 'Prison Notebooks', year: 1935, description: 'Written in prison, contains his theories on hegemony, intellectuals, and culture.' },
      { title: 'Selections from Political Writings', year: 1921, description: 'Earlier journalistic and political writings.' },
    ],
    implications: [
      'Common sense is not natural - it\'s constructed',
      'Consent is manufactured through culture and education',
      'Change requires counter-hegemonic movements',
      'Intellectuals play a key role in maintaining or challenging hegemony',
    ],
    evidence: [
      'Values and assumptions vary dramatically across cultures and eras',
      'Media and education consistently favor existing power structures',
      'People often act against their own material interests',
      'Revolutionary moments occur when hegemony breaks down',
    ],
    counterArguments: [
      'Agency and resistance exist within hegemonic systems',
      'Not all shared beliefs serve power',
      'Conspiracy-like thinking may oversimplify complex systems',
      'Working class consciousness can emerge organically',
    ],
    quotes: [
      { text: 'The old world is dying, and the new world struggles to be born: now is the time of monsters.', source: 'Prison Notebooks' },
      { text: 'I\'m a pessimist because of intelligence, but an optimist because of will.', source: 'Letter from Prison' },
    ],
  },
  'tyack-cuban': {
    field: 'Education History',
    era: '20th Century',
    bio: 'David Tyack and Larry Cuban are historians of American education. Their collaboration produced influential analyses of why school reform repeatedly fails to transform the fundamental structures of schooling.',
    coreInsight: 'The "grammar of schooling" - age-grading, subject divisions, Carnegie units, classroom organization - persists despite endless reform attempts because it has become the definition of what "real school" looks like.',
    keyWorks: [
      { title: 'Tinkering Toward Utopia', year: 1995, description: 'Analyzes a century of school reform and why fundamental change is so difficult.' },
      { title: 'The One Best System', year: 1974, description: 'Tyack\'s history of urban education and administrative progressivism.' },
      { title: 'How Teachers Taught', year: 1984, description: 'Cuban\'s study of classroom practice constancy and change.' },
    ],
    implications: [
      'Reformers consistently underestimate institutional resistance',
      'Teachers adapt reforms to existing practices',
      'Cultural expectations constrain educational change',
      'Structural change requires changing the grammar itself',
    ],
    evidence: [
      'Open classrooms, team teaching, and other reforms largely disappeared',
      'Teacher practices remain remarkably stable over decades',
      'Parents and students expect "real school" to look familiar',
      'Successful alternative schools struggle to scale',
    ],
    counterArguments: [
      'Incremental improvements have occurred',
      'Some innovations (computers, preschool) have become permanent',
      'The grammar may persist because it works reasonably well',
      'Cultural change may eventually enable structural change',
    ],
    quotes: [
      { text: 'Reforms that enter schools have a long history of being changed by schools.', source: 'Tinkering Toward Utopia' },
      { text: 'The grammar of schooling has become so habitual that it\'s hard to imagine school being organized any other way.', source: 'Tinkering Toward Utopia' },
    ],
  },
};

export default function ThinkerProfilePage() {
  const params = useParams();
  const thinkerId = params.thinkerId as ThinkerId;

  const meta = THINKER_METADATA[thinkerId];
  const thinker = THINKERS_FULL[thinkerId];

  if (!meta || !thinker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-origins-dim">Thinker not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/learn/origins/thinkers"
            className="inline-flex items-center gap-2 text-origins-dim hover:text-origins-text transition-colors mb-4 md:mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Thinkers</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start gap-4 md:gap-6"
          >
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-5xl md:text-6xl shrink-0"
              style={{ backgroundColor: `${meta.color}20` }}
            >
              {meta.emoji}
            </div>
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ color: meta.color }}
              >
                {meta.name}
              </h1>
              <p className="text-lg text-origins-dim mb-2">{thinker.field}</p>
              <p className="text-sm text-origins-dim/70 mb-4">{thinker.era}</p>
              <p className="text-origins-text leading-relaxed">{thinker.bio}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Insight */}
      <section className="px-4 mb-8 md:px-6 md:mb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 md:p-6 rounded-xl border-2"
            style={{ borderColor: meta.color, backgroundColor: `${meta.color}10` }}
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 shrink-0 mt-1" style={{ color: meta.color }} />
              <div>
                <h2 className="text-lg font-bold text-origins-text mb-2">Core Insight</h2>
                <p className="text-origins-text text-lg leading-relaxed">
                  {thinker.coreInsight}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-8 md:space-y-12">
        {/* Key Works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-origins-text mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: meta.color }} />
            Key Works
          </h2>
          <div className="space-y-4">
            {thinker.keyWorks.map((work, i) => (
              <div key={i} className="p-4 bg-origins-surface rounded-lg border border-origins">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-origins-text">{work.title}</h3>
                  <span className="text-sm text-origins-dim">{work.year}</span>
                </div>
                <p className="text-sm text-origins-dim">{work.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Implications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-origins-text mb-4">
            Implications for Echo Origins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {thinker.implications.map((implication, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-origins-surface rounded-lg">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                <span className="text-sm text-origins-text">{implication}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Evidence */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-origins-text mb-4">
            Supporting Evidence
          </h2>
          <div className="space-y-2">
            {thinker.evidence.map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="text-green-500 font-bold">+</span>
                <span className="text-sm text-origins-text">{item}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Counter Arguments */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-origins-text mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Counter-Arguments & Limitations
          </h2>
          <div className="space-y-2">
            {thinker.counterArguments.map((arg, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <span className="text-amber-500 font-bold">?</span>
                <span className="text-sm text-origins-text">{arg}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Quotes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-origins-text mb-4 flex items-center gap-2">
            <Quote className="w-5 h-5" style={{ color: meta.color }} />
            Notable Quotes
          </h2>
          <div className="space-y-4">
            {thinker.quotes.map((quote, i) => (
              <blockquote
                key={i}
                className="p-4 border-l-4 bg-origins-surface rounded-r-lg"
                style={{ borderColor: meta.color }}
              >
                <p className="text-origins-text italic mb-2">"{quote.text}"</p>
                <cite className="text-sm text-origins-dim">— {quote.source}</cite>
              </blockquote>
            ))}
          </div>
        </motion.section>

        {/* Watch & Learn */}
        {thinker.watchLearn && thinker.watchLearn.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-xl font-bold text-origins-text mb-4">
              Watch & Learn
            </h2>
            <div className="space-y-3">
              {thinker.watchLearn.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-origins-surface rounded-lg border border-origins hover:border-white/20 transition-all group"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      resource.type === 'TED' ? 'bg-red-500' :
                      resource.type === 'YouTube' ? 'bg-red-600' :
                      'bg-blue-500'
                    }`}
                  >
                    <span className="text-white text-xs font-bold">{resource.type}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-origins-text group-hover:text-white transition-colors">
                      {resource.title}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-origins-dim group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Other Thinkers */}
      <section className="px-4 py-8 mt-4 md:px-6 md:py-12 md:mt-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-origins-text mb-4">Explore Other Thinkers</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(THINKER_METADATA)
              .filter(([id]) => id !== thinkerId)
              .map(([id, t]) => (
                <Link
                  key={id}
                  href={`/learn/origins/thinkers/${id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-origins-surface rounded-lg border border-origins hover:border-white/20 transition-all group"
                >
                  <span>{t.emoji}</span>
                  <span className="text-sm text-origins-dim group-hover:text-origins-text transition-colors">
                    {t.name}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
