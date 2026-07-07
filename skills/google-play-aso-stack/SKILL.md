---
name: google-play-aso-stack
description: Coordinates a Google Play ASO skill stack and execution workflow for app listing audits, keyword research, metadata, screenshots, icons, Store Listing Experiments, localization, ratings, and measurement. Triggered when the user asks to choose or install ASO skills, optimize a Google Play or Play Store listing, improve app discovery or conversion, audit metadata or creative assets, or plan ASO growth.
---

# Google Play ASO Stack

## Purpose

Use this as the top-level ASO playbook for Google Play apps. It selects the right specialist skills, keeps the work compliant, and turns ASO into a repeatable loop: positioning → keywords → metadata → creative assets → experiments → localization → ratings → measurement.

Use the user's language for responses. Keep recommendations practical and copy-paste ready.

## Safety gates

Ask for explicit confirmation before any of these actions:

- Running install commands, changing project/global skill directories, or adding third-party packages.
- Using credentials, API keys, MCP servers, Play Console, App Store Connect, Google Ads, or paid ASO tools.
- Publishing, submitting, launching experiments, changing pricing, changing Data safety/privacy declarations, uploading assets, deleting files, or overwriting user work.

Never ask the user to paste secrets into chat. Recommend local environment variables, secret managers, or the service's normal secure setup flow.

## Quick start

1. If the user asks what to install, read `reference/skill-stack.md` and return the minimal recommended commands.
2. If the user asks to run ASO, read `reference/workflow.md` and follow the checklist.
3. If producing Google Play metadata or creative guidance, read `reference/play-store-rules.md`.
4. For report structures, read `reference/templates.md`.
5. Before finalizing title/description variants, run `scripts/validate_metadata.py` on a metadata JSON file.

Example invocation:

```text
/google-play-aso-stack Optimize my Google Play app: <Play URL or package name>.
Goal: increase organic installs and retained first-time installers.
Target markets: US, JP, TW.
```

## Required inputs

Proceed with available information. Do not block unless the task is impossible.

Minimum useful input: Play Store URL or package name. Helpful additions: target countries, app category, screenshots, icon, current metadata, competitors, review themes, Play Console acquisition metrics, retention metrics, monetization, privacy/permission constraints, and prohibited claims.

If only a public Play URL is available, audit the public listing and mark missing private metrics as unknown. Ask for private metrics only when they materially change the recommendation.

## Default workflow

Copy and update this checklist during complex ASO tasks:

```text
ASO Progress:
- [ ] Confirm scope, safety gates, and available inputs
- [ ] Check installed/recommended skills
- [ ] Build app marketing context
- [ ] Audit current listing
- [ ] Map keywords and competitors
- [ ] Generate metadata variants
- [ ] Plan screenshots, icon, feature graphic, and video
- [ ] Create Store Listing Experiment queue
- [ ] Plan localization and custom store listings
- [ ] Define ratings/reviews and trust strategy
- [ ] Define measurement and 30-day sprint
- [ ] Validate metadata and summarize next actions
```

Use `reference/workflow.md` for detailed phase instructions.

## Specialist skill routing

- Installation or skill choice → `reference/skill-stack.md`
- App positioning and shared context → `product-marketing`, `app-marketing-context`
- Google Play audit → `android-aso`, `aso-audit`
- Keywords and competitors → `keyword-research`, `competitor-analysis`, `competitors`
- Metadata copy → `metadata-optimization`, `copywriting`, `copy-editing`
- Visual assets → `screenshot-optimization`, `app-icon-optimization`, `ad-creative`
- Tests → `ab-test-store-listing`, `ab-testing`
- Localization → `localization`
- Reviews and trust → `rating-prompt-strategy`
- Measurement → `app-analytics`, `analytics`, `competitor-tracking`

If a specialist skill is not installed, continue with this skill's workflow and recommend installation separately.

## Validation script

For deterministic metadata checks, write proposed variants to JSON and run:

```bash
python scripts/validate_metadata.py metadata.json
```

The script uses only the Python standard library. It checks field lengths, obvious risky claims, excessive punctuation, raw keyword repetition, and missing required fields. Treat the output as a heuristic pre-check, not legal or Play Console approval.

See `examples/metadata.example.json` for the expected input shape.

## Final response format

Default output:

1. Installed / recommended skills
2. Current ASO diagnosis
3. Priority fixes
4. Keyword map
5. Metadata variants
6. Screenshot / icon plan
7. Experiment queue
8. Localization / custom listings
9. Measurement plan
10. Next 7 days

For small requests, answer only the relevant sections. Always state assumptions, missing data, and whether private Play Console metrics were unavailable.
