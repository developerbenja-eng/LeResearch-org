# AI Environmental Impact: Real Numbers with Sources

Research notes for LeResearch content. The user wants to understand what *creates* the environmental concerns and what the real magnitudes are — not vibes.

Compiled: 2026-04-24.

---

## 1. Training Costs

### GPT-3
- **Patterson et al. 2021**: GPT-3 training consumed **1,287 MWh** of electricity and emitted **502 (often cited as 552) metric tons CO2eq**. Methodology: based on disclosed FLOPs, hardware (V100 GPUs), and grid carbon intensity (429 gCO2/kWh) at training site. [arXiv 2104.10350](https://arxiv.org/abs/2104.10350)
- **Caveat**: number is an estimate, not a measurement. The 1,287 MWh figure is now ~5 years old and predates major efficiency gains; carbon-intensity assumption was for OpenAI/Azure mix at the time.

### Strubell et al. 2019 (the foundational paper)
- Estimated training a Transformer-big with neural architecture search emits **~284 metric tons CO2** (~5x lifetime emissions of an average US car including manufacture). [ACL P19-1355](https://aclanthology.org/P19-1355/) / [arXiv 1906.02243](https://arxiv.org/abs/1906.02243)
- **Critique**: the headline "5 cars" number applied to an extreme NAS run, not a typical training. Patterson et al. 2021 argued the original numbers overstated emissions by orders of magnitude for typical models because they assumed a worst-case grid mix and didn't account for efficient hardware/cloud carbon-aware scheduling. See Patterson's rebuttal: [par.nsf.gov 10399992](https://par.nsf.gov/servlets/purl/10399992).

### BLOOM (176B, Hugging Face / BigScience, 2022)
- **24.7 tCO2eq** for dynamic training power, **50.5 tCO2eq** when including equipment manufacturing and idle infrastructure. Trained on French nuclear-powered Jean Zay supercomputer (grid intensity 57 gCO2/kWh vs. 429 for GPT-3). [arXiv 2211.02001](https://arxiv.org/abs/2211.02001)
- This is the most transparent training disclosure of any major LLM and is the gold-standard methodology reference.

### GPT-4 (OpenAI, no official disclosure)
- Independent estimates: **~2.1 × 10^25 FLOPs**, ~25,000 A100 GPUs for 90–100 days, **~50 GWh** energy (range 51.8–62.3M kWh). All estimates, no official confirmation. [Epoch AI](https://epoch.ai/data-insights/models-over-1e25-flop), [arXiv 2405.21015 (Cottier & Rahman)](https://arxiv.org/pdf/2405.21015).
- Hardware cost ~$40M amortized; total compute cost $63–78M+. [Cudo Compute](https://www.cudocompute.com/blog/what-is-the-cost-of-training-large-language-models)

### Llama 3.1 (Meta, July 2024 model card)
- **39.3M H100-hours**, **11,390 tCO2eq location-based**; market-based reported as **0 tCO2eq** because Meta matches with renewable PPAs. [Llama 3.1 Model Card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md)
- Caveat: market-based accounting is contested by climate scientists — actual grid emissions still occur, RECs offset on paper.

### Sam Altman (OpenAI public claims)
- June 2025 blog and Feb 2026 statements: **0.34 Wh per ChatGPT query** ("about what an oven uses in a second"), called water concerns "completely untrue, totally insane." [Fortune (Feb 2026)](https://fortune.com/2026/02/24/sam-altman-open-ai-electricity-usage-water-usage-data-centers-ceo-tech/) | [TechCrunch](https://techcrunch.com/2026/02/21/sam-altman-would-like-remind-you-that-humans-use-a-lot-of-energy-too/)
- Caveat: OpenAI has published no methodology backing the 0.34 Wh figure.

## 2. Inference Costs (Per-Query)

### The "10x Google" claim (heavily cited, weakly sourced)
- Origin: **Alex de Vries (2023)**, who pegged ChatGPT at ~3 Wh and compared to Google's **2009-vintage** 0.3 Wh figure. [de Vries paper, Joule 2023](https://www.cell.com/joule/fulltext/S2542-4351(23)00365-3) | summary at [technical.ly](https://technical.ly/civics/chatgpt-vs-google-energy-use/)
- **Now widely considered outdated**: Google search has improved ~10x since 2009 (now ~0.04 Wh in some estimates). The 10x ratio almost certainly no longer holds. [ZME Science explainer](https://www.zmescience.com/science/news-science/how-much-energy-chatgpt-query-uses/)

### Updated per-query estimates
- **Epoch AI (Feb 2025)**: typical GPT-4o query ≈ **0.3 Wh**. Methodology: assumes 700W H100s (1500W with overhead), 10% utilization, ~1 sec H100-time per query. [Epoch AI](https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use)
- **Google (Aug 2025)**: median Gemini text prompt = **0.24 Wh, 0.03 gCO2e, 0.26 mL water** (comprehensive methodology including idle infrastructure). Active-only number is 0.10 Wh. Reports **33x energy reduction and 44x carbon reduction in 12 months**. [Google Cloud blog](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference/) | [arXiv 2508.15734](https://arxiv.org/html/2508.15734v1)

### SemiAnalysis (Feb 2023, the original ChatGPT cost estimate)
- **$694,444/day** to operate ChatGPT in compute hardware costs; **0.36 cents per query**; ~3,617 HGX A100 servers (28,936 GPUs). Replacing every Google search would need ~4.1M A100s and >$100B capex. [SemiAnalysis "Inference Cost of Search Disruption"](https://newsletter.semianalysis.com/p/the-inference-cost-of-search-disruption)
- Caveat: based on GPT-3.5 architecture assumptions, pre-MoE inference optimizations.

### Luccioni / Hugging Face inference research
- "Power Hungry Processing" (Luccioni, Jernite, Strubell, 2023): generative multi-purpose models are **orders of magnitude more energy-intensive than task-specific models** for the same task. Image generation per inference uses comparable energy to **fully charging a smartphone**. [arXiv 2311.16863](https://arxiv.org/pdf/2311.16863)
- Luccioni's AI Energy Score leaderboard: ongoing public benchmarking. [Hugging Face primer](https://huggingface.co/blog/sasha/ai-environment-primer)

## 3. Water Usage

### Shaolei Ren / UC Riverside (the "500ml" paper)
- "Making AI Less Thirsty" (Li, Yang, Islam, Ren, 2023, updated 2025): GPT-3 consumes **~500ml per 10–50 medium-length responses** depending on data center location and time of year. [arXiv 2304.03271](https://arxiv.org/abs/2304.03271) | [UCR News](https://news.ucr.edu/articles/2023/04/28/ai-programs-consume-large-volumes-scarce-water) | [Communications of the ACM 2025 update](https://dl.acm.org/doi/10.1145/3724499)
- Includes both **on-site** (cooling tower evaporation) and **off-site** (water for electricity generation at power plants) consumption.

### Microsoft (FY2023 Sustainability Report)
- **6.4 million m³ (~1.69 billion gallons)** total water consumption; **34% YoY increase**. Average data center WUE 0.30 L/kWh in 2024, down from 0.49 L/kWh in 2021. [Microsoft 2024 Environmental Sustainability Report](https://blogs.microsoft.com/on-the-issues/2024/05/15/microsoft-environmental-sustainability-report-2024/) | [data fact sheet PDF](https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/2024-Environmental-Sustainability-Report-Data-Fact.pdf)
- Caveat: total operations only, not data-center-broken-out.

### Google (2024 Environmental Report)
- Data center water consumption: **6.1 billion gallons** in 2023; **17% YoY increase**. [Google 2024 Environmental Report](https://blog.google/company-news/outreach-and-initiatives/sustainability/2024-environmental-report/)

### Geographic concentration / drought conflicts
- **Uruguay (2023)**: Google data center plan for Canelones would use **7.6M liters/day** (= 55,000 people's daily use) during worst drought in 70 years. Public protests followed. [Mongabay](https://news.mongabay.com/2023/11/the-cloud-vs-drought-water-hog-data-centers-threaten-latin-america-critics-say/)
- **Chile**: Google's second Cerrillos data center could consume **7 billion liters/year** (= 80,000 people). [Nearshore Americas](https://nearshoreamericas.com/water-guzzling-data-centers-spark-outrage-across-latin-america/)
- **Bloomberg (2025) analysis**: **>2/3 of new data centers built since 2022 are in water-stressed regions**. [Bloomberg](https://www.bloomberg.com/graphics/2025-ai-impacts-data-centers-water-data/)

### TSMC / chip-fab water
- TSMC consumed **101M m³ water in 2023**; average semiconductor fab uses **~20,000 tons/day** (= city of 58,000). Industry water use projected to **double by 2035**. [IDTechEx](https://www.idtechex.com/en/research-article/water-usage-in-semiconductor-manufacturing-to-double-by-2035/32746) | [Statista TSMC water by user](https://www.statista.com/statistics/1313040/tsmc-water-consumption-by-user/)

## 4. Aggregate / System Level

### IEA (Energy and AI report, Apr 2025)
- 2024 baseline: data centers = **~415 TWh, ~1.5% of global electricity**, growing 12%/yr.
- 2030 projection: **~945 TWh** (~3% of global electricity, ~Japan's total consumption).
- US data centers: +240 TWh by 2030 (+130%); China: +175 TWh (+170%); together = ~80% of growth.
- Earlier (Jan 2024) report: US data centers projected to hit **260 TWh by 2026**. [IEA Energy and AI](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai) | [S&P Global summary](https://www.spglobal.com/energy/en/news-research/latest-news/electric-power/041025-global-data-center-power-demand-to-double-by-2030-on-ai-surge-iea)

### Goldman Sachs (2024)
- Global data center power demand: **+165% by 2030 vs. 2023**. Current 55 GW → 84 GW by 2027 → 122 GW by 2030. AI share grows from 14% → 27% of data-center load. **$720B in grid spending** needed by 2030. [Goldman Sachs research](https://www.goldmansachs.com/insights/articles/ai-to-drive-165-increase-in-data-center-power-demand-by-2030)

### Nuclear PPAs (the "AI nuclear renaissance")
- **Microsoft–Constellation Three Mile Island (Sep 2024)**: 20-year, **835 MW** PPA, ~$1.6B deal. Restart targeted 2027. $1B DOE loan secured. [Utility Dive](https://www.utilitydive.com/news/constellation-three-mile-island-nuclear-power-plant-microsoft-data-center-ppa/727652/) | [NPR](https://www.npr.org/2024/09/20/nx-s1-5120581/three-mile-island-nuclear-power-plant-microsoft-ai)
- **Amazon–Talen Susquehanna**: $650M deal for **480–960 MW** of 2,500 MW plant. [CNBC](https://www.cbsnews.com/news/amazon-nuclear-reactor-investment-google-kairos-power/)
- **Amazon–X-energy**: $500M anchor for SMR development. [CNBC](https://www.cnbc.com/2024/10/16/amazon-goes-nuclear-investing-more-than-500-million-to-develop-small-module-reactors.html)
- **Google–Kairos Power (Oct 2024)**: 7 SMRs, **500 MW total**, first online 2030. World-first commercial SMR PPA. [CNBC](https://www.cnbc.com/2024/10/14/google-inks-deal-with-nuclear-company-as-data-center-power-demand-surges.html)

### Gas turbine buildout
- New US natural-gas-fired plant proposals **tripled in 2025**. Global pipeline now **>1,000 GW** of gas (+31% YoY); >1/3 of new US capacity is for data centers. Turbine lead times **5–7 years**; prices projected +195% vs. 2019. [Global Energy Monitor via TechCrunch (Apr 2026)](https://techcrunch.com/2026/04/03/ai-companies-are-building-huge-natural-gas-plants-to-power-data-centers-what-could-go-wrong/) | [Marketplace (Feb 2026)](https://www.marketplace.org/story/2026/02/04/more-data-centers-plan-to-build-their-own-natural-gas-plants-for-power)

### Hyperscaler emissions trajectories
- **Google**: 2023 emissions **+13% YoY, +48% over 5 years**; total 14.3 MtCO2e. Data center electricity +17% YoY. [Bloomberg](https://www.bloomberg.com/news/articles/2024-07-02/google-s-emissions-shot-up-48-over-five-years-due-to-ai) | [Google blog](https://blog.google/company-news/outreach-and-initiatives/sustainability/2024-environmental-report/)
- **Microsoft**: emissions up ~30% since 2020 baseline. [NPR](https://www.npr.org/2024/07/12/g-s1-9545/ai-brings-soaring-emissions-for-google-and-microsoft-a-major-contributor-to-climate-change)

### E-waste
- Nature Computational Science (Wang et al., Oct 2024): generative AI could produce **1.2–5.0 million tons of cumulative e-waste 2020–2030**. Extending hardware life by 1 year cuts e-waste 62% in aggressive scenario. [Nature Computational Science](https://www.nature.com/articles/s43588-024-00712-6) | [MIT Tech Review](https://www.technologyreview.com/2024/10/28/1106316/ai-e-waste/)

## 5. Counter-arguments / Context

### Per-query is small (Andy Masley, Hannah Ritchie, Epoch)
- Masley: a ChatGPT query at 0.3 Wh is comparable to Google search; **~1,000 prompts to raise personal emissions by 1%**. Argues no other digital activity at this energy scale gets comparable scrutiny. [Andy Masley summary](https://www.andymasley.com/writing/a-short-summary-of-my-argument-that/) | [cheat sheet](https://www.andymasley.com/writing/a-cheat-sheet-for-conversations-about/)
- Hannah Ritchie (Our World in Data): per-query carbon footprint is "trivial" compared to flights, beef, heating. [Sustainability by Numbers Aug 2025](https://www.sustainabilitybynumbers.com/p/ai-footprint-august-2025)

### Efficiency gains
- Google reports **33x energy reduction per Gemini prompt in 12 months** (2024–2025). [Google blog](https://blog.google/company-news/outreach-and-initiatives/sustainability/2024-environmental-report/)
- Per-token energy on frontier hardware (H100 → B200) drops ~3–5x per generation.

### Jevons paradox (the rebuttal to the rebuttal)
- ACM FAccT 2025 paper "From Efficiency Gains to Rebound Effects" (Sætra et al.): efficiency gains lower per-unit cost → demand grows faster than efficiency → total impact rises. Global data center capacity is **doubling every 3–4 years**; AI workloads now >30% of new capacity. [arXiv 2501.16548](https://arxiv.org/abs/2501.16548) | [SIGARCH](https://www.sigarch.org/the-jevons-paradox-why-efficiency-alone-wont-solve-our-data-center-carbon-challenge/)

## 6. What Actually Creates the Concern

The numbers per query are small. The system-level concerns are real and have these causes:

1. **Inference dominates lifetime energy at scale.** A model trained once for 1,287 MWh that serves billions of queries can have inference energy >>training within months. Patterson et al. estimate inference is 60–90% of total ML energy at Google.
2. **Scaling laws drive ever-larger models.** Compute used for frontier training has grown ~4–5x per year for a decade (Epoch AI tracking).
3. **Speculative buildout ahead of demand.** ~$720B grid spend, 1,000 GW gas pipeline, nuclear restarts — all locked in before AI revenue/usage is proven sustainable.
4. **Geographic concentration** in water- and grid-stressed regions (Arizona, Virginia, Chile, Texas) creates local externalities even when global numbers look modest.
5. **Embodied carbon and water from chip fabs** are largely invisible in operational disclosures but represent the largest share of hardware lifecycle impact for advanced nodes.
6. **Carbon accounting games.** Market-based renewable PPAs let companies claim "0 emissions" while the local grid still burns gas — Meta's Llama 3.1 disclosure is the cleanest example.

---

## Flagged weakly-sourced claims

- The "ChatGPT uses 10x Google" comparison: relies on a 2009 Google number and a 2023 ChatGPT estimate. Both endpoints are obsolete; treat with skepticism.
- "ChatGPT uses 500ml per query" — actually 500ml per 10–50 queries in the Ren paper; routinely misquoted.
- Strubell et al. "5 cars" — applied to extreme NAS; not representative of ordinary training.
- Sam Altman's 0.34 Wh — no published methodology.
- Meta's "0 tCO2 market-based" — accounting choice, not physical reality.
