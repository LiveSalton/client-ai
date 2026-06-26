---
name: design-system-patterns
description: Use when a UI task creates or changes design tokens, themes, reusable components, component variants, resource naming, or design-to-code system foundations; do not use for a narrow visual change that only reuses an existing component unchanged.
---

# Design System Patterns

## Goal

Map approved design facts into a consistent, maintainable component and token system without inventing a second design language.

Adapted from `wshobson/agents` for repository-driven client application work.

## Preconditions

Before using this skill:

1. Read the authoritative design source, especially `.stitch/DESIGN.md` when present.
2. Inspect current theme/token files, reusable components, resources, and naming conventions.
3. Read Product acceptance criteria.
4. Treat existing project facts as authoritative over examples in this skill.

If design facts conflict or a new system decision is required without authority, return the gap instead of guessing.

## Method

### 1. Inventory before adding

List existing tokens, components, variants, and assets that can satisfy the task. Prefer reuse, extension, or deprecation over parallel duplicates.

### 2. Preserve token hierarchy

Use the project’s naming convention while maintaining this conceptual hierarchy when applicable:

```text
primitive values -> semantic intent -> component usage
```

Examples of intent, not mandatory names:

- primitive: raw color, spacing, radius, typography value;
- semantic: surface, text, border, feedback, emphasis;
- component: button background, card border, input error state.

Do not hardcode raw values when the repository already exposes an appropriate token.

### 3. Define component contracts

For every created or changed component, specify:

- purpose and reuse boundary;
- content slots/properties;
- size and visual variants;
- default, pressed/focused, disabled, selected, loading, error, and success states as relevant;
- theme behavior;
- accessibility and content-scaling constraints;
- migration impact on existing callers.

### 4. Map design to code

Produce a mapping from design element to an existing or approved new component, token, resource, and interaction rule. Identify any design element that cannot be represented by the current system.

### 5. Control system growth

Reject:

- near-duplicate tokens;
- component variants used once without a clear system reason;
- mixed naming conventions;
- platform-specific values hidden inside shared semantic tokens;
- unversioned breaking token/component changes.

## Output

```yaml
sources_read: []
components_reused: []
components_changed_or_added: []
token_mapping: []
state_coverage: []
resource_naming: []
migrations: []
risks: []
blockers: []
```

The output is an implementation constraint for Designer/Coder. It is not permission to alter product scope.
