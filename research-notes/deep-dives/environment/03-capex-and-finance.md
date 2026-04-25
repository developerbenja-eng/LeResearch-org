# The Predatory Capital Structure of AI Infrastructure

Deep research for LeResearch on what may be the *real* environmental issue with AI: not joules per inference, but a financial architecture forcing trillions in infrastructure capex regardless of demand fundamentals — with public companies, sovereign funds, utilities, and pensioners bearing risk. Compiled 2026-04-24.

## Executive thesis

The first-order environmental cost of AI (joules per inference) is real but is dwarfed by a second-order systemic risk: a financial architecture that has committed roughly **$680B in 2026 hyperscaler capex** (a 36% YoY jump on top of an already ~$400B 2025) — funded against a generative-AI revenue base of perhaps $40–60B globally — and which has mortgaged 14-year ratepayer contracts, 17-year nuclear PPAs, gas-turbine reservations into 2030, and roughly 40% of S&P 500 market cap to that bet. The "predatory" element is not conspiracy but circular-financing geometry plus the inability of large public-market and pension allocators to opt out.

---

## 1. Capex commitments — the topline numbers

**Hyperscaler 2026 guidance** (most recent earnings cycle):
- Amazon: ~$200B (up from $131B in 2025)
- Alphabet: $175–185B midpoint (≈ doubling)
- Microsoft: ~$144B for FY26
- Meta: $115–135B (midpoint up ~73% from $72.2B in 2025)
- Oracle: ~$50B

Aggregate top-5 hyperscaler capex 2026 = **~$680–700B**, of which ~75% (~$450–500B) is AI-attributed. 2025 actuals were ~$365–400B; 2024 was ~$230B. Combined capex has compounded ~72% per year since Q2 2023 (Epoch AI). Capex-to-revenue ratios are unprecedented: Oracle 86%, Meta 54%, Microsoft 47%, Alphabet 46%, Amazon 25% (2026).

**NVIDIA as the demand-side mirror**: revenue went $26.97B (FY23) → $60.92B (FY24, +126%) → $130.5B (FY25, +114%) → $215.9B (FY26, +65%). Q4 FY26 alone was $68.1B. Data center is ~87% of revenue.

**Stargate**: announced Jan 21, 2025 at $500B/10GW by 2029. By Sept 2025 OpenAI announced 5 new sites bringing planned capacity to ~7GW and ~$400B. By late 2025 the venture claimed 8GW and $450B "committed." Initial *equity* contributions are far smaller: SoftBank $19B, OpenAI $19B, Oracle $7B, MGX (UAE) $7B = **$52B of $500B headline**. The remainder is debt + future revenue contracts.

**Sovereign AI**: Microsoft put $1.5B into G42 (UAE) and committed $15.2B in UAE through 2029. Saudi PIF launched HUMAIN, signed a $10B Google Cloud partnership. Gulf SWF + government pledges to US AI reportedly sum to ~$2.5T by early 2026.

**BlackRock GAIIP** (Sept 2024): BlackRock + GIP + Microsoft + MGX raising $30B equity, $100B with debt. This is how the bet reaches pension and insurance balance sheets.

---

## 2. Who pays for grid, water, externalities

**PJM capacity auction** cleared at **$269.92/MW-day for 2025/26** vs $28.92 prior year — an **833% increase**. Subsequent 2026/27 and 2027/28 auctions both hit the FERC price cap (~$329–333/MW-day) and *still* left a 6,623 MW shortfall. PJM market monitor: data centers accounted for **40% ($6.5B of $16.4B)** of capacity costs in the December 2025 auction; data centers are 97% of the 5,250 MW load growth in latest forecast.

**Virginia / Dominion**: SCC approved a base rate hike adding ~$11.24/mo to residential bills in 2026 + $2.36 in 2027. SCC created the new GS-5 rate class (≥25 MW customers) effective Jan 2027, requiring **14-year contracts** and ≥85% of contracted T&D demand even if facilities never get built — a partial fix that explicitly transfers stranded-asset risk back to the hyperscaler. Virginia gave up **$1.6B in sales/use tax revenue to data centers in FY25** (Good Jobs First; up 118% YoY). State ROI estimate: **48 cents back per $1 abated**.

**Texas**: ~$1B/year in subsidies in FY25, virtually no project-level disclosure (Good Jobs First). ERCOT large-load queue grew **270% in 2025** to ~226 GW; data centers = 72.9% of queue. SB 6 (signed July 2025) introduced a $100K interconnection fee and required disclosure of duplicative requests precisely because of phantom-load double-booking.

