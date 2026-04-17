// Home module — Gridstack.js drag-and-drop widget grid.
// Customize button toggles drag/resize; layout saved per user email.
import * as registry from '../core/registry.js';
import { storage }   from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

// Preset column widths (out of 12)
const SIZE_PRESETS = [
  { label: 'S',  w: 3 },
  { label: 'M',  w: 4 },
  { label: 'L',  w: 6 },
  { label: 'XL', w: 8 },
  { label: '↔',  w: 12 },
];

// Default widget layout — { id, x, y, w, h } on a 12-column grid
const DEFAULT_LAYOUT = [
  { id: 'tasks-today',        x: 0, y: 0, w: 6, h: 6 },
  { id: 'plan-widget',        x: 6, y: 0, w: 6, h: 6 },
  { id: 'daily-log-today',    x: 0, y: 6, w: 8, h: 5 },
  { id: 'quick-links-widget', x: 8, y: 6, w: 4, h: 5 },
];

const LAYOUT_PREFIX = 'home/layout/';

// ── Status bar ────────────────────────────────────────────────────────────
function buildStatusBar() {
  const today     = new Date();
  const offerLaunchEnd = new Date('2026-04-30');
  const daysLeft  = Math.max(0, Math.ceil((offerLaunchEnd - today) / 86400000));

  const items = [
    { label: 'Website',   dot: 'green',  val: 'Waitlist code ready' },
    { label: 'Admin',     dot: 'green',  val: 'Live on Vercel' },
    { label: 'Quiz',      dot: 'yellow', val: 'Needs GHL handoff' },
    { label: 'Hub',       dot: 'yellow', val: 'Plan next' },
    { label: 'Builder',   dot: 'yellow', val: 'MVP seeded' },
    {
      label: 'Cohort 1',
      dot: daysLeft > 0 ? 'orange' : 'red',
      val: daysLeft > 0 ? `${daysLeft}d left` : 'Launch window',
    },
  ];

  const bar = document.createElement('div');
  bar.className = 'status-bar';
  for (const s of items) {
    const item = document.createElement('div');
    item.className = 'status-item';
    const lbl = document.createElement('div');
    lbl.className = 'status-label';
    lbl.textContent = s.label;
    const val = document.createElement('div');
    val.className = 'status-value';
    const dot = document.createElement('span');
    dot.className = `dot dot-${s.dot}`;
    val.appendChild(dot);
    val.append(s.val);
    item.append(lbl, val);
    bar.appendChild(item);
  }
  return bar;
}

