// Living Business Plan — editable PRD-aligned sections, saved to localStorage.
// Steve and Sunshine's live operating document for Illumios.
import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;

const STORAGE_KEY = 'biz-plan/sections';
const VERSION_KEY = 'biz-plan/version';
const PLAN_VERSION = '2026-04-17-cross-project-v1';

const DEFAULT_SECTIONS = [
  {
    id: 's-purpose',
    title: 'Purpose',
    content: `Illumios needs a real first product, not a giant polished academy before customers exist.

The first product is a focused live training program that helps a specific kind of customer get one real result quickly.

The first cohort exists to validate demand, test pricing, refine the curriculum, generate testimonials, and identify what should become the long-term Illumios Academia offer.`,
  },
  {
    id: 's-summary',
    title: 'Product Summary',
    content: `Canonical offer name:

Illumios Academia

Public-facing subtitle:

AI for Real Work: Your First 30 Days

Illumios will launch a live training program for small business owners who want to use AI to save time, reduce busywork, and operate more effectively without hiring more staff.

This is the first paid learning product for Illumios and the current main offer across website, admin, and quiz.

Current launch posture:
- website is shifting to a founding-cohort / priority-list front door
- admin is live on Vercel as the internal operating dashboard
- hub.illumios.com is the planned private participant portal
- the immediate goal is to turn interest into a real Cohort 1 waitlist, then enrollment`,
  },
  {
    id: 's-target',
    title: 'Target Customer',
    content: `Primary audience:
- small business owners
- operators
- solo or lean-team entrepreneurs

They are curious about AI, believe it could help their business, are not advanced users, and want practical help instead of theory.

Secondary audience:
- office managers
- fractional operators
- growth-minded local business owners

Not the audience:
- enterprise teams
- highly technical builders
- people looking for done-for-you services
- people who only want free generic AI tips`,
  },
  {
    id: 's-problem',
    title: 'Problem Statement',
    content: `Many small business owners know AI matters, but they do not know where to start, which tools to trust, or how to use AI in a way that creates real business value.

Common pain points:
- too much administrative work
- inconsistent follow-up and communication
- no repeatable process for using AI in daily work
- confusion about prompts, tools, and automation
- fear of wasting time on hype instead of getting a result

They do not need endless tutorials. They need a guided path to one meaningful win.`,
  },
  {
    id: 's-offer',
    title: 'Offer',
    content: `Offer:
A small-group live training experience for business owners who want to begin using AI in practical ways immediately.

Recommended format:
- 4 live sessions
- 90 minutes per session
- delivered over 2 weeks
- small live cohort
- optional office hours or Q&A support between sessions

Suggested cohort size:
- minimum: 4
- target: 6 to 10
- maximum: 12`,
  },
  {
    id: 's-pricing',
    title: 'Pricing & Promise',
    content: `Recommended initial pricing:

- low test: $297
- target test: $497
- upper test: $697

Default recommendation:
Launch at $497

Core promise:
Illumios helps small business owners use AI to save time, reduce busywork, and build smarter workflows without needing to become technical experts.

Short version:
Learn how to use AI in your business in 30 days without getting lost in tools, jargon, or hype.`,
  },
  {
    id: 's-curriculum',
    title: 'Curriculum Outline',
    content: `Session 1: AI for Small Business Owners
Output: identify 3 meaningful AI use cases in the participant's business

Session 2: Tools and Prompting
Output: create 3 reusable prompts tailored to the participant's work

Session 3: Build Your First Workflow
Output: create one working AI-supported workflow or repeatable process

Session 4: 30-Day Implementation Plan
Output: leave with a 30-day action plan for continued use`,
  },
  {
    id: 's-scope',
    title: 'MVP Scope',
    content: `In scope:
- one founding cohort
- one simple sales page or concise invitation message
- one clear transformation promise
- 4-session live curriculum
- workbook or guided notes for each session
- one simple onboarding flow
- one feedback survey
- one testimonial capture process

Out of scope:
- a giant evergreen course library
- polished recorded modules
- a full LMS
- dozens of templates before the first cohort runs
- advanced automations for every business type`,
  },
  {
    id: 's-journey',
    title: 'Customer Journey',
    content: `1. Prospect hears about Illumios through a talk, referral, networking event, outreach, or the quiz.
2. Prospect sees a simple invitation to the program or books a discovery call to confirm fit.
3. Prospect understands the promise quickly.
4. Prospect enrolls.
5. Prospect receives onboarding message, schedule, and expectations.
6. Prospect attends live sessions.
7. Prospect completes one meaningful implementation win.
8. Prospect gives feedback and testimonial.
9. Prospect is offered a next-step strategy session or future Academia path after the program.`,
  },
  {
    id: 's-launch',
    title: 'Launch Requirements',
    content: `Must have:
- final offer title
- one-sentence promise
- 4-session outline
- session schedule
- payment method
- simple enrollment flow
- onboarding email or message
- slide deck or facilitator notes for each session
- participant worksheet
- feedback form

Should have:
- landing page
- short FAQ
- testimonial request script
- case study template`,
  },
  {
    id: 's-kpis',
    title: 'Success Metrics',
    content: `Product metrics:
- at least 4 paid participants
- at least 80 percent session attendance
- at least 75 percent of participants complete one implementation win
- average post-program satisfaction of 8/10 or higher

Business metrics:
- at least 2 testimonials
- at least 1 case study candidate
- at least 1 upsell into a strategy session or next-step offer
- at least 1 strong positioning insight worth using in future messaging`,
  },
  {
    id: 's-risks',
    title: 'Risks & Guardrails',
    content: `Risk: the offer feels too broad
Guardrail: keep the promise tied to one audience and one clear result

Risk: the course becomes too big before launch
Guardrail: teach live first and do not build the full academy before the first cohort

Risk: prospects are interested but do not buy
Guardrail: test the promise in real conversations and sell the transformation, not the syllabus

Risk: students get inspired but do not implement
Guardrail: require one specific output from every session`,
  },
  {
    id: 's-next',
    title: 'What To Do Next',
    content: `1. Finalize the one-sentence promise.
2. Lock the canonical offer name and public subtitle.
3. Lock the price.
4. Write the 4 session titles.
5. Draft the invitation message.
6. Build Session 1 first.
7. Invite the first 5 people.`,
  },
  {
    id: 's-open',
    title: 'Open Questions',
    content: `- Which exact audience segment is most likely to buy first?
- Will the first cohort be general small business owners or a narrower niche?
- Will recordings be included?
- Will there be office hours between sessions?
- Will participants get templates or only live instruction in the first cohort?`,
  },
];

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

