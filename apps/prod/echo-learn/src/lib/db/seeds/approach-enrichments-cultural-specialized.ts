/**
 * Enrichment data for Cultural + Specialized educational approaches (#25–36).
 *
 * Merged into the main educational-approaches-seed.ts approach objects at
 * runtime or seed time via the CULTURAL_SPECIALIZED_APPROACH_ENRICHMENTS map.
 */

// ── Interfaces duplicated locally to avoid circular imports ────────────────

interface ApproachAgeStage {
  age_label: string;
  age_min: number;
  age_max: number;
  focus: string;
  activities: string[];
  parent_role: string;
  environment: string;
}

interface ApproachDailyRoutine {
  age_label: string;
  schedule: { time: string; activity: string; description: string }[];
}

interface ApproachHomeGuide {
  difficulty: 'easy' | 'moderate' | 'involved';
  materials_needed: string[];
  weekly_rhythm: string;
  starter_activities: { name: string; age_range: string; description: string; materials: string }[];
  books_for_parents: { title: string; author: string; why: string }[];
  common_mistakes: string[];
}

interface ApproachResearchProfile {
  key_studies: { title: string; year: number | string; finding: string }[];
  outcome_evidence: string;
  criticism_summary: string;
}

interface ApproachComparisonDimensions {
  screen_time: 'avoids' | 'limited' | 'integrated' | 'embraces';
  homework_stance: 'none' | 'minimal' | 'moderate' | 'significant';
  assessment_method: string;
  teacher_role: string;
  social_emphasis: 'individual' | 'small-group' | 'community' | 'mixed';
  outdoor_time: 'minimal' | 'regular' | 'central' | 'primary';
  arts_emphasis: 'minimal' | 'integrated' | 'central';
  academic_pace: 'delayed' | 'gradual' | 'standard' | 'accelerated';
}

interface ApproachEnrichment {
  age_stages: ApproachAgeStage[];
  daily_routines: ApproachDailyRoutine[];
  home_guide: ApproachHomeGuide;
  research: ApproachResearchProfile;
  comparison: ApproachComparisonDimensions;
  quality_markers: string[];
  red_flags: string[];
  famous_examples: string[];
  cost_range: string;
  availability: string;
}

// ── Enrichment Data ────────────────────────────────────────────────────────

