// @ts-nocheck
/**
 * Seed data for book discussion system
 * Educational summaries for facilitating discussion and learning
 */

import { createBook, createChapter, createConcept } from './db';

// Simple UUID generator
function generateId() {
  return '${Date.now()}-${Math.random().toString(36).substr(2, 9)}';
}

export async function seedBooks() {
  console.log('Seeding book data...');

  // Book 1: Why Zebras Don't Get Ulcers by Robert Sapolsky
  await seedWhyZebrasBook();

  // Book 2: Sapiens by Yuval Noah Harari
  await seedSapiensBook();

  // Book 3: Meditations by Marcus Aurelius
  await seedMeditationsBook();

  // Book 4: The Adventures of Sherlock Holmes by Arthur Conan Doyle
  await seedSherlockHolmesBook();

  // Book 5: Common Sense by Thomas Paine
  await seedCommonSenseBook();

  console.log('✅ Book seeding completed');
}

async function seedWhyZebrasBook() {
  const bookId = 'why-zebras-dont-get-ulcers';

  // Create book
  await createBook({
    id: bookId,
    title: 'Why Zebras Don\'t Get Ulcers',
    subtitle: 'The Acclaimed Guide to Stress, Stress-Related Diseases, and Coping',
    author: 'Robert M. Sapolsky',
    author_bio: 'Robert M. Sapolsky is a professor of biology, neuroscience, and neurosurgery at Stanford University. He is a MacArthur Fellow and has written several books on stress, primatology, and the human brain.',
    isbn: '978-0805073690',
    publication_year: 2004,
    genre: 'Science, Health, Psychology',
    cover_url: null,
    cover_color: '#E63946',
    total_chapters: 16,
    estimated_read_time: 480, // 8 hours
    difficulty_level: 'intermediate',
    short_summary: 'A comprehensive exploration of stress from a biological perspective, explaining how chronic stress affects our bodies and why humans are uniquely vulnerable to stress-related diseases.',
    full_summary: 'Why Zebras Don't Get Ulcers is a groundbreaking exploration of the stress response in humans and animals. Sapolsky uses engaging examples and scientific evidence to explain how our bodies respond to stress, why chronic psychological stress is uniquely human, and how it contributes to a wide range of diseases. The book covers everything from the immediate stress response to long-term health consequences, including cardiovascular disease, immune suppression, digestive problems, and mental health disorders. Through the lens of evolutionary biology and neuroscience, Sapolsky explains why modern humans experience stress in ways our ancestors didn't, and provides insights into managing stress more effectively.',
    why_read_this: 'This book transforms how you understand stress. It explains the biological mechanisms behind why worrying about tomorrow\'s meeting can harm your health as much as being chased by a predator harms a zebra. Essential reading for anyone interested in health, psychology, or human behavior.',
    target_audience: 'Anyone interested in health, stress management, psychology, or neuroscience. Written for general audiences with clear explanations of complex biological concepts.',
    key_insights: JSON.stringify([
      'Zebras get stressed when being chased; humans get stressed thinking about being chased',
      'Chronic stress suppresses immune function, increases cardiovascular disease risk, and impairs memory',
      'The same stress response that saves your life in emergencies damages your health when activated chronically',
      'Social hierarchies and psychological factors profoundly influence stress and health',
      'Understanding the biology of stress empowers better coping strategies',
    ]),
    main_themes: JSON.stringify([
      'Biology of the stress response',
      'Chronic vs. acute stress',
      'Evolution and modern stress',
      'Mind-body connection',
      'Social factors in health',
    ]),
    discussion_prompts: JSON.stringify([
      {
        prompt: 'Sapolsky argues that humans are unique in experiencing stress from purely psychological threats. What examples from your own life illustrate this?',
        difficulty: 'easy',
      },
      {
        prompt: 'How does understanding the biological mechanisms of stress change your approach to managing it?',
        difficulty: 'medium',
      },
      {
        prompt: 'Sapolsky discusses the health impacts of social hierarchies. How do you see this playing out in modern workplaces or schools?',
        difficulty: 'medium',
      },
    ]),
    is_public: 1,
    license_type: 'fair_use',
  });

  // Chapter 1: Why Zebras Don't Get Ulcers
  const chapter1Id = generateId();
  await createChapter({
    id: chapter1Id,
    book_id: bookId,
    chapter_number: 1,
    chapter_title: 'Why Zebras Don\'t Get Ulcers',
    summary: 'The opening chapter introduces the central metaphor: when a zebra is chased by a lion, its stress response activates powerfully to help it escape. Once safe, the stress response shuts off. Humans, however, can activate the same stress response worrying about mortgages, job performance, or social conflicts - stressors that don't resolve in minutes. This chronic activation of a system meant for short-term emergencies is the root of many modern health problems. Sapolsky explains that understanding this difference is key to understanding stress-related disease.',
    key_points: JSON.stringify([
      'The stress response evolved to save lives in immediate physical threats',
      'Modern humans activate stress responses for psychological reasons',
      'Chronic activation of short-term emergency systems causes long-term damage',
      'Zebras don\'t worry about threats that aren\'t immediately present',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'If you're a zebra running for your life, or a lion sprinting for your meal, your body's physiological response mechanisms are brilliantly adapted for dealing with such short-term physical emergencies.',
        context: 'Introducing the acute stress response',
      },
      {
        quote: 'We humans live well enough and long enough, and are smart enough, to generate all sorts of stressful events purely in our heads.',
        context: 'Explaining psychological stress',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand the difference between acute and chronic stress',
      'Recognize the evolutionary purpose of the stress response',
      'Identify how human cognition creates unique stress vulnerabilities',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Can you think of a time when you experienced a "zebra moment" - real physical danger? How did that feel compared to everyday worries?',
        type: 'reflection',
      },
      {
        question: 'Why do you think evolution didn\'t prepare us better for psychological stress?',
        type: 'analysis',
      },
    ]),
    new_concepts: null, // Will link concepts after creating them
    concepts_reviewed: null,
    estimated_read_time: 30,
    difficulty_rating: 2,
    prerequisite_chapters: null,
    related_chapters: JSON.stringify([]),
  });

  // Chapter 2: Glands, Gooseflesh, and Hormones
  const chapter2Id = generateId();
  await createChapter({
    id: chapter2Id,
    book_id: bookId,
    chapter_number: 2,
    chapter_title: 'Glands, Gooseflesh, and Hormones',
    summary: 'This chapter dives into the biological machinery of the stress response. Sapolsky explains the sympathetic nervous system (fight-or-flight) and the hypothalamic-pituitary-adrenal (HPA) axis. He describes how within seconds of perceiving a threat, your body releases adrenaline and noradrenaline, increasing heart rate, blood pressure, and glucose availability. Minutes later, cortisol kicks in to sustain the response. This elegant system mobilizes energy, suppresses non-essential functions, and sharpens cognition - all perfect for escaping a predator, but problematic when activated by an email from your boss.',
    key_points: JSON.stringify([
      'The sympathetic nervous system provides the immediate stress response (seconds)',
      'The HPA axis sustains the stress response through cortisol (minutes to hours)',
      'Adrenaline increases heart rate, blood pressure, and energy availability',
      'Cortisol mobilizes stored energy and suppresses long-term projects (like digestion and immunity)',
      'These responses are adaptive for short-term crises but damaging when chronic',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'Stress-related disease emerges, predominantly, out of the fact that we so often activate a physiological system that has evolved for responding to acute physical emergencies.',
        context: 'Linking biology to modern stress',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand the two-part stress response: sympathetic nervous system and HPA axis',
      'Learn the roles of adrenaline and cortisol in stress',
      'Recognize why these systems cause problems when chronically activated',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Sapolsky describes cortisol as "mobilizing energy while shutting down long-term projects." What non-emergency functions in your life get neglected when you\'re chronically stressed?',
        type: 'application',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 35,
    difficulty_rating: 3,
    prerequisite_chapters: JSON.stringify([chapter1Id]),
    related_chapters: JSON.stringify([chapter1Id]),
  });

  // Chapter 3: Stroke, Heart Attacks, and Voodoo Death
  const chapter3Id = generateId();
  await createChapter({
    id: chapter3Id,
    book_id: bookId,
    chapter_number: 3,
    chapter_title: 'Stroke, Heart Attacks, and Voodoo Death',
    summary: 'This chapter examines how stress affects the cardiovascular system. During acute stress, increased heart rate and blood pressure help deliver oxygen and glucose to muscles. But chronic stress damages blood vessels, promotes atherosclerosis (plaque buildup), and increases risk of heart attack and stroke. Sapolsky discusses fascinating cases of "voodoo death" - where psychological stress alone can trigger fatal cardiac events - demonstrating the profound mind-body connection. He explains how stress hormones, particularly in combination with other risk factors, contribute to cardiovascular disease, one of the leading causes of death in modern societies.',
    key_points: JSON.stringify([
      'Acute stress increases heart rate and blood pressure to deliver resources to muscles',
      'Chronic stress damages blood vessels and promotes atherosclerosis',
      'Stress increases risk of cardiovascular disease through multiple mechanisms',
      'Psychological stress can trigger heart attacks in vulnerable individuals',
      'Social stress and lack of control amplify cardiovascular risk',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'Stress can give you a heart attack in both the literal and metaphorical sense.',
        context: 'Connecting psychological and physical cardiovascular stress',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand how stress damages the cardiovascular system',
      'Learn the mechanisms linking stress to heart disease',
      'Recognize the role of social and psychological factors in heart health',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'How might the stress of modern work environments contribute to cardiovascular disease in ways that didn\'t affect our ancestors?',
        type: 'analysis',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 40,
    difficulty_rating: 3,
    prerequisite_chapters: JSON.stringify([chapter2Id]),
    related_chapters: JSON.stringify([chapter2Id]),
  });

  // Create key concepts
  const concept1Id = generateId();
  await createConcept({
    id: concept1Id,
    book_id: bookId,
    concept_name: 'Acute vs. Chronic Stress',
    concept_category: 'theory',
    short_definition: 'Acute stress is short-term and adaptive; chronic stress is prolonged and damaging.',
    detailed_explanation: 'Acute stress is the immediate stress response to a specific threat, lasting minutes to hours. It mobilizes resources, enhances performance, and then resolves. Chronic stress occurs when stressors persist or when we repeatedly activate stress responses for psychological reasons. The same systems that save lives in emergencies cause disease when activated continuously. This distinction is central to understanding stress-related illness.',
    visual_metaphor: 'Think of acute stress like sprinting - powerful and useful for short bursts, but you can\'t sprint for hours without damage. Chronic stress is like trying to sprint all day, every day.',
    real_world_example: 'Acute: Being chased by a dog while jogging. Chronic: Worrying every day about job security for months.',
    introduced_in_chapter_id: chapter1Id,
    introduced_in_chapter_number: 1,
    related_concepts: null,
    complexity_level: 2,
  });

  const concept2Id = generateId();
  await createConcept({
    id: concept2Id,
    book_id: bookId,
    concept_name: 'The Stress Response (HPA Axis)',
    concept_category: 'principle',
    short_definition: 'The hypothalamic-pituitary-adrenal axis is the hormonal system that sustains the stress response through cortisol release.',
    detailed_explanation: 'When you perceive a threat, the hypothalamus signals the pituitary gland, which signals the adrenal glands to release cortisol. This process takes minutes and sustains the stress response. Cortisol mobilizes stored energy (increasing blood sugar), suppresses non-essential functions (digestion, immunity, reproduction), and enhances certain cognitive functions. The HPA axis is beautifully adapted for short-term emergencies but causes widespread damage when chronically activated.',
    visual_metaphor: 'The HPA axis is like an emergency broadcast system: when activated, it gets all systems focused on the immediate crisis, putting long-term projects on hold.',
    real_world_example: 'When you nearly get in a car accident, you feel shaky for 20-30 minutes afterward - that\'s cortisol keeping you alert even after the immediate danger has passed.',
    introduced_in_chapter_id: chapter2Id,
    introduced_in_chapter_number: 2,
    related_concepts: JSON.stringify([{ concept_id: concept1Id, relationship: 'builds_on' }]),
    complexity_level: 3,
  });

  const concept3Id = generateId();
  await createConcept({
    id: concept3Id,
    book_id: bookId,
    concept_name: 'Cardiovascular Effects of Stress',
    concept_category: 'principle',
    short_definition: 'Chronic stress damages blood vessels and increases risk of heart disease and stroke through multiple biological mechanisms.',
    detailed_explanation: 'Stress hormones increase heart rate and blood pressure to deliver oxygen and glucose during emergencies. Chronically elevated blood pressure damages blood vessel walls. Stress also promotes atherosclerosis (plaque buildup), increases blood clotting, and can trigger irregular heartbeats. In combination with other risk factors (diet, genetics, age), chronic stress significantly increases cardiovascular disease risk.',
    visual_metaphor: 'Your cardiovascular system during chronic stress is like a car engine constantly revving at high RPM - it wears out faster and parts fail sooner.',
    real_world_example: 'Studies show that people in high-stress jobs with low control (like assembly line workers or middle managers) have significantly higher rates of heart disease than those with high control.',
    introduced_in_chapter_id: chapter3Id,
    introduced_in_chapter_number: 3,
    related_concepts: JSON.stringify([
      { concept_id: concept1Id, relationship: 'applies' },
      { concept_id: concept2Id, relationship: 'mechanism' },
    ]),
    complexity_level: 3,
  });

  console.log('✅ Seeded "Why Zebras Don't Get Ulcers" with 3 chapters and 3 concepts');
}

async function seedSapiensBook() {
  const bookId = 'sapiens';

  // Create book
  await createBook({
    id: bookId,
    title: 'Sapiens',
    subtitle: 'A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    author_bio: 'Yuval Noah Harari is a historian and philosopher, professor at the Hebrew University of Jerusalem. He is the author of the international bestsellers Sapiens, Homo Deus, and 21 Lessons for the 21st Century.',
    isbn: '978-0062316097',
    publication_year: 2015,
    genre: 'History, Anthropology, Philosophy',
    cover_url: null,
    cover_color: '#F4A261',
    total_chapters: 20,
    estimated_read_time: 600, // 10 hours
    difficulty_level: 'intermediate',
    short_summary: 'A sweeping history of humankind from the Stone Age to the present, exploring how Homo sapiens came to dominate the world through cognitive, agricultural, and scientific revolutions.',
    full_summary: 'Sapiens is a provocative exploration of human history, arguing that our species' dominance stems from unique cognitive abilities - particularly the capacity for shared myths and large-scale cooperation. Harari traces humanity through three major revolutions: the Cognitive Revolution (70,000 years ago) which enabled complex language and imagination, the Agricultural Revolution (12,000 years ago) which created settled civilizations but may have been "history's biggest fraud," and the Scientific Revolution (500 years ago) which launched modernity. The book challenges conventional wisdom about progress, happiness, and human nature, asking profound questions about where we came from and where we're headed.',
    why_read_this: 'Sapiens transforms how you understand human history and your place in it. Harari connects anthropology, biology, economics, and philosophy into a coherent narrative that reframes everything from religion to capitalism as human-created fictions - powerful because we collectively believe in them.',
    target_audience: 'Anyone curious about big questions: Why did humans dominate Earth? Are we happier than our ancestors? What is the future of our species? Written accessibly for general audiences.',
    key_insights: JSON.stringify([
      'Humans dominate Earth not through physical prowess but through unique cognitive abilities',
      'Shared myths (nations, money, religions, human rights) enable large-scale cooperation',
      'The Agricultural Revolution may have reduced quality of life for individual humans',
      'Most of what we take for granted (nations, corporations, laws) are human fictions',
      'Scientific progress doesn\'t necessarily mean moral progress or greater happiness',
    ]),
    main_themes: JSON.stringify([
      'Cognitive Revolution and language',
      'Power of shared myths and collective beliefs',
      'Agricultural Revolution as a mixed blessing',
      'Scientific Revolution and progress',
      'Future of Homo sapiens',
    ]),
    discussion_prompts: JSON.stringify([
      {
        prompt: 'Harari argues that the Agricultural Revolution was "history\'s biggest fraud." What does he mean, and do you agree?',
        difficulty: 'medium',
      },
      {
        prompt: 'How does understanding that nations, money, and corporations are "shared myths" change your perspective on them?',
        difficulty: 'medium',
      },
      {
        prompt: 'Harari questions whether modern humans are happier than hunter-gatherers. How would you measure human progress?',
        difficulty: 'hard',
      },
    ]),
    is_public: 1,
    license_type: 'fair_use',
  });

  // Chapter 1: An Animal of No Significance
  const chapter1Id = generateId();
  await createChapter({
    id: chapter1Id,
    book_id: bookId,
    chapter_number: 1,
    chapter_title: 'An Animal of No Significance',
    summary: 'Harari begins by placing humans in context: for 2 million years, multiple human species coexisted, and Homo sapiens was unremarkable. Around 70,000 years ago, something changed. Sapiens began expanding from East Africa, eventually driving other human species (like Neanderthals) to extinction. This chapter introduces the central question: what made Sapiens special? Harari argues it wasn't physical strength, brain size, or tool use - other species had those. The answer lies in something unique that emerged during the Cognitive Revolution.',
    key_points: JSON.stringify([
      'For most of history, multiple human species existed simultaneously',
      'Homo sapiens was initially insignificant in the ecosystem',
      'Around 70,000 years ago, sapiens underwent a Cognitive Revolution',
      'This revolution enabled sapiens to outcompete and replace other human species',
      'The key wasn\'t physical advantages but cognitive ones',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'About 70,000 years ago, Homo sapiens started doing very special things.',
        context: 'Introducing the Cognitive Revolution',
      },
      {
        quote: 'We did not domesticate wheat. It domesticated us.',
        context: 'Foreshadowing the Agricultural Revolution argument',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand the timeline of human evolution',
      'Recognize that sapiens was initially unremarkable',
      'Identify the Cognitive Revolution as the turning point',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Why do you think all other human species went extinct? Was it inevitable once sapiens developed advanced cognition?',
        type: 'analysis',
      },
      {
        question: 'If you could travel back 70,000 years and meet a Homo sapiens, how similar to modern humans do you think they\'d be?',
        type: 'thought_experiment',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 25,
    difficulty_rating: 2,
    prerequisite_chapters: null,
    related_chapters: JSON.stringify([]),
  });

  // Chapter 2: The Tree of Knowledge
  const chapter2Id = generateId();
  await createChapter({
    id: chapter2Id,
    book_id: bookId,
    chapter_number: 2,
    chapter_title: 'The Tree of Knowledge',
    summary: 'This chapter reveals Harari's central thesis: the Cognitive Revolution was a genetic mutation that enabled unprecedented language capabilities. But it wasn't just complex communication that mattered - other species communicate. What made sapiens unique was the ability to create and share fictions: gods, nations, corporations, human rights. This capacity for shared myths enabled large-scale cooperation among strangers, which allowed sapiens to build cities, empires, and trade networks. A band of Neanderthals couldn't cooperate with strangers; sapiens could unite thousands under a shared belief in something that exists only in collective imagination.',
    key_points: JSON.stringify([
      'The Cognitive Revolution enabled complex language and imagination',
      'Unique human ability: creating and believing in shared fictions',
      'Shared myths enable cooperation among large numbers of strangers',
      'Examples: religions, nations, corporations, money, human rights',
      'This capacity for collective belief is the foundation of human civilization',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'The ability to create an imagined reality out of words enabled large numbers of strangers to cooperate effectively.',
        context: 'Explaining the power of shared fictions',
      },
      {
        quote: 'Homo sapiens is the only animal that can believe in things that exist purely in its own imagination.',
        context: 'Defining what makes humans unique',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand the concept of shared fictions and imagined realities',
      'Recognize how myths enable large-scale cooperation',
      'Identify modern examples of shared fictions (nations, corporations, money)',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Harari calls nations, corporations, and human rights "fictions." Does calling them fictions diminish their importance, or help us understand them better?',
        type: 'analysis',
      },
      {
        question: 'Can you think of a shared myth that you participate in? How does it enable cooperation in your life?',
        type: 'application',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 30,
    difficulty_rating: 3,
    prerequisite_chapters: JSON.stringify([chapter1Id]),
    related_chapters: JSON.stringify([chapter1Id]),
  });

  // Chapter 5: History's Biggest Fraud
  const chapter5Id = generateId();
  await createChapter({
    id: chapter5Id,
    book_id: bookId,
    chapter_number: 5,
    chapter_title: 'History\'s Biggest Fraud',
    summary: 'This provocative chapter argues that the Agricultural Revolution, traditionally seen as humanity's great leap forward, was actually a trap. Hunter-gatherers had varied diets, worked fewer hours, and arguably lived more satisfying lives. Farming required more labor, created vulnerability to crop failures and diseases, and trapped humans in backbreaking work. The "fraud" is that agriculture didn't improve individual quality of life - it increased total human population and caloric output, but made most individuals worse off. We didn't choose agriculture rationally; we were gradually domesticated by wheat and other crops, generation by generation, until there was no going back.',
    key_points: JSON.stringify([
      'Agricultural Revolution occurred ~12,000 years ago',
      'Farming increased total human population but reduced individual quality of life',
      'Hunter-gatherers: varied diet, fewer work hours, better health',
      'Farmers: monotonous diet, more disease, harder work, social inequality',
      'The trap: gradual changes made reversal impossible',
      'Agriculture succeeded evolutionarily (more humans) but failed individually (worse lives)',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'The Agricultural Revolution was history\'s biggest fraud. It was a trap.',
        context: 'Central argument of the chapter',
      },
      {
        quote: 'We did not domesticate wheat. It domesticated us.',
        context: 'Inverting the traditional narrative',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand the costs and benefits of agricultural transition',
      'Recognize the difference between evolutionary success and individual well-being',
      'Question assumptions about progress',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'If agriculture made individuals worse off, why did it spread so successfully?',
        type: 'analysis',
      },
      {
        question: 'Do you think Harari is being too harsh on agriculture? What might he be leaving out?',
        type: 'critical_thinking',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 35,
    difficulty_rating: 3,
    prerequisite_chapters: JSON.stringify([chapter2Id]),
    related_chapters: JSON.stringify([chapter2Id]),
  });

  // Create key concepts for Sapiens
  const sapiensConcept1Id = generateId();
  await createConcept({
    id: sapiensConcept1Id,
    book_id: bookId,
    concept_name: 'Cognitive Revolution',
    concept_category: 'theory',
    short_definition: 'A genetic mutation ~70,000 years ago that enabled Homo sapiens to develop complex language and imagination.',
    detailed_explanation: 'The Cognitive Revolution marks the point when sapiens developed unprecedented cognitive abilities. This wasn't just better communication - it was the capacity to imagine and share fictions: gods, nations, corporations, money. This ability enabled cooperation among large numbers of strangers united by shared myths, which no other species could achieve. It's the foundation of human civilization.',
    visual_metaphor: 'Think of the Cognitive Revolution as unlocking a new "operating system" in the human brain - one that could run programs like "shared belief in abstract concepts."',
    real_world_example: 'A thousand sapiens can build a cathedral because they all believe in the Christian god. A thousand chimpanzees can\'t build anything together because they can\'t share abstract beliefs.',
    introduced_in_chapter_id: chapter2Id,
    introduced_in_chapter_number: 2,
    related_concepts: null,
    complexity_level: 3,
  });

  const sapiensConcept2Id = generateId();
  await createConcept({
    id: sapiensConcept2Id,
    book_id: bookId,
    concept_name: 'Shared Fictions (Imagined Realities)',
    concept_category: 'principle',
    short_definition: 'Entities that exist only in collective human imagination but enable large-scale cooperation: nations, corporations, money, human rights, religions.',
    detailed_explanation: 'Shared fictions are things that have no objective reality outside human collective belief, yet powerfully shape behavior. A nation doesn't exist as a physical thing - you can't touch "America" - but millions cooperate based on belief in it. Corporations, money, and human rights are similar: fictions that exist because we collectively agree they do. This isn't dismissive - these fictions are the foundation of civilization. They're "real" in their effects, even if imaginary in substance.',
    visual_metaphor: 'Shared fictions are like the rules of a game - they only exist because players agree they do, but they determine everything about how the game is played.',
    real_world_example: 'A dollar bill is worthless paper. But because we all believe it has value, it functions as money. If that collective belief disappeared, dollars would be worthless instantly.',
    introduced_in_chapter_id: chapter2Id,
    introduced_in_chapter_number: 2,
    related_concepts: JSON.stringify([{ concept_id: sapiensConcept1Id, relationship: 'enabled_by' }]),
    complexity_level: 3,
  });

  const sapiensConcept3Id = generateId();
  await createConcept({
    id: sapiensConcept3Id,
    book_id: bookId,
    concept_name: 'Agricultural Revolution as Trap',
    concept_category: 'theory',
    short_definition: 'The transition to agriculture increased total human population but reduced individual quality of life - a gradual trap from which there was no escape.',
    detailed_explanation: 'Harari argues agriculture was an evolutionary success (more humans) but an individual failure (worse lives). Hunter-gatherers had varied diets, worked ~35 hours/week, and were generally healthier. Early farmers worked harder, ate worse (grain monoculture), and suffered new diseases. But the trap was gradual: each generation made small changes that slightly increased food supply and population, until population density made reverting to hunting impossible. We were domesticated by wheat, not the reverse.',
    visual_metaphor: 'Imagine slowly adding weight to a backpack. Each addition seems bearable, but eventually you\'re carrying 100 pounds and can\'t remember when it became unbearable to set it down.',
    real_world_example: 'Modern workers often feel trapped in demanding jobs, working long hours for consumption needs that didn\'t exist for their grandparents. Each generation adds commitments until "going back" seems impossible.',
    introduced_in_chapter_id: chapter5Id,
    introduced_in_chapter_number: 5,
    related_concepts: JSON.stringify([{ concept_id: sapiensConcept2Id, relationship: 'applies_to' }]),
    complexity_level: 4,
  });

  console.log('✅ Seeded "Sapiens" with 3 chapters and 3 concepts');
}

async function seedMeditationsBook() {
  const bookId = 'meditations';

  // Create book
  await createBook({
    id: bookId,
    title: 'Meditations',
    subtitle: 'Personal Writings of a Roman Emperor',
    author: 'Marcus Aurelius',
    author_bio: 'Marcus Aurelius Antoninus (121-180 AD) was a Roman emperor from 161 to 180 AD and a Stoic philosopher. He was the last of the Five Good Emperors and is remembered as one of the most important Stoic philosophers.',
    isbn: null,
    publication_year: 180,
    genre: 'Philosophy, Stoicism, Self-Help',
    cover_url: null,
    cover_color: '#2A9D8F',
    total_chapters: 12,
    estimated_read_time: 300,
    difficulty_level: 'intermediate',
    short_summary: 'Personal reflections and philosophical exercises written by a Roman emperor to himself, offering timeless wisdom on self-discipline, duty, and finding peace amid chaos.',
    full_summary: 'Meditations is a series of personal writings by Marcus Aurelius, Roman Emperor from 161 to 180 AD. Written in Greek as a source of guidance and self-improvement, the twelve books were never intended for publication. They record his private notes and ideas on Stoic philosophy, providing remarkable insight into the mind of one of history's most powerful men. The work emphasizes virtue as the only true good, the importance of accepting fate, the transience of life, and the power of rational thought to overcome destructive emotions. It remains one of the most influential works of philosophy ever written.',
    why_read_this: 'These are the private thoughts of a man who ruled an empire yet struggled with the same doubts, fears, and temptations we all face. Marcus Aurelius shows us how Stoic philosophy provides practical tools for living a good life, managing emotions, and finding meaning.',
    target_audience: 'Anyone seeking practical wisdom for daily life, interested in ancient philosophy, or looking for guidance on self-improvement and emotional resilience.',
    key_insights: JSON.stringify([
      'Focus only on what is within your control - your thoughts, judgments, and actions',
      'Accept what happens with equanimity; everything is part of nature\'s plan',
      'Remember that life is brief; don\'t waste time on trivial concerns',
      'Your mind is the source of all disturbance - external events cannot truly harm you',
      'Serve humanity and fulfill your duties without expecting recognition',
    ]),
    main_themes: JSON.stringify([
      'Stoic philosophy and virtue',
      'Control and acceptance',
      'Mortality and time',
      'Duty and service',
      'Rational thought over emotion',
    ]),
    discussion_prompts: JSON.stringify([
      {
        prompt: 'Marcus Aurelius says to focus only on what you can control. How might this change your response to a current frustration in your life?',
        difficulty: 'easy',
      },
      {
        prompt: 'Is Stoic acceptance the same as passivity? How can we accept circumstances while still working to change them?',
        difficulty: 'medium',
      },
      {
        prompt: 'Marcus ruled an empire yet wrote that fame and power are meaningless. Was he being hypocritical, or does power reveal this truth?',
        difficulty: 'hard',
      },
    ]),
    is_public: 1,
    license_type: 'public_domain',
  });

  // Chapter 1 (Book II): On Mortality and Purpose
  const chapter1Id = generateId();
  await createChapter({
    id: chapter1Id,
    book_id: bookId,
    chapter_number: 1,
    chapter_title: 'On Mortality and Purpose',
    summary: 'In the second book of Meditations, Marcus Aurelius confronts the brevity of life head-on. He reminds himself that each day could be his last and that procrastination is a form of self-deception. The key insight is that understanding our mortality should not paralyze us but liberate us - freeing us from trivial concerns and focusing our energy on what truly matters: living virtuously and fulfilling our duties. Marcus urges himself to act "as if it were your last action" while maintaining gravity, natural affection, freedom, and justice.',
    key_points: JSON.stringify([
      'Life is brief - act with urgency but not anxiety',
      'Procrastination wastes the limited time we have',
      'Each action should be performed as if it were your last',
      'Focus on what truly matters: virtue, duty, and rational living',
      'External circumstances cannot harm your essential self',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'Remember how long thou hast already put off these things, and how often a certain day and hour having been set by the gods, thou hast neglected it.',
        context: 'On procrastination',
      },
      {
        quote: 'Do every act of your life as if it were your last.',
        context: 'On living with intention',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand how awareness of mortality can motivate virtuous action',
      'Recognize the Stoic view that external events cannot truly harm us',
      'Apply urgency to daily life without falling into anxiety',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'How does thinking about death change what you prioritize today?',
        type: 'reflection',
      },
      {
        question: 'Marcus says to act as if each action were your last. Is this practical advice or just a philosophical ideal?',
        type: 'analysis',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 20,
    difficulty_rating: 2,
    prerequisite_chapters: null,
    related_chapters: JSON.stringify([]),
  });

  // Chapter 2 (Book IV): On the Inner Citadel
  const chapter2Id = generateId();
  await createChapter({
    id: chapter2Id,
    book_id: bookId,
    chapter_number: 2,
    chapter_title: 'The Inner Citadel',
    summary: 'This section introduces one of Marcus's most powerful concepts: the mind as an inner citadel that cannot be invaded by external circumstances. Marcus argues that disturbance comes not from events themselves but from our judgments about them. By retreating into this inner fortress of reason, we can find peace regardless of what happens around us. He emphasizes that we always have the power to revise our judgments and change our perspective, making tranquility a choice rather than a circumstance.',
    key_points: JSON.stringify([
      'Your mind is an inner citadel that external events cannot breach',
      'Disturbance comes from judgments, not from events themselves',
      'You can always retreat into yourself for peace',
      'Changing your judgment about events changes your experience of them',
      'Tranquility is a choice available in any circumstance',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'Things themselves touch not the soul, not in the least degree; nor can they turn or move the soul. The soul turns and moves itself alone.',
        context: 'On the power of judgment',
      },
      {
        quote: 'Very little is needed to make a happy life; it is all within yourself, in your way of thinking.',
        context: 'On inner peace',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand the concept of the inner citadel',
      'Recognize the difference between events and judgments about events',
      'Learn how to access inner tranquility through changed perspective',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Can you think of a situation where your judgment, not the event itself, caused your suffering?',
        type: 'application',
      },
      {
        question: 'Is it always possible to change our judgments about difficult events? What about trauma or loss?',
        type: 'critical_thinking',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 25,
    difficulty_rating: 3,
    prerequisite_chapters: JSON.stringify([chapter1Id]),
    related_chapters: JSON.stringify([chapter1Id]),
  });

  // Chapter 3 (Book VII): On Acceptance and Amor Fati
  const chapter3Id = generateId();
  await createChapter({
    id: chapter3Id,
    book_id: bookId,
    chapter_number: 3,
    chapter_title: 'Accepting Fate',
    summary: 'Marcus develops the Stoic concept of accepting fate - not with resignation but with embrace. Whatever happens is part of nature's rational order, and resistance only causes suffering. This doesn't mean passivity; we should still act virtuously and fulfill our duties. But we should accept outcomes without attachment. Marcus goes further, suggesting we should love our fate (amor fati) - seeing everything that happens as an opportunity for virtue and growth. Pain, loss, and difficulty are not obstacles but the very material of a good life.',
    key_points: JSON.stringify([
      'Accept what happens as part of nature\'s rational order',
      'Resistance to fate causes suffering; acceptance brings peace',
      'Amor fati: love your fate, see everything as opportunity',
      'Acceptance is not passivity - still act virtuously',
      'Obstacles are the material for practicing virtue',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'Accept the things to which fate binds you, and love the people with whom fate brings you together.',
        context: 'On embracing fate',
      },
      {
        quote: 'The obstacle is the way.',
        context: 'On finding opportunity in difficulty',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand the Stoic concept of amor fati (love of fate)',
      'Distinguish between acceptance and passivity',
      'See obstacles as opportunities for growth and virtue',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Is there a situation in your life that you\'re resisting that might be transformed by acceptance?',
        type: 'reflection',
      },
      {
        question: 'How do you reconcile accepting fate with trying to change unjust situations?',
        type: 'analysis',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 25,
    difficulty_rating: 3,
    prerequisite_chapters: JSON.stringify([chapter2Id]),
    related_chapters: JSON.stringify([chapter1Id, chapter2Id]),
  });

  // Create key concepts
  const concept1Id = generateId();
  await createConcept({
    id: concept1Id,
    book_id: bookId,
    concept_name: 'The Dichotomy of Control',
    concept_category: 'principle',
    short_definition: 'Distinguish between what is in your control (your thoughts, judgments, actions) and what is not (external events, others\' actions, outcomes).',
    detailed_explanation: 'The dichotomy of control is the foundation of Stoic practice. Marcus Aurelius, following Epictetus, teaches that we must clearly distinguish between what is "up to us" and what is not. Only our judgments, desires, and actions are truly within our control. External events, other people's behavior, our reputation, and even our health are ultimately beyond our control. By focusing energy only on what we can control, we avoid wasted effort and emotional turmoil. This doesn't mean ignoring externals, but relating to them without attachment.',
    visual_metaphor: 'Imagine two circles: a small inner circle (your thoughts, judgments, choices) and a large outer circle (everything else). All your effort should go into the inner circle; the outer circle you can influence but never control.',
    real_world_example: 'You can prepare excellently for a job interview (in your control), but you cannot control whether you get the job (others\' decisions). Focus on preparation, accept the outcome.',
    introduced_in_chapter_id: chapter1Id,
    introduced_in_chapter_number: 1,
    related_concepts: null,
    complexity_level: 2,
  });

  const concept2Id = generateId();
  await createConcept({
    id: concept2Id,
    book_id: bookId,
    concept_name: 'The Inner Citadel',
    concept_category: 'theory',
    short_definition: 'The mind as an impenetrable fortress of reason and tranquility that external events cannot breach.',
    detailed_explanation: 'Marcus Aurelius describes the mind as an inner citadel - a fortress within that remains untouched by external assault. External events (insults, losses, pain) can only affect us if we let them in through our judgments. By retreating into this inner citadel of reason, we can find peace in any circumstance. The citadel is built through practice: examining our judgments, choosing our responses, and cultivating rational thinking. It's not escapism but engagement with life from a place of inner stability.',
    visual_metaphor: 'Your mind is a walled castle. External events are like armies that can surround it but cannot enter unless you open the gates. Your judgments are the gates.',
    real_world_example: 'When someone criticizes you, the words themselves are just sounds. The hurt only comes when your judgment says "this is harmful to me." Change the judgment, and the citadel holds.',
    introduced_in_chapter_id: chapter2Id,
    introduced_in_chapter_number: 2,
    related_concepts: JSON.stringify([{ concept_id: concept1Id, relationship: 'builds_on' }]),
    complexity_level: 3,
  });

  const concept3Id = generateId();
  await createConcept({
    id: concept3Id,
    book_id: bookId,
    concept_name: 'Amor Fati (Love of Fate)',
    concept_category: 'principle',
    short_definition: 'Not merely accepting but actively embracing everything that happens as necessary and good.',
    detailed_explanation: 'Amor fati goes beyond acceptance to active embrace of fate. Marcus argues that everything happens according to nature's rational order, and what seems bad often serves purposes we cannot see. Rather than tolerating misfortune, we should love it - seeing every obstacle as an opportunity for virtue, every loss as a chance for growth. This transforms suffering from something that happens to us into something we can use. The Stoic doesn't say "I can bear this" but "I am grateful for this."',
    visual_metaphor: 'Life hands you ingredients you didn\'t choose. Amor fati is being a master chef who creates a magnificent dish from whatever ingredients arrive, rather than lamenting you didn\'t get different ones.',
    real_world_example: 'Losing a job feels devastating, but it might lead to a better career path. Amor fati means not just accepting the loss but embracing it as the beginning of something necessary for your growth.',
    introduced_in_chapter_id: chapter3Id,
    introduced_in_chapter_number: 3,
    related_concepts: JSON.stringify([
      { concept_id: concept1Id, relationship: 'applies' },
      { concept_id: concept2Id, relationship: 'enables' },
    ]),
    complexity_level: 4,
  });

  console.log('✅ Seeded "Meditations" with 3 chapters and 3 concepts');
}

async function seedSherlockHolmesBook() {
  const bookId = 'sherlock-holmes';

  // Create book
  await createBook({
    id: bookId,
    title: 'The Adventures of Sherlock Holmes',
    subtitle: 'Twelve Tales of Detection and Deduction',
    author: 'Arthur Conan Doyle',
    author_bio: 'Sir Arthur Conan Doyle (1859-1930) was a British writer and physician, best known for creating the detective Sherlock Holmes. A prolific author, he wrote in many genres including science fiction, fantasy, and historical novels.',
    isbn: null,
    publication_year: 1892,
    genre: 'Fiction, Mystery, Detective',
    cover_url: null,
    cover_color: '#264653',
    total_chapters: 12,
    estimated_read_time: 360,
    difficulty_level: 'beginner',
    short_summary: 'Twelve classic detective stories featuring the legendary Sherlock Holmes and his friend Dr. Watson, showcasing brilliant deductive reasoning and Victorian mystery.',
    full_summary: 'The Adventures of Sherlock Holmes is a collection of twelve short stories featuring the brilliant detective Sherlock Holmes and his loyal companion Dr. John Watson. First published in The Strand Magazine between 1891 and 1892, these tales established Holmes as the world's most famous fictional detective. Each story showcases Holmes's extraordinary powers of observation and deduction as he solves seemingly impossible cases. From royal scandals to mysterious deaths, from secret societies to stolen treasures, Holmes demonstrates that careful observation and logical reasoning can unravel any mystery.',
    why_read_this: 'These stories are masterclasses in observation and logical thinking. Holmes shows us how to see what others miss, make deductions from small details, and think systematically. Beyond the entertainment, they teach critical thinking skills applicable to any field.',
    target_audience: 'Anyone who enjoys mysteries, wants to sharpen their observation and reasoning skills, or is interested in classic literature and Victorian England.',
    key_insights: JSON.stringify([
      'Observation is a skill that can be trained - most people see but do not observe',
      'Eliminate the impossible; whatever remains, however improbable, must be the truth',
      'Small details often reveal the most important information',
      'Assumptions are the enemy of investigation - follow the evidence',
      'Knowledge across many fields enables better reasoning',
    ]),
    main_themes: JSON.stringify([
      'Deductive reasoning',
      'Observation vs. seeing',
      'Logic and method',
      'Victorian society',
      'Justice and morality',
    ]),
    discussion_prompts: JSON.stringify([
      {
        prompt: 'Holmes says "You see, but you do not observe." What\'s the difference, and how might you practice observation in your daily life?',
        difficulty: 'easy',
      },
      {
        prompt: 'Holmes sometimes lets criminals go free when the law would punish them. When, if ever, is justice different from law?',
        difficulty: 'medium',
      },
      {
        prompt: 'Could Holmes\'s methods work today, or has technology made his skills obsolete?',
        difficulty: 'medium',
      },
    ]),
    is_public: 1,
    license_type: 'public_domain',
  });

  // Chapter 1: A Scandal in Bohemia
  const chapter1Id = generateId();
  await createChapter({
    id: chapter1Id,
    book_id: bookId,
    chapter_number: 1,
    chapter_title: 'A Scandal in Bohemia',
    summary: 'The King of Bohemia hires Holmes to recover a compromising photograph from Irene Adler, an opera singer who threatens his upcoming marriage. Holmes disguises himself to observe Adler, orchestrates an elaborate ruse involving a fake fire to discover where she hides the photo, only to find she has outwitted him. Adler, recognizing Holmes, flees with the photograph but promises never to use it. Holmes, who usually dismisses women's intelligence, is forever changed by meeting a woman who beat him at his own game. She becomes "the woman" in his mind - proof that brilliant deduction can be matched by equally brilliant intuition.',
    key_points: JSON.stringify([
      'First appearance of Irene Adler - the only person to outwit Holmes',
      'Holmes uses disguise and psychological manipulation',
      'Demonstrates that Holmes is fallible and can be surprised',
      'Shows the power of intuition alongside deduction',
      'Holmes\'s respect for Adler changes his view of women',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'To Sherlock Holmes she is always THE woman. In his eyes she eclipses and predominates the whole of her sex.',
        context: 'Watson describing Holmes\'s respect for Adler',
      },
      {
        quote: 'You see, but you do not observe. The distinction is clear.',
        context: 'Holmes on the difference between seeing and observing',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand the difference between seeing and observing',
      'Recognize that even experts can be outwitted',
      'Appreciate the value of both logical deduction and intuition',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Why does Holmes respect Adler more than the King despite her lower social status?',
        type: 'analysis',
      },
      {
        question: 'Holmes disguises himself as a clergyman to deceive Adler. When is deception justified?',
        type: 'ethical',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 25,
    difficulty_rating: 2,
    prerequisite_chapters: null,
    related_chapters: JSON.stringify([]),
  });

  // Chapter 2: The Red-Headed League
  const chapter2Id = generateId();
  await createChapter({
    id: chapter2Id,
    book_id: bookId,
    chapter_number: 2,
    chapter_title: 'The Red-Headed League',
    summary: 'Jabez Wilson, a red-headed pawnbroker, consults Holmes about a bizarre experience: he was paid handsomely to copy the encyclopedia for a mysterious "Red-Headed League" that suddenly dissolved. Holmes immediately recognizes this as a cover for something sinister. Through careful observation and logical deduction, he determines that Wilson's assistant orchestrated the scheme to get Wilson out of his shop while tunneling to a nearby bank vault. Holmes intercepts the robbery just as the criminals emerge from the tunnel. The case demonstrates how absurd details often point to rational criminal plans.',
    key_points: JSON.stringify([
      'The most bizarre details often hide the simplest explanations',
      'Criminals sometimes need victims out of the way, not dead',
      'Holmes deduces the plot from the assistant\'s willingness to work cheaply',
      'Observation of small physical details reveals the tunnel (worn trouser knees)',
      'Holmes works with Scotland Yard when needed',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'It is quite a three pipe problem, and I beg that you won\'t speak to me for fifty minutes.',
        context: 'Holmes settling in to think through the puzzle',
      },
      {
        quote: 'Sarasate plays at the St. James\'s Hall this afternoon. What do you think, Watson? Could your patients spare you for a few hours?',
        context: 'Holmes taking time for art before solving crime',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Learn to question situations that seem "too good to be true"',
      'Understand how criminals use misdirection',
      'Practice looking for what someone gains from an unusual situation',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Holmes notices the assistant\'s worn trouser knees. What small details do you overlook that might be meaningful?',
        type: 'application',
      },
      {
        question: 'Why does Holmes enjoy this case even though no violence occurred?',
        type: 'analysis',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 30,
    difficulty_rating: 2,
    prerequisite_chapters: JSON.stringify([chapter1Id]),
    related_chapters: JSON.stringify([chapter1Id]),
  });

  // Chapter 3: The Adventure of the Speckled Band
  const chapter3Id = generateId();
  await createChapter({
    id: chapter3Id,
    book_id: bookId,
    chapter_number: 3,
    chapter_title: 'The Adventure of the Speckled Band',
    summary: 'Helen Stoner seeks Holmes's help, fearing she will die as her sister did two years prior - with the mysterious dying words "the speckled band." Helen must sleep in her dead sister's room due to suspicious renovations, and she has heard strange whistles at night. Holmes investigates the estate of her stepfather, Dr. Grimesby Roylott, a violent man who keeps exotic animals. Holmes discovers a ventilator connecting Helen's room to Roylott's, a fake bell-pull, and a bed bolted to the floor. He deduces that Roylott trained a venomous snake to crawl through the ventilator and kill. Holmes and Watson wait in the room that night; when the snake appears, Holmes strikes it, driving it back to kill its master instead.',
    key_points: JSON.stringify([
      'Physical evidence tells the story: ventilator, bell-pull, bolted bed',
      'Holmes takes physical risk to protect his client',
      'The perfect locked-room murder solved by environmental observation',
      'Seemingly irrelevant details (exotic pets) prove crucial',
      'Holmes shows no remorse for the villain\'s death',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'When a doctor does go wrong, he is the first of criminals. He has nerve and he has knowledge.',
        context: 'Holmes on the danger of educated criminals',
      },
      {
        quote: 'Violence does, in truth, recoil upon the violent, and the schemer falls into the pit which he digs for another.',
        context: 'Holmes on Roylott\'s death',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand how physical environment provides evidence',
      'Learn to question "impossible" crimes by examining constraints',
      'Recognize how specialized knowledge can be used for evil',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Holmes feels no guilt about causing Roylott\'s death. Is his position morally defensible?',
        type: 'ethical',
      },
      {
        question: 'What made this case solvable was Holmes\'s knowledge of snakes. How does broad knowledge help in problem-solving?',
        type: 'application',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 35,
    difficulty_rating: 2,
    prerequisite_chapters: JSON.stringify([chapter2Id]),
    related_chapters: JSON.stringify([chapter1Id, chapter2Id]),
  });

  // Create key concepts
  const concept1Id = generateId();
  await createConcept({
    id: concept1Id,
    book_id: bookId,
    concept_name: 'The Science of Deduction',
    concept_category: 'method',
    short_definition: 'Drawing conclusions from observed facts through logical reasoning, eliminating impossible explanations to find the truth.',
    detailed_explanation: 'Holmes calls his method "the science of deduction" - though technically it often involves induction (reasoning from specific observations to general conclusions) and abduction (inference to the best explanation). The key is systematic reasoning: observe carefully, gather data without prejudice, generate hypotheses, and eliminate those that don't fit the facts. Holmes famously states that once you eliminate the impossible, whatever remains - however improbable - must be the truth. This requires both careful observation and broad knowledge to know what's possible.',
    visual_metaphor: 'Imagine a funnel: you pour in all possible explanations at the top, and facts filter out the impossible ones, leaving only the truth at the bottom.',
    real_world_example: 'A doctor diagnosing an illness: they observe symptoms, consider possible diseases, order tests to eliminate options, until one diagnosis explains all the facts.',
    introduced_in_chapter_id: chapter1Id,
    introduced_in_chapter_number: 1,
    related_concepts: null,
    complexity_level: 2,
  });

  const concept2Id = generateId();
  await createConcept({
    id: concept2Id,
    book_id: bookId,
    concept_name: 'Observation vs. Seeing',
    concept_category: 'principle',
    short_definition: 'Seeing is passive and automatic; observation is active, deliberate attention to details and their significance.',
    detailed_explanation: 'Holmes's distinction between seeing and observing is fundamental to his method. Everyone sees the same world, but most people don't observe - they don't actively attend to details or consider their significance. Observation requires asking: What am I looking at? What details stand out? What do these details imply? What's missing that should be here? Through practice, observation becomes a habit that reveals information invisible to casual viewers. Holmes demonstrates this by deducing Watson's activities from minor details on his person.',
    visual_metaphor: 'Seeing is like a security camera - it records everything but notices nothing. Observation is like a detective reviewing that footage, pausing on details, zooming in, asking questions.',
    real_world_example: 'You "see" your coworker every day. But do you "observe" that they\'ve been wearing long sleeves in summer (hiding something?), arriving early but leaving late (new project or problems at home?), drinking more coffee than usual?',
    introduced_in_chapter_id: chapter1Id,
    introduced_in_chapter_number: 1,
    related_concepts: JSON.stringify([{ concept_id: concept1Id, relationship: 'enables' }]),
    complexity_level: 2,
  });

  const concept3Id = generateId();
  await createConcept({
    id: concept3Id,
    book_id: bookId,
    concept_name: 'Cui Bono (Who Benefits?)',
    concept_category: 'principle',
    short_definition: 'When investigating any situation, ask who benefits from it - motives reveal suspects.',
    detailed_explanation: '"Cui bono" - Latin for "who benefits?" - is a key investigative principle. Holmes often starts by asking who gains from a crime or strange situation. In "The Red-Headed League," the absurd arrangement benefited the assistant who needed Wilson away from the shop. Motive doesn't prove guilt, but it narrows suspects and suggests where to look for evidence. This principle extends beyond crime: in any puzzling situation, asking who benefits often reveals hidden agendas or explains seemingly irrational behavior.',
    visual_metaphor: 'Follow the money - or follow whoever is smiling. In any situation, the person who gains the most often has the most explaining to do.',
    real_world_example: 'A company policy seems inefficient and costly. Ask: who benefits? Perhaps it protects someone\'s department, favors a vendor relationship, or shields executives from accountability.',
    introduced_in_chapter_id: chapter2Id,
    introduced_in_chapter_number: 2,
    related_concepts: JSON.stringify([
      { concept_id: concept1Id, relationship: 'applies' },
      { concept_id: concept2Id, relationship: 'guides' },
    ]),
    complexity_level: 2,
  });

  console.log('✅ Seeded "The Adventures of Sherlock Holmes" with 3 chapters and 3 concepts');
}

async function seedCommonSenseBook() {
  const bookId = 'common-sense';

  // Create book
  await createBook({
    id: bookId,
    title: 'Common Sense',
    subtitle: 'Addressed to the Inhabitants of America',
    author: 'Thomas Paine',
    author_bio: 'Thomas Paine (1737-1809) was an English-born American political activist, philosopher, and revolutionary. His pamphlet Common Sense (1776) inspired the American Revolution. He later wrote Rights of Man and The Age of Reason.',
    isbn: null,
    publication_year: 1776,
    genre: 'Politics, Philosophy, History',
    cover_url: null,
    cover_color: '#9B2226',
    total_chapters: 4,
    estimated_read_time: 180,
    difficulty_level: 'intermediate',
    short_summary: 'The revolutionary pamphlet that inspired American independence, arguing with passion and clarity why the colonies must break from British rule.',
    full_summary: 'Common Sense, published in January 1776, is one of the most influential political pamphlets in history. In clear, accessible language, Paine argued that the American colonies should declare independence from Britain. He attacked the concepts of monarchy and hereditary succession, argued that Britain's relationship with America was exploitative, and laid out the practical advantages of independence. The pamphlet sold over 500,000 copies in its first year and helped transform colonial discontent into revolutionary commitment. Its arguments about natural rights, representative government, and the illegitimacy of hereditary power influenced not only the American Revolution but democratic movements worldwide.',
    why_read_this: 'This pamphlet changed history by making complex political arguments accessible to ordinary people. Paine shows how clear thinking and plain language can challenge power. His arguments about government legitimacy, natural rights, and practical politics remain relevant today.',
    target_audience: 'Anyone interested in American history, political philosophy, the power of persuasive writing, or foundational texts of democratic thought.',
    key_insights: JSON.stringify([
      'Government is a necessary evil; society is a blessing',
      'Hereditary rule has no rational basis - all people are born equal',
      'Distance and divergent interests make colonial rule impractical',
      'Independence is inevitable; delay only makes it harder',
      'New nations have the opportunity to create just governments',
    ]),
    main_themes: JSON.stringify([
      'Natural rights and equality',
      'Critique of monarchy',
      'Practical arguments for independence',
      'Government by consent',
      'The power of plain speech',
    ]),
    discussion_prompts: JSON.stringify([
      {
        prompt: 'Paine says "government, even in its best state, is a necessary evil." Do you agree? What does government do that couldn\'t be done otherwise?',
        difficulty: 'medium',
      },
      {
        prompt: 'How did Paine\'s writing style - simple, direct, emotional - contribute to his persuasive power?',
        difficulty: 'easy',
      },
      {
        prompt: 'Paine argued that hereditary monarchy was absurd. Are there modern institutions that deserve the same critique?',
        difficulty: 'hard',
      },
    ]),
    is_public: 1,
    license_type: 'public_domain',
  });

  // Chapter 1: On Government and Society
  const chapter1Id = generateId();
  await createChapter({
    id: chapter1Id,
    book_id: bookId,
    chapter_number: 1,
    chapter_title: 'Of the Origin and Design of Government',
    summary: 'Paine opens by distinguishing society from government: society arises naturally from human needs and promotes happiness by uniting our affections; government arises from human wickedness and restrains our vices. "Society in every state is a blessing, but government even in its best state is but a necessary evil." He traces government's origin to people voluntarily surrendering some liberty for security. The English constitution, supposedly a balance of monarch, lords, and commons, is actually a confused mess where power gravitates to the crown. Simple government is best - the more complex, the more room for corruption.',
    key_points: JSON.stringify([
      'Society is natural and positive; government is necessary but evil',
      'Government exists because human virtue alone cannot maintain order',
      'Simple government is less prone to corruption than complex systems',
      'The English constitution is praised but actually flawed',
      'Power in Britain gravitates to the monarch despite theoretical balance',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'Society is produced by our wants, and government by our wickedness; the former promotes our happiness positively by uniting our affections, the latter negatively by restraining our vices.',
        context: 'Opening distinction between society and government',
      },
      {
        quote: 'Government, like dress, is the badge of lost innocence; the palaces of kings are built on the ruins of the bowers of paradise.',
        context: 'On government as a sign of human imperfection',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Distinguish between society (natural, positive) and government (necessary evil)',
      'Understand the argument for simple over complex government',
      'Recognize Paine\'s critique of the English constitutional system',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Is Paine right that government is a "necessary evil"? Could society exist without it?',
        type: 'analysis',
      },
      {
        question: 'Paine favored simple government. Does modern government complexity create corruption, as he predicted?',
        type: 'application',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 25,
    difficulty_rating: 3,
    prerequisite_chapters: null,
    related_chapters: JSON.stringify([]),
  });

  // Chapter 2: Of Monarchy and Hereditary Succession
  const chapter2Id = generateId();
  await createChapter({
    id: chapter2Id,
    book_id: bookId,
    chapter_number: 2,
    chapter_title: 'Of Monarchy and Hereditary Succession',
    summary: 'Paine attacks the very concept of monarchy and hereditary rule. In nature, he argues, all people are born equal - distinctions of king and subject are unnatural human inventions. The Bible shows God's displeasure with monarchy when Israel demanded a king. Hereditary succession is even more absurd: even if one person deserved power, that provides no justification for their descendants. "One of the strongest natural proofs of the folly of hereditary right in kings, is, that nature disapproves it, otherwise she would not so frequently turn it into ridicule by giving mankind an ass for a lion." Kings have brought mostly war and misery to humanity.',
    key_points: JSON.stringify([
      'All people are born naturally equal; royalty is artificial distinction',
      'The Bible shows God opposed monarchy for Israel',
      'Even if a ruler is worthy, that doesn\'t justify hereditary succession',
      'Hereditary rule produces incompetent leaders by chance of birth',
      'History shows monarchs bring war and suffering, not peace',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'Of more worth is one honest man to society and in the sight of God, than all the crowned ruffians that ever lived.',
        context: 'Comparing ordinary virtue to royal power',
      },
      {
        quote: 'Nature disapproves hereditary right... by giving mankind an ass for a lion.',
        context: 'On incompetent hereditary rulers',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand Paine\'s argument that monarchy violates natural equality',
      'Recognize the logical flaw in hereditary succession',
      'See how Paine used biblical arguments against monarchy',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Paine uses the Bible to argue against monarchy. Is it legitimate to use religious texts in political arguments?',
        type: 'analysis',
      },
      {
        question: 'Are there modern forms of "hereditary succession" in politics or business that Paine\'s argument would critique?',
        type: 'application',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 30,
    difficulty_rating: 3,
    prerequisite_chapters: JSON.stringify([chapter1Id]),
    related_chapters: JSON.stringify([chapter1Id]),
  });

  // Chapter 3: Thoughts on the Present State of American Affairs
  const chapter3Id = generateId();
  await createChapter({
    id: chapter3Id,
    book_id: bookId,
    chapter_number: 3,
    chapter_title: 'Thoughts on the Present State of American Affairs',
    summary: 'Here Paine makes his case for immediate American independence. He demolishes arguments for reconciliation with Britain: that America has flourished under British rule (it would have flourished more with less interference), that Britain protects America (Britain protects British trade interests, dragging America into wars), that America is too weak (united, America is strong). He argues that timing matters - independence now allows America to create a new government while revolutionary spirit is strong. "The sun never shined on a cause of greater worth... 'TIS TIME TO PART." Delay benefits only Britain, allowing them to divide and weaken the colonies.',
    key_points: JSON.stringify([
      'Britain\'s "protection" was really exploitation of American resources',
      'Britain dragged America into European wars that weren\'t America\'s concern',
      'America\'s growth was despite British rule, not because of it',
      'Independence is inevitable; delay only makes transition harder',
      'This moment offers a unique opportunity to create just government',
    ]),
    key_quotes: JSON.stringify([
      {
        quote: 'The sun never shined on a cause of greater worth. \'Tis not the affair of a city, a county, a province, or a kingdom, but of a continent.',
        context: 'On the magnitude of American independence',
      },
      {
        quote: 'We have it in our power to begin the world over again.',
        context: 'On the opportunity for new government',
      },
    ]),
    learning_objectives: JSON.stringify([
      'Understand Paine\'s rebuttal to arguments for reconciliation',
      'Recognize the strategic argument for immediate action',
      'See how Paine framed American independence as universal cause',
    ]),
    discussion_questions: JSON.stringify([
      {
        question: 'Paine argues that delay weakens movements for change. Does this apply to modern reform efforts?',
        type: 'application',
      },
      {
        question: '"We have it in our power to begin the world over again." When is such revolutionary optimism justified?',
        type: 'analysis',
      },
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 35,
    difficulty_rating: 3,
    prerequisite_chapters: JSON.stringify([chapter2Id]),
    related_chapters: JSON.stringify([chapter1Id, chapter2Id]),
  });

  // Create key concepts
  const concept1Id = generateId();
  await createConcept({
    id: concept1Id,
    book_id: bookId,
    concept_name: 'Government as Necessary Evil',
    concept_category: 'theory',
    short_definition: 'Government is not a positive good but a necessary restraint on human wickedness - the less of it we need, the better.',
    detailed_explanation: 'Paine's opening argument distinguishes society (which emerges naturally from human needs and promotes happiness) from government (which emerges from human wickedness and restrains vices). Society would exist in paradise; government exists because we're imperfect. This framework suggests government should be minimal, limited to what's necessary, and always viewed skeptically. Power tends to corruption, so the burden of proof lies with those who want more government, not less. This idea influenced American constitutional thinking about limited government.',
    visual_metaphor: 'Society is like a garden that grows naturally when people tend it together. Government is like a fence to keep out predators - necessary but not part of the garden\'s beauty.',
    real_world_example: 'When people ask "shouldn\'t the government do something about X?", Paine\'s framework suggests asking: Is this truly necessary? What are the costs? Could society solve this without government force?',
    introduced_in_chapter_id: chapter1Id,
    introduced_in_chapter_number: 1,
    related_concepts: null,
    complexity_level: 3,
  });

  const concept2Id = generateId();
  await createConcept({
    id: concept2Id,
    book_id: bookId,
    concept_name: 'Natural Equality',
    concept_category: 'principle',
    short_definition: 'All humans are born equal; distinctions of king and subject are artificial human inventions with no basis in nature.',
    detailed_explanation: 'Paine argues that natural equality is self-evident: look at any newborn and you see no natural king or natural subject. Distinctions of rank are human inventions, not natural facts. This doesn't mean all people are identical in talent or character, but that no one is born with a natural right to rule others. The burden of proof lies with those claiming authority - they must justify their power, not subjects their liberty. This concept underlies both the American Declaration ("all men are created equal") and democratic theory generally.',
    visual_metaphor: 'Imagine all humans entering the world through the same door, equally naked and helpless. Any crown or chain attached later is a human addition, not part of the original design.',
    real_world_example: 'When someone claims authority by birth, wealth, or status, ask: what justifies this power over me specifically? Natural equality says that without my consent or good justification, such authority is illegitimate.',
    introduced_in_chapter_id: chapter2Id,
    introduced_in_chapter_number: 2,
    related_concepts: JSON.stringify([{ concept_id: concept1Id, relationship: 'builds_on' }]),
    complexity_level: 3,
  });

  const concept3Id = generateId();
  await createConcept({
    id: concept3Id,
    book_id: bookId,
    concept_name: 'The Power of Plain Speech',
    concept_category: 'method',
    short_definition: 'Complex ideas expressed in simple, direct language can move ordinary people to action in ways elaborate arguments cannot.',
    detailed_explanation: 'Common Sense succeeded because Paine wrote for ordinary readers, not elites. He used simple sentences, everyday examples, and emotional appeals alongside logical arguments. He avoided Latin phrases and legal jargon. His goal was not to impress scholars but to persuade farmers, merchants, and tradespeople. This democratic approach to writing was itself a political statement: if politics is everyone's business, political writing should be accessible to everyone. Paine proved that clear thinking expressed plainly is more powerful than obscure learning.',
    visual_metaphor: 'Elite writing is like a locked door with the key hidden in a Latin dictionary. Plain speech throws the door wide open and invites everyone in.',
    real_world_example: 'Notice how effective speakers simplify complex issues: "Ask not what your country can do for you, ask what you can do for your country." The power is in simplicity, rhythm, and emotional resonance.',
    introduced_in_chapter_id: chapter3Id,
    introduced_in_chapter_number: 3,
    related_concepts: JSON.stringify([
      { concept_id: concept1Id, relationship: 'enables' },
      { concept_id: concept2Id, relationship: 'enables' },
    ]),
    complexity_level: 2,
  });

  console.log('✅ Seeded "Common Sense" with 3 chapters and 3 concepts');
}
