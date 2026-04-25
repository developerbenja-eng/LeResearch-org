# AI Environmental Impact in Context: A Numbers-First Comparison

Apples-to-apples comparisons for an LeResearch piece. Anchor numbers from primary 2024–2026 sources. Compiled 2026-04-24.

## Anchor: AI Per-Query Numbers (Aug 2025 Google methodology)

Median Gemini Apps text prompt (Google, May 2025 data, full-stack methodology including idle capacity, host energy, data center overhead, water at site + via electricity generation):
- **Energy:** 0.24 Wh
- **Carbon:** 0.03 g CO2e
- **Water:** 0.26 mL ("about five drops")
- 33x energy reduction and 44x emissions reduction vs May 2024 (driven by software, not just grid greening)

Older / contested figures:
- **ChatGPT ~3 Wh/query** (Epoch AI / De Vries 2023 estimates; now widely considered ~10x too high for current frontier models)
- **OpenAI's Sam Altman public claim (June 2025):** ~0.34 Wh and 0.32 mL per query — broadly consistent with Google's number
- **University of California Riverside (Shaolei Ren):** ~519 mL per ~100-word ChatGPT prompt — about 2,000x Google's number, reflects worst-case GPT-4-class request in a hot, evaporative-cooling region. Both can be true; the user-facing average is closer to Google's

**Reasoning models:** Hugging Face's AI Energy Score v2 (Luccioni, 2025) finds reasoning models use **~30x more energy per response** than non-reasoning models. So "ChatGPT" in 2026 is a 1,000x range depending on whether it's a Gemini Flash text answer or an o-series deep-thinking reply with tool use.

**Image generation:** ~0.5–2.9 Wh per image for diffusion models (Luccioni "Power Hungry Processing" 2024; Hidden Cost of an Image, arXiv 2506.17016, 2025). Generating 1,000 images averaged 2.9 kWh across tested models. So one image ≈ 12–60 text prompts at Google's rate; the "charges your phone" headlines used outdated Stable Diffusion XL numbers.

**Video generation (Sora-class):** Estimates are 100–1,000x text-query energy per few-second clip. This is the legitimately concerning frontier (Ritchie, Aug 2025).

## 1. Other Digital Services (per hour or per unit)

| Service | Energy per unit | Source |
|---|---|---|
| Google text search | ~0.0003 kWh = 0.3 Wh (2009 figure, Google has not formally updated) | Google blog 2009 |
| Gemini text prompt | 0.24 Wh | Google methodology paper, Aug 2025 |
| Netflix HD streaming, 1 hr | ~0.077 kWh (IEA 2020); 36–55 g CO2e/hr (DIMPACT, 2024) | Netflix, Carbon Brief |
| Netflix 4K streaming, 1 hr | ~0.1–0.2 kWh | DIMPACT |
| YouTube HD, 1 hr | ~0.12 kWh | The Fact Source aggregating multiple |
| TikTok scrolling, 1 hr | ~0.036 kWh device + ~0.05 kWh network (Greenspector 2021–24) | Greenspector |
| Spotify audio, 1 hr | ~0.005–0.01 kWh | Greenly |
| Email | ~0.3 g CO2e/short email; ~50 g for a long email with photo | Berners-Lee, *How Bad Are Bananas?* |
| Web page load (median) | ~0.5 g CO2e/view | websitecarbon.com |
| Zoom HD video call, 1 hr | ~0.15–1.0 kWh | Purdue Aslan et al. 2021 |
| Cloud storage, 1 GB-month | ~0.001–0.01 kWh | secondary |

**Per-hour scale punchline:** 1 hour of Gemini chat at ~30 prompts ≈ 7 Wh. 1 hour of Netflix HD ≈ 77 Wh. Netflix is **~10x** an hour of typical chatbot use.

## 2. Bitcoin / Crypto

- **Bitcoin annual electricity (Cambridge CBECI):** 138 TWh in 2025 Cambridge Digital Mining Report; CBECI live estimates ~170–180 TWh by Feb 2026. ~0.7% of global electricity.
- **Bitcoin per transaction:** highly misleading metric (energy is per-block, not per-tx) but commonly cited ~700–1,200 kWh/tx (Digiconomist).
- **Ethereum post-merge:** total network ~2.6 GWh/year (~0.0026 TWh); ~0.03 kWh/tx; **99.95% drop** vs proof-of-work.
- **Trajectory:** AI-data-center growth is now outpacing crypto. IEA: data centers added more electricity demand in 2024–2025 than Bitcoin's entire annual footprint. Projected 945 TWh data centers by 2030 dwarfs Bitcoin's projected ~200 TWh.

