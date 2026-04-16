import { storage } from '../core/storage.js';
import { getWorkflowData } from './student-workflow.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

const STORAGE_KEY = 'student101/weekly-use';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let mountedPageScope = 'default';

function storageKey(scope = 'default') {
  return `${STORAGE_KEY}/${scope}`;
}

function weekStartIso() {
  const now = new Date();
  const day = now.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  now.setDate(now.getDate() + offset);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

function buildDefaults() {
  return {
    weekStart: weekStartIso(),
    days: DAYS.reduce((accumulator, day) => {
      accumulator[day] = false;
      return accumulator;
    }, {}),
    focusNote: '',
  };
}

async function getWeeklyUse(scope = 'default') {
  const saved = await storage.get(storageKey(scope), null);
  const defaults = buildDefaults();

  if (!saved || saved.weekStart !== defaults.weekStart) {
    return defaults;
  }

  return {
    ...defaults,
    ...saved,
    days: { ...defaults.days, ...(saved.days || {}) },
  };
}

async function setWeeklyUse(scope, data) {
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

function deriveTargetCount(usageRhythm) {
  const match = String(usageRhythm || '').match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 3;
}

async function mountWeeklyUse(el, scope = 'default') {
  detachWorkflowListener(el);

  let data = await getWeeklyUse(scope);
  const workflow = await getWorkflowData(scope);

  const checkedCount = Object.values(data.days).filter(Boolean).length;
  const targetCount = deriveTargetCount(workflow.usageRhythm);

  el.innerHTML = `
    <div class="student-widget-stack">
      <div class="student-widget-intro">
        <h4>Weekly Use Tracker</h4>
        <p>${escapeHtml(workflow.usageRhythm)}</p>
      </div>

      <div class="tracker-summary">
        <strong class="tracker-count">${checkedCount}/${targetCount}</strong>
        <span class="tracker-caption">practice days checked this week</span>
      </div>

      <div class="tracker-grid">
        ${DAYS.map((day) => `
          <button class="tracker-day ${data.days[day] ? 'is-active' : ''}" data-day="${day}">
            <span class="tracker-day-label">${day}</span>
            <span class="tracker-day-check">${data.days[day] ? 'Done' : 'Open'}</span>
          </button>
        `).join('')}
      </div>

      <label class="workflow-field">
        <span class="workflow-label">This week's focus</span>
        <span class="workflow-helper">What kind of inbox moment are you practicing this on?</span>
        <textarea class="workflow-textarea tracker-note" rows="2" name="focusNote">${escapeHtml(data.focusNote)}</textarea>
      </label>
    </div>
  `;

  const rerender = async () => {
    await setWeeklyUse(scope, data);
    await mountWeeklyUse(el, scope);
  };

  el.querySelectorAll('.tracker-day').forEach((button) => {
    button.addEventListener('click', async () => {
      const day = button.dataset.day;
      data.days[day] = !data.days[day];
      await rerender();
    });
  });

  el.querySelector('textarea[name="focusNote"]')?.addEventListener('input', async (event) => {
    data.focusNote = event.target.value.trim();
    await setWeeklyUse(scope, data);
  });

  el._studentWorkflowListener = async () => {
    await mountWeeklyUse(el, scope);
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
  id: 'student-weekly-use',
  title: 'Weekly Use',
  icon: ICON,
  showInSidebar: true,
  widgets: [
    {
      id: 'weekly-use-widget',
      title: 'Weekly Use Tracker',
      defaultW: 4,
      defaultH: 4,
      minW: 3,
      minH: 4,
      kicker: 'Practice',
      async render(el, ctx) {
        await mountWeeklyUse(el, ctx?.userEmail || 'default');
      },
    },
  ],

  async mount(el, ctx) {
    mountedPageScope = ctx?.userEmail || 'default';
    el.innerHTML = `
      <div class="student-page-shell">
        <div class="student-page-header">
          <h2 class="student-page-title">Weekly Use Tracker</h2>
          <p class="student-page-subtitle">Keep the workflow in motion after class with a simple weekly practice rhythm.</p>
        </div>
        <div class="card"></div>
      </div>
    `;
    const card = el.querySelector('.card');
    mountedPageEl = card;
    if (card) await mountWeeklyUse(card, mountedPageScope);
  },

  unmount() {
    detachWorkflowListener(mountedPageEl);
    mountedPageEl = null;
  },
};
