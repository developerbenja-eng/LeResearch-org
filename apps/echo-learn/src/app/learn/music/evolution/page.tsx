'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Globe, Clock, Music2, ChevronRight, Play, MapPin,
  ArrowRight, Sparkles, ExternalLink
} from 'lucide-react';

// Types
interface EvolutionJourney {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  stops: JourneyStop[];
  modernExamples: string[];
  tedTalk?: {
    speaker: string;
    title: string;
    url: string;
  };
}

interface JourneyStop {
  id: string;
  location: string;
  region: string;
  era: string;
  year?: number;
  name: string;
  description: string;
  characteristics: string[];
  soundDescription: string;
  image?: string;
}

// Data: Musical pattern evolution journeys
const EVOLUTION_JOURNEYS: EvolutionJourney[] = [
  {
    id: 'clave-rhythm',
    name: 'The Clave Journey',
    subtitle: 'From Africa to the World',
    description: 'Follow the 3-2 clave rhythm as it traveled from West Africa through the Caribbean to become the foundation of Latin music, jazz, and modern pop.',
    color: '#f59e0b',
    icon: '🥁',
    tedTalk: {
      speaker: 'Jorge Drexler',
      title: 'Poetry, music and identity',
      url: 'https://www.ted.com/talks/jorge_drexler_poetry_music_and_identity',
    },
    stops: [
      {
        id: 'africa',
        location: 'West Africa',
        region: 'Africa',
        era: 'Ancient',
        name: 'African Polyrhythms',
        description: 'The clave pattern originates from the complex polyrhythmic traditions of West African music, where multiple rhythms interlock to create a unified whole.',
        characteristics: ['Polyrhythmic layering', 'Call and response', 'Communal drumming'],
        soundDescription: 'Interlocking patterns on djembe and talking drums',
      },
      {
        id: 'cuba',
        location: 'Cuba',
        region: 'Caribbean',
        era: '1500s-1800s',
        year: 1600,
        name: 'Son Cubano',
        description: 'Enslaved Africans brought their rhythms to Cuba, where they merged with Spanish guitar traditions to create Son Cubano - the mother of salsa.',
        characteristics: ['Spanish guitar meets African drums', 'The "tumbao" bass pattern', 'Clave becomes explicit'],
        soundDescription: 'Tres guitar, bongos, maracas with clear 3-2 clave',
      },
      {
        id: 'neworleans',
        location: 'New Orleans',
        region: 'USA',
        era: '1890s-1920s',
        year: 1900,
        name: 'Jazz & Blues',
        description: 'The clave influenced the syncopated rhythms of early jazz in New Orleans, creating the "swing" feel that defines American music.',
        characteristics: ['Syncopated brass', 'Second line rhythms', 'Swing feel emergence'],
        soundDescription: 'Brass bands with syncopated drums and piano',
      },
      {
        id: 'newyork',
        location: 'New York',
        region: 'USA',
        era: '1960s-1970s',
        year: 1970,
        name: 'Salsa & Latin Jazz',
        description: 'Puerto Rican and Cuban immigrants in NYC fused their traditions with American jazz and R&B, creating salsa and Latin jazz.',
        characteristics: ['Fania Records sound', 'Timbales and congas', 'Horn arrangements'],
        soundDescription: 'Full orchestra salsa with Fania-style arrangements',
      },
      {
        id: 'global',
        location: 'Worldwide',
        region: 'Global',
        era: '1990s-Present',
        year: 2000,
        name: 'Modern Pop & Reggaeton',
        description: 'The clave lives on in reggaeton\'s "dembow" beat, electronic dance music, and countless pop hits that use its hypnotic pattern.',
        characteristics: ['Dembow rhythm', 'Electronic production', 'Global fusion'],
        soundDescription: 'Reggaeton dembow with electronic bass and synths',
      },
    ],
    modernExamples: ['Despacito - Luis Fonsi', 'Bailando - Enrique Iglesias', 'Mi Gente - J Balvin'],
  },
  {
    id: 'blues-scale',
    name: 'The Blues Journey',
    subtitle: 'From Spirituals to Rock',
    description: 'Trace how the blue notes traveled from African American spirituals through Mississippi Delta blues to become the foundation of rock, soul, and hip-hop.',
    color: '#3b82f6',
    icon: '🎸',
    stops: [
      {
        id: 'africa-blues',
        location: 'West Africa',
        region: 'Africa',
        era: 'Ancient',
        name: 'African Scales',
        description: 'West African musical traditions used scales with "bent" notes that didn\'t fit European tuning - these would become blue notes.',
        characteristics: ['Microtonal bending', 'Pentatonic foundations', 'Vocal melisma'],
        soundDescription: 'Kora and vocal traditions with bent pitches',
      },
      {
        id: 'spirituals',
        location: 'American South',
        region: 'USA',
        era: '1700s-1800s',
        year: 1800,
        name: 'Work Songs & Spirituals',
        description: 'Enslaved Africans preserved their musical traditions through work songs and spirituals, embedding blue notes into American music.',
        characteristics: ['Field hollers', 'Call and response', 'Religious adaptation'],
        soundDescription: 'Acapella spirituals with "worried" notes',
      },
      {
        id: 'delta',
        location: 'Mississippi Delta',
        region: 'USA',
        era: '1900s-1930s',
        year: 1920,
        name: 'Delta Blues',
        description: 'Robert Johnson, Son House, and others codified the blues in the Mississippi Delta, creating the templates that would define American music.',
        characteristics: ['12-bar blues form', 'Slide guitar', 'AAB lyric pattern'],
        soundDescription: 'Acoustic slide guitar with raw vocals',
      },
      {
        id: 'chicago',
        location: 'Chicago',
        region: 'USA',
        era: '1940s-1960s',
        year: 1950,
        name: 'Electric Blues',
        description: 'Muddy Waters, Howlin\' Wolf, and others electrified the blues in Chicago, setting the stage for rock and roll.',
        characteristics: ['Electric guitar', 'Amplified harmonica', 'Full band sound'],
        soundDescription: 'Electric guitar with wailing bends over driving rhythm',
      },
      {
        id: 'uk-rock',
        location: 'London & Liverpool',
        region: 'UK',
        era: '1960s',
        year: 1965,
        name: 'British Blues & Rock',
        description: 'British musicians like The Rolling Stones, Led Zeppelin, and Cream learned from American blues records and transformed them into rock.',
        characteristics: ['Heavy amplification', 'Extended solos', 'Blues-rock fusion'],
        soundDescription: 'Overdriven guitar riffs with blues scale foundations',
      },
      {
        id: 'global-rock',
        location: 'Worldwide',
        region: 'Global',
        era: '1970s-Present',
        year: 2000,
        name: 'Global Rock & Hip-Hop',
        description: 'The blues scale became universal - from rock and metal to hip-hop and R&B, the blue notes are everywhere.',
        characteristics: ['Sample-based hip-hop', 'Modern R&B', 'Global rock'],
        soundDescription: 'Blue notes in every genre from trap to indie rock',
      },
    ],
    modernExamples: ['Since I\'ve Been Loving You - Led Zeppelin', 'Red House - Jimi Hendrix', 'Nuthin\' But a G Thang - Dr. Dre'],
  },
  {
    id: 'four-chord',
    name: 'The Four Chord Journey',
    subtitle: 'I-V-vi-IV Through the Decades',
    description: 'Watch how one chord progression conquered popular music, from 1950s doo-wop to today\'s biggest hits.',
    color: '#ec4899',
    icon: '🎹',
    stops: [
      {
        id: 'classical',
        location: 'Europe',
        region: 'Europe',
        era: '1700s',
        year: 1750,
        name: 'Classical Foundations',
        description: 'The relationship between I, IV, V, and vi chords was established in Baroque and Classical music as functional harmony.',
        characteristics: ['Functional harmony', 'Voice leading', 'Cadence patterns'],
        soundDescription: 'Harpsichord and strings in classical style',
      },
      {
        id: 'doowop',
        location: 'USA',
        region: 'USA',
        era: '1950s',
        year: 1955,
        name: 'Doo-Wop',
        description: 'Street corner vocal groups discovered that I-vi-IV-V (the "50s progression") was perfect for romantic ballads.',
        characteristics: ['Vocal harmony', 'Simple backing', 'Romantic lyrics'],
        soundDescription: 'Acapella vocals with "doo-wop" syllables',
      },
      {
        id: 'pop-rock',
        location: 'USA & UK',
        region: 'Global',
        era: '1960s-1980s',
        year: 1970,
        name: 'Pop & Rock Classics',
        description: 'The Beatles, Bob Marley, U2, and countless others used variations of the four chords to write timeless hits.',
        characteristics: ['Arena rock anthems', 'Reggae adaptations', 'Power ballads'],
        soundDescription: 'Full band arrangements with the iconic progression',
      },
      {
        id: 'axis',
        location: 'Global',
        region: 'Global',
        era: '1990s-2000s',
        year: 2000,
        name: 'The Axis Era',
        description: 'The I-V-vi-IV ordering became so dominant that comedy group "Axis of Awesome" proved 40+ hits use it.',
        characteristics: ['Ubiquitous in pop', 'Predictable but effective', 'Emotional uplift'],
        soundDescription: 'Every hit from Oasis to Adele',
      },
      {
        id: 'modern',
        location: 'Worldwide',
        region: 'Global',
        era: '2010s-Present',
        year: 2020,
        name: 'Still Dominant',
        description: 'Despite awareness of its overuse, the progression still dominates charts because it simply works emotionally.',
        characteristics: ['Millennial whoop', 'EDM drops', 'Streaming hits'],
        soundDescription: 'Modern production with the timeless progression',
      },
    ],
    modernExamples: ['Someone Like You - Adele', 'Let It Be - Beatles', 'No Woman No Cry - Bob Marley', 'With Or Without You - U2'],
  },
  {
    id: 'syncopation',
    name: 'The Syncopation Journey',
    subtitle: 'Off-Beat Revolution',
    description: 'From African polyrhythms through ragtime to funk and hip-hop - how playing "off the beat" changed everything.',
    color: '#8b5cf6',
    icon: '⚡',
    stops: [
      {
        id: 'africa-sync',
        location: 'West Africa',
        region: 'Africa',
        era: 'Ancient',
        name: 'African Roots',
        description: 'African music doesn\'t emphasize downbeats like European music - the interplay between beats creates constant movement.',
        characteristics: ['No single "beat one"', 'Polyrhythmic interlock', 'Circular time feel'],
        soundDescription: 'Multiple drums creating interlocking patterns',
      },
      {
        id: 'ragtime',
        location: 'USA (Missouri)',
        region: 'USA',
        era: '1890s-1920s',
        year: 1900,
        name: 'Ragtime',
        description: 'Scott Joplin and others created ragtime by putting syncopated melodies over steady bass - America\'s first original music style.',
        characteristics: ['Ragged time', 'Piano-driven', 'Composed syncopation'],
        soundDescription: 'Piano with left hand stride and syncopated right hand',
      },
      {
        id: 'swing',
        location: 'USA',
        region: 'USA',
        era: '1930s-1940s',
        year: 1935,
        name: 'Swing Era',
        description: 'Big bands turned syncopation into "swing" - that irresistible bounce that made everyone want to dance.',
        characteristics: ['Big band sound', 'Swing eighth notes', 'Dance music'],
        soundDescription: 'Full orchestra with swinging rhythm section',
      },
      {
        id: 'funk',
        location: 'USA',
        region: 'USA',
        era: '1960s-1970s',
        year: 1970,
        name: 'Funk',
        description: 'James Brown declared "The One" but filled everything around it with syncopation, creating funk\'s irresistible groove.',
        characteristics: ['The One', 'Chicken scratch guitar', 'Syncopated horn stabs'],
        soundDescription: 'Tight band with emphasis on "the one" and fills',
      },
      {
        id: 'hiphop',
        location: 'Bronx, New York',
        region: 'USA',
        era: '1970s-Present',
        year: 1985,
        name: 'Hip-Hop',
        description: 'DJs sampled funk breaks, MCs rapped in syncopated flows - hip-hop became the new home of syncopation.',
        characteristics: ['Sampled breaks', 'Syncopated flow', 'Beat-based music'],
        soundDescription: 'Drum machine beats with sampled funk loops',
      },
    ],
    modernExamples: ['Superstition - Stevie Wonder', 'Get Lucky - Daft Punk', 'Uptown Funk - Bruno Mars'],
  },
];

