// Settings module — user info, storage management, layout reset.
import { storage } from '../core/storage.js';
import { PHASES }  from '../data/phases.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function storageUsage() {
  try {
    let total = 0;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('mc:') || key.startsWith('mc_')) {
        total += (localStorage.getItem(key) || '').length * 2; // UTF-16 bytes
      }
    }
    return total < 1024 ? `${total} B` : `${(total / 1024).toFixed(1)} KB`;
  } catch { return '—'; }
}

function mcKeys() {
  return Object.keys(localStorage).filter(k => k.startsWith('mc:') || k.startsWith('mc_'));
}

export default {
  id: 'settings',
  title: 'Settings',
  icon: ICON,
  showInSidebar: true,

  async mount(el, ctx) {
    const email   = ctx?.userEmail || localStorage.getItem('mc_auth') ? JSON.parse(localStorage.getItem('mc_auth') || '{}').email : '—';
    const planSaved = (await storage.get('plan/tasks', null)) || {};

    // Phase progress
    const phaseStats = PHASES.map((p, pi) => {
      const total = p.tasks.length;
      const done  = p.tasks.filter((_, ti) => planSaved[pi + '-' + ti]).length;
      return { name: p.name, subtitle: p.subtitle, dates: p.dates, done, total, active: p.active };
    });

    const keysList = mcKeys();

    el.innerHTML = `
      <div class="settings-shell">

        <!-- User section -->
        <div class="card settings-card">
          <div class="card-title">Account</div>
          <div class="settings-row">
            <div class="user-avatar settings-avatar">${(email || 'U')[0].toUpperCase()}</div>
            <div>
              <div class="settings-email">${esc(email)}</div>
              <div class="settings-domain">@illumios.com workspace</div>
            </div>
            <button class="btn-sm btn-danger settings-signout-btn" id="settings-signout">Sign Out</button>
          </div>
        </div>

        <!-- Phase progress -->
        <div class="card settings-card">
          <div class="card-title">Phase Progress</div>
          <div class="settings-phases">
            ${phaseStats.map(p => `
              <div class="settings-phase-row">
                <div class="settings-phase-info">
                  <span class="settings-phase-name">${esc(p.name)}: ${esc(p.subtitle)}</span>
                  <span class="settings-phase-dates">${esc(p.dates)}</span>
                </div>
                <div class="settings-phase-bar-wrap">
                  <div class="phase-progress" style="flex:1">
                    <div class="phase-progress-bar" style="width:${p.total ? Math.round(p.done/p.total*100) : 0}%"></div>
                  </div>
                  <span class="settings-phase-pct">${p.done}/${p.total}</span>
                </div>
                ${p.active ? '<span class="badge-active" style="margin-left:8px">Active</span>' : ''}
              </div>`).join('')}
          </div>
        </div>

        <!-- Storage -->
        <div class="card settings-card">
          <div class="card-title">Local Storage</div>
          <div class="settings-storage-info">
            <span>${keysList.length} mission control keys · ${storageUsage()}</span>
          </div>
          <div class="settings-btn-row">
            <button class="btn-sm" id="reset-layout-btn">Reset Home Layout</button>
            <button class="btn-sm btn-danger" id="clear-all-btn">Clear All Data</button>
          </div>
        </div>

        <!-- What's coming -->
        <div class="card settings-card">
          <div class="card-title">Roadmap</div>
          <div class="settings-roadmap">
            <div class="settings-roadmap-item">
              <span class="dot dot-green"></span>
              <span><strong>Pass 1</strong> — Modular dashboard, Gridstack widgets, localStorage</span>
            </div>
            <div class="settings-roadmap-item">
              <span class="dot dot-yellow"></span>
              <span><strong>Pass 2</strong> — GitHub-as-database (illumios-data repo), shared state between Steve + Sunshine</span>
            </div>
            <div class="settings-roadmap-item">
              <span class="dot dot-muted"></span>
              <span><strong>Pass 3</strong> — Live GHL data widgets, Maya call log, pipeline snapshot</span>
            </div>
            <div class="settings-roadmap-item">
              <span class="dot dot-muted"></span>
              <span><strong>Pass 4</strong> — Drag-and-drop widget library, add/remove from Home</span>
            </div>
          </div>
        </div>

      </div>`;

    // Sign out
    el.querySelector('#settings-signout')?.addEventListener('click', () => {
      if (typeof signOut === 'function') signOut();
    });

    // Reset home layout
    el.querySelector('#reset-layout-btn')?.addEventListener('click', async () => {
      if (!confirm('Reset Home widget layout to default?')) return;
      const keys = Object.keys(localStorage).filter(k => k.startsWith('mc:home/layout/'));
      keys.forEach(k => localStorage.removeItem(k));
      alert('Layout reset. Navigate to Home to see the default layout.');
    });

    // Clear all data
    el.querySelector('#clear-all-btn')?.addEventListener('click', async () => {
      if (!confirm('Delete ALL Mission Control data from this browser? This cannot be undone.')) return;
      mcKeys().forEach(k => localStorage.removeItem(k));
      alert('All data cleared. Reloading…');
      setTimeout(() => location.reload(), 800);
    });
  },
};
