# Diagram Delivery Recipes

Use this reference when choosing output formats or converting between diagram formats.

## Format selection matrix

| Scenario | Preferred format | Avoid |
| --- | --- | --- |
| C4 system/container/component views | Structurizr DSL | Mermaid without C4 semantics |
| Large dependency graphs (> 30 nodes) | Graphviz DOT | Mermaid layouts that collapse under density |
| Fast embedded documentation diagrams | Mermaid | Hand-maintained SVG |
| Service call sequences | PlantUML sequenceDiagram | Graphviz, which has no sequence semantics |
| Whiteboard collaboration / executive explanation | Excalidraw | Structurizr DSL when the audience needs a less technical view |
| Editable delivery / diagrams.net collaboration | Draw.io / `.drawio` via local MCP | Treating `.drawio` as the architecture source of truth |
| Publishing / archival export | SVG export | Manual SVG edits |
| PPT / slide decks | SVG + Markdown notes | Directly embedded Mermaid as the maintained source |
| Qoder Canvas | Structurizr DSL, Graphviz DOT, or Mermaid source opened through format viewers | Independently maintained JSON |

## Artifact delivery

The plugin does not provide architecture model conversion pipelines. For user
workflows, inspect the target repository and write the source artifact that best
matches the architecture question: Markdown report, evidence JSON, Structurizr
DSL, Graphviz DOT, Mermaid, PlantUML, or Draw.io delivery.

### C4 source

Write `*.structurizr.dsl` or `workspace.dsl` as the canonical source for C4
views. Qoder can open it with the Structurizr DSL format viewer.

### Dependency graph → DOT → SVG

```bash
# DOT → SVG (requires Graphviz installed)
dot -Tsvg artifacts/dependencies.dot -o artifacts/dependencies.svg
```

Write `.dot` or `.gv` as the canonical source for dense dependency, impact,
runtime, risk, or lineage graphs. Qoder can open it with the DOT format viewer.

### Mermaid/XML → Draw.io (optional local MCP)

```toml
[mcp_servers.drawio]
command = "npx"
args = ["-y", "@drawio/mcp"]
```

Use local Draw.io MCP tools only when the user explicitly asks for Draw.io, `.drawio`, diagrams.net, or editable delivery. Keep the generated Mermaid, DOT, Structurizr, or evidence model as the canonical source.

For advanced live editing of an already-open Draw.io document, the user may install a live-editor MCP:

```toml
[mcp_servers.drawio]
command = "npx"
args = ["-y", "drawio-mcp-server", "--editor"]
```

## Consistency checklist

When exporting to multiple formats from one model, verify:

```markdown
- [ ] Node counts match across all formats.
- [ ] Edge counts match across all formats, with format degradation called out separately.
- [ ] IDs and labels are consistent across all formats.
- [ ] Low-confidence edges stay dashed or gray across all formats.
- [ ] Trust boundaries and system boundaries remain visible across all formats.
- [ ] Manual Draw.io edits have not changed architecture facts that were not synced back to the evidence model.
- [ ] Each format includes a README or note explaining how to regenerate it.
```

## Format degradation notes

| Semantic feature | Structurizr DSL/JS | Graphviz DOT | Mermaid | Draw.io |
|-----------------|---------------|-------------|---------|---------|
| C4 element types | ✅ Full | ❌ Labels only | ⚠ Shapes only | ⚠ Shapes/tags only |
| Confidence tags | ✅ Properties | ⚠ Edge style | ❌ Not supported | ⚠ Labels/styles/metadata |
| sourceRefs | ✅ Properties | ⚠ Edge label | ❌ Not supported | ⚠ Notes/metadata |
| Async/sync edges | ✅ interactionStyle | ⚠ Dashed style | ⚠ Arrow style | ⚠ Line style |
| Clustered layout | ✅ Views | ✅ subgraph | ⚠ subgraph | ⚠ Groups/layers |

## Quality rules

- Keep one canonical source for architecture facts. For evidence-model pipelines that source is `model.json`; for Markdown-first business understanding it may be the report plus Structurizr DSL or Graphviz DOT. Do not fork facts across independent diagram files.
- Declare format degradation explicitly when a target format can't represent a semantic feature.
- Treat SVG as a derived artifact; re-generate rather than manually editing.
- Treat Draw.io as a derived editable artifact unless the evidence model is updated with the same facts.
- Never use exported PPT slides as the source of truth for architecture decisions.
