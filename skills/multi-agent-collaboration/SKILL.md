---
name: multi-agent-collaboration
description: Use at the start, resume, or scope change of any repository task that may affect product behavior, UI/UX, code, configuration, resources, specifications, documentation, or validation evidence; do not use for self-contained chat-only tasks with no repository or artifact impact.
---

# Multi-Agent Collaboration

## Purpose

Coordinate Product, Designer, Coder, and Reviewer as explicit role gates while preserving project instructions, OpenSpec/opsx, design facts, repository facts, write permissions, and validation policy.

This skill is the orchestration contract. Role skills provide methods only. No role skill may override project facts or this gate.

## Iron Law

```text
NO IMPLEMENTATION BEFORE ROLE SELECTION AND REQUIRED INPUT GATES.
NO DELIVERY BEFORE REQUIRED REVIEW AND PRODUCT ACCEPTANCE.
```

Codex spawns subagents only when explicitly asked. After selecting roles, the main agent MUST explicitly spawn the selected custom agents (`product`, `designer`, `coder`, `reviewer`) or state that subagents are unavailable and execute the same role contracts serially without pretending separate agents ran.

## Status Vocabulary

Use only these workflow statuses:

- `READY`: the role completed its gate and the next required role may proceed.
- `SKIPPED`: the role is not relevant; the reason is recorded.
- `BLOCKED`: essential input, permission, fact, or evidence is missing or conflicting.
- `REWORK`: implementation or design must be corrected before continuing.
- `PASS`: Reviewer found no blocking issue and required validation evidence is sufficient.
- `ACCEPTED`: Product confirmed the delivered result satisfies the agreed goal, scope, and acceptance criteria.
- `REJECTED`: Product found an unmet product requirement or scope violation.

Do not use “conditional pass.” Outstanding mandatory work is `REWORK` or `BLOCKED`.

## Start Protocol

Run this protocol at every new task, resumed task, or material scope change before planning or editing.

### 1. Bind Project Facts

Read all accessible authoritative sources and bind the following values:

| Variable | Required meaning |
|---|---|
| `USER_GOAL` | The user’s latest explicit goal and correction. |
| `PROJECT_RULES` | Active `AGENTS.md`, overrides, repository rules, coding standards, and directory-specific instructions. |
| `WRITE_GATE` | Current sandbox, approval policy, protected paths, and write authorization. |
| `SPEC_SOURCE` | OpenSpec/opsx, PRD, issue, RFC, ADR, approved plan, or other specification facts. |
| `DESIGN_SOURCE` | `.stitch/DESIGN.md`, `.stitch/` rules, approved design, tokens, component library, screenshots, or equivalent design facts. |
| `CURRENT_FACTS` | Current code, configuration, logs, repository status, diff, untracked files, and user-provided artifacts. |
| `VALIDATION_POLICY` | Allowed and required tests, builds, linters, device checks, manual checks, and prohibited commands. |
| `AVAILABLE_SKILLS` | Exact installed skill IDs visible in this session. |

Mark each value `FOUND`, `MISSING`, `N/A`, or `CONFLICT`.

### 2. Resolve Precedence by Fact Type

Do not use one global priority list for every conflict.

**Execution permission**

```text
runtime/sandbox restrictions
> project write and validation gates
> user authorization for this task
> skill recommendations
```

**Product intent**

```text
user’s latest explicit goal/correction
> current approved specification
> older plans and historical notes
```

**Implementation facts**

```text
current code/config/diff/logs
> current project documentation
> reference projects
> vendor skills and examples
> agent inference
```

A vendor skill is never a project fact source.

### 3. Handle Missing or Conflicting Inputs

Read available sources before asking questions. Then apply this rule:

1. If the gap can change user-visible behavior, product scope, data source, design truth, write authorization, acceptance criteria, or completion evidence, set the responsible role to `BLOCKED` and ask a precise question.
2. If the gap cannot change those outcomes and the repository has one clear existing precedent, reuse that precedent and record the evidence.
3. “Common practice,” “probably,” and “similar name” are not evidence.
4. Never invent data sources, design rules, commands, dependencies, or acceptance criteria.

### 4. Select Roles