// ── Widget card — id/title are developer-defined constants, not user input ─
function widgetCard(widget) {
  const { id, title, moduleId } = widget;
  const moduleTitle = registry.get(moduleId)?.title || 'Widget';
  const presets = SIZE_PRESETS.map(p =>
    `<button class="size-btn" data-w="${p.w}" data-wid="${id}">${p.label}</button>`
  ).join('');

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
        <div class="widget-title-wrap">
          <div class="widget-kicker">${moduleTitle}</div>
          <div class="widget-title">${title}</div>
        </div>
        <div class="widget-controls">
          <div class="widget-size-presets">${presets}</div>
          <button class="widget-remove-btn" data-wid="${id}" title="Remove widget">×</button>
        </div>
      </div>
      <div class="widget-body" id="wb-${id}"></div>
    </div>`;
}

// ── Module state ──────────────────────────────────────────────────────────
let grid             = null;
let isCustomizing    = false;
let _email           = '';
let _el              = null;
let _allWidgets      = [];
let _byId            = new Map();
let _customizeHandler = null;

function layoutKey(email) { return LAYOUT_PREFIX + (email || 'default'); }

async function saveLayout() {
  if (!grid) return;
  await storage.set(layoutKey(_email), grid.save(false));
}

function getPlacedIds() {
  return new Set(
    Array.from(document.querySelectorAll('#home-gs .grid-stack-item'))
      .map(el => el.getAttribute('gs-id'))
      .filter(Boolean)
  );
}

// ── Add-widget tray ───────────────────────────────────────────────────────
function refreshAddTray() {
  const tray = document.getElementById('widget-add-tray');
  if (!tray) return;

  const placed    = getPlacedIds();
  const available = _allWidgets.filter(w => !placed.has(w.id));

  tray.textContent = '';

  if (available.length === 0) {
    const msg = document.createElement('span');
    msg.className   = 'widget-tray-empty';
    msg.textContent = 'All widgets are on the board';
    tray.appendChild(msg);
    return;
  }

  const label = document.createElement('span');
  label.className   = 'widget-tray-label';
  label.textContent = 'Add widget:';
  tray.appendChild(label);

  for (const w of available) {
    const chip = document.createElement('button');
    chip.className   = 'widget-chip';
    chip.textContent = '+ ' + w.title;
    chip.addEventListener('click', async () => {
      grid.addWidget({
        w:    w.defaultW ?? 4,
        h:    w.defaultH ?? 5,
        minW: w.minW ?? 2,
        minH: w.minH ?? 3,
        id:   w.id,
        content: widgetCard(w),
      });
      const body = document.getElementById('wb-' + w.id);
      if (body) {
        try   { await w.render(body, { userEmail: _email }); }
        catch (err) { body.textContent = '⚠ ' + err.message; }
      }
      attachRemoveListeners();
      refreshAddTray();
      await saveLayout();
    });
    tray.appendChild(chip);
  }
}

// ── Remove-button listeners ───────────────────────────────────────────────
// Must use direct listeners (not delegation) so we can stopPropagation on
// mousedown before Gridstack's drag handler sees it.
function attachRemoveListeners() {
  const gs = document.getElementById('home-gs');
  if (!gs) return;
  gs.querySelectorAll('.widget-remove-btn').forEach(btn => {
    if (btn._bound) return;
    btn._bound = true;
    btn.addEventListener('mousedown', e => e.stopPropagation());
    btn.addEventListener('click', async (e) => {
      if (!isCustomizing) return;
      e.stopPropagation();
      const wid    = btn.dataset.wid;
      const gsItem = gs.querySelector(`[gs-id="${wid}"]`);
      if (gsItem) {
        grid.removeWidget(gsItem);
        refreshAddTray();
        await saveLayout();
      }
    });
  });
}

// ── Customize toggle ──────────────────────────────────────────────────────
function setCustomizing(on) {
  isCustomizing = on;
  const btn  = document.getElementById('customize-btn');
  const tray = document.getElementById('widget-add-tray');

  if (on) {
    grid.setStatic(false);
    if (_el)  _el.classList.add('customize-mode');
    if (btn)  { btn.textContent = 'Lock Layout'; btn.classList.add('active'); }
    if (tray) { tray.style.display = 'flex'; refreshAddTray(); }
  } else {
    grid.setStatic(true);
    if (_el)  _el.classList.remove('customize-mode');
    if (btn)  { btn.textContent = 'Customize'; btn.classList.remove('active'); }
    if (tray) tray.style.display = 'none';
    saveLayout();
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────
export default {
  id: 'home',
  title: 'Home',
  icon: ICON,
  showInSidebar: true,

  async mount(el, ctx) {
    _email      = ctx?.userEmail || '';
    _el         = el;
    _allWidgets = registry.allWidgets();
    _byId       = new Map(_allWidgets.map(w => [w.id, w]));

    const saved  = await storage.get(layoutKey(_email), null);
    const layout = saved || DEFAULT_LAYOUT;

    // Build DOM shell
    const gs   = document.createElement('div');
    gs.className = 'grid-stack';
    gs.id        = 'home-gs';

    const tray = document.createElement('div');
    tray.id           = 'widget-add-tray';
    tray.className    = 'widget-add-tray';
    tray.style.display = 'none';

    el.textContent = '';
    el.appendChild(buildStatusBar());
    el.appendChild(gs);
    el.appendChild(tray);

    // Show Customize button in topbar
    const btn = document.getElementById('customize-btn');
    if (btn) btn.style.display = 'flex';

    // Init Gridstack — static (locked) until Customize is clicked.
    // handle is the full widget-header so users can drag from the title bar;
    // the dots icon is a visual affordance only.
    grid = GridStack.init({
      column:         12,
      cellHeight:     72,
      cellHeightUnit: 'px',
      margin:         10,
      marginUnit:     'px',
      handle:         '.widget-header',
      staticGrid:     true,
      animate:        true,
    }, '#home-gs');

    // Populate grid
    for (const item of layout) {
      const w = _byId.get(item.id);
      if (!w) continue;
      grid.addWidget({
        x:    item.x ?? 0,
        y:    item.y ?? 0,
        w:    item.w ?? (w.defaultW ?? 4),
        h:    item.h ?? (w.defaultH ?? 5),
        minW: w.minW ?? 2,
        minH: w.minH ?? 3,
        id:   item.id,
        content: widgetCard(w),
      });
    }

    // Render widget bodies
    for (const item of layout) {
      const w    = _byId.get(item.id);
      const body = document.getElementById('wb-' + item.id);
      if (!w || !body) continue;
      try {
        await w.render(body, ctx);
      } catch (err) {
        body.textContent = '⚠ ' + err.message;
        console.error('Widget render error:', item.id, err);
      }
    }

    // Bind remove buttons after all widgets are in the DOM
    attachRemoveListeners();

    // Event delegation for size preset buttons (quick, no Gridstack conflict)
    gs.addEventListener('click', async (e) => {
      if (!isCustomizing) return;
      const sizeBtn = e.target.closest('.size-btn');
      if (sizeBtn) {
        const wid    = sizeBtn.dataset.wid;
        const w      = parseInt(sizeBtn.dataset.w, 10);
        const gsItem = gs.querySelector(`[gs-id="${wid}"]`);
        if (gsItem) { grid.update(gsItem, { w }); await saveLayout(); }
      }
    });

    // Auto-save on drag/resize
    grid.on('change', () => { if (isCustomizing) saveLayout(); });

    // Wire Customize button toggle
    _customizeHandler = () => setCustomizing(!isCustomizing);
    document.addEventListener('mc:toggle-customize', _customizeHandler);
  },

  unmount() {
    if (grid && isCustomizing) setCustomizing(false);
    if (grid) { try { grid.destroy(false); } catch (_) {} grid = null; }
    if (_customizeHandler) {
      document.removeEventListener('mc:toggle-customize', _customizeHandler);
      _customizeHandler = null;
    }
    isCustomizing = false;
    _el = null;

    const btn = document.getElementById('customize-btn');
    if (btn) {
      btn.style.display = 'none';
      btn.textContent   = 'Customize';
      btn.classList.remove('active');
    }
  },
};
