---
name: code-review-excellence
description: Use when reviewing code, configuration, resource, build, migration, or script changes for requirement fit, correctness, maintainability, security, performance, validation, documentation, and regression risk; do not use as a substitute for Product acceptance.
---

# Code Review Excellence

## Goal

Review the actual change as an owner: evidence-based, specific, prioritized, constructive, and independent from the implementer’s self-report.

Adapted from `wshobson/agents` for the Reviewer role in this pack.

## Context First

Before line review:

1. Read Product acceptance criteria and non-goals.
2. Read Designer constraints when UI/UX is affected.
3. Read repository instructions, specification/documentation rules, and validation policy.
4. Inspect repository status, actual diff, changed files, generated files, and relevant surrounding code.
5. Read validation output; do not infer it from a summary.

If actual artifacts or essential context cannot be inspected, return `BLOCKED`.

## Review Order

### 1. Scope and behavior

- Does the diff implement every required criterion and only approved scope?
- Are data sources, permissions, flows, and user-visible states correct?
- Are removed or changed behaviors documented?

### 2. Design and client lifecycle

When relevant, check component/token reuse, all interaction states, back/cancel behavior, system-page return, lifecycle interruption, state restoration, and accessibility/performance constraints.

### 3. Correctness and edge cases

Check null/empty/bounds cases, stale data, race conditions, async cancellation, duplicate actions, partial operations, error propagation, and cleanup.

### 4. Architecture and maintainability

Judge against the repository’s actual architecture, not a generic pattern. Look for wrong-layer logic, circular dependencies, duplicated abstractions, unnecessary complexity, hidden coupling, unclear names, and difficult-to-test behavior.

### 5. Security, privacy, and operational risk

As applicable, inspect secrets, PII, authorization, permission scope, file paths, external intents/URLs, input validation, billing/ads, logging, storage, and destructive actions.

### 6. Validation and documentation

- Is evidence fresh and relevant to the claim?
- Are important failure paths covered by policy-allowed checks?
- Are OpenSpec/opsx, docs, comments, migrations, and release notes synchronized when required?

## Findings

Report only useful findings. Automated formatting/lint should not become manual nitpicking unless it reveals a real risk.

Each finding:

```yaml
severity: Blocker | High | Medium | Low
blocking: true | false
file: path
location: line-or-symbol
violated_requirement: AC-id-or-rule
problem: ""
evidence: ""
consequence: ""
recommendation: ""
```

Severity meaning:

- `Blocker`: unsafe to deliver or impossible to verify.
- `High`: likely incorrect behavior, security/privacy issue, data loss, major regression, or unmet acceptance criterion.
- `Medium`: maintainability, edge-case, UX, performance, or docs problem that should be corrected.
- `Low`: non-blocking improvement with clear value.

## Verdict

Use only `PASS`, `REWORK`, or `BLOCKED` as defined by the orchestration skill. Do not say “looks good” without stating what was reviewed and what remains unverified.
