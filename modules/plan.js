// 90-Day Plan — checkboxes saved to localStorage, phase notes visible.
import { PHASES } from '../data/phases.js';
import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;
const KEY = 'plan/tasks';

function esc(s) { return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

async function getSaved() {
  const modern = await storage.get(KEY, null);
  if (modern) return modern;
  return storage.legacyGet('mc_tasks', {}) || {};
}

function computePct(pi, saved) {
  const total = PHASES[pi].tasks.length;
  if (!total) return 0;
  const done = PHASES[pi].tasks.filter((_, ti) => saved[pi + '-' + ti]).length;
  return Math.round((done / total) * 100);
}

function renderPhases(saved) {
  return PHASES.map((phase, pi) => {
    const pct = computePct(pi, saved);
    const done = PHASES[pi].tasks.filter((_, ti) => saved[pi + '-' + ti]).length;
    return `
    <div class="plan-phase-card ${phase.active ? 'plan-phase-active' : ''}">
      <div class="plan-phase-top">
        <div class="plan-phase-header">
          <div class="plan-phase-name">${esc(phase.name)}: ${esc(phase.subtitle)}</div>
          <span class="${phase.active ? 'badge-active' : 'plan-badge-upcoming'}">${phase.active ? 'Active' : 'Upcoming'}</span>
        </div>
        <div class="plan-phase-dates">${esc(phase.dates)}</div>
        <div class="plan-progress-wrap">
          <div class="phase-progress">
            <div class="phase-progress-bar" id="progress-${pi}" style="width:${pct}%"></div>
          </div>
          <span class="plan-pct-label">${done}/${phase.tasks.length}</span>
        </div>
      </div>

      <ul class="plan-task-list">
        ${phase.tasks.map((t, ti) => `
          <li class="plan-task-item ${saved[pi+'-'+ti] ? 'plan-task-done' : ''}" id="task-item-${pi}-${ti}">
            <label class="plan-task-check-wrap">
              <input type="checkbox" class="plan-cb" data-pi="${pi}" data-ti="${ti}" ${saved[pi+'-'+ti] ? 'checked' : ''}>
              <span class="plan-checkmark"></span>
            </label>
            <span class="plan-task-text">${esc(t)}</span>
          </li>`).join('')}
      </ul>

      ${phase.notes ? `
      <div class="plan-phase-notes">
        <div class="plan-notes-label">💡 Notes</div>
        <div class="plan-notes-text">${esc(phase.notes)}</div>
      </div>` : ''}
    </div>`;
  }).join('');
}

function bindChecks(root) {
  root.querySelectorAll('.plan-cb').forEach(cb => {
    cb.addEventListener('change', async () => {
      const saved = await getSaved();
      const k = cb.dataset.pi + '-' + cb.dataset.ti;
      saved[k] = cb.checked;
      await storage.set(KEY, saved);
      const item = document.getElementById('task-item-' + k);
      if (item) item.classList.toggle('plan-task-done', cb.checked);
      const bar = document.getElementById('progress-' + cb.dataset.pi);
      if (bar) bar.style.width = computePct(Number(cb.dataset.pi), saved) + '%';
      // Update counter label
      const pi = Number(cb.dataset.pi);
      const pctEl = bar?.closest('.plan-progress-wrap')?.querySelector('.plan-pct-label');
      if (pctEl) {
        const allSaved = await getSaved();
        const done2 = PHASES[pi].tasks.filter((_, ti) => allSaved[pi + '-' + ti]).length;
        pctEl.textContent = done2 + '/' + PHASES[pi].tasks.length;
      }
    });
  });
}

export default {
  id: 'plan',
  title: '90-Day Plan',
  icon: ICON,
  showInSidebar: true,

  widgets: [{
    id: 'plan-widget',
    title: 'Active Phase',
    async render(el) {
      const saved  = await getSaved();
      const active = PHASES.find(p => p.active) || PHASES[0];
      const pi     = PHASES.indexOf(active);
      const pct    = computePct(pi, saved);
      const tasks  = PHASES[pi].tasks;
      const done   = tasks.filter((_, ti) => saved[pi + '-' + ti]).length;

      const outer = document.createElement('div');
      outer.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:4px 0;height:100%';

      const header = document.createElement('div');
      const name = document.createElement('div');
      name.style.cssText = 'font-family:var(--font-brand);font-weight:800;font-size:0.95rem';
      name.textContent = `${active.name} — ${active.subtitle}`;
      const dates = document.createElement('div');
      dates.style.cssText = 'font-size:0.78rem;color:var(--muted);margin-top:2px';
      dates.textContent = active.dates;
      header.append(name, dates);

      const bar = document.createElement('div');
      bar.className = 'phase-progress';
      const fill = document.createElement('div');
      fill.className = 'phase-progress-bar';
      fill.style.width = pct + '%';
      bar.appendChild(fill);

      const count = document.createElement('div');
      count.style.cssText = 'font-size:0.8rem;color:var(--muted)';
      count.textContent = `${done} of ${tasks.length} tasks · ${pct}%`;

      // Show remaining tasks (up to 5)
      const remaining = tasks.filter((_, ti) => !saved[pi + '-' + ti]).slice(0, 5);
      const list = document.createElement('div');
      list.style.cssText = 'flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:5px';
      for (const t of remaining) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:baseline;gap:6px;font-size:0.8rem;line-height:1.4';
        const dot = document.createElement('span');
        dot.style.cssText = 'color:var(--orange);flex-shrink:0';
        dot.textContent = '·';
        const txt = document.createElement('span');
        txt.style.color = 'var(--cream)';
        txt.textContent = t;
        row.append(dot, txt);
        list.appendChild(row);
      }
      if (tasks.length - done > 5) {
        const more = document.createElement('div');
        more.style.cssText = 'font-size:0.75rem;color:var(--muted)';
        more.textContent = `+${tasks.length - done - 5} more`;
        list.appendChild(more);
      }

      const link = document.createElement('a');
      link.href = '#/plan';
      link.className = 'link-btn';
      link.style.marginTop = 'auto';
      link.textContent = 'View Full Plan →';

      outer.append(header, bar, count, list, link);
      el.textContent = '';
      el.appendChild(outer);
    },
  }],

  async mount(el) {
    const saved = await getSaved();
    el.innerHTML = `
      <div class="plan-shell">
        <div class="plan-header">
          <h2 class="plan-heading">90-Day Launch Plan</h2>
          <p class="plan-subhead">Checkboxes save automatically. Click any task to mark it complete.</p>
        </div>
        <div class="plan-grid">${renderPhases(saved)}</div>
      </div>`;
    bindChecks(el);
  },
};
