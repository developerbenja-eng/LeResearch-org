/**
 * Developmental Science Seed Data
 * The neuroscience and research behind WHY education systems choose specific age transitions.
 *
 * Cross-cutting reference: not about any single system, but about what happens
 * in child development at key ages that explains the structural choices every
 * system makes (or debates).
 *
 * For Echo Tales: helps parents understand the "why" behind age-based
 * recommendations, so they can make informed decisions about pacing,
 * structure level, and readiness — backed by developmental research.
 */

// ==================== Types ====================

export interface DevelopmentalResearcher {
  name: string;
  year: number | string; // string for ranges like '1969-1979'
  finding: string;
}

export interface BrainDevelopmentNote {
  region_or_process: string;
  what_happens: string;
  educational_implication: string;
}

export interface DevelopmentalMilestone {
  id: string;
  age_range: [number, number]; // [min, max] in years
  label: string;
  subtitle: string;
  summary: string;
  brain_development: BrainDevelopmentNote[];
  key_research: DevelopmentalResearcher[];
  educational_implications: string[];
  why_systems_agree: string[];
  why_systems_disagree?: string[];
  what_children_can_do: string[];
  what_children_cannot_yet_do: string[];
  tags: string[];
}

export interface CrossCuttingPrinciple {
  id: string;
  name: string;
  researchers: DevelopmentalResearcher[];
  summary: string;
  implications_for_education: string[];
  tags: string[];
}

// ==================== Milestones ====================

