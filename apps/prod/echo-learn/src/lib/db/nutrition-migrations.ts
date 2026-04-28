/**
 * Nutrition Module Database Migrations
 * Creates tables for discoveries, pioneers, and user progress
 */

import { getUniversalDb, execute } from './turso';

export async function runNutritionMigrations() {
  const db = getUniversalDb();

  // Create nutrition_discoveries table
  await execute(db,
    `CREATE TABLE IF NOT EXISTS nutrition_discoveries (
      id TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      end_year INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT,
      scientist_name TEXT,
      scientist_id TEXT,
      category TEXT NOT NULL,
      impact TEXT,
      primary_sources TEXT,
      related_discoveries TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create nutrition_pioneers table
  await execute(db,
    `CREATE TABLE IF NOT EXISTS nutrition_pioneers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      birth_year INTEGER,
      death_year INTEGER,
      nationality TEXT,
      portrait_url TEXT,
      biography TEXT,
      short_bio TEXT,
      key_contributions TEXT,
      notable_quote TEXT,
      discoveries TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create nutrition_methods table
  await execute(db,
    `CREATE TABLE IF NOT EXISTS nutrition_methods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      invented_year INTEGER,
      inventor TEXT,
      how_it_works TEXT,
      limitations TEXT,
      accuracy TEXT,
      still_used INTEGER DEFAULT 1,
      modern_alternative TEXT,
      visual_type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create nutrition_standards table
  await execute(db,
    `CREATE TABLE IF NOT EXISTS nutrition_standards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      description TEXT NOT NULL,
      origin_year INTEGER,
      origin_story TEXT,
      organization TEXT,
      country TEXT,
      how_determined TEXT,
      limitations TEXT,
      changes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create nutrition_mysteries table
  await execute(db,
    `CREATE TABLE IF NOT EXISTS nutrition_mysteries (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      current_consensus TEXT,
      arguments TEXT,
      why_it_matters TEXT,
      latest_research TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create nutrition_user_progress table
  await execute(db,
    `CREATE TABLE IF NOT EXISTS nutrition_user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      section_id TEXT NOT NULL,
      section_type TEXT NOT NULL,
      completed_at TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create indexes
  await execute(db,
    `CREATE INDEX IF NOT EXISTS idx_discoveries_year ON nutrition_discoveries(year)`
  );

  await execute(db,
    `CREATE INDEX IF NOT EXISTS idx_discoveries_category ON nutrition_discoveries(category)`
  );

  await execute(db,
    `CREATE INDEX IF NOT EXISTS idx_pioneers_name ON nutrition_pioneers(name)`
  );

  await execute(db,
    `CREATE INDEX IF NOT EXISTS idx_progress_user ON nutrition_user_progress(user_id)`
  );

  console.log('Nutrition migrations completed successfully');
}

// Seed initial data
export async function seedNutritionData() {
  const db = getUniversalDb();

  // Check if data already exists
  const existing = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM nutrition_discoveries',
    args: [],
  });

  const row = existing.rows[0] as Record<string, unknown>;
  if (row && Number(row.count) > 0) {
    console.log('Nutrition data already seeded');
    return;
  }

  // Seed discoveries
  const discoveries = getDiscoveryData();
  for (const discovery of discoveries) {
    await execute(db,
      `INSERT INTO nutrition_discoveries
       (id, year, end_year, title, description, short_description, scientist_name, scientist_id, category, impact, primary_sources, related_discoveries)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        discovery.id,
        discovery.year,
        discovery.endYear || null,
        discovery.title,
        discovery.description,
        discovery.shortDescription,
        discovery.scientistName || null,
        discovery.scientistId || null,
        discovery.category,
        discovery.impact,
        JSON.stringify(discovery.primarySources),
        JSON.stringify(discovery.relatedDiscoveries || []),
      ]
    );
  }

  // Seed pioneers
  const pioneers = getPioneerData();
  for (const pioneer of pioneers) {
    await execute(db,
      `INSERT INTO nutrition_pioneers
       (id, name, birth_year, death_year, nationality, biography, short_bio, key_contributions, notable_quote, discoveries)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pioneer.id,
        pioneer.name,
        pioneer.birthYear || null,
        pioneer.deathYear || null,
        pioneer.nationality,
        pioneer.biography,
        pioneer.shortBio,
        JSON.stringify(pioneer.keyContributions),
        pioneer.notableQuote || null,
        JSON.stringify(pioneer.discoveries),
      ]
    );
  }

  // Seed standards
  const standards = getStandardsData();
  for (const standard of standards) {
    await execute(db,
      `INSERT INTO nutrition_standards
       (id, name, value, description, origin_year, origin_story, organization, country, how_determined, limitations, changes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        standard.id,
        standard.name,
        standard.value,
        standard.description,
        standard.originYear,
        standard.originStory,
        standard.organization,
        standard.country,
        standard.howDetermined,
        JSON.stringify(standard.limitations),
        JSON.stringify(standard.changes),
      ]
    );
  }

  // Seed mysteries
  const mysteries = getMysteriesData();
  for (const mystery of mysteries) {
    await execute(db,
      `INSERT INTO nutrition_mysteries
       (id, title, description, category, current_consensus, arguments, why_it_matters, latest_research)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mystery.id,
        mystery.title,
        mystery.description,
        mystery.category,
        mystery.currentConsensus || null,
        JSON.stringify(mystery.arguments),
        mystery.whyItMatters,
        mystery.latestResearch || null,
      ]
    );
  }

  console.log('Nutrition data seeded successfully');
}

