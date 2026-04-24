'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Filter } from 'lucide-react';
import { TEMPERATURE_CATEGORIES, type TemperatureEvent, type TemperatureCategory } from '@/types/alchemy';

export default function TemperaturePage() {
  const [events, setEvents] = useState<TemperatureEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Set<TemperatureCategory>>(
    new Set(['protein', 'sugar', 'fat', 'starch', 'water', 'chemical'])
  );
  const [hoveredEvent, setHoveredEvent] = useState<TemperatureEvent | null>(null);
  const [useFahrenheit, setUseFahrenheit] = useState(true);
  const scaleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch('/api/alchemy/temperature');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching temperature events:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter((e) => selectedCategories.has(e.category));

  const toggleCategory = (cat: TemperatureCategory) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(cat)) {
      newSet.delete(cat);
    } else {
      newSet.add(cat);
    }
    setSelectedCategories(newSet);
  };

  // Temperature range for visualization
  const minTemp = -20; // °C
  const maxTemp = 300; // °C
  const tempRange = maxTemp - minTemp;

  const getPositionForTemp = (tempC: number) => {
    return ((tempC - minTemp) / tempRange) * 100;
  };

  const getColorForTemp = (tempC: number) => {
    if (tempC <= 0) return '#0ea5e9'; // Cold blue
    if (tempC <= 50) return '#06b6d4'; // Cyan
    if (tempC <= 100) return '#22c55e'; // Green
    if (tempC <= 150) return '#f59e0b'; // Amber
    if (tempC <= 200) return '#f97316'; // Orange
    return '#dc2626'; // Red
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-red-600">
              <Thermometer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">Temperature Scale</h1>
              <p className="text-alchemy-dim">What happens at every degree</p>
            </div>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-alchemy-dim">Display:</span>
            <div className="flex rounded-lg bg-alchemy-surface border border-alchemy overflow-hidden">
              <button
                onClick={() => setUseFahrenheit(false)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  !useFahrenheit
                    ? 'bg-amber-500 text-white'
                    : 'text-alchemy-dim hover:text-alchemy-text'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUseFahrenheit(true)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  useFahrenheit
                    ? 'bg-amber-500 text-white'
                    : 'text-alchemy-dim hover:text-alchemy-text'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-alchemy-dim" />
            <span className="text-sm text-alchemy-dim">Filter by category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TEMPERATURE_CATEGORIES).map(([key, meta]) => {
              const isSelected = selectedCategories.has(key as TemperatureCategory);
              return (
                <button
                  key={key}
                  onClick={() => toggleCategory(key as TemperatureCategory)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'text-white'
                      : 'bg-alchemy-surface text-alchemy-dim hover:bg-alchemy-surface-light'
                  }`}
                  style={{
                    backgroundColor: isSelected ? meta.color : undefined,
                  }}
                >
                  <span>{meta.emoji}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Temperature Scale Visualization */}
      <div className="px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="relative" ref={scaleRef}>
              {/* Main Scale */}
              <div className="relative h-[1600px] ml-20">
                {/* Gradient Background */}
                <div className="absolute left-0 w-8 h-full rounded-full overflow-hidden">
                  <div
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(to top,
                        #0ea5e9 0%,
                        #06b6d4 15%,
                        #22c55e 30%,
                        #f59e0b 50%,
                        #f97316 70%,
                        #dc2626 100%
                      )`,
                    }}
                  />
                </div>

                {/* Temperature Markers */}
                {[-20, 0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300].map(
                  (temp) => (
                    <div
                      key={temp}
                      className="absolute left-0 flex items-center"
                      style={{ bottom: `${getPositionForTemp(temp)}%` }}
                    >
                      <div className="w-12 h-px bg-alchemy-border" />
                      <span className="ml-2 text-xs text-alchemy-dim font-mono">
                        {useFahrenheit ? `${Math.round(temp * 1.8 + 32)}°F` : `${temp}°C`}
                      </span>
                    </div>
                  )
                )}

                {/* Event Markers */}
                {filteredEvents.map((event) => {
                  const meta = TEMPERATURE_CATEGORIES[event.category];
                  const position = getPositionForTemp(event.temperatureC);
                  const isHovered = hoveredEvent?.id === event.id;

                  return (
                    <motion.div
                      key={event.id}
                      className="absolute left-12 flex items-center cursor-pointer group"
                      style={{ bottom: `${position}%` }}
                      onMouseEnter={() => setHoveredEvent(event)}
                      onMouseLeave={() => setHoveredEvent(null)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.random() * 0.3 }}
                    >
                      {/* Connector Line */}
                      <div
                        className="h-px w-8 transition-all"
                        style={{
                          backgroundColor: isHovered ? meta.color : 'rgba(255,255,255,0.2)',
                        }}
                      />

                      {/* Event Dot */}
                      <div
                        className="w-3 h-3 rounded-full transition-transform"
                        style={{
                          backgroundColor: meta.color,
                          transform: isHovered ? 'scale(1.5)' : 'scale(1)',
                          boxShadow: isHovered ? `0 0 12px ${meta.color}` : 'none',
                        }}
                      />

                      {/* Event Card */}
                      <div
                        className={`ml-3 p-3 rounded-lg transition-all max-w-md ${
                          isHovered
                            ? 'bg-alchemy-surface-light border border-alchemy scale-105'
                            : 'bg-alchemy-surface/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{meta.emoji}</span>
                          <span
                            className="font-semibold text-sm"
                            style={{ color: isHovered ? meta.color : 'inherit' }}
                          >
                            {event.eventName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-alchemy-dim mb-1">
                          <span>
                            {useFahrenheit
                              ? `${event.temperatureF}°F`
                              : `${event.temperatureC}°C`}
                          </span>
                          <span className="text-alchemy-border">•</span>
                          <span style={{ color: meta.color }}>{meta.label}</span>
                          {event.reversible && (
                            <>
                              <span className="text-alchemy-border">•</span>
                              <span className="text-green-400">Reversible</span>
                            </>
                          )}
                        </div>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                          >
                            <p className="text-xs text-alchemy-dim mt-2">
                              {event.description}
                            </p>
                            {event.tips && (
                              <p className="text-xs text-amber-400 mt-2">
                                Tip: {event.tips}
                              </p>
                            )}
                            {event.foodsAffected.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {event.foodsAffected.map((food, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-full bg-alchemy-surface text-[10px] text-alchemy-dim"
                                  >
                                    {food}
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Key Temperature Zones */}
                <div className="absolute -left-20 top-0 h-full w-16 flex flex-col justify-between text-[10px] text-alchemy-dim py-4">
                  <div className="text-red-400">Burning</div>
                  <div className="text-orange-400">Deep Frying</div>
                  <div className="text-amber-400">Maillard</div>
                  <div className="text-yellow-400">Caramel</div>
                  <div className="text-green-400">Simmer</div>
                  <div className="text-cyan-400">Poach</div>
                  <div className="text-blue-400">Freeze</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
