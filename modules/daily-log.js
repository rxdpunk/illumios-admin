// Daily Log module — clean split-panel editor with history sidebar.
import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;

const KEY = 'dailyLog/entries';
const DAILY_LOG_SEED_VERSION_KEY = 'dailyLog/seed-version';
const DAILY_LOG_SEED_VERSION = '2026-04-17-cross-project-v1';
const DAILY_LOG_SEED_TEXT = `Cross-project status:
- Admin: static replica is live on Vercel at admin.illumios.com.
- Website: founding-cohort waitlist flow is implemented in code; blocker is the GHL webhook plus Vercel env vars before deploy.
- Hub: PRD and stack direction are locked; next step is implementation plan then scaffold.
- Prospecting Website Builder: queue-first MVP prototype is working; next step is persistence, ingestion, and deployment decisions.

Highest-leverage next sequence:
1. Create the GHL waitlist workflow and capture the inbound webhook URL.
2. Add the Vercel env vars and deploy the website waitlist flow.
3. Turn the Hub PRD into an implementation plan and scaffold the app.
4. Decide the next persistence + deployment slice for Prospecting Website Builder.`;

function today()   { return new Date().toISOString().slice(0, 10); }
function fmtShort(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtFull(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function seedEntriesIfNeeded(entries) {
  const seededVersion = await storage.get(DAILY_LOG_SEED_VERSION_KEY, null);
  if (seededVersion === DAILY_LOG_SEED_VERSION) return entries;

  const seeded = { ...entries };
  if (!seeded[today()]) seeded[today()] = DAILY_LOG_SEED_TEXT;

  await storage.set(KEY, seeded);
  await storage.set(DAILY_LOG_SEED_VERSION_KEY, DAILY_LOG_SEED_VERSION);
  return seeded;
}

async function getEntries() {
  const modern = await storage.get(KEY, null);
  if (modern) return seedEntriesIfNeeded(modern);
  // Back-compat: try legacy key
  const legacy = storage.legacyGet('mc_logs', null);
  return seedEntriesIfNeeded(legacy || {});
}

let saveTimer = null;

export default {
  id: 'daily-log',
  title: 'Daily Log',
  icon: ICON,
  showInSidebar: true,

  // ── Widget for Home ──────────────────────────────────────
  widgets: [{
    id: 'daily-log-today',
    title: "Today's Log",
    async render(el) {
      const entries = await getEntries();
      const text = entries[today()] || '';

      const outer = document.createElement('div');
      outer.style.cssText = 'display:flex;flex-direction:column;height:100%;gap:8px;padding:4px 0';

      // Header row: date + autosave status
      const headerRow = document.createElement('div');
      headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;flex-shrink:0';
      const dateLbl = document.createElement('div');
      dateLbl.style.cssText = 'font-size:0.78rem;color:var(--muted);font-weight:600';
      dateLbl.textContent = fmtShort(today());
      const savedLbl = document.createElement('span');
      savedLbl.style.cssText = 'font-size:0.72rem;color:var(--green);opacity:0;transition:opacity .3s';
      savedLbl.textContent = '✓ Saved';
      headerRow.append(dateLbl, savedLbl);

      // Inline textarea
      const ta = document.createElement('textarea');
      ta.style.cssText = [
        'flex:1;min-height:0;background:transparent',
        'border:1px solid var(--border);border-radius:6px',
        'color:var(--cream);font-size:0.82rem;line-height:1.6',
        'padding:8px 10px;resize:none;outline:none;font-family:inherit',
        'transition:border-color .15s',
      ].join(';');
      ta.placeholder = 'What did you work on today?';
      ta.value = text;
      ta.addEventListener('focus', () => { ta.style.borderColor = 'var(--orange)'; });
      ta.addEventListener('blur',  () => { ta.style.borderColor = 'var(--border)'; });

      let widgetTimer = null;
      ta.addEventListener('input', () => {
        clearTimeout(widgetTimer);
        widgetTimer = setTimeout(async () => {
          const all = await getEntries();
          all[today()] = ta.value;
          await storage.set(KEY, all);
          savedLbl.style.opacity = '1';
          setTimeout(() => { savedLbl.style.opacity = '0'; }, 1500);
        }, 1000);
      });

      // Footer: Full Log link
      const footer = document.createElement('div');
      footer.style.cssText = 'display:flex;justify-content:flex-end;flex-shrink:0';
      const link = document.createElement('a');
      link.href = '#/daily-log';
      link.className = 'link-btn';
      link.textContent = 'Full Log →';
      footer.appendChild(link);

      outer.append(headerRow, ta, footer);
      el.textContent = '';
      el.appendChild(outer);
    },
  }],

  // ── Full view ────────────────────────────────────────────
  async mount(el) {
    let entries   = await getEntries();
    let activeDay = today();

    const allDays = () => Object.keys(entries).sort().reverse();

    const render = () => {
      const days = allDays();
      const currentText = entries[activeDay] || '';

      el.innerHTML = `
        <div class="daily-log-layout">

          <!-- Editor panel -->
          <div class="log-editor-card">
            <div class="log-editor-header">
              <div class="log-date-label">${fmtFull(activeDay)}</div>
              <div style="display:flex;align-items:center;gap:10px">
                <span class="log-autosave" id="log-status"></span>
                <button class="btn-sm btn-primary" id="log-save-btn">Save</button>
              </div>
            </div>
            <textarea
              class="log-full-textarea"
              id="log-ta"
              placeholder="What did you work on? What moved forward? What's blocked? What's next?&#10;&#10;This is your private scratch pad — write freely."
              spellcheck="true"
            >${esc(currentText)}</textarea>
            <div class="log-editor-footer">
              <span style="font-size:0.75rem;color:var(--muted)">⌘ + Enter to save</span>
              <span id="log-char-count" style="font-size:0.75rem;color:var(--muted)">${currentText.length} chars</span>
            </div>
          </div>

          <!-- History sidebar -->
          <div class="log-history-panel">
            <div class="log-history-header">Past Entries</div>
            <button class="log-new-day-btn ${activeDay === today() ? 'active' : ''}" data-day="${today()}" id="log-today-btn">
              <span class="log-history-day">Today</span>
              <span class="log-history-preview">${entries[today()] ? esc(entries[today()].slice(0,40)) + '…' : 'No entry yet'}</span>
            </button>
            ${days.filter(d => d !== today()).map(d => `
              <button class="log-new-day-btn ${activeDay === d ? 'active' : ''}" data-day="${d}">
                <span class="log-history-day">${fmtShort(d)}</span>
                <span class="log-history-preview">${esc((entries[d] || '').slice(0, 40))}…</span>
              </button>`).join('')}
            ${days.length === 0 ? '<p class="log-empty-history">Start writing — your entries will appear here.</p>' : ''}
          </div>

        </div>`;

      bindEvents();
    };

    const bindEvents = () => {
      const ta        = document.getElementById('log-ta');
      const statusEl  = document.getElementById('log-status');
      const countEl   = document.getElementById('log-char-count');
      const saveBtn   = document.getElementById('log-save-btn');

      const doSave = async (silent = false) => {
        entries = await getEntries();
        entries[activeDay] = ta.value;
        await storage.set(KEY, entries);
        if (!silent) {
          statusEl.textContent = '✓ Saved';
          setTimeout(() => { statusEl.textContent = ''; }, 2000);
        } else {
          statusEl.textContent = 'Autosaved';
          setTimeout(() => { statusEl.textContent = ''; }, 1500);
        }
        // Update sidebar preview for today
        const todayBtn = document.getElementById('log-today-btn');
        if (todayBtn && activeDay === today()) {
          const preview = todayBtn.querySelector('.log-history-preview');
          if (preview) preview.textContent = ta.value ? ta.value.slice(0, 40) + '…' : 'No entry yet';
        }
      };

      ta.addEventListener('input', () => {
        countEl.textContent = ta.value.length + ' chars';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => doSave(true), 1200);
      });

      ta.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          doSave(false);
        }
      });

      saveBtn.addEventListener('click', () => doSave(false));

      // Sidebar day switching
      el.querySelectorAll('.log-new-day-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          // Save current before switching
          entries = await getEntries();
          entries[activeDay] = ta.value;
          await storage.set(KEY, entries);

          activeDay = btn.dataset.day;
          entries = await getEntries();
          render();
        });
      });
    };

    render();
  },
};
