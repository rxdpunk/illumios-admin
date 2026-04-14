# CLAUDE.md

Guidance for Claude when working in the `illumios` repo.

## Project Overview

**illumios** (pronounced ih-LOO-mee-os) is an **education-first AI company for small business owners** run by Steve Sposato (NJ) and Sunshine Pagan (SC). The current priority is to launch and fill **Illumios Academia**, the live training offer that should be reflected across the website, admin, and quiz surfaces.

**Active phase:** Offer launch and founding-cohort alignment (as of April 14, 2026).
**Repo source of truth:** [planning/illumios-operating-directives.md](/Users/sposato/Dev_Projects/illumios/planning/illumios-operating-directives.md) → [planning/illumios-academia-prd.md](/Users/sposato/Dev_Projects/illumios/planning/illumios-academia-prd.md) → [TASKS.md](/Users/sposato/Dev_Projects/illumios/TASKS.md).
**Broader background source:** the Obsidian wiki at `/Users/sposato/Documents/Dev_Projects/wiki/` — start by reading `wiki/hot.md` then `wiki/index.md`.

## Active Offer Stack

| Offer | Status | Notes |
|---|---|---|
| Illumios Academia | Active priority | Public subtitle: `AI for Small Business Owners: Your First 30 Days` |
| Discovery Call | Support CTA | Qualification and enrollment conversation for the program |
| Strategy Session | Secondary offer | Use as upsell or high-intent next step, not the front-door offer |
| GHL affiliate commissions | Later-stage monetization | 40% recurring, placed after student outcomes are clear |

Top-of-funnel: free in-person talks at Chamber, BNI, and libraries; "Pain Point Audit" 5-question lead magnet; Audit Breakfast format.

## GHL Sub-Account

- **Location ID:** `OZuyOTAOTmf8eXnn8n0G`
- **API base:** `https://services.leadconnectorhq.com`
- **MCP endpoint:** `https://services.leadconnectorhq.com/mcp/`
- Always pass `Version: 2021-04-15` header.
- Workflows have no API endpoint — `POST /workflows/` 404s. All workflow creation is manual in the GHL UI.

### Key IDs

| Resource | Name | ID |
|---|---|---|
| Calendar | illumios Discovery Call (30-min, round robin) | `5LenLGMDU1YJOGBbIAkw` |
| Booking URL | Discovery Call | `https://api.leadconnectorhq.com/widget/booking/illumios-discovery-call` |
| Quiz page builder | AI Roadmap Quiz | `https://app.gohighlevel.com/page-builder/kOxTXDupO2Y9gE6JqZD2` |
| Quiz public URL | quiz.illumios.com | `https://quiz.illumios.com` |

## What's Built

### Maya AI Voice Receptionist (GHL Voice AI)
- Installed from GHL marketplace template, powered by GPT-4o.
- Phone number active, A2P brand approved, SMS campaign pending carrier approval (calls work now).
- Current prompt: `outputs/maya-prompt.txt` (paste into GHL Voice AI → Maya → Agent Goals → Prompt).
- Prompt features: identifies as AI when asked; describes Illumios as an education-first AI company with a live training offer for small business owners; Node 1 checks `{{contact.customer_status}}` before asking new vs existing; prank-call detection; phonetic pronunciation of "illumios".
- **During-call actions (7):**
  - Support Ticket → triggers *Voice Agent Support Notification* workflow
  - Appointment Booking → *illumios Discovery Call* calendar
  - Field capture: First Name, Last Name, Email, Business Name
  - Send SMS (Node 8) — fires when caller consents to receive info
  - Trigger Workflow (Node 8) — enrolls contact in *Warm Lead Nurture Sequence*
- **After-call actions:** intentionally minimal (SMS requires consent). See `outputs/maya-after-call-setup.md`.

### Workflows
1. **Voice Agent Support Notification** — trigger: tag `support ticket` added → internal email to info@illumios.com.
2. **Warm Lead Nurture Sequence** — trigger: tag `info-requested` added → SMS immediately → wait 2 days → follow-up SMS → wait 5 days → final SMS → tag `nurture-complete`.

