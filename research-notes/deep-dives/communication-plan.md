# Communication Plan: The Real Problem with AI

How to make the four-deep-dive investigation navigable for non-linear readers, not just a long essay. Compiled 2026-04-24.

## Premise

Linear text privileges the patient reader. Most readers — even motivated ones — scan, jump, skim, and need *visual entry points* to commit. The investigation has four acts (definitions → environment → tracking → real problem) and three layers per act (claim → receipt → source). A good design surfaces all of that without forcing top-down reading.

This plan reuses what already exists in `apps/web/src/`:
- The **`teaching-svg`** principles from LeDesign-ai (one-question-per-figure, semantic palette, motion-as-mechanic)
- The **`FigShell`** + `palette.ts` in `components/teaching-svg/`
- The **rethinking page pattern**: scroll-reveal sections, podcast-with-transcript, `<Term>` definitions, citations, mini-player, paper reader
- The existing **`AISemanticBlackBox`** in `app/philosophy/components/` — the row-repeater archetype that *already* visualizes "AI is many things"

We don't invent new infrastructure. We compose what's there into a new route.

---

## Information architecture

Proposed route: `/ai` (with subroutes `/ai/definitions`, `/ai/environment`, `/ai/tracking`, `/ai/real-problem`) — siblings of `/philosophy` and `/rethinking`.

Each act is its own scrollable page with a shared global TOC; the integrating piece (`/ai`) is the four-act long-form. Subroutes act as both standalone deep-dives and TOC targets.

```
/ai                       ← four-act long-form (the integrating piece)
  /definitions            ← Act I deep-dive
  /environment            ← Act II deep-dive
  /tracking               ← Act III deep-dive
  /real-problem           ← Act IV deep-dive (the conclusion)
```

A reader can land on `/ai` and scroll through, OR jump straight to `/ai/real-problem` from a TOC, OR enter mid-page from a citation, OR skim only the figures. Every path should work.

---

## Cross-cutting components (build once, reuse everywhere)

### 1. `<TOCRail>` — left rail, scroll-spy
Sticky on desktop, drawer on mobile. Highlights current section. Each entry shows act number, short title, est. read-time, and a glyph indicating density (text-only / has-figures / has-data / has-audio). Clicking jumps with smooth scroll; URL hash updates so links are shareable.

### 2. `<ClaimCard>` — the receipt pattern
Every load-bearing factual claim wrapped in a card with three states:
- **Surface**: the claim, in prose
- **Receipt** (on click/expand): the specific number, date, methodology caveat
- **Source** (in receipt): linked citation with date stamp

Visual: a thin amber bracket on the left margin (matching teaching-svg semantic color for "rule / mapping / note"). Expanding reveals a `<details>`-style panel. Cite-as-you-go without breaking flow.

```tsx
<ClaimCard
  claim="A typical Gemini text prompt uses about 0.24 Wh."
  receipt="Google's Aug 2025 methodology paper, full-stack including idle infrastructure. May 2025 measurement window."
  source={{ url: '...', date: '2025-08-21', publisher: 'Google Cloud' }}
  staleness="annual"
/>
```

A `staleness` prop drives a small badge: "live" (re-checked in last 30d), "current" (90d), "stale" (older). The `staleness=stale` cards trigger a refresh task in our notes.

### 3. `<Term>` — definition popover
Already exists in `app/rethinking/_components/Term.tsx`. Reuse for: AGI, RLHF, PUE, CapEx, Jevons paradox, MoE, x-risk, EA, TESCREAL, Stochastic Parrots, alignment, frontier model. A small dotted underline; tap to expand inline.

### 4. `<PodcastPlayer>` + transcript
Pattern lifted from `/rethinking`. One ~25-min audio walkthrough per act, four total. The transcript is a real `<article>` so screen readers and printers work. The mini-player persists across scroll.

### 5. `<Sources>` — endnote rail
Right rail on desktop showing the live citation list for the section in view; auto-scrolls to the cited entry when a `[n]` is clicked in body text. On mobile, collapses to a footer accordion.

