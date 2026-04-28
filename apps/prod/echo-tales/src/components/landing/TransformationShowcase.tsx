'use client';

import { useEffect, useState, useRef } from 'react';
import { Shirt, Glasses, User, Heart } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  character_type: string;
  age: number | null;
  description: string | null;
  referenceImageUrl: string | null;
  originalPhotoUrl: string | null;
}

const features = [
  { icon: Shirt, label: 'Clothing Preserved' },
  { icon: Glasses, label: 'Accessories Kept' },
  { icon: User, label: 'Same Features' },
  { icon: Heart, label: 'Personality Shines' },
];

export function TransformationShowcase() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [sliderPositions, setSliderPositions] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    async function fetchCharacters() {
      try {
        const res = await fetch('/api/public/marketing-characters?limit=6');
        const data = await res.json();
        if (data.success && data.characters) {
          // Only show characters with both original and reference images
          const validCharacters = data.characters.filter(
            (c: Character) => c.originalPhotoUrl && c.referenceImageUrl
          );
          setCharacters(validCharacters.slice(0, 4));
          // Initialize slider positions
          const positions: { [key: string]: number } = {};
          validCharacters.forEach((c: Character) => {
            positions[c.id] = 50;
          });
          setSliderPositions(positions);
        }
      } catch (error) {
        console.error('Failed to fetch characters:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCharacters();
  }, []);

  const handleSliderChange = (characterId: string, value: number) => {
    setSliderPositions((prev) => ({ ...prev, [characterId]: value }));
  };

  return (
    <section className="py-20 bg-theme-secondary overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            See How Photos Become Book Characters
          </h2>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Upload a family photo, watch AI transform it into book-style illustrations while
            preserving what makes each person unique.
          </p>
        </div>

        {/* Character grid with before/after sliders */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-pulse flex gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-64 h-80 bg-theme-tertiary rounded-xl" />
              ))}
            </div>
          </div>
        ) : characters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto mb-12 overflow-hidden">
            {characters.map((character) => (
              <CharacterCompareCard
                key={character.id}
                character={character}
                sliderPosition={sliderPositions[character.id] || 50}
                onSliderChange={(value) => handleSliderChange(character.id, value)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-theme-muted py-12">
            <p>Character examples coming soon</p>
          </div>
        )}

        {/* Feature callout */}
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-8 border border-purple-200 dark:border-purple-500/20">
          <h3 className="text-xl font-bold text-theme-primary text-center mb-6">
            Perfect Consistency Across All Stories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-purple-200 dark:bg-purple-500/20 flex items-center justify-center mb-2">
                  <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-theme-primary font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CharacterCompareCard({
  character,
  sliderPosition,
  onSliderChange,
}: {
  character: Character;
  sliderPosition: number;
  onSliderChange: (value: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    onSliderChange(percentage);
  };

  // Mouse handlers
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  // Touch handlers - improved for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault(); // Prevent page scroll while dragging
      handleMove(e.touches[0].clientX);
    }
  };
  const handleTouchEnd = () => setIsDragging(false);

  return (
    <div className="card-theme border rounded-xl shadow-lg overflow-hidden">
      <div
        ref={containerRef}
        className="relative aspect-square cursor-ew-resize select-none touch-pan-y"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Book illustration (background) */}
        <img
          src={character.referenceImageUrl || ''}
          alt={`${character.name} illustration`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Original photo (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={character.originalPhotoUrl || ''}
            alt={`${character.name} photo`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: `${100 / (sliderPosition / 100)}%` }}
          />
        </div>

        {/* Slider line - larger handle for mobile */}
        <div
          className="absolute top-0 bottom-0 w-0.5 sm:w-1 bg-white shadow-lg"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white shadow-lg flex items-center justify-center touch-feedback">
            <span className="text-gray-600 text-sm sm:text-xs font-bold">↔</span>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white pointer-events-none">
          Photo
        </div>
        <div className="absolute top-2 right-2 bg-purple-600/80 px-2 py-1 rounded text-xs text-white pointer-events-none">
          Book Style
        </div>

        {/* Mobile drag hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:hidden bg-black/50 px-2 py-1 rounded text-xs text-white pointer-events-none">
          Drag to compare
        </div>
      </div>

      {/* Character info */}
      <div className="p-3 sm:p-4">
        <h4 className="font-semibold text-theme-primary text-sm sm:text-base">{character.name}</h4>
        <p className="text-xs sm:text-sm text-theme-muted capitalize">
          {character.character_type} character
          {character.age ? ` · Age ${character.age}` : ''}
        </p>
      </div>
    </div>
  );
}
