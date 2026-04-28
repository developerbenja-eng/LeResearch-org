export interface CoverArtPreset {
  id: string;
  name: string;
  basePrompt: string;
  color: string;
  description: string;
}

export const COVER_ART_PRESETS: CoverArtPreset[] = [
  {
    id: 'lofi',
    name: 'Lo-fi Chill',
    basePrompt:
      'Lo-fi album cover art, soft pastel colors, anime-inspired cozy room with window overlooking a rainy cityscape at dusk, warm lighting, grainy film texture, nostalgic and dreamy atmosphere, square format',
    color: '#ec4899',
    description: 'Pastel, anime-inspired, cozy',
  },
  {
    id: 'trap',
    name: 'Dark Trap',
    basePrompt:
      'Dark trap album cover, bold neon purple and cyan glows against deep black, urban city street at night, high contrast dramatic lighting, smoke effects, modern and edgy aesthetic, square format',
    color: '#8b5cf6',
    description: 'Neon, urban, high contrast',
  },
  {
    id: 'pop',
    name: 'Vibrant Pop',
    basePrompt:
      'Vibrant pop album cover, bright rainbow gradient background, playful abstract 3D shapes floating in space, glossy and iridescent textures, bold saturated colors, fun and energetic mood, square format',
    color: '#f59e0b',
    description: 'Colorful, energetic, fun',
  },
  {
    id: 'minimal',
    name: 'Minimalist',
    basePrompt:
      'Minimalist album cover, clean white background with a single geometric shape in a striking accent color, elegant thin lines, generous whitespace, sophisticated and modern, square format',
    color: '#22d3ee',
    description: 'Clean lines, elegant',
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    basePrompt:
      'Synthwave retro album cover, 1980s aesthetic with neon grid landscape stretching to horizon, palm tree silhouettes, gradient sky from hot pink to deep purple, chrome sun, vaporwave vibes, square format',
    color: '#f472b6',
    description: 'Retro 80s, neon grid',
  },
  {
    id: 'abstract',
    name: 'Abstract Art',
    basePrompt:
      'Abstract expressionist album cover, fluid paint strokes with bold contrasting colors, organic flowing shapes, textured canvas feel, artistic and experimental, museum-quality composition, square format',
    color: '#10b981',
    description: 'Experimental, fluid',
  },
];

export function buildPromptFromProject(
  basePrompt: string,
  projectName: string,
  metadata?: { genre?: string; bpm?: number; scale?: string },
): string {
  let prompt = basePrompt;

  if (metadata?.bpm) {
    if (metadata.bpm < 90) {
      prompt += ', slow contemplative mood, calm and peaceful';
    } else if (metadata.bpm > 140) {
      prompt += ', fast energetic mood, intense and dynamic';
    }
  }

  if (metadata?.scale) {
    if (metadata.scale.includes('minor') || metadata.scale.includes('blues') || metadata.scale.includes('dorian')) {
      prompt += ', melancholic and introspective feel, darker tones';
    } else {
      prompt += ', uplifting and bright atmosphere, warm tones';
    }
  }

  if (projectName && projectName !== 'Untitled') {
    prompt += `. The album title is "${projectName}"`;
  }

  return prompt;
}
