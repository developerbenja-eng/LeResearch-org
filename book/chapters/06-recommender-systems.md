# Chapter 6 — Recommender Systems — The Fifteen Years We Did Not Notice

A young woman in 2009 begins applying for entry-level jobs out of
college. She uses the website that has, in the past few years,
become the default place to look: an aggregator that promises to
match her résumé against open positions. The aggregator's
algorithm, which she does not see, evaluates her résumé against
patterns of past successful candidates at each company. She is
matched with twelve openings. She applies to all of them. She
hears back from one. She does not know why she did not hear back
from the other eleven. The other eleven hiring managers do not
know they did not hear from her, because the algorithm filtered
her out before her résumé was put in front of any of them.

A man in 2014 applies for a small-business loan. The bank's
underwriting software, which the loan officer does not really
control, scores him in six seconds against a model trained on the
default and repayment patterns of millions of past borrowers. He
is denied. The loan officer apologetically explains the decision
in language that suggests it was made by *the system*. The man
asks if there is an appeal process. There is. The appeal process
involves a human reviewer looking at the same model output. He is
denied on appeal.

A judge in 2016 sentences a defendant to two years longer than
she would otherwise have given, because the *risk-assessment
algorithm* her court has begun using flagged the defendant as
*high risk* for re-offending. The judge does not see the
algorithm's training data. The judge does not see the algorithm's
weights. The judge does not see the demographic breakdown of the
algorithm's false-positive rates. The defendant does not know any
of this either. The defendant goes to prison for two extra years.

A teenager in 2019 spends four hours a day on a video platform
whose recommendation algorithm has, over the past six months,
calibrated itself to her engagement patterns and started
recommending content optimized for the affective response that
keeps her watching. The content has gradually become more extreme.
She does not notice the gradient. Her parents do not notice the
gradient. The platform does not notify her or her parents that
she is being shown a different feed than her friend on the same
platform. The teenager develops a worldview that is downstream of
the recommendation pattern. She does not know this is what
happened.

A renter in 2021 looks for an apartment in a city that has
recently implemented an algorithmic tenant-screening service used
by most of the large landlords. The screening service uses public
records, social media, and behavioral data to score her as a
*risk*. She is denied at six properties in a row before she gives
up and moves further from her job. The properties' owners do not
know each other. They are using the same screening service. The
screening service does not tell her why she was denied. State law
does not require it to.

These five vignettes are composite — none describes a specific
named individual — but they describe documented patterns. Each
of them is the visible surface of a deployment of *AI*, in the
specific form that this book has been calling *recommender
systems*. None of them produced a public debate of the kind
generative AI produced in late 2022. All of them did, on the
empirical record, more work in reorganizing contemporary life
than any single generative-AI release has done. This chapter is
about why the reorganization escaped public attention, and what
it tells us about the political asymmetry of the gradient
mechanism we named in Chapter 3.

## The fifteen-year arc

The earliest large-scale recommender systems in the contemporary
sense — Amazon's *people who bought this also bought*,
Netflix's movie-rating algorithm, Google's PageRank — date to
the late 1990s. By 2010, recommender systems of various kinds
were running underneath most of the major web platforms. By
2015, they had migrated outward from consumer-facing platforms
into hiring (LinkedIn, Indeed, applicant-tracking software),
lending (Affirm, Klarna, the algorithmic-underwriting backend
of nearly every consumer credit product), housing (Zillow,
algorithmic landlord-screening services like RealPage), news
(Facebook's News Feed algorithm, Google's news-ranking
algorithm), dating (Tinder, Hinge, Bumble), and political
campaigning (the Cambridge Analytica disclosures of 2018 made
this layer briefly visible).

By 2020, recommender systems were also running underneath most
of the medium-stakes administrative decisions in employment
(performance management, promotion ranking, layoff selection),
in education (admissions filtering at the high-volume schools,
plagiarism detection, grading-assist tools), in welfare
benefits (the Australian *Robodebt* case, the Dutch childcare
benefits scandal, multiple U.S. state unemployment-benefit
fraud-detection systems), and in insurance (premium
calculation, claims processing, fraud detection).

