# What "AI" Means: 18+ Definitions Across Sources

Research notes on the plurality of AI definitions. Organized by category, with explicit notes on tensions and what each definition includes/excludes. For LeResearch content development.

Compiled: 2026-04-24.

---

## 1. Regulatory / Governmental

### 1.1 OECD (2023, revised)
"An AI system is a machine-based system that **can, for a given set of human-defined explicit or implicit objectives, infer, from the input it receives, how to generate outputs such as predictions, content, recommendations, or decisions** that can influence physical or virtual environments." Updated Nov 2023 to add "content" (folding in generative AI) and emphasize post-deployment adaptiveness.
- **Includes:** ML, LLMs, generative models, recommender systems, classical inference engines.
- **Excludes (intentionally):** purely deterministic rule-based software with no inference. The word "infers" is the load-bearing exclusion.

### 1.2 EU AI Act, Article 3(1) (in force 2024)
"A machine-based system that is designed to operate with **varying levels of autonomy** and that may exhibit **adaptiveness** after deployment, and that, for explicit or implicit objectives, **infers**, from the input it receives, how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments."
- Direct lift from the OECD definition with "autonomy" and "adaptiveness" added as gating criteria.
- **Tension with OECD:** The Commission's Feb 2025 Guidelines explicitly say simple statistical models, basic optimization heuristics, and traditional rule-based systems with no learning are *not* AI systems — narrower in practice than the text reads.

### 1.3 NIST AI Risk Management Framework (AI RMF 1.0, 2023)
"An engineered or machine-based system that **can, for a given set of objectives, generate outputs such as predictions, recommendations, or decisions** influencing real or virtual environments." (Adopts ISO/IEC 22989 phrasing.)
- **Broader than EU AI Act:** NIST does not require autonomy or adaptiveness. A regression model used for predictions arguably qualifies. NIST is voluntary and "use-case agnostic."

### 1.4 US Executive Order 14110 (Oct 2023, Biden — rescinded Jan 2025)
Adopted the statutory definition from 15 U.S.C. § 9401(3): "a machine-based system that can, for a given set of human-defined objectives, make predictions, recommendations, or decisions influencing real or virtual environments." Notably uses "make" rather than "infer."
- Status: rescinded by Trump EO Jan 20, 2025; the statutory definition in the National AI Initiative Act of 2020 still controls in US federal law.

### 1.5 UK AI Security Institute (formerly AI Safety Institute, renamed 2025)
Working definition: "the theory and development of computer systems able to perform tasks normally requiring human intelligence, such as visual perception, speech recognition, decision-making, and translation between languages." AISI's operational focus is **"frontier AI"** — large general-purpose models near the capability frontier (≈30+ systems evaluated to date).
- **Excludes:** narrow statistical tools. Frontier framing is much narrower than EU/OECD; treats "AI" effectively as "frontier general-purpose models."

### 1.6 China — Interim Measures for Generative AI Services (CAC, Aug 15 2023)
"Generative AI technologies" = "models and related technologies that can generate content in the form of text, pictures, audio, and video." Regulates only **public-facing generative services** in mainland China.
- **Narrowest of all regulatory definitions** — it is a definition of generative AI services, not AI in general. Discriminative ML, robotics, recommender systems sit under *other* Chinese rules (Algorithmic Recommendation Provisions 2022; Deep Synthesis Provisions 2023).

---

## 2. Standards Bodies

### 2.1 ISO/IEC 22989:2022 (with 2024 generative AI amendment)
- **AI system:** "engineered system that generates outputs such as content, forecasts, recommendations or decisions for a given set of human-defined objectives."
- **AI agent:** "automated entity that senses and responds to its environment and takes actions to achieve its goals."
- This is the upstream vocabulary that NIST and (indirectly) OECD/EU lean on.

### 2.2 IEEE — Ethically Aligned Design (1st ed. 2019)
IEEE typically uses the umbrella term **"Autonomous and Intelligent Systems (A/IS)"** rather than "AI" — a deliberate choice to avoid the AI marketing connotation and cover robotics + decision systems together. Definitions are scoped to A/IS that "can act in the world without direct human supervision."

---

## 3. Academic / Textbook

### 3.1 McCarthy, Minsky, Rochester, Shannon — Dartmouth Proposal (1955, conference 1956)
Coining moment. Working conjecture: "**every aspect of learning or any other feature of intelligence can in principle be so precisely described that a machine can be made to simulate it.**" McCarthy later glossed AI as "the science and engineering of making intelligent machines."
- Maximally broad — anything that simulates an aspect of intelligence.

