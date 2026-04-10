// Home module — Gridstack.js drag-and-drop widget grid.
// Customize button toggles drag/resize; layout saved per user email.
import * as registry from '../core/registry.js';
import { storage }   from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

// Default widget layout — { id, x, y, w, h } on a 12-column grid
const DEFAULT_LAYOUT = [
  { id: 'tasks-today',        x: 0, y: 0, w: 6, h: 6 },
  { id: 'plan-widget',        x: 6, y: 0, w: 6, h: 6 },
  { id: 'daily-log-today',   x: 0, y: 6, w: 8, h: 5 },
  { id: 'quick-links-widget', x: 8, y: 6, w: 4, h: 5 },
];

const LAYOUT_PREFIX = 'home/layout/';

// ── Status bar ────────────────────────────────────────────────────────────
function renderStatusBar() {
  const today = new Date();
  const phase1End = new Date('2026-04-19');
  const daysLeft  = Math.max(0, Math.ceil((phase1End - today) / 86400000));

  const items = [
    { label: 'Website',    dot: 'green',  val: 'Live' },
    { label: 'GHL',        dot: 'green',  val: 'Active' },
    { label: 'Maya AI',    dot: 'green',  val: 'Live' },
    { label: 'A2P Brand',  dot: 'green',  val: 'Approved' },
    { label: 'A2P SMS',    dot: 'yellow', val: 'Carrier Pending' },
    { label: 'Phase 1',    dot: daysLeft > 0 ? 'orange' : 'red',
                           val: daysLeft > 0 ? `${daysLeft}d left` : 'Complete' },
  ];

  return `<div class="status-bar">
    ${items.map(s => `
      <div class="status-item">
        <div class="status-label">${s.label}</div>
        <div class="status-value"><span class="dot dot-${s.dot}"></span>${s.val}</div>
      </div>`).join('')}
  </div>`;
}

// ── Module state ──────────────────────────────────────────────────────────
let grid          = null;
let isCustomizing = false;
let _email        = '';
let _customizeHandler = null;

function layoutKey(email) { return LAYOUT_PREFIX + (email || 'default'); }

async function saveLayout() {
  if (!grid) return;
  const items = grid.save(false); // false = don't save content HTML
  await storage.set(layoutKey(_email), items);
}

function setCustomizing(el, on) {
  isCustomizing = on;
  const btn = document.getElementById('customize-btn');
  if (on) {
    grid.setStatic(false);  // unlock drag + resize
    el.classList.add('customize-mode');
    if (btn) { btn.textContent = 'Lock Layout'; btn.classList.add('active'); }
  } else {
    grid.setStatic(true);   // re-lock
    el.classList.remove('customize-mode');
    if (btn) { btn.textContent = 'Customize'; btn.classList.remove('active'); }
    saveLayout();
  }
}

// ── Widget card HTML ──────────────────────────────────────────────────────
function widgetCard(id, title) {
  return `
    <div class="widget-inner">
      <div class="widget-header">
        <div class="widget-drag-handle" title="Drag to move">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/>
            <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
            <circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
          </svg>
        </div>
        <div class="widget-title">${title}</div>
      </div>
      <div class="widget-body" id="wb-${id}"></div>
    </div>`;
}

// ── Mount ─────────────────────────────────────────────────────────────────
export default {
  id: 'home',
  title: 'Home',
  icon: ICON,
  showInSidebar: true,

  async mount(el, ctx) {
    _email = ctx?.userEmail || '';

    // Collect all registered widgets
    const widgets = registry.allWidgets();
    const byId    = new Map(widgets.map(w => [w.id, w]));

    // Load saved layout or fall back to default
    const saved  = await storage.get(layoutKey(_email), null);
    const layout = saved || DEFAULT_LAYOUT;

    el.innerHTML = `
      ${renderStatusBar()}
      <div class="grid-stack" id="home-gs"></div>`;

    // Show the Customize button in the topbar
    const btn = document.getElementById('customize-btn');
    if (btn) btn.style.display = 'flex';

    // Init Gridstack — disabled by default, Customize mode enables it
    grid = GridStack.init({
      column:            12,
      cellHeight:        72,
      cellHeightUnit:    'px',
      margin:            10,
      marginUnit:        'px',
      handle:            '.widget-drag-handle',
      staticGrid:        true,  // locked until Customize is clicked
      animate:           true,
    }, '#home-gs');

    // Add each widget to the grid
    for (const item of layout) {
      const w = byId.get(item.id);
      if (!w) continue;
      grid.addWidget({
        x: item.x ?? 0,
        y: item.y ?? 0,
        w: item.w ?? (w.defaultW ?? 4),
        h: item.h ?? (w.defaultH ?? 5),
        minW: w.minW ?? 2,
        minH: w.minH ?? 3,
        id: item.id,
        content: widgetCard(item.id, w.title),
      });
    }

    // Render widget content into each .widget-body
    for (const item of layout) {
      const w    = byId.get(item.id);
      const body = document.getElementById('wb-' + item.id);
      if (!w || !body) continue;
      try {
        await w.render(body, ctx);
      } catch (err) {
        body.innerHTML = `<p style="color:var(--red);font-size:0.8rem;padding:8px">⚠ ${err.message}</p>`;
        console.error('Widget render error:', item.id, err);
      }
    }

    // Customize toggle handler
    _customizeHandler = () => setCustomizing(el, !isCustomizing);
    document.addEventListener('mc:toggle-customize', _customizeHandler);
  },

  unmount() {
    // Save layout before leaving
    if (grid && isCustomizing) { setCustomizing(document.querySelector('#view') || document.body, false); }
    if (grid) { try { grid.destroy(false); } catch(_) {} grid = null; }
    if (_customizeHandler) {
      document.removeEventListener('mc:toggle-customize', _customizeHandler);
      _customizeHandler = null;
    }
    isCustomizing = false;

    // Hide & reset the Customize button
    const btn = document.getElementById('customize-btn');
    if (btn) {
      btn.style.display = 'none';
      btn.textContent   = 'Customize';
      btn.classList.remove('active');
    }
  },
};