export default function MusicEvolutionPage() {
  const [selectedJourney, setSelectedJourney] = useState<EvolutionJourney>(EVOLUTION_JOURNEYS[0]);
  const [selectedStop, setSelectedStop] = useState<JourneyStop | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-6 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-4">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300">Cultural Journey</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
              Music Evolution
            </h1>
            <p className="text-lg text-music-dim max-w-2xl mx-auto">
              Follow musical patterns as they traveled across continents and centuries.
              See how rhythms, scales, and progressions evolved through cultures to shape modern music.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Journey Selector */}
      <div className="px-6 mb-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-music-text mb-4">Choose a Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {EVOLUTION_JOURNEYS.map((journey) => (
              <button
                key={journey.id}
                onClick={() => {
                  setSelectedJourney(journey);
                  setSelectedStop(null);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedJourney.id === journey.id
                    ? 'border-white bg-white/10'
                    : 'border-music hover:border-white/50'
                }`}
              >
                <div className="text-3xl mb-2">{journey.icon}</div>
                <h3 className="font-bold text-music-text">{journey.name}</h3>
                <p className="text-sm text-music-dim">{journey.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Journey */}
      <div className="px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={selectedJourney.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Journey Header */}
            <div
              className="p-6 rounded-xl border"
              style={{
                borderColor: selectedJourney.color,
                background: `linear-gradient(135deg, ${selectedJourney.color}10 0%, transparent 50%)`,
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{selectedJourney.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-music-text">{selectedJourney.name}</h2>
                      <p className="text-music-dim">{selectedJourney.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-music-text max-w-2xl">{selectedJourney.description}</p>
                </div>

                {selectedJourney.tedTalk && (
                  <a
                    href={selectedJourney.tedTalk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors shrink-0"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-sm">Watch TED Talk</span>
                  </a>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <h3 className="text-xl font-bold text-music-text mb-6">The Journey</h3>

              {/* Timeline line */}
              <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-music-dim via-music-dim to-transparent" />

              {/* Stops */}
              <div className="space-y-6">
                {selectedJourney.stops.map((stop, index) => (
                  <motion.div
                    key={stop.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-16"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-4 w-5 h-5 rounded-full border-4 border-music-bg"
                      style={{ backgroundColor: selectedJourney.color }}
                    />

                    {/* Arrow connector */}
                    {index < selectedJourney.stops.length - 1 && (
                      <ArrowRight
                        className="absolute left-[18px] top-8 w-3 h-3 text-music-dim"
                        style={{ transform: 'rotate(90deg)' }}
                      />
                    )}

                    {/* Stop card */}
                    <div
                      onClick={() => setSelectedStop(selectedStop?.id === stop.id ? null : stop)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedStop?.id === stop.id
                          ? 'border-white bg-white/5'
                          : 'border-music hover:border-white/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg font-bold text-music-text">{stop.name}</span>
                            <span className="px-2 py-0.5 bg-music-surface rounded text-xs text-music-dim">
                              {stop.era}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-music-dim mb-2">
                            <MapPin className="w-3 h-3" />
                            {stop.location}
                          </div>
                          <p className="text-sm text-music-text">{stop.description}</p>
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {selectedStop?.id === stop.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-music overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-bold text-music-text mb-2">Characteristics</h4>
                                <ul className="space-y-1">
                                  {stop.characteristics.map((char, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-music-dim">
                                      <ChevronRight className="w-3 h-3" style={{ color: selectedJourney.color }} />
                                      {char}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-music-text mb-2">The Sound</h4>
                                <p className="text-sm text-music-dim italic">"{stop.soundDescription}"</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Modern Examples */}
            <div className="p-6 bg-music-surface rounded-xl border border-music">
              <h3 className="text-lg font-bold text-music-text mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: selectedJourney.color }} />
                Hear It Today
              </h3>
              <div className="flex flex-wrap gap-3">
                {selectedJourney.modernExamples.map((example, i) => (
                  <span
                    key={i}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: `${selectedJourney.color}20`,
                      color: selectedJourney.color,
                    }}
                  >
                    🎵 {example}
                  </span>
                ))}
              </div>
              <p className="text-sm text-music-dim mt-4">
                Try decoding these songs to see the patterns in action!
              </p>
            </div>

            {/* TED Talk Reference */}
            {selectedJourney.tedTalk && (
              <div className="p-6 bg-gradient-to-r from-red-500/10 to-transparent rounded-xl border border-red-500/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center shrink-0">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-music-text">Learn More</h3>
                    <p className="text-music-dim mb-3">
                      Watch <strong>{selectedJourney.tedTalk.speaker}</strong>'s TED Talk: "{selectedJourney.tedTalk.title}" to hear this journey explained beautifully.
                    </p>
                    <a
                      href={selectedJourney.tedTalk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      Watch on TED.com
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