// =============================================================================
// SEED DATA - Deep researched nutritional history
// =============================================================================

function getDiscoveryData() {
  return [
    // 1747 - Scurvy Trial
    {
      id: 'lind-scurvy-1747',
      year: 1747,
      title: 'First Controlled Clinical Trial: Scurvy',
      description: `James Lind, a Scottish naval surgeon, conducted what is considered the first controlled clinical trial in medical history aboard HMS Salisbury. Sailors had been dying of scurvy for centuries—a disease causing bleeding gums, weakness, and eventually death. Lind took 12 sailors with scurvy and divided them into 6 pairs, giving each pair a different treatment: cider, sulfuric acid, vinegar, seawater, oranges and lemons, or a purgative mixture. Within six days, the two sailors given citrus fruits were nearly recovered, while the others showed no improvement. Despite this clear result, it took another 42 years before the Royal Navy mandated citrus juice for all sailors. The active compound (vitamin C) wouldn't be identified for nearly 200 more years.`,
      shortDescription: 'James Lind proves citrus cures scurvy in the first clinical trial',
      scientistName: 'James Lind',
      scientistId: 'james-lind',
      category: 'vitamin' as const,
      impact: 'Established experimental method in medicine; eventually led to discovery of vitamin C and concept of "essential" nutrients',
      primarySources: [
        {
          title: 'A Treatise of the Scurvy',
          authors: ['James Lind'],
          year: 1753,
          type: 'book' as const,
          url: 'https://archive.org/details/treatiseofscurvy00lind',
        },
      ],
      relatedDiscoveries: ['vitamin-c-1932'],
    },
    // 1816 - Proteins Essential
    {
      id: 'magendie-protein-1816',
      year: 1816,
      title: 'Proteins Proven Essential for Life',
      description: `François Magendie, a French physiologist, conducted experiments that proved animals cannot survive on fats and carbohydrates alone—they require nitrogen-containing compounds. He fed dogs diets of pure sugar, olive oil, or butter, and all died within weeks. When he added foods containing nitrogen (what we now call protein), the dogs survived. This was groundbreaking because it established that food wasn't just fuel—specific components were essential for life. The term "protein" (from Greek "protos" meaning "first") was coined in 1838 by Jöns Jacob Berzelius to describe these nitrogen-containing substances, reflecting their primary importance.`,
      shortDescription: 'Magendie proves nitrogen-containing foods (proteins) are essential for survival',
      scientistName: 'François Magendie',
      scientistId: 'francois-magendie',
      category: 'macronutrient' as const,
      impact: 'Established concept of essential nutrients; led to identification of amino acids',
      primarySources: [
        {
          title: 'Mémoire sur les propriétés nutritives des substances qui ne contiennent pas d\'azote',
          authors: ['François Magendie'],
          year: 1816,
          publication: 'Annales de Chimie et de Physique',
          type: 'paper' as const,
        },
      ],
    },
    // 1840s - Liebig quantifies
    {
      id: 'liebig-nutrition-1840',
      year: 1840,
      endYear: 1847,
      title: 'Quantifying Nutrition: The Chemical Approach',
      description: `Justus von Liebig, a German chemist, revolutionized nutritional science by applying rigorous chemical analysis to food. He developed methods to measure the protein, fat, and carbohydrate content of foods and proposed that the nutritional value of food could be reduced to these three components. His 1842 book "Animal Chemistry" argued that proteins built the body while fats and carbohydrates provided energy. Liebig also invented beef extract (the precursor to bouillon cubes) and infant formula. While his reductionist approach was later shown to be incomplete (missing vitamins and minerals), it established the foundation for food composition analysis that nutrition labels still use today.`,
      shortDescription: 'Liebig develops chemical methods to analyze food composition',
      scientistName: 'Justus von Liebig',
      scientistId: 'justus-liebig',
      category: 'method' as const,
      impact: 'Created foundation for nutritional analysis; his protein/fat/carb framework still underlies nutrition labels',
      primarySources: [
        {
          title: 'Animal Chemistry, or Organic Chemistry in its Application to Physiology and Pathology',
          authors: ['Justus von Liebig'],
          year: 1842,
          type: 'book' as const,
        },
      ],
    },
    // 1890s - Atwater calorimetry
    {
      id: 'atwater-calorimetry-1896',
      year: 1896,
      title: 'The Atwater System: How We Measure Calories',
      description: `Wilbur Olin Atwater built the first human respiration calorimeter in the United States—a sealed chamber that could precisely measure heat production and oxygen consumption of a person inside. Through thousands of experiments, he determined the "Atwater factors": proteins and carbohydrates provide 4 calories per gram, fats provide 9 calories per gram. These numbers, still printed on every nutrition label today, were derived by burning food in a "bomb calorimeter" and adjusting for digestibility. Atwater also led the first comprehensive study of American eating habits and established the USDA's food composition database. His calorie calculations remain the international standard, even though modern research shows they can be off by 20-30% for some foods.`,
      shortDescription: 'Atwater creates the calorie measurement system still used on nutrition labels',
      scientistName: 'Wilbur Olin Atwater',
      scientistId: 'wilbur-atwater',
      category: 'method' as const,
      impact: 'Created the 4-4-9 calorie system used worldwide; established food composition databases',
      primarySources: [
        {
          title: 'Methods and Results of Investigations on the Chemistry and Economy of Food',
          authors: ['Wilbur O. Atwater'],
          year: 1895,
          publication: 'USDA Bulletin',
          type: 'government' as const,
        },
      ],
      relatedDiscoveries: ['liebig-nutrition-1840'],
    },
    // 1897 - Beriberi discovery
    {
      id: 'eijkman-beriberi-1897',
      year: 1897,
      title: 'Beriberi and the "Accessory Food Factors"',
      description: `Christiaan Eijkman, a Dutch physician working in the Dutch East Indies, made a crucial observation: chickens fed polished (white) rice developed symptoms identical to beriberi—a devastating disease causing nerve damage and heart failure that killed thousands. When fed unpolished (brown) rice, they recovered. Eijkman initially believed white rice contained a toxin that brown rice's outer layer neutralized. His colleague Gerrit Grijns correctly interpreted the findings: the rice bran contained an essential "protective substance." This substance—thiamine (vitamin B1)—wasn't isolated until 1926. Eijkman received the Nobel Prize in 1929 for this work, which established the concept that diseases could be caused by nutritional deficiencies, not just germs or toxins.`,
      shortDescription: 'Eijkman links beriberi to diet, revealing "accessory food factors"',
      scientistName: 'Christiaan Eijkman',
      scientistId: 'christiaan-eijkman',
      category: 'vitamin' as const,
      impact: 'Proved diseases could be caused by nutritional deficiency; led to vitamin concept',
      primarySources: [
        {
          title: 'Polyneuritis in Chickens',
          authors: ['Christiaan Eijkman'],
          year: 1897,
          publication: 'Geneeskundig Tijdschrift voor Nederlandsch-Indië',
          type: 'paper' as const,
        },
      ],
      relatedDiscoveries: ['funk-vitamins-1912'],
    },
    // 1912 - Vitamins coined
    {
      id: 'funk-vitamins-1912',
      year: 1912,
      title: 'The Word "Vitamin" is Born',
      description: `Polish biochemist Casimir Funk was trying to isolate the anti-beriberi factor from rice bran. He believed he had found an amine (a nitrogen-containing compound) that was vital for life. He combined "vital" and "amine" to coin "vitamine." Although his specific compound wasn't actually the right one (and many vitamins turned out not to be amines at all—the "e" was dropped later), the concept stuck. In his 1912 paper, Funk proposed that beriberi, scurvy, pellagra, and rickets were all caused by deficiencies of different "vitamines." This unified theory transformed nutrition science. Over the next 36 years, researchers would identify and synthesize all 13 vitamins we recognize today.`,
      shortDescription: 'Funk coins "vitamine" and proposes deficiency diseases',
      scientistName: 'Casimir Funk',
      scientistId: 'casimir-funk',
      category: 'theory' as const,
      impact: 'Created unifying theory of deficiency diseases; gave vitamins their name',
      primarySources: [
        {
          title: 'The Etiology of the Deficiency Diseases',
          authors: ['Casimir Funk'],
          year: 1912,
          publication: 'Journal of State Medicine',
          type: 'paper' as const,
        },
      ],
      relatedDiscoveries: ['eijkman-beriberi-1897', 'lind-scurvy-1747'],
    },
    // 1932 - Vitamin C isolated
    {
      id: 'vitamin-c-1932',
      year: 1932,
      title: 'Vitamin C Finally Isolated',
      description: `Nearly 200 years after Lind's scurvy trial, Albert Szent-Györgyi finally isolated the active compound. Working with Hungarian paprika peppers (one of the richest sources of the vitamin), he isolated a substance he called "hexuronic acid." Simultaneously, American researcher Charles Glen King proved this compound was the anti-scurvy factor. A naming dispute ensued, eventually resolved by adopting "ascorbic acid" (meaning "anti-scurvy acid"). Szent-Györgyi received the 1937 Nobel Prize for his work. Vitamin C was synthesized industrially by 1933, becoming the first vitamin produced artificially at scale—today over 110,000 tons are manufactured annually, mostly for food preservation and supplements.`,
      shortDescription: 'Szent-Györgyi isolates vitamin C after 200 years of searching',
      scientistName: 'Albert Szent-Györgyi',
      scientistId: 'albert-szent-gyorgyi',
      category: 'vitamin' as const,
      impact: 'Completed the 200-year scurvy mystery; enabled industrial vitamin production',
      primarySources: [
        {
          title: 'Observations on the Function of Peroxidase Systems and the Chemistry of the Adrenal Cortex',
          authors: ['Albert Szent-Györgyi'],
          year: 1931,
          publication: 'Biochemical Journal',
          type: 'paper' as const,
        },
      ],
      relatedDiscoveries: ['lind-scurvy-1747'],
    },
    // 1968 - First dietary guidelines
    {
      id: 'rda-first-1968',
      year: 1968,
      title: 'First Recommended Dietary Allowances Published',
      description: `The US National Research Council published the first comprehensive Recommended Dietary Allowances (RDAs), establishing specific numerical targets for essential nutrients. The RDAs were originally developed during World War II to ensure military rations were nutritionally adequate, but the 1968 edition was the first designed for the general public. The process involved reviewing all available research on each nutrient and setting values high enough to meet the needs of 97-98% of the population—deliberately overshooting to ensure safety margins. This "two standard deviations above average need" approach means RDAs are higher than what most individuals actually require, a nuance often lost in public health messaging.`,
      shortDescription: 'First comprehensive dietary recommendations for public use',
      scientistName: null,
      scientistId: null,
      category: 'guideline' as const,
      impact: 'Created framework for nutrition recommendations; basis for food labeling',
      primarySources: [
        {
          title: 'Recommended Dietary Allowances, 7th Edition',
          authors: ['National Research Council'],
          year: 1968,
          type: 'government' as const,
        },
      ],
    },
    // 1977 - McGovern Report
    {
      id: 'mcgovern-report-1977',
      year: 1977,
      title: 'The McGovern Report: Diet and Killer Diseases',
      description: `Senator George McGovern's Select Committee on Nutrition and Human Needs released "Dietary Goals for the United States"—the first government document telling Americans to eat less of certain foods. The report recommended reducing fat (especially saturated fat), cholesterol, sugar, and salt while increasing complex carbohydrates. It sparked immediate controversy: the meat, dairy, and egg industries protested vigorously, and some scientists argued the evidence was insufficient. The original language "reduce meat consumption" was changed to "choose lean meats" after industry pressure. Despite (or because of) the controversy, the report launched the low-fat era in American nutrition—an approach now being reevaluated as the evidence for vilifying dietary fat has weakened.`,
      shortDescription: 'McGovern Committee issues first dietary guidelines limiting foods',
      scientistName: null,
      scientistId: null,
      category: 'guideline' as const,
      impact: 'Launched low-fat diet era; established government role in dietary advice',
      primarySources: [
        {
          title: 'Dietary Goals for the United States',
          authors: ['Select Committee on Nutrition and Human Needs'],
          year: 1977,
          publication: 'U.S. Senate',
          type: 'government' as const,
        },
      ],
    },
    // 1990 - Nutrition labels
    {
      id: 'nlea-1990',
      year: 1990,
      title: 'Nutrition Labeling and Education Act',
      description: `After years of voluntary and inconsistent food labeling, the US Congress passed the Nutrition Labeling and Education Act (NLEA), requiring standardized nutrition information on nearly all packaged foods. The FDA spent four years developing the familiar "Nutrition Facts" panel that debuted in 1994. Key decisions made during development included: choosing 2,000 calories as the reference diet (a compromise between men's and women's average needs), requiring serving sizes to be standardized, and using % Daily Values to help consumers contextualize numbers. The 2,000 calorie figure was chosen partly because it was a round number that wouldn't encourage overeating—earlier proposals used 2,350 calories. The NLEA transformed how Americans think about food and established the label format now used worldwide.`,
      shortDescription: 'Congress mandates standardized nutrition labels, establishes 2000 calorie reference',
      scientistName: null,
      scientistId: null,
      category: 'guideline' as const,
      impact: 'Created modern nutrition labels; established 2000 calorie daily reference',
      primarySources: [
        {
          title: 'Nutrition Labeling and Education Act of 1990',
          authors: ['101st United States Congress'],
          year: 1990,
          type: 'government' as const,
          url: 'https://www.congress.gov/bill/101st-congress/house-bill/3562',
        },
      ],
    },
  ];
}