**Other states**: Illinois revenue loss to data centers up 628% in one year (to $371M, 2023); Georgia: $474M abatements vs $41M tax revenue = **net $433M loss**.

---

## 3. The bubble argument — sources and numbers

**Goldman Sachs, "Gen AI: Too Much Spend, Too Little Benefit?"** (June 2024). Jim Covello (Head of Global Equity Research): "Eighteen months after the introduction of generative AI to the world, not one truly transformative — let alone cost-effective — application has been found." Goldman's report estimates ~$1T in capex commitments with weak productivity payback and warns utility capex must rise ~40% in three years.

**Sequoia, David Cahn, "AI's $200B Question" (Sept 2023) → "AI's $600B Question" (June 2024)**. The gap between implied revenue needed to justify infrastructure capex and observed end-customer revenue grew from $125B to $500B+ in nine months. Cahn's question: "How much of the build-out is linked to true end-customer demand vs anticipation?"

**MIT NANDA "GenAI Divide: State of AI in Business 2025"** (Aug 2025). 95% of enterprise AI pilots show no measurable P&L impact. ~5% achieve revenue acceleration. Internal builds succeed ~1/3 as often as buy-in tools.

**Apollo / Torsten Sløk** (July 2025 onward): top-10 S&P 500 P/E ratios now exceed dot-com peak. "The AI bubble today is bigger than the IT bubble in the 1990s." Top-10 names ≈ 40% of S&P 500 market cap.

**Daron Acemoglu (NBER w32487, 2024)**: TFP gain from AI ≤ 0.66% over 10 years (more recent estimate ≤0.53%); GDP +1.1–1.6% over 10 years (~0.05% annual). Order of magnitude below industry self-projections.

**Revenue vs capex gap**: OpenAI ~$13B FY2025, run-rate ~$20B end-2025, ~$24B April 2026 (with ~$7.8B operating loss in H1 2025 alone; Ed Zitron tracks $4.1B in additional unaccounted burn from H1 2023–H1 2025). Anthropic ramp $1B (Dec 2024) → $9B (end 2025) → $30B run-rate (April 2026). Even adding all model-makers + applications, total generative-AI revenue 2025 is ~$40–60B against ~$400B capex.

**Circular financing examples** (Bloomberg, Fortune, The Register):
- NVIDIA → up to $100B equity into OpenAI; OpenAI commits to deploy millions of NVIDIA GPUs
- NVIDIA → 5%+ stake in CoreWeave + $6.3B cloud purchase commitment (Sept 2025); CoreWeave bought ≥250K NVIDIA GPUs — round-trip
- Microsoft → OpenAI investment paid back as Azure inference revenue (OpenAI spent $12.4B on Microsoft inference Jan 2024–Sept 2025)
- AMD → OpenAI deal includes equity warrants tied to GPU purchases
- Oracle → backstops Stargate buildout, books OpenAI as ~$300B multi-year contracted revenue

The systemic concern: revenue numbers in 10-Ks may include intercompany flows that artificially inflate apparent demand.

---

## 4. Public-market forced participation

**Magnificent 7 = 33.7% of S&P 500** (April 2026), up from 21.9% in 2020. In 2025, ~42% of total S&P 500 return came from Mag 7. Any pension fund or 401(k) holding a passive index — including state pensions, sovereign wealth funds, target-date retirement funds, and the Federal Thrift Savings Plan — is *automatically* long the AI capex story.

**Earnings-call mechanics**: Meta's Oct 2024 Q3 fall after capex guide raise (~$70B → trading down ~12% intraday); recovery only after AI-monetization narrative landed by Q4. The pattern teaches CEOs: the only safe political move is to pre-commit AI capex *and* tie it to a monetization story or face share-price punishment.

**Activist capital pivot**: pre-2023 activists pushed buybacks; post-2023 they push AI capex (capex/revenue ratios are now a bull metric, not a bear one — historically the inverse).

**Infrastructure debt funnel**: GAIIP, Brookfield Infrastructure, Blackstone, KKR are vehicles through which pension money (CalPERS, OTPP, ADIA, etc.) buys data-center debt at investment-grade spreads. If demand softens, the loss surface includes pensioners, not just tech equity holders.

---

## 5. Energy mortgaged to AI demand

