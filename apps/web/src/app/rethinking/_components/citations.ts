export interface Citation {
  id: string;
  pattern: RegExp;
  displayText: string;
  authors: string;
  year: string;
  title: string;
  kind: 'book' | 'paper' | 'report' | 'article';
  note: string;
}

// Order matters: more specific patterns must come first so they win over generic ones.
export const CITATIONS: Citation[] = [
  {
    id: 'carnegie-2024',
    pattern: /\(Carnegie Endowment, 2024\)/g,
    displayText: 'Carnegie Endowment, 2024',
    authors: 'Carnegie Endowment for International Peace',
    year: '2024',
    title: 'The tidal wave of AI-generated content online',
    kind: 'report',
    note: 'Estimate that ~52% of online content is AI-generated as of 2024 — a shift that happened in roughly two years and fundamentally changed the information environment students learn in.',
  },
  {
    id: 'europol-2024',
    pattern: /\(Europol, 2024\)/g,
    displayText: 'Europol, 2024',
    authors: 'Europol Innovation Lab',
    year: '2024',
    title: 'The second wave of synthetic media',
    kind: 'report',
    note: 'Documents the exponential spread of synthetic media and the attendant risks of personalized persuasion at scale. Traditional media literacy becomes insufficient when every viewer may see uniquely generated content.',
  },
  {
    id: 'sapolsky-determined',
    pattern: /Sapolsky \(2023\)/g,
    displayText: 'Sapolsky, 2023',
    authors: 'Robert M. Sapolsky',
    year: '2023',
    title: 'Determined: A Science of Life Without Free Will',
    kind: 'book',
    note: 'Extends Behave to its strongest form: rigorous determinism with no cracks between the disciplines. The closing chapters matter for this paper — Sapolsky argues that compassion, intervention, and the redesign of conditions remain rational responses under determinism, anticipating the compatibilist-pragmatist bridge in §5.4.',
  },
  {
    id: 'sapolsky-behave',
    pattern: /\(Sapolsky, 2017, 2023\)/g,
    displayText: 'Sapolsky, 2017, 2023',
    authors: 'Robert M. Sapolsky',
    year: '2017 & 2023',
    title: 'Behave (2017) · Determined (2023)',
    kind: 'book',
    note: 'Behave traces any behavior through nested temporal layers — seconds to millions of years — with no gaps between the disciplines that study each layer. Determined extends the argument to its strongest form: rigorous determinism. This is the "cascading causation" of Principle 1.',
  },
  {
    id: 'dennett-elbow-room',
    pattern: /Dennett \(1984\)/g,
    displayText: 'Dennett, 1984',
    authors: 'Daniel C. Dennett',
    year: '1984',
    title: 'Elbow Room: The Varieties of Free Will Worth Wanting',
    kind: 'book',
    note: 'The canonical compatibilist argument. Dennett grants physicalist determinism and then shows that the forms of free will actually relevant to moral life — responsiveness to reasons, self-correction, second-order preference — are not threatened by it but explained by it. The move the paper uses to bridge Sapolsky and Rogers without hand-waving.',
  },
  {
    id: 'dewey-1916',
    pattern: /Dewey \(1916\)/g,
    displayText: 'Dewey, 1916',
    authors: 'John Dewey',
    year: '1916',
    title: 'Democracy and Education',
    kind: 'book',
    note: 'Grounds educational normativity in the conditions that produce human growth rather than in a priori metaphysics. The pragmatist "ought" is functional: some environments reliably produce flourishing, others reliably produce harm — which is exactly the register that determinism leaves intact. Also the twentieth-century educator who saw the factory model coming and named its pedagogical cost from inside the profession.',
  },
  {
    id: 'dewey-1938',
    pattern: /Dewey \(1938\)/g,
    displayText: 'Dewey, 1938',
    authors: 'John Dewey',
    year: '1938',
    title: 'Experience and Education',
    kind: 'book',
    note: 'Education is not preparation for life, it is life — the continuous reconstruction of experience. The educator\'s task is to design the environment, because the environment is what actually educates; imposing outcomes severs means from ends and kills the experience\'s capacity to generate further growth.',
  },
  {
    id: 'vygotsky-1978',
    pattern: /\(Vygotsky, 1978\)/g,
    displayText: 'Vygotsky, 1978',
    authors: 'Lev S. Vygotsky',
    year: '1978',
    title: 'Mind in Society: The Development of Higher Psychological Processes',
    kind: 'book',
    note: 'Every higher cognitive function appears first between people and only later inside the individual. The Zone of Proximal Development is the gap between what a learner can do alone and what they can do with a more capable other — the only zone in which instruction is actually effective. Metacognition is internalized dialogue; productive struggle works because it happens inside a scaffolded relationship, not in isolation.',
  },
  {
    id: 'freire-1970',
    pattern: /\(Freire, 1970\)/g,
    displayText: 'Freire, 1970',
    authors: 'Paulo Freire',
    year: '1970',
    title: 'Pedagogy of the Oppressed',
    kind: 'book',
    note: 'The "banking model" treats students as empty accounts into which teachers deposit content; "problem-posing" education treats them as co-investigators of their own reality. Conscientização — critical consciousness — is learning to read the word by reading the world. Dialogue is not a teaching technique but the epistemological form of human freedom. Supplements Gramsci and Althusser (who have no pedagogy) with the pedagogical verb for resisting reproduction.',
  },
  {
    id: 'hart-risley-1995',
    pattern: /\(Hart & Risley, 1995\)/g,
    displayText: 'Hart & Risley, 1995',
    authors: 'Betty Hart & Todd Risley',
    year: '1995',
    title: 'Meaningful Differences in the Everyday Experience of Young American Children',
    kind: 'book',
    note: 'Source of the "30-million-word gap" claim from a small Kansas sample (N=42). Historically influential but contested: Sperry, Sperry & Miller (2019) failed to replicate with a broader multi-community sample and argued the gap is partly an artifact of excluding bystander talk and non-primary caregivers. Cited here as a benchmark in the discussion, not as a settled finding.',
  },
  {
    id: 'sperry-2019',
    pattern: /\(Sperry, Sperry, & Miller, 2019\)/g,
    displayText: 'Sperry, Sperry, & Miller, 2019',
    authors: 'Douglas E. Sperry, Linda L. Sperry & Peggy J. Miller',
    year: '2019',
    title: 'Reexamining the Verbal Environments of Children From Different Socioeconomic Backgrounds',
    kind: 'article',
    note: 'Child Development, 90(4), 1303–1318. doi:10.1111/cdev.13072. Five-community replication of Hart & Risley: once bystander talk and multiple caregivers are counted, SES differences in word exposure shrink substantially and vary widely within every stratum. Working-class and low-income children sometimes heard comparable or higher word counts than the middle-class comparison groups.',
  },
  {
    id: 'noble-2015',
    pattern: /\(Noble et al\., 2015\)/g,
    displayText: 'Noble et al., 2015',
    authors: 'Kimberly G. Noble and colleagues',
    year: '2015',
    title: 'Family Income, Parental Education and Brain Structure in Children and Adolescents',
    kind: 'article',
    note: 'Nature Neuroscience, 18(5), 773–778. doi:10.1038/nn.3983. N=1,099, ages 3–20. Family income was logarithmically associated with cortical surface area (steepest gradient at low incomes) in regions supporting language, reading, executive function, and spatial skill; parental education was linked to left hippocampal volume. The broader SES-shapes-brain-development claim survives even where the "word gap" specifically does not.',
  },
  {
    id: 'rogers-actualizing',
    pattern: /\(Rogers, 1961, 1980\)/g,
    displayText: 'Rogers, 1961, 1980',
    authors: 'Carl R. Rogers',
    year: '1961 & 1980',
    title: 'On Becoming a Person · A Way of Being',
    kind: 'book',
    note: 'The "actualizing tendency" — an innate drive in every organism to develop its potentials. Illustrated with potato sprouts growing toward whatever light reaches them through a basement. Three conditions support the tendency: unconditional positive regard, empathy, and genuineness.',
  },
  {
    id: 'robinson-creativity',
    pattern: /\(Robinson, 2009, 2015\)/g,
    displayText: 'Robinson, 2009, 2015',
    authors: 'Sir Ken Robinson',
    year: '2009 & 2015',
    title: 'The Element · Creative Schools',
    kind: 'book',
    note: 'Documents how schools systematically suppress diverse intelligences, maintaining an invariant hierarchy — math and languages at the top, arts at the bottom. The TED talk "Do schools kill creativity?" is Robinson\u2019s most viewed distillation.',
  },
  {
    id: 'land-jarman-1992',
    pattern: /\(Land & Jarman, 1992\)/g,
    displayText: 'Land & Jarman, 1992',
    authors: 'George Land & Beth Jarman',
    year: '1992',
    title: 'Breakpoint and Beyond',
    kind: 'book',
    note: 'Trade management book, not peer-reviewed research. The often-repeated 98% / 50% / 2% divergent-thinking figures come from cross-sectional administrations of a NASA engineer-selection instrument to different age cohorts, not from a longitudinal study. Cited here as the origin of a popular claim; the peer-reviewed evidence for a creativity decline is carried by Kim (2011).',
  },
  {
    id: 'kim-2011',
    pattern: /\(Kim, 2011\)/g,
    displayText: 'Kim, 2011',
    authors: 'Kyung Hee Kim',
    year: '2011',
    title: 'The Creativity Crisis: The Decrease in Creative Thinking Scores on the Torrance Tests of Creative Thinking',
    kind: 'article',
    note: 'Creativity Research Journal, 23(4), 285–295. doi:10.1080/10400419.2011.627805. Cross-temporal analysis of six Torrance Test normative samples (1966–2008, total N=272,599, K–adult). U.S. creativity scores rose until 1990, then declined steadily through 2008 even as IQ scores rose — with the sharpest decline among kindergarten to third-grade children.',
  },
  {
    id: 'said-metwaly-2021',
    pattern: /\(Said-Metwaly et al\., 2021\)/g,
    displayText: 'Said-Metwaly et al., 2021',
    authors: 'Sameh Said-Metwaly and colleagues',
    year: '2021',
    title: 'Cumulative Cultural (Cross-Temporal) Trends in Creative Performance: A Meta-Analytic Approach',
    kind: 'article',
    note: 'Psychology of Aesthetics, Creativity, and the Arts, 15(4), 632–643. doi:10.1037/aca0000410. Meta-analysis that partially confirms Kim (2011) for figural TTCT scores while flagging weaker and more methodologically fragile patterns in verbal creativity measures.',
  },
  {
    id: 'jaeger-1945',
    pattern: /\(Jaeger, 1945\)/g,
    displayText: 'Jaeger, 1945',
    authors: 'Werner Jaeger',
    year: '1945',
    title: 'Paideia: The Ideals of Greek Culture',
    kind: 'book',
    note: 'Canonical treatment of paideia — the Greek conception of education as the complete formation of a person. Moral development, aesthetic sensibility, reasoned citizenship. Not skill acquisition.',
  },
  {
    id: 'bowles-gintis-1976',
    pattern: /\(Bowles & Gintis, 1976\)/g,
    displayText: 'Bowles & Gintis, 1976',
    authors: 'Samuel Bowles & Herbert Gintis',
    year: '1976',
    title: 'Schooling in Capitalist America',
    kind: 'book',
    note: 'Classic correspondence-principle argument: the structure of schooling mirrors the structure of the workplace because schools were designed to reproduce it. Factory floor on one side of the wall; classroom on the other.',
  },
  {
    id: 'tyack-cuban-1995',
    pattern: /\(Tyack and Cuban, 1995\)/g,
    displayText: 'Tyack & Cuban, 1995',
    authors: 'David Tyack & Larry Cuban',
    year: '1995',
    title: 'Tinkering Toward Utopia',
    kind: 'book',
    note: 'Introduces "the grammar of schooling" — the deep persistent structure (age-graded classrooms, 50-minute periods, separated subjects, letter grades) that absorbs or rejects innovations. Reforms that fit get adopted; reforms that challenge it get modified until they fit, losing what made them effective.',
  },
  {
    id: 'althusser-1970',
    pattern: /\(Althusser, 1970\)/g,
    displayText: 'Althusser, 1970',
    authors: 'Louis Althusser',
    year: '1970',
    title: 'Ideology and Ideological State Apparatuses',
    kind: 'paper',
    note: 'Identifies education as the dominant ideological state apparatus — the institution whose primary function is reproduction of the social order, not knowledge transmission. The hidden curriculum is more powerful than the explicit one.',
  },
  {
    id: 'kuhn-1962',
    pattern: /Kuhn \(1962\)/g,
    displayText: 'Kuhn, 1962',
    authors: 'Thomas S. Kuhn',
    year: '1962',
    title: 'The Structure of Scientific Revolutions',
    kind: 'book',
    note: 'Distinguishes "normal science" (problem-solving within an existing paradigm) from revolutionary shifts that replace a paradigm. Most educational reform is normal science; it cannot resolve anomalies of the existing paradigm.',
  },
  {
    id: 'gramsci-1971',
    pattern: /Gramsci'?s \(1971\)/g,
    displayText: 'Gramsci, 1971',
    authors: 'Antonio Gramsci',
    year: '1971',
    title: 'Selections from the Prison Notebooks',
    kind: 'book',
    note: 'Develops the concept of hegemony — how power operates through consent rather than force. The dominant classes maintain power by shaping values so people "choose" what serves existing arrangements.',
  },
  {
    id: 'kapur-2016',
    pattern: /\(Kapur, 2016\)/g,
    displayText: 'Kapur, 2016',
    authors: 'Manu Kapur',
    year: '2016',
    title: 'Examining Productive Failure, Productive Success, Unproductive Failure, and Unproductive Success in Learning',
    kind: 'paper',
    note: 'Evidence that productive struggle — wrestling with a problem before receiving the solution — builds stronger neural pathways than being given the answer directly. Underwrites the "ask questions, don\u2019t provide answers" design principle for educational AI.',
  },
];

export function findCitationById(id: string): Citation | undefined {
  return CITATIONS.find((c) => c.id === id);
}

/**
 * Preprocess the paper markdown: replace every citation pattern with a markdown
 * link whose href is `#cite-<id>`. The client renderer turns those links into
 * interactive buttons.
 */
export function injectCitations(markdown: string): string {
  let out = markdown;
  for (const c of CITATIONS) {
    out = out.replace(c.pattern, `[${c.displayText}](#cite-${c.id})`);
  }
  return out;
}
