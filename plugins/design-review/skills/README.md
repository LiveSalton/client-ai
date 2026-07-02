# Skills Index

This package contains 8 `SKILL.md` files for frontend design contracts and implementation quality.

Route by the user's design job first, then choose automation only when the target project has enough evidence such as `DESIGN.md`, `design.qa.yaml`, screenshots, routes, or component sources.

## Tier 1 — Orchestrator

| Skill | When to use |
| --- | --- |
| [`design-qa`](design-qa/SKILL.md) | Full Design QA across design contract, visual evidence, UI alignment, accessibility, components, and design debt. |

## Tier 2 — Scenario Skills

| Skill | Question answered |
| --- | --- |
| [`ui-alignment-review`](ui-alignment-review/SKILL.md) | Does this implementation align with the approved design reference? |
| [`visual-regression-review`](visual-regression-review/SKILL.md) | What changed between expected and actual UI screenshots? |
| [`accessibility-review`](accessibility-review/SKILL.md) | Can keyboard, screen-reader, low-vision, reduced-motion, and touch users complete the path? |
| [`component-library-alignment`](component-library-alignment/SKILL.md) | Does the implementation use the intended design-system components and variants? |
| [`design-debt-review`](design-debt-review/SKILL.md) | Where are hard-coded visual values, one-off variants, duplicated patterns, or token drift likely to spread? |
| [`design-md-review`](design-md-review/SKILL.md) | Is `DESIGN.md` complete, machine-readable, and implementation-ready? |
| [`design-system-capture`](design-system-capture/SKILL.md) | What design-system rules can be captured from code, screenshots, Figma, tokens, and components? |

## Shared Automation

Scripts live under each skill's `scripts/` directory and use shared helpers from `../shared/lib/`.

Install Node dependencies and Playwright browsers in the same plugin directory you will use as `DESIGN_PLUGIN_ROOT`. Qoder's installed plugin cache does not include `node_modules`, so cache-based automation needs a one-time `npm install` and `npx playwright install chromium` in that cache directory.

Set `DESIGN_PLUGIN_ROOT` to this plugin directory when running scripts from a target frontend project:

```bash
DESIGN_PLUGIN_ROOT=/path/to/qoder-plugin/design \
node /path/to/qoder-plugin/design/skills/design-qa/scripts/run-design-qa.mjs --config design.qa.yaml
```
