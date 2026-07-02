# Structurizr DSL Artifact Guidance

This reference defines how Architecture should write and summarize evidence-backed Structurizr DSL artifacts.

## Source shape

```text
<name>.structurizr.dsl
<name>.architecture-understanding.md
<name>.evidence.md
```

The plugin treats Structurizr DSL as a maintainable architecture source. Qoder
Canvas format viewers can preview the DSL file, but the plugin does not provide
a product-level DSL-to-Canvas conversion pipeline.

## When to use

Prefer Structurizr DSL for C4-compatible architecture views:

- system landscape
- system context
- container views
- component views when the source model has parent container evidence
- architecture review views that need stable C4 topology
- system-modeler outputs that should become living architecture assets

Keep Mermaid, PlantUML, Graphviz DOT, Markdown, and slide outputs for non-C4 views, sequence-heavy service calls, dense dependency graphs, ADR timelines, risk heatmaps, and fast documentation sketches.

## Summary

When producing a DSL artifact:

1. Write the `.structurizr.dsl` file to disk.
2. Write a Markdown explanation with audience, scope, assumptions, evidence,
   and reading order.
3. Reference both paths in the response.
4. Tell the user to open the DSL file with Qoder's Structurizr DSL viewer when
   they need visual inspection.

## Trust rules

- Preserve low-confidence and unknown nodes as tags and descriptions; do not present them as confirmed current-state architecture.
- Keep `.structurizr.dsl` as the source of truth.
- Treat rendered previews or exports as derived artifacts unless a user explicitly promotes them to maintained architecture assets.
- If the preview cannot render a view, keep the DSL and Markdown explanation as the authoritative source and fix the DSL source rather than hand-editing a rendered artifact.