### Custom Fields
- **Customer Status** (dropdown): Active Client, Warm Lead, Lead, Cold. Used by Maya as `{{contact.customer_status}}` for smart routing.

### Contacts
- 232 iPhone contacts imported from `contacts_import.csv`, tagged `personal-network`, **no workflows attached** (TCPA compliance).

### Pipelines
- Sales Pipeline (7 stages: Prospect → Converted to Paid)
- Client Delivery Pipeline (7 stages: Onboarding → Upsell)
- Lead Management Pipeline (11 stages)
- Marketing Pipeline (6 stages)

### AI Roadmap Quiz
- Standalone HTML at `outputs/illumios-quiz.html` (~45KB).
- 9 screens: intro → 8 questions → personalized 7-slide deck.
- Branding: navy `#0D1B4B`, orange `#F26522`, Nunito font.
- Public deployment is now centered on `quiz.illumios.com`.
- Current directive: quiz messaging and outcomes should route qualified leads toward **Illumios Academia**, not a generic services conversation.
- **Status:** public quiz is live, but the lead handoff and offer positioning still need tightening.

### Obsidian Wiki
- Vault root: `/Users/sposato/Documents/Dev_Projects/wiki/`
- Web clipper configured; clippings land in `raw/`.
- Protocol for ingest/query/lint is in `/Users/sposato/Documents/Dev_Projects/CLAUDE.md`.

## Pending / In Progress

| Task | Status | Notes |
|---|---|---|
| Align website, admin, and quiz around Illumios Academia | 🔴 Active priority | This is the current cross-thread directive |
| Package the offer for public enrollment | 🔴 Active priority | Lock promise, CTA, enrollment path, and core sales copy |
| Wire quiz form → GHL contact + offer routing | 🟡 Pending | Tag, segment, and hand off quiz leads cleanly |
| Test Maya with updated offer-first prompt | 🟡 Pending | Verify AI disclosure, routing, and education-first positioning |
| GitHub connection | 🟡 New | PAT or SSH key setup for rxdpunk |
| Maya After-Call actions | 🟡 Partial | Minimal by design (SMS needs consent) |
| A2P SMS Campaign | 🟡 Waiting | Carrier approval in progress, no ETA |
| New Jersey LLC filing | ⚠️ Pending | This replaces the old Wyoming default |
| GHL affiliate signup | ⚠️ Pending | Not yet completed |

## Key Files

- `outputs/maya-prompt.txt` — full Maya Agent Goals prompt
- `outputs/illumios-quiz.html` — complete quiz funnel
- `outputs/maya-after-call-setup.md` — SMS templates and after-call config guide
- `../contacts_import.csv` — 232 contacts (already imported)

## Sibling Repos (under `Dev_Projects/`)

- `illumios-website/` — marketing site (github.com/rxdpunk/illumios-website), GitHub Pages, CNAME → illumios.com
- `illumios-admin/` — admin portal (github.com/rxdpunk/illumios-admin), GitHub Pages, CNAME → admin.illumios.com
- `illumios-quiz/` — public quiz experience (github.com/rxdpunk/illumios-quiz), GitHub Pages, CNAME → quiz.illumios.com
- `wiki/` — Obsidian vault for broader research, source material, and background context

## Other Components in This Repo

### Remotion Video (`blue-collar-ai-recap-src/`)
React + TypeScript video built with Remotion. Entry: `src/Root.tsx`; main composition `src/Recap.tsx` (5 scenes, 900 frames at 30fps = 30s).
```bash
cd blue-collar-ai-recap-src
npm install
npm start        # dev preview
npm run build    # render
```

### Idea Agent (standalone — `../Idea_Agent/`)
Reads iMessages from self-chat, classifies via Claude, generates feedback, writes `data/latest-ideas.json` for Mission Control IDEAS tab. See `../Idea_Agent/CLAUDE.md`.

## Brand
- Navy `#0D1B4B`
- Orange `#F26522`
- Font: Nunito
- Pronunciation: ih-LOO-mee-os
