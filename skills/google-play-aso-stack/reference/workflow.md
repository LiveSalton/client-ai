# Google Play ASO Workflow

## Contents

- Phase 0: Scope and context
- Phase 1: Baseline audit
- Phase 2: Keywords and competitors
- Phase 3: Metadata generation
- Phase 4: Creative conversion plan
- Phase 5: Store Listing Experiments
- Phase 6: Localization and custom listings
- Phase 7: Ratings, reviews, and trust
- Phase 8: Measurement
- Phase 9: 30-day sprint

## Phase 0: Scope and context

- Confirm app URL/package, target countries, goal, and safety gates.
- Check whether specialist skills are installed. If missing, recommend commands from `reference/skill-stack.md`.
- Create or update shared context files when the user allows file edits:
  - `.agents/product-marketing.md`
  - `.agents/app-marketing-context.md`
- Context should include product promise, ICP, jobs-to-be-done, pain points, features, proof, trust claims, monetization, competitors, target markets, prohibited claims, and success metrics.

## Phase 1: Baseline audit

Use `android-aso` and `aso-audit` when available.

Score these areas from 0-10: app name, short description, full description, keyword coverage, icon, screenshots, feature graphic/video, ratings/reviews, Data safety/trust, measurement readiness.

Priority labels:

- P0: likely blocks conversion, compliance, trust, or measurement.
- P1: high-impact change testable within 1-2 weeks.
- P2: useful improvement after P0/P1.

## Phase 2: Keywords and competitors

Use `keyword-research` and `competitor-analysis` when available.

Rules:

- Prioritize relevance before volume.
- Separate category, feature, problem, trust, and competitor terms.
- For small/new apps, prefer plausible long-tail terms.
- Do not produce raw keyword blocks for Google Play descriptions.
- Mark search volume, ranking, and conversion assumptions when no live ASO data is available.

## Phase 3: Metadata generation

Use `metadata-optimization`, `android-aso`, `copywriting`, and `copy-editing` when available.

Deliver:

- 5 app name options with character count and primary keyword.
- 10 short description options with character count and angle.
- 2 full description versions: compliance-safe and growth-oriented.
- Keyword placement rationale.
- Compliance risk notes.

Preferred full description structure:

1. Opening: pain + outcome in 1-3 short sentences.
2. Core benefits: 3-5 user-outcome bullets.
3. Feature proof: what the app actually does.
4. Trust/privacy: permissions, local/cloud behavior, no-root/data handling if true.
5. Use cases: who should use it and when.
6. Closing: calm action statement.

## Phase 4: Creative conversion plan

Use `screenshot-optimization`, `app-icon-optimization`, and `ad-creative` when available.

Rules:

- First 3 screenshots must communicate the main value quickly.
- Each screenshot has one message.
- Use real UI or accurate UI mockups.
- Lead with concrete tasks solved, not abstract branding.
- Do not overclaim or use fake proof.

Default screenshot story for a utility app:

1. Main outcome.
2. Key differentiator.
3. Trust/privacy or speed to value.
4. Secondary feature.
5. Advanced feature.
6. Safety/control.
7. Monetization or premium value if relevant.
8. Support/update/trust or localization-specific use case.

## Phase 5: Store Listing Experiments

Use `ab-test-store-listing` and `ab-testing` when available.

Rules:

- Test one major variable at a time when possible.
- Start with highly visible assets: screenshot 1, icon, short description, then title/description variants.
- Prefer retained first-time installers when available, not installs alone.
- Consider seasonality, campaign spikes, country mix, and traffic source mix.
- Record hypothesis, result, confidence, decision, and next test.

## Phase 6: Localization and custom listings

Use `localization` after the default listing is coherent.

Prioritize markets by existing traffic/revenue, keyword opportunity, competitor weakness, monetization potential, and support burden.

Use custom store listings when a country, keyword theme, user segment, or paid campaign needs a distinct promise, screenshots, or measurement URL.

## Phase 7: Ratings, reviews, and trust

Use `rating-prompt-strategy` when available.

- Prompt after a successful core action.
- Suppress prompts after errors, crashes, permission denial, refunds, cancel flows, or repeated friction.
- Group review responses by bugs, permissions/privacy, pricing, missing features, compatibility, and support.
- Never suggest buying reviews, incentivized reviews, fake installs, fake ratings, or review manipulation.

## Phase 8: Measurement

Use `app-analytics` and `analytics` when available.

Minimum funnel: store visitor → install → first open → core action completed → permission result → D1 retention → purchase/trial if relevant → rating prompt shown/submitted.

Use Play Console acquisition metrics when available. If private metrics are unavailable, mark assumptions clearly and do not invent numbers.

## Phase 9: 30-day sprint

- Days 1-2: collect listing, metrics, reviews, competitors, screenshots.
- Days 3-4: audit and keyword map.
- Days 5-7: metadata rewrite and screenshot brief.
- Week 2: ship safe changes or start first Store Listing Experiment.
- Week 3: analyze early signals and plan localization/custom listings.
- Week 4: run second experiment, implement rating prompt strategy, and begin weekly competitor tracking.
