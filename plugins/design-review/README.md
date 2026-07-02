# Design Review

Design is a Qoder-native plugin for frontend design contracts and implementation quality. It packages skills for `DESIGN.md` review, full Design QA, UI-to-design alignment, screenshot comparison, accessibility, component-library alignment, design debt, and design-system capture.

Canvas support is intentionally narrow:

- `canvases/design-md/` previews local `DESIGN.md` files as design-system contract summaries with color swatches, contrast pairs, typography scale previews, spacing/radius bars, options, component tokens, and token-reference usage.

Design QA automation remains script-driven. It writes Markdown and JSON under `.design-qa/`, but this plugin does not provide a Canvas report viewer for those outputs.

## Skills

| Skill | Purpose |
| --- | --- |
| `design-qa` | Orchestrate design contract, visual, UI alignment, accessibility, component, and debt checks. |
| `ui-alignment-review` | Turn Figma/reference vs implementation evidence into designer/frontend fixes. |
| `visual-regression-review` | Capture and compare expected, actual, and diff screenshots. |
| `accessibility-review` | Run and interpret accessibility checks plus manual a11y review. |
| `component-library-alignment` | Check whether frontend code uses intended design-system components. |
| `design-debt-review` | Find hard-coded style values, arbitrary Tailwind, inline styles, and token drift. |
| `design-md-review` | Review or improve `DESIGN.md` as a design contract for humans and agents. |
| `design-system-capture` | Capture design-system rules from code, screenshots, Figma, tokens, and components. |

## Automation

Install dependencies inside this plugin when deterministic checks are needed:

```bash
cd /path/to/qoder-plugin/design
npm install
npx playwright install chromium
```

Install these dependencies in the same directory you will pass as `DESIGN_PLUGIN_ROOT`. Qoder's installed plugin cache contains the plugin files, but it does not include `node_modules`; if you run automation from the cache path, run the same install commands there once.

Run scripts against a target frontend project by setting `DESIGN_PLUGIN_ROOT` to this plugin directory and running from the target project root:

```bash
DESIGN_PLUGIN_ROOT=/path/to/qoder-plugin/design \
node /path/to/qoder-plugin/design/skills/design-qa/scripts/run-design-qa.mjs --config design.qa.yaml
```

Typical target-project files:

- `DESIGN.md`
- `SCREEN_SPEC.md`
- `design.qa.yaml`
- `.design-qa/expected/*.png`
- `.design-qa/actual/*.png`
- `.design-qa/diff/*.png`