## 3. Gaming

- **PS5:** 200–220 W gaming → **0.20–0.22 kWh/hr**
- **Xbox Series X:** 160–200 W → **0.16–0.20 kWh/hr**
- **Gaming PC (high-end):** 400–600 W → **~0.5 kWh/hr**; LBNL estimated 1,400 kWh/yr per heavy gaming PC
- **Twitch streaming:** broadcaster-side adds ~0.2 kWh/hr on top of game; viewer-side ~0.08 kWh/hr (similar to YouTube)
- **Global gaming electricity:** LBNL's last comprehensive estimate was 75 TWh (2012); current credible extrapolations put it at ~100–150 TWh/yr — comparable in magnitude to Bitcoin.

**1 hour of PS5 gaming ≈ 833 Gemini prompts ≈ 11 Netflix-hours of energy.**

## 4. Household Appliances ("oven for a second" comparisons)

| Appliance | Power | Per typical use |
|---|---|---|
| LED bulb (10W) | 10 W | 10 Wh/hr |
| Incandescent (60W) | 60 W | 60 Wh/hr |
| Refrigerator | 100–400 W avg, cycling | **1–2 kWh/day** |
| Microwave | 1,200 W | **20 Wh per minute** = 80 prompts |
| Electric kettle (boil 1 mug, ~250 mL) | 1,500 W × ~45 sec | **~19 Wh** ≈ 80 Gemini prompts |
| Modern electric oven | 2,300–3,500 W | **~50 Wh per minute**; 1 hr roast ≈ 2.5 kWh |
| Hair dryer | 1,500 W | 15 min ≈ 375 Wh |
| Air conditioner (3-ton central) | 3,500 W | **~3.5 kWh/hr**; ~14,500 prompts |
| Dishwasher (one cycle) | ~1.5 kWh | |
| Washer + dryer (one load) | ~2–4 kWh | |
| Smartphone full charge | **~19 Wh** ≈ 80 Gemini prompts | |
| US household average | **~28.4 kWh/day** (EIA, 2024) | ≈ 118,000 Gemini prompts |
| EU household average | ~10–13 kWh/day (Eurostat) | |

**The "oven for a second" framing is roughly correct:** a 3,500 W oven runs for ~0.25 seconds to match one Gemini prompt. Microwaving food for 1 second uses ~1.2 Wh — about **5 prompts**.

## 5. Transportation

- **EV (avg US 2024 model):** 0.346 kWh/mile (DOE, 2024). 1 mile ≈ **1,440 Gemini prompts.**
- **Tesla Model 3 RWD 2024:** 255 Wh/mile (3.9 mi/kWh). EPA.
- **Gasoline car (US fleet avg):** 400 g CO2/mile (EPA, 2024). 1 mile ≈ **13,000 Gemini prompts** of CO2.
- **Annual passenger vehicle (US):** 4.6 t CO2/year (EPA).
- **Transatlantic round-trip economy (e.g., NYC–London):** ~1.0–1.6 t CO2/passenger (myclimate, ICAO methodology). One flight ≈ **33–53 million Gemini prompts** of CO2.
- **Uber ride (city avg ~5 mi gasoline sedan):** ~2 kg CO2 ≈ 67,000 prompts.

## 6. Food / Agriculture (Poore & Nemecek 2018, via Our World in Data)

| Food | kg CO2e per kg |
|---|---|
| Beef (beef herd) | **~60** (dairy herd ~21) |
| Lamb | ~24 |
| Cheese | ~21 |
| Pork | ~7 |
| Chicken | ~6 |
| Eggs | ~4.5 |
| Tofu | **~3** |
| Beans, lentils | ~0.9 |

- **One 200g steak (beef herd):** ~12 kg CO2 ≈ **400,000 Gemini prompts**.
- **One cup of coffee:** ~0.28 kg CO2 + **140 L water** (UN FAO; Mekonnen & Hoekstra) ≈ 9,000 prompts of carbon, **~540,000 prompts of water**.
- **One almond:** **~4.2 L (1.1 gallons)** water ≈ **16,000 prompts of water**.
- **One avocado:** ~320 L water; ~0.4 kg CO2.

## 7. Heavy Industry Baseline