async function load() {
  const saved = await storage.get(STORAGE_KEY, null);
  const version = await storage.get(VERSION_KEY, null);
  if (saved && Array.isArray(saved) && version === PLAN_VERSION) {
    return saved;
  }
  if (saved && Array.isArray(saved) && version !== PLAN_VERSION) {
    await storage.set('biz-plan/sections-backup', saved);
  }
  await storage.set(STORAGE_KEY, DEFAULT_SECTIONS);
  await storage.set(VERSION_KEY, PLAN_VERSION);
  return DEFAULT_SECTIONS.map(s => ({ ...s }));
}

async function save(sections) {
  await storage.set(STORAGE_KEY, sections);
  await storage.set(VERSION_KEY, PLAN_VERSION);
}

export default {
  id: 'business-plan',
  title: 'Business Plan',
  icon: ICON,
  showInSidebar: true,

  async mount(el) {
    let sections = await load();
    let editingId = null;

    const render = () => {
      el.innerHTML = `
        <div class="biz-plan-shell">
          <div class="biz-plan-header">
            <div>
              <h2 class="biz-plan-title">illumios — Living Business Plan</h2>
              <p class="biz-plan-subtitle">PRD-aligned operating doc. Click any section to edit. Changes save automatically.</p>
            </div>
            <button class="btn-sm btn-primary" id="biz-add-section">+ Add Section</button>
          </div>
          <div class="biz-plan-body">
            ${sections.map((s, i) => `
              <div class="biz-section ${editingId === s.id ? 'biz-editing' : ''}" data-id="${s.id}">
                <div class="biz-section-header">
                  <div class="biz-section-title">${esc(s.title)}</div>
                  <div class="biz-section-actions">
                    <button class="biz-edit-btn task-action-btn" data-id="${s.id}" title="Edit">✏️</button>
                    ${i > 0 ? `<button class="biz-up-btn task-action-btn" data-id="${s.id}" title="Move up">↑</button>` : ''}
                    ${i < sections.length - 1 ? `<button class="biz-dn-btn task-action-btn" data-id="${s.id}" title="Move down">↓</button>` : ''}
                    <button class="biz-del-btn task-action-btn" data-id="${s.id}" title="Delete">✕</button>
                  </div>
                </div>
                ${editingId === s.id
                  ? `<div class="biz-editor">
                      <input class="biz-title-input" data-id="${s.id}" value="${esc(s.title)}" placeholder="Section title">
                      <textarea class="biz-content-ta" data-id="${s.id}" rows="8">${esc(s.content)}</textarea>
                      <div class="biz-editor-btns">
                        <button class="btn-sm btn-primary biz-save-btn" data-id="${s.id}">Save</button>
                        <button class="btn-sm biz-cancel-btn" data-id="${s.id}">Cancel</button>
                      </div>
                    </div>`
                  : `<div class="biz-content">${renderContent(s.content)}</div>`}
              </div>`).join('')}
          </div>
        </div>`;
      bindEvents();
    };

    // Minimal markdown: tables and line breaks
    const renderContent = (text) => {
      const lines = esc(text).split('\n');
      let html = '';
      let inTable = false;
      for (const line of lines) {
        if (line.startsWith('|')) {
          if (!inTable) {
            html += '<table class="biz-table">';
            inTable = true;
          }
          const cells = line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1);
          if (cells.every(c => /^[-:]+$/.test(c.trim()))) continue;
          html += `<tr>${cells.map(c => `<td>${c.trim()}</td>`).join('')}</tr>`;
        } else {
          if (inTable) {
            html += '</table>';
            inTable = false;
          }
          html += line ? `<p>${line}</p>` : '<br>';
        }
      }
      if (inTable) html += '</table>';
      return html;
    };

    const bindEvents = () => {
      el.querySelectorAll('.biz-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          editingId = btn.dataset.id;
          render();
        });
      });
      el.querySelectorAll('.biz-save-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const s = sections.find(x => x.id === id);
          if (!s) return;
          const titleInput = el.querySelector(`.biz-title-input[data-id="${id}"]`);
          const contentTa = el.querySelector(`.biz-content-ta[data-id="${id}"]`);
          if (titleInput) s.title = titleInput.value.trim();
          if (contentTa) s.content = contentTa.value;
          editingId = null;
          await save(sections);
          render();
        });
      });
      el.querySelectorAll('.biz-cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          editingId = null;
          render();
        });
      });
      el.querySelectorAll('.biz-del-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this section?')) return;
          sections = sections.filter(s => s.id !== btn.dataset.id);
          await save(sections);
          render();
        });
      });
      el.querySelectorAll('.biz-up-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = sections.findIndex(s => s.id === btn.dataset.id);
          if (idx > 0) [sections[idx - 1], sections[idx]] = [sections[idx], sections[idx - 1]];
          await save(sections);
          render();
        });
      });
      el.querySelectorAll('.biz-dn-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = sections.findIndex(s => s.id === btn.dataset.id);
          if (idx < sections.length - 1) [sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]];
          await save(sections);
          render();
        });
      });
      const addBtn = el.querySelector('#biz-add-section');
      if (addBtn) addBtn.addEventListener('click', () => {
        const title = window.prompt('Section title:');
        if (!title?.trim()) return;
        const newSection = { id: 's-' + Date.now(), title: title.trim(), content: '' };
        sections.push(newSection);
        editingId = newSection.id;
        save(sections).then(render);
      });
    };

    render();
  },
};
