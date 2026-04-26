# Chapter 9 — Compression, Silent Versioning, and the Risk of Lockstep Truth

A graduate student in 2024 is writing a literature review. She
opens a chat window with the language model her university has
licensed and asks for an overview of the major debates in her
subfield over the past two decades. The model produces a
confident, well-organized, citation-rich response. She copies the
key passages into her draft, follows up the citations, finds that
most of them check out, and writes the review around the model's
synthesis.

Three months later, a different graduate student at a different
university asks the same question to the same model — except the
model has been silently updated in the interim, with a new
training cut-off, new RLHF preferences, and a new system prompt.
The response she receives is differently organized, draws
different debates as central, and emphasizes different authors as
foundational. The two reviews, written from the same model on
the same prompt, look like the work of different research
traditions. Neither student knows that the other student exists.
Neither student knows the model has been updated. Both reviews
are submitted, accepted, and cited.

This is a small case. The framework's argument is that the same
mechanism is happening at every scale at which model-mediated
synthesis is replacing the older infrastructure of disagreement,
peer review, citation, and intellectual debate. The synthesis
layer is being silently versioned by a small number of
privately-governed actors, and the synthesis layer is what
contemporary populations are increasingly using as the default
source of *what is the case*. The risk this chapter wants to
name is the risk that the public capacity for collective
error-correction — which has always depended on the *visibility
of disagreement* — is being thinned by the compression of
disagreement into a small number of model outputs.

## Compression

The previous chapters have been about specific deployments of
AI doing specific work. This chapter is about something
quieter and structurally more important: the way the available
distribution of intellectual work in a society gets reshaped
when more and more queries about *what is true* get routed
through a small number of privately governed compression
layers.

A compression layer, in this context, is any system that takes
the messy, contested, multi-perspectival output of a
disagreement-rich field — historical scholarship, legal
analysis, scientific consensus, journalistic coverage — and
returns a single confident-sounding voice that summarizes it.
The most visible contemporary compression layer is the
generative-AI chat interface, but the older Wikipedia-and-
Google-snippet layer was a compression layer too, as was the
broadcast-news synthesis layer of the twentieth century, and
the encyclopedia synthesis layers of the eighteenth and
nineteenth.

What is different about the contemporary compression layer is
the combination of three features. First, the breadth of
domains it covers in a single interface — previous compression
layers were domain-specific (the encyclopedia article on a
topic, the news report on a topic, the Wikipedia entry on a
topic), while the contemporary layer covers everything in one
interface and one voice. Second, the apparent confidence of
the synthesis — previous compression layers carried explicit
markers of authorship, sourcing, and uncertainty (the
encyclopedia entry was signed by an author, the news report
was bylined, the Wikipedia article had visible edit history),
while the contemporary layer presents the synthesis as a
unified voice with no visible author, no visible sourcing
unless asked, and no visible uncertainty unless prompted to
display it. Third, the scale and proprietary character of the
governance — previous compression layers were governed by
publicly identifiable institutions whose editorial decisions
could be challenged, debated, or reformed, while the
contemporary layer is governed by a small number of for-profit
companies whose RLHF decisions, system-prompt configurations,
and content policies are not public.

The combination is what produces what the framework is calling
*lockstep truth*: the risk that the population's default
answer to any given factual question converges on whatever
the dominant model returns at the moment of asking, and that
the convergence is not stable across time because the model
returns different answers as it is silently updated.

## What gets compressed

Every contemporary compression operates against a substrate of
human-produced material that is heavily skewed by who got to
write what, in what historical period, in what language, with
what publishing infrastructure, and with what citation
practices. Every well-known feature of the published record's
biases — the over-representation of male authors in
peer-reviewed scientific literature, the over-representation
of European and North American perspectives in academic
publishing more generally, the under-representation of
non-English-language sources in major-language synthesis, the
older-period bias in classical canon — is preserved, and
compressed, and then represented as the default *what is
known*.

A small concrete example. An image-generation model is asked
to produce an illustration of a community gathered around a
table for a meal. Most of the figures the model places in the
illustration are Black or brown. The one figure in the center
of the frame, taller than the others and dressed in a suit,
is white. Nobody told the model to do that. The training
distribution did. The training distribution is a statistical
record of whose bodies, whose clothes, whose postures were
historically placed at the centers of frames in the images
the model was trained on. The frame is not the model's bias.
The frame is the cumulative cultural record's bias, made
operationally visible by the model's compression of it.

