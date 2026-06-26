---
name: taste-quality-gate
description: Use after design-system and interaction decisions are established when a new visual design, redesign, first screen, onboarding, empty state, upgrade/subscription surface, brand surface, or explicit anti-generic visual-quality request needs a final visual review; never use it to replace project design facts or platform guidance.
---

# Taste Quality Gate

## Position

This is a small local adaptation inspired by `Leonxlnx/taste-skill`. It is not the full upstream collection and does not install or invoke its dozens of skills.

Use it only as the final visual-quality check after:

```text
Product intent
> .stitch/DESIGN.md or other approved design source
> existing components/resources/tokens
> design-system-patterns
> interaction-design
> taste-quality-gate
```

Higher layers always win.

## Do Not Use For

- platform specification decisions for Android, iOS, or Flutter;
- pure bug fixes or content-only edits;
- backend/data/permission/payment logic;
- dashboards or dense multi-step workflows where visual novelty would reduce clarity;
- inventing a new brand or design language without approval.

## Review Dimensions

### Product fit

- Does the visual direction reinforce the user goal and product tone?
- Is any flourish present only to look impressive?

### Hierarchy and focus

- Is the primary content/action obvious at first glance?
- Are secondary elements deliberately quieter?
- Does the screen avoid competing focal points?

### Layout rhythm and density

- Are spacing and grouping meaningful rather than uniformly distributed?
- Is the density appropriate for the task and device?
- Does the layout preserve breathing room without wasting functional space?

### Typography

- Are title, body, metadata, and action levels distinct using approved tokens?
- Are line length, line height, weight, and scaling readable?
- Are there unnecessary sizes or weights?

### Color and material

- Are approved semantic tokens used?
- Are accent, shadow, blur, glass, glow, or gradient treatments restrained and functional?
- Is contrast sufficient in all relevant states/themes?

### Motion and feedback

- Does motion explain a transition or confirm an action?
- Is it interruptible, performant, and reducible?
- Does the UI remain understandable without animation?

### Brand continuity and implementation cost

- Does the output look like this product, not a generic template or unrelated concept?
- Can it be built with current components/resources without disproportionate complexity?

## Output

```yaml
visual_goal: ""
verdict: PASS | ADJUST | BLOCKED
findings:
  - dimension: hierarchy | rhythm | typography | color | motion | brand | feasibility
    evidence: ""
    adjustment: ""
implementation_risks: []
conflicts_with_design_source: []
```

Never trade readability, accessibility, performance, or project consistency for “premium” appearance.
