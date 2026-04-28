import { NextRequest, NextResponse } from 'next/server';

// Mock sources data
const mockPreResearchedSources = [
  {
    id: 'src1',
    title: 'The Whole-Brain Child: 12 Revolutionary Strategies',
    url: 'https://www.drdansiegel.com/books/the-whole-brain-child/',
    source_type: 'book',
    description: 'Dr. Daniel Siegel and Tina Payne Bryson present 12 key strategies for nurturing your child\'s developing mind.',
    author: 'Daniel J. Siegel, M.D., Tina Payne Bryson, Ph.D.',
    publication: 'Bantam Books',
    published_date: '2011-10-04',
    credibility_score: 0.95,
    topic_title: 'Brain Development',
    is_pre_researched: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'src2',
    title: 'How to Talk So Little Kids Will Listen',
    url: 'https://www.simonandschuster.com/books/How-to-Talk-so-Little-Kids-Will-Listen/',
    source_type: 'book',
    description: 'Practical, compassionate communication strategies for children ages 2-7 from parenting experts.',
    author: 'Joanna Faber, Julie King',
    publication: 'Scribner',
    published_date: '2017-01-10',
    credibility_score: 0.92,
    topic_title: 'Communication',
    is_pre_researched: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'src3',
    title: 'AAP Sleep Guidelines for Infants and Toddlers',
    url: 'https://www.aap.org/sleep-guidelines',
    source_type: 'article',
    description: 'Official American Academy of Pediatrics guidelines on safe sleep practices and recommendations.',
    author: 'American Academy of Pediatrics',
    publication: 'AAP',
    published_date: '2023-06-15',
    credibility_score: 0.98,
    topic_title: 'Sleep',
    is_pre_researched: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'src4',
    title: 'Effect of Sleep Training Methods on Infant Sleep',
    url: 'https://pubmed.ncbi.nlm.nih.gov/sleep-training-study',
    source_type: 'study',
    description: 'Randomized controlled trial examining outcomes of behavioral sleep interventions in infants.',
    author: 'Mindell JA, et al.',
    publication: 'Pediatrics Journal',
    published_date: '2022-03-01',
    credibility_score: 0.94,
    topic_title: 'Sleep Training',
    is_pre_researched: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'src5',
    title: 'Zero to Three: Early Brain Development',
    url: 'https://www.zerotothree.org/brain-development',
    source_type: 'website',
    description: 'Comprehensive resource on early childhood brain development from leading nonprofit organization.',
    author: 'Zero to Three',
    publication: 'Zero to Three',
    credibility_score: 0.91,
    topic_title: 'Development',
    is_pre_researched: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'src6',
    title: 'Good Inside: Dr. Becky Kennedy on Parenting',
    url: 'https://www.goodinside.com/podcast',
    source_type: 'video',
    description: 'Clinical psychologist Dr. Becky Kennedy shares evidence-based parenting strategies.',
    author: 'Dr. Becky Kennedy',
    publication: 'Good Inside',
    credibility_score: 0.88,
    topic_title: 'Parenting Strategies',
    is_pre_researched: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

let mockUserSources: Array<{
  id: string;
  title: string;
  url: string;
  source_type: string;
  description?: string;
  author?: string;
  topic_title?: string;
  is_pre_researched: boolean;
  created_at: string;
}> = [
  {
    id: 'user-src1',
    title: 'Helpful article on toddler nutrition',
    url: 'https://example.com/toddler-nutrition',
    source_type: 'article',
    description: 'Found this helpful when researching picky eating solutions.',
    topic_title: 'Nutrition',
    is_pre_researched: false,
    created_at: '2024-01-14T10:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'pre-researched') {
      return NextResponse.json({ sources: mockPreResearchedSources });
    } else if (type === 'user') {
      return NextResponse.json({ sources: mockUserSources });
    }

    // Return all sources
    return NextResponse.json({
      sources: [...mockPreResearchedSources, ...mockUserSources],
    });
  } catch (error) {
    console.error('[Sources API] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, description, source_type, author, topic_title } = body;

    if (!url || !title) {
      return NextResponse.json({ error: 'URL and title are required' }, { status: 400 });
    }

    const newSource = {
      id: `user-src-${Date.now()}`,
      url,
      title,
      description,
      source_type: source_type || 'article',
      author,
      topic_title,
      is_pre_researched: false,
      created_at: new Date().toISOString(),
    };

    mockUserSources = [newSource, ...mockUserSources];

    return NextResponse.json({ source: newSource });
  } catch (error) {
    console.error('[Sources API] POST Error:', error);
    return NextResponse.json({ error: 'Failed to add source' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Source ID is required' }, { status: 400 });
    }

    mockUserSources = mockUserSources.filter((s) => s.id !== id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Sources API] DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
  }
}
