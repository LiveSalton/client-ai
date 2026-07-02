# Order Platform Architecture

## Purpose

This example shows the smallest architecture artifact set expected from the
Architecture plugin: an evidence-backed model, a C4 source file, a dense
relationship graph, a lightweight flow sketch, and a written summary.

## Scope

The example covers customer order placement, payment authorization, order
persistence, event publication, and fulfillment transfer.

## Reading Order

1. Read `architecture-model.json` for canonical nodes, edges, confidence, and
   source references.
2. Open `system-context.structurizr.dsl` for C4 context and container views.
3. Open `dependency-impact.dot` for dependency and change-impact inspection.
4. Open `business-flow.mmd` for a compact business-flow sketch.

## Known Gaps

- Warehouse fulfillment is shown as low confidence because this example does
  not include warehouse API contracts or runtime traces.
- Event semantics are medium confidence because the example does not include a
  schema registry or topic retention configuration.
- The files are examples only; real user projects require project-specific
  inspection and artifact generation.
