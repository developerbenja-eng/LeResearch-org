import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { GEMINI_MODELS } from '@/lib/ai/gemini';
import { getResearchDb } from '@/lib/db/turso';
import type {
  ConversationMessage,
  ResearchRequirements,
  AcademicSource,
  SocialThread,
  ResearchNote,
  BookConcept,
  ResearchResults,
} from '@/types/research';

const getClient = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, message, conversationHistory } = body;

    if (action === 'chat') {
      return await handleChat(message, conversationHistory);
    }

    if (action === 'research') {
      return await performComprehensiveResearch(conversationHistory);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Research Agent] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Handle chat conversation
async function handleChat(message: string, history: ConversationMessage[]) {
  const client = getClient();

  const systemPrompt = `You are a research assistant helping parents. Ask clarifying questions to gather:
- Child's age (required)
- Specific concern
- Background context
When you have enough info (3-5 exchanges), end with: [READY_TO_SEARCH]`;

  const conversationText = history
    .map((h) => `${h.role === 'user' ? 'Parent' : 'Assistant'}: ${h.content}`)
    .join('\n');

  const result = await client.models.generateContent({
    model: GEMINI_MODELS.TEXT,
    contents: [{ parts: [{ text: `${systemPrompt}\n\nConversation:\n${conversationText}\n\nParent: ${message}\n\nAssistant:` }] }],
    config: { temperature: 0.7, maxOutputTokens: 1024 },
  });
  const response = result.text || '';

  const readyToSearch = response.includes('[READY_TO_SEARCH]');
  const cleanResponse = response.replace('[READY_TO_SEARCH]', '').trim();

  const updatedHistory: ConversationMessage[] = [
    ...history,
    { role: 'user', content: message },
    { role: 'assistant', content: cleanResponse },
  ];

  return NextResponse.json({
    message: cleanResponse,
    conversationHistory: updatedHistory,
    readyToSearch,
  });
}

// Perform comprehensive research
async function performComprehensiveResearch(history: ConversationMessage[]) {
  // Extract research requirements
  const requirements = await extractRequirements(history);

  // Try database cache first
  const cachedResearch = await checkDatabaseCache(requirements);

  if (cachedResearch) {
    console.log('✅ Research Cache HIT');
    return NextResponse.json(
      { ...cachedResearch, cached: true, cacheSource: 'database' },
      { headers: { 'X-Cache': 'HIT', 'X-Cache-Source': 'database' } }
    );
  }

  console.log('⚠️ Research Cache MISS - calling APIs');

  // Parallel API calls
  const [academicSources, socialThreads, notes, bookConcepts] = await Promise.all([
    searchPerplexity(requirements),
    searchSocialMedia(requirements),
    generateNotes(requirements),
    generateBookConcepts(requirements),
  ]);

  const results: ResearchResults = {
    sources: academicSources,
    social: socialThreads,
    notes,
    books: bookConcepts,
    requirements,
    cached: false,
  };

  return NextResponse.json(results, { headers: { 'X-Cache': 'MISS' } });
}

// Schema for research requirements
const REQUIREMENTS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    childAge: { type: Type.STRING },
    specificConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
    goals: { type: Type.ARRAY, items: { type: Type.STRING } },
    searchQuery: { type: Type.STRING },
  },
  required: ['topic', 'childAge', 'specificConcerns', 'goals', 'searchQuery'],
};

// Extract requirements from conversation
async function extractRequirements(history: ConversationMessage[]): Promise<ResearchRequirements> {
  const client = getClient();
  const conversationText = history.map((h) => h.content).join('\n');

  const prompt = `Extract structured information from this parent conversation:

${conversationText}

Extract:
- topic: main parenting topic
- childAge: age in years
- specificConcerns: array of specific concerns
- goals: array of goals
- searchQuery: optimized search query for research`;

  try {
    const result = await client.models.generateContent({
      model: GEMINI_MODELS.TEXT,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: REQUIREMENTS_SCHEMA,
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });
    return JSON.parse(result.text || '{}');
  } catch (error) {
    console.error('Error extracting requirements:', error);
  }

  return {
    topic: 'parenting topic',
    childAge: '5 years',
    specificConcerns: [],
    goals: [],
    searchQuery: conversationText.slice(-200),
  };
}