Use the smallest valid role set. Always record skipped roles and reasons.

| Task shape | Product | Designer | Coder | Reviewer |
|---|---|---|---|---|
| Chat-only explanation, translation, or rewrite with no repository/artifact impact | `SKIPPED` | `SKIPPED` | `SKIPPED` | `SKIPPED` |
| Product scope, user flow, information architecture, or acceptance criteria only | `FULL` | only if UI/UX is affected | `SKIPPED` | only for material risk review |
| UI/UX design without implementation | `FULL` or `CONFIRM` | required | `SKIPPED` | optional design compliance review |
| UI/UX implementation | `FULL` or `CONFIRM` | required | required | required |
| Non-UI feature implementation with approved specification | `CONFIRM` | `SKIPPED` | required | required |
| Non-UI bug, build failure, or behavior regression | `CONFIRM` | only if user-visible UI behavior changes | required | required |
| Review of an existing diff only | only if acceptance criteria are missing or disputed | only if design compliance is in scope | `SKIPPED` | required |
| Purely mechanical formatting with provably no behavior, design, spec, or docs effect | `SKIPPED` | `SKIPPED` | main agent or Coder | follow project review policy |

`FULL` Product mode defines or changes goal, scope, flow, data source, and acceptance criteria. `CONFIRM` mode binds an already approved specification and prevents scope drift without rewriting a full PRD.

### 5. Publish the Participation Declaration

Before role work begins, the main agent must state:

- selected roles and role mode;
- skipped roles and evidence-based reason;
- each role’s inputs;
- each role’s required output;
- each role’s completion standard;
- current blockers;
- selected exact skill IDs, if already known.

## Exact Skill Routing

Each role may select only the exact skills in its allowlist. Default maximum is two conditional skills per role per turn. Load fewer when one is sufficient.

Rules:

1. No fuzzy matching, silent substitution, or “closest skill” fallback.
2. If an exact skill is unavailable, report the capability gap and continue with the role contract when possible.
3. Block only when the missing skill is essential and the role contract cannot safely supply the capability.
4. Project-specific platform skills may be added only through an explicit project allowlist with an exact ID.
5. A skill’s recommended action is skipped when `PROJECT_RULES`, `WRITE_GATE`, or `VALIDATION_POLICY` forbids it; record the skipped portion.

### External Codex Plugin Routing

`architecture-visualization` and `design-review` are external Codex plugins managed by `client-ai`. Use their original plugin skills directly. Do not wrap, rename, copy into `client-ai/skills`, or substitute them with local skills when the exact plugin skill is available.

Expected installed skill IDs:

- Architecture: `architecture-visualization:explore`, `architecture-visualization:system-modeler`, `architecture-visualization:flow-visualizer`, `architecture-visualization:dependency-impact-analyzer`, `architecture-visualization:deployment-topology-analyzer`, `architecture-visualization:evolution-planner`, `architecture-visualization:risk-quality-reviewer`, `architecture-visualization:architecture-health`, `architecture-visualization:architecture-communicator`, `architecture-visualization:c4model`, `architecture-visualization:graphviz`, `architecture-visualization:drawio`.
- Design: `design-review:design-qa`, `design-review:ui-alignment-review`, `design-review:visual-regression-review`, `design-review:accessibility-review`, `design-review:component-library-alignment`, `design-review:design-debt-review`, `design-review:design-md-review`, `design-review:design-system-capture`, `design-review:responsive-design`, `design-review:ui-designer`.

If a listed plugin skill is not present in `AVAILABLE_SKILLS`, report the capability gap and continue with the role contract only when the missing plugin skill is not essential. A plugin skill output is advice/evidence, not a project fact source; current repository facts and approved specs remain authoritative.

Plugin ownership:

| Plugin | Primary role | Supporting roles | Purpose |
|---|---|---|---|
| `architecture-visualization` | Coder, Reviewer | Product, Designer | Architecture understanding, flow visualization, change impact, topology, evolution, and architecture health. |
| `design-review` | Designer, Reviewer | Coder | Design contracts, UI alignment, visual regression, accessibility, component consistency, responsive behavior, and design debt. |

Role-to-plugin routing:

| Role | Plugin | Allowed usage |
|---|---|---|
| Product | `architecture-visualization` | Clarify business/data flows, estimate scope and change impact, and shape acceptance criteria for cross-module work. |
| Product | `design-review` | No default ownership. Product may read Designer/Reviewer outputs for acceptance, but should not run design checks as a substitute for Designer. |
| Designer | `architecture-visualization` | Use flow and communication views to explain page flows, state flows, and technical constraints that affect UX. |
| Designer | `design-review` | Own design-system capture, `DESIGN.md`, Design QA, UI alignment, responsive decisions, accessibility design constraints, and prototypes. |
| Coder | `architecture-visualization` | Use system models, impact maps, flow maps, topology views, evolution plans, and graph artifacts before or during implementation. |
| Coder | `design-review` | Use UI alignment, component-library, and responsive findings to implement design-conformant UI. |
| Reviewer | `architecture-visualization` | Review architecture risk, health, impact, topology, and evolution evidence before `PASS`. |
| Reviewer | `design-review` | Review Design QA, visual regression, accessibility, component usage, design debt, and `DESIGN.md` readiness before `PASS`. |

### Main-Agent Orchestration Skills

These skills are not owned by a child role. The main agent uses them before or between role gates.

- `multi-agent-collaboration`: always the orchestration contract for repository tasks that affect behavior, UI/UX, code, configuration, resources, specifications, documentation, or validation evidence.
- `agent-harness`: use when a project needs `AGENTS.md` and `doc/` collaboration documents created or refreshed.

### Product Allowlist

Product owns user value, scope, priority, specification shape, release intent, store-facing positioning, and final product acceptance.

- `before-you-build`: only for a new product, MVP, launch, agent workflow, or major feature with uncertain demand, positioning, monetization, retention, trust, distribution, or adoption.
- `openspec-explore`: use to clarify requirements, explore options, or investigate product questions before proposing or implementing a change.
- `openspec-propose`: use to turn an approved product direction into OpenSpec proposal/design/spec/tasks artifacts.
- `page-route-book`: use when Product needs page inventory, navigation map, screen ownership, or route-level product understanding.
- `reverse-doc-skill`: use when Product needs product/technical documentation generated from the current codebase.
- `app-store-optimization`: use for App Store / Google Play positioning, metadata, keywords, conversion, and store-performance work.
- `project-release`: use for release scope, target channel, metadata, changelog, rollout, and final release acceptance.
- `touch-release`: use with Product only to define release requirements and constraints; implementation and verification stay with Coder/Reviewer.
- `architecture-visualization:explore`: use for broad architecture questions before committing a major feature scope.
- `architecture-visualization:flow-visualizer`: use when product scope depends on business flow, state flow, service-call flow, or data-flow clarity.
- `architecture-visualization:dependency-impact-analyzer`: use when priority, rollout size, or acceptance criteria depend on change impact across modules, pages, services, tests, data, or deployment.

OpenSpec/opsx commands and connectors are project tools or fact sources unless an installed package exposes an exact Skill ID. Do not invent their names.

### Designer Allowlist

Designer owns design source translation, visual system, interaction states, component mapping, UI acceptance criteria, and design-side QA.

- `design-system-patterns`: use for token hierarchy, themes, component-library rules, component reuse, or design-to-code system foundations.
- `interaction-design`: use for user actions, loading, disabled, selected, empty, error, success, cancellation, retry, recovery, transition, gesture, or feedback states.
- `taste-quality-gate`: use for new visual design, redesign, first screen, onboarding, empty state, subscription/upgrade screen, brand surface, or explicit anti-generic quality review.
- `design-md`: use to analyze Stitch projects and synthesize semantic `DESIGN.md` files.
- `stitch-design-taste`: use for premium Stitch visual-system constraints and anti-generic UI standards.
- `stitch-ui-design`: use to write effective Stitch UI/UX prompts for mobile or web interfaces.
- `ui-pixel-replication-by-wilder`: use for Figma, screenshot, or CSS-driven UI replication and pixel-level design constraints.
- `architecture-visualization:flow-visualizer`: use to visualize page flows, interaction state flows, data movement, and failure/recovery paths that constrain UX decisions.
- `architecture-visualization:architecture-communicator`: use to explain architecture constraints to product, design, engineering, or review audiences.
- `design-review:design-system-capture`: use to capture or update design-system evidence from Figma, screenshots, tokens, CSS, component libraries, or existing UI.
- `design-review:design-md-review`: use to author, review, or improve `DESIGN.md` as the design contract.
- `design-review:design-qa`: use as the Designer-led design acceptance workflow across contract, visual, accessibility, component, and debt checks.
- `design-review:ui-alignment-review`: use to compare implementation evidence against approved design references.
- `design-review:responsive-design`: use for responsive/adaptive layout decisions.
- `design-review:accessibility-review`: use when a design or implementation must satisfy keyboard, screen-reader, contrast, motion, touch-target, or WCAG-style checks.
- `design-review:ui-designer`: use only for UI concepts, prototypes, or design-system exploration.

