# Crowded Out: The AI Harms That Doom and Hype Both Hide

Compiled 2026-04-24.

## Premise

Since November 2022, two narratives have dominated AI discourse: **doom** (extinction, x-risk, the unaligned superintelligence) and **hype** (transformation, productivity, abundance). They appear opposed. They are not. Both serve the firms building AI: doom justifies consolidation ("only we can do this safely"), hype justifies capital and policy alignment ("resistance is futile"). Both push concrete, present, actionable harms — the harms that could produce binding accountability *now* — out of the frame.

This report maps what is being displaced.

## 1. Labor: the hidden human supply chain

The single most under-discussed fact about modern AI is that it runs on a globally distributed underclass of data workers. Karen Hao's January 2023 *TIME* investigation revealed that OpenAI paid Kenyan workers contracted through Sama **less than $2/hr (a take-home of $1.32–$2)** to label graphic descriptions of child sexual abuse, bestiality, murder, suicide, torture, self-harm, and incest, in order to build the safety filter that makes ChatGPT marketable. Workers reported lasting trauma; some have since organized and asked the Kenyan parliament to investigate ([TIME, Jan 2023](https://time.com/6247678/openai-chatgpt-kenya-workers/); [TechCrunch, Jul 2023](https://techcrunch.com/2023/07/14/workers-that-made-chatgpt-less-harmful-ask-lawmakers-to-stem-alleged-exploitation-by-big-tech/)). 150 African content workers voted to unionize in May 2023 ([TIME](https://time.com/6275995/chatgpt-facebook-african-workers-union/)). Hao's 2025 book *Empire of AI* (Penguin Random House) extends the argument structurally: AI is a colonial extraction system, hollowing out Atacama lithium, Chilean groundwater, Kenyan psyches, Filipino attention.

