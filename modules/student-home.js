import * as registry from '../core/registry.js';
import { storage } from '../core/storage.js';
import { getWorkflowData } from './student-workflow.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

const SIZE_PRESETS = [
  { label: 'S', w: 3 },
  { label: 'M', w: 4 },
  { label: 'L', w: 6 },
  { label: 'XL', w: 8 },
  { label: 'Full', w: 12 },
];

const DEFAULT_LAYOUT = [
  { id: 'workflow-widget', x: 0, y: 0, w: 7, h: 6 },
  { id: 'prompt-bank-widget', x: 7, y: 0, w: 5, h: 4 },
  { id: 'weekly-use-widget', x: 7, y: 4, w: 5, h: 4 },
  { id: 'visible-win-widget', x: 0, y: 6, w: 7, h: 4 },
];

const LAYOUT_PREFIX = 'student101/home/layout/';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function buildWorkspaceHero() {
  const hero = document.createElement('section');
  hero.className = 'student-workspace-hero card';
  hero.innerHTML = `
    <div class="student-workspace-hero-grid">
      <div class="student-workspace-copy">
        <div class="card-title">Illumios Academia 101</div>
        <h2 class="student-workspace-title">Build one workflow you can keep using after class.</h2>
        <p class="student-workspace-subtitle">
          This dashboard is the container for your first workflow, not the automation engine.
          Start with the Workflow Widget, save your prompts, track weekly use, and make the win visible.
        </p>
        <div class="student-hero-actions">
          <a class="btn-sm btn-primary" href="#/student-workflow">Open Workflow</a>
          <a class="btn-sm btn-ghost" href="#/student-prompt-bank">Open Prompt Bank</a>
        </div>
        <div class="student-pill-row">
          <span class="student-pill">Vendor-neutral</span>
          <span class="student-pill">Human review required</span>
          <span class="student-pill">Local-first MVP</span>
        </div>
      </div>
      <div class="student-workspace-note">
        <span class="student-workspace-note-label">Canonical 101 workflow</span>
        <strong>AI-assisted email triage and response</strong>
        <p>Classify the message, draft the first useful response, review with judgment, then send, save, or flag.</p>
      </div>
    </div>
  `;
  return hero;
}

function buildStartStrip(workflow) {
  const strip = document.createElement('section');
  strip.className = 'student-start-strip';
  strip.innerHTML = `
    <div class="student-start-item">
      <span class="student-start-label">Current workflow</span>
      <strong>${escapeHtml(workflow.workflowName)}</strong>
    </div>
    <div class="student-start-item">
      <span class="student-start-label">Usage rhythm</span>
      <strong>${escapeHtml(workflow.usageRhythm)}</strong>
    </div>
    <div class="student-start-item">
      <span class="student-start-label">Visible win</span>
      <strong>${escapeHtml(workflow.visibleWinStatement)}</strong>
    </div>
  `;
  return strip;
}