export const DEVELOPMENTAL_MILESTONES: DevelopmentalMilestone[] = [

  // =============================================
  // AGE 0-2: SENSORY / MOTOR / ATTACHMENT
  // =============================================
  {
    id: 'dev_0_2',
    age_range: [0, 2],
    label: 'Sensory-Motor & Attachment Foundation',
    subtitle: 'Why all systems agree on no formal instruction',
    summary:
      'The first two years are defined by explosive brain growth, attachment formation, and sensory-motor exploration. The brain forms synapses at up to 40,000 per second, reaching ~15,000 synapses per neuron by age 2-3 (Huttenlocher, 1979). Secure attachment to a primary caregiver is the single strongest predictor of later social, emotional, and cognitive health. No credible education system recommends formal academic instruction during this period because the brain is wiring itself through sensory experience, movement, and relational safety.',
    brain_development: [
      {
        region_or_process: 'Synaptogenesis',
        what_happens:
          'Synapses form at up to 40,000 per second from late gestation through age 2. By age 2-3, the brain has roughly 15,000 synapses per neuron — about twice the adult density. Auditory cortex peaks around 3 months postnatal; prefrontal cortex peaks after 15 months (Huttenlocher & Dabholkar, 1997).',
        educational_implication:
          'Rich sensory environments matter enormously. Varied sounds, textures, faces, and movement patterns feed synaptogenesis. Formal instruction is irrelevant — the brain is building infrastructure, not running programs.',
      },
      {
        region_or_process: 'Synaptic pruning onset',
        what_happens:
          'Pruning begins around age 2 and continues aggressively through age 10, eliminating roughly 50% of excess synapses. "Use it or lose it" — active synapses strengthen, inactive ones are eliminated.',
        educational_implication:
          'Repeated, consistent experiences shape which circuits survive. Neglect during this window has outsized negative effects because unused circuits are pruned away.',
      },
      {
        region_or_process: 'Myelination (early phase)',
        what_happens:
          'Myelin sheaths begin forming around sensory and motor pathways first, speeding neural transmission. Higher-order regions (prefrontal cortex) myelinate much later.',
        educational_implication:
          'Motor and sensory circuits are ready before cognitive control circuits. Movement and sensory exploration are not "pre-learning" — they are the learning.',
      },
      {
        region_or_process: 'Language circuits',
        what_happens:
          'Broca\'s and Wernicke\'s areas are highly active. Infants can distinguish all phonemes of all languages at birth but narrow to their native language(s) by 10-12 months (Kuhl, 2004). The language acquisition window is wide open.',
        educational_implication:
          'Talking, singing, and reading to infants has measurable impact on brain structure. Bilingual exposure during this window builds dual phonemic maps with no confusion cost.',
      },
    ],
    key_research: [
      {
        name: 'Huttenlocher',
        year: '1979, 1997',
        finding:
          'Mapped synaptic density across age in human cortex. Showed synaptic density peaks at age 2-3 (frontal cortex) and declines through adolescence to ~50% of peak by age 20.',
      },
      {
        name: 'Bowlby',
        year: '1969',
        finding:
          'Attachment Theory: infants are biologically predisposed to form attachments with caregivers. Secure attachment provides a "safe base" for exploration and is foundational to all later development.',
      },
      {
        name: 'Ainsworth',
        year: '1978',
        finding:
          'Strange Situation experiment classified attachment styles: ~65% secure, ~21% avoidant, ~14% resistant. Secure attachment predicted better social, emotional, and cognitive outcomes. Maternal sensitivity was the strongest predictor of attachment security.',
      },
      {
        name: 'Kuhl',
        year: '2004',
        finding:
          'Infants are "citizens of the world" for phoneme discrimination at birth but become language-specific listeners by 10-12 months. Social interaction (not recordings) drives phonemic learning.',
      },
      {
        name: 'Murray & Trevarthen',
        year: 1986,
        finding:
          'Demonstrated that infants as young as 2 months engage in "proto-conversations" with caregivers, showing turn-taking and emotional synchrony. Social interaction is not a luxury — it is a biological expectation.',
      },
    ],
    educational_implications: [
      'Responsive caregiving is the curriculum. Prompt, sensitive responses to infant cues build secure attachment and trust.',
      'Sensory-rich environments (varied textures, sounds, colors, movement) directly feed synaptogenesis.',
      'Talking and singing to infants builds language circuits — quantity and quality of language exposure both matter.',
      'Tummy time, crawling, reaching, and grasping are not just motor milestones — they drive cognitive development. Each month earlier a child stands independently correlates with ~0.3 IQ points at age 8.',
      'Screen time and passive media cannot substitute for live social interaction in language acquisition (Kuhl, 2004).',
    ],
    why_systems_agree: [
      'Every credible system (Montessori, Waldorf, Reggio, Finnish, Singaporean, etc.) agrees: no formal academics before age 2.',
      'The universal recommendation is responsive caregiving, sensory exploration, and attachment security.',
      'This consensus exists because the brain is in infrastructure-building mode — formal instruction has nothing to attach to yet.',
    ],
    what_children_can_do: [
      'Form secure attachments with consistent caregivers',
      'Discriminate all human phonemes (narrowing to native language by 12 months)',
      'Develop object permanence (Piaget\'s sensorimotor stage milestone)',
      'Crawl, stand, walk — each motor milestone opens new cognitive possibilities',
      'Engage in proto-conversations with turn-taking by 2-3 months',
      'Understand causality through repeated sensory-motor experiments',
      'Produce first words around 12 months, ~50 words by 18 months',
    ],
    what_children_cannot_yet_do: [
      'Regulate emotions independently — co-regulation with caregiver is required',
      'Understand symbolic representation (letters, numbers as abstract symbols)',
      'Sustain voluntary attention for more than seconds at a time',
      'Inhibit impulses — prefrontal cortex is barely beginning to myelinate',
      'Engage in pretend play (emerges around age 2)',
    ],
    tags: ['attachment', 'synaptogenesis', 'sensorimotor', 'language-acquisition', 'pruning'],
  },

  // =============================================
  // AGE 2-3: THE LANGUAGE EXPLOSION
  // =============================================
  {
    id: 'dev_2_3',
    age_range: [2, 3],
    label: 'The Language Explosion',
    subtitle: 'Vocabulary erupts, theory of mind begins, impulse control is minimal',
    summary:
      'Between 18 months and 3 years, vocabulary explodes from ~50 words to 1,000+ words through a process called "fast mapping" — learning new words after a single exposure. The brain\'s language networks are in overdrive. Theory of mind begins to emerge (children start recognizing that others have desires), but false-belief understanding won\'t arrive until ~age 4. The prefrontal cortex is still immature, meaning impulse control is very limited. Some systems introduce guided play here; none introduce formal instruction.',
    brain_development: [
      {
        region_or_process: 'Language network acceleration',
        what_happens:
          'Broca\'s area (production) and Wernicke\'s area (comprehension) show rapid myelination and increased connectivity. The arcuate fasciculus connecting them strengthens dramatically.',
        educational_implication:
          'Conversational interaction is the single most powerful intervention. Children learn ~10 new words per week during the explosion. Quality of adult speech (varied vocabulary, responsiveness) directly predicts vocabulary size.',
      },
      {
        region_or_process: 'Prefrontal cortex (early)',
        what_happens:
          'Still highly immature. Synaptic density is near peak but myelination is minimal. Executive functions are rudimentary at best.',
        educational_implication:
          'Expecting impulse control, turn-taking, or sustained attention is developmentally unrealistic. Tantrums are not misbehavior — they are a prefrontal cortex that cannot yet regulate emotion.',
      },
      {
        region_or_process: 'Temporal-parietal junction',
        what_happens:
          'Begins activating during social cognition tasks. This region underpins theory of mind — understanding that others have mental states.',
        educational_implication:
          'Children can understand that others have desires ("he wants the cookie") before they understand that others have beliefs ("he thinks the cookie is in the box"). Social play supports this emerging capacity.',
      },
    ],
    key_research: [
      {
        name: 'Fernald, Marchman & Weisleder',
        year: 2013,
        finding:
          'By age 2, there is already a 6-month gap in processing efficiency and vocabulary between children from high-talk vs low-talk homes. Early language environment predicts later academic outcomes.',
      },
      {
        name: 'Wellman & Liu',
        year: 2004,
        finding:
          'Established a developmental sequence for theory of mind: diverse desires (age 2-3) -> diverse beliefs (3-4) -> knowledge access (3-4) -> false belief (4-5) -> hidden emotion (5-6).',
      },
      {
        name: 'Carey',
        year: 1978,
        finding:
          'Documented "fast mapping" — children can learn the meaning of a new word after a single exposure, explaining the rapid vocabulary growth rate during this period.',
      },
      {
        name: 'Zelazo & Carlson',
        year: 2012,
        finding:
          'Distinguished "hot" executive functions (emotion-laden, reward-related) from "cool" ones (abstract, logical). Hot EF develops earlier and is centered in ventromedial prefrontal cortex; cool EF in dorsolateral PFC matures much later.',
      },
    ],
    educational_implications: [
      'Rich conversational environments accelerate the vocabulary explosion. Narrating activities, asking open questions, and expanding on child utterances are evidence-based strategies.',
      'Guided play (adult-structured but child-directed) becomes appropriate. Free play remains essential.',
      'Social interaction with peers supports emerging theory of mind, but adult mediation is necessary for conflict resolution — children cannot yet perspective-take reliably.',
      'Routines and predictability help compensate for weak executive function. External structure substitutes for internal regulation the child cannot yet provide.',
    ],
    why_systems_agree: [
      'No system recommends formal academics at this age.',
      'All systems emphasize language-rich environments and responsive adult interaction.',
    ],
    why_systems_disagree: [
      'Some systems (Montessori, RIE) begin introducing structured choice and practical life activities around 2-2.5.',
      'Others (Waldorf, some Scandinavian approaches) prefer entirely free, imaginative play until age 3 or later.',
      'The disagreement is about HOW MUCH adult structuring to add to play, not WHETHER to add formal instruction (no one does).',
    ],
    what_children_can_do: [
      'Learn ~10 new words per week during the vocabulary explosion',
      'Use 2-3 word sentences; grammar emerges spontaneously',
      'Understand that others have desires different from their own',
      'Engage in simple pretend play (feeding a doll, talking on a toy phone)',
      'Follow simple 2-step instructions',
      'Categorize objects by color, shape, or size with guidance',
    ],
    what_children_cannot_yet_do: [
      'Understand false beliefs ("Sally thinks the marble is in the basket")',
      'Inhibit strong impulses reliably — sharing is genuinely difficult, not defiance',
      'Sustain focused attention for more than a few minutes',
      'Understand abstract symbols (letters as sounds, numerals as quantities)',
      'Regulate emotional responses without adult co-regulation',
    ],
    tags: ['language-explosion', 'fast-mapping', 'theory-of-mind', 'guided-play', 'executive-function'],
  },

  // =============================================
  // AGE 3-5: THE GREAT DEBATE ZONE
  // =============================================
  {
    id: 'dev_3_5',
    age_range: [3, 5],
    label: 'The Great Debate Zone',
    subtitle: 'Where systems diverge most on structure vs play',
    summary:
      'Ages 3-5 are the most contested period in education. The brain is developing executive function rapidly but unevenly. Pretend play reaches its peak and drives cognitive, social, and emotional development. Theory of mind matures (false-belief understanding emerges around age 4). Finland and Waldorf say "no academics"; Singapore and some Montessori environments introduce structured literacy and numeracy. The research says both approaches can work — the mechanism is what matters, not the label.',
    brain_development: [
      {
        region_or_process: 'Prefrontal cortex (rapid growth)',
        what_happens:
          'Dorsolateral prefrontal cortex undergoes significant myelination between ages 3-5. Executive functions (working memory, inhibitory control, cognitive flexibility) improve dramatically but remain fragile and inconsistent.',
        educational_implication:
          'A 4-year-old can sometimes wait their turn, hold two ideas in mind, and switch between tasks — but not reliably, not under stress, and not for long. Curriculum must allow for this inconsistency.',
      },
      {
        region_or_process: 'Default mode network',
        what_happens:
          'The brain\'s "imagination network" is highly active during pretend play. Prefrontal regions, temporal lobes, and posterior cingulate cortex activate together during make-believe scenarios.',
        educational_implication:
          'Pretend play is not a break from learning — it exercises the same neural circuits used for planning, perspective-taking, and counterfactual reasoning. Eliminating play to "make room" for academics removes a primary cognitive training mechanism.',
      },
      {
        region_or_process: 'Hippocampus',
        what_happens:
          'Memory consolidation improves significantly. Episodic memory (memory for events and experiences) becomes more reliable. Children can narrate past events with increasing accuracy.',
        educational_implication:
          'Learning through stories and meaningful experiences is neurologically optimal. Abstract drill is less effective than embedding concepts in narrative and play contexts.',
      },
    ],
    key_research: [
      {
        name: 'Diamond & Lee',
        year: 2011,
        finding:
          'Comprehensive review showed that executive function in 4-5 year olds can be improved through curricula emphasizing self-regulation (Tools of the Mind, Montessori). Play-based programs were as effective as direct instruction programs at building EF — and had better transfer to novel tasks.',
      },
      {
        name: 'Lillard et al.',
        year: 2013,
        finding:
          'Review in Psychological Bulletin found evidence linking pretend play to executive function, but noted the causal direction is unclear. Play may build EF, or children with better EF may engage in richer play. Lillard concluded the evidence is suggestive but not yet definitive for a causal role.',
      },
      {
        name: 'Wellman, Cross & Watson',
        year: 2001,
        finding:
          'Meta-analysis of 178 studies confirmed that false-belief understanding emerges reliably around age 4 across cultures. Before age 3.5, children perform below chance on false-belief tasks; by age 5, they perform above chance consistently.',
      },
      {
        name: 'Vygotsky (ZPD framework)',
        year: 1978,
        finding:
          'The Zone of Proximal Development describes the gap between what a child can do independently and what they can achieve with guidance. At age 3, the ZPD is narrow — children need highly concrete, immediate scaffolding. By age 5, the ZPD widens — children can work with more abstract guidance and sustain collaborative problem-solving.',
      },
      {
        name: 'Hirsh-Pasek, Golinkoff & Eyer',
        year: 2003,
        finding:
          'Coined "playful learning" — distinguishing free play, guided play, and direct instruction. Found guided play (adult-structured, child-directed) produced better learning outcomes than either free play alone or direct instruction alone for preschoolers.',
      },
    ],
    educational_implications: [
      'The "academics vs play" framing is a false dichotomy. The best evidence supports "playful learning" — adult-structured environments where children direct their own exploration within meaningful constraints.',
      'Executive function is the strongest predictor of school readiness — stronger than IQ or early literacy. Programs that build self-regulation (through play, not worksheets) produce the best outcomes.',
      'Pretend play should be protected and supported, not replaced. It exercises planning, perspective-taking, emotional regulation, and narrative construction simultaneously.',
      'Formal reading instruction before age 5 shows no long-term advantage. New Zealand studies show children who start reading at 5 vs 7 are indistinguishable by age 11 — but early starters have worse attitudes toward reading.',
    ],
    why_systems_agree: [
      'All systems agree that 3-5 year olds need social interaction, play, and responsive adults.',
      'All systems acknowledge that executive function is developing rapidly and that some scaffolding is appropriate.',
    ],
    why_systems_disagree: [
      'Finland and Waldorf: No formal academics until age 6-7. Play IS the curriculum. Rationale: the prefrontal cortex is not ready for sustained formal tasks; early instruction risks burnout and negative associations with learning.',
      'Singapore and structured Montessori: Introduce phonics, numerals, and structured tasks from age 3-4. Rationale: children in this age range are in a "sensitive period" for language and order; structured exposure during this window is neurologically optimal.',
      'The disagreement is real and research does not decisively resolve it. Both approaches can produce good outcomes. The mechanism matters more than the label: are children engaged, autonomous, and building self-regulation?',
    ],
    what_children_can_do: [
      'Engage in complex pretend play with roles, rules, and narratives',
      'Understand false beliefs by age 4-5 ("Sally thinks the marble is where she left it")',
      'Count to 10-20 and understand one-to-one correspondence',
      'Recognize some letters and associate them with sounds (with exposure)',
      'Wait their turn — sometimes, with support, for short periods',
      'Sustain focused attention for 5-15 minutes on self-chosen activities',
      'Narrate past events and anticipate future ones',
    ],
    what_children_cannot_yet_do: [
      'Sustain effortful attention on adult-directed tasks for extended periods',
      'Think abstractly — all reasoning is tied to concrete, visible, tangible things',
      'Read fluently (some can decode, but comprehension-based reading comes later)',
      'Manage complex social conflicts independently',
      'Distinguish appearance from reality reliably',
    ],
    tags: ['executive-function', 'pretend-play', 'false-belief', 'ZPD', 'playful-learning', 'school-readiness'],
  },

  // =============================================
  // AGE 5-7: THE SCHOOL START CONTROVERSY
  // =============================================
  {
    id: 'dev_5_7',
    age_range: [5, 7],
    label: 'The School Start Controversy',
    subtitle: 'Why some countries start at 5 and others at 7',
    summary:
      'The age at which formal schooling begins varies from 4 (England) to 7 (Finland, Waldorf). This is the most politically charged age transition in education. Neuroscience shows that left-hemisphere lateralization for language accelerates between ages 5-7, white matter pathways for reading undergo critical myelination, and the brain shifts from bilateral to lateralized processing for language tasks. The Cambridge Primary Review (2009) and David Whitebread\'s research at Cambridge argue strongly that early formal instruction confers no lasting advantage and may cause harm. Longitudinal studies from New Zealand show no reading difference by age 11 between children who started at 5 vs 7 — but the late starters had better comprehension and more positive attitudes.',
    brain_development: [
      {
        region_or_process: 'Left-hemisphere lateralization',
        what_happens:
          'Between ages 3-6, the left hemisphere grows dramatically — this is the hemisphere typically dominant for language. Brain imaging shows a shift from no hemisphere dominance for language (age 6) to clear left-hemisphere dominance (age 8). This lateralization is necessary for efficient reading.',
        educational_implication:
          'Reading instruction before lateralization is complete is like building on wet concrete — it can work, but it requires more effort and the foundation may be less stable. This is why some children who "learn to read" at 4-5 are actually memorizing words visually (right hemisphere) rather than decoding phonemically (left hemisphere).',
      },
      {
        region_or_process: 'White matter pathways for reading',
        what_happens:
          'The arcuate fasciculus, inferior fronto-occipital fasciculus, and inferior longitudinal fasciculus all show significant myelination increases between ages 5-8. Fractional anisotropy (a measure of white matter integrity) in the left arcuate fasciculus at age 6 predicts reading outcomes 2 years later.',
        educational_implication:
          'The neural hardware for reading is being built during this window. Children whose white matter pathways are more mature will find reading easier — not because they are "smarter" but because the wiring is ready.',
      },
      {
        region_or_process: 'Prefrontal cortex (consolidation)',
        what_happens:
          'Executive functions become more reliable. Inhibitory control, working memory, and cognitive flexibility all show marked improvement. Children can sustain effortful attention for longer periods.',
        educational_implication:
          'By age 6-7, most children can handle the demands of a structured classroom: sitting, listening, following multi-step instructions, waiting. At age 4-5, many cannot — not because of poor parenting, but because of brain maturation timelines.',
      },
    ],
    key_research: [
      {
        name: 'Cambridge Primary Review (Alexander)',
        year: 2009,
        finding:
          'Major review of English primary education concluded that the early start age (4-5) in England was not supported by evidence. Recommended extending play-based learning and delaying formal instruction. Found that early formal schooling did not produce lasting academic advantages and risked negative attitudes toward learning.',
      },
      {
        name: 'Whitebread',
        year: '2009-2013',
        finding:
          'Director of Cambridge\'s PEDAL centre. Research showed that physical, constructional, and social play supports development of intellectual and emotional self-regulation — skills crucial for later academic success. Argued that early formal instruction substitutes adult-directed compliance for genuine self-regulation.',
      },
      {
        name: 'Suggate',
        year: 2012,
        finding:
          'Meta-analysis of 54 studies found no long-term benefit of learning to read at age 5 versus age 7. By age 11, early and late readers were indistinguishable in reading ability. Early starters showed poorer text comprehension and less positive attitudes toward reading.',
      },
      {
        name: 'Sylva et al. (EPPE study)',
        year: 2004,
        finding:
          'Longitudinal study of 3,000 UK children found that extended high-quality play-based preschool education improved academic outcomes and well-being through primary school. Benefits were especially strong for children from disadvantaged backgrounds. Quality mattered more than age of entry.',
      },
      {
        name: 'Kern & Friedman',
        year: 2009,
        finding:
          'Analysis of Terman longitudinal data found that children who entered school early (before age 6) showed higher mortality rates in adulthood, possibly mediated by stress and reduced social-emotional development. Early school entry had no lasting academic benefit.',
      },
    ],
    educational_implications: [
      'The neuroscience supports a school start age of 6-7 for formal instruction, not 4-5. Left-hemisphere lateralization for language is typically not complete until age 6-8.',
      'Countries that start formal schooling at 7 (Finland, Estonia, Denmark) consistently outperform countries that start at 5 (England) on international assessments like PISA — despite 2 fewer years of formal instruction.',
      'Play-based preschool education from ages 3-6 builds the executive function and self-regulation that makes formal learning effective when it begins.',
      'The argument for early start is primarily economic and political (childcare needs, parental workforce participation), not developmental.',
      'For individual children, readiness varies by 2+ years. A rigid start age of 5 means some 5-year-olds are neurologically 3-year-olds in terms of executive function and lateralization.',
    ],
    why_systems_agree: [
      'All systems agree that by age 7, virtually all typically-developing children are ready for formal instruction.',
      'All systems agree that the quality of the pre-school experience matters more than when formal schooling begins.',
    ],
    why_systems_disagree: [
      'England, Australia, US: Start formal schooling at 4-5. Historical/cultural reasons; strong emphasis on early literacy as equity intervention.',
      'Finland, Estonia, Waldorf: Start at 6-7. Developmental reasoning; trust in play-based foundations.',
      'Singapore: Start at 6 but with structured pre-primary from age 4. Pragmatic middle ground.',
      'The evidence favors the later-start position for population-level outcomes, but individual children vary widely in readiness.',
    ],
    what_children_can_do: [
      'Sustain focused attention for 15-30 minutes on engaging tasks (by age 6-7)',
      'Decode simple words phonemically when white matter pathways are mature',
      'Understand and follow multi-step instructions',
      'Engage in rule-governed games and collaborative activities',
      'Reason about concrete problems using logic (early concrete operations by age 6-7)',
      'Regulate emotions with decreasing adult support',
    ],
    what_children_cannot_yet_do: [
      'Think abstractly — reasoning is still tied to concrete, visible evidence',
      'Sustain effortful attention on boring or meaningless tasks for long periods',
      'Self-motivate through deferred rewards ("study now for a test next week")',
      'Read fluently with comprehension (most are still building decoding skills)',
      'Navigate complex social hierarchies independently',
    ],
    tags: ['school-start-age', 'lateralization', 'myelination', 'reading-readiness', 'play-based-learning'],
  },

  // =============================================
  // AGE 7-8: THE AGE OF REASON
  // =============================================
  {
    id: 'dev_7_8',
    age_range: [7, 8],
    label: 'The Age of Reason',
    subtitle: 'Concrete operations, reading fluency, and the shift to formal learning',
    summary:
      'Around age 7, a qualitative shift occurs in cognition: Piaget\'s concrete operational stage. Children can now conserve (understand that quantity is unchanged by appearance), reverse operations mentally, and decenter (consider multiple aspects simultaneously). White matter pathways for reading are sufficiently myelinated for phonemic decoding to become automatic. This is why most systems worldwide — regardless of when they start formal schooling — converge on serious academic instruction by age 7-8. The Catholic tradition called this the "age of reason" for centuries; developmental psychology confirms the intuition.',
    brain_development: [
      {
        region_or_process: 'Parieto-frontal network',
        what_happens:
          'fMRI studies show that a specific parietal-frontal network activates when children successfully perform conservation tasks. The parietal lobe handles spatial reasoning; the frontal lobe handles the logical rule. This network becomes reliably active around age 7.',
        educational_implication:
          'Mathematical and logical concepts that were impossible at age 5 (despite instruction) become accessible at 7 because the underlying neural network is now functional. This is maturation, not motivation.',
      },
      {
        region_or_process: 'Reading circuit consolidation',
        what_happens:
          'The "reading circuit" — visual word form area (left fusiform gyrus), phonological processing (left temporoparietal), and semantic integration (left inferior frontal) — becomes functionally connected. Microstructural changes in ventral white matter connections correlate with reading improvement during the first year of instruction.',
        educational_implication:
          'Children who struggled with reading at 5-6 often experience a breakthrough around 7-8, not because instruction improved, but because the circuit completed its wiring.',
      },
      {
        region_or_process: 'Corpus callosum thickening',
        what_happens:
          'The band of fibers connecting left and right hemispheres continues to thicken and myelinate, improving cross-hemisphere communication.',
        educational_implication:
          'Tasks requiring integration of spatial and verbal processing (reading comprehension, mathematical word problems) become increasingly feasible.',
      },
    ],
    key_research: [
      {
        name: 'Piaget',
        year: 1952,
        finding:
          'Identified the concrete operational stage (ages 7-11): children acquire conservation, reversibility, decentration, seriation, and classification. These are not taught — they emerge when the brain is ready. Cross-cultural replication confirms the sequence, though the timing varies by up to 2 years depending on cultural context.',
      },
      {
        name: 'Dehaene',
        year: 2009,
        finding:
          'In "Reading in the Brain," mapped the neural reading circuit and showed that learning to read literally rewires the brain — specifically repurposing a region evolved for face/object recognition (visual word form area) for letter recognition. This "neuronal recycling" takes time and brain maturation.',
      },
      {
        name: 'Huttenlocher & Dabholkar',
        year: 1997,
        finding:
          'Showed that prefrontal cortex synapse elimination continues through midadolescence, while sensory cortex pruning completes by age 12. At age 7-8, prefrontal synaptic density is still near its peak, providing rich substrate for learning before pruning narrows the circuits.',
      },
    ],
    educational_implications: [
      'Age 7 is the strongest convergence point across all education systems. Regardless of whether formal schooling started at 4, 5, 6, or 7, this is when most systems shift to sustained academic instruction.',
      'Conservation understanding is a prerequisite for genuine mathematical thinking. Teaching arithmetic before conservation leads to procedural memorization without conceptual understanding.',
      'Reading instruction that felt forced at 5 often "clicks" at 7 because the neural reading circuit has matured. Late readers are not slow learners — they may be normally developing brains on the later end of the maturation curve.',
      'Cross-cultural research shows the concrete operational shift is universal in sequence but not in timing. In communities without formal schooling, conservation understanding may emerge 1-2 years later than in schooled populations — suggesting the shift is partly maturational and partly experiential.',
    ],
    why_systems_agree: [
      'Nearly universal agreement that formal, sustained academic instruction is appropriate by age 7-8.',
      'The convergence is remarkable: Finland starts formal school at 7; England has been doing formal academics for 2 years by this point — but both shift to serious instruction around 7-8.',
    ],
    why_systems_disagree: [
      'Systems disagree on whether the 5-7 period should have been spent on formal pre-academics (UK model) or extended play (Nordic model).',
      'By age 7-8, the disagreement narrows significantly. The question becomes about pedagogy (how to teach) rather than timing (when to start).',
    ],
    what_children_can_do: [
      'Conserve: understand that pouring liquid into a different-shaped container doesn\'t change the amount',
      'Reverse operations mentally: 3 + 4 = 7, therefore 7 - 4 = 3',
      'Classify objects along multiple dimensions simultaneously',
      'Read with increasing fluency and comprehension',
      'Follow complex, multi-step instructions',
      'Sustain focused attention for 20-45 minutes on engaging tasks',
      'Engage in rule-governed games with genuine understanding of fairness',
    ],
    what_children_cannot_yet_do: [
      'Think hypothetically or abstractly ("what if gravity worked differently?")',
      'Reason about abstract variables (algebra, formal logic)',
      'Consider all possible combinations systematically',
      'Distinguish correlation from causation',
      'Evaluate the quality of evidence or sources',
    ],
    tags: ['concrete-operations', 'conservation', 'reading-circuit', 'age-of-reason', 'convergence-point'],
  },

  // =============================================
  // AGE 9-12: ABSTRACT THINKING EMERGENCE
  // =============================================
  {
    id: 'dev_9_12',
    age_range: [9, 12],
    label: 'Abstract Thinking Emergence',
    subtitle: 'The bridge from concrete to abstract, and why social dynamics explode',
    summary:
      'Between ages 9-12, the brain begins the long transition from concrete to abstract thinking. Montessori recognized this with a clear break at age 9 (beginning of the "second plane\'s" upper stage). Peer relationships become central to identity and well-being — children spend increasing time with peers and begin forming cliques. The "fourth-grade slump" in reading occurs because curriculum shifts from "learning to read" to "reading to learn," requiring vocabulary depth and background knowledge that may be thin. Synaptic pruning in prefrontal cortex accelerates, refining the circuits that will support adolescent and adult cognition.',
    brain_development: [
      {
        region_or_process: 'Prefrontal cortex (pruning phase)',
        what_happens:
          'Synaptic pruning in prefrontal cortex accelerates around age 9-10, eliminating underused connections and strengthening active ones. Auditory cortex pruning completes by age 12; prefrontal pruning continues into midadolescence.',
        educational_implication:
          'The "use it or lose it" principle becomes especially salient. Skills and thinking patterns practiced during this window will be preserved; those neglected may be harder to build later. This is a critical period for building study habits, reasoning strategies, and intellectual curiosity.',
      },
      {
        region_or_process: 'Abstract reasoning networks',
        what_happens:
          'Connectivity between prefrontal cortex and parietal regions strengthens, enabling early abstract reasoning. Children begin transitioning from Piaget\'s concrete operations to the beginnings of formal operations.',
        educational_implication:
          'Children ages 9-12 can handle increasing abstraction — but still need concrete anchors. The best instruction provides a bridge: concrete examples that scaffold toward abstract principles. Pure abstraction (e.g., formal algebra without manipulatives) is premature for most.',
      },
      {
        region_or_process: 'Social brain network',
        what_happens:
          'The "social brain" (medial prefrontal cortex, temporoparietal junction, superior temporal sulcus) shows increased activation during social cognition tasks. Children become acutely sensitive to peer evaluation, social status, and group belonging.',
        educational_implication:
          'Peer relationships are not a distraction from learning — they are a primary developmental task. Cooperative learning, group projects, and peer discussion leverage this neural priority rather than fighting it.',
      },
    ],
    key_research: [
      {
        name: 'Montessori',
        year: 1948,
        finding:
          'Identified the Second Plane of Development (ages 6-12) as characterized by reasoning mind, moral sense, and imagination. Within this plane, she noted a shift around age 9 where children move from concrete to more abstract and imaginative work, and develop intense interest in social justice and fairness.',
      },
      {
        name: 'Chall',
        year: 1983,
        finding:
          'Identified the "fourth-grade slump": reading scores drop around age 9-10 because the curriculum shifts from "learning to read" (decoding) to "reading to learn" (comprehension of academic content). Children with limited vocabulary and background knowledge are most affected.',
      },
      {
        name: 'Chall, Jacobs & Baldwin',
        year: 1990,
        finding:
          'Longitudinal study of 30 children from low-income families showed that the fourth-grade slump was specifically driven by deficits in word meaning and academic vocabulary, not decoding ability. The gap widened from grade 4 through grade 7.',
      },
      {
        name: 'Hartup',
        year: 1996,
        finding:
          'Established that peer relationships in middle childhood are a major predictor of later adjustment. Being liked (peer acceptance) and having friends (reciprocal friendship) are distinct constructs — both matter independently for mental health and academic outcomes.',
      },
      {
        name: 'Rubin, Bukowski & Parker',
        year: 2006,
        finding:
          'Comprehensive review showed that during ages 9-12, peer relationships serve functions that family relationships cannot: negotiation between equals, understanding social hierarchies, developing loyalty and reciprocity, and identity formation through group belonging.',
      },
    ],
    educational_implications: [
      'The fourth-grade slump is predictable and preventable. Building rich vocabulary and background knowledge from ages 5-8 — through read-alouds, field trips, and content-rich curriculum — prevents the comprehension collapse at age 9-10.',
      'Montessori\'s break at age 9 aligns with neuroscience: the shift toward abstract reasoning, intensified social development, and the capacity for "big work" (long-term projects requiring planning and sustained effort) all emerge around this age.',
      'Cooperative learning becomes especially effective at this age because peer interaction is a primary developmental need, not a distraction.',
      'The onset of "peer pressure" reflects the social brain\'s increasing sensitivity. Education should address this directly through discussion, role-playing, and explicit social-emotional learning.',
      'Synaptic pruning makes this a "use it or lose it" period. Broad exposure to diverse subjects, skills, and thinking styles preserves neural flexibility heading into adolescence.',
    ],
    why_systems_agree: [
      'Most systems agree that ages 9-12 are a transition period requiring increasing intellectual challenge and social-emotional support.',
      'Nearly all systems introduce more subject specialization and longer-form projects around this age.',
    ],
    why_systems_disagree: [
      'Some systems (traditional Asian models) push toward early specialization and competitive academic selection at age 11-12.',
      'Others (Montessori, Waldorf, Finnish) resist early tracking and maintain broad, integrated curricula through age 12.',
      'The neuroscience favors breadth during this window because synaptic pruning is actively shaping which circuits survive into adolescence.',
    ],
    what_children_can_do: [
      'Begin reasoning abstractly about familiar topics ("What if the character had made a different choice?")',
      'Plan and execute multi-step projects over days or weeks',
      'Read complex texts for information and pleasure',
      'Understand multiplication, division, fractions, and early algebraic thinking with concrete support',
      'Navigate complex social dynamics including cliques, loyalty conflicts, and peer negotiation',
      'Develop personal interests and areas of deep expertise',
      'Think about thinking (metacognition emerges)',
    ],
    what_children_cannot_yet_do: [
      'Reason about pure abstractions without concrete referents (full formal operations come later)',
      'Systematically test hypotheses with controlled variables',
      'Reliably resist peer pressure when it conflicts with personal values',
      'Manage long-term time planning independently',
      'Evaluate bias in sources or arguments with sophistication',
    ],
    tags: ['abstract-thinking', 'fourth-grade-slump', 'peer-relationships', 'pruning', 'montessori-second-plane'],
  },
];