*The frame IS the malice, carried forward.*

This phrase will appear repeatedly in the rest of this
chapter, because it is one of the framework's most
load-bearing observations. The question is not whether
compression layers are biased. They are biased. The question
is what the bias does when the compression layer becomes the
default informational substrate for a society, and whether
the population using the layer has the visibility, the
vocabulary, and the institutional infrastructure to argue
with the bias when it surfaces.

## Silent versioning

The second feature of the contemporary compression layer that
matters for the framework is that it is *silently versioned*.
RLHF (reinforcement learning from human feedback) updates
happen continuously. Fine-tunes ship without announcement.
A/B tests run on real questions in real production contexts.
The answer the model returns today is not the answer it
would have returned last quarter, and the people using the
model typically do not know.

This is unusual relative to previous knowledge infrastructure.
A textbook revision had a visible edition number. A Wikipedia
edit had a timestamped diff. A journalistic correction had a
correction notice. A scientific retraction had a published
retraction. The previous knowledge infrastructure had built
into it the visibility of *change in the consensus over time*,
and that visibility was load-bearing for the population's
capacity to know when consensus had shifted and to argue
about whether the shift was justified.

The contemporary compression layer has none of this. The
model's answer to a question changes over time. The change
is not announced. The change is not versioned visibly. The
change is not subject to public review. A research project
that depended on a particular model output six months ago
cannot reliably reproduce the output today. A claim that a
journalist verified against a model in March cannot be
re-verified against the same model in September. The
substrate is moving without the population using the
substrate being able to observe the movement.

The empirical record on this is documented but
under-publicized. Studies have shown that GPT-4's accuracy
on specific tasks (prime-number identification, certain
logical-reasoning tasks, certain code-generation tasks) has
varied substantially across the model's deployment history
— in some cases, accuracy has gone *down* over time as
RLHF updates have shifted the model's behavior in
directions that improve some metrics at the cost of others.
The population using the model typically does not know
this. The model's interface presents the same name (GPT-4,
or GPT-4o, or GPT-5) regardless of which specific version
is currently being served.[^ch9-1]

The combination of compression and silent versioning means
that *the truth-claim of the moment* in any given domain
is downstream of two things: the institutional choices of
the small number of model providers, and the timing of the
query. Neither of these is visible to most users.

## The lockstep risk

If a society routes its default truth-formation through a
small number of privately-governed, silently-versioned
models, the capacity for collective error-correction —
which has always depended on dissonance, patience, diverse
error, and the structural visibility of disagreement —
gets thinner. Not zero. *Thinner*. The early sign is not
obvious collapse. The early sign is that disagreement
starts to feel eccentric rather than ordinary, and that
more people say *the AI says* the way a previous generation
said *science says*, as if that were the end of the
conversation.

This is not a hypothetical concern. The empirical
sociology of how the *the AI says* phrase is currently
being used in classrooms, courtrooms, hospitals, and
boardrooms is documented. The phrase is increasingly
treated as terminating-of-debate in contexts where
*science says*, *the law says*, and *the experts say*
were already terminating-of-debate. The compression layer
is acquiring institutional standing in real time, in ways
that ordinary contract law and ordinary regulatory
practice have not caught up to.

The Searle distinction from Chapter 4 is the relevant
analytic frame. An institutional fact, in Searle's strict
sense, is one that exists because and only because we
collectively maintain the *X counts as Y in C* relation.
*The AI's output counts as a reliable answer in the
context of routine consultation* is becoming an
institutional fact in this strict sense, by the slow
accumulation of consultations that treat it as such. The
collective intentionality that sustains the institutional
fact is not being deliberately granted by anyone. It is
being slowly accreted as more and more queries get
routed through the layer.

The framework's concern is not that the model outputs are
*wrong* — sometimes they are wrong, sometimes they are
right, and the question of how often they are which is a
proper subject for empirical study. The framework's
concern is that the institutional standing the layer is
acquiring is happening *without anyone deliberately
deciding to grant it*, that the standing is being granted
to a small number of for-profit actors whose business
models are not aligned with the long-term epistemic
health of the population using their products, and that
the version of the layer's behavior that gets locked in
will be whichever happens to be the dominant version at
the moment the institutional accretion solidifies.