function getPioneerData() {
  return [
    {
      id: 'james-lind',
      name: 'James Lind',
      birthYear: 1716,
      deathYear: 1794,
      nationality: 'Scottish',
      biography: `James Lind was a Scottish physician who served as a naval surgeon in the Royal Navy. Witnessing the devastation of scurvy aboard ships (more sailors died of scurvy than combat in the 18th century), he designed and conducted what is considered the first controlled clinical trial in 1747. Despite proving that citrus fruits cured scurvy, it took 42 years for the Royal Navy to mandate their use—a delay that cost countless lives and highlights how slowly even clear evidence can change practice.`,
      shortBio: 'Naval surgeon who conducted the first clinical trial, proving citrus cures scurvy',
      keyContributions: [
        'Conducted first controlled clinical trial (1747)',
        'Proved citrus fruits cure scurvy',
        'Published "A Treatise of the Scurvy" (1753)',
      ],
      notableQuote: 'The cure is very quick and very easy... by two oranges and one lemon given every day.',
      discoveries: ['lind-scurvy-1747'],
    },
    {
      id: 'wilbur-atwater',
      name: 'Wilbur Olin Atwater',
      birthYear: 1844,
      deathYear: 1907,
      nationality: 'American',
      biography: `Wilbur Atwater was an American chemist who founded the science of human nutrition in America. He built the first human respiration calorimeter in the US, measured the caloric content of thousands of foods, and established the Atwater factors (4-4-9) still used on nutrition labels today. He led the first comprehensive study of American dietary habits and founded the USDA's food composition database. His work made nutrition a quantitative science.`,
      shortBio: 'Created the calorie measurement system used on every nutrition label',
      keyContributions: [
        'Established Atwater factors (4-4-9 calories per gram)',
        'Built first US human calorimeter',
        'Founded USDA food composition database',
        'Conducted first comprehensive US dietary survey',
      ],
      notableQuote: 'The body is a machine... and we can measure its economy.',
      discoveries: ['atwater-calorimetry-1896'],
    },
    {
      id: 'casimir-funk',
      name: 'Casimir Funk',
      birthYear: 1884,
      deathYear: 1967,
      nationality: 'Polish',
      biography: `Casimir Funk was a Polish biochemist who coined the term "vitamine" in 1912, later shortened to "vitamin." Working in London, he proposed that four diseases—beriberi, scurvy, pellagra, and rickets—were all caused by deficiencies of specific "vital amines." Though his specific chemical identification was incorrect, his unifying theory transformed nutrition science and gave researchers a framework for discovering all 13 vitamins over the following decades.`,
      shortBio: 'Coined "vitamin" and proposed the deficiency disease theory',
      keyContributions: [
        'Coined the term "vitamine" (1912)',
        'Proposed deficiency disease theory',
        'Attempted to isolate anti-beriberi factor',
        'Connected scurvy, beriberi, pellagra, and rickets',
      ],
      notableQuote: 'I suggest the term vitamine... to describe these accessory substances.',
      discoveries: ['funk-vitamins-1912'],
    },
    {
      id: 'christiaan-eijkman',
      name: 'Christiaan Eijkman',
      birthYear: 1858,
      deathYear: 1930,
      nationality: 'Dutch',
      biography: `Christiaan Eijkman was a Dutch physician who discovered that beriberi was caused by something missing in polished rice—the first proof that a disease could be caused by nutritional deficiency rather than germs. Working in the Dutch East Indies, he noticed chickens fed polished rice developed beriberi-like symptoms while those fed brown rice stayed healthy. His Nobel Prize-winning work (1929) established that food could contain essential substances beyond protein, fat, and carbohydrates.`,
      shortBio: 'Proved beriberi was caused by nutritional deficiency, not germs',
      keyContributions: [
        'Discovered diet-disease link for beriberi (1897)',
        'Proved deficiency diseases exist',
        'Nobel Prize in Physiology or Medicine (1929)',
      ],
      notableQuote: 'The gruesome disease had a dietary cause—not a germ.',
      discoveries: ['eijkman-beriberi-1897'],
    },
    {
      id: 'albert-szent-gyorgyi',
      name: 'Albert Szent-Györgyi',
      birthYear: 1893,
      deathYear: 1986,
      nationality: 'Hungarian',
      biography: `Albert Szent-Györgyi was a Hungarian biochemist who isolated vitamin C in 1932, solving the 200-year mystery of what cured scurvy. Using Hungarian paprika peppers as his source, he isolated what he first called "hexuronic acid." His work enabled industrial vitamin C production and earned him the 1937 Nobel Prize. He later made important discoveries in muscle physiology and became a prominent advocate for peace and science policy reform.`,
      shortBio: 'Isolated vitamin C after 200 years of searching',
      keyContributions: [
        'Isolated vitamin C / ascorbic acid (1932)',
        'Nobel Prize in Physiology or Medicine (1937)',
        'Discovered actin-myosin interaction in muscles',
      ],
      notableQuote: 'Discovery consists of seeing what everybody has seen and thinking what nobody has thought.',
      discoveries: ['vitamin-c-1932'],
    },
  ];
}