// ==================== Cross-Cutting Principles ====================

export const CROSS_CUTTING_PRINCIPLES: CrossCuttingPrinciple[] = [

  {
    id: 'principle_matthew_effect',
    name: 'The Matthew Effect in Reading',
    researchers: [
      {
        name: 'Stanovich',
        year: 1986,
        finding:
          'Coined the "Matthew Effect" for reading (from the Gospel of Matthew: "the rich get richer"). Children who read well read more, build vocabulary faster, encounter more complex syntax, and get better at reading. Children who struggle read less, fall further behind, and the gap widens exponentially. This is the single strongest argument for early intervention in reading — not because early instruction is neurologically necessary, but because falling behind creates a self-reinforcing cascade.',
      },
    ],
    summary:
      'Good readers read more, learn more words, get better at reading, and read even more. Struggling readers read less, learn fewer words, fall further behind, and avoid reading. By 4th grade, the gap between strong and weak readers is enormous — not because of innate ability differences, but because of cumulative exposure differences. Stanovich estimated that a voracious 5th-grader reads 50x more words per year than a reluctant reader.',
    implications_for_education: [
      'Early reading difficulty must be addressed immediately — not because the brain is permanently damaged, but because the cascade of avoidance begins within months.',
      'Reading aloud to children from birth builds vocabulary and comprehension independently of the child\'s own reading ability, partially compensating for the Matthew Effect.',
      'The fourth-grade slump (Chall, 1983) is partly a Matthew Effect: children who read less in grades 1-3 arrive at grade 4 with insufficient vocabulary for the "reading to learn" transition.',
      'Intrinsic motivation to read is as important as decoding skill — a child who can read but doesn\'t is nearly as disadvantaged as one who can\'t.',
    ],
    tags: ['reading', 'cumulative-advantage', 'equity', 'intervention'],
  },

  {
    id: 'principle_critical_sensitive_periods',
    name: 'Critical Periods vs Sensitive Periods',
    researchers: [
      {
        name: 'Hubel & Wiesel',
        year: 1970,
        finding:
          'Nobel Prize-winning work on visual cortex: kittens deprived of visual input in one eye during a critical window permanently lost binocular vision. Established that some developmental windows close permanently — true critical periods.',
      },
      {
        name: 'Lenneberg',
        year: 1967,
        finding:
          'Proposed a critical period for first language acquisition, ending around puberty. Modern evidence supports this as a strong sensitive period rather than an absolute critical period — language acquisition is possible but dramatically harder after puberty.',
      },
      {
        name: 'Hensch',
        year: 2005,
        finding:
          'Identified the molecular mechanisms controlling critical period timing: the balance of excitatory and inhibitory neural inputs (E-I balance) opens and closes critical period windows. Demonstrated that critical periods can be reopened pharmacologically in animal models.',
      },
    ],
    summary:
      'Critical periods are narrow developmental windows during which specific experience is required for normal development — miss the window and the capacity is permanently impaired (e.g., binocular vision). Sensitive periods are broader windows during which the brain is especially receptive to certain inputs but can still learn outside the window, albeit less efficiently (e.g., second language acquisition). Modern neuroscience views most cognitive and educational development as involving sensitive periods, not critical periods. First language acquisition and basic sensory development are the closest to true critical periods. Reading, mathematics, music, and social skills involve sensitive periods — easier to learn during specific developmental windows but not permanently foreclosed.',
    implications_for_education: [
      'The "baby Einstein" anxiety — that missing a narrow window permanently limits a child — is largely unfounded for cognitive and academic skills.',
      'Language exposure in the first 3 years is the closest to a true critical period in education: children deprived of language during this window face permanent deficits.',
      'Second language acquisition has a sensitive period (roughly before puberty) but not a critical period — adults can learn languages, just less efficiently.',
      'Most educational content (reading, math, science, music) involves sensitive periods: earlier is easier but later is not impossible.',
      'The practical implication is urgency without panic: provide rich experiences during sensitive periods, but don\'t catastrophize about "missing windows" for academic skills.',
    ],
    tags: ['neuroscience', 'plasticity', 'timing', 'language-acquisition'],
  },

  {
    id: 'principle_play_is_learning',
    name: 'Play Is Not the Opposite of Learning',
    researchers: [
      {
        name: 'Stuart Brown',
        year: 2009,
        finding:
          'Conducted 6,000+ "play histories" across populations from serial murderers to Nobel laureates. Found that play deprivation in childhood was a consistent factor in antisocial behavior. Famous quote: "The opposite of play is not work — it is depression." Play is a biological drive that shapes the brain, builds social skills, and drives creativity.',
      },
      {
        name: 'Pellis & Pellis',
        year: 2007,
        finding:
          'Research on rough-and-tumble play in rats showed that play literally builds prefrontal cortex circuits. Rats deprived of play had normal-sized prefrontal cortex but with fewer and less complex dendritic branches — they could not adapt their behavior to changing social contexts.',
      },
      {
        name: 'Hirsh-Pasek & Golinkoff',
        year: 2003,
        finding:
          'Distinguished three modes: free play, guided play, and direct instruction. Found that guided play (adult-structured, child-directed) produced the best learning outcomes across vocabulary, spatial skills, and mathematical thinking in preschoolers.',
      },
      {
        name: 'Whitebread',
        year: 2012,
        finding:
          'Play — physical, constructional, and social — supports development of intellectual and emotional self-regulation, which is the single strongest predictor of academic success. Replacing play with academics to "get ahead" actually undermines the self-regulation foundation that makes academics effective.',
      },
    ],
    summary:
      'Play is not a break from learning, a reward for completing work, or a luxury to be cut when time is short. Neuroscience shows that play activates prefrontal cortex circuits, builds executive function, develops theory of mind, and fosters creativity. Animals deprived of play show permanent deficits in social cognition and behavioral flexibility. In humans, play deprivation correlates with antisocial behavior and poor adaptation. The strongest version of this finding: play builds the very self-regulation skills that make formal academic learning possible later.',
    implications_for_education: [
      'Cutting recess or play time to add more instruction is counterproductive — it removes the activity that builds the neural capacity for learning.',
      'Guided play (adult provides structure, child directs activity) produces better learning outcomes than either pure free play or pure direct instruction for children ages 3-7.',
      'Physical play (running, climbing, rough-and-tumble) is not just exercise — it builds prefrontal cortex circuits and self-regulation.',
      'Pretend play exercises the same neural circuits used for planning, perspective-taking, and hypothetical reasoning.',
      'The play-work dichotomy is an adult construction. For children, play IS the primary mechanism of cognitive development.',
    ],
    tags: ['play', 'neuroscience', 'executive-function', 'self-regulation'],
  },

  {
    id: 'principle_self_determination',
    name: 'Self-Determination Theory',
    researchers: [
      {
        name: 'Deci & Ryan',
        year: '1985, 2000',
        finding:
          'Identified three basic psychological needs essential for intrinsic motivation and well-being: autonomy (sense of choice and volition), competence (sense of effectiveness and mastery), and relatedness (sense of connection and belonging). When all three are met, intrinsic motivation flourishes. When any is thwarted, motivation becomes extrinsic and less effective.',
      },
      {
        name: 'Grolnick & Ryan',
        year: 1989,
        finding:
          'Found that children who perceived their teachers as cold and uncaring (thwarted relatedness) showed lower intrinsic motivation regardless of instructional quality. Autonomy-supportive teaching (offering choices, acknowledging feelings, minimizing pressure) consistently outperformed controlling teaching across age groups and cultures.',
      },
      {
        name: 'Niemiec & Ryan',
        year: 2009,
        finding:
          'Applied SDT to education: autonomy-supportive teaching, provision of competence-building feedback (not grades), and nurturing relatedness all predicted better learning outcomes, greater persistence, and higher well-being across educational levels and cultural contexts.',
      },
    ],
    summary:
      'Humans — including children — are intrinsically motivated to learn when three psychological needs are met: autonomy (I chose this), competence (I can do this), and relatedness (I belong here). External rewards (stickers, grades, rankings) can temporarily boost performance but undermine intrinsic motivation over time — a phenomenon Deci called "the overjustification effect." This framework explains why child-directed approaches (Montessori, Reggio) often produce stronger long-term outcomes: they satisfy autonomy and competence needs by design.',
    implications_for_education: [
      'Offering meaningful choices (not unlimited freedom, but genuine options within structure) builds autonomy and intrinsic motivation.',
      'Feedback should emphasize mastery and growth ("you figured out a new strategy") over comparison and ranking ("you got the highest score").',
      'Warm, caring teacher-student relationships are not a soft extra — they are a prerequisite for learning because they satisfy the relatedness need.',
      'External rewards (stickers, prizes, grades) can undermine intrinsic motivation. Use them sparingly and fade them as self-motivation develops.',
      'This theory explains the success of Montessori\'s "freedom within limits" and Reggio\'s "child as capable researcher" — both architectures satisfy autonomy, competence, and relatedness needs.',
    ],
    tags: ['motivation', 'autonomy', 'intrinsic-motivation', 'self-regulation'],
  },

  {
    id: 'principle_nature_nurture',
    name: 'Nature, Nurture, and Readiness',
    researchers: [
      {
        name: 'Plomin et al. (TEDS — Twins Early Development Study)',
        year: '2004-2013',
        finding:
          'Massive UK twin study found that genetic factors account for roughly 60-70% of variation in reading ability, ~50% in mathematics, and ~60% in general academic achievement at age 7. But heritability is not destiny: environment determines the range within which genetic potential is expressed. Heritability of intelligence increases with age — from ~20% in infancy to ~80% in adulthood — as individuals increasingly select environments that match their genetic predispositions.',
      },
      {
        name: 'Turkheimer',
        year: 2003,
        finding:
          'Showed that heritability estimates are environment-dependent. In high-poverty families, shared environment (quality of school, home, neighborhood) explained most of the variance in IQ. In affluent families, genetic factors dominated. Implication: genetic potential is only fully expressed in enriched environments.',
      },
      {
        name: 'Scarr & McCartney',
        year: 1983,
        finding:
          'Proposed that the nature-nurture relationship changes across development: passive gene-environment correlation (infants inherit both genes and environments from parents), evocative (children\'s genetic traits elicit particular responses from others), and active (children increasingly select environments matching their genetic predispositions). This explains why heritability increases with age.',
      },
    ],
    summary:
      'The "nature vs nurture" framing is obsolete. Genes set a range; environment determines where within that range a child develops. Twin studies show substantial heritability for academic skills (~60-70% for reading), but this does NOT mean education is futile — it means that equally enriched environments reveal genetic variation, while impoverished environments suppress genetic potential. The practical implication: readiness for school is partly maturational (nature) and partly experiential (nurture). Pushing a child whose brain is not yet myelinated for reading will produce frustration; depriving a ready child of challenge will produce boredom. Both are harmful.',
    implications_for_education: [
      'School readiness varies by 2+ years among same-age children, partly due to maturational differences with a genetic component.',
      'The goal of education is to maximize environmental quality so that genetic potential can be fully expressed — not to overcome genetics.',
      'In high-poverty contexts, educational quality matters MORE because environment explains more of the variance.',
      'Rigid age-based grade placement ignores the 2-year developmental spread within any cohort. Flexible grouping, individualized pacing, and multi-age classrooms (Montessori) address this better than lockstep age grouping.',
      'The increasing heritability of intelligence with age means early interventions improve the environment in which genetic potential unfolds — they are investments with compound returns.',
    ],
    tags: ['heritability', 'twin-studies', 'gene-environment', 'readiness', 'equity'],
  },
];
