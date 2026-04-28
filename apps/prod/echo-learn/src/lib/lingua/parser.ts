import { ParsedMessage, ExtractedWord, LinguaLanguage } from '@/types/lingua';

// Common stop words that don't need to be learned
const STOP_WORDS_EN = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
  'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she',
  'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
  'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of',
  'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just',
  'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren',
  'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn',
  'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn',
  'ok', 'okay', 'yes', 'no', 'yeah', 'hi', 'hey', 'hello', 'bye', 'thanks',
  'thank', 'please', 'sorry', 'oh', 'um', 'uh', 'like', 'well', 'really',
  'also', 'even', 'still', 'already', 'always', 'never', 'sometimes', 'often',
  'usually', 'maybe', 'probably', 'definitely', 'actually', 'basically',
]);

const STOP_WORDS_ES = new Set([
  'yo', 'me', 'mi', 'mí', 'conmigo', 'nosotros', 'nosotras', 'nos', 'nuestro',
  'nuestra', 'nuestros', 'nuestras', 'tú', 'tu', 'te', 'ti', 'contigo', 'usted',
  'ustedes', 'vosotros', 'vosotras', 'os', 'vuestro', 'vuestra', 'vuestros',
  'vuestras', 'él', 'ella', 'ello', 'ellos', 'ellas', 'le', 'les', 'lo', 'la',
  'los', 'las', 'se', 'sí', 'consigo', 'su', 'sus', 'suyo', 'suya', 'suyos',
  'suyas', 'que', 'qué', 'quien', 'quién', 'cual', 'cuál', 'cuales', 'cuáles',
  'cuyo', 'cuya', 'cuyos', 'cuyas', 'este', 'esta', 'esto', 'estos', 'estas',
  'ese', 'esa', 'eso', 'esos', 'esas', 'aquel', 'aquella', 'aquello', 'aquellos',
  'aquellas', 'soy', 'eres', 'es', 'somos', 'sois', 'son', 'era', 'eras',
  'éramos', 'erais', 'eran', 'fui', 'fuiste', 'fue', 'fuimos', 'fuisteis',
  'fueron', 'ser', 'sido', 'siendo', 'estoy', 'estás', 'está', 'estamos',
  'estáis', 'están', 'estaba', 'estabas', 'estábamos', 'estabais', 'estaban',
  'estar', 'estado', 'estando', 'he', 'has', 'ha', 'hemos', 'habéis', 'han',
  'había', 'habías', 'habíamos', 'habíais', 'habían', 'haber', 'habido',
  'habiendo', 'tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen',
  'tener', 'tenido', 'teniendo', 'hago', 'haces', 'hace', 'hacemos', 'hacéis',
  'hacen', 'hacer', 'hecho', 'haciendo', 'un', 'una', 'uno', 'unos', 'unas',
  'el', 'la', 'los', 'las', 'y', 'o', 'u', 'e', 'pero', 'sino', 'aunque',
  'porque', 'como', 'cuando', 'donde', 'si', 'ni', 'de', 'del', 'a', 'al',
  'en', 'con', 'sin', 'por', 'para', 'sobre', 'bajo', 'ante', 'tras', 'entre',
  'desde', 'hasta', 'hacia', 'según', 'durante', 'mediante', 'más', 'menos',
  'muy', 'mucho', 'mucha', 'muchos', 'muchas', 'poco', 'poca', 'pocos', 'pocas',
  'todo', 'toda', 'todos', 'todas', 'otro', 'otra', 'otros', 'otras', 'mismo',
  'misma', 'mismos', 'mismas', 'tanto', 'tanta', 'tantos', 'tantas', 'tal',
  'tales', 'no', 'sí', 'ya', 'aún', 'todavía', 'también', 'tampoco', 'solo',
  'solamente', 'además', 'incluso', 'siempre', 'nunca', 'jamás', 'aquí', 'allí',
  'ahí', 'ahora', 'antes', 'después', 'luego', 'entonces', 'hoy', 'ayer',
  'mañana', 'bien', 'mal', 'así', 'quizá', 'quizás', 'tal vez', 'acaso',
  'hola', 'adiós', 'gracias', 'perdón', 'disculpa', 'por favor', 'bueno',
  'pues', 'vale', 'ok', 'oye', 'mira', 'jaja', 'jeje',
]);

type ConversationFormat = 'whatsapp' | 'imessage' | 'plain';

/**
 * Detect the format of a pasted conversation
 */
export function detectConversationFormat(text: string): ConversationFormat {
  // WhatsApp format: [DD/MM/YYYY, HH:MM:SS] Name: or DD/MM/YYYY, HH:MM - Name:
  const whatsappPattern1 = /^\[\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(:\d{2})?\]\s+.+:/m;
  const whatsappPattern2 = /^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}\s*[-–]\s*.+:/m;

  if (whatsappPattern1.test(text) || whatsappPattern2.test(text)) {
    return 'whatsapp';
  }

  // iMessage format: often "Name: message" on each line without timestamps
  const imessagePattern = /^[A-Za-z]+:\s+.+$/m;
  const lines = text.trim().split('\n');
  const imessageLikeLines = lines.filter((line) => imessagePattern.test(line.trim()));

  if (imessageLikeLines.length > lines.length * 0.5) {
    return 'imessage';
  }

  return 'plain';
}

/**
 * Parse a conversation text into individual messages
 */