### 3.2 Russell & Norvig, *AIMA* (1995–2020, 4 editions)
Famous **2×2 framework**: think vs. act × humanly vs. rationally → four schools.
1. **Thinking humanly** (cognitive science / brain modeling)
2. **Thinking rationally** (logicism, "laws of thought")
3. **Acting humanly** (Turing test tradition)
4. **Acting rationally** (rational agent — R&N's preferred definition)
- R&N favor "acting rationally": "an agent that acts so as to achieve the best expected outcome." This is the academic mainstream framing today; deliberately collapses the symbolic/connectionist split into a behavioral criterion.

### 3.3 Marvin Minsky
"AI is the science of making machines do things that would require intelligence if done by men." (1968, *Semantic Information Processing*.)
- Includes whatever currently looks hard; perfectly captures the **AI effect** (see 5.1).

### 3.4 John Haugeland — "GOFAI" (1985)
"Good Old-Fashioned AI": the symbolic-manipulation paradigm dominant from the mid-1950s through mid-1990s. Two claims: (i) intelligent behavior comes from reasoning; (ii) reasoning is internal automatic symbol manipulation.
- Now used pejoratively to mark what current ML/DL is *not*.

---

## 4. Industry Labs

### 4.1 OpenAI Charter (2018)
Defines **AGI** rather than AI: "**highly autonomous systems that outperform humans at most economically valuable work.**" Mission: "ensure AGI benefits all of humanity."
- Economic-impact definition, not a cognitive one. Benchmark is labor substitution.

### 4.2 DeepMind / Demis Hassabis
Founding mission: "**solve intelligence, and then use that to solve everything else.**" Hassabis: AI is "the science of making machines smart." Approach explicitly couples neuroscience and ML.
- Treats "intelligence" as a singular underlying problem to be cracked — methodologically opposite to the EU AI Act's behaviorist, technology-neutral framing.

### 4.3 Anthropic
No formal definition published. Frames AI as a **transformative dual-use technology** requiring "reliable, interpretable, and steerable AI systems." Emphasis on safety / alignment as constitutive of AI development, not an add-on.
- Definitionally agnostic; pragmatically focused on frontier LLMs.

### 4.4 Google / Google AI
Public materials describe AI as "machines that exhibit human-like intelligence" or "systems that learn from data" — no canonical Google-wide definition; engineering-centric and ML-default.

---

## 5. Critical / Sociotechnical

### 5.1 Larry Tesler — the "AI effect" (≈1970s)
"**Intelligence is whatever machines haven't done yet.**" Often paraphrased as "AI is whatever hasn't been done yet." Captures the recurring pattern (Pamela McCorduck, *Machines Who Think*) that solved problems — chess, OCR, route-finding, speech recognition — get reclassified as "just computation" once they work.
- Methodological consequence: the term "AI" has no stable referent; it migrates to the unsolved frontier.

### 5.2 Kate Crawford — *Atlas of AI* (2021)
"AI is **an idea, an infrastructure, an industry, a form of exercising power, and a way of seeing.**" Chapters mapped to Earth, Labor, Data, Classification, State.
- Reframes AI from algorithm to extractive supply chain. Explicitly anti-Cartesian: rejects the "disembodied brain" framing in favor of mines, warehouses, datasets, and labor.

### 5.3 Bender, Gebru, McMillan-Major, Mitchell — "Stochastic Parrots" (FAccT 2021)
LLMs are systems for "**haphazardly stitching together sequences of linguistic forms it has observed in its vast training data, according to probabilistic information about how they combine, but without any reference to meaning.**"
- Implicit definitional move: what the industry calls "AI" or "language understanding" is statistical form-mimicry. Draws a hard line between *form* and *meaning*; denies LLMs the "understanding" word.

### 5.4 AI Now Institute (Crawford & Whittaker, founded 2017)
Operates with a **sociotechnical** definition: AI is not a discrete technology but the assemblage of models + data + labor + institutional deployment + downstream effects. Their *Discriminating Systems* (2019) treats demographic composition of the AI workforce as constitutive of AI itself, not external to it.

---

## 6. Historical Drift (the moving definition)

Rough lineage of what "AI" has meant in dominant usage:
- **1956–1970s:** symbolic reasoning, search, theorem proving (Dartmouth → SHRDLU → Shakey).
- **1980s:** expert systems / knowledge bases (MYCIN, XCON); first commercial "AI" boom; AI winter when knowledge acquisition bottleneck hit.
- **1990s–2000s:** statistical ML, SVMs, Bayesian methods. Many practitioners stopped calling their work "AI" to avoid winter stigma — used "machine learning," "data mining," "statistical inference" instead.
- **2012–2017:** deep learning ascendancy (AlexNet, AlphaGo). "AI" rebranded around neural nets.
- **2020–present:** "AI" colloquially collapses to **generative models / LLMs / diffusion**. EU AI Act, US EO, China rules all written in this shadow.

The **AI effect** (Tesler) operates in both directions: chess and OCR exit the AI label once they work; LLMs enter it once they impress. This is why no two regulations or labs draw the boundary the same way.

---

## 7. Key Tensions to Flag for Readers

| Axis | One pole | Other pole |
|---|---|---|
| Scope | EU AI Act (broad: any inferring system) | China Interim Measures (narrow: only generative services) |
| Criterion | Behavioral (R&N "acting rationally", OECD/EU) | Cognitive (DeepMind "solve intelligence", McCarthy) |
| Frame | Technical artifact (NIST, ISO) | Sociotechnical assemblage (Crawford, AI Now) |
| Capability | Statistical pattern-matching ("stochastic parrots") | Emergent intelligence (OpenAI AGI clause) |
| Time-stability | Fixed engineering definition (ISO 22989) | Inherently moving target (Tesler/AI effect) |
| Regulation gating | Autonomy + adaptiveness required (EU) | Outputs alone sufficient (NIST, ISO) |

A regression model used to score loan applicants:
- **EU AI Act:** probably yes (high-risk if used for creditworthiness).
- **NIST/ISO:** yes — generates predictions for an objective.
- **UK AISI:** no — not frontier.
- **China Interim Measures:** no — not generative.
- **R&N:** yes — rational agent.
- **Bender/Crawford:** yes, and "AI" was always a marketing label for it anyway.

A thermostat:
- **All regulatory/standards definitions:** no (no inference).
- **R&N "acting rationally":** technically yes (the canonical *AIMA* example of a trivially rational agent — they use it to make a point about the spectrum, not to flatter thermostats).

---

## Sources

- [EU AI Act, Article 3 — Definitions](https://artificialintelligenceact.eu/article/3/)
- [Commission Guidelines on the definition of an AI system (Feb 2025)](https://ai-act-service-desk.ec.europa.eu/sites/default/files/2025-08/commission_guidelines_on_the_definition_of_an_artificial_intelligence_system_established_by_regulation_eu_20241689_ai_actenglish_nf2skcqfrtjdfggjavcodopcwz4_112455.PDF)
- [OECD updated AI system definition (Nov 2023)](https://oecd.ai/en/wonk/ai-system-definition-update)
- [NIST AI RMF 1.0 (NIST AI 100-1)](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)
- [Executive Order 14110 (Federal Register)](https://www.federalregister.gov/documents/2023/11/01/2023-24283/safe-secure-and-trustworthy-development-and-use-of-artificial-intelligence)
- [UK AI Security Institute — About](https://www.aisi.gov.uk/about)
- [China Interim Measures on Generative AI (translation)](https://www.chinalawtranslate.com/en/generative-ai-interim/)
- [ISO/IEC 22989:2022](https://www.iso.org/standard/74296.html)
- [IEEE Ethically Aligned Design](https://standards.ieee.org/wp-content/uploads/import/documents/other/ead_v2.pdf)
- [Dartmouth Proposal (McCarthy et al. 1955)](http://jmc.stanford.edu/articles/dartmouth/dartmouth.pdf)
- [Russell & Norvig, AIMA — Chapter 1](https://people.eecs.berkeley.edu/~russell/aima1e/chapter01.pdf)
- [Marvin Minsky — Wikiquote](https://en.wikiquote.org/wiki/Marvin_Minsky)
- [Symbolic AI / GOFAI — Wikipedia](https://en.wikipedia.org/wiki/Symbolic_artificial_intelligence)
- [OpenAI Charter](https://openai.com/charter/)
- [Google DeepMind — About](https://deepmind.google/about/)
- [Anthropic — Company](https://www.anthropic.com/company)
- [AI effect — Wikipedia (Tesler's theorem)](https://en.wikipedia.org/wiki/AI_effect)
- [Kate Crawford, *Atlas of AI* — Wikipedia summary](https://en.wikipedia.org/wiki/Atlas_of_AI)
- [Bender, Gebru, McMillan-Major, Mitchell — "On the Dangers of Stochastic Parrots"](https://faculty.washington.edu/ebender/papers/Bender-NE-ExpAI.pdf)
- [AI Now Institute — *Discriminating Systems*](https://ainowinstitute.org/wp-content/uploads/2023/04/discriminatingsystems.pdf)
