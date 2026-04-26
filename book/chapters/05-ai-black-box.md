# Chapter 5 — The Word *AI* — A Semantic Black Box

A nonprofit director sits across a table from someone who has
built a free, locally-served, open-source educational tool about
the regional aquifer. The tool runs on a small purpose-built
neural network that is trained on publicly available
hydrogeological data. It does not connect to a frontier large
language model. It does not require a hyperscaler. It runs on a
laptop. The educational material it produces is licensed
Creative Commons. It would cost the nonprofit nothing. The
director declines, friendly but firm: *people are against AI*.

This is a real meeting. It happens, or some version of it
happens, every week in the United States, the United Kingdom,
much of Western Europe, and in any community currently living
near a large data-center build. The decline is sincere. The
director is not dishonest. The director is reporting on a
political reality: their constituency would not understand the
distinction between what was being offered and what they have
been told to be afraid of, and the director's job is to manage
the constituency.

This chapter is about the word that makes the distinction
disappear. The framework's argument is that the word *AI*, as
used in contemporary public discourse, has become *analytically
unusable*. It is a category so broad that it covers a thermostat
and ChatGPT, a regression model and a frontier-lab training run,
a recommender system and a person at a desk doing manual data
labeling. Each side of every public argument benefits from
keeping the category undifferentiated, because a category that
is not decomposed cannot be argued with on specifics. The
governance pathology of our moment is not that the public has
the wrong opinion about AI. It is that *the public, the experts,
the regulators, the journalists, and the researchers are all
working with a word that does not refer to a bounded set of
objects*. Almost everything that follows from this chapter
depends on getting the decomposition into hand, so it is worth
slowing down to do it.

## What "AI" actually covers

The word currently covers, at minimum, the following
operationally distinct things:

- A *thermostat* with a feedback loop that adjusts behavior
  based on input. This counts as AI under the broadest
  academic definitions (Russell & Norvig's *rational agent*),
  though almost no one means it when they say AI in
  conversation.
- A *regression model* of the kind a public-health agency
  runs to predict influenza spread. Counts as AI under the
  US National Institute of Standards and Technology's
  framework. Also counts as *statistics* under the framework
  most statisticians would prefer.
- A *recommender system* of the kind that decides which
  videos appear next on YouTube, which job postings appear
  on LinkedIn, which loan applications get approved at
  speed. Counts as AI under most regulatory frameworks.
  Has been deployed at scale for fifteen years and is the
  subject of Chapter 6.
- A *machine-learning classifier* of the kind a hospital
  uses to flag suspicious tissue in a radiology image. Counts
  as AI; counts as *clinical decision support*; counts as
  *medical-device software* under FDA regulation.
- A *physics-informed neural network* of the kind a
  hydrogeologist might use to model an aquifer or a climate
  scientist might use to downscale a regional climate
  projection. Counts as AI taxonomically, has none of the
  properties most people are alarmed about, and is the kind
  of system the educational tool in the opening scene of this
  chapter actually was.
- A *fine-tuned task-specific large language model* of the
  kind a law firm might use to draft contract first-passes.
  Counts as AI; uses substantial training compute upstream
  but minimal compute per query downstream.
- A *frontier large language model* of the kind OpenAI,
  Anthropic, Google DeepMind, Meta, and a small number of
  other labs are building. Counts as AI in every framework.
  The thing most people most often mean when they say AI in
  conversation. The economic and ecological footprint that
  most public concern is reacting to is concentrated here.
- A *generative image, video, or audio model* of the kind
  Midjourney, Sora, ElevenLabs, and others operate. Counts
  as AI. Also counts as the source of the most-discussed
  contemporary copyright disputes.
- A *robotic system with embedded learning* of the kind
  warehouse, agricultural, and military operations are
  deploying. Counts as AI. Almost never the thing meant in
  conversational use of the word.
- A *biometric or face-recognition system* of the kind
  airports, police departments, and immigration agencies
  deploy. Counts as AI in every framework. Subject of the
  longest-running and most-documented critical literature.

This list is not exhaustive. It is the bare minimum
decomposition required to have a coherent public conversation
about AI. The current public conversation does not perform
this decomposition. The current regulatory conversation
performs it inconsistently. The current academic literature
performs it in some places and not others. The current
investor conversation performs it in only one direction (when
asked to defend the high cost of frontier-LLM training, by
pointing to the broader category as the source of value).

## The eighteen definitions problem

To get a sense of how unstable the category is, consider the
range of definitions in current institutional use.

The European Union's *AI Act* (2024) defines AI as a system
with *varying autonomy* and *adaptiveness* that *infers from
input how to generate outputs*. This is broad. A regression
model that adapts its weights to new training data qualifies.

The U.S. National Institute of Standards and Technology
defines AI more broadly still, in language that does not
require autonomy or adaptiveness: any *engineered or
machine-based system* that can produce outputs *for a given
set of human-defined objectives*. A regression model
qualifies; so does, arguably, a thermostat.

The U.K. AI Safety Institute uses a much narrower
definition: *frontier AI*, meaning systems at or near the
current capability frontier. This is roughly thirty
specific systems at any given time, all from a small number
of labs.

China's *Interim Measures for the Management of Generative
AI Services* (2023) is narrower still: only public-facing
generative AI services count for regulatory purposes.

The OECD definition splits the difference, focusing on
systems that *infer outputs* from inputs. The ISO/IEC
definitions in the AI standards series are different again.
Each of the major AI ethics organizations operates with a
slightly different working definition. Most academic
computer-science textbooks (Russell & Norvig is the
canonical case) use a definition broad enough to cover
classical optimization algorithms.

By a conservative count, there are at least eighteen
substantively different definitions of *AI* in current
institutional use. They do not agree on whether a thermostat
is AI. They do not agree on whether a fine-tuned classifier
is AI. They mostly agree that ChatGPT is AI, but they
disagree on whether the underlying transformer architecture
or the trained weights or the deployed application is the
relevant unit of regulation.

There is no neutral fact of the matter. *AI* is a contested
category, and the contest is itself political: each
definition advantages some actors and disadvantages others.
The frontier labs prefer the U.K. AISI definition because it
restricts regulatory attention to them and to a few peers.
The smaller open-source AI community prefers broader
definitions because they distribute the regulatory burden.
The civil-liberties community prefers definitions broad
enough to capture the algorithmic decision systems whose
specific harms they document.

## The AI effect

The computer scientist Larry Tesler, who spent his career at
Xerox PARC, Apple, and Stanford, observed in the 1980s that
*intelligence is whatever machines haven't done yet*. The
observation is now known, somewhat ironically, as the *AI
effect*. Tesler's point was that the boundary of what counts
as AI moves continuously, and that it moves in one specific
direction: away from whatever has been recently solved.

Chess was AI when computers could not play chess. After Deep
Blue beat Kasparov in 1997, chess became *just computation*.
Optical character recognition was AI when it did not work.
After it did, it became *just OCR*. Speech recognition was
AI when it did not work. After it did, it became *just
voice input*. Search ranking was AI when nobody knew how to
do it. After PageRank, it became *just search*.

The pattern is reliable enough to be diagnostic. As soon as
something starts to work, the AI label peels off and reattaches
to whatever is still unsolved. This is why the contemporary
contents of *AI* — generative LLMs, multimodal models,
autonomous agents — are exactly the contents that are not yet
fully working. The label is calibrated to the unsolved
frontier, not to the solved technology that is already
everywhere.

The diagnostic implication for this book is that the word *AI*
is structurally migrating. A reader returning to this chapter
in 2030 will find that several of the items on the list above
no longer count as *AI* in conversational use, because they
will have been solved by then. New items will have moved into
the category. The substrate will have shifted. The thing the
word refers to will have to be re-decomposed.

This is not a complaint. It is a feature of how technological
categories work, and we should design the discussion to be
robust to it.

## What a careful person should do

The framework's recommendation, repeated through the rest of
this book, is that *AI* be treated as a placeholder that
demands immediate decomposition into specifics. When you read
or hear a claim about AI, the question to ask is not *do I
agree with this claim*; the question to ask is *which AI*?

Some examples of how the substitution works:

> *AI is going to take our jobs.*

Decomposed: *Which AI? Recommender systems took some hiring,
lending, and journalism jobs over the last fifteen years
without producing public debate. Generative LLMs are
threatening some white-collar drafting and customer-service
work in a more visible register. Robotic systems with embedded
learning are threatening warehouse, agricultural, and
some logistics work. Each of these is happening at a
different gradient, with different political consequences,
and is doing different things to different populations.
Treating them as one phenomenon prevents the analysis that
would let us argue about any of them.*

> *AI is going to consume all the water.*

Decomposed: *Which AI? Frontier-LLM training at scale, in
data-center clusters located in already water-stressed
regions, has substantial water and power costs that are
documented and worth taking seriously. A small purpose-built
model running on a laptop in a hydrogeology classroom uses
the water and power of the laptop. Treating these as the
same thing produces a politics that opposes the laptop along
with the data-center cluster, which is bad politics and
worse hydrology.*

> *AI is going to destroy democracy.*

Decomposed: *Which AI? The recommender systems that have
fragmented the broadcast-era informational base have already
done substantial work in this direction; if you were going
to worry about AI and democracy on the basis of the
empirical record, this is what you would worry about.
Generative AI as a source of mass-produced political
disinformation is a real concern but a smaller one than the
recommender systems are, because the recommender systems are
what determines what content reaches whom regardless of who
produced it. Frontier LLMs as autonomous political actors are
a speculative concern that displaces attention from the
documented case.*

> *AI is going to liberate us.*

Decomposed: *Which AI? Open-source models running on
commodity hardware, distributed under permissive licenses,
designed for specific domains and built by small teams that
work directly with the people they serve, can do real
liberatory work in fields previously dominated by
proprietary-software gatekeepers. Frontier-LLM access through
a platform whose terms-of-service let the platform unilaterally
revoke your access at any time is a different thing entirely.
Conflating the two — which most contemporary AI advocacy
does — produces a politics that confuses access to a
proprietary product with structural change in the
distribution of capacity.*

The pattern is the same in all four cases. The unprocessed
claim about *AI* is at best ambiguous and at worst actively
misleading. The decomposed version becomes arguable, and
becomes either right, wrong, or partially right depending on
which specific claim is being made.

## Why nobody wants to do this

The decomposition is not technically difficult. It does not
require specialized expertise; the list of distinct AI
categories at the start of this chapter is something a
journalist or a policymaker could produce in an hour with
careful reading. So why doesn't the contemporary public
conversation do it?

The framework's answer is that *the refusal to decompose is
itself the governance pathology*. It is not a misunderstanding
to be cleared up. It is a posture that benefits specific
actors on every side of the conversation:

The *frontier labs* benefit from undifferentiation because it
lets them claim the broader category's value (*AI is
transformative*) while accepting only the broader category's
risk frameworks (*we are working on AI safety, alignment,
responsible scaling*) — both of which are vaguer than the
specifics of what the labs are actually building and
deploying.

