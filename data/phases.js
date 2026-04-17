// 90-Day Launch Plan — Illumios Academia execution model
// Last reviewed: 2026-04-17
// ✅ = confirmed done | 🔴 = blocked | 🟡 = in progress | ⚠️ = pending

export const PHASES = [
  {
    name: 'Phase 1',
    subtitle: 'Founding Cohort Launch Readiness',
    dates: 'Apr 14 – Apr 30',
    active: true,
    tasks: [
      'illumios.com live ✅',
      'admin.illumios.com live on Vercel ✅',
      'AI Roadmap Quiz published ✅',
      'Website founding-cohort / priority-list flow implemented in code ✅',
      'Create website GHL waitlist workflow + inbound webhook ⚠️',
      'Add website Vercel env vars and deploy waitlist flow ⚠️',
      'Decide GHL-only vs GHL + Supabase backup for website leads ⚠️',
      'Convert Hub PRD into implementation plan ⚠️',
      'Choose Zoom Webinar vs Google Meet pilot for Cohort 1 ⚠️',
      'Set up admin tracking for leads, calls, enrollments, attendance, feedback, and testimonials ⚠️',
      'Choose Prospecting Website Builder persistence + deployment target ⚠️',
      'Recruit the first Illumios Academia cohort from the waitlist and warm network ⚠️',
    ],
    notes: `Phase 1 is now about operationalizing the polished pre-launch stack.
Admin is already live. The highest-leverage move is to wire the website waitlist handoff, then move the Hub from PRD into implementation, then use the waitlist to drive first-cohort recruitment.`,
  },
  {
    name: 'Phase 2',
    subtitle: 'Hub Foundation & Operator Systems',
    dates: 'May 1 – May 21',
    active: false,
    tasks: [
      'Scaffold the first Hub app slice on Next.js + TypeScript + Supabase + Vercel',
      'Configure Hub Vercel project and domain path for hub.illumios.com',
      'Configure Supabase project for the Hub',
      'Define Hub route map, auth model, schema, and session unlock rules',
      'Implement attendance confirmation and private question intake flows',
      'Replace Prospecting Website Builder seeded data with real persistence',
      'Define Facebook-first ingestion and AI qualification service interface',
      'Add admin views for cohort attendance, feedback, and testimonial capture',
    ],
    notes: `Phase 2 turns the Hub from a concept into a real product surface and turns internal operator tooling into something durable.
Do not overbuild. Lock the first production-safe foundation before adding feature sprawl.`,
  },
  {
    name: 'Phase 3',
    subtitle: 'Deliver Cohort 1',
    dates: 'May 22 – Jun 20',
    active: false,
    tasks: [
      'Run the first live Illumios Academia cohort',
      'Track attendance, questions, and follow-up inside the operator stack',
      'Publish replays, worksheets, and participant updates through the Hub',
      'Collect participant feedback and identify friction points',
      'Capture at least 2 testimonials or case-study candidates',
      'Offer next-step enrollment, upsell, or follow-on support to strong participants',
    ],
    notes: `Phase 3 is about proof.
Use live delivery to learn what participants actually need, then feed that back into the website, Hub, and admin surfaces.`,
  },
  {
    name: 'Phase 4',
    subtitle: 'Refine, Scale, and Systemize',
    dates: 'Jun 21 – Jul 20',
    active: false,
    tasks: [
      'Run a second cohort or open the next enrollment window',
      'Publish the first public case study or testimonial-driven website proof',
      'Build live-data dashboard widgets after the GHL private integration key is set',
      'Decide whether to migrate illumios.com from GitHub Pages to Vercel',
      'Harden Prospecting Website Builder into a usable internal growth system',
      'Create repeatable delivery, enrollment, and operator SOPs',
    ],
    notes: `Phase 4 turns the first working stack into a repeatable machine.
By the end of this phase, Illumios should have a proven cohort motion, a live member surface, and a clearer operator stack behind growth and delivery.`,
  },
];