**Nuclear PPAs locking decades**:
- Constellation/Microsoft: $1.6B restart of Three Mile Island Unit 1 (renamed Crane Clean Energy Center); 835 MW; 20-year PPA; DOE LPO $1B loan (Nov 2025); online 2027–2028. If Microsoft walks, Constellation eats stranded restart capex and federal taxpayer holds $1B loan.
- Talen/Amazon: 17-year, **$18B PPA** for up to 1,920 MW from Susquehanna; AWS plans ~$20B Pennsylvania data center buildout.
- Kairos (Google), Oklo (OpenAI), X-Energy (Amazon): SMR PPAs locked despite no commercial SMR yet operating in the US.

**Gas turbine pipeline** (IEEFA, Utility Dive):
- GE Vernova ending 2025 with **80 GW backlog stretching to 2029**; 18 GW booked in Q4 2025 alone
- Industry lead times now **5–7 years** (vs ~2.5 historically)
- Manufacturing capacity expansions don't come online until ~2028
- Volume agreements being negotiated with hyperscalers out to **2035**

**ERCOT phantom load**: 226 GW queue is ~3x peak Texas demand. Even insiders concede 50–70% may not materialize. Substations and transmission are being built against speculative requests.

**Coal retirement delays**: Georgia Power, Indiana, Wyoming have all extended coal-plant lives or paused retirements citing data-center load growth — climate cost layered onto the bet.

**IEA Energy and AI (2025)**: data-center electricity ≈ 485 TWh in 2025 → ~950 TWh by 2030 (3% global). Top-5 tech capex >$400B in 2025, up another 75% in 2026. IEA flags: overloaded interconnection queues, community pushback, **stranded asset risk** if AI demand undershoots.

---

## 6. The "real issue" framing — the user's hypothesis substantiated

The capex-multiple-capex flywheel is empirically observable:
1. Hyperscaler raises capex guide → stock rises (only) if narrative holds
2. Higher market cap → more index weight → passive flows in → more multiple expansion
3. NVIDIA + Oracle + CoreWeave revenues (booked from same hyperscaler money) → S&P earnings beat headline
4. Utilities + turbine OEMs + nuclear restarters book multi-decade contracts
5. Ratepayers, taxpayers (DOE loans, abatements), and pensioners (passive index + infra debt) absorb the long-tail risk
6. If AI revenue undershoots, the equity holders take the first loss, but the second loss (stranded gas turbines, idle nuclear, ratepayer-funded substations, abated tax base) is socialized

Voices framing this systemically:
- **Cory Doctorow** has extended "enshittification" to AI capex as a way of preserving incumbent rents
- **Ed Zitron** (wheresyoured.at): "subprime AI crisis" framing; tracked OpenAI's $4.1B undisclosed burn (H1 2023–H1 2025)
- **Brian Merchant** (Blood in the Machine), **Karen Hao** (Empire of AI, 2025) — political economy of compute extraction
- **Kate Crawford** (*Atlas of AI*, 2021) — extractive supply chain (water, lithium, labor)
- **Daniel Schmachtenberger / Consilience Project** — AI as "Moloch" coordination failure
- **IEEFA** reports on stranded gas-turbine and PPA risk

---

## 7. Geographic / political externalities

- **xAI Memphis Colossus**: NAACP + SELC + Earthjustice sued April 2026 over 27 unpermitted methane turbines (495 MW capacity) at Southaven, MS site near majority-Black communities; potential 1,700 tons/yr NOx, 19 tons/yr formaldehyde. Original Colossus 1 ran up to 35 unpermitted turbines.
- **Uruguay**: Google originally wanted 7.6B liters/year water cooling during national drought (2023); forced to switch to air cooling.
- **Chile**: courts halted Cerrillos data center over groundwater extraction.
- **Ireland**: data centers projected at **27% of national electricity by 2029**.
- **Netherlands**: Zeewolde revoked Meta's zoning permits.
- **Job creation reality**: typical hyperscale data center = ~50–100 permanent jobs vs $1B+ in capex, against $10–100M in foregone tax revenue.

---

## 8. Counter-arguments (the steel-manned bull case)

- **Demand is real, not circular**: Anthropic went $1B → $30B run-rate in 16 months — historically unprecedented. NVIDIA's Q4 FY26 +73% YoY isn't a paper number; cash collected.
- **Sam Altman / Jensen Huang**: every prior compute build looked overdone (telecom dark fiber 2001) and was eventually used. AGI optionality dominates EV calc.
- **Marc Andreessen / a16z**: AI will drive multi-trillion productivity unlock; current capex small vs eventual TAM.
- **Goldman's *bull* analyst** (Joe Briggs, same June 2024 report) projects ~9% AI productivity boost over 10 years.
- **DeepSeek effect**: $5.6M training run for V3, V3.2 matching GPT-5 at 10x lower inference cost. Bulls argue this *expands* TAM via Jevons (cheaper per token → more tokens consumed) and bears argue it dynamites the moat justifying $500B Stargate-scale builds.
- **Fortune (Aug 2025)**: AI capex contributed +0.5% to US GDP growth in 1H 2025 — not modeled in Acemoglu's productivity estimate.