### 6. `<StalenessFooter>` — "last verified"
Per-page footer: "Last verified against IEA, Hugging Face AI Energy Score, and earnings cycle data on 2026-04-24. Earliest expected staleness: hyperscaler capex (next quarterly earnings)." Links to a `/ai/methodology` page describing how the work is maintained.

### 7. `<PrintExport>` — reuse `academic-docx` skill
Button: "Export as DOCX (committee-ready)" wired to `lib/grants/export/markdown-to-docx.ts`. Same infrastructure that produces academic documents now produces the investigation as a navigable Word file with TOC, page numbers, running header.

---

## Act I — "What is AI?" (`/ai/definitions`)

**One question**: What does the word *AI* refer to, and to whom?

**Linear text**: 5–8 short sections, ~1500 words total. Lots of pull-quotes; minimal prose. Frame as a tour, not an argument.

**Figures** (in render order):

#### Fig 1.1 — `DefinitionsMatrix.tsx` (Comparison archetype)
A 2D grid: rows = entities (EU AI Act, NIST, OECD, OpenAI, R&N, Bender, China CAC, ISO), columns = boundary criteria (requires inference? requires autonomy? counts a thermostat? counts a regression model? counts ChatGPT?). Cells are colored chips (✓ / ✗ / partial). Reveals the disagreement immediately.

*Why a grid, not prose*: the table cells make the inconsistency visible in a way bullet points don't.

#### Fig 1.2 — `AIEffectTimeline.tsx` (Motion-as-mechanic)
Horizontal timeline 1956–2026. Tags appear above the line for things that *were* called AI when invented (chess engine, OCR, routing, speech-to-text, AlphaGo, GPT-4). On scroll-trigger, each tag drops below the line as it stops being called AI ("once it works, it isn't AI anymore"). The motion *is* the mechanic — Tesler's effect made visible.

#### Fig 1.3 — `ModelSpectrum.tsx` (extend existing `AISemanticBlackBox`)
The existing diagram is already this. We extend it with two new columns: **typical query energy** and **where it runs** (data center / workstation / laptop / phone NPU). Same row-repeater pattern, same palette. Now spans Act I → Act II.

#### Fig 1.4 — `ThermostatLoanChatGPT.tsx` (Schematic-with-callouts)
Three artefacts side by side (thermostat, loan-scoring regression, ChatGPT). Each is shown with which definitions accept/reject it. Single takeaway: the same rule classifies the three differently across regulators.

**Interactive**: an `<AIClassifier>` widget — the user picks one definition from a dropdown, the matrix highlights what it includes. Five lines of state, big payoff.

---

## Act II — "How big is the actual footprint?" (`/ai/environment`)

**One question**: What does the energy/water/carbon of AI actually look like, fairly compared to other things?

**Linear text**: ~3000 words across three sub-acts (per-query, model spectrum, capex/finance). The acts are visually distinct — different background tint per sub-act, semantic palette stays constant.

**Figures**:

#### Fig 2.1 — `ScaleLadder.tsx` (Row-repeater + interactive)
The 24-row table from `01-scale-comparisons.md`, rendered as a horizontal bar chart on a log scale. Bars are color-coded: digital (cyan), household (white), transport (amber), food (red), AI specifically (violet). Hovering a bar reveals the source.

**Interactive**: a `<DailyMix>` toggle — user enters how many AI prompts they make per day, the bar updates in real time alongside their other plotted activities (set defaults to "average user" / "heavy user" presets). One-shot intuition pump.

#### Fig 2.2 — `WaterCompare.tsx` (Comparison archetype)
Two columns: "AI water" (5 drops per Gemini prompt; ~500 mL per ~30 GPT-4 prompts as worst case) vs "everyday water" (140 L per coffee, 4.2 L per almond, 2,700 L per t-shirt, 15,400 L per kg beef). Bars on a shared log axis. The color of the AI column matches the model size from Fig 1.3 — semantic carry-through.

