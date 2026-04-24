'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronRight, BookOpen, MessageSquare, Link2, Filter } from 'lucide-react';
import {
  TIMELINE_METADATA,
  ERA_METADATA,
  type TimelineId,
  type EraId,
  type TimelineEvent,
  type ScholarReference
} from '@/types/origins';

// Temporary mock data - will be replaced with API calls
const MOCK_EVENTS: Record<TimelineId, TimelineEvent[]> = {
  education: [
    {
      id: 'edu-1',
      timelineId: 'education',
      era: 'ancient',
      title: 'Oral Traditions & Apprenticeship',
      description: 'For 95% of human history, learning happened through observation, imitation, and oral storytelling. Children learned by doing alongside adults. No separation of "school" from life.',
      keyInsight: 'Learning was embedded in daily life, not extracted into institutions.',
      characteristics: ['Learning by doing', 'Multi-generational transmission', 'Context-embedded skills', 'No formal assessment'],
      scholars: [{ name: 'John Dewey', work: 'Experience and Education', year: 1938 }],
      counterArguments: ['Limited transmission of abstract knowledge', 'Slow spread of innovations'],
      relatedEvents: ['emp-1', 'soc-1'],
      createdAt: '',
    },
    {
      id: 'edu-2',
      timelineId: 'education',
      era: 'pre_industrial',
      year: 1088,
      title: 'First Universities Emerge',
      location: 'Bologna, Italy',
      description: 'Medieval universities created for training clergy and lawyers. Knowledge organized into disciplines. Degrees became gatekeepers to professions.',
      keyInsight: 'Education became formalized as preparation for specific social roles.',
      characteristics: ['Latin as academic language', 'Lecture-based teaching', 'Credential gatekeeping', 'Elite access only'],
      scholars: [{ name: 'Hastings Rashdall', work: 'The Universities of Europe in the Middle Ages', year: 1895 }],
      counterArguments: ['Created knowledge preservation systems', 'Enabled specialization'],
      relatedEvents: ['eco-2'],
      createdAt: '',
    },
    {
      id: 'edu-3',
      timelineId: 'education',
      era: 'industrial',
      year: 1837,
      title: 'Horace Mann & Mass Schooling',
      location: 'Massachusetts, USA',
      description: 'Horace Mann created the "common school" - free, compulsory, age-graded education. Inspired by Prussian model designed to create obedient citizens and factory workers.',
      keyInsight: 'Mass schooling was designed for industrial society, not individual development.',
      characteristics: ['Age-grading', 'Compulsory attendance', 'Standardized curriculum', 'Bell schedules'],
      scholars: [
        { name: 'David Tyack', work: 'The One Best System', year: 1974 },
        { name: 'Larry Cuban', work: 'Tinkering Toward Utopia', year: 1995 },
      ],
      counterArguments: ['Democratized literacy', 'Created shared civic culture'],
      relatedEvents: ['emp-3', 'ind-2'],
      createdAt: '',
    },
    {
      id: 'edu-4',
      timelineId: 'education',
      era: 'industrial',
      year: 1892,
      title: 'Committee of Ten',
      location: 'USA',
      description: 'Harvard president Charles Eliot standardized high school curriculum. Created the subjects we still study today. Academic track prioritized over practical skills.',
      keyInsight: 'The subjects you studied in school were decided by a committee over 130 years ago.',
      characteristics: ['Subject silos', 'College prep focus', 'Carnegie units', 'Testing emphasis'],
      scholars: [{ name: 'Herbert Kliebard', work: 'The Struggle for the American Curriculum', year: 1986 }],
      counterArguments: ['Created shared standards', 'Enabled college access'],
      relatedEvents: ['emp-4'],
      createdAt: '',
    },
    {
      id: 'edu-5',
      timelineId: 'education',
      era: 'information',
      year: 2001,
      title: 'No Child Left Behind',
      location: 'USA',
      description: 'Federal testing mandates intensified standardization. Schools narrowed curriculum to tested subjects. Teaching to the test became dominant practice.',
      keyInsight: 'What gets measured becomes what matters - crowding out unmeasurable learning.',
      characteristics: ['High-stakes testing', 'School rankings', 'Curriculum narrowing', 'Data-driven decisions'],
      scholars: [{ name: 'Daniel Koretz', work: 'The Testing Charade', year: 2017 }],
      counterArguments: ['Exposed achievement gaps', 'Increased accountability'],
      relatedEvents: ['emp-5'],
      createdAt: '',
    },
    {
      id: 'edu-6',
      timelineId: 'education',
      era: 'ai',
      year: 2023,
      title: 'AI Tutors & ChatGPT',
      location: 'Global',
      description: 'AI can now provide personalized tutoring at scale. The factory model of education faces its first serious technological challenge. What happens when knowledge is free?',
      keyInsight: 'When AI can teach content, what becomes uniquely human about education?',
      characteristics: ['Personalized learning', 'Instant feedback', 'Content abundance', 'Assessment crisis'],
      scholars: [{ name: 'Sal Khan', work: 'Brave New Words', year: 2024 }],
      counterArguments: ['May deepen digital divide', 'Social learning irreplaceable'],
      relatedEvents: ['emp-6', 'com-6'],
      createdAt: '',
    },
  ],
  employment: [
    {
      id: 'emp-1',
      timelineId: 'employment',
      era: 'ancient',
      title: 'Task-Oriented Work',
      description: 'Work was done when needed, not by the clock. Farmers worked by seasons, craftspeople by orders. No concept of "employment" separate from life.',
      keyInsight: 'For most of human history, people worked when the work required, not by scheduled hours.',
      characteristics: ['Seasonal rhythms', 'Task completion focus', 'Work-life integration', 'No time clock'],
      scholars: [{ name: 'E.P. Thompson', work: 'Time, Work-Discipline and Industrial Capitalism', year: 1967 }],
      counterArguments: ['Vulnerable to scarcity', 'Limited specialization'],
      relatedEvents: ['edu-1'],
      createdAt: '',
    },
    {
      id: 'emp-2',
      timelineId: 'employment',
      era: 'pre_industrial',
      title: 'Guilds & Apprenticeships',
      description: 'Craftspeople organized into guilds that controlled training, quality, and market access. Learning a trade took 7+ years of apprenticeship.',
      keyInsight: 'Skills were learned through years of practice, not credentials.',
      characteristics: ['Master-apprentice model', 'Quality standards', 'Market protection', 'Long training'],
      scholars: [{ name: 'Richard Sennett', work: 'The Craftsman', year: 2008 }],
      counterArguments: ['Created artificial scarcity', 'Limited innovation'],
      relatedEvents: ['edu-2'],
      createdAt: '',
    },
    {
      id: 'emp-3',
      timelineId: 'employment',
      era: 'industrial',
      year: 1784,
      title: 'Factory System Emerges',
      location: 'Manchester, England',
      description: 'Cotton mills introduced clock time, standardized hours, and the separation of work from home. Workers became "hands" - appendages to machines.',
      keyInsight: 'The factory invented the modern concept of "employment" as we know it.',
      characteristics: ['Clock time', 'Standardized hours', 'Physical workplace', 'Wage labor'],
      scholars: [{ name: 'E.P. Thompson', work: 'The Making of the English Working Class', year: 1963 }],
      counterArguments: ['Created stable income', 'Enabled economic growth'],
      relatedEvents: ['edu-3', 'ind-1'],
      createdAt: '',
    },
    {
      id: 'emp-4',
      timelineId: 'employment',
      era: 'industrial',
      year: 1926,
      title: 'Ford\'s 40-Hour Week',
      location: 'Detroit, USA',
      description: 'Henry Ford standardized the 40-hour week and weekend. Not from generosity - so workers could buy the cars they made. Consumption became tied to production.',
      keyInsight: 'The "standard" work week was invented for mass consumption, not human flourishing.',
      characteristics: ['5-day week', '8-hour day', 'Weekend created', 'Consumer workers'],
      scholars: [{ name: 'Benjamin Hunnicutt', work: 'Work Without End', year: 1988 }],
      counterArguments: ['Improved working conditions', 'Created leisure time'],
      relatedEvents: ['edu-4', 'ind-2'],
      createdAt: '',
    },
    {
      id: 'emp-5',
      timelineId: 'employment',
      era: 'information',
      year: 1985,
      title: 'Knowledge Workers Rise',
      location: 'Global',
      description: 'Peter Drucker\'s "knowledge workers" become dominant. Work shifts from physical production to information processing. Offices replace factories.',
      keyInsight: 'We applied factory logic (hours, presence, supervision) to creative work.',
      characteristics: ['Information work', 'Office culture', 'Credential inflation', 'Meeting culture'],
      scholars: [{ name: 'Peter Drucker', work: 'The Effective Executive', year: 1967 }],
      counterArguments: ['Created high-paying jobs', 'Enabled innovation economy'],
      relatedEvents: ['edu-5'],
      createdAt: '',
    },
    {
      id: 'emp-6',
      timelineId: 'employment',
      era: 'ai',
      year: 2020,
      title: 'Remote Work & Gig Economy',
      location: 'Global',
      description: 'COVID proved knowledge work doesn\'t require offices. Gig platforms transformed employment. AI threatens to automate cognitive work. The employment contract frays.',
      keyInsight: 'The foundations of industrial employment are dissolving - what comes next?',
      characteristics: ['Remote work', 'Gig platforms', 'AI augmentation', 'Contract instability'],
      scholars: [{ name: 'David Graeber', work: 'Bullshit Jobs', year: 2018 }],
      counterArguments: ['Creates flexibility', 'Enables entrepreneurship'],
      relatedEvents: ['edu-6'],
      createdAt: '',
    },
  ],
  communication: [
    {
      id: 'com-1',
      timelineId: 'communication',
      era: 'ancient',
      title: 'Oral Tradition',
      description: 'All knowledge passed through spoken word and memory. Stories, songs, and rituals preserved culture. Elders held authority as knowledge keepers.',
      keyInsight: 'Memory and storytelling shaped how humans thought and organized.',
      characteristics: ['Memory-based', 'Narrative knowledge', 'Elder authority', 'Local transmission'],
      scholars: [{ name: 'Walter Ong', work: 'Orality and Literacy', year: 1982 }],
      counterArguments: ['Knowledge loss over time', 'Limited reach'],
      relatedEvents: ['edu-1', 'soc-1'],
      createdAt: '',
    },
    {
      id: 'com-2',
      timelineId: 'communication',
      era: 'pre_industrial',
      year: 1450,
      title: 'Gutenberg\'s Press',
      location: 'Mainz, Germany',
      description: 'Movable type enabled mass production of texts. Books became affordable. Ideas could spread without institutional approval. The Reformation followed.',
      keyInsight: 'When copying became easy, authority over knowledge shifted.',
      characteristics: ['Mass production', 'Standardized text', 'Vernacular languages', 'Individual reading'],
      scholars: [{ name: 'Elizabeth Eisenstein', work: 'The Printing Revolution', year: 1979 }],
      counterArguments: ['Enabled propaganda', 'Created information inequality'],
      relatedEvents: ['edu-2'],
      createdAt: '',
    },
    {
      id: 'com-3',
      timelineId: 'communication',
      era: 'industrial',
      year: 1844,
      title: 'Telegraph & Mass Media',
      location: 'Global',
      description: 'Instant long-distance communication transformed news, markets, and coordination. Later: telephone, radio, television. One-to-many broadcast dominates.',
      keyInsight: 'Electronic media created "mass" audiences and national consciousness.',
      characteristics: ['Instant transmission', 'Broadcast model', 'Mass audiences', 'Centralized control'],
      scholars: [{ name: 'Marshall McLuhan', work: 'Understanding Media', year: 1964 }],
      counterArguments: ['Enabled coordination', 'Spread education'],
      relatedEvents: ['ind-2'],
      createdAt: '',
    },
    {
      id: 'com-4',
      timelineId: 'communication',
      era: 'information',
      year: 1995,
      title: 'The World Wide Web',
      location: 'Global',
      description: 'The internet enabled many-to-many communication for the first time since the oral era. Anyone could publish. Traditional gatekeepers bypassed.',
      keyInsight: 'The web returned power to distributed, peer-to-peer communication.',
      characteristics: ['Many-to-many', 'Hyperlinks', 'Democratized publishing', 'Network effects'],
      scholars: [{ name: 'Tim Berners-Lee', work: 'Weaving the Web', year: 1999 }],
      counterArguments: ['Information overload', 'Quality control crisis'],
      relatedEvents: ['edu-5', 'eco-4'],
      createdAt: '',
    },
    {
      id: 'com-5',
      timelineId: 'communication',
      era: 'information',
      year: 2004,
      title: 'Social Media Era',
      location: 'Global',
      description: 'Facebook, Twitter, YouTube made everyone a publisher. Algorithms curate what we see. Attention becomes the scarce resource. Filter bubbles emerge.',
      keyInsight: 'Algorithms now shape what information reaches you more than any editor.',
      characteristics: ['Algorithmic curation', 'Attention economy', 'Virality', 'Filter bubbles'],
      scholars: [{ name: 'Eli Pariser', work: 'The Filter Bubble', year: 2011 }],
      counterArguments: ['Enables global connection', 'Democratizes voice'],
      relatedEvents: ['eco-5'],
      createdAt: '',
    },
    {
      id: 'com-6',
      timelineId: 'communication',
      era: 'ai',
      year: 2023,
      title: 'Generative AI',
      location: 'Global',
      description: 'AI can now generate text, images, video at scale. Information abundance reaches new extremes. Truth verification becomes critical. What is authentic?',
      keyInsight: 'When creation is easy, verification becomes the scarce skill.',
      characteristics: ['Content generation', 'Deepfakes', 'Information abundance', 'Authenticity crisis'],
      scholars: [],
      counterArguments: ['Democratizes creation', 'Enables personalization'],
      relatedEvents: ['edu-6'],
      createdAt: '',
    },
  ],
  economy: [
    {
      id: 'eco-1',
      timelineId: 'economy',
      era: 'ancient',
      title: 'Gift & Barter Economies',
      description: 'Exchange based on relationships, reciprocity, and immediate needs. No concept of profit maximization. Wealth meant relationships, not accumulation.',
      keyInsight: 'For most of history, economic activity strengthened social bonds rather than replacing them.',
      characteristics: ['Reciprocity', 'Relationship-based', 'No accumulation', 'Local exchange'],
      scholars: [{ name: 'Marcel Mauss', work: 'The Gift', year: 1925 }],
      counterArguments: ['Limited scale', 'Vulnerable to cheating'],
      relatedEvents: ['soc-1'],
      createdAt: '',
    },
    {
      id: 'eco-2',
      timelineId: 'economy',
      era: 'pre_industrial',
      year: 600,
      title: 'Money & Markets',
      description: 'Coins enabled anonymous exchange beyond relationships. Markets created price signals. Trade expanded beyond local communities.',
      keyInsight: 'Money made strangers into trading partners - and transformed social relations.',
      characteristics: ['Medium of exchange', 'Price discovery', 'Anonymous trade', 'Expanded range'],
      scholars: [{ name: 'David Graeber', work: 'Debt: The First 5000 Years', year: 2011 }],
      counterArguments: ['Enabled specialization', 'Created prosperity'],
      relatedEvents: ['edu-2'],
      createdAt: '',
    },
    {
      id: 'eco-3',
      timelineId: 'economy',
      era: 'industrial',
      year: 1602,
      title: 'Corporations & Stock Markets',
      location: 'Amsterdam',
      description: 'Dutch East India Company created the joint-stock corporation - wealth without responsibility. Stock markets enabled capital accumulation at scale.',
      keyInsight: 'Corporations gave capital a life independent of the humans who controlled it.',
      characteristics: ['Limited liability', 'Shareholder primacy', 'Capital accumulation', 'Market pricing'],
      scholars: [{ name: 'William Dalrymple', work: 'The Anarchy', year: 2019 }],
      counterArguments: ['Enabled large projects', 'Spread risk'],
      relatedEvents: ['ind-1'],
      createdAt: '',
    },
    {
      id: 'eco-4',
      timelineId: 'economy',
      era: 'information',
      year: 1971,
      title: 'End of Gold Standard',
      location: 'USA',
      description: 'Nixon ended dollar-gold convertibility. Money became pure fiat - backed by nothing but trust. Financialization accelerated.',
      keyInsight: 'Modern money is a collective agreement, not a thing with inherent value.',
      characteristics: ['Fiat currency', 'Floating exchange', 'Financial expansion', 'Debt-based growth'],
      scholars: [{ name: 'Rana Foroohar', work: 'Makers and Takers', year: 2016 }],
      counterArguments: ['Enabled economic flexibility', 'Managed crises'],
      relatedEvents: ['com-4'],
      createdAt: '',
    },
    {
      id: 'eco-5',
      timelineId: 'economy',
      era: 'information',
      year: 2008,
      title: 'Financial Crisis & Crypto',
      location: 'Global',
      description: 'Financial system nearly collapsed. Bitcoin launched as alternative to bank-controlled money. Distrust in institutions deepened.',
      keyInsight: 'The crisis revealed how much "the economy" depends on trust and collective belief.',
      characteristics: ['Systemic fragility', 'Decentralized alternatives', 'Trust crisis', 'Bailout politics'],
      scholars: [{ name: 'Adam Tooze', work: 'Crashed', year: 2018 }],
      counterArguments: ['System recovered', 'Crypto mostly speculative'],
      relatedEvents: ['com-5'],
      createdAt: '',
    },
    {
      id: 'eco-6',
      timelineId: 'economy',
      era: 'ai',
      year: 2024,
      title: 'AI & Value Creation',
      location: 'Global',
      description: 'AI can perform knowledge work. Who captures the value? Platform monopolies, attention economics, and AI convergence reshape how wealth is created and distributed.',
      keyInsight: 'When AI produces, what does human economic contribution become?',
      characteristics: ['Automation expansion', 'Platform economics', 'Value capture questions', 'UBI debates'],
      scholars: [],
      counterArguments: ['Creates new opportunities', 'Enables abundance'],
      relatedEvents: ['edu-6', 'emp-6'],
      createdAt: '',
    },
  ],
  social: [
    {
      id: 'soc-1',
      timelineId: 'social',
      era: 'ancient',
      title: 'Tribes & Kinship',
      description: 'Humans evolved in bands of 50-150 people. Everyone knew everyone. Trust came from relationships and reputation. Strangers were threats.',
      keyInsight: 'Our brains evolved for small groups - larger organization requires cultural technology.',
      characteristics: ['Dunbar number (~150)', 'Face-to-face trust', 'Kinship bonds', 'Reputation-based'],
      scholars: [{ name: 'Robin Dunbar', work: "Grooming, Gossip, and the Evolution of Language", year: 1996 }],
      counterArguments: ['Limited scale', 'In-group bias'],
      relatedEvents: ['eco-1', 'com-1'],
      createdAt: '',
    },
    {
      id: 'soc-2',
      timelineId: 'social',
      era: 'pre_industrial',
      year: -3000,
      title: 'Cities & Hierarchies',
      location: 'Mesopotamia',
      description: 'Agriculture enabled permanent settlements. Cities required new forms of coordination - writing, laws, bureaucracy, kings. Strangers had to cooperate.',
      keyInsight: 'Cities invented technologies for coordinating strangers - writing, law, hierarchy.',
      characteristics: ['Written records', 'Legal systems', 'Social hierarchy', 'Specialized roles'],
      scholars: [{ name: 'James C. Scott', work: 'Against the Grain', year: 2017 }],
      counterArguments: ['Enabled civilization', 'Created knowledge accumulation'],
      relatedEvents: ['edu-2', 'eco-2'],
      createdAt: '',
    },
    {
      id: 'soc-3',
      timelineId: 'social',
      era: 'industrial',
      year: 1648,
      title: 'Nation-States',
      location: 'Europe',
      description: 'Westphalia established sovereign nations. Nationalism created imagined communities of millions. Citizenship replaced kinship as primary identity.',
      keyInsight: 'Nations are imagined communities - people who will never meet feel connected.',
      characteristics: ['Territorial sovereignty', 'National identity', 'Citizenship rights', 'Standardization'],
      scholars: [{ name: 'Benedict Anderson', work: 'Imagined Communities', year: 1983 }],
      counterArguments: ['Enabled democracy', 'Created shared infrastructure'],
      relatedEvents: ['edu-3', 'ind-1'],
      createdAt: '',
    },
    {
      id: 'soc-4',
      timelineId: 'social',
      era: 'industrial',
      year: 1950,
      title: 'Nuclear Family & Suburbs',
      location: 'USA',
      description: 'Post-war prosperity created the suburban nuclear family as ideal. Extended family networks weakened. Consumerism replaced community ties.',
      keyInsight: 'The "traditional family" is actually a mid-20th century invention.',
      characteristics: ['Isolated households', 'Car dependency', 'Consumer identity', 'Weakened community'],
      scholars: [{ name: 'Stephanie Coontz', work: 'The Way We Never Were', year: 1992 }],
      counterArguments: ['Created privacy', 'Enabled mobility'],
      relatedEvents: ['emp-4'],
      createdAt: '',
    },
    {
      id: 'soc-5',
      timelineId: 'social',
      era: 'information',
      year: 1995,
      title: 'Network Society',
      location: 'Global',
      description: 'Internet created new forms of connection. Social networks transcend geography. Online communities form around interests, not proximity.',
      keyInsight: 'Digital networks reorganize society around flows of information, not places.',
      characteristics: ['Global connections', 'Interest communities', 'Weakened locality', 'New social forms'],
      scholars: [{ name: 'Manuel Castells', work: 'The Rise of the Network Society', year: 1996 }],
      counterArguments: ['Loneliness epidemic', 'Shallow connections'],
      relatedEvents: ['com-4', 'com-5'],
      createdAt: '',
    },
    {
      id: 'soc-6',
      timelineId: 'social',
      era: 'ai',
      year: 2024,
      title: 'AI Companions & Identity',
      location: 'Global',
      description: 'AI chatbots become companions. Virtual communities blur with physical. Identity becomes fluid across platforms. What makes community "real"?',
      keyInsight: 'When AI can simulate connection, what makes human community unique?',
      characteristics: ['AI relationships', 'Virtual identities', 'Blurred boundaries', 'Meaning questions'],
      scholars: [],
      counterArguments: ['New forms of support', 'Expanded connection'],
      relatedEvents: ['edu-6', 'com-6'],
      createdAt: '',
    },
  ],
  industrial: [
    {
      id: 'ind-1',
      timelineId: 'industrial',
      era: 'industrial',
      year: 1760,
      title: 'First Industrial Revolution',
      location: 'Britain',
      description: 'Steam power and mechanization. Textiles, iron, steam engines. Factories replaced cottage industry. Cities grew explosively. Nature became raw material.',
      keyInsight: 'Steam turned muscle work into machine work - transforming production and society.',
      characteristics: ['Steam power', 'Mechanization', 'Factory system', 'Urbanization'],
      scholars: [{ name: 'Eric Hobsbawm', work: 'The Age of Revolution', year: 1962 }],
      counterArguments: ['Created wealth', 'Raised living standards eventually'],
      relatedEvents: ['emp-3', 'eco-3'],
      createdAt: '',
    },
    {
      id: 'ind-2',
      timelineId: 'industrial',
      era: 'industrial',
      year: 1870,
      title: 'Second Industrial Revolution',
      location: 'USA & Germany',
      description: 'Electricity, oil, and mass production. Assembly lines, corporations, and scientific management. Taylor and Ford transformed work into measurable tasks.',
      keyInsight: 'Electricity brought power everywhere - and scientific management brought control.',
      characteristics: ['Electricity', 'Mass production', 'Scientific management', 'Corporations'],
      scholars: [{ name: 'Alfred Chandler', work: 'The Visible Hand', year: 1977 }],
      counterArguments: ['Consumer abundance', 'Middle class growth'],
      relatedEvents: ['edu-3', 'emp-4', 'com-3'],
      createdAt: '',
    },
    {
      id: 'ind-3',
      timelineId: 'industrial',
      era: 'information',
      year: 1970,
      title: 'Third Industrial Revolution',
      location: 'Global',
      description: 'Computers and automation. Digital technology enables information processing at scale. Manufacturing declines in wealthy nations. Service economy rises.',
      keyInsight: 'Computers automated mental routines - beginning the shift from making things to processing information.',
      characteristics: ['Computers', 'Automation', 'Service economy', 'Globalization'],
      scholars: [{ name: 'Jeremy Rifkin', work: 'The Third Industrial Revolution', year: 2011 }],
      counterArguments: ['Created tech sector', 'Enabled innovation'],
      relatedEvents: ['edu-5', 'emp-5', 'com-4'],
      createdAt: '',
    },
    {
      id: 'ind-4',
      timelineId: 'industrial',
      era: 'ai',
      year: 2016,
      title: 'Fourth Industrial Revolution',
      location: 'Global',
      description: 'AI, IoT, robotics, biotech converge. Physical and digital blur. Machines that learn. Unprecedented automation of cognitive work. Who benefits?',
      keyInsight: 'For the first time, machines can learn - transforming the nature of human value.',
      characteristics: ['AI & machine learning', 'IoT', 'Robotics', 'Biotech convergence'],
      scholars: [{ name: 'Klaus Schwab', work: 'The Fourth Industrial Revolution', year: 2016 }],
      counterArguments: ['Creates new possibilities', 'May free humans from drudgery'],
      relatedEvents: ['edu-6', 'emp-6', 'com-6'],
      createdAt: '',
    },
  ],
};