// Check database cache
async function checkDatabaseCache(
  requirements: ResearchRequirements
): Promise<ResearchResults | null> {
  try {
    const db = getResearchDb();

    // Find matching topic
    const topicsResult = await db.execute({
      sql: `SELECT * FROM parenting_topics WHERE status = 'active' ORDER BY priority_score DESC`,
      args: [],
    });

    const topics = topicsResult.rows || [];
    const topic = topics.find((t) => {
      const title = (t.title as string || '').toLowerCase();
      const searchTopic = requirements.topic.toLowerCase();
      return (
        title.includes(searchTopic.split(' ')[0]) ||
        searchTopic.includes(title.split(' ')[0])
      );
    });

    if (!topic) return null;

    const topicId = topic.id as string;

    // Fetch cached content
    const [academicResult, socialResult, notesResult, conceptsResult] = await Promise.all([
      db.execute({
        sql: `SELECT s.*, ts.relevance_score FROM academic_sources s
              JOIN topic_academic_sources ts ON s.id = ts.source_id
              WHERE ts.topic_id = ? ORDER BY s.credibility_score DESC`,
        args: [topicId],
      }),
      db.execute({
        sql: `SELECT d.*, td.key_takeaways FROM social_discussions d
              JOIN topic_social_discussions td ON d.id = td.discussion_id
              WHERE td.topic_id = ? ORDER BY d.engagement_score DESC`,
        args: [topicId],
      }),
      db.execute({
        sql: `SELECT * FROM research_notes WHERE topic_id = ? AND is_current_version = TRUE`,
        args: [topicId],
      }),
      db.execute({
        sql: `SELECT * FROM book_concepts WHERE topic_id = ? AND status = 'published'`,
        args: [topicId],
      }),
    ]);

    // Check if we have enough content
    if ((academicResult.rows?.length || 0) === 0 && (notesResult.rows?.length || 0) === 0) {
      return null;
    }

    // Update search count
    await db.execute({
      sql: `UPDATE parenting_topics SET search_count = search_count + 1 WHERE id = ?`,
      args: [topicId],
    });

    // Format response
    return {
      sources: (academicResult.rows || []).map((s) => ({
        id: s.id as string,
        title: s.title as string,
        authors: s.authors as string,
        year: parseInt((s.publication_date as string)?.split('-')[0] || '2024'),
        journal: s.publication as string,
        abstract: s.abstract as string,
        url: s.url as string,
        source: 'Database Cache',
        relevanceScore: (s.relevance_score as number) || 90,
      })),
      social: (socialResult.rows || []).map((d) => ({
        id: d.id as string,
        title: d.title as string,
        platform: d.platform as string,
        subreddit: d.platform === 'reddit' ? 'r/Parenting' : undefined,
        upvotes: (d.upvotes as number) || 0,
        comments: (d.comment_count as number) || 0,
        topComment: d.content_summary as string,
        url: d.post_url as string,
      })),
      notes: formatNotesFromDB(notesResult.rows || []),
      books: (conceptsResult.rows || []).map((c) => ({
        title: c.title as string,
        theme: topic.title as string,
        targetAge: c.target_age as string,
        pages: 12,
        synopsis: c.concept_summary as string,
        keyLessons: parseJsonField(c.key_learning_points as string),
        characters: parseCharacters(c.character_suggestions as string),
      })),
      requirements: { ...requirements, topic: topic.title as string },
      cached: true,
    };
  } catch (error) {
    console.error('Database cache check error:', error);
    return null;
  }
}

function formatNotesFromDB(notes: Record<string, unknown>[]): ResearchNote[] {
  const noteTypeMap: Record<string, { title: string; icon: string }> = {
    summary: { title: 'Key Research Findings', icon: '📊' },
    practical_tips: { title: 'Practical Action Items', icon: '💡' },
    controversy: { title: 'Important Warnings', icon: '⚠️' },
    key_insights: { title: 'Related Topics to Explore', icon: '🔗' },
  };

  return notes.map((n) => {
    const typeInfo = noteTypeMap[n.note_type as string] || { title: n.title as string, icon: '📝' };
    return {
      title: typeInfo.title,
      icon: typeInfo.icon,
      items: parseNoteItems(n.content as string),
    };
  });
}

function parseNoteItems(content: string): string[] {
  if (content.includes('\n-') || content.includes('\n•')) {
    return content
      .split('\n')
      .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map((line) => line.replace(/^[\s-•]+/, '').trim())
      .filter((line) => line.length > 0);
  }
  return [content];
}

function parseJsonField(field: string): string[] {
  if (!field) return [];
  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    if (field.includes('\n')) {
      return field.split('\n').filter((s) => s.trim().length > 0);
    }
    return field.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  }
}

function parseCharacters(field: string): Array<{ name: string; role: string; description: string }> {
  if (!field) return [];
  try {
    const parsed = JSON.parse(field);
    if (Array.isArray(parsed)) {
      return parsed.map((c) =>
        typeof c === 'object'
          ? { name: c.name || 'Character', role: c.role || 'protagonist', description: c.description || '' }
          : { name: String(c), role: 'protagonist', description: '' }
      );
    }
    return [{ name: String(parsed), role: 'protagonist', description: '' }];
  } catch {
    const names = field.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    return names.map((name) => ({ name, role: 'protagonist', description: '' }));
  }
}