The *AI-doom advocates* benefit from undifferentiation
because their concerns are easier to communicate when the
category is monolithic. Specific concerns about specific
systems would require specific empirical work and would be
contestable on specifics; the broader civilizational concern
travels better in the undifferentiated form.

The *AI-skeptic nonprofits and advocates* benefit from
undifferentiation because their constituencies have absorbed
the negative valence of the broader category. Pointing at the
specific cases — the small, locally-served, openly-licensed
tools that do not have the properties their constituencies
are alarmed about — would require constituency-management
work they may not have the capital to do.

The *journalists* benefit from undifferentiation because
specific stories about specific systems require specific
expertise; the broader-category story can be written by a
generalist on deadline.

The *regulators* benefit from undifferentiation in a more
complicated way: they have to write rules in the broader
category because the political coalition for action is in
the broader category, but they then have to enforce in the
specifics, where the coalition disappears.

The pattern reproduces itself because every individual actor
faces incentives to keep the category undifferentiated, even
though the collective consequence is a public conversation
that cannot reliably engage with the specific harms or
benefits of any specific system.

## The one good piece of news

The decomposition is doable. It does not require a specialist
vocabulary. It requires the discipline of asking *which AI*
every time the unprocessed word appears, and the willingness
to slow down a conversation by demanding specifics.

The chapters that follow will perform this decomposition on
two specific cases. Chapter 6 takes recommender systems —
the category of AI that has done the most work in
reorganizing contemporary life and has produced the least
public debate. Chapter 7 takes generative AI as it appeared
in late 2022 — the category that produced the most public
debate and has, so far, done less work than the discourse
implies. The contrast between the two is the framework's
worked example of why the *which AI* question matters and
what kind of answers it produces.

Chapter 8 then turns to labor — the substrate where the
decomposition matters most for the reader's daily life,
because almost every reader of this book is currently
inside a profession that is being restructured by one or
more of the AI categories above, often without being able
to name which one is doing the restructuring.

[^ch5-1]: For a general overview of the eighteen-definitions
problem and the regulatory landscape, see the LeResearch
investigation at `/ai/definitions` (live website).

[^ch5-2]: Larry Tesler's *AI effect* observation circulated
in conversation through the 1970s and 1980s before being
written down in published form. The most-cited written
version is in Pamela McCorduck, *Machines Who Think*
(W. H. Freeman, 1979), 423–425.