Do not load `mobile-android-design` or any invented cross-platform replacement. Platform guidance must come from project facts or a separately approved exact skill.

Do not use `design-review:ui-designer` to bypass Product scope or Coder ownership. Repository implementation remains under Coder after Product and Designer gates are `READY`.

### Coder Allowlist

Coder owns implementation, debugging, refactoring, architecture-fit execution, OpenSpec task application, release-pipeline changes, and project-specific API integration.

- `code-up-by-wilder`: use as the coding-task router when implementing, modifying, refactoring, debugging, or reviewing which code skills should activate.
- `coding-standards-by-wilder`: use while writing, reviewing, or refactoring app code against shared readability, naming, error-handling, testing, and structure standards.
- `code-cleanup-by-wilder`: use to clean recently changed code while preserving behavior.
- `refactor-cleaner-by-wilder`: use for conservative dead-code, duplicate-code, unused-export, or dependency cleanup.
- `code-rewrite-similarity`: use for clean-room-style rewrites, similarity checks, and structural rewrite loops.
- `error-handling-patterns`: use when network, file, storage, permission, system API, billing, ads, parsing, async work, concurrency, lifecycle, retry, or user-visible failure paths are in scope.
- `systematic-debugging`: use for a bug, crash, test failure, build failure, performance problem, integration issue, or unexpected behavior before proposing a fix.
- `openspec-apply-change`: use to implement approved OpenSpec tasks.
- `android-reverse-engineering`: use for APK/XAPK/JAR/AAR decompilation, Android reverse engineering, endpoint extraction, or UI-to-network call tracing.
- `social-gateway-api-sync`: use only for the `noviplay_cli` Android Social Gateway API sync workflow described by that skill.
- `solution-architecture-by-wilder`: use when implementation needs architecture design, component boundaries, interfaces, data flow, or technical tradeoff decisions.
- `project-release`: use to execute release workflow tasks such as versioning, metadata sync, artifacts, tracks, and rollout steps after Product defines intent.
- `touch-release`: use to set up or modify mobile release pipeline, signing, Fastlane, CI, beta distribution, or versioning.
- `architecture-visualization:system-modeler`: use to understand the current repository architecture before implementing cross-module work.
- `architecture-visualization:dependency-impact-analyzer`: use before implementing changes that may affect modules, routes, APIs, tests, storage, permissions, build, or deployment.
- `architecture-visualization:flow-visualizer`: use when implementation needs a precise business, data, service-call, or state-flow map.
- `architecture-visualization:deployment-topology-analyzer`: use when implementation affects runtime environments, CI/CD, release topology, cloud resources, or operational boundaries.
- `architecture-visualization:evolution-planner`: use for migration slices, modernization, architecture evolution, or target-state implementation planning.
- `architecture-visualization:legacy-system-visualizer`: use when implementing changes in poorly documented legacy systems.
- `architecture-visualization:c4model`: use to create maintainable C4 / Structurizr DSL architecture artifacts.
- `architecture-visualization:graphviz`: use to create dense DOT dependency, flow, deployment, lineage, risk, or impact graphs.
- `architecture-visualization:drawio`: use only when the user explicitly asks for Draw.io / diagrams.net editable delivery.
- `design-review:ui-alignment-review`: use to interpret design-vs-implementation findings before UI fixes.
- `design-review:component-library-alignment`: use when implementation must use existing design-system components or variants.
- `design-review:responsive-design`: use when implementing adaptive layouts.

