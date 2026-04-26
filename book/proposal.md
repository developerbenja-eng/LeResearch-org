# Book proposal — working draft

This is the 1–2 page planning document for the book project. It is
intentionally short, intentionally revisable, and intentionally
committal: each field below should be filled in even if the answer is
provisional, because forcing a provisional answer surfaces the
disagreements that need to be worked through before drafting begins.

Revise heavily. Date each substantive revision at the bottom.

---

## Title

**Working candidates** (one to be picked; subtitle to be written
once the title is locked):

1. **The Frontend** — accessible, mysterious enough to invite, names
   the central concept. Single-noun titles (Sapiens, Behave, Determined)
   tend to work in this genre.
2. **Inherited Frames** — descriptive, names §2 calcification directly,
   sets up the diagnostic register.
3. **Decompose** — verb-as-title. Names the §4 move, the imperative
   the book is making. Punchier.
4. **The Knee-Jerk Decade** — names the §7 / Klein moment that the
   AI conversation is currently inside. Most journalistic register;
   most timestamped (will date faster).

Recommendation: **The Frontend** as the leading candidate; *Inherited
Frames* or *Decompose* as backups depending on the spine decision.

## One-line elevator pitch

*Capacity has always been environmental — and the design of the
environment is now being decided, in our names, with a vocabulary
we cannot argue with. This book gives you the vocabulary back.*

(One sentence. Should fit on a book cover. Will be revised dozens of
times.)

## Spine

Three parts, ~70 pages each, ~3–4 chapters per part.

**Part I — The Inheritance** (chapters 1–4)
> How frontends shape capacity, how inherited frames stay, and why
> the slow gradient of change is structurally invisible.

Drawn from §1 (capacity is environmental), §2 (calcified frames),
§3 (the normalization gradient).

**Part II — The Compression** (chapters 5–8)
> What AI is doing now: to the institutional facts we live inside,
> to the labor we have organized our lives around, to the discourse
> through which we used to disagree.

Drawn from §4 (AI semantic black box), §5 (AI and labor), §6
(compression and silent versioning).

**Part III — The Work** (chapters 9–12)
> What to do, and what to refuse to do. The mirror failure that
> makes refusal-to-analyze look like humility, the tension the
> framework holds, the operational principles, and the politics of
> bringing this analysis into rooms not yet ready for it.

Drawn from §7 (mirror failure), §8 (the tension), §9 (operational
principles), and the gap the framework has not yet named — the
relational physics of the analytic posture.

## Proposed chapter list (~12 chapters, ~15 pages each)

**Part I — The Inheritance**
1. The Frontend Has Always Been Part of the Environment
2. Inherited Frames Calcify as Infrastructure
3. The Normalization Gradient — Why Slow Change Is Invisible
4. Imagined Orders, From Dunbar to Print to Algorithm

**Part II — The Compression**
5. The Word *AI* — A Semantic Black Box
6. Recommender Systems — The Fifteen Years We Did Not Notice
7. Generative AI as the Visible Edge
8. AI and Labor — The Wrong Question and the Right One

**Part III — The Work**
9. Compression, Silent Versioning, and the Risk of Lockstep Truth
10. The Mirror Failure — Refusal-to-Analyze as Privileged Pathology
11. The Tension We Are Trying to Hold
12. The Politics of Bringing This Analysis Into the Room

## Audience

**Primary:** an informed general reader who is suspicious of both
AI hype and AI doom and who suspects the public conversation is
failing them. Mid-career professionals — educators, nonprofit
leaders, technical workers, lawyers, doctors, librarians — who
use the word *AI* in conversation but cannot decompose it.

**Secondary:** undergraduate and graduate students who would
benefit from a single book that integrates the philosophical
substrate (Castoriadis, Bourdieu, Searle, etc.) with the
empirical AI literature (Zuboff, Crawford, Bender, etc.) at a
manageable length.

**Not the audience:** specialists in any single discipline reading
for primary research; doom-AI or hype-AI partisans expecting
validation.

## Length target

~200 pages (~50,000–60,000 words). Deliberately shorter than
*Behave* (~800), *The Age of Surveillance Capitalism* (~700),
or *Sapiens* (~450). Closer to *Bullshit Jobs* (~280),
*Determined* (~450 but readable), or *Why Zebras Don't Get
Ulcers* (~500 but textbook-paced).

