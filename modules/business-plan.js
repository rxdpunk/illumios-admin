// Living Business Plan — editable markdown-like sections, saved to localStorage.
// Steve and Sunshine's live operating document for illumios.
import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;

const STORAGE_KEY = 'biz-plan/sections';

const DEFAULT_SECTIONS = [
  {
    id: 's-mission',
    title: 'Mission',
    content: `illumios (ih-LOO-mee-os) is an AI education and consultation company. We teach individuals, entrepreneurs, and small business owners how to leverage AI tools themselves — increasing efficiency, reducing overhead, and unlocking new revenue streams.

We are NOT a done-for-you agency. We give people the knowledge and systems to run AI-powered businesses on their own.`,
  },
  {
    id: 's-model',
    title: 'Business Model',
    content: `| Offering | Price |
|---|---|
| Illumios Academia (intro) | $497 |
| Illumios Academia (full) | $997 |
| Live Cohort | $1,497 |
| Strategy Session | $497 |
| GHL Affiliate Commission | 40% recurring |

Top-of-funnel: free in-person talks at Chamber, BNI, and libraries. Pain Point Audit 5-question lead magnet. Audit Breakfast format.`,
  },
  {
    id: 's-target',
    title: 'Target Market',
    content: `Primary: SMB owners in NJ and SC (Steve + Sunshine local markets) who are curious about AI but don't know where to start.

Secondary: Entrepreneurs and solo professionals who want to automate repetitive work.

Psychographic: They've heard of ChatGPT, maybe tried it once, but don't know how to make it work for their business. They're busy, skeptical of tech, and need to see ROI fast.`,
  },
  {
    id: 's-channels',
    title: 'Go-to-Market Channels',
    content: `1. In-person talks — Chamber of Commerce, BNI, libraries (free, builds trust fast)
2. AI Roadmap Quiz — quiz.illumios.com (personalized 7-slide deck, books discovery call)
3. Maya AI Receptionist — 24/7 call capture, books discovery calls automatically
4. Warm-network outreach — Steve's 232 imported contacts (educational, no cold pitch)
5. GHL affiliate — passive income from students who subscribe to GHL at Module 4`,
  },
  {
    id: 's-tech-stack',
    title: 'Tech Stack',
    content: `| Tool | Purpose |
|---|---|
| GoHighLevel (GHL) | CRM, calendar, workflows, funnels, Maya AI |
| Maya AI (GHL Voice AI) | 24/7 phone receptionist, books discovery calls |
| Claude (Anthropic) | AI assistant, content generation, automation |
| GitHub Pages | illumios.com + admin.illumios.com hosting |
| Namecheap | Domain registrar (illumios.com + subdomains) |
| Google Workspace | Email (@illumios.com), Drive, Calendar |`,
  },
  {
    id: 's-kpis',
    title: 'Key Metrics & KPIs',
    content: `Phase 1 (Foundation) — by Apr 19, 2026:
- All infrastructure live (website, GHL, Maya, DKIM)
- AI Roadmap Quiz published and tracking leads
- Wyoming LLC filed

Phase 2 (In-Person Funnel) — Apr 20 – May 4:
- 2 BNI chapter visits
- 1 library talk booked
- 2–3 discovery calls booked

Phase 3 (First Students) — May 5 – Jun 3:
- 3–5 Academia beta enrollments
- First testimonial captured
- GHL affiliate link live

Phase 4 (Scale) — Jun 4 – Jul 4:
- Audit Breakfast format codified
- Academia v1 open enrollment live
- First affiliate commission received`,
  },
  {
    id: 's-notes',
    title: 'Notes & Open Questions',
    content: `- Wyoming LLC formation pending Sunshine sign-off
- Pricing is experiments — document what works as students enroll
- A2P SMS carrier approval pending (calls work now)
- GHL affiliate signup still needs to be completed before Module 4 goes live`,
  },
];

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function load() {
  const saved = await storage.get(STORAGE_KEY, null);
  return saved || DEFAULT_SECTIONS.map(s => ({...s}));
}

async function save(sections) { await storage.set(STORAGE_KEY, sections); }

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
              <p class="biz-plan-subtitle">Click any section to edit. Changes save automatically.</p>
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
          if (!inTable) { html += '<table class="biz-table">'; inTable = true; }
          const cells = line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1);
          if (cells.every(c => /^[-:]+$/.test(c.trim()))) continue;
          html += `<tr>${cells.map(c => `<td>${c.trim()}</td>`).join('')}</tr>`;
        } else {
          if (inTable) { html += '</table>'; inTable = false; }
          html += line ? `<p>${line}</p>` : '<br>';
        }
      }
      if (inTable) html += '</table>';
      return html;
    };

    const bindEvents = () => {
      el.querySelectorAll('.biz-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => { editingId = btn.dataset.id; render(); });
      });
      el.querySelectorAll('.biz-save-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const s = sections.find(x => x.id === id);
          if (!s) return;
          const titleInput = el.querySelector(`.biz-title-input[data-id="${id}"]`);
          const contentTa  = el.querySelector(`.biz-content-ta[data-id="${id}"]`);
          if (titleInput) s.title = titleInput.value.trim();
          if (contentTa)  s.content = contentTa.value;
          editingId = null;
          await save(sections);
          render();
        });
      });
      el.querySelectorAll('.biz-cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => { editingId = null; render(); });
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
          if (idx > 0) [sections[idx-1], sections[idx]] = [sections[idx], sections[idx-1]];
          await save(sections); render();
        });
      });
      el.querySelectorAll('.biz-dn-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = sections.findIndex(s => s.id === btn.dataset.id);
          if (idx < sections.length - 1) [sections[idx], sections[idx+1]] = [sections[idx+1], sections[idx]];
          await save(sections); render();
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
