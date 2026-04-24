// Content safety validation for children's content

const BLOCKED_TERMS = [
  'violence',
  'death',
  'kill',
  'blood',
  'scary',
  'horror',
  'nightmare',
  'weapon',
  'gun',
  'knife',
  'drug',
  'alcohol',
  'inappropriate',
  'adult',
  'explicit',
];

const INAPPROPRIATE_THEMES = [
  'violence',
  'fear',
  'death',
  'separation anxiety',
  'abandonment',
  'bullying without resolution',
];

export interface ContentSafetyResult {
  safe: boolean;
  issues: string[];
  suggestions: string[];
}

export function validateStoryContent(content: string): ContentSafetyResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const lowerContent = content.toLowerCase();

  // Check for blocked terms
  for (const term of BLOCKED_TERMS) {
    if (lowerContent.includes(term)) {
      issues.push(`Contains potentially inappropriate term: "${term}"`);
      suggestions.push(`Consider replacing "${term}" with age-appropriate language`);
    }
  }

  // Check content length (ensure it's appropriate for children)
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const avgSentenceLength = content.length / sentences.length;

  if (avgSentenceLength > 100) {
    issues.push('Sentences may be too long for young readers');
    suggestions.push('Break long sentences into shorter, simpler ones');
  }

  return {
    safe: issues.length === 0,
    issues,
    suggestions,
  };
}

export function validateCharacterDescription(description: string): ContentSafetyResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const lowerDescription = description.toLowerCase();

  // Check for inappropriate character traits
  const inappropriateTraits = ['scary', 'evil', 'mean', 'violent', 'angry'];
  for (const trait of inappropriateTraits) {
    if (lowerDescription.includes(trait)) {
      issues.push(`Character trait "${trait}" may not be suitable for young children`);
      suggestions.push(`Consider using more positive character traits`);
    }
  }

  return {
    safe: issues.length === 0,
    issues,
    suggestions,
  };
}

export function validateImagePrompt(prompt: string): ContentSafetyResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const lowerPrompt = prompt.toLowerCase();

  // Check for potentially problematic visual elements
  const problematicElements = [
    'scary',
    'dark',
    'frightening',
    'realistic violence',
    'blood',
    'weapons',
  ];

  for (const element of problematicElements) {
    if (lowerPrompt.includes(element)) {
      issues.push(`Image prompt contains potentially inappropriate element: "${element}"`);
      suggestions.push('Ensure image prompts are child-friendly and colorful');
    }
  }

  return {
    safe: issues.length === 0,
    issues,
    suggestions,
  };
}

export function sanitizeContent(content: string): string {
  let sanitized = content;

  // Replace potentially problematic terms with safer alternatives
  const replacements: Record<string, string> = {
    'scary': 'surprising',
    'afraid': 'nervous',
    'dark': 'shadowy',
    'mean': 'grumpy',
    'evil': 'mischievous',
  };

  for (const [term, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(term, 'gi');
    sanitized = sanitized.replace(regex, replacement);
  }

  return sanitized;
}
