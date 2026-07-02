# Architecture Tooling Assessment

Use this reference when deciding whether the architecture skill set needs another skill, example, or Canvas surface.

## Curated Plugin Comparison

Observed organization in curated workflow/plugin bundles:

| Plugin | Pattern relevant to this package |
| --- | --- |
| Data Analytics | Router plus scenario workflows, with charts, validation, notebook/reporting, and context as shared capabilities. |
| Product Design | Router plus gated build/audit/prototype workflows, with QA and sharing as support surfaces. |
| Creative Production | Explore front door plus commercially distinct exploration scenes. |
| Sales / Investing / Banking | Many scenario skills are acceptable only when the user problems are genuinely different and names are specific. |

Architecture should therefore expose scenario skills, not one skill per diagram type or programming language. C4, Graphviz, output formats, evidence validation, and Canvas are shared capabilities.

## Current 13-Skill Shape

| Category | Skills |
| --- | --- |
| Router | `explore` |
| Scenario skills | `system-modeler`, `flow-visualizer`, `dependency-impact-analyzer`, `deployment-topology-analyzer`, `evolution-planner`, `risk-quality-reviewer`, `legacy-system-visualizer`, `architecture-communicator`, `architecture-health` |
| Generation foundations | `c4model`, `graphviz` |
| Delivery foundation | `drawio` |

This is MECE enough because each scenario answers a different architecture job:

- Structure: what exists and where the boundaries are.
- Flow: how work, calls, events, or data move.
- Dependency impact: what depends on what and what a change affects.
- Deployment/runtime: where it runs and how it is operated.
- Evolution: how it should change and why.
- Review: whether it is risky or fit for goals.
- Legacy: how to handle sparse evidence and modernization risk.
- Communication: how to explain a verified model to an audience.
- Health: whether architecture artifacts remain current, traceable, and regenerable.

AI/tool-process mapping is intentionally out of scope for this software architecture plugin.

`drawio` is intentionally a delivery foundation, not a scenario workflow. It exists so agents can recommend local Draw.io MCP installation and use it when the user explicitly asks for editable Draw.io / diagrams.net delivery. It should not become a deterministic generation dependency for this plugin.

## Script Policy

Root scripts are maintenance gates only:

- `build:canvases`: sync checked-in Canvas format viewers.
- `validate:plugin`: validate the Qoder package, skill shape, references, and viewer resources.
- `validate:examples`: run the lightweight example smoke test.
- `validate:all` / `quality`: run the full local gate.

Do not add built-in language extractors, model generators, or conversion
pipelines unless there is a repeated architecture job that agents cannot handle
reliably from project evidence. Repository architecture depends heavily on the
user's language, framework, deployment stack, domain vocabulary, and runtime
evidence. The default workflow is for the agent to inspect the project and write
the necessary artifacts directly.

No Draw.io generator script is provided. Draw.io remains an optional local MCP
delivery surface when the user explicitly asks for editable Draw.io or
diagrams.net output.

## Canvas Decision

Use three Canvas format-viewer surfaces:

- **Structurizr DSL viewer** for system landscape, context, container, and component views.
- **Graphviz DOT viewer** for dense dependency, flow, deployment, risk, lineage, and impact graphs.
- **Mermaid viewer** for small Markdown-native sketches that are useful during communication.

Do not build a third custom architecture Canvas until a scenario needs interactions neither C4 nor Graphviz can represent, such as:

- multi-view evidence exploration with sourceRef drill-down,
- current/target diff playback,
- risk remediation boards tied to nodes,
- traceability coverage heatmaps.

For now, those should be represented as model JSON plus Markdown reports, with Canvas used for visual inspection of text-based diagram artifacts.

## Backlog Candidates

These are useful but not required for the current scene-first skill surface:

- OpenAPI/AsyncAPI extractors for service-call and event-flow evidence.
- Kubernetes/IaC inventory extractors for deployment topology.
- Optional integrations with external dependency or runtime inventory tools, if users repeatedly ask for a specific ecosystem.

Add these only when a scenario skill repeatedly needs deterministic extraction that agents should not rewrite by hand.