function ScholarBadge({ scholar }: { scholar: ScholarReference }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-origins-surface-light rounded text-xs">
      <BookOpen className="w-3 h-3 text-origins-dim" />
      <span className="text-origins-text">{scholar.name}</span>
      {scholar.year && <span className="text-origins-dim">({scholar.year})</span>}
    </div>
  );
}

export default function TimelineDetailPage() {
  const params = useParams();
  const timelineId = params.timelineId as TimelineId;
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [filterEra, setFilterEra] = useState<EraId | 'all'>('all');

  const timeline = TIMELINE_METADATA[timelineId];
  const events = MOCK_EVENTS[timelineId] || [];

  const filteredEvents = useMemo(() => {
    if (filterEra === 'all') return events;
    return events.filter(e => e.era === filterEra);
  }, [events, filterEra]);

  const eras = useMemo(() => {
    const uniqueEras = [...new Set(events.map(e => e.era))] as EraId[];
    return uniqueEras;
  }, [events]);

  if (!timeline) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-origins-dim">Timeline not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/learn/origins/timelines"
            className="inline-flex items-center gap-2 text-origins-dim hover:text-origins-text transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Timelines</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-6"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shrink-0"
              style={{ backgroundColor: `${timeline.color}20` }}
            >
              {timeline.emoji}
            </div>
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ color: timeline.color }}
              >
                Evolution of {timeline.label}
              </h1>
              <p className="text-lg text-origins-dim mb-4">
                {timeline.description}
              </p>
              <p className="text-origins-text">
                {events.length} key moments across {eras.length} eras
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Era Filter */}
      <section className="px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 text-origins-dim shrink-0">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter:</span>
            </div>
            <button
              onClick={() => setFilterEra('all')}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors shrink-0 ${
                filterEra === 'all'
                  ? 'bg-white/10 text-white'
                  : 'text-origins-dim hover:text-origins-text'
              }`}
            >
              All Eras
            </button>
            {eras.map(era => {
              const eraMeta = ERA_METADATA[era];
              return (
                <button
                  key={era}
                  onClick={() => setFilterEra(era)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors shrink-0 ${
                    filterEra === era
                      ? 'bg-white/10 text-white'
                      : 'text-origins-dim hover:text-origins-text'
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: eraMeta.color }}
                  />
                  {eraMeta.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Events */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto relative">
          {/* Timeline line */}
          <div
            className="absolute left-6 top-0 bottom-0 w-0.5"
            style={{
              background: `linear-gradient(to bottom, ${timeline.color}, ${timeline.color}50, transparent)`,
            }}
          />

          {/* Events */}
          <div className="space-y-6">
            {filteredEvents.map((event, index) => {
              const era = ERA_METADATA[event.era as EraId];
              const isSelected = selectedEvent === event.id;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-16"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute left-4 w-5 h-5 rounded-full border-4 border-origins-bg"
                    style={{ backgroundColor: era.color }}
                  />

                  {/* Arrow connector */}
                  {index < filteredEvents.length - 1 && (
                    <ArrowRight
                      className="absolute left-[18px] top-8 w-3 h-3 text-origins-dim"
                      style={{ transform: 'rotate(90deg)' }}
                    />
                  )}

                  {/* Event card */}
                  <div
                    onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                    className={`p-5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-white/30 bg-white/5'
                        : 'border-origins hover:border-white/20'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-lg font-bold text-origins-text">{event.title}</h3>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: `${era.color}30`, color: era.color }}
                          >
                            {era.label}
                          </span>
                          {event.year && (
                            <span className="text-sm text-origins-dim">{event.year}</span>
                          )}
                        </div>
                        {event.location && (
                          <p className="text-sm text-origins-dim">{event.location}</p>
                        )}
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-origins-dim shrink-0 transition-transform ${
                          isSelected ? 'rotate-90' : ''
                        }`}
                      />
                    </div>

                    {/* Description */}
                    <p className="text-origins-text mb-3">{event.description}</p>

                    {/* Key Insight */}
                    <div
                      className="p-3 rounded-lg border-l-2 mb-3"
                      style={{ borderColor: timeline.color, backgroundColor: `${timeline.color}10` }}
                    >
                      <p className="text-sm text-origins-text italic">
                        "{event.keyInsight}"
                      </p>
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-origins space-y-4">
                            {/* Characteristics */}
                            <div>
                              <h4 className="text-sm font-bold text-origins-text mb-2">Characteristics</h4>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                {event.characteristics.map((char, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm text-origins-dim">
                                    <ChevronRight className="w-3 h-3" style={{ color: timeline.color }} />
                                    {char}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Scholars */}
                            {event.scholars && event.scholars.length > 0 && (
                              <div>
                                <h4 className="text-sm font-bold text-origins-text mb-2 flex items-center gap-2">
                                  <BookOpen className="w-4 h-4" />
                                  Sources
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {event.scholars.map((scholar, i) => (
                                    <ScholarBadge key={i} scholar={scholar} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Counter Arguments */}
                            {event.counterArguments && event.counterArguments.length > 0 && (
                              <div>
                                <h4 className="text-sm font-bold text-origins-text mb-2 flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4" />
                                  Counter-arguments
                                </h4>
                                <ul className="space-y-1">
                                  {event.counterArguments.map((arg, i) => (
                                    <li key={i} className="text-sm text-origins-dim flex items-start gap-2">
                                      <span className="text-amber-500">•</span>
                                      {arg}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Related Events */}
                            {event.relatedEvents && event.relatedEvents.length > 0 && (
                              <div>
                                <h4 className="text-sm font-bold text-origins-text mb-2 flex items-center gap-2">
                                  <Link2 className="w-4 h-4" />
                                  Connected Changes
                                </h4>
                                <p className="text-xs text-origins-dim">
                                  This event connects to changes in other systems. Visit The Loom to see these connections.
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Other Timelines */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-origins-text mb-4">Explore Other Timelines</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(TIMELINE_METADATA)
              .filter(([id]) => id !== timelineId)
              .map(([id, meta]) => (
                <Link
                  key={id}
                  href={`/learn/origins/timelines/${id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-origins-surface rounded-lg border border-origins hover:border-white/20 transition-all group"
                >
                  <span>{meta.emoji}</span>
                  <span className="text-sm text-origins-dim group-hover:text-origins-text transition-colors">
                    {meta.label}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