function widgetCard(widget) {
  const presets = SIZE_PRESETS.map((preset) => (
    `<button class="size-btn" data-w="${preset.w}" data-wid="${widget.id}">${preset.label}</button>`
  )).join('');
  const removeButton = widget.required
    ? ''
    : `<button class="widget-remove-btn" data-wid="${widget.id}" title="Remove widget">x</button>`;

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
          <div class="widget-kicker">${widget.kicker || widget.moduleTitle}</div>
          <div class="widget-title">${widget.title}</div>
        </div>
        <div class="widget-controls">
          <div class="widget-size-presets">${presets}</div>
          ${removeButton}
        </div>
      </div>
      <div class="widget-body" id="wb-${widget.id}"></div>
    </div>
  `;
}

let grid = null;
let isCustomizing = false;
let currentEmail = '';
let hostEl = null;
let widgets = [];
let widgetMap = new Map();
let customizeHandler = null;

function layoutKey(email) {
  return LAYOUT_PREFIX + (email || 'default');
}

async function saveLayout() {
  if (!grid) return;
  await storage.set(layoutKey(currentEmail), grid.save(false));
}

function getPlacedIds() {
  return new Set(
    Array.from(document.querySelectorAll('#student-home-gs .grid-stack-item'))
      .map((el) => el.getAttribute('gs-id'))
      .filter(Boolean),
  );
}

function attachRemoveListeners() {
  const gs = document.getElementById('student-home-gs');
  if (!gs) return;

  gs.querySelectorAll('.widget-remove-btn').forEach((btn) => {
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('mousedown', (event) => event.stopPropagation());
    btn.addEventListener('click', async (event) => {
      if (!isCustomizing) return;
      event.stopPropagation();

      const widgetId = btn.dataset.wid;
      const item = gs.querySelector(`[gs-id="${widgetId}"]`);
      if (!item) return;
      const body = item.querySelector('.widget-body');
      if (body?._studentWorkflowListener) {
        document.removeEventListener('student101:workflow-updated', body._studentWorkflowListener);
        delete body._studentWorkflowListener;
      }

      grid.removeWidget(item);
      refreshAddTray();
      await saveLayout();
    });
  });
}

function setCustomizing(nextState) {
  isCustomizing = nextState;

  const button = document.getElementById('customize-btn');
  const tray = document.getElementById('widget-add-tray');

  if (grid) {
    grid.setStatic(!nextState);
  }

  if (hostEl) {
    hostEl.classList.toggle('customize-mode', nextState);
  }

  if (button) {
    button.textContent = nextState ? 'Lock Layout' : 'Customize';
    button.classList.toggle('active', nextState);
  }

  if (tray) {
    tray.style.display = nextState ? 'flex' : 'none';
  }

  if (nextState) {
    refreshAddTray();
  } else {
    saveLayout();
  }
}

function refreshAddTray() {
  const tray = document.getElementById('widget-add-tray');
  if (!tray) return;

  const placedIds = getPlacedIds();
  const available = widgets.filter((widget) => !placedIds.has(widget.id));

  tray.textContent = '';

  if (available.length === 0) {
    const emptyState = document.createElement('span');
    emptyState.className = 'widget-tray-empty';
    emptyState.textContent = 'All widgets are already on the board';
    tray.appendChild(emptyState);
    return;
  }

  const label = document.createElement('span');
  label.className = 'widget-tray-label';
  label.textContent = 'Add widget:';
  tray.appendChild(label);

  available.forEach((widget) => {
    const chip = document.createElement('button');
    chip.className = 'widget-chip';
    chip.textContent = '+ ' + widget.title;
    chip.addEventListener('click', async () => {
      grid.addWidget({
        w: widget.defaultW ?? 4,
        h: widget.defaultH ?? 5,
        minW: widget.minW ?? 2,
        minH: widget.minH ?? 3,
        id: widget.id,
        content: widgetCard(widget),
      });

      const body = document.getElementById('wb-' + widget.id);
      if (body) {
        try {
          await widget.render(body, { userEmail: currentEmail });
        } catch (error) {
          body.textContent = 'Unable to render widget: ' + error.message;
        }
      }

      attachRemoveListeners();
      refreshAddTray();
      await saveLayout();
    });
    tray.appendChild(chip);
  });
}

export default {
  id: 'student-home',
  title: 'Dashboard',
  icon: ICON,
  showInSidebar: true,

  async mount(el, ctx) {
    currentEmail = ctx?.userEmail || '';
    hostEl = el;
    const workflow = await getWorkflowData(currentEmail);

    widgets = registry.allWidgets().map((widget) => ({
      ...widget,
      moduleTitle: registry.get(widget.moduleId)?.title || 'Widget',
    }));
    widgetMap = new Map(widgets.map((widget) => [widget.id, widget]));

    const savedLayout = await storage.get(layoutKey(currentEmail), null);
    const layout = savedLayout || DEFAULT_LAYOUT;

    const gridEl = document.createElement('div');
    gridEl.className = 'grid-stack';
    gridEl.id = 'student-home-gs';

    const tray = document.createElement('div');
    tray.id = 'widget-add-tray';
    tray.className = 'widget-add-tray';
    tray.style.display = 'none';

    el.textContent = '';
    el.appendChild(buildWorkspaceHero());
    el.appendChild(buildStartStrip(workflow));
    el.appendChild(gridEl);
    el.appendChild(tray);

    const customizeBtn = document.getElementById('customize-btn');
    if (customizeBtn) customizeBtn.style.display = window.innerWidth < 760 ? 'none' : 'flex';

    grid = GridStack.init({
      column: window.innerWidth < 760 ? 1 : 12,
      cellHeight: 72,
      cellHeightUnit: 'px',
      margin: 10,
      marginUnit: 'px',
      handle: '.widget-header',
      staticGrid: true,
      animate: true,
    }, '#student-home-gs');

    for (const item of layout) {
      const widget = widgetMap.get(item.id);
      if (!widget) continue;

      grid.addWidget({
        x: item.x ?? 0,
        y: item.y ?? 0,
        w: item.w ?? widget.defaultW ?? 4,
        h: item.h ?? widget.defaultH ?? 5,
        minW: widget.minW ?? 2,
        minH: widget.minH ?? 3,
        id: item.id,
        content: widgetCard(widget),
      });
    }

    for (const item of layout) {
      const widget = widgetMap.get(item.id);
      const body = document.getElementById('wb-' + item.id);
      if (!widget || !body) continue;

      try {
        await widget.render(body, ctx);
      } catch (error) {
        body.textContent = 'Unable to render widget: ' + error.message;
      }
    }

    attachRemoveListeners();

    gridEl.addEventListener('click', async (event) => {
      if (!isCustomizing) return;
      const sizeBtn = event.target.closest('.size-btn');
      if (!sizeBtn) return;

      const widgetId = sizeBtn.dataset.wid;
      const w = Number.parseInt(sizeBtn.dataset.w, 10);
      const item = gridEl.querySelector(`[gs-id="${widgetId}"]`);
      if (!item) return;

      grid.update(item, { w });
      await saveLayout();
    });

    grid.on('change', () => {
      if (isCustomizing) saveLayout();
    });

    customizeHandler = () => setCustomizing(!isCustomizing);
    document.addEventListener('mc:toggle-customize', customizeHandler);
  },

  unmount() {
    document.querySelectorAll('#student-home-gs .widget-body').forEach((body) => {
      if (body && body._studentWorkflowListener) {
        document.removeEventListener('student101:workflow-updated', body._studentWorkflowListener);
        delete body._studentWorkflowListener;
      }
    });

    if (grid && isCustomizing) {
      setCustomizing(false);
    }

    if (grid) {
      try {
        grid.destroy(false);
      } catch (_) {
        // Grid teardown is best-effort in the static browser app.
      }
      grid = null;
    }

    if (customizeHandler) {
      document.removeEventListener('mc:toggle-customize', customizeHandler);
      customizeHandler = null;
    }

    isCustomizing = false;
    hostEl = null;

    const button = document.getElementById('customize-btn');
    if (button) {
      button.style.display = 'none';
      button.textContent = 'Customize';
      button.classList.remove('active');
    }
  },
};