## What the truth-formation infrastructure used to look like

It is worth pausing to remember what the previous
arrangement actually was. The post-WWII Anglo-American
truth-formation infrastructure had a specific shape:
multiple competing newspapers of record (the New York Times,
the Washington Post, the Wall Street Journal, the
Christian Science Monitor, regional papers); broadcast
news networks with visibly different editorial postures
(CBS, NBC, ABC); academic journals with visible peer-review
processes and visible reputation hierarchies; reference
books (Britannica, World Book, the Oxford English
Dictionary) with visible authors and visible revisions;
trade publications with visible editorial policies; and
underneath all of it, a population large enough and
diverse enough to sustain *disagreement* as the default
state, with consensus emerging slowly from sustained
public argument.

The arrangement was not perfect. Many things wrong with
it have been adequately criticized over the past
half-century. What is worth recognizing now, when so much
of it has visibly fragmented, is that the arrangement had
*built into it* the conditions for collective error
correction. When the New York Times was wrong, the
Washington Post was the institution that could
authoritatively contradict it. When CBS was wrong, NBC
could contradict it. When the Encyclopedia Britannica was
wrong, a competing reference work could contradict it.
Disagreement was the default and the infrastructure of
disagreement was institutionally sustained.

The contemporary compression layer is a different shape.
There are only a few major model providers. They use
similar training data, similar RLHF approaches, similar
content policies (because they share employees, share
investors, share customers, and respond to similar
regulatory and reputational pressures). The diversity of
*possible default answers* across the major models is
much narrower than the diversity of possible default
answers across the previous arrangement was. And the
silent versioning means that even the diversity that
exists at any given moment does not produce a stable
record of disagreement that future queries can reference.

## What the framework is and is not claiming

The framework is *not* claiming that the compression layer
should be banned. That would be (per Chapter 5) a refusal
to decompose. The compression layer has real uses; many
of those uses are the productive applications the
*frontier* category captures. The framework is also not
claiming that the previous truth-formation infrastructure
was good in any uncomplicated sense. It had its own
serious failure modes, including the systematic
under-representation of perspectives outside the
mid-twentieth-century English-speaking professional class.

What the framework *is* claiming is that the new
infrastructure is being installed without explicit
deliberation about its consequences for collective error
correction, that the actors who benefit most from the
particular shape of the new infrastructure are not the
populations whose error-correction capacity is at stake,
and that the slow accretion of institutional standing
the layer is acquiring is happening at exactly the
gradient that does not trigger the sensors that would
otherwise produce public debate.

This is the §3 normalization-gradient mechanism applied
to truth-formation infrastructure, and it has the same
structural shape as every other case the book has
discussed. Slow change is invisible. Slow change is
opportunistically used. The slow change in this
particular case affects the substrate of every other
public conversation, including the ones about whether
the slow change should be happening at all.

## What the response could look like

The framework will not pretend that the response to this
is easy or settled. Some of what to do is in Chapter 11
(on the operational principles the framework is willing
to commit to). Some of what to do is in the documented
cases on the live LeResearch site — the SAG-AFTRA / WGA
contracts demonstrate that bargaining-table decomposition
of *which AI in what context with what consent* is
possible when the bargaining unit has sufficient capital
to do the work.

Some of what to do is at the user level, and is worth
naming here even though it is partial. *Multiple models
on the same query* is a discipline. *Visible comparison
of model outputs against the underlying primary sources*
is a discipline. *Maintaining the older infrastructure of
disagreement* — newspapers of record, reference works
with visible authors, peer-reviewed scholarship with
visible methodology — even when faster compressed
alternatives are available is a discipline. *Asking the
AI to show its sources and then actually checking the
sources* is a discipline.

None of these are scalable replacements for the structural
problem. All of them are partial workarounds that
preserve some of the older infrastructure of error
correction at the level of the individual user. The
structural problem requires structural responses, which
require institutional capital and political will that
do not currently exist in adequate amounts.

The next chapter takes the political pathology that
makes assembling that capital and that will so difficult.

[^ch9-1]: For documented model-drift studies and the broader
literature on silent versioning of production models,
see the live LeResearch investigation at `/ai/tracking`,
particularly the section on metrics and verification
pipelines.
