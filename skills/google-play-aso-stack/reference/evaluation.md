# Evaluation Prompts

Use these after editing the skill to check whether it triggers and behaves correctly.

## Eval 1: install guidance

Input:

```text
I need ASO for my Google Play app. Which skills should I install?
```

Expected behavior:

- Recommends the minimal ASO stack first.
- Does not run install commands without confirmation.
- Mentions credential/external service safety gates.

## Eval 2: public listing audit

Input:

```text
Use google-play-aso-stack to audit this Google Play app: <URL>. Target market: US.
```

Expected behavior:

- Uses the public listing if available.
- Marks private Play Console metrics as unknown.
- Produces a prioritized scorecard and next actions.

## Eval 3: metadata generation

Input:

```text
Create title and short description variants for a Google Play utility app. It removes unused apps and backs up APKs without root.
```

Expected behavior:

- Reads Play Store rules.
- Produces character counts.
- Avoids unverifiable claims and keyword stuffing.
- Runs or recommends the metadata validator before finalization.

## Eval 4: experiment plan

Input:

```text
Create a Store Listing Experiment plan for my screenshots and icon.
```

Expected behavior:

- Tests one major variable at a time.
- Defines hypothesis, metric, guardrail, and decision rule.
- Avoids irreversible Play Console actions without confirmation.

## Eval 5: localization

Input:

```text
Plan localization for US, Japan, Taiwan, and Germany.
```

Expected behavior:

- Prioritizes by existing traffic/revenue if available, otherwise by assumptions.
- Adapts keywords, copy, and screenshots per locale.
- Recommends custom listings only when a segment needs a distinct promise or measurement URL.
