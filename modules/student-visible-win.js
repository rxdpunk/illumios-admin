import { storage } from '../core/storage.js';
import { getWorkflowData } from './student-workflow.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>`;

const STORAGE_KEY = 'student101/visible-win';
let mountedPageScope = 'default';

function storageKey(scope = 'default') {
  return `${STORAGE_KEY}/${scope}`;
}

const DEFAULT_STATE = {
  proofNote: 'Fewer blank-page starts and faster replies to common inbox messages.',
};

async function getVisibleWinState() {
  const saved = await storage.get(storageKey(mountedPageScope), null);
  return { ...DEFAULT_STATE, ...(saved || {}) };
}

async function getVisibleWinStateForScope(scope = 'default') {
  const saved = await storage.get(storageKey(scope), null);
  return { ...DEFAULT_STATE, ...(saved || {}) };
}

async function setVisibleWinState(scope, data) {
  await storage.set(storageKey(scope), data);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

async function mountVisibleWin(el, scope = 'default') {
  detachWorkflowListener(el);

  const workflow = await getWorkflowData(scope);
  const state = await getVisibleWinStateForScope(scope);

  el.innerHTML = `
    <div class="student-widget-stack visible-win-stack">
      <div class="student-widget-intro">
        <h4>Visible Win</h4>
        <p>Make the improvement obvious enough that you will keep using the workflow after class.</p>
      </div>

      <blockquote class="visible-win-quote">
        ${escapeHtml(workflow.visibleWinStatement || 'Write a visible win statement in the Workflow Widget.')}
      </blockquote>

      <div class="visible-win-metric">
        <span class="student-mini-pill">Success metric</span>
        <strong>${escapeHtml(workflow.successMetric || 'Add one simple metric in the Workflow Widget.')}</strong>
      </div>

      <label class="workflow-field">
        <span class="workflow-label">Latest proof</span>
        <span class="workflow-helper">What happened recently that proves this workflow is helping?</span>
        <textarea class="workflow-textarea visible-win-proof" rows="3" name="proofNote">${escapeHtml(state.proofNote)}</textarea>
      </label>
    </div>
  `;

  el.querySelector('textarea[name="proofNote"]')?.addEventListener('input', async (event) => {
    await setVisibleWinState(scope, {
      proofNote: event.target.value.trim(),
    });
  });

  el._studentWorkflowListener = async () => {
    await mountVisibleWin(el, scope);
  };
  document.addEventListener('student101:workflow-updated', el._studentWorkflowListener);
}

function detachWorkflowListener(el) {
  if (!el?._studentWorkflowListener) return;
  document.removeEventListener('student101:workflow-updated', el._studentWorkflowListener);
  delete el._studentWorkflowListener;
}

let mountedPageEl = null;

export default {
  id: 'student-visible-win',
  title: 'Visible Win',
  icon: ICON,
  showInSidebar: true,
  widgets: [
    {
      id: 'visible-win-widget',
      title: 'Visible Win',
      defaultW: 12,
      defaultH: 4,
      minW: 4,
      minH: 4,
      kicker: 'Outcome',
      async render(el, ctx) {
        await mountVisibleWin(el, ctx?.userEmail || 'default');
      },
    },
  ],

  async mount(el, ctx) {
    mountedPageScope = ctx?.userEmail || 'default';
    el.innerHTML = `
      <div class="student-page-shell">
        <div class="student-page-header">
          <h2 class="student-page-title">Visible Win</h2>
          <p class="student-page-subtitle">Keep the proof visible so this stays a working habit, not a one-session exercise.</p>
        </div>
        <div class="card"></div>
      </div>
    `;
    const card = el.querySelector('.card');
    mountedPageEl = card;
    if (card) await mountVisibleWin(card, mountedPageScope);
  },

  unmount() {
    detachWorkflowListener(mountedPageEl);
    mountedPageEl = null;
  },
};
