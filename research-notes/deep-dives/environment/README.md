# Deep Dive: AI Environmental Impact

A three-angle deep investigation. Compiled 2026-04-24. The premise: most public coverage flattens "AI environmental impact" into one number, which produces both alarmist exaggeration ("ChatGPT is destroying the planet") and dismissive hand-waving ("it's nothing"). The honest picture requires three lenses.

| File | Lens | Headline finding |
|---|---|---|
| [01-scale-comparisons.md](./01-scale-comparisons.md) | Per-query in context against everything else people consume | A typical Gemini text prompt = 0.24 Wh (Google's Aug 2025 disclosure). Netflix HD ≈ 10× that per hour. One steak ≈ 570× a heavy AI user's annual chatbot footprint. **Individual AI use is small; the systemic build is not.** |
| [02-local-vs-cloud.md](./02-local-vs-cloud.md) | "AI" is many things — frontier reasoning vs 8B local vs 39M Whisper | 5–6 orders of magnitude span. Llama 3.1 8B on M-Mac: ~0.04 Wh (~6× lower than cloud Gemini). iPhone NPU: ~100× lower. Specialized BERT classifier: ~30× lower again. **Treating "an AI query" as one thing is a category error.** |
| [03-capex-and-finance.md](./03-capex-and-finance.md) | The financial structure forcing the buildout | $680B 2026 hyperscaler capex vs $40–60B generative-AI revenue. PJM capacity prices +833% YoY, 40% data-center driven. 14-yr ratepayer contracts, 17-yr nuclear PPAs, 80 GW gas-turbine backlog to 2029. Mag 7 = 33.7% of S&P 500. **The "real issue" may be socialized infrastructure risk, not joules.** |

## The three-claim framework that emerges

1. **Per-query, AI is small.** A modern frontier text prompt is in the same order of magnitude as a Google search and below a smartphone charge. Image and video generation are 10–1,000× higher; reasoning models are 30× higher; but the median user's daily chatbot footprint is dominated by their food, transit, and home energy choices by 2–4 orders of magnitude.

2. **"AI" is not one thing.** The energy intensity per useful operation differs by ~5 orders of magnitude across the model spectrum. Open weights running locally on hardware you already own change the math fundamentally — the model is amortized, the PUE is 1.0, the network transit is zero. The "AI is destroying the planet" headline is overwhelmingly about (a) frontier-model training, (b) frontier-reasoning inference at hyperscale, and (c) Jevons-paradox volume growth — none of which apply to the small/edge slice.

3. **The systemic concern is real but mostly financial, not joulemetric.** ~$680B in 2026 hyperscaler capex against ~$40–60B in actual generative-AI revenue. Circular financing flows (NVIDIA → OpenAI → Microsoft → NVIDIA). Public-market index concentration making every pension passively long the buildout. Multi-decade ratepayer contracts and gas/nuclear infrastructure mortgaged to AI demand assumptions. If demand undershoots, equity holders take the first loss; ratepayers, taxpayers (DOE loans, abatements), and pensioners take the second. The environmental harm in the bear case isn't the inference itself — it's the stranded gas turbines and the coal retirements that didn't happen because data-center load was projected.

## Suggested LeResearch piece structure

A single long-form article in three acts, mirroring the three files:

**Act I — "Is AI bad for the environment?"** Open with the comparison. Show the scale ladder. Disarm both the panic and the dismissal. Use Google's Aug 2025 numbers as the honest anchor; flag UCR/Strubell as worst-case, not typical.

**Act II — "Which AI?"** The category-error pivot. Show the model spectrum. Show what running Llama 3.1 8B on a Mac actually costs. Show Whisper transcribing on a phone. Show Apple Intelligence in milliwatts. Reframe "AI" from one monolithic thing into a pluralistic ecology where the user has agency.

**Act III — "What's actually breaking?"** The capex / financialization angle. The PJM auction. The Memphis turbines. The Three Mile Island restart. The Mag 7 concentration. The pensioner who cannot opt out of being long Stargate. End on Jevons: every per-query efficiency gain is being eaten by induced demand from AI being shoved into every product, and that demand is being financed in ways that socialize the downside.

## Numbers worth re-checking before publication

These will go stale fastest:

- **IEA Energy and AI report numbers** (annual; check for 2026 update)
- **Hyperscaler capex** (each quarterly earnings cycle; CreditSights tracks this)
- **NVIDIA quarterly revenue** (single biggest demand-side signal)
- **Google's per-prompt energy disclosure** (they committed to annual updates; v2 due Aug 2026)
- **Stargate actual deployment vs PR** (track equity contributions, online sites)
- **PJM capacity auction clearing prices** (next auction summer 2026)
- **Hugging Face AI Energy Score leaderboard** (live; v2 added reasoning models)
- **Anthropic / OpenAI revenue run-rate** (rumored disclosures every ~quarter)