export function parseConversation(text: string): ParsedMessage[] {
  const format = detectConversationFormat(text);
  const messages: ParsedMessage[] = [];

  if (format === 'whatsapp') {
    // Parse WhatsApp messages line by line
    // Patterns: [DD/MM/YYYY, HH:MM:SS] Name: message
    //           DD/MM/YYYY, HH:MM - Name: message
    const lines = text.trim().split('\n');
    const timestampPattern1 = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*(.+)$/;
    const timestampPattern2 = /^(\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2})\s*[-–]\s*([^:]+):\s*(.+)$/;

    let currentMessage: ParsedMessage | null = null;

    for (const line of lines) {
      const match1 = line.match(timestampPattern1);
      const match2 = line.match(timestampPattern2);
      const match = match1 || match2;

      if (match) {
        // Save previous message if exists
        if (currentMessage) {
          messages.push(currentMessage);
        }

        // Start new message
        currentMessage = {
          sender: match[2].trim(),
          content: match[3].trim(),
          timestamp: match[1],
          words: [],
        };
      } else if (currentMessage && line.trim()) {
        // Continuation of previous message (multi-line)
        currentMessage.content += ' ' + line.trim();
      }
    }

    // Don't forget the last message
    if (currentMessage) {
      messages.push(currentMessage);
    }
  } else if (format === 'imessage') {
    const lines = text.trim().split('\n');
    for (const line of lines) {
      const match = line.match(/^([A-Za-z]+):\s*(.+)$/);
      if (match) {
        messages.push({
          sender: match[1].trim(),
          content: match[2].trim(),
          words: [],
        });
      }
    }
  } else {
    // Plain text: treat each non-empty line as a message
    const lines = text.trim().split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        messages.push({
          sender: 'User',
          content: trimmed,
          words: [],
        });
      }
    }
  }

  return messages;
}

/**
 * Normalize a word for comparison (lowercase, remove accents, trim)
 */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '') // Keep only alphanumeric
    .trim();
}

/**
 * Check if a word is a stop word in the given language
 */
export function isStopWord(word: string, language: LinguaLanguage): boolean {
  const normalized = normalizeWord(word);
  if (normalized.length <= 1) return true; // Single letters
  if (/^\d+$/.test(normalized)) return true; // Numbers

  if (language === 'en') {
    return STOP_WORDS_EN.has(normalized);
  } else {
    return STOP_WORDS_ES.has(normalized);
  }
}

/**
 * Detect the language of a text (simple heuristic)
 */
export function detectLanguage(text: string): LinguaLanguage {
  // Common Spanish-specific patterns
  const spanishPatterns = [
    /\b(hola|gracias|bueno|está|como|qué|muy|también|porque|ahora|siempre)\b/i,
    /[áéíóúüñ]/i, // Spanish accents and ñ
    /\b(el|la|los|las|un|una|unos|unas)\b/gi, // Spanish articles (count them)
  ];

  // Common English-specific patterns
  const englishPatterns = [
    /\b(the|is|are|was|were|have|has|been|being|will|would|could|should)\b/i,
    /\b(hello|thanks|good|what|this|that|with|from|they|their)\b/i,
  ];

  let spanishScore = 0;
  let englishScore = 0;

  for (const pattern of spanishPatterns) {
    const matches = text.match(pattern);
    if (matches) spanishScore += matches.length;
  }

  for (const pattern of englishPatterns) {
    const matches = text.match(pattern);
    if (matches) englishScore += matches.length;
  }

  return spanishScore > englishScore ? 'es' : 'en';
}

/**
 * Extract words from text for vocabulary tracking
 */
export function extractWords(
  text: string,
  contentLanguage: LinguaLanguage
): ExtractedWord[] {
  // Split by spaces and punctuation, keeping track of positions
  const wordPattern = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+/g;
  const words: ExtractedWord[] = [];
  let match;
  let position = 0;

  while ((match = wordPattern.exec(text)) !== null) {
    const original = match[0];
    const normalized = normalizeWord(original);

    // Skip stop words and very short words
    if (!isStopWord(original, contentLanguage) && normalized.length > 2) {
      words.push({
        original,
        normalized,
        position: position++,
        language: contentLanguage,
        showInTargetLang: false, // Will be determined later based on user's knowledge
      });
    }
  }

  return words;
}

/**
 * Get unique words from an array of extracted words
 */
export function getUniqueWords(words: ExtractedWord[]): Map<string, ExtractedWord> {
  const unique = new Map<string, ExtractedWord>();
  for (const word of words) {
    if (!unique.has(word.normalized)) {
      unique.set(word.normalized, word);
    }
  }
  return unique;
}

/**
 * Reconstruct text with word markers for display
 * Returns text with special markers for words that can be highlighted
 */
export function reconstructTextWithMarkers(
  originalText: string,
  words: ExtractedWord[]
): string {
  // Create a map of normalized word to ExtractedWord for quick lookup
  const wordMap = new Map<string, ExtractedWord>();
  for (const word of words) {
    wordMap.set(word.normalized, word);
  }

  // Replace words in text with marked versions
  return originalText.replace(
    /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+/g,
    (match) => {
      const normalized = normalizeWord(match);
      const word = wordMap.get(normalized);
      if (word) {
        return `{{${match}|${word.showInTargetLang ? 'target' : 'native'}}}`;
      }
      return match;
    }
  );
}
