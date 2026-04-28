import { generateJSON } from './gemini';
import type { ChordAnalysis, DNAAnalysis } from '@/types/decoder';
import type {
  PatternAnalysisResult,
  PatternMixResult,
  AudioFeatures,
  SongPattern,
  GenreStats,
} from '@/types/music-patterns';

/**
 * Analyze a decoded song's musical patterns.
 * Uses the existing decoder analysis (chords, DNA) + optional audio features.
 */
export async function analyzePatterns(
  chordAnalysis: ChordAnalysis,
  dnaAnalysis: DNAAnalysis,
  audioFeatures?: AudioFeatures | null,
): Promise<PatternAnalysisResult> {
  const spectralContext = audioFeatures?.spectralProfile
    ? `\nSPECTRAL PROFILE (per-stem, 0-1 scale):
  Vocals — bass: ${audioFeatures.spectralProfile.stems.vocals.bass.toFixed(2)}, mids: ${audioFeatures.spectralProfile.stems.vocals.highMids.toFixed(2)}, treble: ${audioFeatures.spectralProfile.stems.vocals.treble.toFixed(2)}
  Drums — bass: ${audioFeatures.spectralProfile.stems.drums.bass.toFixed(2)}, mids: ${audioFeatures.spectralProfile.stems.drums.highMids.toFixed(2)}, treble: ${audioFeatures.spectralProfile.stems.drums.treble.toFixed(2)}
  Bass — sub: ${audioFeatures.spectralProfile.stems.bass.subBass.toFixed(2)}, bass: ${audioFeatures.spectralProfile.stems.bass.bass.toFixed(2)}, mids: ${audioFeatures.spectralProfile.stems.bass.lowMids.toFixed(2)}
  Other — mids: ${audioFeatures.spectralProfile.stems.other.lowMids.toFixed(2)}, highs: ${audioFeatures.spectralProfile.stems.other.highMids.toFixed(2)}, treble: ${audioFeatures.spectralProfile.stems.other.treble.toFixed(2)}
  Master — bass: ${audioFeatures.spectralProfile.master.bass.toFixed(2)}, mids: ${audioFeatures.spectralProfile.master.highMids.toFixed(2)}, treble: ${audioFeatures.spectralProfile.master.treble.toFixed(2)}`
    : '';

  const prompt = `You are a music theory expert. Analyze this song's musical patterns and classify them for a pattern database.

CHORD ANALYSIS:
  Progression: ${chordAnalysis.progressionName}
  Roman numerals: ${chordAnalysis.chords.map((c) => c.romanNumeral).join(' - ')}
  Key: ${chordAnalysis.keyInfo.key} ${chordAnalysis.keyInfo.scale}
  Similar songs: ${chordAnalysis.similarSongs.map((s) => `${s.title} by ${s.artist}`).join(', ') || 'none listed'}

DNA ANALYSIS:
  BPM: ${dnaAnalysis.bpm} (${dnaAnalysis.bpmCategory})
  Mood: ${dnaAnalysis.mood.dominant} (happy=${dnaAnalysis.mood.happy}, energetic=${dnaAnalysis.mood.energetic}, sad=${dnaAnalysis.mood.sad}, calm=${dnaAnalysis.mood.calm})
  Genres: ${dnaAnalysis.genres.map((g) => `${g.name} (${(g.confidence * 100).toFixed(0)}%)`).join(', ')}
  Time signature: ${dnaAnalysis.timeSignature}
${spectralContext}

Analyze and return:
1. chordProgression: The core roman numeral pattern, normalized and key-independent (e.g. "I-V-vi-IV")
2. chordCategory: Primary genre category for the harmony (pop, jazz, blues, classical, gospel, latin, rock, r&b, electronic, folk)
3. chordNickname: Well-known name if applicable (e.g. "The Axis Progression", "12-Bar Blues") or null
4. rhythmGroove: Groove type (straight, swing, shuffle, syncopated, latin, half-time, double-time)
5. rhythmBpmBucket: "slow" (<90), "moderate" (90-120), "fast" (120-150), "very-fast" (>150)
6. genreTags: 2-4 genre tags with confidence and 2-3 characteristics explaining WHY this is that genre
7. styleDNA: What makes this song's style unique — signature traits, uniqueness score, influences, defining characteristics
8. rhythmDetails: Rhythm density (0-1), syncopation level (0-1), subdivision type, accent pattern (8 values for one bar)

Return valid JSON matching exactly this structure:
{
  "chordProgression": "I-V-vi-IV",
  "chordCategory": "pop",
  "chordNickname": "The Axis Progression",
  "rhythmGroove": "straight",
  "rhythmBpmBucket": "moderate",
  "genreTags": [
    {"name": "Pop", "confidence": 0.9, "characteristics": ["uses I-V-vi-IV", "4/4 time", "strong vocal melody"]}
  ],
  "styleDNA": {
    "signature": ["anthemic chorus", "layered production"],
    "uniqueness": 0.4,
    "influences": ["80s synth-pop", "modern EDM"],
    "definingCharacteristics": [
      {"feature": "Four-chord loop", "description": "Repeating I-V-vi-IV throughout", "strength": 0.9}
    ]
  },
  "rhythmDetails": {
    "density": 0.6,
    "syncopation": 0.3,
    "subdivisions": "eighths",
    "accentPattern": [1, 0, 0.5, 0, 1, 0, 0.5, 0]
  }
}`;

  return generateJSON<PatternAnalysisResult>(prompt, {
    maxTokens: 2048,
  });
}