By the time generative AI became the public conversation in
late 2022, recommender systems had been deployed at scale for
roughly fifteen years across nearly every domain in which a
high-stakes decision about an individual's life is made by a
large institution. The reorganization had not been silent in
the trade press, in academic computer science, or in the
literature of digital civil liberties. It had been silent in
the broader public conversation, in mainstream political
debate, and in the imagined-community discussions that produced
the previous generation's understanding of what *technology*
was doing to *society*.

## The shape of the gradient

Why did this slip past the sensors? Apply Chapter 3's
normalization-gradient argument. Each individual deployment of
a recommender system was a small change. The hiring filter
that screened the young woman's résumé was an incremental
update to the existing applicant-tracking system her target
companies were already using. The credit-scoring model that
denied the man's loan was a quiet refinement of the bank's
existing underwriting practice. The risk-assessment algorithm
in the judge's courtroom was rolled out as a *decision-support
tool*, not as a sentencing replacement. The video platform's
recommendation algorithm became more extreme not in a single
release but in continuous A/B-tested optimization toward
engagement metrics, with each individual change too small to
register as a departure from the previous state.

At every step, the change moved on a gradient shallow enough
that no specific moment felt like the moment to debate it.
The cumulative effect, over fifteen years, was a transformation
of high-stakes administrative life that nobody specifically
deliberated about, because no specific moment ever felt like
the moment to deliberate.

This is the normalization gradient operating at societal
scale. It is exactly what Chapter 3 predicted would happen
with any sufficiently slow change in the inherited frame. The
recommender-systems case is the most-developed empirical
demonstration of the prediction we have.

## What Zuboff actually documented

The most careful single account of this transformation is in
Shoshana Zuboff's *The Age of Surveillance Capitalism*
(2019). Zuboff, an emerita professor at Harvard Business
School, spent roughly a decade researching the business-model
shift that produced the recommender-system layer. The book
took its evidentiary base from patent filings, financial
disclosures, internal Google and Facebook documents obtained
through litigation, and a careful reading of corporate
communications against their own subsequent actions.[^ch6-1]

Zuboff's central conceptual move was to introduce four terms
that the framework will borrow as load-bearing.

*Behavioral surplus* is the data about human activity that
exceeds what is needed to provide the surface service.
Google's search service can be provided with the queries
themselves; the location data, click patterns, scroll
velocity, dwell times, and the rest of the *behavioral
exhaust* the service collects beyond the queries are the
surplus. Zuboff's argument is that the realization, at
Google around 2001–2004, that this surplus could be
extracted and monetized was the founding move of the
surveillance-capitalism business model.

*Prediction products* are what the surplus gets converted
into: machine-learning forecasts of future behavior that
are sold to actors whose interest is in shaping that
behavior. Advertisers were the first market for these
products; the framework has since extended to insurance,
credit, hiring, real estate, and political persuasion.

*The unilateral incursion into experience* is Zuboff's
phrase for the mechanism by which the surplus is extracted.
Users do not meaningfully consent to the extraction in any
way that ordinary contract law would recognize as consent
— the terms-of-service agreements that purport to authorize
it are not read, are not negotiable, and would not be
defensible on most informed-consent standards. The
extraction is an unauthorized seizure of human experience as
raw material, comparable in structure (though not in
degree) to the historical primitive accumulations that
produced earlier capitalist orders.

*Instrumentarian power* is Zuboff's term for the political
mechanism that the recommender-system layer enables. She
distinguishes it from older *totalitarian power*, which
sought to dominate through ideology and coercion.
Instrumentarian power does not require ideological
commitment. It requires only behavioral compliance, achieved
by making certain behaviors easier and others harder
through interface design. The instrumentarian institution
does not need its members to *believe*. It needs them to
*do*.

Each of these four terms, taken together, names what
recommender systems have actually been doing during the
fifteen-year arc. Not in the sense that every platform's
engineering team consciously thought of it this way — most
of them did not — but in the sense that the systems'
emergent behavior matches the description.

## The shallow gradient was the strategy