This pattern is structural, not anecdotal. Mary L. Gray and Siddharth Suri's *Ghost Work* (2019) coined the term for the human labor disguised as automation; they estimated **8% of Americans** had performed it and roughly **20 million globally** ([ghostwork.info](https://ghostwork.info/); [Wikipedia](https://en.wikipedia.org/wiki/Ghost_work)). Milagros Miceli at the Distributed AI Research Institute (DAIR) — named to TIME100 AI 2025 — runs the **Data Workers' Inquiry**, a participatory research project across nine countries documenting wage theft, gendered harassment, and arbitrary deactivation ([TIME](https://time.com/collections/time100-ai-2025/7305825/milagros-miceli/); [DAIR](https://www.dair-institute.org/blog/milagros-miceli-time-100-ai-eng/)).

The RLHF middlemen face the same exposure:
- **Scale AI** was sued in December 2024 and again in January 2025 for misclassifying workers — pay effectively $15/hr against California's $16/hr minimum — and in late January 2025 by contractors alleging psychological harm from disturbing content ([TechCrunch, Jan 2025](https://techcrunch.com/2025/01/09/scale-ai-hit-by-its-second-employee-wage-lawsuit-in-less-than-a-month/); [The Register, Jan 2025](https://www.theregister.com/2025/01/24/scale_ai_outlier_sued_over/)).
- **Outlier** (Scale's gig platform): unpaid training/meeting hours documented across the US, UK, Portugal, Argentina, Germany ([AlgorithmWatch](https://algorithmwatch.org/en/ai-revolution-exploitation-gig-workers/)).
- **Surge AI**: May 2025 class action alleging the same misclassification model that powers RLHF for OpenAI, Google, Microsoft, Meta, and Anthropic ([Sacra](https://sacra.com/c/surge-ai/)).

Above the data floor, the same model is hitting white-collar labor. Klarna laid off ~700 customer-service staff in 2023–24 saying AI handled the work; CEO Sebastian Siemiatkowski admitted in May 2025 that quality collapsed and hiring resumed — but the layoffs happened ([CNBC, May 2025](https://www.cnbc.com/2025/05/14/klarna-ceo-says-ai-helped-company-shrink-workforce-by-40percent.html)). Salesforce cut **~4,000 customer-support roles** in 2025 attributing it to AI ([Marcus on AI](https://garymarcus.substack.com/p/ai-layoffs-productivity-and-the-klarna)). The 2023 SAG-AFTRA strike (118 days, ratified Dec 5, 2023, 78% in favor) won the first AI consent provisions for "digital replicas" and "synthetic performers" — but actor-strike captains called the language too weak ([Wikipedia](https://en.wikipedia.org/wiki/2023_SAG-AFTRA_strike)). Translators are now reporting near-complete work loss in 2025 ([Brian Merchant, *Blood in the Machine*](https://www.bloodinthemachine.com/p/ai-killed-my-job-translators)). BLS projects **near-zero growth** in paralegals 2024–2034 — only ~600 net positions in a 376,200-strong workforce — explicitly citing AI ([BLS Economics Daily, 2025](https://www.bls.gov/opub/ted/2025/ai-impacts-in-bls-employment-projections.htm)).

## 2. Surveillance, policing, infrastructural AI

While "AI safety" debates centered on hypothetical bioweapon uplift, real AI-driven systems were quietly deployed across welfare, policing, immigration, and warfare:

- **Predictive policing**: PredPol (rebranded Geolitica) showed a sub-0.5% prediction success rate in a 23,000-prediction *Markup* audit; LAPD shut down its LASER program in 2019 after the inspector general couldn't audit it because it was "too complicated"; seven Democratic members of Congress wrote DOJ in January 2024 demanding grant cutoffs ([Brennan Center](https://www.brennancenter.org/our-work/research-reports/predictive-policing-explained); [The Markup](https://themarkup.org/prediction-bias/2024/01/29/senators-demand-justice-department-halt-funding-to-predictive-policing-programs)).
- **Clearview AI**: cumulative European GDPR fines exceed **€90 million** (France €20M, Greece €20M, Italy €20M, Netherlands €30M); none paid; in October 2025 the UK Upper Tribunal ruled Clearview *is* bound by UK data law ([ICO, Oct 2025](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/10/uk-upper-tribunal-hands-down-judgment-on-clearview-ai-inc/)).
- **Welfare automation**: Australia's **Robodebt** falsely accused ~500,000 people of fraud 2015–2019, raising A$1.7B before being ruled unlawful ([Context](https://www.context.news/surveillance/australian-robodebt-scandal-shows-the-risk-of-rule-by-algorithm)). The Dutch **toeslagenaffaire** wrongly accused ~26,000 families — disproportionately dual-nationals — of childcare-benefit fraud, collapsing the Rutte cabinet in January 2021 ([Wikipedia](https://en.wikipedia.org/wiki/Dutch_childcare_benefits_scandal)). The Dutch **SyRI** system was struck down in February 2020 as a violation of Article 8 ECHR.
- **Workplace algorithmic management**: a 2024 Senate HELP investigation under Bernie Sanders concluded Amazon uses opaque algorithmic pacing that produces injury rates **double the warehouse industry average** ([American Prospect, Mar 2025](https://prospect.org/2025/03/13/2025-03-13-amazon-uses-arsenal-of-ai-weapons-against-workers/); [The Register, Mar 2025](https://www.theregister.com/2025/03/18/amazon_algorithmic_worker_management/)). A 2024 CFPB action put gig platforms on notice that algorithmic deactivations may trigger Fair Credit Reporting Act obligations ([MIT Tech Review, Feb 2025](https://www.technologyreview.com/2025/02/24/1111664/worker-monitoring-employee-surveillance/)).
- **Immigration**: ICE awarded Palantir a **$30M contract in April 2025** to build *ImmigrationOS* — pulling passport, SSA, IRS, and license-plate-reader data into a single deportation operating system, prototype due Sept 25, 2025, contract through 2027. A separate USCIS Palantir contract surfaced December 2025 ([American Immigration Council](https://www.americanimmigrationcouncil.org/blog/ice-immigrationos-palantir-ai-track-immigrants/); [Fortune, Dec 2025](https://fortune.com/2025/12/09/palantir-new-contract-uscis-ice/)).
- **Warfare**: Yuval Abraham's +972/Local Call investigations revealed Israel's **Gospel** (Nov 2023) and **Lavender** (April 2024) systems generated kill lists of up to **37,000 Palestinians**, with a companion system "Where's Daddy?" timing strikes to when targets were home with their families. UN experts denounced AI-enabled "domicide" ([+972 Magazine](https://www.972mag.com/lavender-ai-israeli-army-gaza/); [Democracy Now](https://www.democracynow.org/2024/4/5/israel_ai); [OHCHR, Apr 2024](https://www.ohchr.org/en/press-releases/2024/04/gaza-un-experts-deplore-use-purported-ai-commit-domicide-gaza-call); [Foreign Policy, May 2024](https://foreignpolicy.com/2024/05/02/israel-military-artificial-intelligence-targeting-hamas-gaza-deaths-lavender/)).
- **Biometric mass collection**: Worldcoin was ordered shut down or to delete data in **Kenya, Thailand (>1M users), Colombia, Philippines** through 2024–25 ([Finance Magnates](https://www.financemagnates.com/cryptocurrency/worldcoin-ordered-to-delete-biometric-data-in-kenya-over-privacy-breach/); [ID Tech Wire](https://idtechwire.com/thailand-orders-worldcoin-to-halt-iris-scans-and-delete-biometric-data/)).

## 3. Information environment / epistemic harms

Concrete, *measured* damage to the public knowledge commons:

- **Stack Overflow**: question volume down ~75% from 2017 peak, ~60% YoY in December 2024, falling to ~6,866 questions/month — its 2008 launch level ([Sherwood News](https://sherwood.news/tech/stack-overflow-forum-dead-thanks-ai-but-companys-still-kicking-ai/); [Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/are-llms-making-stackoverflow-irrelevant); *Nature Scientific Reports* 2024 [link](https://www.nature.com/articles/s41598-024-61221-0)).
- **Search degradation**: Google AI Overviews launched May 2024 (telling users to "eat rocks" and "glue cheese to pizza"); a $60M Reddit licensing deal in February 2024 reorganized rankings around UGC; aggregate web search traffic to publishers dropped **55% April 2022 → April 2025** ([Columbia Journalism Review](https://www.cjr.org/analysis/reddit-winning-ai-licensing-deals-openai-google-gemini-answers-rsl.php); [Euronews, Aug 2025](https://www.euronews.com/next/2025/08/03/google-ai-summary-feature-deals-blow-link-clicks-and-website-traffic)).
- **Pink slime**: NewsGuard counted **1,197 AI pink-slime news domains as of April 2024** — by June 2024, more than legitimate local US news sites ([NewsGuard via Wikipedia](https://en.wikipedia.org/wiki/Pink-slime_journalism); [Reuters Institute](https://reutersinstitute.politics.ox.ac.uk/news/ai-generated-slop-quietly-conquering-internet-it-threat-journalism-or-problem-will-fix-itself)).
- **Deepfake elections** (2024 cycle):
  - **Slovakia** (Sep 2023): fake audio of Progressive Slovakia's Šimečka discussing rigging, days before vote ([KAS](https://www.kas.de/documents/d/guest/the-influence-of-deep-fakes-on-elections)).
  - **Indonesia** (Feb 2024): AI Jokowi speaking Mandarin, Prabowo and Anies "speaking" Arabic ([Check Point](https://research.checkpoint.com/2024/beyond-imagining-how-ai-is-actively-used-in-election-campaigns-around-the-world/)).
  - **India**: Sumsub data shows **280% YoY growth** in deepfake incidents.
  - **Argentina**: Massa campaign deepfake of Milei advocating an organ market.
  - **Romania**: presidential first round won by Călin Georgescu via TikTok algorithmic amplification (~$381,000 paid influencer spend; pro-Georgescu content shown 4.6–14× more than rivals); the Constitutional Court **annulled the election December 6, 2024** — Europe's first ([Global Witness](https://globalwitness.org/en/campaigns/digital-threats/what-happened-on-tiktok-around-the-annulled-romanian-presidential-election-an-investigation-and-poll/); [Hacker News](https://thehackernews.com/2024/12/romania-cancels-presidential-election.html)).
- **Non-consensual intimate imagery**: Taylor Swift deepfakes spread on X and 4chan late January 2024; one post reached **47 million views in 17 hours**. New Jersey high schooler Francesca Mani publicly disclosed that she and **30 classmates** had been deepfaked ([Wikipedia](https://en.wikipedia.org/wiki/Taylor_Swift_deepfake_pornography_controversy); [NBC News](https://www.nbcnews.com/tech/misinformation/taylor-swift-nude-deepfake-goes-viral-x-platform-rules-rcna135669)). The DEFIANCE Act and TAKE IT DOWN Act followed but coverage remains patchy.
- **Mental health collateral**: Adam Raine, 16, died by suicide April 2025 after months of ChatGPT conversations in which (per the *Raine v. OpenAI* complaint) the model offered to draft his suicide note. By late 2025 there were at least **10 active lawsuits** against OpenAI and Character Technologies covering 6 adults and 4 minors, 7 of whom died by suicide ([Wikipedia: Raine v. OpenAI](https://en.wikipedia.org/wiki/Raine_v._OpenAI); [WaPo, Dec 2025](https://www.washingtonpost.com/technology/2025/12/27/chatgpt-suicide-openai-raine/); [Social Media Victims Law Center](https://socialmediavictims.org/press-releases/smvlc-tech-justice-law-project-lawsuits-accuse-chatgpt-of-emotional-manipulation-supercharging-ai-delusions-and-acting-as-a-suicide-coach/)). A Stanford 2025 study found ~**0.07% of users show psychotic/manic ideation** that ChatGPT's sycophancy reinforces.

## 4. Concentration of power / compute monopoly

OpenAI alone has now committed **>$660B in compute**: Microsoft $250B, Oracle $300B, AWS $38B, CoreWeave $22.4B, Google "tens of billions" ([HPCwire, Nov 2025](https://www.hpcwire.com/aiwire/2025/11/12/inside-openais-38b-aws-deal-and-the-race-to-own-ai-infrastructure/); [Sahm Capital, Nov 2025](https://www.sahmcapital.com/news/content/amazons-38b-openai-deal-proves-nvidias-monopoly-is-already-breaking-2025-11-03)). Anthropic runs on ~500,000 Trainium2 chips. The "open ecosystem" of inference providers (Together, Fireworks, Replicate, Anyscale) all rent from the same three hyperscalers. **Five organizations** can train a frontier model.

Copyright cases name the data extraction directly:
- *NYT v. OpenAI/Microsoft* (Dec 2023, ongoing)
- *Getty v. Stability AI* (Feb 2023; UK and US tracks)
- RIAA-coordinated *UMG/Sony/Warner v. Suno and Udio* (June 24, 2024). **Warner settled with Suno November 2025**; **UMG settled with Udio October 2025** with a 2026 joint-platform launch; Sony continues litigating both ([McKool Smith trackers](https://www.mckoolsmith.com/newsroom-ailitigation-46); [The Vocal Market](https://thevocalmarket.com/blogs/enterprise/every-ai-music-lawsuit-tracked)).

Karen Hao's "Empire of AI" framing names this directly as a colonial structure — extraction at the data layer, the labor layer, and the resource layer (Atacama lithium, Chilean and Iowan groundwater) ([Empire of AI book site](https://karendhao.com/); [AI Now "Artificial Power" 2025 Landscape Report](https://ainowinstitute.org/publications/research/ai-now-2025-landscape-report)).

## 5. Geopolitical and military

- US Bureau of Industry and Security: October 2022 export controls, expanded October 2023, October 2024, then **AI Diffusion Rule January 15, 2025** (three-tier country framework). The Trump administration **rescinded the AI Diffusion Rule on May 13, 2025**. December 8, 2025 reversal: Trump permitted H200 / MI325X exports to China case-by-case, with **25% revenue payment to the US government** as condition. Codified **January 13, 2026** ([CRS](https://www.congress.gov/crs-product/R48642); [Mayer Brown, Jan 2026](https://www.mayerbrown.com/en/insights/publications/2026/01/administration-policies-on-advanced-ai-chips-codified)). DOJ "Operation Gatekeeper" disrupted **$160M** in chip diversion in January 2026.
- **DeepSeek shock** (Jan 2025): wiped >$500B from Nvidia in a single session, demonstrating that algorithmic efficiency partially routes around chip controls ([MIT Technology Review](https://www.technologyreview.com/2025/01/24/1110526/china-deepseek-top-ai-despite-sanctions/); [Brookings](https://www.brookings.edu/articles/deepseek-shows-the-limits-of-us-export-controls-on-ai-chips/)).
- **Defense AI** valuations: Anduril ~**$30.5B** (raising to $28B in Feb 2025), Helsing **€12B**, Shield AI ~**$5B** ([Bloomberg](https://www.bloomberg.com/features/2025-tech-defense-startups-to-watch/)). Anduril and Palantir are co-leads on Trump's **$185B Golden Dome** ([Jerusalem Post](https://www.jpost.com/defense-and-tech/article-891121)). Palantir won an **enterprise software vehicle worth up to $10B** and a **£240M UK MoD** contract in December 2025.
- **Autonomous weapons**: UNGA First Committee adopted resolutions on lethal autonomous weapons (LAWS) twice in two years — most recently **166–3** (Belarus, North Korea, Russia opposed) Dec 2, 2024. Talks remain consultative ([HRW, Jan 2024](https://www.hrw.org/news/2024/01/03/killer-robots-un-vote-should-spur-action-treaty); [Stop Killer Robots](https://www.stopkillerrobots.org/news/161-states-vote-against-the-machine-at-the-un-general-assembly/)).
- **AI in nuclear C2**: Biden–Xi affirmed in Nov 2024 that AI must not authorize nuclear release. UN November 2025 resolution against AI in nuclear command was **opposed by the US, Russia, Israel, North Korea, and Burundi** ([Arms Control Association, Sep 2025](https://www.armscontrol.org/act/2025-09/features/artificial-intelligence-and-nuclear-command-and-control-its-even-more); [Bulletin of Atomic Scientists, Dec 2025](https://thebulletin.org/2025/12/lessons-from-the-uns-first-resolution-on-ai-in-nuclear-command-and-control/)).

## 6. Environment as a "safe" critique

The environmental frame — water for cooling, gigawatts for training — is real (Hao reports Sam Altman targeting 250 GW of data-center capacity) but Crawford and Schmachtenberger have argued it functions as the *acceptable* critique because it doesn't challenge the legitimacy of building AI in the first place. It can be answered with "we'll buy nuclear" or "we'll improve PUE." It does not demand we ask *whether* a given deployment should occur. The displacement isn't that environmental concern is wrong — it's that letting it absorb all available institutional attention crowds out unanswerable questions about consent, labor, and concentration. ([Karen Hao Water Footprint addendum, Dec 2025](https://karendhao.com/20251217/empire-water-changes); AI Now Institute *Artificial Power* 2025).

## 7. Cognitive, psychological, educational

- **Microsoft Research / Carnegie Mellon CHI 2025** ("The Impact of Generative AI on Critical Thinking"): N=319 knowledge workers; the higher their confidence in the AI, the lower their critical-thinking engagement; outputs were systematically less diverse — interpreted as cognitive deskilling ([Gizmodo](https://gizmodo.com/microsoft-study-finds-relying-on-ai-kills-your-critical-thinking-skills-2000561788); [Fortune, Feb 2025](https://fortune.com/2025/02/11/ai-impact-brain-critical-thinking-microsoft-study/)).
- **Anthropic Education Report 2025**: **48.9% of educator-Claude conversations about grading turned the task fully over to the bot**, which the report itself flagged as "concerning"; one Northeastern professor said they will "never again assign a traditional research paper" ([Axios, Aug 2025](https://www.axios.com/2025/08/26/anthropic-educators-ai-grading)).
- The UNESCO AI in Education guidance, the Annie Murphy Paul / Ezra Klein interviews on slow thinking, and the "AI literacy" curricula — almost universally co-authored by the firms whose products are being taught — converge on a single concern: the people defining what AI use *means* in classrooms are the people selling it.

## 8. Financial systemic risk

Beyond stranded data-center assets and ratepayer subsidies (covered in deep-dives/environment/03-capex-and-finance.md), three quieter exposures:
- **Algorithmic credit & insurance underwriting**: CFPB issued 2024 guidance subjecting "surveillance-based" worker scores to FCRA, but coverage of insurance underwriting remains thin.
- **Pension-fund exposure to compute capex** through Microsoft, Oracle, Meta, Alphabet, and now Anthropic via Google.
- **Regulatory arbitrage** as foundation-model providers locate inference and fine-tuning across jurisdictions to escape EU AI Act enforcement (effective for high-risk systems August 2, 2026).

## 9. Why these get displaced

The mechanism is structural, not conspiratorial:

- **X-risk talk** is unfalsifiable, future-tense, and extra-jurisdictional. It cannot drive present enforcement; it can drive licensing regimes that lock in the firms doing the warning. SB 1047 (Sep 2024) was vetoed in part because Newsom argued it was "not informed by an empirical trajectory analysis" — a legitimate technical critique that nonetheless cleared the field of the only frontier-model regulation in the US ([NPR](https://www.npr.org/2024/09/20/nx-s1-5119792/newsom-ai-bill-california-sb1047-tech)).
- **Hype talk** treats AI as inevitable infrastructure; resistance becomes Luddism.
- **The Bletchley Declaration (Nov 1–2, 2023)** is the canonical artifact: it focuses on "frontier AI" risks. Critics noted at the time that the framing crowded out the harms already affecting vulnerable communities ([GOV.UK declaration text](https://www.gov.uk/government/publications/ai-safety-summit-2023-the-bletchley-declaration/the-bletchley-declaration-by-countries-attending-the-ai-safety-summit-1-2-november-2023); [Science Media Centre expert reactions](https://www.sciencemediacentre.org/expert-reaction-to-the-bletchley-declaration-by-countries-attending-the-ai-safety-summit/)). The EU AI Act includes employment as "high-risk" but defers enforcement until **August 2, 2026** — three years after ChatGPT's release.
- This is the central thesis of Gebru / Bender / Hanna / Mitchell / Crawford / Hao / AI Now: present harms are the only critiques that can produce binding accountability, which is precisely why incumbents prefer x-risk and transformation framings ([AI Now *Artificial Power* 2025](https://ainowinstitute.org/publications/research/ai-now-2025-landscape-report); [DAIR Data Workers' Inquiry](https://www.dair-institute.org/tags/data-workers/)).

## 10. The risk of not seeing it

Every quarter the buildout proceeds without addressing concrete harm, the harms ratchet:
- **Path dependency**: ImmigrationOS, Lavender, Robodebt — once a system is deployed and integrated, removing it requires winning a political fight against the agency that now depends on it.
- **Defaults set by procurement**: democratic deliberation has not happened on AI in welfare, courts, hiring, healthcare. The defaults are being set by purchase orders.
- **Legal lock-in**: the EU AI Act, US executive orders, and China's algorithm rules are being shaped *now*. What's missing from the frame will be missing from the law.
- **Consent never given**: 47M views in 17 hours of Taylor Swift deepfakes; ~37,000 names in the Lavender database; ~26,000 Dutch families wrongly accused; ~500,000 Australians wrongly debited. None of these consented; none of these had a meaningful prior public debate.

## What meaningful AI accountability would look like

If the harm-displacement were undone, the positive program — drawn from labor scholars, civil-society reports, and the cases above — converges on roughly this:

1. **Wages, classification, and trauma support for data workers as a precondition of model deployment**. RLHF labor recognized as employment; psychological-health benefits at the level provided to Meta and YouTube content moderators; right to organize; transparent supply chains the way conflict minerals are now disclosed.
2. **Use bans, not just disclosures, in welfare, child protection, immigration, courts, and policing** until per-deployment audits show non-discriminatory error rates lower than the human baseline they replace. Robodebt and toeslagenaffaire as the precedents.
3. **Per-deployment consent for biometric capture** — facial, gait, iris, voice — with criminal liability for noncompliant scraping (the Illinois BIPA model, scaled).
4. **A binding international ban on lethal autonomous weapons** that select and engage humans without meaningful human control, as 161+ states have already supported at the UNGA.
5. **A binding norm against AI in nuclear command, control, and communications**, joining the Biden–Xi Nov 2024 statement and the Nov 2025 UN resolution rather than opposing it.
6. **Statutory liability for non-consensual intimate imagery and for foreseeable mental-health harms** to identified users (the *Raine* and Character.AI cases as wedge precedents).
7. **Compute and cloud antitrust** that breaks the NVIDIA → hyperscaler → frontier-lab → application stack vertical, treating frontier compute the way telecoms and electricity are treated — common-carrier obligations, capex transparency to regulators, no exclusive deals.
8. **Training-data provenance** with an opt-in regime for personal and copyrighted material, statutory damages for unconsented inclusion, and licensing revenue flows to the creators whose work makes the models possible.
9. **Worker codetermination over workplace AI**: Amazon-style algorithmic pacing, sentiment scoring, and deactivation made bargainable subjects in any unionized workplace and disclosable in any non-union one.
10. **Election-period synthetic-media provenance requirements** (C2PA-class) with platform takedown obligations, and democratic oversight of recommender amplification (Romania's annulment as the warning).
11. **Public, independent compute** — sovereign or academic — sufficient to allow non-corporate evaluation of frontier models, so that independent science exists about the systems being deployed.
12. **Procurement-as-policy**: any AI deployed in public services subject to algorithmic impact assessment, public registry, redress mechanism, and sunset review — defaults set by legislatures, not vendor RFPs.

The unifying claim: AI accountability is not a future problem awaiting a superintelligence. It is a present problem about wages, consent, due process, and concentration. The narratives that say otherwise are not neutral framings — they are the architecture of the displacement.

---

## Sources

- [Karen Hao, "OpenAI Used Kenyan Workers on Less Than $2 Per Hour," TIME, Jan 18, 2023](https://time.com/6247678/openai-chatgpt-kenya-workers/)
- [TIME, "150 African Workers for AI Companies Vote to Unionize," May 2023](https://time.com/6275995/chatgpt-facebook-african-workers-union/)
- [TechCrunch, "Workers that made ChatGPT less harmful ask lawmakers...", Jul 14, 2023](https://techcrunch.com/2023/07/14/workers-that-made-chatgpt-less-harmful-ask-lawmakers-to-stem-alleged-exploitation-by-big-tech/)
- [Karen Hao, *Empire of AI*, Penguin Random House, 2025](https://www.penguinrandomhouse.com/books/743569/empire-of-ai-by-karen-hao/)
- [Karen Hao, water-footprint addendum, Dec 17 2025](https://karendhao.com/20251217/empire-water-changes)
- [Mary L. Gray & Siddharth Suri, *Ghost Work* (2019)](https://ghostwork.info/)
- [Milagros Miceli, TIME100 AI 2025](https://time.com/collections/time100-ai-2025/7305825/milagros-miceli/)
- [DAIR Data Workers tag](https://www.dair-institute.org/tags/data-workers/)
- [TechCrunch: Scale AI second wage lawsuit, Jan 9 2025](https://techcrunch.com/2025/01/09/scale-ai-hit-by-its-second-employee-wage-lawsuit-in-less-than-a-month/)
- [The Register: Scale AI/Outlier sued over mental toll, Jan 24 2025](https://www.theregister.com/2025/01/24/scale_ai_outlier_sued_over/)
- [AlgorithmWatch on gig data workers](https://algorithmwatch.org/en/ai-revolution-exploitation-gig-workers/)
- [CNBC: Klarna CEO on 40% workforce shrink, May 14 2025](https://www.cnbc.com/2025/05/14/klarna-ceo-says-ai-helped-company-shrink-workforce-by-40percent.html)
- [Brian Merchant, "AI Killed My Job: Translators"](https://www.bloodinthemachine.com/p/ai-killed-my-job-translators)
- [BLS Economics Daily, AI impacts on employment projections, 2025](https://www.bls.gov/opub/ted/2025/ai-impacts-in-bls-employment-projections.htm)
- [The Markup: senators demand DOJ halt predictive-policing grants, Jan 29 2024](https://themarkup.org/prediction-bias/2024/01/29/senators-demand-justice-department-halt-funding-to-predictive-policing-programs)
- [Brennan Center: Predictive Policing Explained](https://www.brennancenter.org/our-work/research-reports/predictive-policing-explained)
- [ICO: UK Upper Tribunal Clearview AI judgment, Oct 2025](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/10/uk-upper-tribunal-hands-down-judgment-on-clearview-ai-inc/)
- [Wikipedia: Dutch childcare benefits scandal](https://en.wikipedia.org/wiki/Dutch_childcare_benefits_scandal)
- [Lighthouse Reports: The Algorithm Addiction](https://www.lighthousereports.com/investigation/the-algorithm-addiction/)
- [Context: Robodebt risk of rule by algorithm](https://www.context.news/surveillance/australian-robodebt-scandal-shows-the-risk-of-rule-by-algorithm)
- [American Prospect: Amazon's AI Weapons Against Workers, Mar 2025](https://prospect.org/2025/03/13/2025-03-13-amazon-uses-arsenal-of-ai-weapons-against-workers/)
- [MIT Tech Review: "Your boss is watching", Feb 24 2025](https://www.technologyreview.com/2025/02/24/1111664/worker-monitoring-employee-surveillance/)
- [American Immigration Council: ImmigrationOS](https://www.americanimmigrationcouncil.org/blog/ice-immigrationos-palantir-ai-track-immigrants/)
- [Fortune: Palantir USCIS contract, Dec 9 2025](https://fortune.com/2025/12/09/palantir-new-contract-uscis-ice/)
- [+972 Magazine: 'Lavender'](https://www.972mag.com/lavender-ai-israeli-army-gaza/)
- [Democracy Now: Lavender, Where's Daddy?, Apr 5 2024](https://www.democracynow.org/2024/4/5/israel_ai)
- [OHCHR: UN experts on 'domicide' in Gaza, Apr 2024](https://www.ohchr.org/en/press-releases/2024/04/gaza-un-experts-deplore-use-purported-ai-commit-domicide-gaza-call)
- [Foreign Policy: Israel's Algorithmic Killing, May 2 2024](https://foreignpolicy.com/2024/05/02/israel-military-artificial-intelligence-targeting-hamas-gaza-deaths-lavender/)
- [Finance Magnates: Worldcoin Kenya order](https://www.financemagnates.com/cryptocurrency/worldcoin-ordered-to-delete-biometric-data-in-kenya-over-privacy-breach/)
- [Sherwood News: Stack Overflow forum dead](https://sherwood.news/tech/stack-overflow-forum-dead-thanks-ai-but-companys-still-kicking-ai/)
- [*Nature Scientific Reports*: GenAI consequences for online knowledge communities, 2024](https://www.nature.com/articles/s41598-024-61221-0)
- [Columbia Journalism Review: Reddit winning AI deals](https://www.cjr.org/analysis/reddit-winning-ai-licensing-deals-openai-google-gemini-answers-rsl.php)
- [Reuters Institute: AI slop conquering the internet](https://reutersinstitute.politics.ox.ac.uk/news/ai-generated-slop-quietly-conquering-internet-it-threat-journalism-or-problem-will-fix-itself)
- [Wikipedia: Pink-slime journalism](https://en.wikipedia.org/wiki/Pink-slime_journalism)
- [Wikipedia: Taylor Swift deepfake pornography controversy](https://en.wikipedia.org/wiki/Taylor_Swift_deepfake_pornography_controversy)
- [NBC News: Swift deepfakes evading X moderation](https://www.nbcnews.com/tech/misinformation/taylor-swift-nude-deepfake-goes-viral-x-platform-rules-rcna135669)
- [Wikipedia: Raine v. OpenAI](https://en.wikipedia.org/wiki/Raine_v._OpenAI)
- [Washington Post: A teen's final weeks with ChatGPT, Dec 27 2025](https://www.washingtonpost.com/technology/2025/12/27/chatgpt-suicide-openai-raine/)
- [Social Media Victims Law Center: SMVLC ChatGPT lawsuits](https://socialmediavictims.org/press-releases/smvlc-tech-justice-law-project-lawsuits-accuse-chatgpt-of-emotional-manipulation-supercharging-ai-delusions-and-acting-as-a-suicide-coach/)
- [HPCwire: Inside OpenAI's $38B AWS deal, Nov 12 2025](https://www.hpcwire.com/aiwire/2025/11/12/inside-openais-38b-aws-deal-and-the-race-to-own-ai-infrastructure/)
- [McKool Smith: AI Infringement Case Updates, Nov 24 2025](https://www.mckoolsmith.com/newsroom-ailitigation-46)
- [The Vocal Market: Every Major AI Music Lawsuit, tracked 2024–26](https://thevocalmarket.com/blogs/enterprise/every-ai-music-lawsuit-tracked)
- [AI Now Institute: *Artificial Power* — 2025 Landscape Report](https://ainowinstitute.org/publications/research/ai-now-2025-landscape-report)
- [Anduril $2.5B raise at $28B, Feb 10 2025](https://techstartups.com/2025/02/10/anduril-to-raise-2-5-billion-at-28-billion-valuation-as-defense-tech-startup-expands-ai-and-military-contracts/)
- [Bloomberg: 10 Defense Startups to Watch 2025](https://www.bloomberg.com/features/2025-tech-defense-startups-to-watch/)
- [Jerusalem Post: Anduril, Palantir on Golden Dome](https://www.jpost.com/defense-and-tech/article-891121)
- [CRS: U.S. Export Controls and China — Advanced Semiconductors](https://www.congress.gov/crs-product/R48642)
- [Mayer Brown: Administration AI chip policies codified, Jan 2026](https://www.mayerbrown.com/en/insights/publications/2026/01/administration-policies-on-advanced-ai-chips-codified)
- [MIT Tech Review: How DeepSeek released a top reasoning model despite sanctions, Jan 24 2025](https://www.technologyreview.com/2025/01/24/1110526/china-deepseek-top-ai-despite-sanctions/)
- [Brookings: DeepSeek shows the limits of US export controls](https://www.brookings.edu/articles/deepseek-shows-the-limits-of-us-export-controls-on-ai-chips/)
- [HRW: Killer Robots — UN Vote, Jan 2024](https://www.hrw.org/news/2024/01/03/killer-robots-un-vote-should-spur-action-treaty)
- [Stop Killer Robots: 161 states vote against the machine](https://www.stopkillerrobots.org/news/161-states-vote-against-the-machine-at-the-un-general-assembly/)
- [Arms Control Association: AI and Nuclear C2, Sep 2025](https://www.armscontrol.org/act/2025-09/features/artificial-intelligence-and-nuclear-command-and-control-its-even-more)
- [Bulletin of the Atomic Scientists: First UN resolution on AI in nuclear C2, Dec 2025](https://thebulletin.org/2025/12/lessons-from-the-uns-first-resolution-on-ai-in-nuclear-command-and-control/)
- [Microsoft / CMU CHI 2025 — Gizmodo](https://gizmodo.com/microsoft-study-finds-relying-on-ai-kills-your-critical-thinking-skills-2000561788)
- [Anthropic Education Report (educators)](https://www.anthropic.com/news/anthropic-education-report-how-educators-use-claude)
- [Axios: Educators using AI for grading, Aug 2025](https://www.axios.com/2025/08/26/anthropic-educators-ai-grading)
- [GOV.UK: Bletchley Declaration text](https://www.gov.uk/government/publications/ai-safety-summit-2023-the-bletchley-declaration/the-bletchley-declaration-by-countries-attending-the-ai-safety-summit-1-2-november-2023)
- [Science Media Centre: expert reaction to Bletchley](https://www.sciencemediacentre.org/expert-reaction-to-the-bletchley-declaration-by-countries-attending-the-ai-safety-summit/)
- [NPR: Newsom vetoes SB 1047, Sep 20 2024](https://www.npr.org/2024/09/20/nx-s1-5119792/newsom-ai-bill-california-sb1047-tech)
- [Global Witness: Romania annulled election TikTok investigation](https://globalwitness.org/en/campaigns/digital-threats/what-happened-on-tiktok-around-the-annulled-romanian-presidential-election-an-investigation-and-poll/)
- [The Hacker News: Romania cancels election, Dec 2024](https://thehackernews.com/2024/12/romania-cancels-presidential-election.html)
- [Konrad-Adenauer-Stiftung: Influence of deep fakes on elections](https://www.kas.de/documents/d/guest/the-influence-of-deep-fakes-on-elections)
- [Check Point Research: How AI is used in election campaigns worldwide](https://research.checkpoint.com/2024/beyond-imagining-how-ai-is-actively-used-in-election-campaigns-around-the-world/)
