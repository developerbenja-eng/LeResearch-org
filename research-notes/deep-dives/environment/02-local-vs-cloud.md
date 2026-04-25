# Local AI vs Cloud AI: The Granularity Problem

A research brief for LeResearch on why "AI energy" is a category error — and what the 2024–2026 numbers actually say. Compiled 2026-04-24.

## The framing problem

Public discourse treats "AI" as one thing with one energy footprint. It isn't. There's a 5-to-6-order-of-magnitude span in energy-per-task between a fine-tuned BERT classifier on a phone NPU and a frontier reasoning model on an H100 cluster. Once a model is trained, the marginal cost of running it locally is fundamentally a different question than the cost of querying a hyperscaler. Training is amortized across every download; cloud inference is paid per call, with PUE overhead, idle allocation, and network transit on top.

Hugging Face's Sasha Luccioni has been the loudest voice arguing that "general-purpose generative AI uses 20–30× more energy than task-specific AI" for equivalent jobs ([Power Hungry Processing, FAccT 2024](https://arxiv.org/abs/2311.16863)). That single finding — using a generative LLM to classify a movie review burns ~30× the energy of a fine-tuned classifier built for that exact task — is the empirical core of the "AI is many things" critique.

## 1. The model spectrum (April 2026)

| Tier | Examples | Where it runs | Realistic Wh/query |
|---|---|---|---|
| Frontier closed (reasoning) | GPT-5, Claude Opus 4, Gemini Ultra | Hyperscaler only | ~30× a non-reasoning prompt; HF found reasoning models use **~30× more energy on average** ([Singularity Hub, Dec 2025](https://singularityhub.com/2025/12/15/hugging-face-says-ai-models-with-reasoning-use-100x-more-energy-than-those-without/)) |
| Frontier closed (chat) | GPT-4o, Claude Sonnet, Gemini 2.5 | Hyperscaler | Google: **0.24 Wh median Gemini text prompt** ([Google Cloud, Aug 2025](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference/)) |
| Mid-tier closed | Haiku, Flash, GPT-4o-mini | Hyperscaler | ~0.05–0.1 Wh est. |
| Open frontier | DeepSeek V3 (671B/37B active), Llama 3.1 405B, Qwen 2.5 72B | Cloud or workstation | ~1–5 Wh; DeepSeek's MoE activates 37B of 671B per token, ~90% cost reduction vs dense ([DeepSeek-V3 Tech Report](https://arxiv.org/html/2412.19437v1)) |
| Mid open (70B class) | Llama 3.1 70B, Mistral Large | High-end Mac, dual GPU | HF AI Energy Score: **1.7 Wh average per query for Llama-3-70B** ([HF leaderboard](https://huggingface.co/spaces/AIEnergyScore/Leaderboard)) |
| Small open (7–9B) | Llama 3.1 8B, Mistral 7B, Gemma 9B | Any modern laptop | ~0.01–0.05 Wh local |
| Tiny / on-device | Apple Intelligence ~3B, Phi-3-mini, Llama 3.2 1B/3B, Gemma 2B | Phone NPU, edge | sub-mWh per short prompt |
| Specialized | Whisper (39M–1.5B), BGE/MiniLM embeddings (22–335M), YOLO, BERT (110–340M) | Anywhere, including watches | Microwatts to milliwatts |

The HF AI Energy Score project quantifies the full span: **the largest text-gen model tested consumes ~30,000× the energy of GPT-2 per query** ([AI Energy Score Leaderboard](https://huggingface.co/spaces/AIEnergyScore/Leaderboard)).

## 2. Local inference — the actual numbers

**Apple Silicon (llama.cpp / MLX):**
- M4 Max running Llama 3.1 70B Q4_K_M: ~18 tok/s, whole-system draw ~60–90W under load ([Apple Silicon discussion #4167](https://github.com/ggml-org/llama.cpp/discussions/4167); [Compute Market M4 review](https://www.compute-market.com/blog/mac-mini-m4-for-ai-apple-silicon-2026))
- M4 Max on Llama 3.1 8B: ~55 tok/s
- M2 Pro on Llama 3 8B Q4: ~27 tok/s
- M1 Max on Llama 3.1 8B via Core ML: ~33 tok/s ([Apple ML Research](https://machinelearning.apple.com/research/core-ml-on-device-llama))
- Mac Mini under full inference load: 30–40W total system

A representative 8B query: ~200 output tokens at 50 tok/s = 4 seconds at ~40W incremental = **~0.044 Wh per query**. That's ~5× *lower* than Google's 0.24 Wh median for cloud Gemini, even before you account for network transit and PUE overhead at the data center end.

A 70B query on the same Mac: ~200 tokens at 18 tok/s = 11 seconds at ~80W = **~0.24 Wh** — coincidentally matching Google's median Gemini prompt, but for a model you fully own and that runs offline.

**Apple Intelligence on iPhone 15 Pro:** Apple's ~3B model with 2-bit quantization-aware training hits 30 tok/s with 0.6ms time-to-first-token ([Apple ML Research](https://machinelearning.apple.com/research/introducing-apple-foundation-models)). The Neural Engine is power-budgeted to milliwatts during inference; per-query energy is in the sub-mWh range. The trade-off is task scope — small adapters specialize the base model rather than running multiple full models.

**Snapdragon X Elite NPU:** Microsoft's Phi Silica context processing draws **only 4.8 mWh of energy on the NPU**, with a 56% power reduction vs CPU for token iteration ([Microsoft Learn](https://learn.microsoft.com/en-us/windows/ai/npu-devices/)). The NPU delivers 45 TOPS within the laptop's existing ~25W envelope.

**Consumer GPU (RTX 4090):** Hits ~52 tok/s on Llama 3.1 70B Q4 GGUF, but draws **450W sustained** ([Ubaada review](https://www.ubaada.com/post/1b867b28); [TechReviewer](https://www.techreviewer.com/tech-specs/nvidia-rtx-4090-gpu-for-llms/)). Per-query: 200 tokens / 52 tok/s = 3.8s × 450W = ~0.475 Wh. Faster than the Mac, but ~2× the energy per query — the Mac wins on tokens-per-watt for inference.

**Whisper (specialized model):** Tiny (39M params) transcribes at 1.5–2× real-time on flagship phones in <500MB RAM. On Apple Silicon, Whisper Large v3 Turbo decoder energy per forward pass was reduced **75%** with recent optimizations ([WhisperKit paper](https://arxiv.org/html/2507.10860v1)). Real-time speech-to-text on a phone costs single-digit milliwatt-hours per minute of audio.

## 3. Comparison table: model × hardware × Wh/query × can-it-actually-do-it

| Model | Hardware | Tok/s | Power draw | Wh per ~200-token query | Can it do the task? |
|---|---|---|---|---|---|
| Llama 3.1 70B Q4 | M4 Max MacBook | 18 | 80W | ~0.24 | Yes — within ~10pp of GPT-4-class on most non-reasoning tasks |
| Llama 3.1 70B Q4 | RTX 4090 | 52 | 450W | ~0.48 | Same as above |
| Llama 3.1 8B Q4 | M2 / M4 Mac | 27–55 | 30–40W | ~0.04 | Strong for chat, summarization, simple coding; mediocre for reasoning |
| Llama 3.2 3B | iPhone-class NPU | 30 | <2W | ~0.004 | Good for instruction-following (IFEval 77.4), summarization, rewriting ([Llama 3.2 release](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/)) |
| Apple Intelligence ~3B | iPhone Neural Engine | 30 | <1W | <0.002 | Notification summaries, writing tools, basic Q&A; routes hard prompts to Private Cloud Compute |
| Phi Silica (~3.8B) | Snapdragon X Elite NPU | — | NPU-confined | 0.0048 Wh context processing | Local Copilot tasks ([Microsoft](https://learn.microsoft.com/en-us/windows/ai/npu-devices/)) |
| Whisper Tiny (39M) | Any phone | real-time | mW range | ~0.001 Wh per minute audio | Production-grade ASR for many languages |
| Fine-tuned BERT (110M) | Any laptop CPU | thousands/s | ~5W spike | ~0.0001 Wh | Classification, NER, embeddings — beats GPT-4 cost/perf 30× for these tasks ([Luccioni et al.](https://arxiv.org/abs/2311.16863)) |
| Gemini median (cloud) | TPU + DC overhead | — | — | **0.24 Wh** | Frontier-quality general-purpose ([Google Cloud](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference/)) |
| Reasoning model query | Cloud GPU | — | — | ~30× a normal prompt → ~5–10 Wh | Frontier reasoning, math, code ([HF v2 leaderboard](https://huggingface.co/blog/sasha/ai-energy-score-v2)) |

## 4. The efficiency frontier is moving fast

**Algorithmic efficiency:** Epoch AI: pre-training compute efficiency improves **~3× per year, doubling every ~7.6 months** with 95% CI of 5–14 months ([Epoch AI](https://epoch.ai/blog/algorithmic-progress-in-language-models/)). Inference token prices are falling 10–1000× per year at fixed quality.

**Quantization:** 4-bit quantization (GGUF, GPTQ, AWQ) is now standard for local; Apple's 2-bit quantization-aware training for the on-device 3B model preserves quality at half the memory of 4-bit. Whisper INT4/INT8 cuts 45% of model size with <1% WER degradation.

**MoE:** DeepSeek V3 — 671B total / 37B active per token — was trained for **2.788M H800 GPU hours / ~$5.6M**, less than 1/10 the time of Llama 3.1 405B ([DeepSeek Tech Report](https://arxiv.org/html/2412.19437v1)). Inference at $0.14/$0.28 per million tokens, 20–50× cheaper than equivalent OpenAI models ([Stratechery DeepSeek FAQ](https://stratechery.com/2025/deepseek-faq/)).

**Combined effect at the hyperscaler:** Google reports the **median Gemini prompt used 33× more energy in May 2024 than May 2025** ([MIT Tech Review](https://www.technologyreview.com/2025/08/21/1122288/google-gemini-ai-energy/)). That's one-year compounded gain from algorithmic + hardware + serving improvements.

## 5. The amortized-training argument

Once Llama 3.1 70B is trained, every download is free of marginal training cost. Open weights distribute that fixed cost across the entire global user base — there's no per-query training share to allocate. By contrast, every closed-model query implicitly amortizes the (still-undisclosed) training run.

Local inference also strips out:
- **PUE overhead**: Google 1.09, Microsoft 1.16, AWS 1.15 ([Google data centers](https://datacenters.google/efficiency/); [Uptime Institute 2024](https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2024.GlobalDataCenterSurvey.Report.pdf)). Industry average is 1.56. A laptop's "PUE" is effectively 1.0.
- **Network transit energy** — small per query but real at scale.
- **Idle infrastructure allocation** — Google's own breakdown attributes 10% of per-prompt energy to idle machines and 8% to data-center overhead, plus 25% for host CPU/memory. Only **58% is the TPU itself** ([Google Cloud blog](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference/)).

The honest counter-argument: device manufacturing carbon. A 16-inch MacBook Pro embodies ~300+ kg CO2e at manufacture; an M3 MacBook Air ~165 kg ([Apple PERs](https://www.apple.com/environment/pdf/products/notebooks/MacBook_Pro_16-inch_PER_Oct2024.pdf)). If the laptop exists anyway for other work, marginal AI use is essentially "free embodied carbon." If you bought a workstation specifically to run local LLMs, the math changes.

## 6. When does local actually beat cloud?

Honest answer: it depends on three things.

1. **FLOP efficiency.** Hyperscaler accelerators (H100, TPU v5p) deliver more useful FLOPs per joule than M-series silicon at the chip level. Cloud wins per-FLOP.
2. **Overhead stack.** Cloud loses ~40% of that advantage to PUE + idle + network + host CPU.
3. **Grid mix.** Virginia data center (coal/gas heavy) vs Quebec/PNW/France (hydro/nuclear). Gemini's 0.03 g CO2e/prompt is partly a clean-grid story, not just an efficiency story.

For 7–9B-class workloads on Apple Silicon, local inference is in the same energy ballpark as a Gemini median prompt and likely *lower* once you account for the model being fully resident locally with no transit. For 70B, cloud-served-via-MoE (e.g. DeepSeek V3) is probably more efficient than running a dense 70B on your Mac. For frontier reasoning, there is no local equivalent — you cannot run o1/Claude Opus locally regardless of your hardware.

## 7. What the framing misses (the honest critique)

- **Most AI usage is still cloud.** ChatGPT alone has 200M+ weekly active users; Gemini, Copilot, Meta AI add hundreds of millions more. The local-inference world is a small but growing slice.
- **Quality lag.** Local models trail frontier closed models by ~12–18 months on hard benchmarks. "Run it locally" works fine for chat/summarization/code-completion; it doesn't yet work for the tasks people are paying frontier prices for.
- **Jevons.** Microsoft's Nadella explicitly invoked Jevons Paradox after DeepSeek ([NPR Planet Money, Feb 2025](https://www.npr.org/sections/planet-money/2025/02/04/g-s1-46018/ai-deepseek-economics-jevons-paradox)). Cheaper inference → vastly more inference. Edge inference enables agentic loops, always-on assistants, and per-keystroke completions that were never economic before. Per-query energy goes down; total energy goes up. The 2025 ACM FAccT paper "From Efficiency Gains to Rebound Effects" ([arXiv:2501.16548](https://arxiv.org/abs/2501.16548)) argues this is the dominant dynamic.
- **Hardware access.** "Just run it locally" assumes a $2K+ Mac or a $1.5K GPU. The global installed base of NPU-equipped phones is the actual edge-AI substrate, and that's small/quantized models only.

## 8. Takeaway

The user's framing — "after the model exists, what's the issue?" — is sound for a specific and growing slice of AI: **small-to-mid open models running on hardware you already own**. For that slice, the honest energy comparison is:

- Cloud Gemini median prompt: 0.24 Wh ([Google](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference/))
- Local Llama 3.1 8B on M-series Mac: ~0.04 Wh — **~6× lower**
- Local 3B on phone NPU: ~0.002 Wh — **~100× lower**
- Specialized model (BERT-class) for the same task: another **~30× lower** ([Luccioni et al.](https://arxiv.org/abs/2311.16863))

The "AI uses massive energy" headline is almost entirely about (a) frontier-model training runs, (b) frontier-reasoning inference at hyperscale, and (c) the Jevons-driven explosion of total query volume. None of those map cleanly onto the laptop running a 4-bit Llama for a research workflow.

The cleanest framing is: **AI energy intensity per useful operation is collapsing fast (~3× per year algorithmically, plus quantization, plus MoE, plus better hardware), while total AI energy demand is exploding because cheap inference creates new demand.** Both can be true, and conflating them — treating "an AI query" as one thing — is the category error driving most of the public confusion.

---

## Sources

- [Power Hungry Processing — Luccioni et al., FAccT 2024](https://arxiv.org/abs/2311.16863)
- [AI Energy Score Leaderboard — Hugging Face](https://huggingface.co/spaces/AIEnergyScore/Leaderboard)
- [AI Energy Score v2 (with reasoning) — HF Blog](https://huggingface.co/blog/sasha/ai-energy-score-v2)
- [Singularity Hub: HF on reasoning models 30× energy](https://singularityhub.com/2025/12/15/hugging-face-says-ai-models-with-reasoning-use-100x-more-energy-than-those-without/)
- [Google Cloud: Measuring environmental impact of AI inference (0.24 Wh)](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference/)
- [MIT Tech Review: Google releases AI prompt energy data](https://www.technologyreview.com/2025/08/21/1122288/google-gemini-ai-energy/)
- [Epoch AI: Algorithmic progress in language models](https://epoch.ai/blog/algorithmic-progress-in-language-models/)
- [Epoch AI: Inference economics of language models](https://epoch.ai/blog/inference-economics-of-language-models)
- [DeepSeek-V3 Technical Report (arXiv)](https://arxiv.org/html/2412.19437v1)
- [Stratechery: DeepSeek FAQ](https://stratechery.com/2025/deepseek-faq/)
- [llama.cpp Apple Silicon performance discussion #4167](https://github.com/ggml-org/llama.cpp/discussions/4167)
- [Compute Market: Mac Mini M4 for AI 2026 review](https://www.compute-market.com/blog/mac-mini-m4-for-ai-apple-silicon-2026)
- [Apple ML Research: On-device Llama 3.1 with Core ML](https://machinelearning.apple.com/research/core-ml-on-device-llama)
- [Apple ML Research: Apple Foundation Models (3B on-device)](https://machinelearning.apple.com/research/introducing-apple-foundation-models)
- [Microsoft Learn: Develop AI for Copilot+ PCs (Phi Silica 4.8 mWh)](https://learn.microsoft.com/en-us/windows/ai/npu-devices/)
- [Tom's Hardware: Copilot+ PC local AI workload benchmarks](https://www.tomshardware.com/tech-industry/artificial-intelligence/benchmarked-how-copilot-pcs-handle-local-ai-workloads)
- [WhisperKit: On-device real-time ASR (arXiv 2507.10860)](https://arxiv.org/html/2507.10860v1)
- [Llama 3.2 release: edge AI and vision (Meta)](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/)
- [Ubaada: Llama 3.1 70B on RTX 4090 at 60 tok/s](https://www.ubaada.com/post/1b867b28)
- [Google Data Centers PUE](https://datacenters.google/efficiency/)
- [Uptime Institute Global Data Center Survey 2024](https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2024.GlobalDataCenterSurvey.Report.pdf)
- [Apple MacBook Pro 16-inch Product Environmental Report Oct 2024](https://www.apple.com/environment/pdf/products/notebooks/MacBook_Pro_16-inch_PER_Oct2024.pdf)
- [From Efficiency Gains to Rebound Effects — Jevons in AI (arXiv 2501.16548)](https://arxiv.org/abs/2501.16548)
- [NPR Planet Money: Why AI is obsessed with Jevons paradox](https://www.npr.org/sections/planet-money/2025/02/04/g-s1-46018/ai-deepseek-economics-jevons-paradox)
- [MIT Tech Review: We did the math on AI's energy footprint](https://www.technologyreview.com/2025/05/20/1116327/ai-energy-usage-climate-footprint-big-tech/)
