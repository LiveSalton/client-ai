---
name: interaction-design
description: Use when a UI task includes user actions, state transitions, loading, disabled, selected, empty, error, success, cancellation, retry, recovery, gestures, feedback, or motion; do not use for a static content-only change with no interaction or state impact.
---

# Interaction Design

## Goal

Define complete, understandable, and recoverable client-app interactions. Motion communicates state and causality; it does not decorate or replace feedback.

Adapted from `wshobson/agents` and narrowed for platform-neutral client application design.

## Preconditions

Read Product flow/acceptance criteria, the authoritative design source, current components, and platform constraints. Do not copy Web framework examples into Android, iOS, or Flutter code by analogy.

## Interaction Model

For each user action, define:

```text
trigger -> immediate feedback -> system work -> result -> next available action
```

Cover every applicable branch:

- success;
- validation failure;
- recoverable failure and retry;
- unrecoverable failure and safe exit;
- cancellation/back;
- duplicate tap or repeated submission;
- permission denial and later grant;
- external/system-page handoff and return;
- backgrounding, process interruption, or state restoration;
- offline, slow, or partial data;
- destructive action, confirmation, undo, or irreversible warning.

## State Table

Create a state table for each changed control or surface:

| State | Entry condition | Visible feedback | Allowed actions | Exit condition | Recovery |
|---|---|---|---|---|---|
| Default | | | | | |
| Loading/processing | | | | | |
| Disabled | | | | | |
| Selected/active | | | | | |
| Empty | | | | | |
| Error | | | | | |
| Success | | | | | |

Remove rows that are truly not applicable; do not omit a state merely because implementation is inconvenient.

## Feedback Rules

- Acknowledge input immediately when safe.
- Keep long-running progress visible and cancellable when the operation supports cancellation.
- Never rely on motion alone to communicate success or failure.
- Error messages state what happened, what the user can do, and whether data/action was preserved.
- Prevent duplicate side effects while allowing safe repeated navigation.
- Preserve user intent across retry or return from system UI.

## Motion Rules

- Use motion only for feedback, orientation, focus, or continuity.
- Follow project timing/token rules; do not invent a new motion language.
- Keep transitions interruptible and avoid blocking interaction.
- Respect reduced-motion/accessibility settings and low-performance devices.
- Document platform-specific behavior only when supported by project facts.

## Output

- interaction flow;
- state tables;
- feedback/error copy intent;
- cancellation, retry, and restoration behavior;
- motion purpose and fallback;
- edge cases;
- implementation constraints and acceptance-criterion mapping.