Zuboff's most important contribution to the analysis is not
the four terms themselves but her demonstration that the
shallow gradient was not accidental. The unilateral incursion
into experience was deliberately structured to avoid
triggering the sensors that would have produced public
resistance. The terms-of-service updates were quiet. The
data-collection expansions were quiet. The cross-platform
behavioral profiling was quiet. The optimization-for-engagement
metric tuning was quiet. The eventual dominance of the
business model was *not* the result of a public moment in
which the public said yes. It was the result of a thousand
small moments in which no public said anything, because no
public was looking.

Zuboff names this with characteristic care: the surveillance-
capitalism arrangement *was not chosen by users in any
meaningful sense*; it was *imposed unilaterally by a small
number of corporate actors who understood the political
economy of attention better than anyone watching them did*.
The framework calls this the political instrumentalization
of the normalization gradient. Same observation, different
vocabulary.

This is also the framework's clearest case for the §3
argument that the shock-and-normalize cycle is increasingly
being used as an instrument. The actors who built the
recommender-system layer did not need a shock window. They
had something more valuable: a slow gradient, sustained over
fifteen years, during which the public attention apparatus
was busy with other things and the regulatory apparatus was
operating with a vocabulary that did not match what was
being deployed.

## The asymmetry the chapter wants to lodge

The framework's central observation about the
recommender-systems arc is asymmetric, and the asymmetry is
the part most worth absorbing. **The recommender systems have
been more consequential than generative AI by every
empirically defensible measure** — number of high-stakes
decisions made, number of people whose life trajectories have
been shaped, magnitude of population-level effects on hiring,
lending, sentencing, news distribution, mental health, and
political polarization. **And yet the recommender systems have
produced approximately none of the public debate that
generative AI produced in late 2022.**

This is not because the recommender-systems harms are
smaller. The literature documenting them is extensive. The
DAIR Institute, the Algorithmic Justice League, AI Now,
AlgorithmWatch, EPIC, the ACLU, and a long list of academic
researchers have produced a continuous stream of empirically
specific reports on recommender-system failure modes for
fifteen years. The literature is there.

The literature has not produced the public debate that the
empirical record would justify, because the recommender-system
deployments did not cross into the sensor-firing range that
would have made them a matter of public attention. Generative
AI did. Generative AI crossed into the range *not because it
was more consequential* but because it produced visible output
in the language of the people writing the discourse. Words on
the screen, in English, that read like a person had written
them. The threshold-crossing produced the shock; the shock
produced the public attention; the public attention produced
the moment of possible regulation.

The framework's recommendation is that the public conversation
recalibrate against this asymmetry deliberately. The fact
that something produced a shock window does not make it the
most consequential AI deployment. Often it makes it less so,
because the actors who benefit from the consequential silent
deployments are happy to let the public attention be absorbed
by the visible shocking ones.

## What the chapter has not yet said

This chapter has not yet said what to *do* about the
recommender-system arc. Some of what to do is in Chapter 9
(on compression and lockstep truth) and Chapter 11 (on the
operational principles the framework is willing to commit
to). Some of what to do is in the documented worked examples
on the live LeResearch site, particularly the
SAG-AFTRA / WGA case studies — bargaining-table decompositions
of *AI* into specific operational sub-cases, achieved by
labor organizations with sufficient capital to afford the
work.

What this chapter wants to lodge, before moving on, is the
structural observation. The most consequential AI deployment
of the past fifteen years has been the one we did not notice.
The one we noticed in late 2022 — the one that produced the
shock window and dominated the public attention through 2023
and 2024 — is downstream of the same business model and the
same normalization-gradient mechanism, but its visibility is
not a measure of its consequence. It is a measure of how
loud it can speak to us in our own language.

The next chapter takes the visible edge of the moment —
generative AI — and asks what was actually decided during
the shock window of late 2022 and early 2023, and by whom.

[^ch6-1]: Shoshana Zuboff, *The Age of Surveillance Capitalism:
The Fight for a Human Future at the New Frontier of Power*
(PublicAffairs, 2019). Approximately 700 pages; the
load-bearing chapters for this book are Part I (the
discovery of behavioral surplus and the founding of the
business model at Google) and Part III (instrumentarian
power). For the documented literature on recommender-system
harms more generally, see the live LeResearch
investigation at `/ai/tracking`.