---

## Steel-manned: bubble thesis

Generative-AI revenue (~$40–60B globally) is 1/8th of 2026 capex (~$450B AI-attributed). 95% of enterprise pilots show no ROI (MIT NANDA). Top-10 S&P P/Es exceed 1999 (Sløk). Material revenue is intercompany (NVIDIA↔CoreWeave↔OpenAI↔Microsoft↔NVIDIA). Productivity payoff at macro level is ≤0.66% TFP over a decade (Acemoglu). If even one large hyperscaler cuts capex 30%, the GE Vernova backlog, Constellation restart, ERCOT queue, and 14-year Dominion contracts become a stranded-asset cascade socialized to ratepayers, taxpayers, and pensioners holding 33.7% of the S&P in seven names.

## Steel-manned: demand-is-real thesis

Anthropic and OpenAI revenue compounding faster than any SaaS in history; usage is collected in cash, not deferred. NVIDIA's $215.9B FY26 revenue is paid invoices, not promises. Inference demand growing exponentially — agents and reasoning models burn 10–100x more tokens per task. Sovereign AI (UAE, Saudi, France) means demand is also strategic, not just commercial. Even if pilots fail short term, frontier capability is a "build it before the adversary does" national-security good. The stranded-asset case ignores that most build is fungible (gas turbines, nuclear, fiber) and useful even in a non-AI world. DeepSeek-style efficiency expands the TAM rather than collapses it.

---

## Key sources

