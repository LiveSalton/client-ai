# Skills Index

This package contains 13 `SKILL.md` files organized by architecture scenario and foundation capability.

The public surface is intentionally MECE: route by the user's architecture job first, then choose the diagram/view format inside the selected workflow.

## Tier 1 — Router

| Skill | When to use |
| --- | --- |
| [`explore`](explore/SKILL.md) | Broad architecture requests; routes to the smallest useful scenario skill set. |

## Tier 2 — Scenario Skills

| Skill | Question answered |
| --- | --- |
| [`system-modeler`](system-modeler/SKILL.md) | What is this system/repo/platform architecture today? |
| [`flow-visualizer`](flow-visualizer/SKILL.md) | How do business actions, service calls, events, or data move? |
| [`dependency-impact-analyzer`](dependency-impact-analyzer/SKILL.md) | What depends on what, and what will this change affect? |
| [`deployment-topology-analyzer`](deployment-topology-analyzer/SKILL.md) | Where does it run, how is it connected, and how is it released/operated? |
| [`evolution-planner`](evolution-planner/SKILL.md) | How should the architecture change, and why? |
| [`risk-quality-reviewer`](risk-quality-reviewer/SKILL.md) | Is this architecture healthy enough for its goals, and where are the risks? |
| [`legacy-system-visualizer`](legacy-system-visualizer/SKILL.md) | How do we understand and safely change this legacy system despite incomplete evidence? |
| [`architecture-communicator`](architecture-communicator/SKILL.md) | How do we explain this architecture clearly to a specific audience? |
| [`architecture-health`](architecture-health/SKILL.md) | Are the architecture artifacts current, traceable, and maintainable over time? |

## Tier 3 — Foundation Skills

These are supporting skills used by the scenario skills. They are still callable when the user explicitly asks for the foundation capability.

| Skill | When to use |
| --- | --- |
| [`c4model`](c4model/SKILL.md) | C4/Structurizr DSL source for system landscape, context, container, and component views. |
| [`graphviz`](graphviz/SKILL.md) | DOT generation for dense dependencies, flows, runtime topology, risks, and impact graphs. |
| [`drawio`](drawio/SKILL.md) | Optional Draw.io / diagrams.net editable delivery and local MCP setup guidance. |

## Shared References

| Reference | Purpose |
| --- | --- |
| [`../references/architecture-contract.md`](../references/architecture-contract.md) | Shared architecture contract, evidence rules, and artifact shape. |
| [`../references/architecture-evidence-model.md`](../references/architecture-evidence-model.md) | Node/edge/evidence/confidence model. |
| [`../references/diagram-output-formats.md`](../references/diagram-output-formats.md) | Format selection for Mermaid, PlantUML, Structurizr, Graphviz, Excalidraw, Draw.io, SVG, Markdown, Canvas, and slides. |
| [`../references/diagram-delivery-recipes.md`](../references/diagram-delivery-recipes.md) | Delivery/export recipes formerly owned by a separate output-format skill. |
| [`../references/structurizr-canvas-pipeline.md`](../references/structurizr-canvas-pipeline.md) | Structurizr DSL artifact and viewer guidance. |
| [`../references/architecture-tooling-assessment.md`](../references/architecture-tooling-assessment.md) | Curated-plugin comparison, MECE rationale, script policy, Canvas decision, and tooling backlog. |
| [`../references/business-application-fitness.md`](../references/business-application-fitness.md) | Business-application modeling and agent-readiness expectations for CRM, ERP, ecommerce, project management, invoicing, ledger, LMS, CMS, and other workflow-heavy products. |