function getStandardsData() {
  return [
    {
      id: '2000-calorie-diet',
      name: 'The 2,000 Calorie Reference Diet',
      value: '2,000 calories per day',
      description: 'The daily calorie reference used on all US nutrition labels',
      originYear: 1993,
      originStory: `When the FDA was developing the Nutrition Facts label in the early 1990s, they needed a single daily calorie value to calculate % Daily Values. They analyzed data from USDA food consumption surveys and found women averaged about 1,600-1,800 calories and men about 2,200-2,500 calories. Several values were proposed: 2,000, 2,200, 2,300, and 2,350. The FDA ultimately chose 2,000 because: (1) it was a round, memorable number, (2) it was close to the recommendations for many groups, and (3) using a higher number might "encourage overconsumption." The decision was explicitly described as a "reference" rather than a recommendation—but this nuance was lost on most consumers who interpreted it as the "right" amount to eat.`,
      organization: 'FDA',
      country: 'United States',
      howDetermined: 'Compromise between men and women\'s average intake from USDA surveys; rounded for simplicity',
      limitations: [
        'Does not account for age, gender, activity level, or body size',
        'Often misinterpreted as a recommendation rather than a reference',
        'Based on 1990s consumption data, may not reflect current needs',
        'Sedentary adults may need fewer calories; active adults may need more',
      ],
      changes: [
        {
          year: 1993,
          previousValue: 'None',
          newValue: '2,000 calories',
          reason: 'NLEA implementation required single reference value',
        },
      ],
    },
    {
      id: 'three-meals-day',
      name: 'Three Meals a Day',
      value: 'Breakfast, lunch, and dinner',
      description: 'The culturally dominant eating pattern in Western societies',
      originYear: 1850,
      originStory: `Three meals a day is not a biological requirement—it's a cultural convention that emerged from industrialization. Before the Industrial Revolution, eating patterns varied widely: peasants might eat two meals, while aristocrats might eat four or five. The factory system demanded workers operate on fixed schedules, and the three-meal pattern emerged to synchronize eating with work shifts. Morning meal before work, midday meal during the break, evening meal after. The concept of "breakfast" being the most important meal was largely promoted in the early 20th century by companies selling breakfast foods (notably Kellogg's and General Foods). Modern research suggests meal timing may matter less than total intake and food quality—yet the three-meal norm persists.`,
      organization: 'Cultural convention',
      country: 'Western societies',
      howDetermined: 'Industrial work schedules; marketing; cultural habit',
      limitations: [
        'No biological requirement for exactly three meals',
        'Intermittent fasting research challenges the pattern',
        'Snacking has become a "fourth meal" for many',
        'Different cultures have different patterns',
      ],
      changes: [],
    },
    {
      id: 'rda-system',
      name: 'Recommended Dietary Allowances (RDAs)',
      value: 'Varies by nutrient',
      description: 'Official nutrient intake recommendations',
      originYear: 1941,
      originStory: `The RDA system was born from military necessity. During World War II, the US government needed to ensure soldiers received adequate nutrition. The National Research Council convened experts to establish the first RDAs in 1941. The methodology was conservative: determine the average requirement to prevent deficiency, then add a safety margin (two standard deviations) to cover 97-98% of the population. This means RDAs are higher than what most individuals actually need. The system was later expanded to include Adequate Intakes (AI) for nutrients without enough data for RDAs, and Tolerable Upper Intake Levels (UL) to prevent toxicity. In 1997, the system was reorganized as Dietary Reference Intakes (DRIs).`,
      organization: 'National Academies of Sciences',
      country: 'United States',
      howDetermined: 'Average requirement + 2 standard deviations to cover 97-98% of population',
      limitations: [
        'Based on preventing deficiency, not optimizing health',
        'Overshoots needs for most individuals',
        'Limited data for many nutrients',
        'Doesn\'t account for individual variation',
      ],
      changes: [
        {
          year: 1941,
          previousValue: 'None',
          newValue: 'First RDAs published',
          reason: 'World War II military nutrition needs',
        },
        {
          year: 1997,
          previousValue: 'RDAs only',
          newValue: 'DRI system (RDAs + AI + UL)',
          reason: 'More comprehensive approach including upper limits',
        },
      ],
    },
  ];
}

