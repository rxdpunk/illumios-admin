// 90-Day Plan — checkboxes saved to localStorage, phase notes visible.
import { PHASES } from '../data/phases.js';
import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;
const KEY = 'plan/tasks';
const VERSION_KEY = 'plan/version';
const PLAN_VERSION = '2026-04-14-academia-v3';

function esc(s) { return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function parseDaysLeft(datesStr) {
  const parts = datesStr.split('–');
  if (parts.length < 2) return null;
  const d = new Date(parts[1].trim() + ' 2026');
  if (isNaN(d)) return null;
  return Math.max(0, Math.ceil((d - new Date()) / 86400000));
}

function taskMeta(text) {
  if (text.includes('🔴')) return { color: 'var(--red)',    label: text.replace(/🔴/g, '').trim() };
  if (text.includes('🟡')) return { color: 'var(--yellow)', label: text.replace(/🟡/g, '').trim() };
  if (text.includes('⚠️')) return { color: 'var(--orange)', label: text.replace(/⚠️/g, '').trim() };
  if (text.includes('✅')) return { color: 'var(--green)',  label: text.replace(/✅/g, '').trim() };
  return { color: 'var(--muted)', label: text };
}

async function getSaved() {
  const modern = await storage.get(KEY, null);
  const version = await storage.get(VERSION_KEY, null);
  if (modern && version === PLAN_VERSION) return modern;
  if (modern && version !== PLAN_VERSION) {
    await storage.set('plan/tasks-backup', modern);
  }

  const seeded = {};
  PHASES.forEach((phase, pi) => {
    phase.tasks.forEach((task, ti) => {
      if (task.includes('✅')) seeded[pi + '-' + ti] = true;
    });
  });

  await storage.set(KEY, seeded);
  await storage.set(VERSION_KEY, PLAN_VERSION);
  return seeded;
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
      const daysLeft = parseDaysLeft(active.dates);

      const outer = document.createElement('div');
      outer.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:4px 0;height:100%';

      // Header: phase name + days-left badge
      const header = document.createElement('div');
      header.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-shrink:0';
      const nameWrap = document.createElement('div');
      const name = document.createElement('div');
      name.style.cssText = 'font-family:var(--font-brand);font-weight:800;font-size:0.95rem';
      name.textContent = `${active.name} — ${active.subtitle}`;
      const dates = document.createElement('div');
      dates.style.cssText = 'font-size:0.78rem;color:var(--muted);margin-top:2px';
      dates.textContent = active.dates;
      nameWrap.append(name, dates);
      header.appendChild(nameWrap);

      if (daysLeft !== null) {
        const badge = document.createElement('span');
        const urgentColor = daysLeft <= 3 ? 'var(--red)' : daysLeft <= 7 ? 'var(--orange)' : 'var(--border)';
        badge.style.cssText = `font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:20px;background:${urgentColor};color:var(--cream);white-space:nowrap;flex-shrink:0;margin-top:3px`;
        badge.textContent = daysLeft === 0 ? 'Due today' : `${daysLeft}d left`;
        header.appendChild(badge);
      }

      // Progress bar + count
      const bar = document.createElement('div');
      bar.className = 'phase-progress';
      const fill = document.createElement('div');
      fill.className = 'phase-progress-bar';
      fill.style.width = pct + '%';
      bar.appendChild(fill);

      const count = document.createElement('div');
      count.style.cssText = 'font-size:0.8rem;color:var(--muted);flex-shrink:0';
      count.textContent = `${done} of ${tasks.length} tasks · ${pct}%`;

      // Remaining tasks — blocked/pending first, color-coded dots
      const allRemaining = tasks.filter((_, ti) => !saved[pi + '-' + ti]);
      const sorted = [
        ...allRemaining.filter(t => t.includes('🔴')),
        ...allRemaining.filter(t => t.includes('🟡') && !t.includes('🔴')),
        ...allRemaining.filter(t => t.includes('⚠️') && !t.includes('🔴')),
        ...allRemaining.filter(t => !t.includes('🔴') && !t.includes('🟡') && !t.includes('⚠️')),
      ];
      const visible = sorted.slice(0, 4);

      const list = document.createElement('div');
      list.style.cssText = 'flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:4px;min-height:0';
      for (const t of visible) {
        const { color, label } = taskMeta(t);
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:baseline;gap:6px;font-size:0.8rem;line-height:1.4';
        const dot = document.createElement('span');
        dot.style.cssText = `color:${color};flex-shrink:0;font-size:0.65rem`;
        dot.textContent = '●';
        const txt = document.createElement('span');
        txt.style.cssText = `color:${color === 'var(--muted)' ? 'var(--muted)' : 'var(--cream)'}`;
        txt.textContent = label;
        row.append(dot, txt);
        list.appendChild(row);
      }
      if (allRemaining.length > 4) {
        const more = document.createElement('div');
        more.style.cssText = 'font-size:0.75rem;color:var(--muted)';
        more.textContent = `+${allRemaining.length - 4} more`;
        list.appendChild(more);
      }

      // Notes snippet
      if (active.notes) {
        const divider = document.createElement('div');
        divider.style.cssText = 'border-top:1px solid var(--border);flex-shrink:0';
        const snippet = active.notes.split('\n')[0];
        const note = document.createElement('div');
        note.style.cssText = 'font-size:0.75rem;color:var(--muted);line-height:1.5;flex-shrink:0';
        note.textContent = snippet;
        outer.append(list, divider, note);
      } else {
        outer.appendChild(list);
      }

      const link = document.createElement('a');
      link.href = '#/plan';
      link.className = 'link-btn';
      link.style.cssText = 'margin-top:auto;flex-shrink:0';
      link.textContent = 'View Full Plan →';

      outer.prepend(header, bar, count);
      outer.appendChild(link);
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
