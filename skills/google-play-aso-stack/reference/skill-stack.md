# ASO Skill Stack

## Contents

- Default installation set
- When to install each set
- External integrations
- Recommended prompts
- Avoided duplicates

## Default installation set

Recommend this minimal stack first. Do not execute commands without user confirmation.

### Core ASO stack

```bash
npx skills add eronred/aso-skills --skill aso-router app-marketing-context android-aso aso-audit keyword-research metadata-optimization competitor-analysis screenshot-optimization app-icon-optimization localization ab-test-store-listing rating-prompt-strategy app-analytics competitor-tracking
```

Use for Google Play ASO audits, Android-specific listing work, keyword research, metadata generation, competitor analysis, screenshot/icon planning, localization, Play experiments, review prompt strategy, analytics, and competitor tracking.

### Marketing support stack

```bash
npx skills add coreyhaines31/marketingskills --skill product-marketing aso copywriting copy-editing ad-creative analytics ab-testing competitors social
```

Use for product positioning, copywriting, copy editing, ad creative, analytics design, experiment design, competitor framing, and launch/social distribution.

### Optional strategy skill

```bash
npx skills add petrogurcak/skills --skill aso-optimization
```

Use for high-level ASO strategy, 30-day plans, visibility/conversion frameworks, and executive summaries. Skip it when the user only wants tactical metadata or screenshot copy.

## When to install each set

- User wants a full ASO operating system → recommend Core ASO + Marketing support.
- User only wants listing audit or metadata → recommend Core ASO only.
- User wants a founder-level growth plan → add Optional strategy skill.
- User is worried about clutter → install `aso-router`, `android-aso`, `aso-audit`, `keyword-research`, `metadata-optimization`, `screenshot-optimization`, `ab-test-store-listing`, `product-marketing`, `copywriting`, and `analytics` only.

## External integrations

Some ASO skills can use live app intelligence or MCP/API integrations. Before any setup, ask the user to confirm:

- Which service to connect.
- Whether they already have an account or paid plan.
- Where credentials will be stored locally.
- Exactly which config files will change.

Do not configure Appeeky, Play Console, App Store Connect, Google Ads, Firebase, or analytics services without confirmation.

## Recommended prompts

```text
Use google-play-aso-stack to audit this Google Play app: <URL>.
Target markets: US, JP, TW.
Goal: improve organic installs and retained first-time installers.
```

```text
Use google-play-aso-stack to create 5 title options, 10 short descriptions, and a Store Listing Experiment queue for this app: <URL>.
```

```text
Use google-play-aso-stack to design the first 8 screenshots for a utility app. Prioritize screenshot 1-3 for conversion.
```

## Avoided duplicates

Avoid installing multiple generic all-in-one ASO skills unless the user wants comparison. Duplicates increase noise and can produce conflicting workflows. Prefer one router-style ASO stack plus one marketing support stack.