/**
 * Generate a creative description of what mixing patterns from different songs would sound like.
 */
export async function generatePatternMix(
  songs: Array<{
    title: string;
    artist: string | null;
    pattern: SongPattern;
  }>,
): Promise<PatternMixResult> {
  const songDescriptions = songs.map((s, i) => {
    const p = s.pattern;
    return `Song ${i + 1}: "${s.title}" by ${s.artist || 'Unknown'}
  Chords: ${p.chordProgression || 'unknown'} (${p.chordCategory || 'unknown'})
  Groove: ${p.rhythmGroove || 'unknown'}
  Style: ${p.styleDNA?.signature.join(', ') || 'unknown'}
  Genres: ${p.genreTags.map((g) => g.name).join(', ') || 'unknown'}`;
  }).join('\n\n');

  const prompt = `You are a creative music producer and educator. Imagine combining the musical elements from these analyzed songs into one track.

${songDescriptions}

Describe what this combination would sound like. Be specific and creative — reference real genres, production techniques, and what the listener would hear. Think about how the elements interact.

Return JSON:
{
  "description": "A vivid 2-3 sentence description of how the combined track would sound",
  "wouldSoundLike": ["Artist or genre references, e.g. 'Daft Punk meets Coltrane'"],
  "characteristics": ["3-5 specific characteristics of the resulting sound"],
  "technicalBreakdown": {
    "harmony": "How the chord elements interact",
    "rhythm": "How the rhythmic elements combine",
    "timbre": "What the overall sound texture would be",
    "production": "Production style and techniques"
  }
}`;

  return generateJSON<PatternMixResult>(prompt, {
    maxTokens: 1024,
  });
}

/**
 * Generate an insight summary for a genre based on analyzed songs.
 */
export async function generateGenreInsight(
  genre: string,
  stats: GenreStats,
): Promise<string> {
  const prompt = `You are a music theory educator. Summarize what defines "${genre}" music based on these patterns from ${stats.songCount} analyzed songs:

Common chord progressions: ${stats.commonProgressions.map((p) => `${p.progression} (${p.count} songs)`).join(', ') || 'not enough data'}
Common grooves: ${stats.commonGrooves.map((g) => `${g.groove} (${g.count} songs)`).join(', ') || 'not enough data'}
Average BPM: ${stats.avgBpm || 'unknown'}

Write a concise 2-3 sentence educational summary of what makes this genre sound the way it does, referencing specific musical characteristics. Be specific and accessible to a beginner.`;

  const { generateText } = await import('./gemini');
  return generateText(prompt, { maxTokens: 256, temperature: 0.5 });
}
