# Architecture Visualization

Architecture Visualization is a Qoder-native plugin for understanding, modeling, reviewing,
and evolving software architecture. The skills are scenario entry points:
current-state modeling, flows, dependency impact, runtime topology, evolution
planning, risk review, legacy discovery, stakeholder communication, and
architecture health.

Canvas support is intentionally narrow. The plugin ships format viewers for
architecture artifacts that an agent may write during those workflows:

- `canvases/dot/` previews local `.dot` and `.gv` Graphviz files.
- `canvases/dsl/` previews Structurizr DSL files such as `workspace.dsl` or
  `*.structurizr.dsl`.
- `canvases/mermaid/` previews local Mermaid files.

The plugin does not ship repository-language extractors or deterministic model
generators. Those would be constrained by the user's language, framework,
deployment stack, conventions, and evidence sources. Agents should inspect the
target project and write the needed Markdown, JSON, DOT, DSL, Mermaid, or
Draw.io delivery artifacts directly.