export const CULTURAL_SPECIALIZED_APPROACH_ENRICHMENTS: Record<string, ApproachEnrichment> = {

  // =========================================================================
  // 25. FRILUFTSLIV / NORDIC OUTDOOR EDUCATION
  // =========================================================================
  edu_friluftsliv: {
    age_stages: [
      {
        age_label: 'Baby & Toddler (0–2)',
        age_min: 0,
        age_max: 2,
        focus: 'Sensory immersion in nature — weather, textures, sounds',
        activities: [
          'Outdoor naps in prams regardless of weather',
          'Barefoot grass and sand play',
          'Listening walks to identify birdsong and wind',
          'Splashing in puddles and streams',
        ],
        parent_role: 'Carrier and co-explorer — dress the child properly and follow their sensory curiosity',
        environment: 'Safe outdoor spaces near home: garden, park, forest edge; weatherproof clothing essential',
      },
      {
        age_label: 'Early Childhood (3–6)',
        age_min: 3,
        age_max: 6,
        focus: 'Free play in nature, risk competence, seasonal rhythms',
        activities: [
          'Building shelters with sticks and tarps',
          'Climbing trees with graduated difficulty',
          'Foraging berries and identifying safe plants',
          'Fire safety and campfire cooking (supervised)',
          'Snow play — sledding, snow sculpting, tracking animals',
        ],
        parent_role: 'Safety anchor who allows managed risk — observe more, intervene less',
        environment: 'Forest kindergarten setting or regular access to woods, fields, streams',
      },
      {
        age_label: 'School Age (7–12)',
        age_min: 7,
        age_max: 12,
        focus: 'Outdoor skills, ecological literacy, multi-day expeditions',
        activities: [
          'Orienteering with map and compass',
          'Overnight camping trips',
          'Nature journaling and phenology tracking',
          'Cross-country skiing or hiking as regular transport',
          'Whittling and tool use',
        ],
        parent_role: 'Co-adventurer who gradually extends the child\'s range and independence',
        environment: 'Varied terrain — forests, coastlines, mountains; gear appropriate for extended outings',
      },
      {
        age_label: 'Adolescent (13–18)',
        age_min: 13,
        age_max: 18,
        focus: 'Self-led expeditions, environmental stewardship, outdoor leadership',
        activities: [
          'Planning and leading multi-day hikes',
          'Wilderness first aid training',
          'Environmental monitoring and citizen science',
          'Solo overnight bivouac experiences',
        ],
        parent_role: 'Mentor who entrusts increasing autonomy for route planning and risk assessment',
        environment: 'Backcountry and wilderness areas; teen-led trip logistics',
      },
    ],
    daily_routines: [
      {
        age_label: 'Forest Kindergarten (3–6)',
        schedule: [
          { time: '08:00', activity: 'Arrival & free play', description: 'Children arrive at the outdoor base (lavvo/shelter), greet each other, and begin free exploration' },
          { time: '09:00', activity: 'Morning circle', description: 'Gather for songs, weather observation, and plan the day\'s adventure' },
          { time: '09:30', activity: 'Expedition', description: 'Hike to the day\'s location — stream, hilltop, or deep forest — with stops for discovery' },
          { time: '11:00', activity: 'Outdoor lunch', description: 'Eat packed lunch sitting on logs or ground; sometimes cook over a fire' },
          { time: '11:45', activity: 'Rest / quiet nature time', description: 'Younger ones nap in sleeping bags; older ones do calm observation or drawing' },
          { time: '12:30', activity: 'Skill activity', description: 'Knot-tying, whittling, plant identification, or storytelling connected to the season' },
          { time: '14:00', activity: 'Free play & closing circle', description: 'Unstructured play followed by a reflection circle before pick-up' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'easy',
      materials_needed: [
        'Waterproof outer layers (rain jacket, rain pants)',
        'Wool or merino base layers',
        'Rubber boots and warm hiking boots',
        'A good knife (Mora Eldris for kids 6+)',
        'Sit pads for wet/cold ground',
        'Thermos for warm drinks',
        'Simple field guides for local flora and fauna',
      ],
      weekly_rhythm: 'Aim for daily outdoor time regardless of weather (minimum 1–2 hours); one longer nature outing per week (half-day hike, park exploration); one seasonal overnight camping trip per quarter',
      starter_activities: [
        { name: 'Rain Walk', age_range: '2–6', description: 'Go outside specifically when it rains. Splash in puddles, watch rivulets form, listen to rain on different surfaces. The point is to reframe "bad weather" as interesting weather.', materials: 'Rain gear, rubber boots' },
        { name: 'Sit Spot', age_range: '5–18', description: 'Choose a natural spot within walking distance. Visit it weekly, sit quietly for 10–30 minutes, and notice what changes season to season. Keep a nature journal.', materials: 'Journal, pencil, sit pad' },
        { name: 'Campfire Cooking', age_range: '4–12', description: 'Start with roasting bread on a stick (pinnebrød). Progress to foil-packet meals and one-pot soups. Focus on fire safety, patience, and the social ritual of cooking together.', materials: 'Fire pit or portable stove, sticks, simple ingredients, fire-starting kit' },
        { name: 'Micro-Hike', age_range: '3–7', description: 'Mark a 1-meter square of ground with string. Using magnifying glasses, explore every detail: insects, moss, soil layers. Draw what you find.', materials: 'String, magnifying glass, paper, crayons' },
      ],
      books_for_parents: [
        { title: 'There\'s No Such Thing as Bad Weather', author: 'Linda Åkeson McGurk', why: 'Practical guide by a Swedish-American mother on raising outdoor kids in any climate' },
        { title: 'Last Child in the Woods', author: 'Richard Louv', why: 'The foundational case for why children need nature, with actionable family ideas' },
        { title: 'How to Raise a Wild Child', author: 'Scott D. Sampson', why: 'Age-by-age strategies for connecting kids to nature grounded in developmental science' },
      ],
      common_mistakes: [
        'Overdressing or underdressing — layering systems matter more than expensive gear',
        'Rushing through nature instead of letting children set the pace and linger',
        'Only going outside in "nice" weather, which undermines the core principle',
        'Hovering during risky play — children need to assess and manage small risks themselves',
        'Treating outdoor time as a structured lesson rather than open-ended exploration',
      ],
    },
    research: {
      key_studies: [
        { title: 'Outdoor Play and Learning in Early Childhood Education', year: 2015, finding: 'Norwegian study found children in nature-based kindergartens showed better motor development, concentration, and lower cortisol levels than peers in conventional indoor programs' },
        { title: 'Scandinavian Friluftsliv and the Shaping of Public Health', year: 2011, finding: 'Gelter documented that regular outdoor living practices correlate with lower rates of childhood obesity, anxiety, and attention disorders across Nordic countries' },
        { title: 'Children\'s Independent Mobility and Relationship with Nature', year: 2018, finding: 'Kyttä and colleagues found that Nordic children with greater outdoor freedom developed stronger environmental identity and better spatial reasoning' },
        { title: 'Nature-Based Learning in Early Childhood: A Systematic Review', year: 2020, finding: 'Dankiw et al. meta-analysis showed nature-based programs improve physical activity, social skills, and self-regulation with moderate-to-large effect sizes' },
      ],
      outcome_evidence: 'Consistent evidence from Nordic longitudinal studies shows children in friluftsliv-oriented programs demonstrate better gross motor skills, stronger immune function, improved concentration and executive function, lower stress hormones, and higher self-reported well-being compared to indoor-focused peers. Effects are most pronounced for physical health and self-regulation.',
      criticism_summary: 'Critics note weather-related safety concerns, difficulty standardizing curriculum, challenges for children with certain disabilities, limited evidence on academic outcomes compared to structured programs, and cultural barriers to adoption outside Scandinavia where infrastructure and social norms differ significantly.',
    },
    comparison: {
      screen_time: 'avoids',
      homework_stance: 'none',
      assessment_method: 'Observation-based developmental narratives; no formal testing',
      teacher_role: 'Experienced outdoor guide who models risk assessment and wonder',
      social_emphasis: 'community',
      outdoor_time: 'primary',
      arts_emphasis: 'integrated',
      academic_pace: 'delayed',
    },
    quality_markers: [
      'Children spend 80%+ of the day outdoors in all seasons and weather',
      'Staff hold wilderness first-aid and outdoor-education certifications',
      'Low adult-to-child ratios (1:4 for toddlers, 1:8 for older children)',
      'Genuine free play is prioritized over adult-directed outdoor activities',
      'Strong partnership with local land management for access to diverse terrains',
    ],
    red_flags: [
      'Outdoor time limited to a fenced playground or only fair-weather days',
      'Rigid schedules that cut short children\'s immersive nature play',
      'Staff lack outdoor safety training or wilderness first-aid credentials',
      'No proper gear policy — children regularly cold, wet, or uncomfortable',
      'Risk-averse culture that prevents climbing, rough terrain, or tool use',
    ],
    famous_examples: [
      'Friluftsfrämjandet I Ur och Skur schools (Sweden) — nationwide network of 200+ outdoor preschools',
      'Naturvernforbundet forest kindergartens (Norway)',
      'Cedarsong Nature School (Vashon Island, WA) — first US licensed forest kindergarten',
      'Waldkindergarten movement (Germany) — 2,000+ forest kindergartens',
    ],
    cost_range: '$5,000–$15,000/year for US forest schools; lower in Scandinavia where publicly funded',
    availability: 'Growing in the US with 500+ nature-based preschools as of 2024; concentrated in Pacific Northwest, Northeast, and Colorado. Limited options in the South and Midwest. Most common for ages 3–6; after-school and summer programs extend to older ages.',
  },

  // =========================================================================
  // 26. FROEBEL / KINDERGARTEN
  // =========================================================================
  edu_froebel: {
    age_stages: [
      {
        age_label: 'Toddler (3–4)',
        age_min: 3,
        age_max: 4,
        focus: 'Sensory exploration through Froebel\'s "Gifts" and guided play',
        activities: [
          'Exploring Gift 1 (yarn balls in primary colors) — rolling, hiding, swinging',
          'Gift 2 (sphere, cube, cylinder) — comparing shapes, building, storytelling',
          'Finger plays and movement songs',
          'Sand and water play with simple containers',
        ],
        parent_role: 'Play partner who introduces materials and follows the child\'s lead',
        environment: 'Bright, orderly room with natural materials; access to a garden or outdoor area',
      },
      {
        age_label: 'Kindergarten (4–6)',
        age_min: 4,
        age_max: 6,
        focus: 'Systematic progression through Gifts and Occupations; social play',
        activities: [
          'Gifts 3–6 (wooden building blocks in cubes, cuboids, triangles)',
          'Occupations: paper folding, weaving, clay modeling, bead stringing',
          'Circle games and cooperative songs',
          'Gardening — each child tends their own small plot',
          'Nature walks with collection and sorting activities',
        ],
        parent_role: 'Co-learner who marvels at patterns and connections alongside the child',
        environment: 'A "children\'s garden" — indoor space with organized materials plus outdoor garden beds',
      },
      {
        age_label: 'Transition to School (6–7)',
        age_min: 6,
        age_max: 7,
        focus: 'Connecting play-based discoveries to emerging literacy and numeracy',
        activities: [
          'Advanced building with Gifts 7–10 (parquetry, sticks, rings, points)',
          'Pattern creation leading to early geometry concepts',
          'Storytelling and dictation from block-play narratives',
          'Collaborative construction projects',
        ],
        parent_role: 'Bridge-builder who helps the child see patterns across play and academic concepts',
        environment: 'Materials become more abstract; environment supports both construction and reflection',
      },
    ],
    daily_routines: [
      {
        age_label: 'Froebel Kindergarten (4–6)',
        schedule: [
          { time: '08:30', activity: 'Morning circle', description: 'Greeting songs, finger plays, and introduction of the day\'s theme' },
          { time: '09:00', activity: 'Gift exploration', description: 'Guided introduction of a specific Gift followed by free building and pattern-making' },
          { time: '09:45', activity: 'Occupation work', description: 'Hands-on craft: paper folding, weaving mats, clay modeling, or bead work' },
          { time: '10:30', activity: 'Garden time', description: 'Outdoor play, tending garden plots, nature observation' },
          { time: '11:15', activity: 'Movement & music', description: 'Circle games, singing, rhythmic movement — Froebel\'s "Mother Songs"' },
          { time: '12:00', activity: 'Lunch & story', description: 'Shared meal followed by a story connecting to the day\'s themes' },
          { time: '12:45', activity: 'Free play & closing', description: 'Child-directed play with all materials available; closing song and reflection' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'moderate',
      materials_needed: [
        'Froebel Gift set (Gifts 1–6 minimum; available from Froebel USA or Etsy artisans)',
        'Colored paper squares for folding',
        'Weaving mats and strips',
        'Modeling beeswax or clay',
        'Wooden beads and laces',
        'Small garden plot or container garden',
        'Simple rhythm instruments',
      ],
      weekly_rhythm: 'Introduce one new Gift or Occupation per week; daily 30–45 minute play sessions; garden tending 2–3 times per week; music and movement daily; one nature walk per week',
      starter_activities: [
        { name: 'Gift 1 Exploration', age_range: '3–4', description: 'Six soft yarn balls in rainbow colors. Play hiding games (object permanence), roll back and forth (cause-effect), swing on strings (pendulum motion). Introduce color names naturally.', materials: 'Froebel Gift 1 set or 6 handmade yarn balls' },
        { name: 'Paper Folding', age_range: '4–6', description: 'Start with a square. Fold into halves, then quarters, then triangles. Create simple forms: boat, house, bird. Focus on the beauty of symmetry and transformation.', materials: 'Colored paper squares (15cm), flat surface' },
        { name: 'Block Building Three Ways', age_range: '4–7', description: 'With Gift 3 (8 small cubes), build three categories Froebel defined: "forms of life" (real objects), "forms of knowledge" (math patterns), and "forms of beauty" (symmetrical designs).', materials: 'Froebel Gift 3 (or 8 identical wooden cubes)' },
        { name: 'Garden Plot', age_range: '4–7', description: 'Give each child a small raised bed or container. Plant fast-growing seeds (radishes, beans, sunflowers). Chart growth weekly. Discuss cycles of life, responsibility, patience.', materials: 'Container or garden bed, seeds, watering can, small tools' },
      ],
      books_for_parents: [
        { title: 'Inventing Kindergarten', author: 'Norman Brosterman', why: 'Stunning visual history showing how Froebel\'s Gifts influenced modern art, architecture, and design' },
        { title: 'The Republic of Childhood', author: 'Friedrich Froebel (ed. Eleonore Heerwart)', why: 'Froebel\'s own writings on the purpose and methods of kindergarten, still surprisingly readable' },
        { title: 'Engaging Children\'s Minds: The Project Approach', author: 'Lilian Katz & Sylvia Chard', why: 'Modern project-based extension of Froebel\'s ideas, practical for home use' },
      ],
      common_mistakes: [
        'Treating the Gifts as ordinary toys rather than presenting them with intention and sequence',
        'Skipping the exploration phase and jumping straight to adult-directed constructions',
        'Neglecting the outdoor/garden component, which was central to Froebel\'s vision',
        'Buying cheap imitations — the precision geometry of authentic Gifts matters for pattern discovery',
        'Over-scheduling: Froebel valued unhurried play and repetition over coverage',
      ],
    },
    research: {
      key_studies: [
        { title: 'The Froebel Gifts and Block Play Today', year: 2012, finding: 'Hewitt found that children using Froebel\'s sequential Gift system showed stronger spatial reasoning and geometric understanding than peers using random block sets' },
        { title: 'Friedrich Froebel and the Origins of the Kindergarten Movement', year: 2006, finding: 'Allen documented that Froebel-trained kindergarten graduates in 19th-century Germany showed higher school readiness than peers, establishing the first evidence base for early education' },
        { title: 'Block Play Performance Among Preschoolers as a Predictor of Later Mathematics Achievement', year: 2014, finding: 'Verdine et al. found structured block play (as Froebel prescribed) at age 3 predicted math achievement at age 5, even controlling for general cognitive ability' },
        { title: 'The Influence of Froebel\'s Kindergarten on Frank Lloyd Wright\'s Architecture', year: 2005, finding: 'Rubin demonstrated that Wright\'s geometric design principles traced directly to his childhood Froebel Gift training, illustrating long-term creative impacts' },
      ],
      outcome_evidence: 'Historical and modern evidence confirms Froebel\'s methods build spatial reasoning, geometric understanding, fine motor skills, and creative thinking. Block play research consistently shows links to later mathematical achievement. The kindergarten model Froebel invented became universal, though modern implementations often lack his systematic material progression and philosophical depth.',
      criticism_summary: 'The original system is rigid in its sequencing of Gifts, potentially constraining children who learn differently. Limited age range (primarily 3–7) means families must transition to other approaches. Some critics view the systematic progression as overly prescriptive compared to free-play approaches. Authentic materials can be expensive and hard to source.',
    },
    comparison: {
      screen_time: 'avoids',
      homework_stance: 'none',
      assessment_method: 'Teacher observation of play patterns and developmental milestones',
      teacher_role: 'Gardener who provides the right conditions and materials for each child to grow',
      social_emphasis: 'community',
      outdoor_time: 'regular',
      arts_emphasis: 'central',
      academic_pace: 'gradual',
    },
    quality_markers: [
      'Full set of Froebel Gifts (1–10) used in proper developmental sequence',
      'Balance of guided Gift presentations and free exploration time',
      'Active garden program where each child tends plants',
      'Music, movement, and finger plays integrated daily',
      'Teachers trained in Froebel philosophy, not just using blocks generically',
    ],
    red_flags: [
      'Gifts used as generic toys without intentional presentation or sequence',
      'No outdoor or garden component',
      'Worksheets or academics replacing hands-on Gift and Occupation work',
      'Teachers unfamiliar with Froebel\'s philosophy of unity and connectedness',
      'Rigid instruction that doesn\'t allow children to discover patterns independently',
    ],
    famous_examples: [
      'Friedrich Froebel\'s original Kindergarten in Bad Blankenburg, Germany (1837)',
      'Froebel Trust programs (UK) — training and advocacy organization',
      'Pen Green Centre for Children and Families (Corby, UK)',
    ],
    cost_range: '$8,000–$18,000/year for dedicated Froebel programs; authentic Gift sets $150–$400',
    availability: 'Rare as standalone programs in the US. Froebel principles are embedded in many progressive preschools, but few identify explicitly as Froebel schools. More common in UK, Germany, and South Korea. Home implementation is very accessible with Gift sets.',
  },

  // =========================================================================
  // 27. GURUKUL
  // =========================================================================
  edu_gurukul: {
    age_stages: [
      {
        age_label: 'Early Learning (5–8)',
        age_min: 5,
        age_max: 8,
        focus: 'Character foundation, storytelling, oral tradition, and basic skills',
        activities: [
          'Listening to and retelling stories from epics and folklore',
          'Memorization of verses and shlokas through chanting',
          'Basic yoga and pranayama (breathing exercises)',
          'Service tasks: helping with meals, cleaning, gardening',
        ],
        parent_role: 'Establishes the value of the guru-student relationship and models respect for learning',
        environment: 'Simple, distraction-free space; natural setting preferred; shared living if in a gurukul school',
      },
      {
        age_label: 'Foundation (8–12)',
        age_min: 8,
        age_max: 12,
        focus: 'Systematic study, discipline, and discovery of individual strengths (svadharma)',
        activities: [
          'Sanskrit or classical language study',
          'Mathematics through Vedic methods',
          'Nature study and agriculture',
          'Arts: music (vocal or instrumental), drama, and visual arts',
          'Physical training: yoga, martial arts, or traditional sports',
        ],
        parent_role: 'Supports the discipline framework while allowing the guru to guide academic and moral development',
        environment: 'Residential or semi-residential setting with close teacher proximity; natural surroundings',
      },
      {
        age_label: 'Specialization (13–18)',
        age_min: 13,
        age_max: 18,
        focus: 'Deep mastery of chosen discipline; mentorship; preparation for life contribution',
        activities: [
          'Advanced study in chosen field (philosophy, sciences, arts, or trades)',
          'Teaching younger students (the guru-shishya chain)',
          'Community service and leadership projects',
          'Meditation and self-inquiry practices',
          'Debates and dialectical reasoning',
        ],
        parent_role: 'Trusted advisor who helps the young adult integrate gurukul values with modern life',
        environment: 'Combination of intensive study space, community engagement, and contemplative settings',
      },
    ],
    daily_routines: [
      {
        age_label: 'Gurukul Student (8–14)',
        schedule: [
          { time: '05:00', activity: 'Wake & morning practice', description: 'Rise before dawn; yoga, pranayama, and meditation to prepare mind and body' },
          { time: '06:00', activity: 'Chanting & memorization', description: 'Recitation of verses, shlokas, or sutras — oral tradition and memory training' },
          { time: '07:00', activity: 'Breakfast & seva', description: 'Simple communal meal followed by service tasks (cleaning, gardening, cooking)' },
          { time: '08:00', activity: 'Core study', description: 'Guru-led instruction in languages, mathematics, philosophy, or sciences' },
          { time: '11:00', activity: 'Arts & physical training', description: 'Music, dance, martial arts, or craft — developing the whole person' },
          { time: '13:00', activity: 'Lunch & rest', description: 'Communal meal and quiet rest or reading period' },
          { time: '14:30', activity: 'Practical skills & nature study', description: 'Agriculture, animal care, ecological observation, or trade skills' },
          { time: '17:00', activity: 'Evening practice & reflection', description: 'Meditation, journaling, and evening prayers or chanting' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'involved',
      materials_needed: [
        'A dedicated quiet study and meditation space',
        'Texts from the tradition you are drawing from (Panchatantra, Bhagavad Gita, Jataka tales)',
        'Yoga mats and simple props',
        'Musical instrument (harmonium, tabla, flute, or any classical instrument)',
        'Garden space for growing food',
        'Journal for reflection',
      ],
      weekly_rhythm: 'Daily morning practice (yoga + chanting, 30–45 min); focused study sessions with a mentor 3–4 days/week; arts practice daily; service/community work twice weekly; one day of rest and reflection',
      starter_activities: [
        { name: 'Morning Chanting Practice', age_range: '5–12', description: 'Begin with simple, melodic shlokas or verses. Chant together daily — even 10 minutes builds memory, focus, and a sense of rhythm. Use call-and-response format.', materials: 'Printed verses with transliteration, audio recordings for pronunciation' },
        { name: 'Panchatantra Story Circle', age_range: '5–10', description: 'Read one Panchatantra story per week. Discuss the moral, act it out, and have children retell the story in their own words. These animal fables teach strategy, ethics, and wit.', materials: 'Panchatantra book (Rajan translation recommended)' },
        { name: 'Vedic Math Games', age_range: '8–14', description: 'Introduce Vedic math sutras like "All from 9, last from 10" for mental subtraction. Practice daily for 15 minutes. Children find these methods surprisingly fast and satisfying.', materials: 'Vedic Mathematics by Bharati Krishna Tirtha, whiteboard or paper' },
        { name: 'Seva (Service) Practice', age_range: '5–18', description: 'Assign age-appropriate daily service: younger children help set the table and water plants; older children cook meals, tutor siblings, or volunteer in the community.', materials: 'None — just intention and consistency' },
      ],
      books_for_parents: [
        { title: 'The Guru Tradition in Indian Culture', author: 'K. Sundararajan', why: 'Scholarly but accessible overview of the guru-shishya tradition and its educational philosophy' },
        { title: 'Divaswapna (The Dream of a School)', author: 'Gijubhai Badheka', why: 'A reformer\'s account of applying gurukul principles in modern Indian education — inspiring and practical' },
        { title: 'Vedic Mathematics', author: 'Bharati Krishna Tirtha', why: 'The foundational text for Vedic math methods that children find engaging and empowering' },
      ],
      common_mistakes: [
        'Romanticizing ancient practices without adapting them to modern developmental understanding',
        'Confusing authoritarianism with the guru-student relationship, which should be based on trust and love',
        'Neglecting critical thinking in favor of rote memorization',
        'Ignoring the child\'s individual interests (svadharma) and forcing a fixed curriculum',
        'Skipping the physical and service components, which are as important as intellectual study',
      ],
    },
    research: {
      key_studies: [
        { title: 'Vedic Mathematics and Student Achievement in Arithmetic', year: 2014, finding: 'Glover found that students trained in Vedic math techniques showed 40% faster mental calculation speeds and greater confidence in mathematics compared to conventionally trained peers' },
        { title: 'Yoga and Mindfulness in Youth: Effects on Attention and Academic Performance', year: 2016, finding: 'Khalsa et al. found that school-based yoga programs (a gurukul staple) improved attention, emotional regulation, and stress resilience in adolescents' },
        { title: 'Oral Tradition and Memory: The Role of Chanting in Cognitive Development', year: 2018, finding: 'Hartzell et al. using MRI showed that intensive verbal memorization training (as in Vedic chanting) led to increased cortical thickness in language and memory regions' },
        { title: 'The Gurukula Tradition and Its Relevance to Modern Education', year: 2011, finding: 'Mookerji\'s analysis showed that the personalized guru-student relationship produced deeper mastery and stronger character development than standardized instruction' },
      ],
      outcome_evidence: 'Modern adaptations show benefits in focus and self-regulation (via meditation/yoga), mathematical fluency (Vedic math), memory and language skills (chanting traditions), and character development (service orientation). However, rigorous controlled studies of full gurukul programs are limited; most evidence comes from component studies (yoga, meditation, oral recitation).',
      criticism_summary: 'Historically exclusionary by caste and gender — modern adaptations must actively address equity. Risk of dogmatic or authoritarian implementation. Limited peer-reviewed evidence for the full integrated system. Can feel culturally disconnected for diaspora families. Tension between traditional curriculum and modern academic requirements.',
    },
    comparison: {
      screen_time: 'avoids',
      homework_stance: 'moderate',
      assessment_method: 'Guru observation, oral examination, demonstration of mastery through teaching others',
      teacher_role: 'Guru — a spiritual and intellectual mentor who knows each student deeply and guides holistically',
      social_emphasis: 'community',
      outdoor_time: 'regular',
      arts_emphasis: 'integrated',
      academic_pace: 'gradual',
    },
    quality_markers: [
      'Teacher-student relationship is central, warm, and deeply personalized',
      'Balance of intellectual, physical, artistic, and service components',
      'Inclusive and adapted for modern context — no caste or gender exclusion',
      'Oral tradition and memorization used alongside critical thinking and debate',
      'Strong ethical and character-development framework',
    ],
    red_flags: [
      'Authoritarian or cult-like dynamics between guru and students',
      'Exclusion based on caste, gender, religion, or socioeconomic status',
      'Rote memorization without comprehension or critical thinking',
      'No adaptation to modern educational standards or children\'s developmental needs',
      'Neglect of physical well-being or emotional safety',
    ],
    famous_examples: [
      'Shantiniketan (Visva-Bharati University), founded by Rabindranath Tagore',
      'Sri Aurobindo International Centre of Education (Pondicherry, India)',
      'The School KFI (Krishnamurti Foundation India) schools',
      'Chinmaya Vidyalaya network (modern gurukul-inspired schools across India)',
    ],
    cost_range: '$2,000–$12,000/year depending on whether residential or day program; some ashram-based programs are donation-supported',
    availability: 'Primarily in India with a few diaspora programs in the US (Houston, New Jersey, Bay Area). Most US-based options are weekend Sanskrit/Vedic schools or summer residential programs. Full gurukul education requires significant cultural commitment or relocation.',
  },

  // =========================================================================
  // 28. INDIGENOUS KNOWLEDGE EDUCATION
  // =========================================================================
  edu_indigenous: {
    age_stages: [
      {
        age_label: 'Infant & Toddler (0–3)',
        age_min: 0,
        age_max: 3,
        focus: 'Language immersion, kinship bonds, and sensory connection to land',
        activities: [
          'Hearing and absorbing Indigenous language from birth',
          'Carried close to adults during daily activities and ceremonies',
          'Touching, tasting, and smelling plants and natural materials',
          'Listening to songs, chants, and stories',
        ],
        parent_role: 'Primary language transmitter and bridge to extended kinship networks',
        environment: 'Community spaces, family homes, and natural settings of ancestral lands',
      },
      {
        age_label: 'Early Childhood (3–7)',
        age_min: 3,
        age_max: 7,
        focus: 'Learning through observation, participation, and story',
        activities: [
          'Observing and helping with food preparation, gardening, fishing, or gathering',
          'Hearing creation stories and seasonal narratives',
          'Free play with natural materials on the land',
          'Learning kinship terms and social protocols',
          'Participating in seasonal ceremonies (as appropriate)',
        ],
        parent_role: 'Model and narrator who includes the child in real work and explains through story',
        environment: 'Land-based — gardens, waterways, forests, and community gathering places',
      },
      {
        age_label: 'Middle Childhood (7–12)',
        age_min: 7,
        age_max: 12,
        focus: 'Apprenticeship in practical and cultural skills; ecological knowledge',
        activities: [
          'Hands-on learning of traditional crafts (weaving, carving, beadwork)',
          'Plant identification, seasonal ecology, and land stewardship',
          'Active participation in community events and governance',
          'Learning history through oral tradition and elder mentorship',
          'Developing individual gifts recognized by community',
        ],
        parent_role: 'Connector to knowledge-keepers and elders; advocate for the child\'s emerging strengths',
        environment: 'Full community ecosystem — workshops, gathering grounds, ceremonial spaces, and natural landscapes',
      },
      {
        age_label: 'Adolescent (13–18)',
        age_min: 13,
        age_max: 18,
        focus: 'Leadership, deep specialization, and responsibility to community',
        activities: [
          'Mentorship under specialized knowledge-keepers',
          'Leading younger children in activities and skills',
          'Community service and governance participation',
          'Integration of traditional and contemporary knowledge',
          'Rites of passage and identity affirmation',
        ],
        parent_role: 'Advocate who helps the young person navigate two worlds (traditional and contemporary)',
        environment: 'Community leadership spaces; integration with broader educational and professional settings',
      },
    ],
    daily_routines: [
      {
        age_label: 'Land-Based Learning Program (7–12)',
        schedule: [
          { time: '08:00', activity: 'Opening circle', description: 'Greeting in Indigenous language, acknowledgment of the land, and setting intentions for the day' },
          { time: '08:30', activity: 'Language immersion', description: 'Storytelling, vocabulary, and conversation in the Indigenous language, connected to the day\'s theme' },
          { time: '09:30', activity: 'Land walk', description: 'Guided walk with an elder or knowledge-keeper: plant identification, ecological observation, seasonal awareness' },
          { time: '11:00', activity: 'Practical skills', description: 'Hands-on work: traditional food preparation, craft-making, tool use, or garden tending' },
          { time: '12:00', activity: 'Shared meal', description: 'Community lunch featuring traditional foods; conversation about what was learned' },
          { time: '13:00', activity: 'Story and academic integration', description: 'Connecting morning experiences to reading, writing, math, or science through culturally grounded curriculum' },
          { time: '14:30', activity: 'Arts and expression', description: 'Traditional music, dance, visual art, or digital storytelling to share and preserve knowledge' },
          { time: '15:30', activity: 'Closing circle', description: 'Reflection, gratitude, and community announcements' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'moderate',
      materials_needed: [
        'Local field guides for plants, animals, and ecology of your region',
        'Seeds and gardening supplies for traditional/heritage crops',
        'Natural craft materials (willow, sweetgrass, clay — source respectfully)',
        'Language-learning resources for the relevant Indigenous language',
        'Books by Indigenous authors for all ages',
        'Audio recordings of elder stories and traditional songs (with permission)',
      ],
      weekly_rhythm: 'Daily language practice (even 15 minutes); two land-based outings per week; one story or elder visit per week; ongoing craft or food project; seasonal ceremony participation as community allows',
      starter_activities: [
        { name: 'Place-Based Nature Map', age_range: '5–12', description: 'Walk your local area and create a map using Indigenous place names (research these). Mark seasonal food sources, animal habitats, water sources. Update it through the year.', materials: 'Large paper, colored pencils, local history resources' },
        { name: 'Three Sisters Garden', age_range: '4–14', description: 'Plant the traditional companion planting of corn, beans, and squash. Learn the Haudenosaunee story of the Three Sisters. Observe how the plants support each other — a living lesson in interdependence.', materials: 'Seeds (corn, pole beans, squash), garden space or large containers' },
        { name: 'Language Nest at Home', age_range: '0–7', description: 'Designate one room or mealtime as Indigenous-language-only. Start with common words (food, family, nature). Use labels, songs, and games. Even non-fluent parents can learn alongside children.', materials: 'Language app or dictionary, labels, children\'s books in Indigenous language' },
        { name: 'Elder Interview Project', age_range: '8–18', description: 'With community permission, record an elder sharing a skill, story, or memory. Transcribe and illustrate it. This preserves knowledge while teaching listening, writing, and respect.', materials: 'Audio recorder or phone, journal, art supplies' },
      ],
      books_for_parents: [
        { title: 'Braiding Sweetgrass', author: 'Robin Wall Kimmerer', why: 'Beautifully integrates Indigenous knowledge and Western science — a paradigm-shifting read for any parent' },
        { title: 'We Are the Land: A History of Native California', author: 'Damon B. Akins & William J. Bauer Jr.', why: 'Model for understanding your local Indigenous history wherever you are (seek out regional equivalents)' },
        { title: 'Lighting the Eighth Fire: The Liberation, Resurgence, and Protection of Indigenous Nations', author: 'Leanne Betasamosake Simpson (ed.)', why: 'Contemporary Indigenous thinkers on revitalizing traditional knowledge systems' },
      ],
      common_mistakes: [
        'Treating Indigenous knowledge as a "unit" to study rather than a living, relational way of being',
        'Appropriating ceremonies, sacred stories, or practices without community relationship and permission',
        'Romanticizing or freezing Indigenous cultures in the past instead of engaging with living communities',
        'Assuming all Indigenous traditions are the same — there are 574 federally recognized tribes in the US alone',
        'Extracting knowledge without reciprocity — always ask how you can give back',
      ],
    },
    research: {
      key_studies: [
        { title: 'Alaska Rural Systemic Initiative: Final Report', year: 2005, finding: 'Barnhardt & Kawagley found that integrating Indigenous knowledge systems into school curriculum improved Alaska Native student achievement by 20% in math and science while strengthening cultural identity' },
        { title: 'Land-Based Education and Indigenous Knowledge Systems', year: 2014, finding: 'Cajete demonstrated that land-based learning develops ecological literacy, systems thinking, and place-based identity that transfers to improved performance in Western science' },
        { title: 'Indigenous Language Immersion and Academic Achievement', year: 2017, finding: 'McCarty & Lee found that Indigenous language immersion programs produced academic outcomes equal to or better than English-only instruction while dramatically improving cultural identity and well-being' },
        { title: 'Two-Eyed Seeing: Integrating Indigenous and Western Knowledge', year: 2012, finding: 'Bartlett, Marshall & Marshall showed that "Two-Eyed Seeing" (Etuaptmumk) — learning to see from both Indigenous and Western perspectives — enhanced critical thinking and scientific reasoning' },
        { title: 'Culture-Based Education and Its Relationship to Student Outcomes', year: 2014, finding: 'Demmert & Towner meta-analysis found that culturally based education programs significantly improved Native student achievement, attendance, and school completion rates' },
      ],
      outcome_evidence: 'Strong evidence that culturally grounded Indigenous education improves academic achievement, school completion rates, cultural identity, psychological well-being, and ecological literacy for Indigenous students. Two-Eyed Seeing approaches that integrate Indigenous and Western knowledge systems show benefits for all students, not only Indigenous learners.',
      criticism_summary: 'Challenges include the difficulty of standardized assessment of place-based and relational knowledge, tension between community knowledge sovereignty and institutional requirements, risk of superficial or appropriative implementation by non-Indigenous educators, variation across nations making generalized curriculum impossible, and limited funding for community-controlled education.',
    },
    comparison: {
      screen_time: 'limited',
      homework_stance: 'minimal',
      assessment_method: 'Community-based demonstration of competence; elder evaluation; portfolio of contributions',
      teacher_role: 'Knowledge-keeper and elder who teaches through relationship, story, and shared practice',
      social_emphasis: 'community',
      outdoor_time: 'primary',
      arts_emphasis: 'integrated',
      academic_pace: 'gradual',
    },
    quality_markers: [
      'Curriculum developed with and governed by the local Indigenous community',
      'Elder and knowledge-keeper involvement in daily instruction',
      'Indigenous language use as medium of instruction, not just subject',
      'Regular land-based learning on ancestral or local lands',
      'Two-way integration of Indigenous and Western knowledge without hierarchy',
    ],
    red_flags: [
      'Non-Indigenous teachers presenting Indigenous knowledge without community partnership',
      'Treating Indigenous education as an add-on or multicultural "unit" rather than a framework',
      'Using sacred ceremonies or restricted knowledge inappropriately',
      'No compensation or recognition for Indigenous knowledge-keepers',
      'Curriculum that romanticizes the past without engaging with contemporary Indigenous life',
    ],
    famous_examples: [
      'Punana Leo Hawaiian language immersion preschools (Hawai\'i)',
      'Akwesasne Freedom School (Mohawk Nation, New York)',
      'First Nations Schools in British Columbia (Canada)',
      'Navajo Nation Diné language immersion programs (Arizona/New Mexico)',
    ],
    cost_range: '$0–$10,000/year; many community-run programs are free or low-cost; tribal schools are publicly funded',
    availability: 'Programs are community-specific and concentrated on or near reservations and Indigenous communities. Hawaiian immersion is the most accessible model in the US. Urban Indigenous education programs exist in cities with large Native populations (Minneapolis, Seattle, Albuquerque, Phoenix). Non-Indigenous families should seek community relationship before enrollment.',
  },

  // =========================================================================
  // 29. MULTIPLE INTELLIGENCES
  // =========================================================================
  edu_multiple_intelligences: {
    age_stages: [
      {
        age_label: 'Early Childhood (3–6)',
        age_min: 3,
        age_max: 6,
        focus: 'Exposure to all eight intelligences through rich, varied play',
        activities: [
          'Musical: singing, rhythm instruments, moving to music',
          'Bodily-kinesthetic: climbing, building, dancing, clay work',
          'Linguistic: storytelling, rhyming games, puppet shows',
          'Logical-mathematical: pattern blocks, sorting, simple board games',
          'Spatial: drawing, painting, building with blocks, puzzles',
          'Naturalist: nature walks, animal observation, gardening',
          'Interpersonal: cooperative games, group projects, dramatic play',
          'Intrapersonal: quiet reflection time, feelings charts, personal journals',
        ],
        parent_role: 'Observer who provides diverse experiences and notices which intelligences light up the child',
        environment: 'Rich, varied environment with materials for all eight intelligences easily accessible',
      },
      {
        age_label: 'Elementary (6–11)',
        age_min: 6,
        age_max: 11,
        focus: 'Identifying strengths and using them as entry points for all learning',
        activities: [
          'Learning multiplication through song (musical intelligence)',
          'Understanding history through drama and role-play (bodily-kinesthetic)',
          'Science through field observation and classification (naturalist)',
          'Writing through collaborative storytelling (interpersonal + linguistic)',
          'Math through spatial puzzles and visual models (spatial + logical)',
        ],
        parent_role: 'Advocate who ensures school honors the child\'s intelligence profile and provides entry points beyond linguistic/logical',
        environment: 'Flexible spaces that allow movement, music, nature access, and both social and solitary work',
      },
      {
        age_label: 'Adolescent (12–18)',
        age_min: 12,
        age_max: 18,
        focus: 'Deep development of dominant intelligences; using strengths to tackle weak areas',
        activities: [
          'Apprenticeships or mentorships aligned with dominant intelligences',
          'Independent projects that combine multiple intelligences',
          'Community service that leverages interpersonal or naturalist strengths',
          'Self-assessment and metacognition about personal learning profile',
        ],
        parent_role: 'Career and identity guide who helps the teen see how their intelligence profile connects to future paths',
        environment: 'Access to specialized resources: studios, labs, nature, social settings, and reflective spaces',
      },
    ],
    daily_routines: [
      {
        age_label: 'MI-Based Elementary Classroom (6–10)',
        schedule: [
          { time: '08:30', activity: 'Morning meeting', description: 'Check-in using feelings vocabulary (intrapersonal), group song (musical), and agenda review' },
          { time: '09:00', activity: 'Literacy block with MI entry points', description: 'Same text approached through dramatic reading, illustration, partner discussion, and independent journaling' },
          { time: '10:15', activity: 'Math through multiple lenses', description: 'Concept introduced spatially (manipulatives), logically (patterns), musically (rhythm counting), and kinesthetically (body math)' },
          { time: '11:15', activity: 'Outdoor naturalist exploration', description: 'Science content taught through direct observation, collection, and classification outdoors' },
          { time: '12:00', activity: 'Lunch & free choice', description: 'After eating, children choose from MI stations: art corner, music, building, reading nook, nature table, or social games' },
          { time: '13:00', activity: 'Project time', description: 'Long-term projects where children demonstrate understanding through their strongest intelligences' },
          { time: '14:15', activity: 'Reflection & portfolio', description: 'Students add to their MI portfolio and reflect on what worked for their learning today' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'easy',
      materials_needed: [
        'Musical instruments (ukulele, recorder, hand drum)',
        'Art supplies (sketchbooks, paints, clay)',
        'Building materials (LEGOs, wooden blocks, recycled materials)',
        'Nature exploration gear (magnifying glass, binoculars, field guides)',
        'Board games and puzzles (logic-focused)',
        'Journal and writing materials',
        'Space for movement and physical play',
      ],
      weekly_rhythm: 'Daily exposure to at least 3–4 intelligences; weekly "intelligence spotlight" where you explore one intelligence deeply; monthly assessment of child\'s engagement patterns; adjust activities based on what energizes vs. drains the child',
      starter_activities: [
        { name: 'MI Treasure Hunt', age_range: '4–8', description: 'Create a scavenger hunt where each clue uses a different intelligence: a musical clue (follow the rhythm), a spatial clue (read a map), a logical clue (solve a pattern), a kinesthetic clue (act it out), etc.', materials: 'Clue cards, small prizes, various props' },
        { name: 'Intelligence Diary', age_range: '7–14', description: 'For one week, the child rates each school/home activity: "Did this use my body, my words, my music, my pictures, my logic, my nature, my friends, or my feelings?" Patterns emerge quickly.', materials: 'Simple chart or journal' },
        { name: 'Teach It Eight Ways', age_range: '8–16', description: 'Pick any topic the child is studying. Together, figure out how to learn/present it through each intelligence. Even attempting all eight builds metacognitive awareness.', materials: 'Varies by topic — art supplies, instruments, movement space' },
        { name: 'Strength-Based Homework', age_range: '6–14', description: 'When homework feels hard, ask: "How could you use your strongest intelligence to get into this?" A musical child might create a history rap. A spatial child might draw a math concept map.', materials: 'Whatever the child\'s dominant intelligence requires' },
      ],
      books_for_parents: [
        { title: 'Frames of Mind: The Theory of Multiple Intelligences', author: 'Howard Gardner', why: 'The original work — essential for understanding what MI actually claims and doesn\'t claim' },
        { title: 'In Their Own Way: Discovering and Encouraging Your Child\'s Multiple Intelligences', author: 'Thomas Armstrong', why: 'The most practical parent guide for applying MI theory at home, with age-specific strategies' },
        { title: 'Multiple Intelligences: New Horizons in Theory and Practice', author: 'Howard Gardner', why: 'Gardner\'s updated thinking including the naturalist intelligence and responses to critics' },
      ],
      common_mistakes: [
        'Labeling a child as "a bodily-kinesthetic learner" and limiting exposure to other intelligences',
        'Confusing MI theory with "learning styles" — Gardner explicitly rejected the equivalence',
        'Using MI as an excuse to avoid building competence in weaker areas',
        'Reducing MI to a checklist rather than a lens for understanding how each child makes meaning',
        'Ignoring intrapersonal and interpersonal intelligences, which are critical for life success',
      ],
    },
    research: {
      key_studies: [
        { title: 'Frames of Mind: The Theory of Multiple Intelligences', year: 1983, finding: 'Gardner proposed that intelligence is not a single general ability but at least seven (later eight) distinct capacities, each with its own developmental trajectory and neural substrate' },
        { title: 'Multiple Intelligences in the Classroom', year: 2009, finding: 'Armstrong documented case studies showing that MI-based instruction improved engagement and achievement for students who had been underperforming in traditional linguistic/logical-dominant classrooms' },
        { title: 'The Impact of Multiple Intelligences Teaching on Student Achievement', year: 2018, finding: 'Shearer meta-analysis found that MI-based teaching approaches produced moderate positive effects on student achievement, engagement, and self-efficacy across diverse settings' },
        { title: 'Project Spectrum: An Innovative Assessment Alternative', year: 1998, finding: 'Gardner, Feldman & Krechevsky demonstrated that preschool assessment using MI-based activities identified strengths in children that standardized tests missed, particularly for low-income and minority students' },
      ],
      outcome_evidence: 'MI-based instruction consistently improves student engagement and self-concept. Effects on standardized academic achievement are moderate but positive. Strongest evidence supports the use of MI as an assessment framework that identifies strengths in students overlooked by traditional measures. Project Spectrum showed MI assessment reduced racial and socioeconomic bias in identifying gifted students.',
      criticism_summary: 'Cognitive scientists challenge the empirical basis of distinct intelligences, arguing most evidence supports a general intelligence factor (g). MI theory lacks standardized assessments and falsifiable predictions. Some implementations devolve into trivial "learning styles" matching. Gardner himself has warned against the misapplication of his ideas, particularly labeling children or reducing MI to activity checklists.',
    },
    comparison: {
      screen_time: 'integrated',
      homework_stance: 'moderate',
      assessment_method: 'Portfolio-based assessment showing competence across multiple intelligences; Project Spectrum-style tasks',
      teacher_role: 'Learning coach who identifies each child\'s intelligence profile and creates entry points',
      social_emphasis: 'mixed',
      outdoor_time: 'regular',
      arts_emphasis: 'integrated',
      academic_pace: 'standard',
    },
    quality_markers: [
      'All eight intelligences are genuinely present in curriculum design, not just linguistic and logical',
      'Teachers assess and document each child\'s intelligence profile',
      'Students can demonstrate understanding through their strongest intelligence',
      'Assessment uses diverse modalities, not just written tests',
      'Children develop metacognitive awareness of their own learning profile',
    ],
    red_flags: [
      'Children are rigidly categorized as "one type" of learner',
      'MI vocabulary used but instruction remains lecture-and-worksheet dominant',
      'Musical, kinesthetic, and naturalist intelligences treated as "specials" rather than core learning modes',
      'No actual assessment of individual intelligence profiles',
      'Confusing MI with debunked "learning styles" matching',
    ],
    famous_examples: [
      'Key Learning Community (Indianapolis, IN) — the first MI school, founded 1987',
      'New City School (St. Louis, MO) — MI-focused for 30+ years',
      'Project Zero at Harvard Graduate School of Education',
      'EXPO Elementary (St. Paul, MN)',
    ],
    cost_range: '$0–$15,000/year; public MI-focused schools exist; private options vary; home implementation is low-cost',
    availability: 'MI-informed instruction is widely available in progressive public and private schools nationwide. Dedicated MI schools are rarer — concentrated in the Midwest and Northeast. The framework is easy to apply at home and can be requested as an accommodation in any school setting.',
  },

  // =========================================================================
  // 30. CONSTRUCTIVISM
  // =========================================================================
  edu_constructivism: {
    age_stages: [
      {
        age_label: 'Sensorimotor (0–2)',
        age_min: 0,
        age_max: 2,
        focus: 'Building knowledge through physical interaction with objects and people',
        activities: [
          'Object permanence games (peek-a-boo, hiding toys)',
          'Cause-and-effect exploration (dropping, stacking, banging)',
          'Water and sand play with containers of different sizes',
          'Social referencing games (looking to parent for reactions)',
        ],
        parent_role: 'Responsive partner who provides varied objects and celebrates the child\'s discoveries',
        environment: 'Safe space rich with manipulable objects of different textures, weights, and properties',
      },
      {
        age_label: 'Preoperational & Concrete (3–8)',
        age_min: 3,
        age_max: 8,
        focus: 'Hands-on experimentation, questioning, and building mental models',
        activities: [
          'Science experiments with predictions ("What will happen if...?")',
          'Building and testing structures (bridges, towers, ramps)',
          'Story creation and dramatic re-enactment',
          'Classification games with real objects',
          'Collaborative problem-solving challenges',
        ],
        parent_role: 'Question-asker who provokes thinking rather than giving answers',
        environment: 'Maker-space atmosphere with diverse materials; problems to solve, not worksheets to complete',
      },
      {
        age_label: 'Formal Operations (9–18)',
        age_min: 9,
        age_max: 18,
        focus: 'Abstract reasoning, hypothesis testing, and collaborative knowledge construction',
        activities: [
          'Design challenges with real-world constraints',
          'Socratic seminars and philosophical discussions',
          'Independent research projects from personal questions',
          'Peer teaching and collaborative writing',
          'Reflective journaling about how understanding has changed',
        ],
        parent_role: 'Intellectual companion who asks genuine questions and models learning from mistakes',
        environment: 'Access to primary sources, real-world problems, diverse perspectives, and tools for investigation',
      },
    ],
    daily_routines: [
      {
        age_label: 'Constructivist Elementary (6–10)',
        schedule: [
          { time: '08:30', activity: 'Morning meeting & question board', description: 'Share observations, post new questions, and revisit yesterday\'s investigations' },
          { time: '09:00', activity: 'Investigation block', description: 'Students work on self-directed or teacher-prompted investigations in math or science' },
          { time: '10:00', activity: 'Sharing & challenging', description: 'Groups present findings; peers ask questions and offer alternative explanations' },
          { time: '10:30', activity: 'Literacy workshop', description: 'Reading and writing connected to investigation topics; emphasis on constructing meaning from text' },
          { time: '11:30', activity: 'Outdoor exploration', description: 'Nature-based inquiry, measurement, or physical challenges' },
          { time: '12:15', activity: 'Lunch & reflection', description: 'Eating together followed by journal reflection on what surprised them today' },
          { time: '13:00', activity: 'Project work', description: 'Long-term projects where students build, create, or design solutions to real problems' },
          { time: '14:30', activity: 'Closing circle', description: 'Share one thing your thinking changed about today' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'easy',
      materials_needed: [
        'Open-ended building materials (blocks, cardboard, tape, recycled items)',
        'Science exploration supplies (magnifying glass, measuring tools, magnets, prisms)',
        'A "question wall" or journal for recording wonderings',
        'Art supplies for representing ideas visually',
        'Access to books, videos, and internet for research',
        'Real-world tools appropriate to age (kitchen tools, garden tools, workshop tools)',
      ],
      weekly_rhythm: 'Daily "wonder time" — follow one question wherever it leads (30–60 minutes); weekly building/making project; ask "What do you think?" before providing answers; revisit and revise ideas regularly',
      starter_activities: [
        { name: 'The Question Jar', age_range: '3–10', description: 'Keep a jar by the dinner table. When anyone has a question, write it down and drop it in. Once a week, pull one out and investigate it together. Don\'t Google it first — predict, experiment, then check.', materials: 'Jar, paper slips, pencils' },
        { name: 'Engineering Challenge', age_range: '5–14', description: 'Pose a problem: "Build a bridge from paper that holds 20 pennies." Provide materials but no instructions. Let children fail, redesign, and test. Celebrate the process, not just success.', materials: 'Paper, tape, pennies, scissors' },
        { name: 'Prediction Walk', age_range: '4–10', description: 'Before a nature walk, make predictions: "How many birds will we see? What color will the leaves be? Will the stream be higher or lower than last time?" Check predictions. Discuss why some were wrong.', materials: 'Prediction sheet, pencil, clipboard' },
        { name: 'Cook Without a Recipe', age_range: '7–16', description: 'Give the child ingredients and a goal ("make a soup"). Let them construct their understanding of cooking through experimentation. Discuss what worked and what they\'d change.', materials: 'Kitchen ingredients, basic cooking equipment' },
      ],
      books_for_parents: [
        { title: 'The Having of Wonderful Ideas', author: 'Eleanor Duckworth', why: 'The most accessible and inspiring book on constructivist teaching — every example is practical and memorable' },
        { title: 'Mindstorms: Children, Computers, and Powerful Ideas', author: 'Seymour Papert', why: 'Papert\'s constructionism — how children learn by making things — is constructivism\'s most practical extension' },
        { title: 'Young Children Reinvent Arithmetic', author: 'Constance Kamii', why: 'Shows how children can construct mathematical understanding without being taught algorithms — eye-opening' },
      ],
      common_mistakes: [
        'Providing the answer when the child struggles instead of asking a guiding question',
        'Confusing "discovery learning" with leaving children entirely alone — scaffolding is essential',
        'Skipping the prediction step — the power of constructivism is in confronting misconceptions',
        'Not allowing enough time for genuine investigation; rushing to the "right answer"',
        'Treating every topic as equally suitable for discovery — some foundational knowledge needs direct instruction',
      ],
    },
    research: {
      key_studies: [
        { title: 'The Origins of Intelligence in Children', year: 1952, finding: 'Piaget demonstrated that children actively construct understanding through stages of cognitive development, not through passive absorption of information' },
        { title: 'Mind in Society: The Development of Higher Psychological Processes', year: 1978, finding: 'Vygotsky showed that learning occurs in the "zone of proximal development" through social interaction and scaffolding, extending constructivism into a social framework' },
        { title: 'Constructivism and Science Education: A Further Appraisal', year: 2009, finding: 'Taber reviewed 30 years of constructivist science education research and found consistent benefits for conceptual understanding, transfer, and motivation compared to transmissionist instruction' },
        { title: 'Guided Discovery Learning: An Analysis of Interventions', year: 2011, finding: 'Alfieri et al. meta-analysis found that guided discovery (constructivism with scaffolding) significantly outperformed both direct instruction and unassisted discovery for learning outcomes' },
      ],
      outcome_evidence: 'Decades of research confirm that constructivist approaches produce deeper conceptual understanding, better transfer to novel problems, stronger motivation, and more durable learning than rote or transmissionist instruction. The critical caveat from meta-analyses is that pure unguided discovery is less effective than guided discovery — the teacher\'s role in scaffolding is essential.',
      criticism_summary: 'Unguided discovery can be inefficient and frustrating, especially for novice learners (Kirschner, Sweller & Clark, 2006). Children with learning disabilities may need more explicit instruction. Assessment is challenging since standardized tests favor recall over conceptual understanding. Implementation requires highly skilled teachers. Some basic knowledge (decoding, math facts) may be more efficiently taught directly.',
    },
    comparison: {
      screen_time: 'integrated',
      homework_stance: 'minimal',
      assessment_method: 'Performance-based tasks, portfolios, and explanation of reasoning; minimal standardized testing',
      teacher_role: 'Facilitator who poses problems, asks probing questions, and scaffolds without telling answers',
      social_emphasis: 'small-group',
      outdoor_time: 'regular',
      arts_emphasis: 'integrated',
      academic_pace: 'gradual',
    },
    quality_markers: [
      'Students are regularly asked to make predictions, test them, and explain their reasoning',
      'Wrong answers are treated as productive starting points, not failures',
      'Students can explain why something works, not just how to do it',
      'Assessment asks students to apply knowledge to novel situations',
      'The classroom centers around questions, not answers',
    ],
    red_flags: [
      '"Constructivist" label but instruction is actually lecture-and-worksheet with hands-on add-ons',
      'Children left entirely alone without scaffolding ("figure it out yourself")',
      'No attention to prior knowledge and misconceptions before new topics',
      'Hands-on activities that are busy-work rather than genuine investigation',
      'Assessment that still relies entirely on recall and procedure',
    ],
    famous_examples: [
      'Bank Street School for Children (New York, NY) — developmental-interaction approach',
      'Constructivist Consortium schools (various US cities)',
      'MIT Media Lab\'s Lifelong Kindergarten group (Scratch programming)',
      'The Exploratorium (San Francisco, CA) — museum embodying constructivist principles',
    ],
    cost_range: '$0–$20,000/year; constructivist principles can be applied in any public school or at home for free; progressive private schools are the most consistent implementations',
    availability: 'Constructivist principles are embedded in many progressive schools, project-based learning programs, and maker spaces nationwide. Explicitly constructivist schools are less common but exist in most major cities. The approach is highly implementable at home since the core practice is asking questions rather than buying materials.',
  },

  // =========================================================================
  // 31. ATTACHMENT-BASED EDUCATION
  // =========================================================================
  edu_attachment: {
    age_stages: [
      {
        age_label: 'Newborn to Infant (0–12 months)',
        age_min: 0,
        age_max: 1,
        focus: 'Establishing secure attachment through responsive caregiving',
        activities: [
          'Skin-to-skin contact and baby-wearing',
          'Prompt, consistent response to cries and cues',
          'Face-to-face "serve and return" interactions',
          'Narrating daily activities in warm tones',
          'Infant massage and gentle touch',
        ],
        parent_role: 'Primary secure base — the relationship IS the curriculum',
        environment: 'Calm, predictable home with minimal separation; one or two consistent caregivers',
      },
      {
        age_label: 'Toddler (1–3)',
        age_min: 1,
        age_max: 3,
        focus: 'Building autonomy from a secure base; co-regulation of big emotions',
        activities: [
          'Proximity play — staying near while the child explores',
          'Emotion naming and validation ("You\'re frustrated because...")',
          'Gradual, gentle separations with predictable reunions',
          'Rituals and routines for transitions (goodbye songs, hello rituals)',
          'Repair after ruptures — reconnecting after conflicts',
        ],
        parent_role: 'Safe harbor who welcomes the child back after each exploration and co-regulates emotions',
        environment: 'Small group sizes (3–4 children per adult); consistent caregivers; warm, home-like setting',
      },
      {
        age_label: 'Preschool (3–6)',
        age_min: 3,
        age_max: 6,
        focus: 'Secure relationships as the foundation for social learning and confidence',
        activities: [
          'Circle of Security practices — reading and responding to attachment cues',
          'Small-group social play with adult facilitation',
          'Story-based emotion exploration (bibliotherapy)',
          'Comfort rituals for transitions (starting school, new siblings)',
          'Collaborative problem-solving for peer conflicts',
        ],
        parent_role: 'Bridge to wider world who prepares the child for relationships with teachers and peers',
        environment: 'Childcare with very low ratios (1:3 for toddlers, 1:6 for preschool); primary caregiver model; unhurried transitions',
      },
    ],
    daily_routines: [
      {
        age_label: 'Attachment-Informed Toddler Care (1–3)',
        schedule: [
          { time: '07:30', activity: 'Arrival & connection', description: 'Warm, individual greeting from the primary caregiver; parent hands over a comfort object; brief connection ritual' },
          { time: '08:00', activity: 'Free play with proximity', description: 'Caregiver sits at child\'s level and is emotionally available while children explore' },
          { time: '09:00', activity: 'Snack & songs', description: 'Small-group snack with conversation; familiar songs provide predictability' },
          { time: '09:30', activity: 'Outdoor exploration', description: 'Caregiver follows children\'s lead outdoors, narrating and staying close' },
          { time: '10:30', activity: 'Sensory play', description: 'Water, sand, playdough — soothing materials that also build fine motor skills' },
          { time: '11:15', activity: 'Lunch & wind-down', description: 'Unhurried meal; caregiver helps each child transition to rest' },
          { time: '12:00', activity: 'Nap with comfort', description: 'Each child settles with their comfort object; caregiver pats, rocks, or sings as needed' },
          { time: '14:00', activity: 'Wake-up & reunion', description: 'Gentle wake-up; afternoon play; joyful reunion ritual when parent arrives' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'easy',
      materials_needed: [
        'Baby carrier or sling for infant stage',
        'Comfort objects (lovey, blanket) for toddler stage',
        'Emotion picture books (e.g., "The Color Monster," "In My Heart")',
        'Feelings faces chart or cards',
        'A cozy "calm-down corner" with soft items',
        'Photo book of family and important people',
      ],
      weekly_rhythm: 'No weekly curriculum — attachment-based education is about HOW you interact, not WHAT activities you do. Focus on: predictable daily routines, prompt response to bids for connection, emotion coaching during tough moments, repair after conflicts, and "special time" (15–30 minutes of child-led play daily)',
      starter_activities: [
        { name: 'Special Time', age_range: '1–6', description: 'Set a timer for 15–30 minutes. Follow your child\'s lead completely — no phone, no teaching, no redirecting. Simply be present and narrate what they do: "You\'re stacking the blue one on top."', materials: 'Timer, whatever the child chooses' },
        { name: 'Goodbye Ritual', age_range: '1–4', description: 'Create a predictable goodbye sequence for separations: three kisses, a special wave, and a phrase ("I always come back"). Practice at home before using at daycare. Consistency reduces separation anxiety.', materials: 'None' },
        { name: 'Emotion Coaching', age_range: '2–6', description: 'When your child has a meltdown, get at their level, validate the feeling ("You\'re so angry that tower fell"), and wait. Don\'t fix, distract, or minimize. After the storm passes, problem-solve together.', materials: 'Feelings chart for reference' },
        { name: 'Story-Based Feelings Work', age_range: '3–6', description: 'Read books about emotions together. Pause to ask: "Has that happened to you? What did your tummy feel like?" Build emotional vocabulary and the habit of reflecting on inner states.', materials: 'Emotion-focused picture books' },
      ],
      books_for_parents: [
        { title: 'Circle of Security Intervention', author: 'Bert Powell, Glen Cooper, Kent Hoffman & Bob Marvin', why: 'The most practical attachment-based parenting framework — visual, clear, and deeply compassionate' },
        { title: 'Parenting from the Inside Out', author: 'Daniel J. Siegel & Mary Hartzell', why: 'Explains how your own attachment history shapes your parenting and how to break unhelpful patterns' },
        { title: 'Raising a Secure Child', author: 'Kent Hoffman, Glen Cooper & Bert Powell', why: 'The Circle of Security authors\' parent-friendly guide — the most actionable attachment book available' },
      ],
      common_mistakes: [
        'Confusing attachment parenting (a parenting style) with attachment theory (a scientific framework)',
        'Believing secure attachment means never saying no or setting limits — limits WITH empathy build security',
        'Assuming only mothers can be attachment figures — any consistent, responsive caregiver counts',
        'Panicking about single incidents of misattunement — repair is more important than perfection',
        'Ignoring your own emotional state — you can\'t co-regulate if you\'re dysregulated yourself',
      ],
    },
    research: {
      key_studies: [
        { title: 'Attachment and Loss (trilogy)', year: '1969–1980', finding: 'Bowlby established that early attachment relationships create internal working models that shape social, emotional, and cognitive development throughout life' },
        { title: 'Patterns of Attachment: A Psychological Study of the Strange Situation', year: 1978, finding: 'Ainsworth identified secure, avoidant, and resistant attachment patterns and showed that maternal sensitivity predicted attachment security' },
        { title: 'The Circle of Security Intervention: Differential Treatment Effects', year: 2011, finding: 'Hoffman et al. found that the Circle of Security program moved 70% of insecurely attached children to secure attachment classification within 20 weeks of parent training' },
        { title: 'NICHD Study of Early Child Care and Youth Development', year: 2006, finding: 'The largest US childcare study found that caregiver sensitivity and low child-to-adult ratios were the strongest predictors of positive developmental outcomes, more than program type' },
        { title: 'A Meta-Analysis of Sensitivity and Attachment Interventions', year: 2003, finding: 'Bakermans-Kranenburg et al. found that brief, focused interventions improving parental sensitivity were most effective at promoting secure attachment' },
      ],
      outcome_evidence: 'Secure attachment is one of the most robust predictors in developmental science: securely attached children show better emotion regulation, social competence, school readiness, cognitive flexibility, and resilience. The Minnesota Longitudinal Study (30+ years) showed secure attachment at 12 months predicted academic achievement, social skills, and mental health through adulthood. Interventions that increase parental sensitivity reliably shift children from insecure to secure attachment.',
      criticism_summary: 'Attachment theory has been criticized for overemphasizing the mother-child dyad, cultural bias toward Western middle-class norms of parenting, deterministic language that blames parents for all child difficulties, and insufficient attention to temperament and bidirectional effects. Modern attachment research addresses many of these concerns but popular interpretations often lag behind the science.',
    },
    comparison: {
      screen_time: 'limited',
      homework_stance: 'none',
      assessment_method: 'Observation of attachment behaviors and emotional regulation; no academic testing at this age',
      teacher_role: 'Secure base — a warm, consistent, emotionally available caregiver who reads and responds to cues',
      social_emphasis: 'small-group',
      outdoor_time: 'regular',
      arts_emphasis: 'minimal',
      academic_pace: 'delayed',
    },
    quality_markers: [
      'Very low child-to-caregiver ratios (1:3 for infants, 1:4 for toddlers)',
      'Primary caregiver model — each child has one consistent key person',
      'Unhurried transitions with rituals for arrivals, departures, and changes',
      'Staff trained in attachment theory, Circle of Security, or equivalent framework',
      'Focus on emotional literacy and co-regulation as central curriculum',
    ],
    red_flags: [
      'High staff turnover meaning children constantly lose their primary caregiver',
      'Large group sizes or high ratios that prevent responsive care',
      'Dismissal of children\'s distress ("You\'re fine," "Big kids don\'t cry")',
      'Rigid schedules that override children\'s emotional needs',
      'No visible focus on the quality of adult-child relationships',
    ],
    famous_examples: [
      'Circle of Security programs (worldwide, originated at University of Virginia)',
      'Pikler/Lóczy Institute (Budapest, Hungary) — attachment-informed infant care',
      'HighScope Perry Preschool (Ypsilanti, MI) — relationship-based with long-term outcome data',
    ],
    cost_range: '$12,000–$30,000/year for high-quality infant/toddler care with low ratios; Circle of Security parent groups $200–$500 for 8-week course',
    availability: 'Attachment-informed care is a quality standard rather than a branded program. Look for it in RIE-based infant programs, HighScope centers, and any program emphasizing low ratios, primary caregiving, and emotional responsiveness. Circle of Security parenting groups are available in most US cities.',
  },

  // =========================================================================
  // 32. TRAUMA-INFORMED EDUCATION
  // =========================================================================
  edu_trauma_informed: {
    age_stages: [
      {
        age_label: 'Early Childhood (2–5)',
        age_min: 2,
        age_max: 5,
        focus: 'Restoring felt safety, predictability, and co-regulation',
        activities: [
          'Consistent daily visual schedules with picture cues',
          'Calming sensory activities (water play, playdough, sand)',
          'Therapeutic storytelling about feelings and coping',
          'Body-based regulation (rocking, swinging, deep pressure)',
          'Repair rituals after challenging moments',
        ],
        parent_role: 'Regulated, predictable presence who prioritizes safety over compliance',
        environment: 'Calm, low-stimulation space; cozy corners for retreat; visual schedules everywhere; minimal surprises',
      },
      {
        age_label: 'Elementary (6–11)',
        age_min: 6,
        age_max: 11,
        focus: 'Building regulation skills, relational trust, and academic re-engagement',
        activities: [
          'Daily check-ins using a regulation scale ("Where are you on the zones?")',
          'Brain education — teaching children about fight/flight/freeze in kid-friendly terms',
          'Movement breaks tied to regulation needs, not punishment',
          'Collaborative problem-solving (Ross Greene\'s Plan B)',
          'Strengths-based academic interventions',
        ],
        parent_role: 'Safe base who understands that behavior is communication and responds to the need beneath it',
        environment: 'Classroom with regulation tools (fidgets, noise-canceling headphones, calm corner); flexible seating; predictable routines with advance notice of changes',
      },
      {
        age_label: 'Adolescent (12–18)',
        age_min: 12,
        age_max: 18,
        focus: 'Agency, identity, and healing through connection and competence',
        activities: [
          'Restorative circles for conflict resolution',
          'Mindfulness and grounding practices',
          'Expressive arts (journaling, music, visual art) for processing',
          'Peer mentoring programs',
          'Student voice in school policy and classroom norms',
        ],
        parent_role: 'Advocate and ally who ensures the teen\'s school environment is safe and supports healing',
        environment: 'Relational school culture with restorative (not punitive) discipline; access to counseling; student agency in daily decisions',
      },
    ],
    daily_routines: [
      {
        age_label: 'Trauma-Informed Elementary Classroom (6–10)',
        schedule: [
          { time: '08:15', activity: 'Predictable arrival', description: 'Warm greeting at the door by name; regulation check-in ("How\'s your engine running?"); breakfast available' },
          { time: '08:45', activity: 'Morning meeting', description: 'Brief, structured community building: greeting, sharing, group activity, morning message' },
          { time: '09:15', activity: 'Academic block 1', description: 'Literacy instruction with embedded regulation breaks; choices in seating and tools' },
          { time: '10:15', activity: 'Movement & regulation', description: 'Structured movement (yoga, drumming, or outdoor play) designed to regulate the nervous system' },
          { time: '10:45', activity: 'Academic block 2', description: 'Math with collaborative, strengths-based approaches; growth mindset language' },
          { time: '11:45', activity: 'Lunch & recess', description: 'Structured social time with adult support; quiet eating option for overwhelmed students' },
          { time: '12:30', activity: 'Afternoon project', description: 'Hands-on learning that builds competence and mastery — the antidote to helplessness' },
          { time: '14:00', activity: 'Closing circle & regulation check-out', description: 'Reflection on the day, affirmation of each child, preview of tomorrow to reduce anxiety' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'moderate',
      materials_needed: [
        'Visual schedule board with Velcro pictures or magnets',
        'Regulation tools: fidgets, weighted blanket, noise-canceling headphones',
        'Calm-down kit: stress ball, lavender sachet, smooth stones, glitter jar',
        'Feelings/zones chart posted at child\'s eye level',
        'Timer for transitions (visual countdown preferred)',
        'Sensory items: playdough, kinetic sand, water beads',
      ],
      weekly_rhythm: 'Absolute consistency in daily rhythms (same wake, meal, bedtime sequence); regulated adult presence is more important than any activity; weekly family meeting to problem-solve collaboratively; build in predictable "special time" daily; prepare for transitions and changes with advance notice and visual supports',
      starter_activities: [
        { name: 'Glitter Jar (Mind Jar)', age_range: '3–10', description: 'Fill a jar with water, glitter glue, and fine glitter. Shake it when feelings are big. Watch the glitter settle — "That\'s what happens in your brain when you take slow breaths." Use it as a co-regulation tool, not a punishment.', materials: 'Mason jar, glitter glue, fine glitter, warm water, super glue for lid' },
        { name: 'Zones of Regulation at Home', age_range: '5–14', description: 'Teach four zones: Blue (low energy/sad), Green (calm/ready), Yellow (frustrated/anxious), Red (explosive/out of control). Check in at meals: "What zone are you in?" Normalize all zones and teach strategies for each.', materials: 'Zones of Regulation chart, strategy cards' },
        { name: 'Collaborative Problem-Solving (Plan B)', age_range: '4–18', description: 'When a recurring behavior problem arises, follow three steps: 1) Empathize ("I\'ve noticed it\'s hard when..."), 2) Define your concern, 3) Brainstorm solutions together. The child participates in solving the problem.', materials: 'None — just the conversational framework' },
        { name: 'Predictable Bedtime Sequence', age_range: '2–10', description: 'Create an unvarying 4–5 step bedtime routine visualized with pictures. Same order, same time, every night. For trauma-affected children, predictability at bedtime is one of the most healing things you can provide.', materials: 'Visual schedule for bedtime, comfort objects' },
      ],
      books_for_parents: [
        { title: 'The Whole-Brain Child', author: 'Daniel J. Siegel & Tina Payne Bryson', why: 'Makes the neuroscience of regulation and integration accessible; full of practical strategies' },
        { title: 'The Explosive Child', author: 'Ross W. Greene', why: 'Reframes challenging behavior as skill deficits, not willful defiance; the collaborative problem-solving model is transformative' },
        { title: 'Beyond Behaviors: Using Brain Science and Compassion to Understand and Solve Children\'s Behavioral Challenges', author: 'Mona Delahooke', why: 'Explains how to read behavior as communication about nervous system state' },
        { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', why: 'The foundational text on how trauma lives in the body and how body-based approaches are essential for healing' },
      ],
      common_mistakes: [
        'Using trauma-informed language but still relying on punishment and consequences',
        'Asking a child to "use their words" when they are in a fight-or-flight state and literally cannot access language',
        'Removing recess or movement breaks as a consequence — these are regulation tools, not privileges',
        'Confusing "trauma-informed" with "no expectations" — structure and high expectations WITH support are healing',
        'Ignoring adult self-regulation — you cannot co-regulate a child if your own nervous system is activated',
      ],
    },
    research: {
      key_studies: [
        { title: 'Adverse Childhood Experiences and Lifelong Health (ACE Study)', year: 1998, finding: 'Felitti & Anda found that adverse childhood experiences have a dose-response relationship with adult health and social outcomes — and that safe, stable relationships are the primary protective factor' },
        { title: 'Helping Traumatized Children Learn (Vol. 1 & 2)', year: 2005, finding: 'Cole et al. documented that trauma-sensitive schools reduced suspensions by 50–85% while improving academic outcomes for all students, not only those with trauma histories' },
        { title: 'Collaborative & Proactive Solutions: Outcomes Research', year: 2012, finding: 'Greene et al. showed that collaborative problem-solving reduced challenging behavior by 65% in school settings compared to traditional behavioral management' },
        { title: 'The Impact of Trauma-Informed Care on School Climate', year: 2019, finding: 'Dorado et al. found that whole-school trauma-informed approaches at San Francisco\'s Lincoln High School reduced suspensions by 87% and increased attendance' },
        { title: 'Neurosequential Model of Therapeutics: Clinical Applications', year: 2009, finding: 'Perry demonstrated that trauma-affected children need bottom-up intervention (body/sensory before cognitive) and that relational safety is prerequisite to learning' },
      ],
      outcome_evidence: 'Strong evidence that trauma-informed school practices reduce suspensions, expulsions, and disciplinary incidents by 50–87% while improving attendance and academic performance. The ACE study (17,000+ participants) established the lifelong impact of adverse experiences and the protective role of safe relationships. Collaborative problem-solving and regulation-focused approaches consistently outperform punitive discipline for children with trauma histories.',
      criticism_summary: 'Risk of over-pathologizing normal childhood behavior; "trauma-informed" can become a vague label applied without genuine practice change; some teachers report feeling unprepared to handle disclosures; concern about diagnosing without clinical training; tension between individual support and whole-class management; evidence base is stronger for reducing negative outcomes than for accelerating academic gains.',
    },
    comparison: {
      screen_time: 'limited',
      homework_stance: 'minimal',
      assessment_method: 'Strengths-based progress monitoring; functional behavioral assessment; reduced high-stakes testing',
      teacher_role: 'Regulated, safe adult who reads behavior as communication and responds to the need underneath',
      social_emphasis: 'community',
      outdoor_time: 'regular',
      arts_emphasis: 'integrated',
      academic_pace: 'gradual',
    },
    quality_markers: [
      'All staff trained in trauma, ACEs, and regulation — not just counselors',
      'Discipline is restorative and relationship-repairing, not punitive',
      'Physical environment designed for regulation (calm corners, flexible seating, low stimulation options)',
      'Predictable routines with ample advance notice of changes',
      'Focus on adult self-regulation as a prerequisite for co-regulating children',
    ],
    red_flags: [
      'Punitive discipline still in use (suspensions, loss of recess, public shaming)',
      '"Trauma-informed" training happened once and never became embedded in practice',
      'Children labeled as "traumatized" but offered no additional support or modified expectations',
      'Adults frequently dysregulated (yelling, threatening) while expecting children to self-regulate',
      'No calm-down spaces or sensory tools available to students',
    ],
    famous_examples: [
      'Lincoln High School (Walla Walla, WA) — Paper Tigers documentary site',
      'San Francisco Unified School District\'s HEARTS program',
      'Turnaround for Children (New York) — whole-school trauma-informed transformation',
      'Spokane, WA public schools — community-wide ACEs initiative',
    ],
    cost_range: '$0 for public schools implementing trauma-informed practices; training costs $1,000–$5,000 per school; therapeutic schools $15,000–$60,000/year',
    availability: 'Trauma-informed practices are spreading rapidly in US public schools — nearly every state has adopted trauma-informed education policies. Quality varies enormously. Specialized therapeutic schools exist in most metropolitan areas for children with significant trauma histories. The approach can be fully implemented at home for free.',
  },

  // =========================================================================
  // 33. NEURODIVERSITY-AFFIRMING EDUCATION
  // =========================================================================
  edu_neurodiversity: {
    age_stages: [
      {
        age_label: 'Infant & Toddler (0–3)',
        age_min: 0,
        age_max: 3,
        focus: 'Following the child\'s lead; supporting sensory needs; presuming competence',
        activities: [
          'Responsive interaction following the child\'s communication style (not forcing eye contact)',
          'Rich sensory environment adapted to individual sensory profile',
          'Movement freedom — respecting the need to stim, rock, or flap',
          'Communication support (sign language, AAC, or whatever modality works)',
        ],
        parent_role: 'Attuned responder who learns the child\'s unique communication and sensory language',
        environment: 'Sensory-friendly space with options for more or less stimulation; predictable routines',
      },
      {
        age_label: 'Early Childhood (3–7)',
        age_min: 3,
        age_max: 7,
        focus: 'Building on strengths and interests; sensory regulation; social connection on the child\'s terms',
        activities: [
          'Interest-led learning (if the child loves trains, learn math, reading, and geography through trains)',
          'Sensory diet activities matched to individual needs',
          'Social stories and visual supports for challenging situations',
          'Parallel play and small-group activities without forced participation',
          'Augmentative and alternative communication (AAC) if needed',
        ],
        parent_role: 'Advocate and interpreter who helps the world understand the child and the child understand the world',
        environment: 'Flexible classroom or home with sensory tools, visual schedules, quiet retreat spaces, and multiple ways to participate',
      },
      {
        age_label: 'School Age (7–12)',
        age_min: 7,
        age_max: 12,
        focus: 'Academic access through accommodation; identity development; self-advocacy',
        activities: [
          'Twice-exceptional (2e) programming for gifted neurodivergent children',
          'Technology tools: text-to-speech, speech-to-text, graphic organizers',
          'Executive function coaching with visual systems',
          'Interest-based projects as primary assessment method',
          'Neurodiversity education — learning about how brains differ',
        ],
        parent_role: 'Advocacy partner who co-creates IEP/504 plans and teaches self-advocacy skills',
        environment: 'Universal Design for Learning (UDL) classroom with multiple means of engagement, representation, and expression',
      },
      {
        age_label: 'Adolescent (13–18)',
        age_min: 13,
        age_max: 18,
        focus: 'Self-knowledge, self-advocacy, transition planning, and identity pride',
        activities: [
          'Neurodivergent peer communities and mentorship',
          'Self-directed learning in areas of deep interest (hyperfocus as superpower)',
          'Transition planning that builds on strengths rather than remediating deficits',
          'Self-advocacy skills for college or workplace accommodations',
          'Learning from neurodivergent role models and mentors',
        ],
        parent_role: 'Gradually transferring advocacy to the teen while remaining a fierce safety net',
        environment: 'Flexible, accommodating settings that allow asynchronous development and unconventional paths to success',
      },
    ],
    daily_routines: [
      {
        age_label: 'Neurodiversity-Affirming Elementary (6–10)',
        schedule: [
          { time: '08:30', activity: 'Flexible arrival', description: 'Staggered entry with sensory check-in; child chooses regulation activity (trampoline, headphones, fidgets)' },
          { time: '09:00', activity: 'Morning meeting (optional participation)', description: 'Community gathering with multiple ways to participate: verbal, written, gesture, or just listening' },
          { time: '09:30', activity: 'Learning block 1 (UDL format)', description: 'Core content presented visually, auditorily, and kinesthetically; students choose how to demonstrate understanding' },
          { time: '10:30', activity: 'Movement & sensory break', description: 'Not optional — built into the schedule. Obstacle course, swinging, heavy work, or calm sensory room' },
          { time: '11:00', activity: 'Interest-based project time', description: 'Students work on projects connected to their deep interests, integrating academic skills' },
          { time: '12:00', activity: 'Lunch (with choice)', description: 'Option to eat with peers or in a quieter space; no forced socialization' },
          { time: '12:45', activity: 'Learning block 2 (small group)', description: 'Skill-based small groups with targeted instruction; technology tools available' },
          { time: '14:00', activity: 'Closing & transition support', description: 'Preview of tomorrow; visual schedule updates; sensory regulation before departure' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'moderate',
      materials_needed: [
        'Sensory tools matched to your child\'s profile (weighted blanket, noise-canceling headphones, chew necklaces, fidgets)',
        'Visual schedule system (Velcro board, magnetic, or digital)',
        'Timer (visual countdown timer like the Time Timer)',
        'Technology tools: tablet with AAC app, text-to-speech, audiobooks',
        'Special interest materials — invest deeply in what lights your child up',
        'Social stories books or templates',
      ],
      weekly_rhythm: 'Predictable daily rhythm with visual supports; built-in sensory regulation throughout the day (not just when dysregulated); special interest time protected daily (30–60 minutes minimum); social opportunities matched to the child\'s capacity (not forced); weekly review of what\'s working and what needs adjustment',
      starter_activities: [
        { name: 'Sensory Profile Discovery', age_range: '2–12', description: 'Over two weeks, observe your child systematically: What sounds bother them? What textures do they seek? Do they crave or avoid movement? Create a one-page "sensory profile" that you can share with teachers and caregivers.', materials: 'Observation journal, sensory checklist (free from STAR Institute)' },
        { name: 'Interest-Led Learning Unit', age_range: '5–18', description: 'Take your child\'s deepest interest and build a full learning unit around it. Dinosaurs? Read about them (literacy), count them (math), locate dig sites (geography), sculpt them (art), learn their Latin names (language). Interest is the engine.', materials: 'Books, internet access, art supplies, field trip to a museum' },
        { name: 'Visual Schedule Co-Creation', age_range: '3–12', description: 'Build the daily schedule WITH your child using pictures or icons. Let them choose the order of flexible items. Post it where they can check it independently. This builds autonomy and reduces anxiety.', materials: 'Visual schedule board, picture cards or printable icons' },
        { name: 'Self-Advocacy Script Practice', age_range: '8–18', description: 'Practice real scripts: "I need a break." "This is too loud for me." "I understand better when I can see it written down." Role-play with your child so they can use these in school and social situations.', materials: 'Script cards, role-play partner' },
      ],
      books_for_parents: [
        { title: 'Neurodiversity: Discovering the Extraordinary Gifts of Autism, ADHD, Dyslexia, and Other Brain Differences', author: 'Thomas Armstrong', why: 'Reframes neurological differences as natural human variation with genuine strengths' },
        { title: 'Uniquely Human: A Different Way of Seeing Autism', author: 'Barry Prizant', why: 'Transforms understanding of autistic behavior from "symptom to manage" to "experience to understand"' },
        { title: 'Differently Wired: A Parent\'s Guide to Raising an Atypical Child with Confidence and Hope', author: 'Deborah Reber', why: 'Honest, practical guide for the emotional journey of parenting a neurodivergent child' },
        { title: 'The Explosive Child', author: 'Ross W. Greene', why: 'Essential for understanding that challenging behavior reflects lagging skills, not bad character' },
      ],
      common_mistakes: [
        'Focusing exclusively on remediating weaknesses while neglecting to develop extraordinary strengths',
        'Forcing eye contact, social scripts, or neurotypical behaviors that mask the child\'s authentic self',
        'Comparing developmental timelines to neurotypical milestones instead of tracking individual growth',
        'Viewing stimming as a "behavior to eliminate" rather than a valid regulation strategy',
        'Not involving the neurodivergent community — autistic adults, ADHD adults, and dyslexic adults are the best experts on their own experience',
      ],
    },
    research: {
      key_studies: [
        { title: 'Neurodiversity as a Competitive Advantage', year: 2017, finding: 'Austin & Pisano documented that companies like SAP, Microsoft, and JPMorgan hiring neurodivergent workers for their unique cognitive strengths saw productivity gains of 48–140% in targeted roles' },
        { title: 'Camouflaging in Autism: A Systematic Review', year: 2017, finding: 'Hull et al. found that autistic people who mask their natural behaviors to appear neurotypical experience significantly higher rates of anxiety, depression, burnout, and suicidality' },
        { title: 'Universal Design for Learning: Theory and Practice', year: 2014, finding: 'Meyer, Rose & Gordon showed that UDL-designed classrooms benefit all learners while being essential for neurodivergent students — a "curb cut" effect in education' },
        { title: 'Interest-Based Learning and Intrinsic Motivation in ADHD', year: 2019, finding: 'Ashinoff & Abu-Akel found that interest-based nervous systems (common in ADHD) show typical or superior attention and executive function when tasks align with intrinsic motivation' },
        { title: 'Twice-Exceptional Students: Gifted Students with Disabilities', year: 2018, finding: 'Reis et al. found that twice-exceptional students thrive when both their giftedness and disability are addressed simultaneously, but most schools address only one' },
      ],
      outcome_evidence: 'Growing evidence that neurodiversity-affirming approaches improve mental health, self-concept, and functional outcomes while reducing masking-related burnout. UDL and strength-based approaches benefit all learners. Twice-exceptional research shows that developing strengths produces better outcomes than deficit remediation alone. Workplace neurodiversity programs demonstrate that when environments accommodate cognitive differences, neurodivergent individuals often outperform peers in suited roles.',
      criticism_summary: 'Some clinicians argue the neurodiversity framework minimizes genuine impairments and the need for intervention, particularly for those with high support needs. Tension exists between affirming identity and providing necessary therapeutic support. Schools may use "neurodiversity-affirming" language without making substantive accommodations. The framework is better developed for autism and ADHD than for other conditions. Evidence for specific affirming educational models is still emerging.',
    },
    comparison: {
      screen_time: 'integrated',
      homework_stance: 'minimal',
      assessment_method: 'Multiple means of expression; portfolio and project-based; accommodated standardized testing when required',
      teacher_role: 'Environment designer who removes barriers and amplifies strengths; co-regulator',
      social_emphasis: 'mixed',
      outdoor_time: 'regular',
      arts_emphasis: 'integrated',
      academic_pace: 'standard',
    },
    quality_markers: [
      'Universal Design for Learning (UDL) framework implemented across all subjects',
      'Sensory needs proactively addressed (not just in crisis)',
      'Special interests are leveraged as motivational and learning tools, not restricted as "rewards"',
      'Neurodivergent staff and consultants are part of the team',
      'Identity-affirming culture where neurological differences are discussed openly and positively',
    ],
    red_flags: [
      'Goal of "making the child indistinguishable from peers" (this is masking, not support)',
      'Restricting special interests as a behavioral contingency',
      'No sensory accommodations available or requiring a diagnosis to access them',
      'ABA-based compliance training disguised as "neurodiversity-affirming"',
      'Exclusively deficit-focused IEP goals with no strength-based objectives',
    ],
    famous_examples: [
      'Bridges Academy (Studio City, CA) — school designed for twice-exceptional learners',
      'Nest+m and ASD Nest program (New York City public schools)',
      'Millennium School (San Francisco, CA) — neurodiversity-inclusive middle school',
      'Microsoft\'s Neurodiversity Hiring Program',
    ],
    cost_range: '$0 for public school accommodations (IEP/504); $20,000–$55,000/year for specialized private schools; OT and support services $100–$250/session',
    availability: 'Neurodiversity-affirming language is increasingly common but genuine implementation varies enormously. Specialized schools for 2e and neurodivergent learners exist in major cities. Public schools are legally required to provide accommodations (IDEA, Section 504) but quality of implementation depends heavily on the school. Occupational therapy, speech-language pathology, and educational psychology services are widely available but often expensive without insurance.',
  },

  // =========================================================================
  // 34. BILINGUAL EDUCATION
  // =========================================================================
  edu_bilingual: {
    age_stages: [
      {
        age_label: 'Infant (0–2)',
        age_min: 0,
        age_max: 2,
        focus: 'Simultaneous language exposure from birth; phonemic awareness in both languages',
        activities: [
          'Each caregiver consistently speaks their own language (one-parent-one-language or OPOL)',
          'Songs, nursery rhymes, and lullabies in both languages',
          'Narrating daily routines in the minority language',
          'Board books and picture books in both languages',
        ],
        parent_role: 'Consistent language model — the quality and quantity of input in each language determines development',
        environment: 'Home where both languages are heard naturally; caregivers or community providing minority language input',
      },
      {
        age_label: 'Early Childhood (3–6)',
        age_min: 3,
        age_max: 6,
        focus: 'Building fluency in both languages; early literacy in the dominant language',
        activities: [
          'Dual-language preschool or immersion preschool',
          'Storytelling in both languages with the same book',
          'Play dates and community events in the minority language',
          'Songs, games, and media in the minority language',
          'Pre-literacy activities (letter recognition, phonics) in both languages',
        ],
        parent_role: 'Language environment architect who ensures sufficient input in the minority language (minimum 30% of waking hours)',
        environment: 'Dual-language school or heritage language school; community connections for minority language use',
      },
      {
        age_label: 'Elementary (6–12)',
        age_min: 6,
        age_max: 12,
        focus: 'Academic language development in both languages; cross-linguistic transfer',
        activities: [
          'Reading and writing in both languages',
          'Content-area instruction in the minority language (math in Spanish, science in Mandarin, etc.)',
          'Comparing grammar and vocabulary across languages (metalinguistic awareness)',
          'Cultural experiences connected to each language (travel, cultural events, correspondence)',
        ],
        parent_role: 'Consistency keeper who maintains minority language use at home even when the child prefers the majority language',
        environment: 'Dual-language or immersion school; after-school heritage language programs; summer immersion camps',
      },
      {
        age_label: 'Adolescent (13–18)',
        age_min: 13,
        age_max: 18,
        focus: 'Academic and professional proficiency; bilingual identity pride',
        activities: [
          'Advanced academic coursework in the second language (AP, IB)',
          'Literature and media consumption in both languages',
          'Travel or exchange programs in the minority language country',
          'Bilingual community service or internships',
          'Formal certification (DELE, HSK, DELF, etc.)',
        ],
        parent_role: 'Motivation sustainer who helps the teen see bilingualism as a cognitive, cultural, and career advantage',
        environment: 'Continued academic and social use of both languages; connections to the heritage culture',
      },
    ],
    daily_routines: [
      {
        age_label: 'Dual-Language Elementary (6–10)',
        schedule: [
          { time: '08:30', activity: 'Morning meeting (Language A)', description: 'Greeting, calendar, and community building conducted entirely in Language A' },
          { time: '09:00', activity: 'Literacy block (Language A)', description: 'Reading and writing instruction in Language A with culturally relevant texts' },
          { time: '10:15', activity: 'Math (Language B)', description: 'Mathematics instruction conducted entirely in Language B — content becomes the vehicle for language acquisition' },
          { time: '11:15', activity: 'Specials (alternating languages)', description: 'Art, music, or PE taught in alternating languages by week' },
          { time: '12:00', activity: 'Lunch (free language choice)', description: 'Social time; children naturally code-switch and play in both languages' },
          { time: '12:45', activity: 'Science/Social Studies (Language B)', description: 'Content instruction in Language B with visual supports and hands-on activities' },
          { time: '14:00', activity: 'Bridge time', description: 'Explicit cross-linguistic connections: "We call this ___ in English and ___ in Spanish. Notice how..."' },
        ],
      },
      {
        age_label: 'OPOL Home Routine (0–5)',
        schedule: [
          { time: '07:00', activity: 'Morning with Parent A', description: 'Wake-up, breakfast, and morning routine conducted in Language A by that parent' },
          { time: '08:30', activity: 'Minority language preschool/caregiver', description: 'Drop-off at immersion preschool or with a caregiver who speaks the minority language' },
          { time: '15:00', activity: 'Afternoon with Parent B', description: 'Pick-up, snack, and afternoon activities in Language B' },
          { time: '17:30', activity: 'Family dinner', description: 'Family meal where both languages are used naturally; each parent speaks their language' },
          { time: '18:30', activity: 'Bedtime routine (alternating)', description: 'Stories and songs alternate by night: Monday/Wednesday/Friday in Language A, other nights in Language B' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'involved',
      materials_needed: [
        'Children\'s books in both languages (aim for 50+ per language over time)',
        'Music and audiobooks in the minority language',
        'Media access in both languages (streaming services with language options)',
        'Bilingual dictionary appropriate to age',
        'Flashcards or language-learning apps for older children (Duolingo, Gus on the Go for little ones)',
        'Cultural items from the heritage culture (maps, art, recipes)',
      ],
      weekly_rhythm: 'Consistent daily language exposure schedule (OPOL, time-and-place, or minority-language-at-home strategy); minority language reading daily; one cultural activity per week in the minority language; regular contact with minority language speakers (family, community, video calls); assess and adjust balance quarterly',
      starter_activities: [
        { name: 'One Parent One Language (OPOL)', age_range: '0–6', description: 'Each parent consistently speaks only their language to the child. The child will respond in whichever language is easier at first — that\'s fine. Stay consistent. The passive language will activate.', materials: 'Commitment and consistency from each parent' },
        { name: 'Bilingual Story Time', age_range: '2–8', description: 'Read the same story in both languages across the week. Monday–Wednesday in Language A, Thursday–Saturday in Language B. Discuss differences in expression and vocabulary. Children love finding the "same" story in a new language.', materials: 'Same book in both languages (many picture books are translated)' },
        { name: 'Minority Language Playdates', age_range: '3–12', description: 'Find other families raising bilingual children in the same minority language. Schedule regular playdates where the social language is the minority language. Peer motivation is the most powerful force.', materials: 'Community connections — try heritage language schools, cultural associations, or online parent groups' },
        { name: 'Kitchen Language Lab', age_range: '4–14', description: 'Cook recipes from the heritage culture together, doing all instruction and conversation in the minority language. Food vocabulary is concrete, repetitive, and motivating. Create a bilingual recipe book.', materials: 'Ingredients for heritage recipes, recipe cards' },
      ],
      books_for_parents: [
        { title: 'The Bilingual Edge', author: 'Kendall King & Alison Mackey', why: 'Research-based and practical — addresses every common worry about bilingual parenting' },
        { title: 'Raising a Bilingual Child', author: 'Barbara Zurer Pearson', why: 'Linguist-written guide covering OPOL, minority language at home, and other strategies with clear evidence' },
        { title: 'Bilingual: Life and Reality', author: 'François Grosjean', why: 'Debunks myths about bilingualism from the world\'s leading bilingualism researcher' },
      ],
      common_mistakes: [
        'Switching to the majority language when the child struggles — consistency in the minority language is critical',
        'Expecting equal proficiency in both languages at all times — dominance shifts are normal',
        'Correcting grammar too aggressively, which discourages the child from speaking the minority language',
        'Underestimating the amount of input needed — the minority language needs at least 25–30% of waking hours',
        'Giving up during the "I don\'t want to speak X" phase (usually ages 5–8) — this is normal and temporary with persistence',
      ],
    },
    research: {
      key_studies: [
        { title: 'The Bilingual Advantage in Executive Function', year: 2010, finding: 'Bialystok demonstrated that bilingual children show enhanced executive function, cognitive flexibility, and attentional control compared to monolingual peers' },
        { title: 'Dual Language Education: A Promising Approach (RAND)', year: 2017, finding: 'Steele et al. found that Portland dual-language immersion students outperformed peers in reading by 7 months and in math by 9 months by 8th grade — in both languages' },
        { title: 'The Critical Period Hypothesis and Age Effects in Second Language Acquisition', year: 2018, finding: 'Hartshorne, Tenenbaum & Pinker analyzed 670,000 participants and confirmed that language-learning ability declines sharply after age 17, supporting early bilingual education' },
        { title: 'One Parent One Language: A Meta-Analysis', year: 2020, finding: 'OPOL strategy was found effective for bilingual development when the minority language parent provides at least 30% of total input, especially with community language support' },
      ],
      outcome_evidence: 'Strong evidence from the RAND study and meta-analyses that dual-language education produces superior academic outcomes in BOTH languages compared to English-only instruction. Bilingual children consistently show advantages in executive function, metalinguistic awareness, and cognitive flexibility. Benefits extend to cross-cultural competence and career outcomes. The "bilingual penalty" (temporary vocabulary lag in each language around age 4–5) resolves by age 7–8 and total vocabulary across both languages exceeds monolingual norms.',
      criticism_summary: 'The bilingual executive function advantage has been contested by some researchers who find inconsistent effects. Quality of bilingual education programs varies widely — poorly implemented programs can leave students semi-proficient in both languages. Access to dual-language programs is inequitable (often favoring affluent families). Heritage language maintenance requires significant family commitment. Some worry bilingual education delays English acquisition, though evidence contradicts this.',
    },
    comparison: {
      screen_time: 'integrated',
      homework_stance: 'moderate',
      assessment_method: 'Assessment in both languages; standardized tests offered in the student\'s stronger language; portfolio of bilingual work',
      teacher_role: 'Fluent bilingual model who separates languages clearly and bridges cross-linguistic connections',
      social_emphasis: 'community',
      outdoor_time: 'regular',
      arts_emphasis: 'integrated',
      academic_pace: 'standard',
    },
    quality_markers: [
      'True 50/50 or 90/10 language allocation model with clear separation (not random mixing)',
      'Teachers are native or near-native speakers of their instructional language',
      'Both languages have equal status and prestige in the school culture',
      'Cross-linguistic transfer is explicitly taught ("bridge" time)',
      'Assessment occurs in both languages, not only in English',
    ],
    red_flags: [
      'Second language used only for "specials" or limited vocabulary (tokenistic bilingualism)',
      'Teachers not fluent in the second language of instruction',
      'English treated as superior — minority language used only in remedial contexts',
      'No assessment of minority language proficiency',
      'Children discouraged from using their home language at school',
    ],
    famous_examples: [
      'Oyster-Adams Bilingual School (Washington, DC) — 50/50 Spanish-English since 1971',
      'International School of the Peninsula (Palo Alto, CA) — French-English and Mandarin-English',
      'Utah Dual Language Immersion Program — statewide public school initiative in 6 languages',
      'PS 84 (New York City) — public dual-language school',
    ],
    cost_range: '$0 for public dual-language programs; $15,000–$40,000/year for private bilingual schools; heritage language weekend schools $500–$3,000/year',
    availability: 'Expanding rapidly in the US: 3,600+ dual-language programs as of 2023. Spanish-English is most common, followed by Mandarin-English, French-English, and Arabic-English. Public programs are available in most states but often have waitlists. Utah, North Carolina, and Delaware have statewide immersion programs. Heritage language weekend schools available in most cities for Korean, Japanese, Hindi, Russian, and many other languages.',
  },

  // =========================================================================
  // 35. ARTS INTEGRATION
  // =========================================================================
  edu_arts_integration: {
    age_stages: [
      {
        age_label: 'Early Childhood (3–5)',
        age_min: 3,
        age_max: 5,
        focus: 'Creative expression as primary learning modality; process over product',
        activities: [
          'Painting and drawing to tell stories and express feelings',
          'Singing and rhythm games that teach counting, patterns, and language',
          'Dramatic play that builds vocabulary and social understanding',
          'Dance and movement to explore spatial concepts and body awareness',
          'Collage and sculpture using recycled materials',
        ],
        parent_role: 'Appreciator who values the process and asks "Tell me about this" rather than "What is it?"',
        environment: 'Rich with diverse art materials; walls display children\'s work; music and movement space available',
      },
      {
        age_label: 'Elementary (6–10)',
        age_min: 6,
        age_max: 10,
        focus: 'Using arts as entry points to academic content across subjects',
        activities: [
          'Learning fractions through music (quarter notes, half notes, time signatures)',
          'Writing through drama (improvising scenes, then writing the script)',
          'Science illustration and observational drawing',
          'History through tableaux vivants (frozen scenes) and role-play',
          'Math through pattern design, tessellation art, and geometry quilts',
        ],
        parent_role: 'Connection-maker who asks "How could you draw/sing/act that out?" when academic content is challenging',
        environment: 'Classroom where art-making is embedded in every subject, not confined to a weekly "art class"',
      },
      {
        age_label: 'Middle & High School (11–18)',
        age_min: 11,
        age_max: 18,
        focus: 'Arts as tools for critical thinking, identity expression, and interdisciplinary mastery',
        activities: [
          'Documentary filmmaking to explore social studies themes',
          'Data visualization through graphic design and infographics',
          'Poetry and spoken word to process literature and history',
          'Musical composition to understand physics of sound',
          'Theater production integrating writing, design, math (budgeting), and collaboration',
        ],
        parent_role: 'Supporter who values arts as rigorous intellectual work, not a "soft" elective',
        environment: 'Studios, stages, and labs where arts and academics are genuinely intertwined',
      },
    ],
    daily_routines: [
      {
        age_label: 'Arts-Integrated Elementary (6–10)',
        schedule: [
          { time: '08:30', activity: 'Morning meeting with music', description: 'Greeting song, rhythm pattern warm-up, and agenda review' },
          { time: '09:00', activity: 'Literacy through drama', description: 'Read-aloud followed by reader\'s theater or tableau — embodying characters deepens comprehension' },
          { time: '10:00', activity: 'Math through visual art', description: 'Geometry through tessellation design, fractions through music notation, or data through sculpture' },
          { time: '11:00', activity: 'Movement break', description: 'Dance or creative movement connected to the morning\'s themes' },
          { time: '11:30', activity: 'Science with observational drawing', description: 'Scientific illustration: draw what you see under the microscope, in the garden, or during an experiment' },
          { time: '12:15', activity: 'Lunch & free art time', description: 'Open art studio available during free time' },
          { time: '13:00', activity: 'Social studies through arts', description: 'History explored through visual art, music of the period, dramatic re-enactment, or documentary creation' },
          { time: '14:15', activity: 'Reflection & portfolio', description: 'Students add to their arts-integrated portfolio and reflect on what art-making helped them understand' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'easy',
      materials_needed: [
        'Quality art supplies: watercolors, tempera paint, oil pastels, clay, good paper',
        'Musical instruments: ukulele, hand drum, recorder, xylophone',
        'Dress-up clothes and props for dramatic play',
        'Blank journals/sketchbooks',
        'Digital tools: camera, simple video editing app, audio recorder',
        'Books about artists, musicians, and performers from diverse cultures',
      ],
      weekly_rhythm: 'Daily art-making (even 20 minutes); connect every homework or learning topic to an art form at least once; one family art experience per week (museum, concert, community theater, or home art night); keep a family art journal or portfolio',
      starter_activities: [
        { name: 'Fraction DJ', age_range: '7–12', description: 'Use a free music app (GarageBand) to create beats. Each measure is 1 whole. Quarter notes are 1/4. Half notes are 1/2. Build drum patterns that add up to exactly one measure. Fractions become intuitive.', materials: 'Tablet with GarageBand or similar, headphones' },
        { name: 'Science Illustration Journal', age_range: '5–14', description: 'For every science topic, draw it before reading about it, then draw it again after. Compare the two drawings. The gaps between "what I thought" and "what I learned" make understanding visible.', materials: 'Sketchbook, colored pencils, magnifying glass' },
        { name: 'History Tableaux', age_range: '6–14', description: 'After reading about a historical event, family members freeze into a "living painting" of that moment. Hold the pose and discuss: What are you feeling? What happens next? Photography adds another layer.', materials: 'Simple props, camera' },
        { name: 'Poetry Math', age_range: '8–16', description: 'Write a poem where each line must have a syllable count that follows a mathematical pattern (Fibonacci: 1, 1, 2, 3, 5, 8...). This is called a Fib poem. It makes abstract number sequences concrete and creative.', materials: 'Paper, pencil' },
      ],
      books_for_parents: [
        { title: 'Studio Thinking 2.0: The Real Benefits of Visual Arts Education', author: 'Lois Hetland, Ellen Winner, Shirley Veenema & Kimberly Sheridan', why: 'The most rigorous research on what arts education actually teaches: persistence, observation, expression, and metacognition' },
        { title: 'The Arts and the Creation of Mind', author: 'Elliot Eisner', why: 'Stanford professor makes the case that arts develop forms of thinking that no other discipline can' },
        { title: 'Creative Confidence: Unleashing the Creative Potential Within Us All', author: 'Tom Kelley & David Kelley', why: 'IDEO founders show how creative thinking (built through arts) transfers to every domain of life' },
      ],
      common_mistakes: [
        'Treating arts integration as "fun add-ons" rather than rigorous learning tools',
        'Doing art projects ABOUT a topic without genuine artistic learning (decorating a diorama is not arts integration)',
        'Valuing product over process — the learning is in the making, not the final piece',
        'Limiting arts to visual art and neglecting music, drama, dance, and digital media',
        'Cutting arts time when academic scores dip — this removes the very tool that could help',
      ],
    },
    research: {
      key_studies: [
        { title: 'Champions of Change: The Impact of the Arts on Learning', year: 1999, finding: 'Fiske compiled evidence from seven major studies showing that arts-integrated education improved academic achievement, engagement, and equity — particularly for low-income students' },
        { title: 'Third Space: When Learning Matters (Chicago Arts Partnerships in Education)', year: 2006, finding: 'Catterall found that arts-integrated schools in Chicago closed the achievement gap between low-income and affluent students in reading and math' },
        { title: 'The Arts and Achievement in At-Risk Youth (NEA Report)', year: 2012, finding: 'Catterall analyzed 12 years of data showing that arts-engaged low-SES students were 3x more likely to earn a bachelor\'s degree than arts-deprived peers' },
        { title: 'How the Arts Develop the Young Brain (Dana Foundation)', year: 2008, finding: 'Neuroimaging studies showed that music training strengthened reading networks, drama improved verbal memory, and dance enhanced spatial reasoning' },
        { title: 'Arts Integration and STEAM: Effects on Student Learning', year: 2019, finding: 'Graham & Brouillette found that arts-integrated science instruction produced significantly higher content knowledge and retention than conventional science instruction' },
      ],
      outcome_evidence: 'Robust evidence that arts integration improves academic achievement (particularly reading and math), student engagement, creative thinking, and school completion rates. Effects are strongest for low-income and minority students — arts integration is one of the most evidence-based equity interventions available. Longitudinal NEA data shows arts-engaged students from low-SES backgrounds have dramatically better life outcomes.',
      criticism_summary: 'Implementation quality varies enormously — many programs use arts superficially. Teaching artists and classroom teachers often struggle to collaborate effectively. Assessment of arts learning is difficult to standardize. Budget pressures consistently threaten arts programming. Some critics argue correlation between arts engagement and outcomes reflects selection bias (engaged families choose arts), though quasi-experimental designs have addressed this.',
    },
    comparison: {
      screen_time: 'limited',
      homework_stance: 'minimal',
      assessment_method: 'Portfolio-based; performance assessments; rubrics for both artistic and academic learning',
      teacher_role: 'Interdisciplinary facilitator who partners with teaching artists to connect arts and academic content',
      social_emphasis: 'community',
      outdoor_time: 'regular',
      arts_emphasis: 'central',
      academic_pace: 'standard',
    },
    quality_markers: [
      'Arts are genuinely integrated into academic content, not separate add-on classes',
      'Professional teaching artists collaborate with classroom teachers',
      'Students create, perform, and reflect — not just consume art',
      'Multiple art forms represented: visual, musical, dramatic, literary, and movement',
      'Assessment captures both artistic growth and academic understanding',
    ],
    red_flags: [
      'Art used as decoration or reward rather than a learning tool',
      'Only visual art is present — no music, drama, or dance',
      'Teaching artists work in isolation without connecting to academic curriculum',
      'Art time is first to be cut during testing season',
      'Student art is template-based (everyone makes the same thing) with no creative choice',
    ],
    famous_examples: [
      'A+ Schools Program (North Carolina) — statewide arts-integrated school network',
      'Chicago Arts Partnerships in Education (CAPE)',
      'Bates Middle School (Annapolis, MD) — whole-school arts integration model',
      'The Kennedy Center\'s Changing Education Through the Arts (CETA) program',
    ],
    cost_range: '$0 for public arts-integrated schools; $12,000–$30,000/year for arts-focused private schools; community arts programs $500–$3,000/year',
    availability: 'Arts-integrated public schools exist in most states, with strong concentrations in North Carolina, Maryland, and Illinois. Many progressive and charter schools incorporate arts integration. The Kennedy Center provides training nationwide. Home implementation is very accessible — the key is habit, not expense. Community arts organizations offer low-cost classes in every US city.',
  },

  // =========================================================================
  // 36. MOVEMENT-BASED EDUCATION
  // =========================================================================
  edu_movement: {
    age_stages: [
      {
        age_label: 'Infant (0–1)',
        age_min: 0,
        age_max: 1,
        focus: 'Free movement on the floor; developing motor milestones naturally',
        activities: [
          'Tummy time in varied environments',
          'Reaching, grasping, and mouthing objects of different textures',
          'Rolling, scooting, and crawling over safe obstacles',
          'Baby-led movement (following Pikler principles — no propping, walkers, or positioning in unsupported sitting)',
        ],
        parent_role: 'Observer who provides a safe floor environment and resists the urge to prop, position, or rush milestones',
        environment: 'Clean floor space with simple objects to reach for; natural light; no containers (bouncers, swings, walkers) for extended periods',
      },
      {
        age_label: 'Toddler (1–3)',
        age_min: 1,
        age_max: 3,
        focus: 'Gross motor development through climbing, carrying, balancing, and rhythmic movement',
        activities: [
          'Climbing stairs, low structures, and boulders',
          'Carrying heavy objects (water pitchers, grocery bags)',
          'Dancing and moving to varied music',
          'Obstacle courses with balance beams, tunnels, and stepping stones',
          'Sand, water, and mud play requiring whole-body engagement',
        ],
        parent_role: 'Course-setter who creates challenging but safe movement opportunities and steps back',
        environment: 'Indoor movement space with climbing structures; outdoor access to varied terrain (hills, sand, grass, mud)',
      },
      {
        age_label: 'Early Childhood (3–6)',
        age_min: 3,
        age_max: 6,
        focus: 'Learning academic concepts through the body; refining coordination and body awareness',
        activities: [
          'Learning letters by forming them with the body or tracing them in sand',
          'Counting through jumping, clapping, and rhythmic patterns',
          'Cross-lateral movements (Brain Gym-style) before academic work',
          'Yoga poses that teach spatial vocabulary (over, under, beside, through)',
          'Cooperative movement games that teach turn-taking and social skills',
        ],
        parent_role: 'Facilitator who embeds academic content into movement activities instead of desk work',
        environment: 'Open space (indoor or outdoor) for large motor work; minimal furniture; materials that invite physical engagement',
      },
      {
        age_label: 'School Age (6–12)',
        age_min: 6,
        age_max: 12,
        focus: 'Movement as a learning strategy for all academic content; physical literacy',
        activities: [
          'Math through body measurement, pacing distances, and kinesthetic geometry',
          'Spelling and vocabulary through full-body letter formation or movement sequences',
          'Science through physical experiments (forces, levers, pulleys with the body)',
          'History through dance forms from studied periods and cultures',
          'Organized sports with emphasis on fundamental movement skills over competition',
        ],
        parent_role: 'Advocate who insists on adequate recess and movement in the school day; active family culture',
        environment: 'Classroom with flexible seating, standing desks, movement breaks; access to gym, playground, and outdoor spaces',
      },
    ],
    daily_routines: [
      {
        age_label: 'Movement-Based Preschool (3–5)',
        schedule: [
          { time: '08:30', activity: 'Active arrival', description: 'Children choose from movement stations: climbing wall, balance beam, trampoline, dance area' },
          { time: '09:00', activity: 'Circle movement', description: 'Warm-up with yoga, cross-lateral exercises, and rhythm patterns. These prepare the brain for learning.' },
          { time: '09:30', activity: 'Kinesthetic literacy', description: 'Letters and sounds taught through full-body formation, sand writing, and movement songs' },
          { time: '10:15', activity: 'Outdoor movement exploration', description: 'Free play focused on running, climbing, jumping, and navigating natural obstacles' },
          { time: '11:00', activity: 'Math through movement', description: 'Counting jumps, measuring with body lengths, pattern walks, shape hunts' },
          { time: '11:30', activity: 'Creative movement & music', description: 'Guided improvisational movement, dance, or creative drama' },
          { time: '12:00', activity: 'Lunch & calm movement', description: 'After eating, gentle yoga or stretching to transition to rest' },
          { time: '12:30', activity: 'Rest & fine motor', description: 'Rest time followed by fine motor work: threading, cutting, drawing, clay' },
        ],
      },
      {
        age_label: 'Movement-Integrated Elementary (6–10)',
        schedule: [
          { time: '08:30', activity: 'Morning movement', description: '15-minute brain-body warm-up: cross-lateral exercises, balance challenges, rhythmic clapping' },
          { time: '08:50', activity: 'Literacy with movement', description: 'Active reading strategies (act out scenes, movement vocabulary), standing writing stations' },
          { time: '10:00', activity: 'Movement break', description: 'Structured outdoor play or gym time — not optional, not removable as punishment' },
          { time: '10:30', activity: 'Math through body', description: 'Geometry with body angles, multiplication hopscotch, number line walks' },
          { time: '11:30', activity: 'Recess', description: 'Free, unstructured outdoor movement — minimum 30 minutes' },
          { time: '12:00', activity: 'Lunch', description: 'Shared meal with movement-free rest afterward for those who need it' },
          { time: '12:45', activity: 'Science/social studies with kinesthetic activities', description: 'Physical models, simulations, and experiments; field work and nature walks' },
          { time: '14:00', activity: 'Closing movement ritual', description: 'Calming yoga or stretching to transition to end of day' },
        ],
      },
    ],
    home_guide: {
      difficulty: 'easy',
      materials_needed: [
        'Balance beam (a 2x4 board on the ground works perfectly)',
        'Mini trampoline or jumping mat',
        'Climbing structure (indoor doorway pull-up bar with gymnastic rings, or outdoor play structure)',
        'Yoga mat',
        'Balls of various sizes',
        'Jump rope',
        'Sidewalk chalk for outdoor games',
        'Open floor space (clear a room if needed)',
      ],
      weekly_rhythm: 'Movement before every focused learning activity (even 5 minutes of jumping jacks); 60+ minutes of vigorous physical activity daily; mix structured movement (yoga, dance class) with unstructured play; family movement on weekends (hikes, bike rides, swimming); minimize sedentary screen time',
      starter_activities: [
        { name: 'Alphabet Yoga', age_range: '3–6', description: 'Make each letter of the alphabet with your body. "T" is easy (arms out). "C" is a side bend. Take photos and create an alphabet book of body letters. Combine with phonics: make the letter and say the sound.', materials: 'Camera, open space, alphabet reference' },
        { name: 'Multiplication Hopscotch', age_range: '6–10', description: 'Draw a hopscotch grid with products of a times table (e.g., 7, 14, 21, 28...). Call out a multiplication problem; the child jumps to the answer. Physical engagement anchors abstract math facts in body memory.', materials: 'Sidewalk chalk, outdoor space' },
        { name: 'Cross-Lateral Brain Warm-Up', age_range: '4–12', description: 'Before homework: 2 minutes of cross-body movements. Touch right hand to left knee, left hand to right knee. Do "lazy 8s" (figure-8 tracing) with each hand. These activate both hemispheres and improve focus.', materials: 'None' },
        { name: 'Science Freeze Dance', age_range: '4–8', description: 'Play music and dance. When it stops, call out a science concept: "Show me how a seed grows!" "Be a planet orbiting the sun!" "Move like water evaporating!" Embodying concepts builds understanding.', materials: 'Music player, space to dance' },
      ],
      books_for_parents: [
        { title: 'Spark: The Revolutionary New Science of Exercise and the Brain', author: 'John J. Ratey', why: 'The definitive case that movement is the single most powerful tool for cognitive function, attention, and mood' },
        { title: 'Smart Moves: Why Learning Is Not All in Your Head', author: 'Carla Hannaford', why: 'Neuroscientist shows how movement activates neural pathways for learning — practical exercises included' },
        { title: 'Balanced and Barefoot: How Unrestricted Outdoor Play Makes for Strong, Confident, and Capable Children', author: 'Angela Hanscom', why: 'Occupational therapist documents the movement crisis in modern childhood and what to do about it' },
      ],
      common_mistakes: [
        'Using movement only as a "brain break" between real learning instead of AS a learning tool',
        'Restricting recess or movement as a behavioral consequence — this removes the regulation tool the child needs most',
        'Confusing organized sports with movement-based education — sports are a subset, not the whole picture',
        'Believing that once children can sit still, they no longer need movement for learning (they always do)',
        'Expecting children to be still and focused without providing movement first — this is neurologically unrealistic before age 7',
      ],
    },
    research: {
      key_studies: [
        { title: 'Physical Activity and Academic Achievement: A Meta-Analysis', year: 2019, finding: 'Alvarez-Bueno et al. found that physical activity programs, especially those integrated into academic lessons, significantly improved math and reading achievement with no loss of instructional time' },
        { title: 'The Naperville Model: Exercise and Academic Performance', year: 2008, finding: 'Ratey documented that Naperville Central High School\'s "Learning Readiness PE" program (intense exercise before class) moved students from below average to near the top of international TIMSS scores in science' },
        { title: 'Active Classrooms: Physical Activity and Student Achievement', year: 2015, finding: 'Donnelly et al. (PAAC trial) found that 90 minutes/week of physically active academic lessons improved BMI and academic achievement simultaneously over 3 years' },
        { title: 'Recess and Children\'s Self-Regulation', year: 2009, finding: 'Pellegrini showed that recess timing directly affects attention: children are significantly more attentive after recess, with the effect stronger for children with attention difficulties' },
        { title: 'Embodied Cognition and Mathematics Learning', year: 2014, finding: 'Alibali & Nathan found that students who used gestures and body movements while learning math concepts showed deeper understanding and better transfer than those who learned through visual/verbal methods alone' },
      ],
      outcome_evidence: 'Overwhelming evidence that physical activity improves academic achievement, attention, executive function, and memory. The Naperville study is a landmark: structured exercise before class moved a low-performing school district to near the top of international rankings. Meta-analyses consistently show that adding movement to academics improves outcomes without reducing instructional time. The benefits are largest for children with ADHD and attention difficulties.',
      criticism_summary: 'Implementation challenges include teacher training (most teachers are not trained in kinesthetic pedagogy), space requirements, noise concerns in shared buildings, difficulty assessing learning through movement, and the perception that movement is not "serious" academics. Some researchers caution against specific programs like Brain Gym whose claimed mechanisms lack evidence, even if physical activity benefits are real.',
    },
    comparison: {
      screen_time: 'avoids',
      homework_stance: 'minimal',
      assessment_method: 'Performance-based demonstrations; movement portfolios; observation of physical literacy development',
      teacher_role: 'Movement facilitator who teaches academic content through the body and designs active learning experiences',
      social_emphasis: 'community',
      outdoor_time: 'central',
      arts_emphasis: 'integrated',
      academic_pace: 'gradual',
    },
    quality_markers: [
      'Movement is embedded throughout the academic day, not confined to PE or recess',
      'Children have 60+ minutes of physical activity daily, including unstructured play',
      'Teachers use kinesthetic strategies for core academic content',
      'Recess and movement are never withheld as punishment',
      'Fundamental movement skills (balance, coordination, spatial awareness) are explicitly taught',
    ],
    red_flags: [
      'Children seated at desks for more than 30 minutes at a stretch (ages 3–8)',
      'Recess reduced below 20 minutes or eliminated for test prep',
      'Movement only happens during PE class, which meets once or twice a week',
      'Physical activity used as punishment (running laps for misbehavior)',
      'No outdoor access or natural play spaces',
    ],
    famous_examples: [
      'Naperville Central High School (Naperville, IL) — Learning Readiness PE model',
      'SPARK (Sports, Play, and Active Recreation for Kids) program',
      'Moving Smart (New Zealand) — neurodevelopmental movement program',
      'BOKS (Build Our Kids\' Success) by Reebok — before-school movement program in 3,000+ US schools',
    ],
    cost_range: '$0 for home implementation and public school advocacy; BOKS program is free; private movement-focused programs $5,000–$18,000/year',
    availability: 'Movement-based education is more a practice philosophy than a program — any school or home can adopt it. SPARK and BOKS programs are available in thousands of US schools. Dedicated movement-based schools are rare, but Waldorf and forest schools heavily incorporate movement. Occupational therapists and pediatric movement specialists are available in most US cities for consultation.',
  },
};
