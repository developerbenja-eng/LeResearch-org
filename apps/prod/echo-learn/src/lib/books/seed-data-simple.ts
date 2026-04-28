/**
 * Simplified Seed Data for Books System
 * Using template literals to avoid apostrophe issues
 */

import { createBook, createChapter, createConcept } from './db';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function seedBooksSimple() {
  const now = new Date().toISOString();

  // Book 1: Why Zebras Don't Get Ulcers
  const book1Id = generateId();
  await createBook({
    id: book1Id,
    title: `Why Zebras Don't Get Ulcers`,
    subtitle: `The Acclaimed Guide to Stress`,
    author: `Robert Sapolsky`,
    author_bio: null,
    isbn: null,
    publication_year: 2004,
    genre: `Science`,
    cover_url: null,
    cover_color: `#FF6B6B`,
    total_chapters: 3,
    estimated_read_time: 120,
    difficulty_level: `intermediate`,
    short_summary: `A groundbreaking look at how stress affects our bodies. While zebras experience acute stress when chased by lions, humans chronically activate the same stress response through psychological worries.`,
    full_summary: null,
    why_read_this: `Understanding stress is crucial for modern health. This book explains the science clearly.`,
    target_audience: `Anyone interested in health and stress management`,
    key_insights: JSON.stringify([
      `Acute stress vs chronic stress`,
      `The HPA axis and stress response`,
      `How chronic stress damages health`
    ]),
    main_themes: JSON.stringify([
      `Stress physiology`,
      `Mind-body connection`,
      `Modern lifestyle health`
    ]),
    discussion_prompts: JSON.stringify([
      `How does your body respond to stress?`,
      `What are your main sources of chronic stress?`
    ]),
    is_public: 1,
    license_type: `public_domain`,
  });

  // Chapter 1
  const chapter1Id = generateId();
  await createChapter({
    id: chapter1Id,
    book_id: book1Id,
    chapter_number: 1,
    chapter_title: `Why Zebras Don't Get Ulcers`,
    summary: `The opening chapter introduces the central metaphor: when a zebra is chased by a lion, its stress response activates powerfully to help it escape. Once safe, the stress response shuts off. Humans, however, can activate the same stress response worrying about mortgages or job performance - stressors that don't resolve in minutes. This chronic activation is the root of many modern health problems.`,
    key_points: JSON.stringify([
      `Stress response evolved for physical threats`,
      `Humans activate stress for psychological reasons`,
      `Chronic activation causes long-term damage`
    ]),
    key_quotes: null,
    learning_objectives: JSON.stringify([
      `Understand acute vs chronic stress`,
      `Identify your stress triggers`
    ]),
    discussion_questions: JSON.stringify([
      `What causes you stress daily?`,
      `How long does your stress last?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 30,
    difficulty_rating: 2,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Chapter 2
  const chapter2Id = generateId();
  await createChapter({
    id: chapter2Id,
    book_id: book1Id,
    chapter_number: 2,
    chapter_title: `The HPA Axis`,
    summary: `This chapter explains the hypothalamic-pituitary-adrenal axis - the body's stress response system. When you perceive a threat, your hypothalamus signals the pituitary gland, which triggers the adrenal glands to release cortisol. This is brilliant for short-term emergencies but becomes problematic when activated chronically.`,
    key_points: JSON.stringify([
      `The HPA axis is the stress response system`,
      `Cortisol is the main stress hormone`,
      `Chronic activation damages multiple systems`
    ]),
    key_quotes: null,
    learning_objectives: JSON.stringify([
      `Understand the HPA axis mechanism`,
      `Learn about cortisol effects`
    ]),
    discussion_questions: JSON.stringify([
      `How does chronic cortisol affect health?`,
      `What can reduce cortisol levels?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 35,
    difficulty_rating: 3,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Chapter 3
  const chapter3Id = generateId();
  await createChapter({
    id: chapter3Id,
    book_id: book1Id,
    chapter_number: 3,
    chapter_title: `Health Consequences`,
    summary: `This chapter details how chronic stress damages cardiovascular, immune, and digestive systems. Elevated cortisol increases heart disease risk, suppresses immune function, and causes digestive problems. Understanding these connections helps motivate stress management.`,
    key_points: JSON.stringify([
      `Stress increases heart disease risk`,
      `Chronic stress suppresses immunity`,
      `Digestive issues linked to stress`
    ]),
    key_quotes: null,
    learning_objectives: JSON.stringify([
      `Identify stress-related health risks`,
      `Understand system-wide impacts`
    ]),
    discussion_questions: JSON.stringify([
      `What health issues might stress be causing you?`,
      `How can you reduce chronic stress?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 40,
    difficulty_rating: 2,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Concept 1
  const concept1Id = generateId();
  await createConcept({
    id: concept1Id,
    book_id: book1Id,
    concept_name: `Acute vs Chronic Stress`,
    concept_category: `Physiology`,
    short_definition: `Acute stress is short-term response to immediate threats. Chronic stress is prolonged activation of stress response.`,
    detailed_explanation: `Acute stress evolved to save lives in emergencies - it shuts off when the threat passes. Chronic stress keeps the system activated for weeks, months, or years, causing damage to multiple body systems.`,
    visual_metaphor: `Acute stress is like a sprint - intense but brief. Chronic stress is like running a marathon every day.`,
    real_world_example: `Acute: zebra escaping a lion. Chronic: human worrying about job security daily.`,
    introduced_in_chapter_id: chapter1Id,
    introduced_in_chapter_number: 1,
    related_concepts: JSON.stringify([`HPA Axis`, `Cortisol`]),
    complexity_level: 2,
  });

  // Concept 2
  const concept2Id = generateId();
  await createConcept({
    id: concept2Id,
    book_id: book1Id,
    concept_name: `HPA Axis`,
    concept_category: `Anatomy`,
    short_definition: `The hypothalamic-pituitary-adrenal axis is the body's central stress response system.`,
    detailed_explanation: `When you perceive a threat, the hypothalamus signals the pituitary gland, which triggers the adrenal glands to release cortisol. This cascade prepares your body for fight or flight.`,
    visual_metaphor: `Think of it as a chain reaction - like dominoes falling. One signal triggers the next until cortisol floods your system.`,
    real_world_example: `When you see a snake, the HPA axis activates in milliseconds, preparing you to jump back.`,
    introduced_in_chapter_id: chapter2Id,
    introduced_in_chapter_number: 2,
    related_concepts: JSON.stringify([`Cortisol`, `Acute vs Chronic Stress`]),
    complexity_level: 3,
  });

  // Concept 3
  const concept3Id = generateId();
  await createConcept({
    id: concept3Id,
    book_id: book1Id,
    concept_name: `Cardiovascular Effects`,
    concept_category: `Health Impact`,
    short_definition: `Chronic stress damages the cardiovascular system, increasing heart disease risk.`,
    detailed_explanation: `Elevated cortisol raises blood pressure, increases heart rate, and promotes arterial damage. Over time, this significantly increases risk of heart attack and stroke.`,
    visual_metaphor: `Like constantly revving an engine - the parts wear out faster when running at high RPM all the time.`,
    real_world_example: `People with high-stress jobs have higher rates of heart disease, even when controlling for other factors.`,
    introduced_in_chapter_id: chapter3Id,
    introduced_in_chapter_number: 3,
    related_concepts: JSON.stringify([`HPA Axis`, `Chronic Stress`]),
    complexity_level: 2,
  });

  // Book 2: Sapiens
  const book2Id = generateId();
  await createBook({
    id: book2Id,
    title: `Sapiens`,
    subtitle: `A Brief History of Humankind`,
    author: `Yuval Noah Harari`,
    author_bio: null,
    isbn: null,
    publication_year: 2014,
    genre: `History`,
    cover_url: null,
    cover_color: `#4ECDC4`,
    total_chapters: 3,
    estimated_read_time: 150,
    difficulty_level: `intermediate`,
    short_summary: `A brief history of humankind from the Stone Age to the modern era. Explores how Homo sapiens came to dominate the world through unique cognitive abilities.`,
    full_summary: null,
    why_read_this: `Understand human history and what makes us unique`,
    target_audience: `Anyone curious about human history and society`,
    key_insights: JSON.stringify([
      `The Cognitive Revolution enabled cooperation`,
      `Shared myths and fictions create societies`,
      `Agriculture was a trap, not progress`
    ]),
    main_themes: JSON.stringify([
      `Human evolution`,
      `Social cooperation`,
      `Historical progress`
    ]),
    discussion_prompts: JSON.stringify([
      `What shared fictions do you believe in?`,
      `Was agriculture really progress?`
    ]),
    is_public: 1,
    license_type: `public_domain`,
  });

  // Sapiens Chapter 1
  const sChapter1Id = generateId();
  await createChapter({
    id: sChapter1Id,
    book_id: book2Id,
    chapter_number: 1,
    chapter_title: `An Animal of No Significance`,
    summary: `Harari begins by placing humans in context: for 2 million years, multiple human species coexisted. Around 70,000 years ago, Homo sapiens began expanding from East Africa, eventually driving other species to extinction. This chapter introduces the question: what made Sapiens special?`,
    key_points: JSON.stringify([
      `Multiple human species once coexisted`,
      `Sapiens were initially unremarkable`,
      `Something changed 70,000 years ago`
    ]),
    key_quotes: null,
    learning_objectives: JSON.stringify([
      `Understand early human history`,
      `Question what makes humans unique`
    ]),
    discussion_questions: JSON.stringify([
      `Why did Sapiens succeed while others failed?`,
      `What does this tell us about ourselves?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 45,
    difficulty_rating: 2,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Sapiens Concept 1
  const sConcept1Id = generateId();
  await createConcept({
    id: sConcept1Id,
    book_id: book2Id,
    concept_name: `Cognitive Revolution`,
    concept_category: `Evolution`,
    short_definition: `A genetic mutation around 70,000 years ago that gave Sapiens unique language and cognitive abilities.`,
    detailed_explanation: `The Cognitive Revolution enabled Sapiens to create and share fictions - gods, nations, corporations. This capacity for shared myths allowed large-scale cooperation among strangers, which no other species could achieve.`,
    visual_metaphor: `Like upgrading from dial-up to high-speed internet - same hardware, revolutionary new capabilities.`,
    real_world_example: `Thousands of people cooperate to build a corporation, united by shared belief in something that exists only in collective imagination.`,
    introduced_in_chapter_id: sChapter1Id,
    introduced_in_chapter_number: 1,
    related_concepts: JSON.stringify([`Shared Fictions`]),
    complexity_level: 3,
  });

  // Book 3: Meditations by Marcus Aurelius
  const book3Id = generateId();
  await createBook({
    id: book3Id,
    title: `Meditations`,
    subtitle: `Personal Writings of a Roman Emperor`,
    author: `Marcus Aurelius`,
    author_bio: `Roman Emperor from 161 to 180 AD and Stoic philosopher`,
    isbn: null,
    publication_year: 180,
    genre: `Philosophy`,
    cover_url: null,
    cover_color: `#2A9D8F`,
    total_chapters: 3,
    estimated_read_time: 90,
    difficulty_level: `intermediate`,
    short_summary: `Personal reflections of a Roman emperor offering timeless wisdom on self-discipline, duty, and finding peace amid chaos through Stoic philosophy.`,
    full_summary: null,
    why_read_this: `Practical wisdom for managing emotions and finding meaning, written by one of history's most powerful yet thoughtful men.`,
    target_audience: `Anyone seeking practical wisdom for daily life`,
    key_insights: JSON.stringify([
      `Focus only on what you can control`,
      `Your mind is the source of all disturbance`,
      `Accept fate and find opportunity in obstacles`
    ]),
    main_themes: JSON.stringify([
      `Stoic philosophy`,
      `Control and acceptance`,
      `Mortality and purpose`
    ]),
    discussion_prompts: JSON.stringify([
      `What is within your control today?`,
      `How can acceptance lead to peace?`
    ]),
    is_public: 1,
    license_type: `public_domain`,
  });

  // Meditations Chapter 1
  const mChapter1Id = generateId();
  await createChapter({
    id: mChapter1Id,
    book_id: book3Id,
    chapter_number: 1,
    chapter_title: `On Mortality and Purpose`,
    summary: `Marcus Aurelius confronts the brevity of life head-on. He reminds himself that each day could be his last and that procrastination is self-deception. Understanding mortality should not paralyze us but liberate us from trivial concerns.`,
    key_points: JSON.stringify([
      `Life is brief - act with urgency`,
      `Procrastination wastes limited time`,
      `Each action should be as if your last`
    ]),
    key_quotes: JSON.stringify([
      `Do every act of your life as if it were your last.`
    ]),
    learning_objectives: JSON.stringify([
      `Understand how mortality motivates virtue`,
      `Apply urgency without anxiety`
    ]),
    discussion_questions: JSON.stringify([
      `How does thinking about death change priorities?`,
      `What would you do if today were your last?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 20,
    difficulty_rating: 2,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Meditations Chapter 2
  const mChapter2Id = generateId();
  await createChapter({
    id: mChapter2Id,
    book_id: book3Id,
    chapter_number: 2,
    chapter_title: `The Inner Citadel`,
    summary: `Marcus introduces the concept of the mind as an inner citadel that cannot be invaded by external circumstances. Disturbance comes not from events but from our judgments about them. We can always find peace within ourselves.`,
    key_points: JSON.stringify([
      `Your mind is an inner fortress`,
      `Disturbance comes from judgments, not events`,
      `Tranquility is a choice`
    ]),
    key_quotes: JSON.stringify([
      `Very little is needed to make a happy life; it is all within yourself.`
    ]),
    learning_objectives: JSON.stringify([
      `Understand the inner citadel concept`,
      `Recognize judgments vs events`
    ]),
    discussion_questions: JSON.stringify([
      `When has your judgment, not an event, caused suffering?`,
      `How can you retreat into yourself for peace?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 25,
    difficulty_rating: 3,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Meditations Chapter 3
  const mChapter3Id = generateId();
  await createChapter({
    id: mChapter3Id,
    book_id: book3Id,
    chapter_number: 3,
    chapter_title: `Accepting Fate`,
    summary: `Marcus develops amor fati - not mere acceptance but embracing fate. Whatever happens is part of nature's rational order. We should see every obstacle as opportunity for virtue and growth. Pain and difficulty are not obstacles but the material of a good life.`,
    key_points: JSON.stringify([
      `Accept fate as part of nature's order`,
      `Amor fati: love your fate`,
      `Obstacles are opportunities for virtue`
    ]),
    key_quotes: JSON.stringify([
      `The obstacle is the way.`
    ]),
    learning_objectives: JSON.stringify([
      `Understand amor fati`,
      `See obstacles as opportunities`
    ]),
    discussion_questions: JSON.stringify([
      `What situation are you resisting that could be transformed by acceptance?`,
      `How can obstacles become opportunities?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 25,
    difficulty_rating: 3,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Meditations Concepts
  await createConcept({
    id: generateId(),
    book_id: book3Id,
    concept_name: `Dichotomy of Control`,
    concept_category: `Philosophy`,
    short_definition: `Distinguish between what you can control (your thoughts, actions) and what you cannot (external events).`,
    detailed_explanation: `Only our judgments, desires, and actions are truly within our control. External events are beyond our control. By focusing energy only on what we can control, we avoid wasted effort and emotional turmoil.`,
    visual_metaphor: `Two circles: inner (your control) and outer (everything else). All effort goes to the inner circle.`,
    real_world_example: `You can prepare for an interview (control), but cannot control if you get the job (others' decisions).`,
    introduced_in_chapter_id: mChapter1Id,
    introduced_in_chapter_number: 1,
    related_concepts: JSON.stringify([`Inner Citadel`, `Amor Fati`]),
    complexity_level: 2,
  });

  await createConcept({
    id: generateId(),
    book_id: book3Id,
    concept_name: `Inner Citadel`,
    concept_category: `Philosophy`,
    short_definition: `The mind as an impenetrable fortress that external events cannot breach.`,
    detailed_explanation: `External events can only affect us if we let them in through our judgments. By retreating into this inner citadel of reason, we can find peace in any circumstance.`,
    visual_metaphor: `Your mind is a walled castle. External events are armies that surround but cannot enter unless you open the gates.`,
    real_world_example: `When criticized, the words are just sounds. Hurt only comes when your judgment says this is harmful.`,
    introduced_in_chapter_id: mChapter2Id,
    introduced_in_chapter_number: 2,
    related_concepts: JSON.stringify([`Dichotomy of Control`]),
    complexity_level: 3,
  });

  await createConcept({
    id: generateId(),
    book_id: book3Id,
    concept_name: `Amor Fati`,
    concept_category: `Philosophy`,
    short_definition: `Love of fate - not merely accepting but actively embracing everything that happens.`,
    detailed_explanation: `Rather than tolerating misfortune, love it - seeing every obstacle as opportunity for virtue, every loss as chance for growth. Transform suffering from something that happens to us into something we use.`,
    visual_metaphor: `Life hands you ingredients you didn't choose. Amor fati is being a master chef creating magnificent dishes from whatever arrives.`,
    real_world_example: `Losing a job feels devastating, but might lead to a better path. Embrace it as the beginning of growth.`,
    introduced_in_chapter_id: mChapter3Id,
    introduced_in_chapter_number: 3,
    related_concepts: JSON.stringify([`Dichotomy of Control`, `Inner Citadel`]),
    complexity_level: 4,
  });

  // Book 4: Sherlock Holmes
  const book4Id = generateId();
  await createBook({
    id: book4Id,
    title: `The Adventures of Sherlock Holmes`,
    subtitle: `Twelve Tales of Detection and Deduction`,
    author: `Arthur Conan Doyle`,
    author_bio: `British writer and physician who created Sherlock Holmes`,
    isbn: null,
    publication_year: 1892,
    genre: `Fiction, Mystery`,
    cover_url: null,
    cover_color: `#264653`,
    total_chapters: 3,
    estimated_read_time: 90,
    difficulty_level: `beginner`,
    short_summary: `Classic detective stories featuring Sherlock Holmes and Dr. Watson, showcasing brilliant deductive reasoning and Victorian mystery.`,
    full_summary: null,
    why_read_this: `Masterclasses in observation and logical thinking applicable to any field.`,
    target_audience: `Mystery lovers and anyone wanting to sharpen reasoning skills`,
    key_insights: JSON.stringify([
      `Most people see but do not observe`,
      `Eliminate the impossible to find truth`,
      `Small details reveal important information`
    ]),
    main_themes: JSON.stringify([
      `Deductive reasoning`,
      `Observation skills`,
      `Logic and method`
    ]),
    discussion_prompts: JSON.stringify([
      `What is the difference between seeing and observing?`,
      `How can you apply deduction in daily life?`
    ]),
    is_public: 1,
    license_type: `public_domain`,
  });

  // Sherlock Chapter 1
  const shChapter1Id = generateId();
  await createChapter({
    id: shChapter1Id,
    book_id: book4Id,
    chapter_number: 1,
    chapter_title: `A Scandal in Bohemia`,
    summary: `The King of Bohemia hires Holmes to recover a compromising photograph from Irene Adler. Holmes uses elaborate disguises and tricks, but Adler outwits him - the only person ever to beat Holmes at his own game. She becomes "the woman" in his mind, proof that intuition can match deduction.`,
    key_points: JSON.stringify([
      `First appearance of Irene Adler`,
      `Holmes is fallible and can be surprised`,
      `Both deduction and intuition have power`
    ]),
    key_quotes: JSON.stringify([
      `You see, but you do not observe. The distinction is clear.`
    ]),
    learning_objectives: JSON.stringify([
      `Understand seeing vs observing`,
      `Recognize that experts can be outwitted`
    ]),
    discussion_questions: JSON.stringify([
      `Why does Holmes respect Adler?`,
      `When is deception justified?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 25,
    difficulty_rating: 2,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Sherlock Chapter 2
  const shChapter2Id = generateId();
  await createChapter({
    id: shChapter2Id,
    book_id: book4Id,
    chapter_number: 2,
    chapter_title: `The Red-Headed League`,
    summary: `A pawnbroker consults Holmes about a bizarre experience: being paid to copy an encyclopedia for a mysterious league that suddenly dissolved. Holmes deduces this was a cover for criminals tunneling to a nearby bank vault, intercepting the robbery in progress.`,
    key_points: JSON.stringify([
      `Bizarre details often hide simple explanations`,
      `Criminals use misdirection`,
      `Small physical details reveal crimes`
    ]),
    key_quotes: JSON.stringify([
      `It is quite a three pipe problem.`
    ]),
    learning_objectives: JSON.stringify([
      `Question "too good to be true" situations`,
      `Understand criminal misdirection`
    ]),
    discussion_questions: JSON.stringify([
      `What small details might you overlook?`,
      `How do criminals use misdirection?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 30,
    difficulty_rating: 2,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Sherlock Chapter 3
  const shChapter3Id = generateId();
  await createChapter({
    id: shChapter3Id,
    book_id: book4Id,
    chapter_number: 3,
    chapter_title: `The Speckled Band`,
    summary: `Helen Stoner fears she will die as her sister did with mysterious dying words about a "speckled band." Holmes discovers the villain trained a venomous snake to crawl through a ventilator and kill. When Holmes strikes the snake, it kills its master instead.`,
    key_points: JSON.stringify([
      `Physical evidence tells the story`,
      `Locked-room mysteries have rational solutions`,
      `Specialized knowledge aids investigation`
    ]),
    key_quotes: JSON.stringify([
      `Violence does, in truth, recoil upon the violent.`
    ]),
    learning_objectives: JSON.stringify([
      `Use environment as evidence`,
      `Question "impossible" crimes`
    ]),
    discussion_questions: JSON.stringify([
      `Is Holmes justified in causing the villain's death?`,
      `How does broad knowledge aid problem-solving?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 35,
    difficulty_rating: 2,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Sherlock Concepts
  await createConcept({
    id: generateId(),
    book_id: book4Id,
    concept_name: `The Science of Deduction`,
    concept_category: `Method`,
    short_definition: `Drawing conclusions from observed facts through logical reasoning, eliminating impossible explanations.`,
    detailed_explanation: `Observe carefully, gather data without prejudice, generate hypotheses, and eliminate those that don't fit the facts. Once you eliminate the impossible, whatever remains must be the truth.`,
    visual_metaphor: `A funnel: pour all possible explanations at top, facts filter out impossible ones, leaving truth at bottom.`,
    real_world_example: `A doctor observing symptoms, considering diseases, ordering tests until one diagnosis explains all facts.`,
    introduced_in_chapter_id: shChapter1Id,
    introduced_in_chapter_number: 1,
    related_concepts: JSON.stringify([`Observation vs Seeing`]),
    complexity_level: 2,
  });

  await createConcept({
    id: generateId(),
    book_id: book4Id,
    concept_name: `Observation vs Seeing`,
    concept_category: `Skill`,
    short_definition: `Seeing is passive; observation is active, deliberate attention to details and their significance.`,
    detailed_explanation: `Everyone sees the same world but most don't observe - actively attending to details or considering significance. Observation requires asking: What am I looking at? What details stand out? What do they imply?`,
    visual_metaphor: `Seeing is a security camera recording everything but noticing nothing. Observation is a detective reviewing footage, pausing on details.`,
    real_world_example: `You see your coworker daily, but do you observe they've been wearing long sleeves in summer or drinking more coffee?`,
    introduced_in_chapter_id: shChapter1Id,
    introduced_in_chapter_number: 1,
    related_concepts: JSON.stringify([`Science of Deduction`]),
    complexity_level: 2,
  });

  await createConcept({
    id: generateId(),
    book_id: book4Id,
    concept_name: `Cui Bono`,
    concept_category: `Investigation`,
    short_definition: `"Who benefits?" - motives reveal suspects in any puzzling situation.`,
    detailed_explanation: `When investigating, ask who gains from a crime or strange situation. Motive doesn't prove guilt but narrows suspects and suggests where to look for evidence.`,
    visual_metaphor: `Follow the money - or whoever is smiling. The person who gains most often has the most explaining to do.`,
    real_world_example: `A company policy seems inefficient. Ask: who benefits? Perhaps it protects someone's department or shields executives.`,
    introduced_in_chapter_id: shChapter2Id,
    introduced_in_chapter_number: 2,
    related_concepts: JSON.stringify([`Science of Deduction`]),
    complexity_level: 2,
  });

  // Book 5: Common Sense
  const book5Id = generateId();
  await createBook({
    id: book5Id,
    title: `Common Sense`,
    subtitle: `Addressed to the Inhabitants of America`,
    author: `Thomas Paine`,
    author_bio: `English-born American revolutionary and political activist`,
    isbn: null,
    publication_year: 1776,
    genre: `Politics, Philosophy`,
    cover_url: null,
    cover_color: `#9B2226`,
    total_chapters: 3,
    estimated_read_time: 60,
    difficulty_level: `intermediate`,
    short_summary: `The revolutionary pamphlet that inspired American independence, arguing why the colonies must break from British rule.`,
    full_summary: null,
    why_read_this: `See how clear thinking and plain language can challenge power. Arguments about legitimacy remain relevant today.`,
    target_audience: `Anyone interested in history, political philosophy, or persuasive writing`,
    key_insights: JSON.stringify([
      `Government is a necessary evil`,
      `Hereditary rule has no rational basis`,
      `Plain speech moves people to action`
    ]),
    main_themes: JSON.stringify([
      `Natural rights and equality`,
      `Critique of monarchy`,
      `Power of plain speech`
    ]),
    discussion_prompts: JSON.stringify([
      `Is government a necessary evil?`,
      `What makes writing persuasive?`
    ]),
    is_public: 1,
    license_type: `public_domain`,
  });

  // Common Sense Chapter 1
  const csChapter1Id = generateId();
  await createChapter({
    id: csChapter1Id,
    book_id: book5Id,
    chapter_number: 1,
    chapter_title: `Of the Origin of Government`,
    summary: `Paine distinguishes society from government: society arises naturally from human needs; government arises from human wickedness. "Society in every state is a blessing, but government even in its best state is but a necessary evil."`,
    key_points: JSON.stringify([
      `Society is natural and positive`,
      `Government is necessary but evil`,
      `Simple government is best`
    ]),
    key_quotes: JSON.stringify([
      `Society is produced by our wants, and government by our wickedness.`
    ]),
    learning_objectives: JSON.stringify([
      `Distinguish society from government`,
      `Understand argument for simple government`
    ]),
    discussion_questions: JSON.stringify([
      `Is government really a "necessary evil"?`,
      `Does complexity create corruption?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 20,
    difficulty_rating: 3,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Common Sense Chapter 2
  const csChapter2Id = generateId();
  await createChapter({
    id: csChapter2Id,
    book_id: book5Id,
    chapter_number: 2,
    chapter_title: `Of Monarchy and Hereditary Succession`,
    summary: `Paine attacks monarchy and hereditary rule. In nature, all people are born equal - royal distinctions are unnatural inventions. Even if one person deserves power, that provides no justification for their descendants.`,
    key_points: JSON.stringify([
      `All people are born equal`,
      `Royalty is artificial distinction`,
      `Hereditary rule is absurd`
    ]),
    key_quotes: JSON.stringify([
      `Of more worth is one honest man than all the crowned ruffians that ever lived.`
    ]),
    learning_objectives: JSON.stringify([
      `Understand natural equality`,
      `Recognize flaws in hereditary succession`
    ]),
    discussion_questions: JSON.stringify([
      `Are there modern forms of hereditary power?`,
      `What justifies authority over others?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 25,
    difficulty_rating: 3,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Common Sense Chapter 3
  const csChapter3Id = generateId();
  await createChapter({
    id: csChapter3Id,
    book_id: book5Id,
    chapter_number: 3,
    chapter_title: `Thoughts on the Present State`,
    summary: `Paine makes the case for immediate independence. Britain's "protection" was exploitation. Independence is inevitable; delay only benefits Britain. "We have it in our power to begin the world over again."`,
    key_points: JSON.stringify([
      `Britain exploited, not protected, America`,
      `Independence is inevitable`,
      `Now is the time for new government`
    ]),
    key_quotes: JSON.stringify([
      `We have it in our power to begin the world over again.`
    ]),
    learning_objectives: JSON.stringify([
      `Understand arguments against reconciliation`,
      `Recognize strategic value of timing`
    ]),
    discussion_questions: JSON.stringify([
      `When is revolutionary change justified?`,
      `Does delay weaken reform movements?`
    ]),
    new_concepts: null,
    concepts_reviewed: null,
    estimated_read_time: 30,
    difficulty_rating: 3,
    prerequisite_chapters: null,
    related_chapters: null,
  });

  // Common Sense Concepts
  await createConcept({
    id: generateId(),
    book_id: book5Id,
    concept_name: `Government as Necessary Evil`,
    concept_category: `Political Philosophy`,
    short_definition: `Government is not a positive good but a necessary restraint on human wickedness.`,
    detailed_explanation: `Society emerges naturally from human needs and promotes happiness. Government emerges from human wickedness and restrains vices. This suggests government should be minimal, always viewed skeptically.`,
    visual_metaphor: `Society is a garden growing naturally. Government is a fence keeping out predators - necessary but not part of the garden's beauty.`,
    real_world_example: `When asked "shouldn't government do X?" - ask: Is this truly necessary? Could society solve this without force?`,
    introduced_in_chapter_id: csChapter1Id,
    introduced_in_chapter_number: 1,
    related_concepts: JSON.stringify([`Natural Equality`]),
    complexity_level: 3,
  });

  await createConcept({
    id: generateId(),
    book_id: book5Id,
    concept_name: `Natural Equality`,
    concept_category: `Political Philosophy`,
    short_definition: `All humans are born equal; distinctions of rank are human inventions, not natural facts.`,
    detailed_explanation: `Look at any newborn and you see no natural king or subject. No one is born with a natural right to rule others. The burden of proof lies with those claiming authority.`,
    visual_metaphor: `All humans enter the world through the same door, equally naked. Any crown or chain attached later is a human addition.`,
    real_world_example: `When someone claims authority by birth or wealth, ask: what justifies this power over me specifically?`,
    introduced_in_chapter_id: csChapter2Id,
    introduced_in_chapter_number: 2,
    related_concepts: JSON.stringify([`Government as Necessary Evil`]),
    complexity_level: 3,
  });

  await createConcept({
    id: generateId(),
    book_id: book5Id,
    concept_name: `Power of Plain Speech`,
    concept_category: `Communication`,
    short_definition: `Complex ideas in simple language move ordinary people to action.`,
    detailed_explanation: `Paine wrote for ordinary readers, not elites. Simple sentences, everyday examples, and emotional appeals alongside logic. If politics is everyone's business, political writing should be accessible to everyone.`,
    visual_metaphor: `Elite writing is a locked door with the key in a Latin dictionary. Plain speech throws the door wide open.`,
    real_world_example: `"Ask not what your country can do for you" - power is in simplicity, rhythm, and emotional resonance.`,
    introduced_in_chapter_id: csChapter3Id,
    introduced_in_chapter_number: 3,
    related_concepts: JSON.stringify([`Natural Equality`]),
    complexity_level: 2,
  });

  return {
    message: `Seeded 5 books, 13 chapters, and 13 concepts successfully`,
    books: [book1Id, book2Id, book3Id, book4Id, book5Id],
  };
}
