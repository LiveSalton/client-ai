---
version: alpha
name: Project-design-analysis
description: A concise design-system summary covering product feel, source coverage, key tokens, component families, implementation rules, and known gaps.

colors:
  primary: "#2563eb"
  primary-active: "#1d4ed8"
  primary-disabled: "#93c5fd"
  on-primary: "#ffffff"
  ink: "#111827"
  body: "#374151"
  muted: "#6b7280"
  canvas: "#ffffff"
  surface-soft: "#f9fafb"
  surface-card: "#ffffff"
  hairline: "#e5e7eb"
  hairline-strong: "#d1d5db"
  danger: "#dc2626"
  success: "#16a34a"
  warning: "#d97706"

typography:
  display-lg:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.10
    letterSpacing: -0.02em
  heading-md:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: 0px
  body-md:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0px
  body-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0px
  caption:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0px
  button-md:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0px

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: 40px
  button-primary-hover:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: 40px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    height: 40px
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  text-input-error:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  card-default:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  badge-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  badge-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
---

# DESIGN.md

## Overview

Describe the product personality, design principles, audience, platform constraints, and the kind of UI the system should produce. Tie the description back to frontmatter tokens such as `{colors.primary}`, `{typography.body-md}`, `{rounded.md}`, and `{spacing.section}`.

## Colors

Explain the semantic role of each palette family. State which colors drive primary actions, body text, muted metadata, surfaces, borders, and semantic statuses.

Do not introduce one-off hex values in application code unless the value is added to the token system first.

## Typography

Use the frontmatter typography scale. Explain which levels are used for display headings, section headings, body copy, captions, buttons, and code or data surfaces when present.

## Layout

Use the spacing scale for gutters, sections, cards, and form groups. Avoid arbitrary spacing values when an existing token is close enough.

## Elevation & Depth

Document shadows, borders, overlays, sticky surfaces, and z-index expectations. If the product does not use shadow, say that surfaces are separated by borders and spacing instead.

## Shapes

Use the `rounded` scale consistently. Explain which components use `rounded.md`, `rounded.lg`, and `rounded.full`.

## Components

Map implementation components to frontmatter component tokens. Model variants and states as related token names, for example `button-primary`, `button-primary-hover`, `button-primary-disabled`, `text-input`, and `text-input-focused`.

Required states for interactive components:

- default
- hover
- focus-visible
- active
- disabled
- loading
- empty
- error, when relevant

## Do's and Don'ts

Do:

- Use semantic design tokens.
- Reuse existing component variants.
- Keep keyboard focus visible.
- Test mobile, tablet, and desktop layouts.

Don't:

- Hard-code colors, spacing, radius, typography, or shadows in feature code.
- Create a new component variant without documenting it.
- Hide focus states.
- Approve a visual diff without checking dynamic content masks.

## Responsive Behavior

Document breakpoints, layout collapse rules, minimum touch targets, content wrapping, and mobile density changes.

## Known Gaps

List unresolved design decisions as `needs-design-decision` items. Do not invent missing policy silently.