Do not use the backend-focused `architecture-patterns` as a substitute for Android, iOS, or Flutter architecture. Existing repository architecture is authoritative.

### Reviewer Allowlist

Reviewer owns independent review, evidence verification, regression risk, design QA evidence, architecture health, release validation, and final quality gate before Product acceptance.

- `code-review-excellence`: use for code, configuration, resource, build, migration, or script diffs.
- `code-reviewer-by-wilder`: use for merge-style review of regressions, security issues, maintainability risks, missing tests, or architecture drift.
- `verification-before-completion`: use before `PASS`, `ACCEPTED`, commit/PR recommendations, or any completion claim.
- `android_ui_verification`: use for Android emulator / ADB UI verification evidence.
- `openspec-archive-change`: use to archive completed OpenSpec changes only after implementation and review are complete.
- `coding-standards-by-wilder`: use as review criteria for naming, structure, testing, and maintainability.
- `error-handling-patterns`: use to review user-visible failure paths and recovery behavior.
- `reverse-doc-skill`: use to verify generated docs or detect documentation drift from the current codebase.
- `app-store-optimization`: use to review ASO output, metadata quality, and store-facing risk.
- `project-release`: use to verify release evidence, metadata, artifacts, tracks, rollout, and release records.
- `touch-release`: use to verify mobile release pipeline, signing, Fastlane, CI, beta distribution, and versioning changes.
- `architecture-visualization:risk-quality-reviewer`: use for architecture risk, quality attributes, technical debt, fitness functions, and remediation priority.
- `architecture-visualization:architecture-health`: use to verify architecture artifacts are current, traceable, and aligned with code/config/runtime/ADR evidence.
- `architecture-visualization:dependency-impact-analyzer`: use to check whether a diff changed more modules, tests, data, or deployment surfaces than claimed.
- `architecture-visualization:deployment-topology-analyzer`: use to review runtime/deployment/release topology risks.
- `architecture-visualization:evolution-planner`: use to review migration plans, target-state gaps, and architecture evolution slices.
- `design-review:design-qa`: use for full design acceptance evidence review.
- `design-review:visual-regression-review`: use for expected/actual/diff screenshot evidence.
- `design-review:accessibility-review`: use for accessibility evidence and manual a11y review.
- `design-review:component-library-alignment`: use to check design-system component usage.
- `design-review:design-debt-review`: use to catch hard-coded values, token drift, one-off UI patterns, and visual maintainability risk.
- `design-review:design-md-review`: use to review `DESIGN.md` completeness and implementation readiness.

Do not use the browser-focused `e2e-testing-patterns` as a generic client-app test skill. Client user-path review is part of the Reviewer contract below. Add Espresso, XCUITest, Flutter integration-test, Patrol, or Maestro skills only when the project uses an exact approved skill.

## Workflow State Machine

```text
INTAKE
  -> CONTEXT_BOUND
  -> PRODUCT_READY | PRODUCT_SKIPPED | BLOCKED
  -> DESIGN_READY | DESIGN_SKIPPED | BLOCKED
  -> IMPLEMENTED | IMPLEMENTATION_SKIPPED | BLOCKED
  -> REVIEW_PASS | REVIEW_REWORK | REVIEW_BLOCKED | REVIEW_SKIPPED

REVIEW_REWORK
  -> CODER_FIX or DESIGN_FIX
  -> REVIEW_AGAIN

REVIEW_PASS
  -> PRODUCT_ACCEPTED | PRODUCT_REJECTED | PRODUCT_FINAL_SKIPPED

PRODUCT_REJECTED
  -> RESPONSIBLE_ROLE_REWORK
  -> REVIEW_AGAIN when implementation/design artifacts changed
  -> PRODUCT_FINAL_AGAIN

PRODUCT_ACCEPTED or PRODUCT_FINAL_SKIPPED
  -> MAIN_AGENT_DELIVERY
```