function getMysteriesData() {
  return [
    {
      id: 'saturated-fat-debate',
      title: 'The Saturated Fat Controversy',
      description: 'For 50 years, we were told saturated fat causes heart disease. Now the evidence is being reconsidered.',
      category: 'contested' as const,
      currentConsensus: 'Replacing saturated fat with unsaturated fat may reduce cardiovascular risk, but the relationship is more complex than originally thought',
      arguments: [
        {
          position: 'Saturated fat is harmful',
          evidence: 'Raises LDL cholesterol; early epidemiological studies linked it to heart disease',
          proponents: ['American Heart Association', 'Most national dietary guidelines'],
        },
        {
          position: 'Saturated fat is neutral or context-dependent',
          evidence: 'Recent meta-analyses show no significant link to mortality; effects depend on what replaces it',
          proponents: ['Some nutrition researchers', 'Low-carb diet advocates'],
        },
      ],
      whyItMatters: 'The low-fat diet recommendation influenced food policy for 40 years, leading to increased sugar consumption as fat was removed from products',
      latestResearch: '2020 Cochrane review found reducing saturated fat may slightly reduce cardiovascular events but not mortality',
    },
    {
      id: 'calorie-counting-accuracy',
      title: 'How Accurate Are Calorie Counts?',
      description: 'The numbers on nutrition labels can be off by 20% or more, and the body doesn\'t absorb all calories equally.',
      category: 'unknown' as const,
      currentConsensus: 'Calorie counts are estimates with significant margins of error',
      arguments: [
        {
          position: 'The Atwater system is good enough',
          evidence: 'Works reasonably well for mixed diets at population level',
          proponents: ['Food industry', 'Most regulatory agencies'],
        },
        {
          position: 'We need better methods',
          evidence: 'Food processing, cooking, gut bacteria, and individual variation all affect actual calories absorbed',
          proponents: ['Precision nutrition researchers', 'Microbiome scientists'],
        },
      ],
      whyItMatters: 'Calorie counting is the foundation of weight management advice, but if the numbers are unreliable, the advice may be too',
      latestResearch: 'Studies show almonds provide ~30% fewer calories than labels indicate due to incomplete digestion',
    },
    {
      id: 'microbiome-nutrition',
      title: 'The Microbiome Revolution',
      description: 'The bacteria in your gut may determine how you respond to different foods more than your genes do.',
      category: 'emerging' as const,
      currentConsensus: 'Gut microbiome significantly affects metabolism, but we don\'t yet know how to optimize it',
      arguments: [
        {
          position: 'Microbiome is the key to personalized nutrition',
          evidence: 'Studies show dramatic individual variation in blood sugar response to identical foods',
          proponents: ['Microbiome researchers', 'Personalized nutrition companies'],
        },
        {
          position: 'Too early for clinical applications',
          evidence: 'Interventions based on microbiome analysis haven\'t shown consistent benefits yet',
          proponents: ['Clinical nutrition researchers', 'Skeptics'],
        },
      ],
      whyItMatters: 'If nutrition is highly individual, universal dietary guidelines may be the wrong approach',
      latestResearch: '2020 PREDICT study showed microbiome composition predicted metabolic response better than genetics',
    },
    {
      id: 'replication-crisis',
      title: 'The Nutrition Replication Crisis',
      description: 'Many landmark nutrition studies have failed to replicate when repeated with better methodology.',
      category: 'contested' as const,
      currentConsensus: 'Nutrition research has significant methodological challenges',
      arguments: [
        {
          position: 'Much of what we "know" may be wrong',
          evidence: 'Many observational studies have been contradicted by randomized trials',
          proponents: ['Research methodology critics', 'Some nutrition scientists'],
        },
        {
          position: 'The evidence is better than critics claim',
          evidence: 'Some findings (e.g., trans fats are harmful) have been robustly confirmed',
          proponents: ['Public health researchers', 'Epidemiologists'],
        },
      ],
      whyItMatters: 'Trust in nutrition science is at an all-time low, making it harder to communicate genuine findings',
      latestResearch: 'John Ioannidis\'s 2018 analysis estimated that 80% of nutrition studies may be unreliable',
    },
  ];
}
