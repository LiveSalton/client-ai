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

### Product Allowlist

- `before-you-build`: only for a new product, MVP, launch, agent workflow, or major feature with uncertain demand, positioning, monetization, retention, trust, distribution, or adoption. Do not use for narrow fixes or already validated changes.

OpenSpec/opsx commands and connectors are project tools or fact sources unless an installed package exposes an exact Skill ID. Do not invent their names.

### Designer Allowlist

- `design-system-patterns`: use for token hierarchy, themes, component-library rules, component reuse, or design-to-code system foundations.
- `interaction-design`: use for user actions, loading, disabled, selected, empty, error, success, cancellation, retry, recovery, transition, gesture, or feedback states.
- `taste-quality-gate`: conditionally use for new visual design, redesign, first screen, onboarding, empty state, subscription/upgrade screen, brand surface, or an explicit request to reduce generic/template-like UI.

Do not load `mobile-android-design` or any invented cross-platform replacement. Platform guidance must come from project facts or a separately approved exact skill.

### Coder Allowlist

- `error-handling-patterns`: use when network, file, storage, permission, system API, billing, ads, parsing, async work, concurrency, or any user-visible failure path is in scope.
- `systematic-debugging`: use for a bug, crash, test failure, build failure, performance problem, integration issue, or unexpected behavior before proposing a fix.

Do not use the backend-focused `architecture-patterns` as a substitute for Android, iOS, or Flutter architecture. Existing repository architecture is authoritative.

### Reviewer Allowlist

- `code-review-excellence`: use for code, configuration, resource, build, migration, or script diffs.
- `verification-before-completion`: use before `PASS`, `ACCEPTED`, commit/PR recommendations, or any completion claim.

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
