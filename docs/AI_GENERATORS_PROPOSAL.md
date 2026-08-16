# Proposal: Free & Low-Cost AI Generators for MarkeThing

**Status:** Implemented for Fase 1 (factory + Gemini/Groq/Together/OpenAI/mock)  
**Audience:** Product / engineering  
**Context:** MarkeThing Fase 1 wires `ContentGeneratorPort` and `ImageGeneratorPort` through `ai.factory.ts`. Prefer Gemini/Together for demo cost control; keep OpenAI as premium and mock for offline/CI.

This document proposes free and low-cost AI providers for **text/content** and **image** generation, mapped to the existing ports so adapters can be swapped without changing use cases.

---

## Goals

1. Keep demo / early users on **$0 or near-$0** spend where possible.
2. Preserve quality good enough for social posts, blogs, emails, and promo creatives.
3. Prefer providers with **OpenAI-compatible or simple HTTP APIs** so adapters stay thin.
4. Keep the port-based design: factory selects the implementation; use cases stay unchanged.

## Non-goals

- Replacing the mock generators used in offline tests.
- Multi-agent / Director de Marketing (Fase 2).
- Self-hosting GPU infra in production (optional local-only note below).

---

## Architecture fit

```text
GenerateContentUseCase  →  ContentGeneratorPort  →  [Gemini | Groq | OpenAI | Mock]
GenerateImageUseCase    →  ImageGeneratorPort    →  [GeminiImage | Together/FLUX | OpenAI | Mock]
```

Today (`ai.factory.ts`):

- Content → `GeminiContentGenerator` | `GroqContentGenerator` | `OpenAiContentGenerator` | `MockContentGenerator`
- Image → `GeminiImageGenerator` | `TogetherImageGenerator` | `OpenAiImageGenerator` | `MockImageGenerator`
- Selection via `AI_CONTENT_PROVIDER` / `AI_IMAGE_PROVIDER` (`auto` picks first available key)

Recommended env shape (additive, not a rewrite):

| Variable | Purpose |
|---|---|
| `AI_CONTENT_PROVIDER` | `gemini` \| `groq` \| `openai` \| `mock` |
| `AI_IMAGE_PROVIDER` | `gemini` \| `together` \| `openai` \| `mock` |
| `GEMINI_API_KEY` | Google AI Studio key |
| `GROQ_API_KEY` | Groq Cloud key |
| `TOGETHER_API_KEY` | Together AI key |
| `OPENAI_API_KEY` | Existing paid fallback |

---

## 1. Text / content generators

MarkeThing generates structured JSON (title, copy, CTA, hashtags, image prompt, SEO). Providers must support **reliable JSON / structured output** and Spanish + brand tone.

### Recommended stack

| Priority | Provider | Model (example) | Cost profile | Why |
|---|---|---|---|---|
| **Default (free)** | **Google Gemini** (AI Studio) | `gemini-2.0-flash` / Flash-Lite family | Ongoing free tier (rate-limited); paid when you enable billing | Best sustained free access; multimodal; large context for brand knowledge |
| **Speed / backup** | **Groq** | Llama 3.3 70B / Llama 4 Scout (check console) | Free tier with RPM/TPM caps; cheap paid | Very low latency; OpenAI-compatible chat API |
| **EU / cheap paid** | **Mistral** | Small / Ministral class | Experiment free tier; low per-token paid | Strong price/quality; EU hosting story |
| **Paid quality** | **OpenAI** (current) | `gpt-4o-mini` | Trial credits then pay-as-you-go | Already implemented; keep as premium path |
| **Local $0** | **Ollama** | Llama / Gemma / Qwen (7B–14B) | Hardware only | Dev machines / air-gapped demos; not production SLA |

### Provider notes (text)

**Gemini (preferred default)**  
- Free tier via Google AI Studio; no card required to start.  
- Rate limits (RPM / TPM / RPD) are **account- and model-specific** — always read them in AI Studio, do not hard-code quotas.  
- Free-tier prompts may be used to improve Google products; use paid/Vertex when privacy matters.  
- Fits MarkeThing knowledge uploads (long context) better than small open models.

