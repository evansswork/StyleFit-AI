---
name: stylefit-ai-integration
description: Implement StyleFit AI reference analysis, recommendations, visual matching, scan, or try-on integrations while preserving wardrobe identity, budget, corrections, and media lifecycle. Use for provider or model workflows, not for ordinary marketing UI.
---

# StyleFit AI integration

Read relevant features and rules in `PRD.md`, then `ARCHITECTURE.md`. Keep developer-agent permissions separate from product-provider credentials.

The current service budget is Rp0. Read `COSTS.md` before selecting a model or service. The selected baseline uses the project-owned deterministic rules engine, with AI_PROVIDER=none; no local or cloud model is required. Do not add inference dependencies, cloud fallback, or billing-dependent free tiers to core recommendations. A future image-analysis integration needs a separate documented evaluation. Run `node scripts/check-zero-budget.mjs` after integration/configuration changes. A passing config check is not proof that the model runs.

- Identify the concrete input, stored data, provider output, and user-visible result for the current feature. Validate untrusted output before storing or presenting it.
- Use existing item identities and server-authorized ownership. Provider output must not invent catalog items, known brands, reference episodes, or ownership.
- Enforce required constraints, locked items, and additional-spend calculations in deterministic application logic. Unknown prices remain unknown and cannot prove budget compliance.
- Keep visible observations, user-confirmed attributes, and unknown details distinct. New user corrections take precedence over results from older inputs.
- Map detected clothing to supported assets; label similar templates accurately. A generated image or avatar is not proof of physical size fit.
- Check code, weights, and preprocessing dependencies separately before shipping a model. FASHN VTON 1.5's Apache label does not resolve its human parser's inherited SegFormer restrictions; keep photo try-on unavailable until the entire pipeline is cleared and benchmarked.
- Track asynchronous success and failure. Bound retries, prevent duplicate inference work, and prevent deleted inputs from being recreated by late results.
- Keep private media and secrets out of public assets, logs, Git, and default test fixtures. State provider retention according to the endpoint actually used.

Test with fixtures before a separate live provider evaluation. Include a successful case and the failure or boundary that could corrupt the feature, such as unknown prices, stale corrections, duplicate requests, or deletion during processing. Record model/endpoint and actual evidence when live behavior is evaluated; do not claim fixture tests measure model accuracy.
