# UX rethink — leresearch.org

The site grew to ~30 pages organically. Three parallel agents (site survey, IA proposal, patterns + components) audited it independently and converged. This plan is the synthesis. Compiled 2026-04-25.

## The diagnosis

Two regimes glued together:
- The **`/ai/*` kingdom** with full chrome: TOCRail, MobileTOC, ClaimCard, TLDRStrip, SectionHeader, ActPager, StalenessFooter.
- **The wilderness everywhere else** (`/philosophy`, `/rethinking`, threads, cases): bare prose with anchor lists.

Three top-nav categories sitting at the same level pretending to be peers: **AI** (a substrate), **Philosophy** (the thesis), **Rethinking** (a product framework). They aren't peers.

The single biggest friction: **`/philosophy` (8,500 words, the conceptual spine) ends with only a "Last revised" timestamp.** A reader who finishes the most demanding page on the site gets zero forward affordance — no link to cases, threads, or the AI investigation that operationalizes the framework.

## The plan — 4 layers, ~5 weeks total

### Layer 1 — Quick wins (1–2 days, no IA risk)
- Add a "Where to go from here" 3-card block at the bottom of `/philosophy`
- Fix `/philosophy/cases` breadcrumb (URL/breadcrumb disagreement)
- Add `Prev` button to `/ai/definitions` so the Acts series is symmetric
- Fix `/rethinking` top breadcrumb (currently says `← LeDesign` which exits the site silently)
- Add hand-curated "see also" footers to the ~11 thread pages currently missing them

### Layer 2 — IA reframe (artifact-type model)
Top nav from substrate-mixed (`AI · Philosophy · Rethinking`) to **artifact-type** (`Thesis · Investigations · Initiatives · Tracks · About`). Substrate becomes a tag axis at `/tracks`.

URL redirects (preserve old anchors via `next.config` rewrites):
```
/philosophy           →  /thesis
/philosophy/cases     →  /cases
/philosophy/threads   →  /threads
/philosophy/threads/{slug}   →  /threads/{slug}
/ai                   →  /investigations/ai-discourse
/ai/{definitions|environment|tracking|real-problem|methodology}
                      →  /investigations/ai-discourse/{...}
/rethinking           →  /initiatives/rethinking
/rethinking/{framework|paper}
                      →  /initiatives/rethinking/{...}
```

New routes added by this layer:
- `/investigations` — index of multi-act investigations
- `/initiatives` — Echo, POA, Rethinking
- `/tracks` + `/tracks/{aquifers|food|learning|ai|methodology}` — substrate-filter views
- `/about` — founding, governance, openness

Why this IA: the philosophy section is in expansion mode. This is the only IA where new sections are *additive* — no track-assignment debate, no IA decision per addition. It also makes the site honest about what it actually is (one thesis + evidence + initiatives) rather than three peers that aren't.

### Layer 3 — Six new components (~5 weeks total, in dependency order)

| # | Component | Purpose | Cost |
|---|---|---|---|
| 1 | `<EpistemicBadge />` | `seedling / developing / evergreen` chip per page; sibling of staleness dot | 1 day |
| 2 | `<RelatedRail />` | Directional `Upstream / Downstream / Sibling` cross-references at bottom of every long page; driven by `relations.ts` graph file | 1 week |
| 3 | `<TagAxes />` + `/topics/[slug]` | Orthogonal back-catalog browsing; e.g. `surveillance` tag spans /ai + /threads + /cases | 1 week |
| 4 | `<SiteCrumbs />` + `<SectionMap />` | Global breadcrumbs in `layout.tsx` + slide-out sitemap drawer from the wordmark | 3 days |
| 5 | `<SeriesPager />` + `<LatestWorkFeed />` | Generalize `ActPager` for any series + Pudding-style numbered-card reverse-chrono feed on `/` | 1 week |
| 6 | `<HoverPreview />` | Wrap internal `<Link>`s with hover-card showing target's TLDR (Gwern-style) | 3 days, last (depends on complete page registry) |

### Layer 4 — Tag every page (taxonomy is the load-bearing decision)
Add a typed `Topic` enum + per-page frontmatter (`topics: [...], tracks: [...], thesisRefs: [§N]`). Once tagged, `/topics/[slug]`, `/tracks/[slug]`, RelatedRail, and HoverPreview all derive from the same data. Without this, the new components have no fuel.

Initial topic enum draft (~10 topics): `discourse-displacement · labor · surveillance-capitalism · normalization · imagined-orders · epistemics · methodology · regulation · monoculture · capacity`.

## Patterns the components borrow from
1. **Wikipedia hatnote + tiered footer** (`See also` / `References` / `Further reading`) — directional cross-references with epistemic role
2. **Stratechery Concepts/Companies/Topics axes** — back catalog as orthogonal axes, not silo
3. **Connected Papers ancestry/derivative split** — make the *direction* of each cross-link visible
4. **Distill thread + license footer** — Series as a first-class abstraction; CC-BY + GitHub-source as default
5. **The Markup "Show Your Work"** — methodology paired with each investigation
6. **Maggie Appleton + Andy Matuschak garden epistemic-status** — `seedling/developing/evergreen` chips
7. **Gwern hover-popups** — preview cross-references without committing to navigation
8. **Pudding numbered-card index** — every output gets a stable shorthand (LR-014) for citation

## Recommended execution order
1. **Layer 1 first** (one focused session, no decisions needed) — fixes the highest-value friction with no risk
2. **Layer 2 IA reframe + redirects** — commit to the artifact-type IA, ship redirects so old URLs keep working
3. **Components 1–3** (`EpistemicBadge`, `RelatedRail`, `TagAxes`) — one focused build
4. **Pause to evaluate** before doing components 4–6
5. Decide after the pause based on what the site feels like with components 1–3 + tags in place

## Decision points (for when we reach Layer 2)
- Naming of nav: my default is `Thesis · Investigations · Initiatives · Tracks · About`. Voice alternatives: `Work · Projects · Substrates`, `Research · Tools · Topics`.
- Component priority within Layer 3: my recommendation has `EpistemicBadge` first (1 day, big visible impact), then `RelatedRail` (the cross-linking gap). Could front-load `SiteCrumbs` if the global "you are here" matters more.
- Tag taxonomy: who picks the enum? Default is I draft from existing pages and the philosophy agent revises.
- `/about` page: the IA reframe wants this as top-level. Worth doing now or defer?

## Sources for this plan
- Three agent reports archived in conversation. Full friction inventory has 8 named friction points; the per-route survey table; the IA-options trade-off matrix; the patterns research with URLs to live examples; the component audit naming what already exists vs. what's missing.