- **Cement:** ~0.6 t CO2 per t cement (IEA 2024). ~7–8% of global CO2 emissions.
- **Steel:** ~1.85 t CO2 per t crude steel (World Steel Assoc., IEA). ~7–9% of global emissions.
- **Aluminum (primary):** ~16 t CO2 per t (with global avg grid; <4 t with hydropower). ~2% of global emissions.
- **Aviation:** ~2.5% of global CO2 (~4% of warming counting non-CO2 effects, Our World in Data).
- **All data centers (incl. AI):** ~1.5% of global electricity in 2024 (~415 TWh, IEA), translating to ~0.5–1% of global CO2. AI is currently **5–15%** of data center electricity, projected to **35–50% by 2030** (IEA Energy and AI 2025).

**Hierarchy (% of global CO2):** Cement ~7% > Steel ~7–9% > Aviation ~2.5% > All data centers ~1% > AI specifically ~0.1–0.2% today, plausibly ~0.5% by 2030.

## 8. Water Comparisons

Anchor: Google's 0.26 mL per Gemini prompt. Skeptics' ceiling: UCR's ~519 mL per long GPT-4 prompt.

| Activity | Water |
|---|---|
| 1 toilet flush (modern) | 4.8–6 L = **18,000–23,000 prompts** |
| 1 shower (8 min, 1.8 gpm) | ~55 L |
| 1 cup coffee (embodied) | **140 L** (UN FAO) |
| 1 almond | **4.2 L** |
| 1 avocado | ~320 L |
| 1 kg beef | **~15,400 L** (Mekonnen & Hoekstra 2012) |
| 1 cotton t-shirt | **~2,700 L** (WWF) |
| 1 pair jeans | **~7,500–9,000 L** (WWF, varies) |
| US household daily | **~1,135 L (300 gal)** (EPA) |
| One 100-MW data center daily | **~2 million L** (Bloomberg / Lincoln Inst. 2025) |

**Headline framing:** "ChatGPT uses a bottle of water per prompt" is the UCR worst case. The Google-disclosed reality is **~5 drops** for a typical text prompt — less than one almond.

## 9. Big-Picture Grid Context

- **Global electricity 2024:** ~30,800 TWh (IEA Electricity 2024 + Global Energy Review 2025; grew 4.3% in 2024, +1,080 TWh).
- **Data centers 2024:** ~415 TWh = **~1.5%** (IEA). Projected ~945 TWh = ~3% by 2030.
- **AI within data centers:** 5–15% today; 35–50% by 2030 (IEA).
- **Household electric heating + AC:** ~25% of global electricity. Cooling alone added more demand in 2024 than all data centers combined (IEA).

## Specific Framings

**1 hour of ChatGPT vs 1 hour of Netflix:** 30 prompts × 0.24 Wh ≈ 7 Wh vs Netflix HD 77 Wh. **Netflix ≈ 10x.** (Caveat: image/video gen flips this.)

**GPT-4 vs Google search vs 30 sec Instagram:** Modern Gemini text ≈ 0.24 Wh. Google search ≈ 0.3 Wh (2009 number, likely lower now). 30 sec Instagram scroll ≈ ~0.5 Wh on device + network. **All within 2x of each other for a modern lightweight LLM call.** A reasoning-mode GPT-5 query is more like 7 Wh — Netflix-hour territory per query.

**Generating an image vs charging your phone vs running AC for a minute:** 1 image ≈ 1–3 Wh (latest efficient diffusion). Phone charge ≈ 19 Wh. AC for 1 min ≈ 58 Wh. **AC-minute ≈ 20 images ≈ 3 phone charges.**

**Heavy AI user (100 prompts/day × 365) vs 1 steak/week vs 1 flight/year:**
- 36,500 prompts × 0.24 Wh ≈ **8.8 kWh/yr ≈ 1.1 kg CO2/yr**
- 52 steaks × ~12 kg CO2 ≈ **624 kg CO2/yr**
- 1 transatlantic round-trip ≈ **1,500 kg CO2**

The flight is **~1,400x** the heavy AI user's annual chatbot footprint. The weekly steak is **~570x.**

## Where Comparisons Systematically Understate AI