Coder may start only after Product is `READY` or explicitly `SKIPPED`, and Designer is `READY` or explicitly `SKIPPED`. Reviewer starts only after implementation or reviewable artifacts exist. No child role delivers directly to the user.

## Product Contract

### Responsibility

Clarify user value, goal, scope, non-goals, user flow, information architecture, data source, product risk, and testable acceptance criteria. Perform final product acceptance after review.

Product does not edit code, decide visual details, or approve code quality.

### Required Input

- `USER_GOAL`, `PROJECT_RULES`, `SPEC_SOURCE`, relevant `CURRENT_FACTS`;
- initial mode: `FULL` or `CONFIRM`;
- final mode: Designer/Coder/Reviewer outputs and evidence.

### Required Initial Output

- mode;
- goal and user value;
- in-scope and out-of-scope items;
- user flow/information architecture when relevant;
- authoritative data sources;
- acceptance criteria with stable IDs such as `AC-01`;
- assumptions and product risks;
- blockers;
- status: `READY` or `BLOCKED`.

Every acceptance criterion must be observable. Avoid “works well,” “looks good,” or other untestable wording.

### Final Acceptance

After Reviewer `PASS`, Product maps delivered evidence to every acceptance criterion and returns:

- `ACCEPTED`, `REJECTED`, or `BLOCKED`;
- unmet criterion IDs;
- scope drift, if any;
- remaining product risks;
- whether the main agent may deliver.

## Designer Contract

### Responsibility

Translate approved product intent and current design facts into layout, component mapping, token usage, resource naming, interaction, motion, and complete component states.

Designer does not edit implementation code unless the main agent explicitly changes the role scope.

### Required Input

- Product output and acceptance criteria;
- `DESIGN_SOURCE` and relevant `.stitch/` files;
- existing components, themes, resources, naming conventions, and platform constraints;
- current implementation when needed for translation.

For a Stitch-backed project, read `.stitch/DESIGN.md` before generating or changing a design. If the task needs new design decisions and the authoritative design source is missing or conflicting, return `BLOCKED`. For a narrow change with a unique existing component precedent, reuse it and cite the precedent.

### Required Output

- design sources read;
- page/flow structure;
- mapping to existing components and resources;
- token and naming decisions;
- default, pressed/focused, disabled, selected, loading, empty, error, success, cancellation, and recovery states as relevant;
- interaction and motion rules, including reduced-motion/performance constraints;
- Coder implementation constraints;
- design risks and blockers;
- status: `READY` or `BLOCKED`.

Project design facts override `taste-quality-gate` and all vendor examples.

## Coder Contract

### Responsibility

Implement only the approved scope using existing repository architecture, naming, module boundaries, components, and documentation conventions.

### Entry Gate

Coder must receive:

- Product `READY` or documented `SKIPPED`;
- Designer `READY` or documented `SKIPPED`;
- `PROJECT_RULES`, `WRITE_GATE`, relevant specification/design facts, and `VALIDATION_POLICY`;
- current repository status and diff so existing user changes are preserved.

### Required Behavior

- do not expand scope;
- do not add a third-party dependency without explicit approval;
- do not copy a reference project implementation;
- do not overwrite unrelated user changes;
- preserve existing client architecture rather than applying a backend pattern by analogy;
- implement in-scope failure states, not only the happy path;
- update required specs/docs in the same task;
- run only authorized validation commands;
- when validation is prohibited or unavailable, report the exact unverified claims.

### Required Output

- implementation summary;
- changed files and purpose;
- acceptance-criterion mapping;
- key technical decisions and repository precedents used;
- dependency and scope statement;
- error/failure handling;
- specification/documentation synchronization;
- fresh validation evidence and unverified items;
- risks and Reviewer focus areas;
- status: `READY` or `BLOCKED`.

## Reviewer Contract

### Responsibility

Independently review the actual diff/artifacts against Product acceptance criteria, Designer constraints, project rules, specifications, documentation requirements, validation policy, and regression risk. Never rely only on Coder’s summary.

### Required Review Dimensions

- requirement and scope compliance;
- design-system and interaction compliance when relevant;
- correctness and edge cases;
- architecture/module-boundary fit based on the actual repository;
- error handling and user feedback;
- permissions, privacy, security, data integrity, billing/ads, files/storage, concurrency, performance, and lifecycle risks when relevant;
- documentation/specification synchronization;
- validation sufficiency and freshness;
- regression risk.

