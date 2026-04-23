export interface Track {
  num: string;
  name: string;
  blurb: string;
  detail: string;
  status: 'active' | 'forming' | 'target';
}

export const TRACKS: Track[] = [
  {
    num: '01',
    name: 'Environmental systems + open data infrastructure',
    blurb: 'Community-operated monitoring + harmonized open datasets + physics-informed AI for environmental systems.',
    detail:
      'Starting with the Memphis Sand Aquifer: an open IoT sensor network, a 30-source harmonized canonical dataset, and a physics-informed graph-attention architecture with aquifer-unit priors. The drilled substrate already exists — 4,257 wells in the metro, fewer than 53 streamed continuously in the open. What\'s missing is the open monitoring layer.',
    status: 'active',
  },
  {
    num: '02',
    name: 'Household-scale food + nutrition systems',
    blurb: 'Small-footprint, automated indoor food production; reframing what "required" nutrition means under longitudinal household evidence.',
    detail:
      'Not agriculture, not industrial kitchens — a research substrate at the scale of a family. What can be grown, at what nutritional yield, under what automation, in a spare room or a balcony? And what does a measured self-sufficiency layer change about resilience, nutrition, and the political economy of food access? Outputs: open-hardware designs, measured yields, and evidence-informed reframing of inherited nutrition defaults.',
    status: 'forming',
  },
  {
    num: '03',
    name: 'Plural frontends for expert knowledge',
    blurb: 'Research into how adaptive, multi-modal, multi-depth, multilingual interfaces change who can access expert knowledge.',
    detail:
      'The frontend of learning has always been the constraint — not intelligence, not effort, not the availability of knowledge. Post-industrial schooling built one linear filter and called those who fit it "smart." This track tests whether building the plural frontend changes the distribution of who can learn, measured honestly. The Echo-family products (Tales, Learn, Birds) are the current test substrates.',
    status: 'active',
  },
  {
    num: '04',
    name: 'Epistemic ecology under AI-mediated knowledge',
    blurb: 'How does a society retain the capacity for collective error-correction when the dominant knowledge frontend is commercially governed and silently versioned?',
    detail:
      'Two levels. Engineering: confidence tags, citation binding, refusal-to-fabricate, red-team transcripts — patterns that keep AI systems honest about uncertainty. Ecological: longitudinal observatories of production-model drift, provenance layers for AI-mediated claims, methods for preserving diversity-of-error. This is the track that makes LeResearch worth existing as a distinct entity.',
    status: 'forming',
  },
  {
    num: '05',
    name: 'Cross-substrate methodology transfer',
    blurb: 'What an insight from one substrate teaches us about another. The track that keeps LeResearch coherent.',
    detail:
      'The silo-collapse thesis applied to LeResearch itself. Methodology papers, pattern libraries, annual cross-substrate meetups, annotated comparisons of the same methods across different fields. If the thesis is that domains connect, this track is the receipts.',
    status: 'target',
  },
];

export interface Product {
  id: string;
  family: 'echo' | 'rethinking' | 'partner-gift';
  name: string;
  blurb: string;
  url?: string;
  status: 'live' | 'migrating' | 'draft';
}

export const PRODUCTS: Product[] = [
  {
    id: 'echo-tales',
    family: 'echo',
    name: 'Echo-Tales',
    blurb:
      'Interactive storytelling — book creation, character crafting, and an AI-powered reader with Kindle sync, Zotero integration, and study tools.',
    url: 'https://echo-tales.ledesign.ai',
    status: 'migrating',
  },
  {
    id: 'echo-learn',
    family: 'echo',
    name: 'Echo-Learn',
    blurb:
      'Adaptive learning — music theory, anatomy, philosophy, language — with AI tutoring, spaced repetition, and interactive 3D models.',
    url: 'https://echo-learn.ledesign.ai',
    status: 'migrating',
  },
  {
    id: 'echo-birds',
    family: 'echo',
    name: 'Echo-Birds',
    blurb:
      '87 species, 62 state parks, migration maps, sounds, and field quiz for Tennessee birding — a narrative-first field guide.',
    url: 'https://echo-birds.ledesign.ai',
    status: 'migrating',
  },
  {
    id: 'rethinking',
    family: 'rethinking',
    name: 'Rethinking Education',
    blurb:
      'A living-draft research framework grounding the Echo family. Neurobiology, pedagogy, liberatory education, and epistemic infrastructure, updated as the evidence does.',
    url: '/rethinking',
    status: 'live',
  },
  {
    id: 'poa-aquifer-explorer',
    family: 'partner-gift',
    name: 'Aquifer Explorer (for Protect Our Aquifer)',
    blurb:
      'A gift-work platform built for POA on public data alone. Interactive lessons on the Memphis Sand Aquifer; 52 routes; live USGS integration; full Spanish. POA owns the public relationship — LeResearch holds the research and infrastructure.',
    url: 'https://poa.ledesign.ai',
    status: 'live',
  },
];