The 200-page constraint is the production discipline. It forces
the spine decision, forces every chapter to do load-bearing work,
and makes the book actually finishable.

## Comparable titles (for back-cover and pitch use)

- **Sapiens** (Harari, 2014) — Sapiens-accessible voice; the book
  the framework treats critically (see `/philosophy/threads/harari`).
- **Behave** / **Determined** (Sapolsky) — the rigor target.
- **Bullshit Jobs** (Graeber, 2018) — comparable scope, punchier
  voice, popular but rigorous; closest model for length and register.
- **The Age of Surveillance Capitalism** (Zuboff, 2019) — the
  empirical anchor for Part II.
- **Nexus** (Harari, 2024) — direct topical competitor; treated
  critically; good foil for positioning.
- **Power and Progress** (Acemoglu & Johnson, 2023) — economic
  angle on adjacent question.

## Production decisions

- **Format:** web-first, bookdown-style. Single Markdown source
  → web (with hover/click expansions linking into the existing
  LeResearch `/philosophy/threads`, `/philosophy/cases`, `/ai/*`
  pages) + clean PDF + print-ready EPUB.
- **License:** Creative Commons BY-SA 4.0.
- **Print distribution:** IngramSpark print-on-demand once the
  web version is stable. Trade publisher possible later under the
  existing CC license; not required.
- **Source of truth:** this `book/` folder in the LeResearch repo.
  Markdown chapters under `chapters/`. Build configuration under
  `build/`. Ignored by Vercel (lives outside `apps/web/`).
- **Audience-building layer:** the existing LeResearch site is the
  free public-good layer (the role Sapolsky's BIO 150 YouTube
  lectures play for him). The book is the deeper synthesis.

## Toolchain recommendation

**Quarto** for book production. Pandoc-based, modern bookdown
successor, single Markdown source → web + PDF + EPUB. Cleanly
separates the book build from the Next.js web app build.
Quarto's `_quarto.yml` book project configuration handles
chapter ordering, cross-references, citations (via BibTeX or
CSL-JSON), and footnotes natively.

Alternatives considered:
- **bookdown** (R-based, mature) — overkill, R-ecosystem-specific.
- **mdBook** (Rust) — too lightweight for a real book with footnotes.
- **MDX in Next.js** — would put the book inside `apps/web/`, which
  defeats the Vercel-exclusion request.

## What is in scope, what is not

**In scope:**
- The framework material already on the LeResearch site
  (`/philosophy`, the 13 threads, `/philosophy/cases`, the
  `/ai/*` investigation).
- Original synthesis tying the philosophical substrate to the
  contemporary AI moment.
- A dozen worked cases drawn from `/philosophy/cases` and the AI
  investigation.
- The framework's existing voice (conditional, humble about what
  we don't know, political when honesty requires it).

**Not in scope (for first edition):**
- Original empirical fieldwork beyond what already exists.
- Comprehensive coverage of every philosopher in the threads
  series — the book references them; the threads pages handle
  the deep dives.
- A unified theory of mind or consciousness — adjacent but a
  different book.
- Policy prescriptions at national-government scale — out of
  voice.

## What is missing (open questions to resolve before drafting)

1. Title locked? (Recommendation: *The Frontend*, with the
   subtitle written after Part I is drafted.)
2. Spine truly committed to three parts? Or four?
3. Co-authors or empirical specialists for any chapter? Likely
   useful for chapters 6 (recommender systems empirical
   evidence) and 8 (AI and labor empirical evidence).
4. Realistic timeline? (Honest assessment: 12–18 months part-time
   to a finished first edition, given the framework material is
   already drafted at the section level.)

## Smallest concrete first step after this proposal is approved

Draft **Chapter 1 — The Frontend Has Always Been Part of the
Environment**. ~15 pages. Re-uses the §1 philosophy-page material
as starting point but writes it as a book chapter — meaning a
narrative opening, a sustained argument, full citations to
Sapolsky and the relevant developmental and educational
literatures, and a closing that hands the reader to Chapter 2.
A finished Chapter 1 is the fastest way to discover whether the
spine, voice, length, and toolchain decisions actually work.

---

*Last revised 2026-04-25. Living document; revise heavily.*
