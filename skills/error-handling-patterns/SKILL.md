---
name: error-handling-patterns
description: Use when implementing or reviewing failure-prone client behavior involving network, files, storage, permissions, system APIs, billing, ads, parsing, async work, concurrency, lifecycle interruption, retries, or user-visible errors; do not use when no meaningful failure path is in scope.
---

# Error Handling Patterns

## Goal

Build explicit, observable, recoverable failure behavior without hiding root causes or leaving the UI in an impossible state.

Adapted from `wshobson/agents` for client applications.

## Classify First

Classify each failure before choosing a mechanism:

- expected user/input failure;
- expected domain rejection;
- transient external failure;
- permanent external failure;
- permission/policy denial;
- cancellation;
- lifecycle/process interruption;
- programmer invariant violation;
- unrecoverable runtime failure.

## Choose a Strategy

For each category, decide explicitly:

- validate and reject early;
- return a typed result/state;
- throw/propagate to a boundary that can handle it meaningfully;
- retry with bounded policy and idempotency protection;
- fall back or degrade;
- ask the user for a corrective action;
- cancel safely;
- fail fast for violated programmer invariants.

Do not retry permanent failures or non-idempotent side effects blindly.

## Preserve Context

Developer evidence should preserve:

- original cause;
- operation and relevant identifiers without leaking secrets/PII;
- layer/boundary where failure occurred;
- retry/cancellation state;
- timestamps or correlation context when the project supports them.

Avoid empty catches, generic “something went wrong” logs, duplicate logging at every layer, and swallowed async errors.

## User-State Contract

For every user-visible failure, define:

- message intent: what happened and what can be done;
- whether user input/data was preserved;
- available retry, settings, cancel, back, or support action;
- UI state after dismissal/navigation;
- behavior when the operation later completes or returns from system UI;
- duplicate-action protection.

## Lifecycle and Concurrency

Check:

- callbacks/results arriving after a screen is gone;
- cancellation propagation;
- repeated taps or parallel requests;
- stale results overwriting newer state;
- process recreation/state restoration;
- partial file/write operations and cleanup;
- atomicity/idempotency where side effects matter.

## Verification

Create the smallest policy-allowed evidence for each important failure path: automated test, controlled simulation, device/manual steps, logs, or static proof. Distinguish verified from unverified paths.

## Output

```yaml
failure_categories: []
handling_by_category: []
user_feedback_and_recovery: []
logging_and_context: []
lifecycle_concurrency_checks: []
validation_evidence: []
unverified_paths: []
```
