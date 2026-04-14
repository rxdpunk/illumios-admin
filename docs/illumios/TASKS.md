# Tasks

## Current Priority
- [ ] **Ship `Illumios Academia` as the main offer across website, admin, and quiz**
  - 📝 Public subtitle: `AI for Small Business Owners: Your First 30 Days`
  - 📝 Default founding-member target price: `$497` with room to test
  - 📝 Discovery calls support enrollment; they are not the primary product message

## Today
- [ ] **Lock the public offer messaging stack** - final one-sentence promise, headline, CTA, and enrollment framing for `Illumios Academia`
- [ ] **Align the quiz to the main offer** - outcome copy and CTA should route qualified people toward the program, not a generic services conversation
- [x] **Choose the primary enrollment path** - current path is website application → fit quiz → enrollment call
- [ ] **Test Maya voice AI with offer-first positioning** - live call to verify AI disclosure, routing, and education-first messaging
  - 📝 Some broken routing for a workflow was left unfinished — exact issue unknown, needs investigation

## This Week
- [ ] **Write the invitation / simple sales page copy** - one concise public asset that sells the current offer clearly
- [ ] **Wire website application → GHL contact capture** - the site now gates quiz entry behind name/email, but the server-side handoff still needs to create or update a real contact
  - 📝 Current implementation is prepared for a HighLevel Inbound Webhook. Paste the workflow URL into `illumios-website/ghl-config.js`.
- [ ] **Wire quiz form → GHL contact** - quiz completions should create or update contact, tag for offer interest, and trigger the right follow-up
  - 📝 Quiz is live at quiz.illumios.com and now receives prefilled data from the website application gate. Paste the same workflow URL into `illumios-quiz/ghl-config.js`.
- [ ] **Set up admin tracking for program operations** - dashboard should show program leads, booked calls, enrollments, attendance, feedback, and testimonials
- [ ] **Build the first delivery materials** - finalize the 4 session titles plus Session 1 outline and worksheet first
- [ ] **Recruit the first cohort** - invite warm contacts, talk leads, and local-network prospects into the program
- [ ] **File the New Jersey LLC** - this is the current formation direction
- [ ] **Complete GHL affiliate signup** - needed before Module 4 of curriculum goes live
  - 📝 GHL offers 40% recurring affiliate commission. Sign up at highlevel.com/affiliate-program, get link, place at Module 4
- [ ] **Verify sales pipeline naming in GHL** - cosmetic cleanup, may already be done
- [ ] **GHL Private Integration key setup** - needed to power live-data widgets in admin dashboard (pipeline, conversations, new leads, calls today)
  - 📝 GHL → Settings → Integrations → Private Integration → create key scoped to Location ID OZuyOTAOTmf8eXnn8n0G. Store in admin dashboard settings page.

## Later
- [ ] **GHL Workflow: Morning Briefing** - time trigger 7:30am → internal email to steve@ + sunshine@ with yesterday's new contacts, unread conversations, today's appointments
- [ ] **GHL Workflow: Discovery Call Prep Brief** - appointment trigger 30min before → email host with contact name, tags, GHL notes link
- [ ] **GHL Workflow: Dead Lead Revival** - contact trigger: tag `warm-lead` + last activity > 14 days → create task + add tag `needs-follow-up`
- [ ] **GHL Workflow: Weekly Digest** - Sunday 6pm trigger → email week's lead count, calls, appointments to both founders
- [ ] **GHL Workflow: Content Reminder** - MWF 9am → SMS to Steve + Sunshine with a one-line content prompt
- [ ] **Dashboard live-data widgets** - build after GHL Private Integration key is set up: Academia Leads, Open Conversations, New Leads Today, Discovery Calls Today, Maya Call Log
- [ ] **Pass 2: private illumios-data repo + fine-grained PAT** - GitHub-as-database backend for admin dashboard persistent storage (after GHL widgets work)

## Waiting On
- [ ] **A2P SMS campaign carrier approval** - no ETA, calls work now

## Done
- [x] **Admin dashboard modular refactor** - complete. Gridstack.js widget grid, drag/resize/add/remove, 4 live widgets (Tasks, Log, Plan, Quick Links). Deployed to admin.illumios.com
- [x] **Publish AI Roadmap Quiz to quiz.illumios.com** - deployed via GitHub Pages (rxdpunk/illumios-quiz) + Namecheap CNAME. DNS propagated globally. SSL auto-provisioned.
- [x] **Activate DKIM** - completed, confirmed active
- [x] **illumios.com live** - GitHub Pages, auto-deploys from rxdpunk/illumios-website
- [x] **GHL sub-account configured** - workflows, pipelines, Maya AI, contacts imported
- [x] **A2P 10DLC brand approved** - SMS campaign pending carrier (separate item)
- [x] **Maya AI Voice Receptionist live** - GPT-4o, phone active, 7 during-call actions
- [x] **Google Workspace email** - steve@, sunshine@, info@ active. MX records set.
