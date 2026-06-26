---
name: systematic-debugging
description: Use when encountering a bug, crash, test failure, build failure, performance problem, integration issue, or unexpected behavior, before proposing or applying a fix.
---

# Systematic Debugging

## Iron Law

```text
NO FIXES WITHOUT ROOT-CAUSE INVESTIGATION FIRST.
```

Random changes create noise and hide causality. A plausible symptom is not a root cause.

Adapted from `obra/superpowers` while respecting the project’s validation and write policy.

## Phase 1: Establish Evidence

Before changing code:

1. Read the complete error, stack trace, failing output, logs, and relevant warnings.
2. Record exact reproduction steps and observed vs expected behavior.
3. Determine reproducibility. If intermittent, collect timing, lifecycle, environment, and state evidence.
4. Inspect current diff, recent changes, dependency/config/environment differences, and working baselines.
5. Trace the bad value/event backward across component boundaries until its origin is identified.
6. In multi-component flows, inspect inputs, outputs, configuration, and state at each boundary.

If the issue cannot be reproduced or localized, gather more evidence; do not guess.

## Phase 2: Compare Patterns

- Find the nearest working example in the same repository.
- Read the complete relevant path, not only the failing line.
- List every meaningful difference between working and failing cases.
- Identify hidden assumptions, lifecycle dependencies, thread/context requirements, and environment conditions.

## Phase 3: Test One Hypothesis

Write one falsifiable statement:

```text
I believe <root cause> because <evidence>; if true, <minimal observation/change> will produce <result>.
```

Then:

- change or instrument one variable;
- use the smallest authorized experiment;
- read the full result;
- accept or reject the hypothesis;
- do not stack additional guesses on a failed experiment.

When uncertain, state what is not understood and gather targeted evidence.

## Phase 4: Implement and Verify

1. Create the smallest regression reproduction permitted by `VALIDATION_POLICY`.
2. Apply one fix at the root cause, with no unrelated cleanup.
3. Re-run the original reproduction and relevant regression checks.
4. Confirm no new failure was introduced.
5. Record evidence and remaining uncertainty.

If the project forbids adding/running tests, use authorized manual, device, log, or static evidence and explicitly report the missing automation. Do not claim a prohibited check ran.

## Failed-Fix Threshold

After three failed fix attempts, stop. Re-open root-cause analysis and question the architecture/assumptions with Product/Reviewer rather than attempting a fourth speculative patch.

## Stop Signals

Stop and return to Phase 1 when thinking:

- “just try this”;
- “it is probably X” without evidence;
- “one more fix” after repeated failures;
- “I can test later”;
- “multiple changes will save time”;
- “the reference is close enough.”

## Output

- reproduction;
- evidence collected;
- hypotheses tested and results;
- confirmed root cause;
- minimal fix;
- fresh verification;
- unresolved uncertainty and follow-up.
