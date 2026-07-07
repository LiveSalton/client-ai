# Google Play Rules and Heuristics

## Contents

- Metadata limits
- Copy policy risks
- Creative asset policy risks
- Utility app trust checks
- Pre-publish verification

## Metadata limits

Use these checks for draft validation. Verify against current Google Play Console before publishing.

- App name: 30 characters or less.
- Short description: 80 characters or less.
- Full description: 4,000 characters or less.
- Character limits apply to full-width and half-width characters.

## Copy policy risks

Flag and revise copy that contains:

- Repetitive, irrelevant, or unnatural keyword blocks.
- Misleading references to other apps, brands, companies, or products.
- Store performance/ranking claims such as `#1`, `best`, `popular`, awards, or similar claims without approved substantiation.
- Price or promotion claims in title, icon, screenshots, or short description, such as `free`, `discount`, `limited time`, or `no ads`.
- Excessive punctuation, emoji, irrelevant special characters, or all-caps unless part of the brand.
- Claims the app cannot actually perform.
- Anonymous testimonials, fake reviews, fake awards, or unattributed endorsements.

## Creative asset policy risks

For icons, screenshots, feature graphics, and video:

- Represent real app functionality and real in-app experiences.
- Keep text minimal and legible.
- Use separate localized screenshots for each supported language when screenshot text is localized.
- Avoid fake ratings, fake device states, fake security badges, fake awards, rankings, pricing promotions, or unsupported comparisons.
- Avoid impersonation: do not mimic another app icon, logo, developer, or brand relationship.
- Keep assets suitable for a general audience.

## Utility app trust checks

For cleaners, uninstallers, device tools, file tools, battery tools, VPNs, privacy tools, and similar categories:

- Explain permissions in plain language.
- Distinguish local processing from cloud processing.
- Avoid root, system-cleaning, speed-boost, antivirus, or privacy claims unless technically true.
- Do not imply hidden system access or impossible device changes.
- Show exact user benefit: remove unused apps, find large apps, back up APKs, view storage, manage apps, or complete a workflow.
- Make Data safety and privacy wording consistent with the actual Play Console declarations and SDK behavior.

## Pre-publish verification

Before recommending a publish-ready change:

1. Re-check field lengths with `scripts/validate_metadata.py`.
2. Re-read this file for policy risks.
3. If a claim depends on implementation, ask for evidence or mark it as unverified.
4. Tell the user which changes are safe drafts versus which require Play Console review.
5. Ask for explicit confirmation before changing Play Console, launching tests, or updating privacy/Data safety declarations.