1. **Training amortization:** GPT-4 training estimated 50–60 GWh and 1,000–15,000 t CO2 (Ludvigsen 2023; geography-dependent). Amortized across billions of inferences this is ~negligible per query (<5% of inference), but new model releases keep resetting the clock.
2. **Embodied chip carbon:** Manufacturing one H100 GPU emits ~150 kg CO2 (TSMC LCA estimates). A data center with 100,000 H100s embeds ~15,000 t CO2 before turning on. Most per-query numbers (including Google's) are operational only.
3. **Water in PPA-supplied power:** Hyperscalers buy renewable PPAs but the local grid still burns gas; Shaolei Ren's higher water numbers reflect the marginal grid, not the contractual one.
4. **Induced demand:** "AI Overviews" auto-running on every Google search, Copilot in every Office doc, Meta AI in every WhatsApp thread — these convert previously-zero-energy actions into LLM calls. Per-query efficiency gains can be wiped out 100x by ubiquity. (Ritchie, Aug 2025: this is the real worry.)
5. **Local grid stress:** 1% of global electricity sounds small, but data centers cluster (Northern Virginia, Phoenix, Dublin, Loudoun County), creating local grid problems that global averages hide.

## Framings Comparison: Ritchie vs Masley vs Luccioni

- **Hannah Ritchie (Sustainability by Numbers, Aug 2025):** "Even moderate use is a tiny share of personal footprint. 10 prompts/day for a year ≈ 11 kg CO2." Worried about systemic / induced demand more than individual use.
- **Andy Masley (blog.andymasley.com, 2024–25):** Most aggressive "individual AI use is irrelevant" framing. 1 hr Netflix ≈ 26.5 ChatGPT queries; 1 hr Zoom ≈ 1,720 mL water vs ~30 mL/query.
- **Sasha Luccioni (Hugging Face, AI Energy Score v2, 2025):** Most cautious. Emphasizes 30x reasoning-model overhead, image>text, generative>discriminative, training cost amortization uncertainty, and the system-level consequences of pushing AI into every product.

All three look at similar numbers; they diverge on whether the right scale is per-user or per-system.

---

## The Scale Ladder (per-day-per-user kWh equivalent)

Ordered from trivial to huge, normalized to typical daily-use energy a single person commands:

| # | Activity (per day) | Approx kWh |
|---|---|---|
| 1 | One Gemini text prompt | 0.00024 |
| 2 | One Google search | ~0.0003 |
| 3 | One AI image (efficient diffusion) | 0.001–0.003 |
| 4 | 30 ChatGPT queries (typical user/day) | ~0.007 |
| 5 | One smartphone full charge | 0.019 |
| 6 | 1 hour Spotify | ~0.01 |
| 7 | 1 hour TikTok | ~0.04 |
| 8 | 1 hour Netflix HD | 0.077 |
| 9 | 1 hour YouTube HD | 0.12 |
| 10 | 1 hour Zoom video call | 0.15–1.0 |
| 11 | 100 reasoning-model AI queries (heavy user) | ~0.7 |
| 12 | 1 hour PS5 gaming | 0.21 |
| 13 | 1 hour gaming PC (high-end) | ~0.5 |
| 14 | Boil one kettle | 0.02 |
| 15 | Refrigerator daily | 1–2 |
| 16 | Run microwave 10 min | 0.2 |
| 17 | Hair dryer 15 min | 0.375 |
| 18 | One oven roast (1 hr) | 2.5 |
| 19 | 1 hour central AC | 3.5 |
| 20 | One EV mile | 0.35 |
| 21 | One gas-car mile (in CO2-equivalent kWh) | ~1.1 |
| 22 | Average US household daily total | **28.4** |
| 23 | One transatlantic flight (CO2-equivalent kWh, per pax) | **~6,000** |
| 24 | One kg beef (CO2-equivalent kWh) | **~150** |

**Bottom line:** A typical individual's chatbot use is in the same order of magnitude as a few Google searches and well below a single phone charge. A heavy power-user invoking reasoning models all day pushes into Netflix-hour territory. The systemic concern — IEA's projection that data centers double to ~3% of global electricity by 2030 with AI driving most of the growth — is real and grid-local, but it lives in a hierarchy where cement (7%), steel (7–9%), and aviation (2.5%) are still much bigger global climate problems, and where individual food and travel choices dominate any plausible personal AI footprint by 2–4 orders of magnitude.

---

## Sources

- [Google Cloud Blog: Measuring the environmental impact of AI inference](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference/)
- [Google paper: Measuring the environmental impact of delivering AI at Google Scale (PDF, Aug 2025)](https://services.google.com/fh/files/misc/measuring_the_environmental_impact_of_delivering_ai_at_google_scale.pdf)
- [arXiv 2508.15734 — Google methodology paper](https://arxiv.org/abs/2508.15734)
- [MIT Technology Review — Google releases AI prompt energy data (Aug 2025)](https://www.technologyreview.com/2025/08/21/1122288/google-gemini-ai-energy/)
- [Hannah Ritchie — What's the carbon footprint of using ChatGPT or Gemini? (Aug 2025)](https://hannahritchie.substack.com/p/ai-footprint-august-2025)
- [Hannah Ritchie — Original ChatGPT carbon footprint analysis](https://hannahritchie.substack.com/p/carbon-footprint-chatgpt)
- [Andy Masley — Using ChatGPT is not bad for the environment](https://blog.andymasley.com/p/individual-ai-use-is-not-bad-for)
- [Hugging Face / Sasha Luccioni — AI Energy Score v2](https://huggingface.co/blog/sasha/ai-energy-score-v2)
- [Luccioni et al. — Power Hungry Processing (arXiv 2311.16863)](https://arxiv.org/pdf/2311.16863)
- [The Hidden Cost of an Image (arXiv 2506.17016)](https://arxiv.org/html/2506.17016v1)
- [IEA — Energy and AI report 2025](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai)
- [IEA — Data centre electricity use surged in 2025](https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions)
- [IEA — Electricity 2024 executive summary](https://www.iea.org/reports/electricity-2024/executive-summary)
- [IEA — Cement industry overview](https://www.iea.org/energy-system/industry/cement)
- [IEA — Steel and aluminium](https://www.iea.org/reports/steel-and-aluminium)
- [Cambridge CBECI — Bitcoin electricity index](https://ccaf.io/cbnsi/cbeci)
- [Ethereum Foundation — energy consumption](https://ethereum.org/energy-consumption/)
- [Carbon Brief — Factcheck Netflix streaming](https://www.carbonbrief.org/factcheck-what-is-the-carbon-footprint-of-streaming-video-on-netflix/)
- [Netflix — True Climate Impact of Streaming](https://about.netflix.com/en/news/the-true-climate-impact-of-streaming)
- [Carbon Brief — AI: Five charts on data centre energy](https://www.carbonbrief.org/ai-five-charts-that-put-data-centre-energy-use-and-emissions-into-context/)
- [Our World in Data — GHG per kg of food (Poore & Nemecek)](https://ourworldindata.org/grapher/ghg-per-kg-poore)
- [Our World in Data — Aviation share of CO2](https://ourworldindata.org/global-aviation-emissions)
- [Mekonnen & Hoekstra — Water footprint of farm animal products](https://www.waterfootprint.org/resources/Mekonnen-Hoekstra-2012-WaterFootprintFarmAnimalProducts_1.pdf)
- [WEF — Coffee 140L water footprint](https://www.weforum.org/stories/2019/03/hidden-water-in-your-cup-of-coffee/)
- [EPA — GHG from a typical passenger vehicle](https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle)
- [EIA — Electricity use in homes](https://www.eia.gov/energyexplained/use-of-energy/electricity-use-in-homes.php)
- [EPA WaterSense — Statistics and facts](https://www.epa.gov/watersense/statistics-and-facts)
- [LBNL — Toward Greener Gaming](https://newscenter.lbl.gov/2015/08/31/gaming-computers-offer-huge-untapped-energy-savings-potential/)
- [EcoCostSavings — PS5 vs Xbox power consumption](https://ecocostsavings.com/ps5-vs-xbox-power-consumption/)
- [DOE FOTW #1374 — 2024 EV efficiency](https://www.energy.gov/cmei/vehicles/articles/fotw-1374-december-23-2024-model-year-2024-electric-vehicles-offer-consumers)
- [Undark — How Much Water Do AI Data Centers Really Use? (Dec 2025)](https://undark.org/2025/12/16/ai-data-centers-water/)
- [Bloomberg Graphics — AI data center water (2025)](https://www.bloomberg.com/graphics/2025-ai-impacts-data-centers-water-data/)
- [Brookings — AI, data centers, and water](https://www.brookings.edu/articles/ai-data-centers-and-water/)
- [Ludvigsen — Carbon footprint of GPT-4 estimate](https://medium.com/data-science/the-carbon-footprint-of-gpt-4-d6c676eb21ae)
- [WWF — Cotton t-shirt water footprint](https://www.caelusrome.com/blogs/blog-posts/how-much-water-does-one-tshirt-take)
- [myclimate flight calculator](https://co2.myclimate.org/en/flight_calculators/new)