#### Fig 2.3 — `ModelEnergyMap.tsx` (extending Fig 1.3)
Same row-repeater, but now bars show actual measured Wh per query: 5 mWh phone NPU → 40 mWh local 8B → 240 mWh cloud Gemini → ~7 Wh reasoning model. Six orders of magnitude rendered on a log axis. The "AI is many things" thesis becomes immediate.

#### Fig 2.4 — `EfficiencyVsVolume.tsx` (two-line chart, motion-as-mechanic)
Two lines on the same axes: (a) per-query energy dropping ~3× / year (Epoch + Google), (b) total inference energy growing faster. Optional scrub control: drag a year slider, both lines and the area between them update. The Jevons paradox shown, not asserted.

#### Fig 2.5 — `CapexFlywheel.tsx` (Network/flow)
A directed graph: NVIDIA → CoreWeave → OpenAI → Microsoft → NVIDIA, with side flows (Stargate equity, sovereign wealth, BlackRock GAIIP). Node size = market cap; edge thickness = $ flowing. Click a node, see who pays and who receives. Three labeled cycles highlighted with semantic color.

#### Fig 2.6 — `WhoPays.tsx` (Sankey)
Hyperscaler capex ($680B 2026) on the left flowing through to grid (PJM +833%), nuclear PPAs (TMI, Talen), gas turbines (80GW backlog), water (Bloomberg's 2/3 in stressed regions), and finally to *who absorbs the cost if AI demand undershoots*: equity holders → ratepayers → taxpayers (DOE loans) → pensioners (passive Mag 7 exposure). The socialization of risk made literal.

#### Fig 2.7 — `GridLoad.tsx` (timeline + projection band)
IEA data centers TWh 2010–2024 actual + 2025–2030 projection band (low/mid/high), with cement, steel, aviation, household AC laid alongside as percentage-of-global-electricity reference lines. AI gets contextualized in the global energy hierarchy.

---

## Act III — "Who's watching?" (`/ai/tracking`)

**One question**: Who evaluates AI capability and bias, and how independent are they?

**Linear text**: ~1500 words. Bullet-y by nature; visualization carries the load.

**Figures**:

#### Fig 3.1 — `TrackerMap.tsx` (Schematic-with-callouts, the centerpiece)
A 2D scatter: x-axis = independence (industry self-report → IND-academic → IND-nonprofit → adversarial); y-axis = scope (capability tracking → safety → bias → labor/sociotechnical). Each org is a node, sized by budget where known. Color-coded by funder type. Clicking a node opens a card with: what they track, key finding, URL.

**Interactive**: filters for "evaluates LLMs / image / multimodal / agents", "publishes openly / behind closed doors", "takes industry money / doesn't".

#### Fig 3.2 — `CapabilityClimb.tsx` (Comparison + motion-as-mechanic)
METR's "task completion horizon doubles every ~7 months" curve, with anchor data points (apprentice cyber 9% → 50%, self-replication 5% → 60%, MMMU/GPQA/SWE-bench jumps from Stanford HAI). Motion: the curve extrapolates forward as the user scrolls into view. Stops at the data; the dashed projection beyond is labeled "extrapolation".

#### Fig 3.3 — `BiasShowcase.tsx` (Row-repeater)
Five bias findings as cards with the receipt visible:
- Gender Shades: 34.7% vs 0.8% misclassification (40× gap)
- Bloomberg Stable Diffusion: 3% women in "judge" prompts vs 34% reality (amplification)
- DecodingTrust: GPT-4 *more* jailbreakable than 3.5
- Chen/Zaharia/Zou: GPT-4 prime-ID 84% → 51% in 3 months
- C4 safety filter: disproportionately removed AAVE + LGBTQ+ content

Each card: one-sentence claim, the number, the source, the link.

#### Fig 3.4 — `IndependenceCheatSheet.tsx` (just text but laid out as a pyramid)
DAIR / AI Now / AlgorithmWatch at the top (most adversarial); Open-Phil-funded eval orgs in the middle; lab self-reports at the bottom. Same data as Section 4 of the tracking notes; visual hierarchy makes the gradient stick.

---

## Act IV — "What's the real problem?" (`/ai/real-problem`)

**One question**: Why are we discussing AI the way we are, and what's being hidden?

**Linear text**: ~3500 words. This is the long act, because the displacement thesis needs argument.

**Figures**:

#### Fig 4.1 — `DiscoursePincer.tsx` (Schematic-with-callouts, the thesis figure)
A central "displaced harms" box (labor, surveillance, deepfakes, mental health, concentration). Two arrows squeezing it from above (DOOM: x-risk, extinction, alignment) and below (HYPE: AGI, transformation, race). Both arrows colored with the *same* color (semantic: red — "failure / critical takeaway"). Annotations on each arrow: who funds it, what they get from it.

This is the diagram that has to land. It's the entire argument in one image.

#### Fig 4.2 — `DoomMoneyFlow.tsx` (Sankey)
Donor sources (Open Philanthropy, Survival & Flourishing Fund, Buterin/FLI, Future Fund/FTX) → recipient orgs (MIRI, FLI, CAIS, METR, Apollo, Redwood, Anthropic seed) → outputs (papers, statements, policy filings, regulation supported). Each flow labeled with $ where documented. Click an org, see the receipt: 990 filing, year, amount.

#### Fig 4.3 — `HypeMoneyFlow.tsx` (mirror Sankey)
Hyperscaler capex + sovereign wealth + VC → recipients (NVIDIA, OpenAI, Anthropic, Anduril, Palantir) → policy outcomes (Stargate $500B, Trump AI Action Plan, UAE chip access, EU AI Act delays). Same visual language as 4.2 to make them obviously parallel.

#### Fig 4.4 — `PublicVsElite.tsx` (Comparison archetype)
Two parallel bar charts, mirror of each other:
- LEFT: what the *public* fears, per Pew/Reuters (jobs 71%, deepfakes 77%, atomization 66%, energy 61%, extinction ~low)
- RIGHT: what *elite policy discourse* discusses (alignment, frontier capability, x-risk, compute thresholds, AGI timelines)

The visual gap is the displacement.

#### Fig 4.5 — `DoomGenealogy.tsx` (Network/tree)
A directed lineage: Extropians (1990s) → Singularitarians (2000s) → MIRI (2000) → FHI (2005) → EA (2010s) → 80,000 Hours (2011) → CAIS (2022) → Anthropic safety team / Bletchley Declaration (2023). Side branches show the personnel overlap (Yudkowsky, Bostrom, Tallinn, Karnofsky, Amodei). The point: it's small and identifiable, not broad consensus.

#### Fig 4.6 — `DisplacedHarmsAtlas.tsx` (Map / grid)
A literal world map (D3 geo, lightweight) with pins for:
- Sama / Kenya (Hao reporting)
- Robodebt / Australia
- toeslagenaffaire / Netherlands
- Lavender / Gaza
- ImmigrationOS / US
- Worldcoin shutdowns (Kenya, Thailand, Colombia, Philippines)
- Romania election annulment
- xAI Colossus / Memphis air pollution

Pin = case; click reveals the receipt. Geographic distribution makes the point: this is happening *now, everywhere*.

#### Fig 4.7 — `WhoExitsWhen.tsx` (Time-series with annotations)
Insider stock-sale cadence overlaid on company stock: Huang's $2.9B+ in 10b5-1 sales over 18 months while NVIDIA stock climbed; OpenAI two tender offers in 12 months. Annotations on each sale event. The visual: paper-to-cash schedule in the middle of the maximalist demand narrative.

#### Fig 4.8 — `AccountabilityProgram.tsx` (Row-repeater)
The 12-point positive program from `03-displaced-harms.md`. Each row: the principle, who it would constrain, who it would empower, the specific case it responds to. Format: same row-repeater archetype as Fig 1.3 / 2.3 — visual continuity matters.

---

## The integrating piece (`/ai`) — the long-form

A single scroll, four acts. Every act ends with a "JUMP TO DEEP DIVE" link that opens the corresponding subroute in a new tab. The integrating piece carries:
- A short Hero (the displacement thesis in one paragraph)
- Each act's centerpiece figure (4.1 + 1.3 + 2.7 + 3.1 + 4.6 — six total)
- ~800 words of bridging prose between figures
- A closing "Twelve principles" section that promotes the positive program

Read-time target: 18 minutes. The deep-dive routes carry the rest.

---

## Audio program

Four ~25-minute episodes, one per act, hosted on the page (reuse `PodcastPlayer.tsx` from rethinking). Optional "all four back-to-back" 90-min mode.

Episode structure mirrors the Echo-Learn deep-dive style (the user has the `podcast-review` skill for QA). Each episode has a full transcript so the page is searchable, screen-readable, and indexable.

Per-episode sidebar: "figures referenced in this episode" jumps the reader to the diagram in the page.

---

## Navigation patterns

1. **TOC rail** (`<TOCRail>`) — sticky, scroll-spy, four acts + sub-sections
2. **Mini-player** persistent at the bottom for whichever podcast is active
3. **Cite jump** — clicking a `[n]` in body scrolls the right rail to that source and highlights it
4. **Figure-anchor URLs** — every figure has its own anchor; sharing a link to `#fig-2-5` deep-links to it
5. **"Receipt" expand-all toggle** — top-right of each act. For readers who want every claim verified inline.
6. **Print/Export** — DOCX via `academic-docx`, and a "save as PDF" CSS print stylesheet
7. **Search** (later) — a flat-text search across the four routes

---

## Component build order (recommended)

Cheapest-to-most-complex; validate the design language early.

1. **TOCRail + ClaimCard + StalenessFooter** — the chrome. One day.
2. **Extend `AISemanticBlackBox` → `ModelSpectrum`** with energy column. Half day.
3. **Fig 2.1 ScaleLadder** (with `DailyMix` interactive) — the most teachable artifact. One day.
4. **Fig 4.1 DiscoursePincer** — the thesis figure. Half day. Drives whether the argument lands.
5. **Fig 4.4 PublicVsElite** — the empirical receipt for the thesis. Half day.
6. **Fig 4.6 DisplacedHarmsAtlas** — the emotional anchor. One day (D3 geo is the only new dependency).
7. **Figs 4.2 + 4.3 Money flows** — the documentary backbone. One day each.
8. **Fig 2.5 CapexFlywheel + 2.6 WhoPays** — the systemic argument. One day each.
9. **Remaining figures** — order by which act ships first.
10. **Podcast scripts + recording** — last; can ship behind a feature flag.

A motivated week ships acts I + IV (the bookends — the thesis lives in IV, the entry lives in I). Acts II + III ship in week two. Audio in week three.

---

## Design discipline (from `teaching-svg` SKILL.md)

Apply on every figure without exception:
- One question per diagram (if it feels busy, split it)
- Data is data; layout is data — content is a typed array iterated via `.map()`
- `viewBox` for free responsiveness; no JS resize listeners
- Shared `COLORS` palette: cyan (active), green (correct), amber (rule), red (failure)
- Motion only when it IS the mechanic (Fig 1.2, 2.4 — yes; Fig 1.1 — no)
- Sparse SVG labels, dense `<figcaption>` with color-matched spans
- One red-dashed callout at the bottom with the takeaway
- Mobile-readable at ~390px; dark-theme neutrals in `rgba(255,255,255,0.X)`
- No chart libraries — raw SVG only

The existing `AISemanticBlackBox` is the reference implementation. Copy its shape.

---

## Maintenance plan

The investigation goes stale fast (capex quarterly, court cases monthly, polling annual). Two patterns:

1. **`<StalenessFooter>` per page** drives what gets refreshed — when a `staleness=stale` ClaimCard count crosses a threshold, the footer turns amber.
2. **Quarterly `/loop`** — schedule a background agent to check IEA, Google AI energy disclosure, METR leaderboard, hyperscaler earnings, and refresh the affected ClaimCards. The user already has the `schedule` skill for this.

A reasonable cadence is one full re-verification per quarter aligned with hyperscaler earnings cycles (Feb, May, Aug, Nov).

---

## What's intentionally out of scope (v1)

- Live data fetched at runtime (defer; harder than it sounds, costs us editorial control)
- AI-generated graphics or animations beyond SMIL — keep everything reproducible from data files
- Comments / discussion features — Substack-style replies belong on a separate channel
- Translation — i18n if it ships, can be wired later via the existing infrastructure
- Per-reader account state — public-first, no login

These are good v2 candidates. v1 is: ship the four acts, the integrating piece, eight to twelve figures, and the audio.

---

## File scaffolding (proposed)

```
apps/web/src/
  app/ai/
    layout.tsx                    ← TOCRail + sticky chrome
    page.tsx                      ← integrating long-form
    methodology/page.tsx          ← how this is maintained
    definitions/
      page.tsx
      _components/
        DefinitionsMatrix.tsx
        AIEffectTimeline.tsx
        ThermostatLoanChatGPT.tsx
        AIClassifier.tsx
    environment/
      page.tsx
      _components/
        ScaleLadder.tsx
        DailyMix.tsx
        WaterCompare.tsx
        ModelEnergyMap.tsx
        EfficiencyVsVolume.tsx
        CapexFlywheel.tsx
        WhoPays.tsx
        GridLoad.tsx
    tracking/
      page.tsx
      _components/
        TrackerMap.tsx
        CapabilityClimb.tsx
        BiasShowcase.tsx
        IndependenceCheatSheet.tsx
    real-problem/
      page.tsx
      _components/
        DiscoursePincer.tsx
        DoomMoneyFlow.tsx
        HypeMoneyFlow.tsx
        PublicVsElite.tsx
        DoomGenealogy.tsx
        DisplacedHarmsAtlas.tsx
        WhoExitsWhen.tsx
        AccountabilityProgram.tsx
  components/
    ai/
      TOCRail.tsx
      ClaimCard.tsx
      StalenessFooter.tsx
      Sources.tsx                 ← endnote rail
      PodcastEpisode.tsx          ← thin wrapper around existing PodcastPlayer
    teaching-svg/                  ← already exists; extend palette if needed
      FigShell.tsx                 ← already exists
      palette.ts                   ← already exists
```

Existing `<Term>` from `app/rethinking/_components/Term.tsx` gets imported directly (or extracted to `components/Term.tsx` once a third surface needs it — per the teaching-svg skill's "copy-paste while there are only two consumers" guidance).

---

## Validation checks before shipping

For each figure:
- [ ] One question stated in one sentence
- [ ] Data is in a typed array, not hardcoded SVG
- [ ] Mobile-readable at 390px
- [ ] Renders in dark theme with palette `rgba(255,255,255,0.X)` neutrals
- [ ] Has a one-sentence red-dashed takeaway callout
- [ ] `<figcaption>` has color-matched spans for the key nouns
- [ ] Cited sources are dated and linked

For each page:
- [ ] TOC rail covers all sections
- [ ] At least one ClaimCard per major claim, with receipt visible on click
- [ ] StalenessFooter populated honestly
- [ ] Print stylesheet renders cleanly
- [ ] DOCX export produces a Word-navigable document

For the whole investigation:
- [ ] Reader can land on `/ai`, scroll, and get the thesis without clicking anything
- [ ] Reader can land on `/ai/real-problem` and have the four-act context made clear in <30 seconds
- [ ] Reader who only looks at figures still gets the argument
- [ ] Reader who only listens to the audio still gets the argument
- [ ] Reader who exports DOCX gets a committee-ready document
