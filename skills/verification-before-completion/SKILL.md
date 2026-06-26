---
name: verification-before-completion
description: Use immediately before claiming work is complete, fixed, passing, review-approved, ready to commit, or ready to deliver; requires fresh policy-authorized evidence for every material claim.
---

# Verification Before Completion

## Iron Law

```text
NO COMPLETION CLAIMS WITHOUT FRESH EVIDENCE.
```

Confidence, prior runs, child-agent reports, and code inspection alone do not prove a runtime/build/test claim.

Adapted from `obra/superpowers` for projects with explicit validation policies.

## Gate

Before any success or completion statement:

1. **Identify the claim.** Examples: build succeeds, tests pass, bug fixed, requirement met, design matches, docs synchronized.
2. **Identify the authorized evidence.** Read `VALIDATION_POLICY`; do not invent or run prohibited commands.
3. **Collect fresh evidence.** Run/read the full authorized command or perform the required manual/static/device check in the current task state.
4. **Read the complete result.** Check exit code, failures, skipped items, warnings, device state, and whether the evidence actually covers the claim.
5. **Inspect artifacts.** Confirm the actual diff/files, not only the child agent’s report.
6. **Map evidence to criteria.** Verify each Product acceptance criterion and required design/project rule.
7. **State the real status.** Claim only what the evidence proves; list unverified items separately.

## Evidence Matrix

| Claim | Sufficient evidence | Not sufficient |
|---|---|---|
| Tests pass | fresh authorized test output with zero relevant failures | old run, “should pass,” partial suite without disclosure |
| Build succeeds | fresh authorized full build exit success | linter, compilation assumption, child report |
| Bug fixed | original reproduction no longer fails plus relevant regression evidence | changed code, plausible explanation |
| Requirement met | criterion-by-criterion artifact/evidence mapping | tests alone when they do not cover the requirement |
| UI/design compliant | inspection against actual design facts plus required device/screenshot/manual checks | generic visual confidence |
| Documentation synchronized | actual changed docs/specs reflect changed behavior | promise to update later |
| Agent completed | actual diff, files, and evidence inspected by parent/Reviewer | child-agent “done” message |

## Policy-Limited Validation

When required validation cannot run because of sandbox, missing environment, unavailable device, permission, or explicit project prohibition:

- do not run around the restriction;
- state the exact unavailable check and reason;
- distinguish static/manual evidence already collected;
- return `BLOCKED` when the missing evidence is mandatory for `PASS`;
- never convert “not verified” into “probably correct.”

## Red Flags

Stop before writing “done,” “fixed,” “passes,” “ready,” “perfect,” or equivalent when:

- the relevant command/check was not performed in the current task state;
- only part of the suite/path was checked;
- a subagent reported success but the parent has not inspected artifacts;
- warnings/failures were ignored;
- requirements were not re-read;
- unverified user paths are hidden.

## Output

```yaml
claims:
  - claim: ""
    evidence: ""
    result: PROVEN | NOT_PROVEN | FAILED
criteria_mapping: []
commands_or_checks_run: []
checks_not_run: []
artifact_inspection: []
verdict: PASS | REWORK | BLOCKED
```
