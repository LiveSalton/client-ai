# Business Application Fitness

Use this reference when the system under analysis is a real business application, not primarily an SDK, CLI, framework, infrastructure library, or developer tool.

Business applications include CRM, ERP, ecommerce, marketplace, project management, kanban, property management, invoicing, ledger, learning management, CMS, collaborative document, support, analytics, and other workflow-heavy products.

## Trigger signals

Apply this reference when one or more signals are present:

- The repository describes a product used by business users, admins, customers, students, residents, sellers, accountants, operators, or internal teams.
- The user asks whether an agent or skill understands the business, workflow, domain model, or end-to-end process.
- The repository has agent-facing instruction files such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, or project-specific MCP / AI coding guidance.
- The codebase exposes business entities, permissions, tenancy, workspace/organization concepts, lifecycle states, audit logs, migrations, seeds, or end-to-end tests.

Do not force this reference onto generic libraries, framework examples, protocol SDKs, build tools, or small demos unless the user explicitly asks for business-readiness evaluation.

## Business Application Fitness dimensions

When this reference applies, evaluate these dimensions before choosing final diagrams:

| Dimension | What to look for | Strong evidence |
| --- | --- | --- |
| Business model clarity | Domain entities, roles, capabilities, workflows, policies, permissions, tenant/organization/workspace boundaries | Models, schemas, migrations, route names, service names, product docs, tests, seed data |
| Data and state understanding | Data ownership, lifecycle status, transactional boundaries, audit logs, soft delete, retention, sensitive data, imports/exports | Migrations, ORM mappings, repositories, DB constraints, events, audit tables, lifecycle enums |
| End-to-end path grounding | One or more real business paths from trigger to outcome | Controllers, jobs, workflows, tests, docs, UI routes, API contracts, queue/event handlers |
| Agent instruction use | Whether AI guidance explains the product domain and regression risks, not only build/test commands | `AGENTS.md`, `CLAUDE.md`, Copilot instructions, MCP docs, test strategy docs |
| Business validation readiness | Automated validation for business rules, API contracts, migrations, fixtures, seeds, and E2E paths | Unit/integration/E2E tests, contract tests, migration tests, fixtures, factories, CI workflows |

## Evidence checklist

Prefer this evidence order for business applications:

1. Product or domain overview: `README`, docs, app descriptions, user-facing route names.
2. Agent instruction files: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`.
3. Business objects: models/entities, schema/migrations, GraphQL/OpenAPI types, domain services.
4. Workflow paths: controllers/routes, UI pages/actions, jobs/workers, events, command handlers.
5. Permission and boundary rules: roles, policies, guards, tenancy, workspace, organization, membership, ACL/RBAC.
6. State and lifecycle: status fields, state machines, soft delete, archival, audit/event history, billing/payment state.
7. Validation assets: tests, fixtures, seeds, factories, test helpers, CI workflow names.

If a claim only comes from a file/folder name, mark it low confidence and list the validation step.

Structural evidence and behavioral evidence are different. A table, field, enum, counter, or relation can confirm that the data model supports a concept, but it does not confirm the business action, lifecycle transition, callback, job, trigger, permission enforcement, or transaction boundary that uses it. To mark behavior as confirmed, prefer a mutation, controller, route action, job, event handler, trigger, test, trace, or user-provided process note. Be careful with action verbs: creates, increments, assigns, enforces, sends, moves, completes, deletes, posts, reserves, charges, or persists should be used as confirmed behavior only when the action path is evidenced.

UI evidence and backend behavior are different. Views, forms, page objects, templates, and client-side route names can confirm available screens, fields, buttons, payload shapes, and intended submission endpoints. They do not by themselves confirm that the server persists data, sends email, records payment, enforces permissions, updates status, or completes a business transaction. When only UI evidence exists, phrase the step as "UI exposes/submits/links to..." and mark the server-side effect as unknown until a controller, server action, mutation, model method, job, callback, integration test, or trace confirms it.

Factory, fixture, seed, and sample-data evidence is also limited. It can confirm test-data fields, example default values, and fixture relationships. It does not by itself confirm production creation paths, lifecycle defaults, payment states, validation rules, stock reservation, permission enforcement, or state transitions. When only factory/fixture evidence exists, phrase the claim as "Factory sample default..." or "Fixture example value..." and list the production handler, migration/model, integration test, or service code needed to validate behavior. Avoid wording like "orders default to paid" or "payments default to cash-on-delivery" unless production code or integration tests confirm that runtime default.

## Scenario understanding evaluation

When evaluating skills against large real-world business repositories, prefer a bounded project brief and scenario brief before asking the agent to generate reports or diagrams. The purpose of the corpus is to test whether the skill contract produces reasonable business understanding, not whether the agent can spend unlimited time discovering files.

The business corpus should run one clear scenario per case, such as invoice-to-payment, opportunity lifecycle, card movement, or double-entry transaction posting. The expected output is a human-readable architecture understanding report plus supporting diagrams. Do not require a universal JSON shape for business-application evaluation. JSON evidence models and `sourceRefs` remain useful for traceability-specific workflows, but they are not the generic business corpus artifact contract.

A good bounded project brief includes:

- Agent instructions and product overview files.
- The highest-signal business object files: models, entities, schema, migrations, GraphQL/OpenAPI types, and domain services.
- One or two workflow entry points: controller, route, API router, job, event handler, or UI action.
- Permission and tenancy evidence: policies, guards, access modules, role definitions, workspace/organization membership files.
- Data/state evidence: lifecycle enums, status fields, soft-delete fields, audit/event tables, import/export records.
- Validation evidence: tests, fixtures, factories, seed data, and CI workflow names.

Keep the brief bounded and explicit. If it does not contain enough evidence for a claim, record the missing evidence as an unknown with a validation step instead of broad-scanning the whole repository. Use direct full-repository discovery only for small repositories or when a focused follow-up requires deeper proof.

If the bounded brief is missing a scenario-critical entity, handler, integration, or lifecycle mechanism, elevate that limitation near the top of the report. Do not bury it only in a long gaps table. For example, an ecommerce checkout report without order-creation or payment-handler evidence should say in the Architecture Summary or Scenario Analysis opening that the checkout path is structurally outlined but behaviorally incomplete. A CRM opportunity report without an Opportunity model or workflow handler should say the opportunity lifecycle cannot be confirmed from the pack.

## Output expectations

A business-application architecture answer should include:

- `architecture-understanding.md` or an equivalent human-readable report as the primary deliverable.
- The selected scenario skill(s) and supporting foundation/format skill(s), including `graphviz` when Graphviz DOT is produced and `c4model` when Structurizr/C4 output is produced.
- A current-state business capability or system context view when it helps the scenario; prefer Structurizr DSL for C4-style context/container views.
- At least one end-to-end business flow or state/lifecycle diagram when the scenario is flow-oriented; prefer Graphviz DOT for business flows, lifecycles, integration maps, legacy maps, and impact-style relationships.
- A data/state summary that names the key records, stores, lifecycle states, and transactional boundaries when evidenced.
- An agent-instruction coverage note: what the AI guidance explains, what it omits, and which business regression paths remain under-specified.
- A Business Application Fitness findings section when the user is evaluating agent readiness; a numeric scorecard is optional, not mandatory.
- Unknowns and assumptions separated from evidence-backed facts.

Use business names in the business-flow view. Keep implementation services, APIs, database tables, queues, and jobs in a separate technical drill-down when they would clutter the business view.

## Diagram grounding for business systems

Business diagrams are allowed to be partial. They are not allowed to upgrade assumptions into confirmed architecture.

- A diagram must preserve the same confidence level as the text. If the report says `opportunity`, `partner`, workspace isolation, payment callback, inventory reservation, role enforcement, or a lifecycle transition is unknown, the diagram must label that node or edge as `assumed`, `inferred`, or `unknown`.
- Do not infer tenant/workspace, permission, role, partner/customer visibility, or billing/payment behavior from directory names alone. Mark those as low-confidence until schema, policy, controller, test, or product documentation confirms them.
- If a scenario-critical entity is missing from the bounded evidence pack, model the confirmed generic mechanism and add an `Unknown: validate <entity>` branch instead of drawing the full domain-specific lifecycle as fact.
- If a scenario-critical handler, entity, or integration is missing, make that a top-level limitation and not just a minor unknown. The reader should immediately know which parts of the requested scenario cannot be trusted yet.
- Do not hide inferred mechanisms inside confirmed lifecycle steps. For example, a counter field can support a possible numbering mechanism, but the report should not say creation increments it unless the creation path, trigger, or test is present.
- Do not hide backend effects inside UI-confirmed steps. If a form posts to `send_invoice`, the confirmed fact is that the UI submits to that endpoint; actual mail transport, delivery result, error handling, and invoice state changes remain unknown until handler/integration evidence is present.
- Diagram labels should preserve that distinction at a glance. Prefer `UI: invoice email form submits to mailer/send_invoice` plus `Email dispatched (unknown)` over a single confirmed `Send Invoice` node when only the view/template is evidenced.
- Do not turn factories or fixtures into production lifecycle facts. Prefer `Factory: cart fields/defaults` plus `Cart creation handler (unknown)` over a confirmed `Cart Created` node when only a factory file is evidenced. The main node label should not be an action-completion phrase such as `Cart Created`, `Payment Recorded`, or `Inventory Reserved` with `Factory:` hidden in parentheses.
- In text, do not use bare production-style default language for factory values. Prefer "OrderTransactionFactory sample status is paid" over "Order transactions default to paid" unless runtime model/service evidence confirms the default.
- If a handler/action path is unknown, diagram edges from that unknown handler to factory-only structure should be dashed or dotted and labeled `would create`, `structure supports`, or `needs validation`, not solid confirmed verbs such as `creates`, `persists`, `charges`, or `updates`.
- Avoid using example statuses, sample list names, common CRM/ecommerce states, or public product knowledge as canonical lifecycle states unless repository evidence confirms them.
- Graphviz DOT should use stable node IDs, readable labels, explicit edge labels, and clusters/subgraphs when boundaries matter. Mermaid may be used for small Markdown-native sketches, but it is not the default business corpus format.

## Routing guidance

For broad business-application requests:

- Start with `explore`.
- Use `system-modeler` as the primary skill for current-state business/system modeling.
- Add `flow-visualizer` when an end-to-end business path, lifecycle, or user journey is needed.
- Add `dependency-impact-analyzer` for PR/change-set blast radius through business entities and regression paths.
- Add `risk-quality-reviewer` for agent readiness, quality attributes, missing regression coverage, or architecture review.

For explicit requests:

- "Understand this CRM/ERP/ecommerce/project management system" -> `system-modeler`, with this reference.
- "Show the create order / invoice / task / ledger transaction flow" -> `flow-visualizer`, with this reference.
- "Can agents safely change this business app?" -> `risk-quality-reviewer`, supported by `system-modeler` and this reference.
- "What will this PR break?" -> `dependency-impact-analyzer`, but include business entity and workflow blast radius.

## Quality gates

- Do not stop at framework/build/test summary.
- Do not equate folders with domain boundaries unless schema, route, service, or docs confirm the relationship.
- Do not claim AI instructions cover business context unless they name domain objects, business rules, critical workflows, or regression paths.
- Do not draw a technical call chain as a business process without translating it into actor/action/outcome language.
- Do not let a diagram contradict the unknowns table or confidence labels in the text.
- Always include the missing business evidence as unknowns or validation tasks.

## Business corpus examples

A balanced Business-App Agent Readiness corpus can include:

```text
open-condo-software/condo          # property/community SaaS
opf/openproject                    # project management
Leantime/leantime                  # project management
kanbn/kan                          # kanban/task management
twentyhq/twenty                    # CRM
maERP/maERP                        # ERP
bagisto/bagisto                    # ecommerce
mirumee/nimara-ecommerce           # marketplace/ecommerce
InvoicePlane/InvoicePlane          # invoicing/collections
LerianStudio/midaz                 # financial ledger
automattic/sensei                  # learning management
fiduswriter/fiduswriter            # collaborative documents
```

Use these as evaluation samples, not as hard-coded skill routing rules.
