# Diagram Output Formats

Choose diagram formats by audience, maintenance needs, and graph complexity.

## Recommended defaults

| Need | Preferred format | Notes |
| --- | --- | --- |
| C4 architecture modeling | Structurizr DSL or C4-PlantUML | Best when diagrams should live with architecture model semantics. |
| Qoder C4 architecture preview | Structurizr DSL | Best when C4 views should be inspected with the plugin's DSL format viewer. |
| Qoder dense graph preview | Graphviz DOT | Best when dense dependency/flow/risk graphs should be inspected with the plugin's DOT format viewer. |
| Large dependency graphs | Graphviz DOT | Good layout behavior for dense directed graphs. |
| Business flow, lifecycle, impact, integration, risk, or legacy relationship maps | Graphviz DOT | Preferred default for plugin evaluation and Qoder Graphviz Canvas compatibility. |
| Markdown-native docs | Mermaid | Good for lightweight embedded sketches, simple state diagrams, or sequence-adjacent docs when Graphviz/Structurizr would be overkill. |
| Whiteboard collaboration | Excalidraw | Good for workshops and stakeholder communication; not ideal as canonical source. |
| Editable stakeholder delivery | Draw.io / diagrams.net | Good when recipients need manual editing; treat as a derived artifact, not the canonical source. |
| Design delivery / publishing | SVG or PNG export | Treat as derived artifact, not the canonical source. |
| Slide decks | SVG + concise Markdown notes | Keep diagram source separately so slides do not become the source of truth. |

## Format selection rules

- Use **C4 model / Structurizr DSL or JS** for system landscape, system context, container, and component views.
- Use **Graphviz DOT** for business flows, lifecycles, integration maps, dependency graphs, large relationship graphs, data lineage, risk networks, legacy maps, and change impact maps.
- Use **Mermaid** for fast readable docs and simple diagrams only when Markdown-native embedding is more important than Canvas/Graphviz/Structurizr compatibility.
- Use **PlantUML sequence diagrams** for detailed service call flows.
- Use **Graphviz DOT** when graph size or dependency density makes Mermaid unreadable.
- Use **Structurizr DSL** when the system needs living architecture, C4 relationships, views, and model reuse.
- Use **Structurizr DSL** when C4 views should open in Qoder Canvas through the DSL format viewer. See `structurizr-canvas-pipeline.md`.
- Use **Graphviz DOT** when dense graphs should open in Qoder Canvas through the DOT format viewer. Default dense or Canvas-first DOT to `rankdir=TB` so the preview is vertical rather than a long horizontal strip; short linear lineage or traffic-path diagrams may use `rankdir=LR` when width is controlled.
- Use **Mermaid** when a small evidence-backed sketch needs Markdown-native flowchart source.
- Use **Excalidraw** for workshops and executive conversations where spatial explanation matters.
- Use **Draw.io / diagrams.net** only for explicit editable delivery or local Draw.io MCP requests.
- Use **SVG** only as an export artifact unless the user explicitly needs editable vector output.

## Export checklist

- Keep source file and rendered file together.
- Include a short README that explains how to regenerate the diagram.
- Record the source model, generation date, evidence coverage, and known limitations.
- Do not manually edit exported SVG/PNG in ways that diverge from the source model.
- Do not treat manual Draw.io edits as source-of-truth changes unless the evidence model is updated too.
