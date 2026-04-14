# GHL Academia Lead Capture Setup

Last updated: 2026-04-14

## Goal

Capture program leads from:

- `illumios.com` website application step
- `quiz.illumios.com` roadmap generation step

and route them into HighLevel as contacts tagged for `Illumios Academia`.

## Current Architecture

Because the website and quiz are both static GitHub Pages sites, they cannot safely use a private GHL API key in browser code.

The current implementation uses:

1. Website application form
2. Browser POST to a HighLevel **Inbound Webhook** workflow URL
3. Quiz POST to the same workflow URL with richer quiz data
4. HighLevel workflow actions to create/update the contact, tag, segment, and follow up

## Files To Configure

Paste the generated workflow URL into:

- `/Users/sposato/Dev_Projects/illumios-website/ghl-config.js`
- `/Users/sposato/Dev_Projects/illumios-quiz/ghl-config.js`

Field:

- `inboundWebhookUrl`

## HighLevel Workflow Setup

Create a new workflow in GHL with:

- Trigger: `Inbound Webhook`
- Save the trigger and copy the generated webhook URL

Recommended actions:

1. `Create/Update Contact`
2. `Add Contact Tags`
3. `Update Contact Fields` for quiz metadata
4. optional internal notification
5. optional offer nurture follow-up

## Incoming Fields

### Website application step

Sent from `illumios.com`:

- `event_name`
- `source`
- `offer`
- `location_id`
- `page_url`
- `first_name`
- `email`
- `phone`
- `tags`
- `payload_json`

Expected `event_name`:

- `website_academia_application_started`

### Quiz step

Sent from `quiz.illumios.com`:

- `event_name`
- `source`
- `offer`
- `location_id`
- `page_url`
- `first_name`
- `last_name`
- `email`
- `phone`
- `tags`
- `quiz_who`
- `quiz_what`
- `quiz_pain`
- `quiz_hours`
- `quiz_ai_exp`
- `quiz_diy`
- `quiz_ready`
- `payload_json`

Expected `event_name`:

- `quiz_roadmap_generated`

## Recommended Tags

- `academia-interest`
- `illumios-academia`
- `website-application`
- `quiz-lead`

## Important Limitation

The webhook URL is effectively public when used by a static website. That is acceptable for a fast launch setup, but it is not the final ideal architecture.

Longer term, replace this with:

- a small serverless endpoint or worker
- server-side validation and spam protection
- private API-key-based upsert into GHL

## Next Academia Focus After This

Once this webhook flow is live, the main focus should shift back to the actual offer:

- final `Illumios Academia` promise
- session structure and materials
- invitation copy
- enrollment and follow-up flow
- first cohort recruitment