// Search Perplexity for academic sources
async function searchPerplexity(requirements: ResearchRequirements): Promise<AcademicSource[]> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: `Find peer-reviewed research about ${requirements.searchQuery} for children age ${requirements.childAge}. Include citations.`,
          },
        ],
        temperature: 0.2,
        return_citations: true,
      }),
    });

    const data = await response.json();
    const citations = data.citations || [];

    return citations.slice(0, 8).map((citation: Record<string, string>, i: number) => ({
      id: `source_${i}`,
      title: citation.title || 'Research Paper',
      authors: citation.author || 'Various Authors',
      year: parseInt(citation.year) || new Date().getFullYear(),
      journal: citation.journal || 'Academic Journal',
      abstract: citation.text || data.choices?.[0]?.message?.content?.slice(0, 300) || '',
      url: citation.url || '',
      source: citation.source || 'Perplexity',
      relevanceScore: 95 - i * 5,
    }));
  } catch (error) {
    console.error('Perplexity search error:', error);
    return [];
  }
}

// Search social media for discussions
async function searchSocialMedia(requirements: ResearchRequirements): Promise<SocialThread[]> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: `Find the top 5 most helpful Reddit discussions about ${requirements.topic} from r/Parenting, r/beyondthebump, r/toddlers. For each thread, provide: title, top comment, upvotes, and Reddit URL.`,
          },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse or return placeholder
    return [
      {
        id: 'thread_1',
        title: `Discussion about ${requirements.topic}`,
        platform: 'reddit',
        subreddit: 'r/Parenting',
        upvotes: 2300,
        comments: 487,
        topComment: content.slice(0, 200) || 'Loading discussions...',
        url: 'https://reddit.com/r/Parenting',
      },
    ];
  } catch (error) {
    console.error('Social search error:', error);
    return [];
  }
}

// Schema for research notes
const NOTES_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      icon: { type: Type.STRING },
      items: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['title', 'icon', 'items'],
  },
};

// Generate research notes
async function generateNotes(requirements: ResearchRequirements): Promise<ResearchNote[]> {
  try {
    const client = getClient();

    const prompt = `Create research notes for parents about ${requirements.topic} for ${requirements.childAge} children.

Generate 4 note cards:
1. Key Research Findings (icon: 📊) - 3 evidence-based findings
2. Practical Action Items (icon: 💡) - 3 actionable tips
3. Important Warnings (icon: ⚠️) - 2 cautionary notes
4. Related Topics to Explore (icon: 🔗) - 2 related topics`;

    const result = await client.models.generateContent({
      model: GEMINI_MODELS.TEXT,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: NOTES_SCHEMA,
        temperature: 0.5,
        maxOutputTokens: 2048,
      },
    });

    return JSON.parse(result.text || '[]');
  } catch (error) {
    console.error('Notes generation error:', error);
  }

  return [
    {
      title: 'Key Research Findings',
      icon: '📊',
      items: ['Research finding 1', 'Research finding 2'],
    },
  ];
}

// Schema for book concepts
const BOOK_CONCEPTS_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      theme: { type: Type.STRING },
      targetAge: { type: Type.STRING },
      pages: { type: Type.INTEGER },
      synopsis: { type: Type.STRING },
      keyLessons: { type: Type.ARRAY, items: { type: Type.STRING } },
      characters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ['name', 'role', 'description'],
        },
      },
    },
    required: ['title', 'theme', 'targetAge', 'pages', 'synopsis', 'keyLessons', 'characters'],
  },
};

// Generate book concepts
async function generateBookConcepts(requirements: ResearchRequirements): Promise<BookConcept[]> {
  try {
    const client = getClient();

    const prompt = `Create 3 children's book concepts about ${requirements.topic} for ${requirements.childAge} children.

For each book, include:
- title: Creative book title
- theme: Main theme
- targetAge: "${requirements.childAge}"
- pages: 12
- synopsis: Story description (2-3 sentences)
- keyLessons: 2 key lessons
- characters: 1-2 characters with name, role (protagonist/supporting), and description`;

    const result = await client.models.generateContent({
      model: GEMINI_MODELS.TEXT,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: BOOK_CONCEPTS_SCHEMA,
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    return JSON.parse(result.text || '[]');
  } catch (error) {
    console.error('Book concepts generation error:', error);
  }

  return [
    {
      title: `Adventure with ${requirements.topic}`,
      theme: requirements.topic,
      targetAge: requirements.childAge,
      pages: 12,
      synopsis: `A story about learning ${requirements.topic}`,
      keyLessons: ['Lesson 1', 'Lesson 2'],
      characters: [{ name: 'Luna', role: 'protagonist', description: 'Curious child' }],
    },
  ];
}
