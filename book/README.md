# Book project

The 200-page open-source book that synthesizes the LeResearch framework
(Sapiens-accessible voice + Sapolsky-rigorous backing).

This folder is the working directory for the book project. It lives in
the LeResearch monorepo for source-control convenience but is **not**
deployed to Vercel (the Vercel project root is `apps/web/`, so anything
outside that path is automatically excluded from deploys).

## Where to start

Read `proposal.md` first. It is the working planning document — title
candidates, spine, chapter list, audience, production decisions,
toolchain. Everything else in this folder will be downstream of those
decisions.

The proposal is intentionally short and intentionally revisable. It
will be heavily edited as the work progresses.

## Production decisions (locked in pending the proposal review)

- **Format:** web-first, bookdown-style. Single Markdown source-of-truth
  compiles to (a) a live web book with embedded hover/click expansions
  linking into the existing LeResearch `/philosophy/threads`,
  `/philosophy/cases`, and `/ai/*` pages, and (b) a clean PDF + print-ready
  version with traditional endnotes pointing to those same URLs.
- **Length target:** ~200 pages (~50,000–60,000 words).
- **License:** Creative Commons BY-SA 4.0 (free to share, adapt, and
  translate; share-alike on derivatives).
- **Print:** IngramSpark print-on-demand once the web version is stable.
  No publisher needed for the first edition; if a publisher comes later
  (MIT Press, Open Book Publishers, Punctum, similar), the CC license
  is already compatible.
- **Audience-building layer:** the existing LeResearch site
  (`/philosophy`, `/ai/*`, `/rethinking`) plays the role
  Sapolsky's Stanford BIO 150 YouTube lectures play for him —
  the free public-good entry point.

## File layout (planned)

```
book/
├── README.md            ← you are here
├── proposal.md          ← the planning document; revise heavily
├── outline/             ← chapter-by-chapter outlines (drafts in progress)
├── chapters/            ← actual chapter drafts (Markdown)
├── notes/               ← working notes, source quotes, debate journals
├── figures/             ← diagrams (SVG + source), original photographs
└── build/               ← Quarto / Pandoc build configuration
```

Most of these subdirectories don't exist yet; they'll be created as the
work moves into them.

## Toolchain (recommendation pending review)

Recommended: **Quarto** for book production. Pandoc-based, modern
successor to bookdown, can output the same Markdown source as web,
PDF, and EPUB. Cleanly separates the book's build pipeline from the
LeResearch web app's Next.js build.

Alternatives considered: bookdown (R-based, mature but R-centric),
mdBook (Rust ecosystem, simpler but feature-light), MDX inside the
existing Next.js app (would defeat the Vercel-exclusion request).

## License

CC BY-SA 4.0. The full license text will live at `LICENSE.md` once
the first chapter draft exists. Until then, treat this folder as
all-rights-reserved by the author for editing convenience.