- [Epoch AI: Hyperscaler capex trend](https://epoch.ai/data-insights/hyperscaler-capex-trend/)
- [CreditSights: Hyperscaler Capex 2026 Estimates](https://know.creditsights.com/insights/technology-hyperscaler-capex-2026-estimates/)
- [CNBC (Feb 2026): Tech AI spending approaches $700B in 2026](https://www.cnbc.com/2026/02/06/google-microsoft-meta-amazon-ai-cash.html)
- [Motley Fool: Magnificent Seven $680B AI capex 2026](https://www.fool.com/investing/2026/02/11/magnificent-seven-plan-spend-ai-capex-buy/)
- [NVIDIA Q4 FY26 results](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-third-quarter-fiscal-2026)
- [OpenAI: Stargate Project announcement](https://openai.com/index/announcing-the-stargate-project/)
- [Stargate LLC (Wikipedia)](https://en.wikipedia.org/wiki/Stargate_LLC)
- [Goldman Sachs: Gen AI: Too Much Spend, Too Little Benefit](https://www.goldmansachs.com/insights/top-of-mind/gen-ai-too-much-spend-too-little-benefit)
- [Sequoia: AI's $600B Question (David Cahn)](https://sequoiacap.com/article/ais-600b-question/)
- [Fortune: MIT 95% of GenAI pilots failing](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/)
- [Apollo Academy: AI bubble bigger than 1990s tech bubble](https://www.apolloacademy.com/ai-bubble-today-is-bigger-than-the-it-bubble-in-the-1990s/)
- [Acemoglu: The Simple Macroeconomics of AI (NBER w32487)](https://www.nber.org/papers/w32487)
- [Bloomberg: AI Circular Deals graphic](https://www.bloomberg.com/graphics/2026-ai-circular-deals/)
- [Fortune: Nvidia $100B OpenAI investment circular financing](https://fortune.com/2025/09/28/nvidia-openai-circular-financing-ai-bubble/)
- [Ed Zitron: Where Is OpenAI's Money Going?](https://www.wheresyoured.at/where-is-openais-money-going/)
- [The Register: AI's trillion-dollar deal wheel](https://www.theregister.com/2025/11/04/the_circular_economy_of_ai/)
- [Inside Climate News: Virginia approves new Dominion rates, data center cost shift](https://insideclimatenews.org/news/07012026/virginia-regulators-approve-new-dominion-rates/)
- [Sierra Club: PJM Capacity Auction Record High](https://www.sierraclub.org/press-releases/2025/12/pjm-capacity-auction-ends-record-high-costs-again)
- [IEEFA: PJM capacity prices factor of 10](https://ieefa.org/resources/projected-data-center-growth-spurs-pjm-capacity-prices-factor-10)
- [Utility Dive: Data centers 40% of PJM capacity costs](https://www.utilitydive.com/news/data-centers-pjm-capacity-auction/808951/)
- [Utility Dive: GE Vernova 80GW backlog to 2029](https://www.utilitydive.com/news/ge-vernova-gas-turbine-investor/807662/)
- [IEEFA: Global gas turbine shortages report](https://ieefa.org/sites/default/files/2025-10/IEEFA%20Report_Global%20gas%20turbine%20shortages%20add%20to%20LNG%20challenges%20in%20Vietnam%20and%20the%20Philippines_October2025.pdf)
- [Talen Energy: 1,920 MW $18B Amazon PPA](https://ir.talenenergy.com/news-releases/news-release-details/talen-energy-expands-nuclear-energy-relationship-amazon)
- [Utility Dive: Constellation Three Mile Island restart](https://www.utilitydive.com/news/constellation-three-mile-island-nuclear-power-plant-microsoft-data-center-ppa/727652/)
- [CNBC: $1B DOE loan for Crane / TMI](https://www.cnbc.com/2025/11/18/trump-nuclear-three-mile-island-crane-loan-constellation-ceg.html)
- [ENR: TMI restart $1.6B](https://www.enr.com/articles/59329-three-mile-island-unit-eyes-16b-revamp-restart-in-microsoft-deal)
- [Utility Dive: ERCOT large load queue +270%](https://www.utilitydive.com/news/ercots-large-load-queue-jumped-almost-300-last-year-official/808820/)
- [Latitude Media: ERCOT queue quadrupled](https://www.latitudemedia.com/news/ercots-large-load-queue-has-nearly-quadrupled-in-a-single-year/)
- [Good Jobs First: Virginia $1.6B FY25 revenue loss](https://goodjobsfirst.org/virginia-tax-revenue-losses-to-data-centers-soar-to-1-6-billion-for-fy25/)
- [Good Jobs First: Cloudy with a Loss of Spending Control](https://goodjobsfirst.org/cloudy-with-a-loss-of-spending-control-how-data-centers-are-endangering-state-budgets/)
- [TIME: Tax breaks for AI data centers backfire](https://time.com/7280058/data-centers-tax-breaks-ai/)
- [BlackRock GAIIP $30B partnership announcement](https://www.blackrock.com/corporate/newsroom/press-releases/article/corporate-one/press-releases/ai-infrastructure-partnership)
- [Microsoft $15.2B UAE investment](https://blogs.microsoft.com/on-the-issues/2025/11/03/microsofts-15-2-billion-usd-investment-in-the-uae/)
- [SemiAnalysis: AI Arrives in the Middle East (UAE/KSA deal)](https://semianalysis.com/2025/05/16/ai-arrives-in-the-middle-east-us-strikes-a-deal-with-uae-and-ksa/)
- [NAACP sues xAI Memphis](https://naacp.org/articles/naacp-sues-xai-illegal-pollution-data-center-power-plant)
- [SELC: xAI illegal power plant](https://www.selc.org/news/xai-built-an-illegal-power-plant-to-power-its-data-center/)
- [Democracy Now: Colossus Failure (Memphis pollution)](https://www.democracynow.org/2026/4/22/memphis_xai_data_center_pollution_keshaun)
- [Motley Fool: Mag 7 = 35% of S&P 500](https://www.fool.com/investing/2026/01/05/should-investors-be-worried-that-the-magnificent-s/)
- [Pensions & Investments: Mag 7 concentration risk](https://www.pionline.com/asset-management/exchange-traded-funds/pi-magnificent-seven-concentrating-markets-indexing-survey-2025/)
- [IEA: Energy and AI report](https://www.iea.org/reports/energy-and-ai/executive-summary)
- [IEA: Data centre electricity surged in 2025](https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions)
- [Interconnects: DeepSeek V3 cost](https://www.interconnects.ai/p/deepseek-v3-and-the-actual-cost-of)
- [Fortune: AI spending +0.5% GDP growth](https://fortune.com/2025/08/14/ai-spending-added-05-gdp-growth-magnificent-7-stocks/)
- [Mongabay: Latin America data center water concerns](https://news.mongabay.com/2023/11/the-cloud-vs-drought-water-hog-data-centers-threaten-latin-america-critics-say/)
- [Logic Magazine: Google Uruguay water seizure](https://logicmag.io/land/exposing-googles-seizure-of-water-in-drought-impacted-uruguay-a-conversation/)
