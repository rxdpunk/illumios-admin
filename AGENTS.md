# AGENTS.md

## Repo Role

This repository powers the internal admin dashboard for `admin.illumios.com`.

It is a lightweight client-side application built with plain HTML, CSS, and ES modules. There is no bundler in the current setup.

## Product Context

The admin dashboard should support the current company priority:

- launch and fill `Illumios Academia`

The dashboard should help track leads, qualified quiz takers, booked calls, enrollments, attendance, feedback, testimonials, and related program operations.

## Source Of Truth

Business and offer direction live in the sibling planning repo:

- `/Users/sposato/Dev_Projects/illumios/planning/illumios-operating-directives.md`
- `/Users/sposato/Dev_Projects/illumios/planning/illumios-academia-prd.md`
- `/Users/sposato/Dev_Projects/illumios/TASKS.md`

This repo also mirrors source docs into the admin docs library through:

- `scripts/sync-illumios-docs.mjs`

Run that sync script when the docs vault, docs manifest, or in-app document library should reflect changes from the main `illumios` repo.

## Architecture Notes

- `index.html` contains the sign-in gate and the inline auth script.
- `app.js` bootstraps the modular app after auth succeeds.
- `modules/` contains page-level dashboard modules.
- `core/` contains shared app infrastructure such as the registry, router, and storage abstraction.
- `data/` contains seeded app data and generated docs artifacts.
- `assets/styles.css` holds the main styling.

## Critical Rules

- Do not casually modify the inline auth block in `index.html`.
- Respect the note in `app.js`: auth lives in `index.html`, and `app.js` is post-auth bootstrap only.
- Preserve the modular ES-module structure; prefer extending modules over adding inline script sprawl.
- Keep the current no-build workflow unless the user explicitly requests a tooling migration.
- `core/storage.js` is intentionally a localStorage adapter for now; preserve its API shape if changing persistence.
- If you change the docs experience, verify compatibility with `data/docs-manifest.js`, `data/docs-vault.js`, and the sync script.

## Working Rules

- Prioritize operational usefulness over visual novelty.
- Keep the dashboard aligned to program operations for `Illumios Academia`, not a generic business dashboard.
- Prefer additive, maintainable module changes over one-off hacks.
- If a task touches synced docs, remember there are generated files in `data/` and a source repo dependency.
- Preserve `CNAME` and the GitHub Pages deployment assumptions unless the hosting model explicitly changes.

## Practical Workflow

- For docs-library refreshes, run `node scripts/sync-illumios-docs.mjs`.
- For UI changes, inspect both `index.html` and the relevant module file before editing.
- If a requested feature depends on live GHL data, note whether it is blocked on private integration credentials or currently using local/browser storage.
