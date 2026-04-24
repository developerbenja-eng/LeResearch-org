'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  BookOpen,
  Calendar,
  User,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  year: number;
  endYear?: number;
  title: string;
  description?: string;
  type: 'period' | 'event' | 'scholar' | 'work';
  color: string;
}

interface TimelineVisualizationProps {
  timelineId: string;
  content: string;
}

// Color palette for different periods/events
const COLORS = [
  { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-purple-400', fill: '#a855f7' },
  { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-400', fill: '#3b82f6' },
  { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-400', fill: '#10b981' },
  { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-400', fill: '#f59e0b' },
  { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-rose-400', fill: '#f43f5e' },
  { bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-cyan-400', fill: '#06b6d4' },
  { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-400', fill: '#f97316' },
];

// Extract timeline data from markdown content
function parseTimelineEvents(content: string, timelineId: string): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  let colorIndex = 0;

  // Timeline-specific parsing based on content patterns
  const patterns = [
    // Year ranges in parentheses: (~1760 - ~1840) or (1870-1914)
    /\(~?(\d{3,4})\s*[-–—]\s*~?(\d{3,4})\)/g,
    // Year ranges without parentheses after headings
    /(?:^|\n)##?\s+.+?\s+\(~?(\d{3,4})\s*[-–—]\s*~?(\d{3,4})/gm,
    // Single years with context: "in 1776" or "(1962)"
    /\((\d{4})\)/g,
    // Scholar with dates: "Name (1723-1790)"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+\((\d{4})\s*[-–—]\s*(\d{4})\)/g,
    // Key works with years: *Book Title* (1962)
    /\*([^*]+)\*\s+\((\d{4})\)/g,
  ];

  // Pre-defined timeline events based on timeline ID
  const timelineData: Record<string, TimelineEvent[]> = {
    'education-evolution': [
      { id: 'ancient', year: -500, endYear: 500, title: 'Ancient & Classical Education', description: 'Greek academies, Roman rhetoric, Chinese civil service exams', type: 'period', color: COLORS[0].fill },
      { id: 'medieval', year: 500, endYear: 1400, title: 'Medieval Period', description: 'Cathedral schools, early universities, Islamic madrasas', type: 'period', color: COLORS[1].fill },
      { id: 'keju', year: 605, title: 'Chinese Keju Exam System', description: 'Imperial examination system established', type: 'event', color: COLORS[2].fill },
      { id: 'bologna', year: 1088, title: 'University of Bologna', description: 'First European university founded', type: 'event', color: COLORS[1].fill },
      { id: 'printing', year: 1450, title: 'Printing Press', description: 'Gutenberg revolutionizes knowledge distribution', type: 'event', color: COLORS[3].fill },
      { id: 'reformation', year: 1500, endYear: 1700, title: 'Reformation & Early Modern', description: 'Protestant emphasis on literacy', type: 'period', color: COLORS[2].fill },
      { id: 'prussia', year: 1763, title: 'Prussian Compulsory Education', description: 'Frederick the Great mandates schooling', type: 'event', color: COLORS[4].fill },
      { id: 'common', year: 1837, title: 'Horace Mann & Common School', description: 'Massachusetts public education reform', type: 'event', color: COLORS[0].fill },
      { id: 'mass', year: 1870, endYear: 1920, title: 'Mass Schooling Era', description: 'Compulsory education spreads globally', type: 'period', color: COLORS[5].fill },
      { id: 'dewey', year: 1916, title: 'Dewey: Democracy & Education', description: 'Progressive education movement', type: 'work', color: COLORS[0].fill },
      { id: 'bowles', year: 1976, title: 'Bowles & Gintis: Schooling', description: 'Correspondence principle critique', type: 'work', color: COLORS[4].fill },
      { id: 'tyack', year: 1995, title: 'Tyack & Cuban: Grammar of Schooling', description: 'Institutional persistence theory', type: 'work', color: COLORS[2].fill },
      { id: 'digital', year: 2000, endYear: 2025, title: 'Digital Transformation', description: 'Internet, MOOCs, AI tutoring', type: 'period', color: COLORS[6].fill },
    ],
    'employment-evolution': [
      { id: 'preindustrial', year: 1000, endYear: 1760, title: 'Pre-Industrial Work', description: 'Task-oriented, seasonal, guild system', type: 'period', color: COLORS[0].fill },
      { id: 'smith', year: 1776, title: 'Adam Smith: Wealth of Nations', description: 'Division of labor theory', type: 'work', color: COLORS[1].fill },
      { id: 'industrial', year: 1760, endYear: 1900, title: 'Industrial Transformation', description: 'Factory system, time discipline', type: 'period', color: COLORS[2].fill },
      { id: 'marx', year: 1844, title: 'Marx: Alienation Theory', description: 'Economic and Philosophic Manuscripts', type: 'work', color: COLORS[4].fill },
      { id: 'taylor', year: 1911, title: 'Taylor: Scientific Management', description: 'Time-motion studies, efficiency', type: 'work', color: COLORS[3].fill },
      { id: 'ford', year: 1914, title: 'Ford: $5 Day', description: 'High wages, mass consumption', type: 'event', color: COLORS[5].fill },
      { id: 'wagner', year: 1935, title: 'Wagner Act', description: "Labor's Magna Carta", type: 'event', color: COLORS[0].fill },
      { id: 'corporate', year: 1920, endYear: 1980, title: 'Corporate Capitalism', description: 'Careers, benefits, middle class', type: 'period', color: COLORS[1].fill },
      { id: 'braverman', year: 1974, title: 'Braverman: Deskilling Thesis', description: 'Labor and Monopoly Capital', type: 'work', color: COLORS[4].fill },
      { id: 'patco', year: 1981, title: 'PATCO Strike Crushed', description: 'Neoliberal turn begins', type: 'event', color: COLORS[4].fill },
      { id: 'gig', year: 2009, endYear: 2025, title: 'Gig Economy', description: 'Platforms, precarity, flexibility', type: 'period', color: COLORS[6].fill },
    ],
    'communication-evolution': [
      { id: 'oral', year: -50000, endYear: -3000, title: 'Oral Cultures', description: 'Memory, rhythm, communal participation', type: 'period', color: COLORS[0].fill },
      { id: 'writing', year: -3400, title: 'Cuneiform Writing', description: 'Mesopotamia develops writing', type: 'event', color: COLORS[1].fill },
      { id: 'alphabet', year: -1050, title: 'Phoenician Alphabet', description: 'Phonetic writing spreads', type: 'event', color: COLORS[2].fill },
      { id: 'korea', year: 1377, title: 'Jikji: Metal Movable Type', description: 'Korea, 78 years before Gutenberg', type: 'event', color: COLORS[3].fill },
      { id: 'gutenberg', year: 1455, title: 'Gutenberg Bible', description: 'European printing revolution', type: 'event', color: COLORS[4].fill },
      { id: 'print', year: 1450, endYear: 1800, title: 'Print Revolution', description: 'Mass literacy, Reformation, Science', type: 'period', color: COLORS[5].fill },
      { id: 'telegraph', year: 1844, title: 'Telegraph', description: 'Instant long-distance communication', type: 'event', color: COLORS[6].fill },
      { id: 'radio', year: 1920, endYear: 1950, title: 'Radio Era', description: 'Mass broadcasting begins', type: 'period', color: COLORS[0].fill },
      { id: 'mcluhan', year: 1964, title: 'McLuhan: Understanding Media', description: 'The medium is the message', type: 'work', color: COLORS[1].fill },
      { id: 'tv', year: 1950, endYear: 1990, title: 'Television Age', description: 'Visual culture dominates', type: 'period', color: COLORS[2].fill },
      { id: 'postman', year: 1985, title: 'Postman: Amusing Ourselves to Death', description: 'TV discourse critique', type: 'work', color: COLORS[4].fill },
      { id: 'internet', year: 1991, title: 'World Wide Web', description: 'Tim Berners-Lee launches WWW', type: 'event', color: COLORS[3].fill },
      { id: 'social', year: 2004, endYear: 2025, title: 'Social Media Era', description: 'Platforms, algorithms, misinformation', type: 'period', color: COLORS[6].fill },
    ],
    'markets-economy-evolution': [
      { id: 'gift', year: -10000, endYear: -3000, title: 'Gift & Reciprocity', description: 'Social bonds, not exchange', type: 'period', color: COLORS[0].fill },
      { id: 'money', year: -600, title: 'Lydian Coinage', description: 'First standardized coins', type: 'event', color: COLORS[1].fill },
      { id: 'mercantilism', year: 1500, endYear: 1776, title: 'Mercantilism', description: 'Nations compete for gold', type: 'period', color: COLORS[2].fill },
      { id: 'smith', year: 1776, title: 'Adam Smith: Wealth of Nations', description: 'Invisible hand, free markets', type: 'work', color: COLORS[3].fill },
      { id: 'marx', year: 1867, title: 'Marx: Capital', description: 'Critique of political economy', type: 'work', color: COLORS[4].fill },
      { id: 'industrial', year: 1760, endYear: 1920, title: 'Industrial Capitalism', description: 'Factories, wage labor, cycles', type: 'period', color: COLORS[5].fill },
      { id: 'keynes', year: 1936, title: 'Keynes: General Theory', description: 'Government stabilization', type: 'work', color: COLORS[0].fill },
      { id: 'polanyi', year: 1944, title: 'Polanyi: Great Transformation', description: 'Fictitious commodities', type: 'work', color: COLORS[1].fill },
      { id: 'keynesian', year: 1945, endYear: 1980, title: 'Keynesian Era', description: 'Golden age, welfare states', type: 'period', color: COLORS[2].fill },
      { id: 'neoliberal', year: 1980, endYear: 2008, title: 'Neoliberalism', description: 'Deregulation, financialization', type: 'period', color: COLORS[4].fill },
      { id: 'graeber', year: 2011, title: 'Graeber: Debt', description: 'The barter myth debunked', type: 'work', color: COLORS[3].fill },
      { id: 'piketty', year: 2014, title: 'Piketty: Capital in 21st Century', description: 'r > g, wealth inequality', type: 'work', color: COLORS[6].fill },
      { id: 'platform', year: 2008, endYear: 2025, title: 'Platform Economy', description: 'Data extraction, surveillance', type: 'period', color: COLORS[5].fill },
    ],
    'environment-evolution': [
      { id: 'prehuman', year: -10000, endYear: 1750, title: 'Pre-Industrial', description: 'Local impacts, adaptation', type: 'period', color: COLORS[0].fill },
      { id: 'industrial', year: 1760, endYear: 1970, title: 'Industrial Impact', description: 'Coal, smog, rivers as sewers', type: 'period', color: COLORS[1].fill },
      { id: 'conservation', year: 1872, title: 'Yellowstone National Park', description: 'First national park', type: 'event', color: COLORS[2].fill },
      { id: 'leopold', year: 1949, title: 'Leopold: Sand County Almanac', description: 'The land ethic', type: 'work', color: COLORS[3].fill },
      { id: 'carson', year: 1962, title: 'Carson: Silent Spring', description: 'DDT, environmental movement', type: 'work', color: COLORS[4].fill },
      { id: 'earthday', year: 1970, title: 'First Earth Day', description: 'EPA created, Clean Air Act', type: 'event', color: COLORS[5].fill },
      { id: 'awakening', year: 1970, endYear: 2000, title: 'Environmental Awakening', description: 'Regulations, ozone success', type: 'period', color: COLORS[6].fill },
      { id: 'ostrom', year: 1990, title: 'Ostrom: Governing the Commons', description: 'Commons can work', type: 'work', color: COLORS[0].fill },
      { id: 'climate', year: 2000, endYear: 2025, title: 'Climate Crisis Era', description: 'Existential risk, 1.5C breach', type: 'period', color: COLORS[4].fill },
      { id: 'malm', year: 2016, title: 'Malm: Fossil Capital', description: 'Steam won for labor control', type: 'work', color: COLORS[1].fill },
    ],
    'industrial-revolutions': [
      { id: 'preindustrial', year: 1000, endYear: 1760, title: 'Pre-Industrial Baseline', description: 'Muscle, wind, water power', type: 'period', color: COLORS[0].fill },
      { id: 'first', year: 1760, endYear: 1840, title: 'First Industrial Revolution', description: 'Steam, textiles, Britain', type: 'period', color: COLORS[1].fill },
      { id: 'watt', year: 1769, title: 'Watt Steam Engine', description: 'Improved efficiency', type: 'event', color: COLORS[2].fill },
      { id: 'luddites', year: 1811, title: 'Luddite Rebellion', description: 'Machine-breaking movement', type: 'event', color: COLORS[3].fill },
      { id: 'second', year: 1870, endYear: 1914, title: 'Second Industrial Revolution', description: 'Electricity, steel, oil', type: 'period', color: COLORS[4].fill },
      { id: 'bessemer', year: 1856, title: 'Bessemer Steel Process', description: 'Cheap steel at scale', type: 'event', color: COLORS[5].fill },
      { id: 'ford', year: 1913, title: 'Ford Assembly Line', description: 'Mass production begins', type: 'event', color: COLORS[6].fill },
      { id: 'thompson', year: 1963, title: 'Thompson: Making of Working Class', description: 'History from below', type: 'work', color: COLORS[0].fill },
      { id: 'third', year: 1950, endYear: 2000, title: 'Third Industrial Revolution', description: 'Electronics, computing', type: 'period', color: COLORS[1].fill },
      { id: 'transistor', year: 1947, title: 'Transistor Invented', description: 'Digital age begins', type: 'event', color: COLORS[2].fill },
      { id: 'www', year: 1991, title: 'World Wide Web', description: 'Internet goes public', type: 'event', color: COLORS[3].fill },
      { id: 'fourth', year: 2010, endYear: 2025, title: 'Fourth Industrial Revolution', description: 'AI, IoT, biotech', type: 'period', color: COLORS[4].fill },
    ],
    'social-structures-evolution': [
      { id: 'huntergatherer', year: -100000, endYear: -10000, title: 'Hunter-Gatherer Bands', description: 'Cooperative breeding, egalitarian', type: 'period', color: COLORS[0].fill },
      { id: 'agricultural', year: -10000, endYear: 1500, title: 'Agricultural Societies', description: 'Patriarchy, property, hierarchy', type: 'period', color: COLORS[1].fill },
      { id: 'aries', year: 1960, title: 'Ariès: Centuries of Childhood', description: 'Childhood as invention', type: 'work', color: COLORS[2].fill },
      { id: 'industrial', year: 1750, endYear: 1950, title: 'Industrial Family', description: 'Nuclear family, separate spheres', type: 'period', color: COLORS[3].fill },
      { id: 'breadwinner', year: 1950, endYear: 1970, title: '1950s Breadwinner Model', description: 'Historical anomaly (Coontz)', type: 'period', color: COLORS[4].fill },
      { id: 'coontz', year: 1992, title: 'Coontz: Way We Never Were', description: '1950s myth debunked', type: 'work', color: COLORS[5].fill },
      { id: 'hrdy', year: 2009, title: 'Hrdy: Mothers and Others', description: 'Alloparenting thesis', type: 'work', color: COLORS[0].fill },
      { id: 'contemporary', year: 1970, endYear: 2025, title: 'Contemporary Diversity', description: 'Dual-earner, single-parent, chosen', type: 'period', color: COLORS[6].fill },
    ],
  };

  return timelineData[timelineId] || [];
}

export default function TimelineVisualization({
  timelineId,
  content
}: TimelineVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);

  const events = useMemo(() => parseTimelineEvents(content, timelineId), [content, timelineId]);

  // Calculate timeline bounds
  const { minYear, maxYear } = useMemo(() => {
    if (events.length === 0) return { minYear: 1000, maxYear: 2025 };
    const years = events.flatMap(e => [e.year, e.endYear].filter(Boolean) as number[]);
    return {
      minYear: Math.min(...years),
      maxYear: Math.max(...years)
    };
  }, [events]);

  const timeSpan = maxYear - minYear;
  const visibleSpan = timeSpan / zoom;

  // Get position for a year
  const getPosition = (year: number) => {
    const adjustedYear = year - offset;
    return ((adjustedYear - minYear) / visibleSpan) * 100;
  };

  // Navigate timeline
  const navigate = (direction: 'left' | 'right') => {
    const step = visibleSpan * 0.2;
    setOffset(prev => {
      const newOffset = direction === 'left' ? prev - step : prev + step;
      return Math.max(0, Math.min(newOffset, timeSpan - visibleSpan));
    });
  };

  // Filter visible events
  const visibleEvents = events.filter(e => {
    const pos = getPosition(e.year);
    const endPos = e.endYear ? getPosition(e.endYear) : pos;
    return endPos >= -10 && pos <= 110;
  });

  // Separate periods from point events
  const periods = visibleEvents.filter(e => e.type === 'period' && e.endYear);
  const pointEvents = visibleEvents.filter(e => e.type !== 'period' || !e.endYear);

  return (
    <div className="relative">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('left')}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('right')}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm text-neutral-400">
          {Math.round(minYear + offset)} — {Math.round(minYear + offset + visibleSpan)}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-neutral-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(4, z + 0.25))}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div
        ref={containerRef}
        className="relative bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6 overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {/* Time axis */}
        <div className="absolute bottom-6 left-6 right-6 h-1 bg-neutral-800 rounded-full">
          {/* Year markers */}
          {Array.from({ length: 11 }).map((_, i) => {
            const year = Math.round(minYear + offset + (visibleSpan * i) / 10);
            return (
              <div
                key={i}
                className="absolute bottom-0 transform -translate-x-1/2"
                style={{ left: `${i * 10}%` }}
              >
                <div className="w-0.5 h-3 bg-neutral-700 mb-1" />
                <span className="text-xs text-neutral-500 whitespace-nowrap">
                  {year < 0 ? `${Math.abs(year)} BCE` : year}
                </span>
              </div>
            );
          })}
        </div>

        {/* Period bars */}
        <div className="relative h-32 mb-16">
          {periods.map((period, idx) => {
            const startPos = Math.max(0, getPosition(period.year));
            const endPos = Math.min(100, getPosition(period.endYear!));
            const width = endPos - startPos;

            if (width <= 0) return null;

            return (
              <motion.div
                key={period.id}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="absolute cursor-pointer group"
                style={{
                  left: `${startPos}%`,
                  width: `${width}%`,
                  top: `${(idx % 3) * 40}px`,
                  height: '32px',
                  backgroundColor: period.color,
                  opacity: 0.3,
                }}
                onClick={() => setSelectedEvent(period)}
              >
                <div
                  className="absolute inset-0 rounded-lg border-2 transition-all group-hover:opacity-100 opacity-60"
                  style={{ borderColor: period.color }}
                />
                <div className="absolute inset-0 flex items-center justify-center px-2 overflow-hidden">
                  <span className="text-xs font-medium text-white truncate opacity-80 group-hover:opacity-100">
                    {period.title}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Point events */}
        <div className="relative h-48 mb-8">
          {pointEvents.map((event, idx) => {
            const pos = getPosition(event.year);
            if (pos < -5 || pos > 105) return null;

            const row = idx % 4;
            const iconColors: Record<string, string> = {
              event: 'bg-blue-500',
              scholar: 'bg-purple-500',
              work: 'bg-amber-500',
            };

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="absolute cursor-pointer group"
                style={{
                  left: `${pos}%`,
                  top: `${row * 45}px`,
                  transform: 'translateX(-50%)',
                }}
                onClick={() => setSelectedEvent(event)}
              >
                {/* Connector line */}
                <div
                  className="absolute w-0.5 bg-neutral-700 left-1/2 -translate-x-1/2"
                  style={{
                    top: '100%',
                    height: `${(4 - row) * 45 + 85}px`,
                  }}
                />

                {/* Event dot */}
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className={`relative w-10 h-10 rounded-full ${iconColors[event.type] || 'bg-neutral-600'}
                    flex items-center justify-center shadow-lg group-hover:ring-4 ring-white/20 transition-all`}
                >
                  {event.type === 'work' && <BookOpen className="w-5 h-5 text-white" />}
                  {event.type === 'scholar' && <User className="w-5 h-5 text-white" />}
                  {event.type === 'event' && <Calendar className="w-5 h-5 text-white" />}
                </motion.div>

                {/* Label */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs font-medium text-white truncate">{event.title}</p>
                  <p className="text-xs text-neutral-400">{event.year}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-neutral-400">Event</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-neutral-400">Work</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-3 rounded bg-purple-500/30 border border-purple-500" />
            <span className="text-neutral-400">Period</span>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-neutral-900 rounded-2xl border border-neutral-800 p-6 z-50 shadow-2xl"
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>

              <div
                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                style={{ backgroundColor: selectedEvent.color + '33' }}
              >
                {selectedEvent.type === 'period' && <Calendar className="w-6 h-6" style={{ color: selectedEvent.color }} />}
                {selectedEvent.type === 'work' && <BookOpen className="w-6 h-6" style={{ color: selectedEvent.color }} />}
                {selectedEvent.type === 'event' && <Calendar className="w-6 h-6" style={{ color: selectedEvent.color }} />}
                {selectedEvent.type === 'scholar' && <User className="w-6 h-6" style={{ color: selectedEvent.color }} />}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{selectedEvent.title}</h3>

              <p className="text-sm text-purple-400 mb-4">
                {selectedEvent.year < 0 ? `${Math.abs(selectedEvent.year)} BCE` : selectedEvent.year}
                {selectedEvent.endYear && ` — ${selectedEvent.endYear}`}
              </p>

              {selectedEvent.description && (
                <p className="text-neutral-300">{selectedEvent.description}</p>
              )}

              <div className="mt-6 pt-4 border-t border-neutral-800">
                <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-400 capitalize">
                  {selectedEvent.type}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