For client apps, review the applicable user path:

```text
entry -> primary action -> success result
                     -> failure and recovery
                     -> cancellation/back
                     -> permission denial/retry
                     -> system page or external handoff return
                     -> process interruption/state restoration
```

### Required Finding Format

Each finding must include:

- severity: `Blocker`, `High`, `Medium`, or `Low`;
- file and line/symbol/location;
- violated criterion, design rule, or project rule;
- problem and evidence;
- consequence;
- recommended correction;
- blocking: yes/no.

### Verdict

Return exactly one:

- `PASS`: no blocking findings and all validation required by `VALIDATION_POLICY` has fresh sufficient evidence;
- `REWORK`: correctable findings remain;
- `BLOCKED`: actual diff, essential facts, authorization, or required evidence cannot be inspected.

If project policy permits only static/manual validation, state that scope precisely. Lack of required evidence can never be hidden behind confidence.

## Common Handoff Envelope

Every role response must begin with this machine-readable block:

```yaml
role: Product | Designer | Coder | Reviewer
mode: FULL | CONFIRM | INITIAL | FINAL_ACCEPTANCE | N/A
status: READY | SKIPPED | BLOCKED | REWORK | PASS | ACCEPTED | REJECTED
sources_read:
  - path-or-source
skills_used:
  - exact-skill-id
criteria_covered:
  - AC-01
decisions:
  - decision
evidence:
  - command/output/diff/path/manual-check
blockers:
  - blocker-or-none
handoff_to: Product | Designer | Coder | Reviewer | Main
```

Do not claim a source or skill was read when it was not.

## Main-Agent Delivery Gate

Before final delivery, the main agent must verify:

- participation declaration exists;
- every selected role returned a terminal status;
- all `REWORK` loops were closed by a new review;
- Reviewer is `PASS` when Reviewer is required;
- Product is `ACCEPTED` when Product participated;
- actual changed files and fresh validation evidence were inspected;
- executed and unexecuted validation are distinguished;
- risks and remaining items are explicit;
- no child agent or vendor skill bypassed project rules.

Final delivery must summarize:

- Product decision and final acceptance;
- Designer decisions, when used;
- Coder changes, when used;
- Reviewer verdict and findings, when used;
- validation evidence and unverified items;
- risks, remaining work, and whether the request was precisely completed.

## Rationalization Countermeasures

| Rationalization | Required response |
|---|---|
| “It is only one line.” | Classify impact, select/skip roles explicitly, then proceed. Size does not prove low risk. |
| “The user wants it fast.” | Speed does not override write, design, review, documentation, or acceptance gates. |
| “Product requirements are obvious.” | Bind an approved specification or Product `CONFIRM`; do not let Coder infer scope. |
| “The design can be guessed.” | Read the design source or reuse one cited repository precedent; otherwise block. |
| “A similarly named skill is close enough.” | Do not substitute. Report the missing exact skill and use the role contract. |
| “The child agent said it passed.” | Inspect the actual diff and fresh evidence independently. |
| “Tests cannot run, but it should work.” | Report `BLOCKED` or the exact policy-approved limited evidence; do not claim completion. |
| “Documentation can be updated later.” | If project rules require synchronization, the task remains incomplete. |
| “Reviewer can fix it directly.” | Return `REWORK` to the responsible role, then review again. |
| “Product already approved the plan.” | Final acceptance still checks the delivered result against acceptance criteria. |

## Self-Check

Before leaving this skill, answer all with evidence:

- Did I bind project, spec, design, write, current-fact, and validation sources?
- Did I select or explicitly skip every role?
- Did I explicitly spawn selected Codex custom agents?
- Did every role use only exact allowlisted skills?
- Did Coder wait for Product/Designer readiness or documented skips?
- Did Reviewer inspect actual artifacts and fresh evidence?
- Did rework return to the responsible role and receive a new review?
- Did Product perform final acceptance when required?
- Is the main agent, not a child role, delivering the consolidated result?

Any “no” means the workflow is not ready for delivery.