**Groq**  
- Ideal when the UI feels “slow” under Gemini free-tier contention.  
- Use for short social copy; watch TPM on long brand+knowledge prompts.  
- OpenAI-compatible base URL → adapter reuse pattern similar to existing OpenAI client.

**Mistral**  
- Good secondary paid path if Gemini/Groq policy or region is an issue.  
- Experiment tier is for prototypes, not production volume.

**OpenAI**  
- Keep for customers who want GPT quality and are fine paying.  
- Do **not** use as the sole path for free demos — trial credits expire.

**Ollama**  
- Zero API cost for local `npm run dev`.  
- Quality and Spanish marketing copy vary by model size; treat as developer convenience only.

### Rough cost intuition (paid path)

For a typical Instagram post generation (~1–2k input tokens brand+knowledge, ~500 output tokens):

| Path | Order of magnitude |
|---|---|
| Gemini Flash free tier | $0 (until rate limits) |
| Gemini Flash paid | Fractions of a cent per post |
| Groq Llama paid | Fractions of a cent per post |
| OpenAI `gpt-4o-mini` | Low cents at volume; still cheap vs Pro models |

Exact prices change; verify on each provider’s pricing page before locking SLAs.

---

## 2. Image generators

There is **no high-quality, unlimited, free-forever** production image API. “Free” means trial credits, rate-limited community endpoints, or paid-but-cheap models (~$0.01–$0.05 / image).

DALL·E 3 (current default) is relatively expensive and overkill for feed creatives at MVP volume.

### Recommended stack

| Priority | Provider | Model (example) | Cost profile | Why |
|---|---|---|---|---|
| **Default (free/cheap)** | **Gemini image** (Imagen / Flash Image family via Gemini API) | Check AI Studio model list | Free tier eligibility varies by model; paid is often ~$0.02–$0.04 / image | Same key as text; fewer vendors |
| **Best $/quality** | **Together AI** | `black-forest-labs/FLUX.1-schnell` | Trial credits; Schnell ~low cents / image | Fast FLUX; simple images API |
| **Alt marketplace** | **fal.ai** or **Replicate** | FLUX Schnell / SDXL | Trial credits; pay-per-run | Huge model catalog; easy swap |
| **True $0 (non-prod)** | **Pollinations** (or similar community) | Hosted SD/FLUX variants | Free, best-effort | Demos only — reliability/SLA not production-grade |
| **Paid premium** | **OpenAI** (current) | `dall-e-3` / GPT Image | Higher per image | Keep as optional quality tier |
| **Local $0** | **ComfyUI / Automatic1111 / Fal local** | SDXL / FLUX Dev | GPU time | Offline brand kits; ops-heavy |

### Provider notes (image)

**Gemini image**  
- Prefer consolidating text + image under one Google key for MVP ops.  
- Confirm the exact model ID and free-tier row in AI Studio before shipping; image models are not always free even when text Flash is.

**Together FLUX.1 Schnell**  
- Best first paid image path: fast, marketing-usable, OpenAI-like images endpoint.  
- Upgrade to FLUX Dev/Pro only when typography/brand fidelity requires it.

**fal.ai / Replicate**  
- Use if you want model shopping without rewriting storage/download logic.  
- Price by second or by megapixel — normalize to 1024×1024 in budgets.

**Pollinations / community free**  
- Acceptable for “Generate preview” buttons in demos.  
- Not for customer-facing production calendars.

**DALL·E 3**  
- Demote from default to `AI_IMAGE_PROVIDER=openai` premium option.

### Rough cost intuition (paid path, ~1024²)

| Path | Order of magnitude |
|---|---|
| FLUX.1 Schnell (Together / fal) | ~$0.01–$0.03 / image |
| Gemini Flash Image class | ~$0.02–$0.04 / image (verify current) |
| DALL·E 3 | Higher; avoid as default at scale |

---

## 3. Proposed default matrix for MarkeThing

| Environment | Content | Image |
|---|---|---|
| Local / CI | `mock` (tests) or Ollama (manual) | `mock` |
| Demo / early beta | **Gemini** | **Gemini image** if free-eligible, else **Together FLUX Schnell** |
| Paid self-serve | Gemini or Groq | Together FLUX Schnell |
| Enterprise / premium SKU | OpenAI or Claude (future) | DALL·E / GPT Image / FLUX Pro |

### Suggested product packaging

1. **Free plan:** Gemini text + capped image generations/month (enforce app-level quotas before provider limits).  
2. **Starter:** Gemini/Groq text + Together Schnell images with higher caps.  
3. **Pro:** Choice of OpenAI text + higher-fidelity image model.

App-level quotas matter: free provider tiers protect *you* from surprise bills only if the product also caps *users*.

---

## 4. Implementation plan (incremental)

Do not replace OpenAI in one shot. Add adapters behind the existing ports.

### Step A — Config & factory

1. Extend env with `AI_CONTENT_PROVIDER` / `AI_IMAGE_PROVIDER` and new API keys.  
2. Update `createContentGenerator()` / `createImageGenerator()` to switch on provider.  
3. Keep mock when keys are missing (current behavior).

### Step B — Text adapters

1. `GeminiContentGenerator` — JSON schema / responseMimeType where supported.  
2. `GroqContentGenerator` — OpenAI-compatible client, different base URL + model.  
3. Reuse prompt building from `OpenAiContentGenerator` (extract shared prompt builder to avoid duplication).

### Step C — Image adapters

1. `GeminiImageGenerator` or `TogetherImageGenerator` implementing `ImageGeneratorPort`.  
2. Download/store via existing `StoragePort` (local/S3).  
3. Keep SVG mock for tests.

### Step D — Resilience

1. Optional fallback chain: primary → secondary → mock/error.  
2. Handle HTTP 429 with backoff; surface “quota exceeded” in the API.  
3. Never hard-code free-tier RPM numbers; treat them as operational config.

### Step E — Cost observability

1. Log `provider`, `model`, `contentType`, latency (no prompt secrets in prod logs).  
2. Track generations per company/user for plan enforcement.

---

## 5. Decision summary

| Decision | Choice |
|---|---|
| Default text for MVP | **Google Gemini Flash** (free tier → paid when needed) |
| Secondary text | **Groq** (speed) + keep **OpenAI** as premium |
| Default image for MVP | **Gemini image** if free/cheap on current models; else **Together FLUX.1 Schnell** |
| Demote | **DALL·E 3** from default to optional premium |
| Local zero-cost | **Mock** (CI) + **Ollama** (optional dev) |
| Integration style | New adapters on existing ports; factory-selected via env |

---

## 6. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Free-tier rate limits during demos | App quotas + Groq fallback + clear UX |
| Free-tier data use (Gemini) | Document in privacy policy; paid tier for paying customers |
| Image quality / brand typography | Start Schnell; upgrade model ID only, not architecture |
| Provider pricing changes | Abstract behind ports; never couple use cases to SDKs |
| Spanish marketing quality | Eval set of 20 brand fixtures; gate provider switch on pass rate |

---

## 7. Next actions

1. Approve this provider matrix (or adjust priorities).  
2. Implement Gemini content adapter + factory switch (smallest valuable change).  
3. Add Together (or Gemini) image adapter; flip default away from DALL·E 3.  
4. Add generation quotas per plan in application layer.  
5. Revisit for Fase 2 multi-agent workloads (batch + cheaper models for planning steps).

---

## References

- [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) — check live limits in AI Studio  
- [Groq Cloud](https://console.groq.com) — free tier + OpenAI-compatible API  
- [Together image generation](https://docs.together.ai/docs/inference/images/overview) — FLUX models  
- MarkeThing ports: `ContentGeneratorPort`, `ImageGeneratorPort` (Fase 1 PR)  
- Current factory: OpenAI-only with mock fallback
