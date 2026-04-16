import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 3 21 3 21 7"/><line x1="16" y1="8" x2="21" y2="3"/><path d="M7 12h10"/><path d="M7 16h7"/><path d="M7 8h4"/></svg>`;

const STORAGE_KEY = 'student101/workflow-widget';
let mountedPageEl = null;
let mountedPageScope = 'default';

function storageKey(scope = 'default') {
  return `${STORAGE_KEY}/${scope}`;
}

export const DEFAULT_WORKFLOW = {
  workflowName: 'AI-Assisted Email Triage and Response',
  businessTask: 'Review common inbox messages faster without losing judgment, tone, or consistency.',
  trigger: 'A new inquiry, follow-up, document request, or suspicious email arrives.',
  inputSource: 'Email subject, body, sender, relevant business context, and any reusable response notes.',
  aiStep: 'Classify the message and draft the first useful response or next-action note.',
  humanReview: 'The owner checks tone, facts, links, money or account risk, and decides whether to send, save, or flag it.',
  finalOutput: 'A final reply is sent, a message is deferred, or a suspicious item is escalated and stored.',
  promptStorageLocation: 'Prompt Bank widget in this dashboard plus any external notes doc or SOP folder.',
  usageRhythm: 'Use during regular inbox review, ideally 3 to 5 times per week.',
  successMetric: 'Reduce first-response drafting time to under 5 minutes for common email types.',
  visibleWinStatement: 'This task is easier now because I start from a clear triage and draft instead of a blank page.',
};

const SECTIONS = [
  {
    title: 'Workflow Basics',
    fields: [
      {
        key: 'workflowName',
        label: 'Workflow name',
        helper: 'Give the workflow a plain-language name you would actually use.',
        tag: 'input',
      },
      {
        key: 'businessTask',
        label: 'Business task or use case',
        helper: 'Describe the repeated work this workflow helps with.',
        tag: 'textarea',
      },
      {
        key: 'trigger',
        label: 'Trigger',
        helper: 'What starts the workflow?',
        tag: 'textarea',
      },
      {
        key: 'inputSource',
        label: 'Input or source material',
        helper: 'What information enters the workflow?',
        tag: 'textarea',
      },
    ],
  },
  {
    title: 'Execution Flow',
    fields: [
      {
        key: 'aiStep',
        label: 'AI step',
        helper: 'What should AI classify, draft, summarize, or transform?',
        tag: 'textarea',
      },
      {
        key: 'humanReview',
        label: 'Human review step',
        helper: 'Where does human judgment, accuracy, or safety get checked?',
        tag: 'textarea',
      },
      {
        key: 'finalOutput',
        label: 'Final output',
        helper: 'What is sent, saved, flagged, or used at the end?',
        tag: 'textarea',
      },
      {
        key: 'promptStorageLocation',
        label: 'Prompt storage location',
        helper: 'Where do you keep the reusable prompt or SOP?',
        tag: 'textarea',
      },
    ],
  },
  {
    title: 'Repeatability',
    fields: [
      {
        key: 'usageRhythm',
        label: 'Usage rhythm',
        helper: 'How often should this workflow get used?',
        tag: 'textarea',
      },
      {
        key: 'successMetric',
        label: 'One success metric',
        helper: 'Choose one simple measure that proves the workflow helps.',
        tag: 'textarea',
      },
      {
        key: 'visibleWinStatement',
        label: 'Visible win statement',
        helper: 'Finish the sentence: "This task is easier now because I do it this way."',
        tag: 'textarea',
      },
    ],
  },
];

function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_WORKFLOW));
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

export async function getWorkflowData(scope = 'default') {
  const saved = await storage.get(storageKey(scope), null);
  return { ...cloneDefaults(), ...(saved || {}) };
}

async function setWorkflowData(scope, data) {
  await storage.set(storageKey(scope), data);
  document.dispatchEvent(new CustomEvent('student101:workflow-updated', {
    detail: data,
  }));
}

function renderField(field, data) {
  const baseClass = field.tag === 'input' ? 'workflow-input' : 'workflow-textarea';
  const value = escapeHtml(data[field.key]);

  if (field.tag === 'input') {
    return `
      <label class="workflow-field">
        <span class="workflow-label">${field.label}</span>
        <span class="workflow-helper">${field.helper}</span>
        <input class="${baseClass}" name="${field.key}" value="${value}" />
      </label>
    `;
  }

  return `
    <label class="workflow-field">
      <span class="workflow-label">${field.label}</span>
      <span class="workflow-helper">${field.helper}</span>
      <textarea class="${baseClass}" name="${field.key}" rows="3">${value}</textarea>
    </label>
  `;
}

async function mountWorkflowEditor(el, { compact = false, scope = 'default' } = {}) {
  window.clearTimeout(el._workflowSaveTimer);
  let data = await getWorkflowData(scope);

  el.innerHTML = `
    <div class="student-widget-stack">
      <div class="student-widget-intro">
        <h4>Canonical 101 workflow</h4>
        <p>Use the widget to define one vendor-neutral workflow pattern you can keep using after class.</p>
        <div class="student-meta-pills">
          <span class="student-mini-pill">Workflow first</span>
          <span class="student-mini-pill">Providers swappable</span>
          <span class="student-mini-pill">Human review required</span>
        </div>
      </div>

      <div class="workflow-sections ${compact ? 'workflow-sections-compact' : ''}">
        ${SECTIONS.map((section) => `
          <section class="workflow-section">
            <h5 class="workflow-section-title">${section.title}</h5>
            <div class="workflow-field-grid">
              ${section.fields.map((field) => renderField(field, data)).join('')}
            </div>
          </section>
        `).join('')}
      </div>

      <div class="student-save-row">
        <span class="student-save-status" data-role="save-status">Autosaves locally</span>
        <div class="workflow-actions">
          <button class="btn-sm btn-ghost" data-action="load-demo">Load canonical 101 demo</button>
        </div>
      </div>
    </div>
  `;

  const statusEl = el.querySelector('[data-role="save-status"]');

  const updateStatus = (message, temporary = true) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    if (!temporary) return;

    window.clearTimeout(updateStatus.timer);
    updateStatus.timer = window.setTimeout(() => {
      statusEl.textContent = 'Autosaves locally';
    }, 1500);
  };

  const persist = async (message = 'Saved') => {
    await setWorkflowData(scope, data);
    updateStatus(message);
  };

  const bindInputs = () => {
    el.querySelectorAll('input[name], textarea[name]').forEach((field) => {
      field.addEventListener('input', () => {
        data[field.name] = field.value.trim();
        window.clearTimeout(el._workflowSaveTimer);
        el._workflowSaveTimer = window.setTimeout(() => {
          persist('Saved');
        }, 300);
      });
    });
  };

  bindInputs();

  el.querySelector('[data-action="load-demo"]')?.addEventListener('click', async () => {
    window.clearTimeout(el._workflowSaveTimer);
    data = cloneDefaults();
    await setWorkflowData(scope, data);
    await mountWorkflowEditor(el, { compact, scope });
  });
}

function detachWorkflowSummaryListener(el) {
  if (!el?._studentWorkflowListener) return;
  document.removeEventListener('student101:workflow-updated', el._studentWorkflowListener);
  delete el._studentWorkflowListener;
}

async function mountWorkflowSummary(el, scope = 'default') {
  detachWorkflowSummaryListener(el);
  const data = await getWorkflowData(scope);

  el.innerHTML = `
    <div class="student-widget-stack">
      <div class="student-widget-intro">
        <h4>${escapeHtml(data.workflowName)}</h4>
        <p>${escapeHtml(data.businessTask)}</p>
      </div>

      <div class="workflow-summary-list">
        <div class="workflow-summary-item">
          <span class="student-start-label">Trigger</span>
          <strong>${escapeHtml(data.trigger)}</strong>
        </div>
        <div class="workflow-summary-item">
          <span class="student-start-label">AI step</span>
          <strong>${escapeHtml(data.aiStep)}</strong>
        </div>
        <div class="workflow-summary-item">
          <span class="student-start-label">Human review</span>
          <strong>${escapeHtml(data.humanReview)}</strong>
        </div>
        <div class="workflow-summary-item">
          <span class="student-start-label">Final output</span>
          <strong>${escapeHtml(data.finalOutput)}</strong>
        </div>
      </div>

      <div class="student-save-row">
        <span class="student-save-status">Workflow saved locally</span>
        <a class="btn-sm btn-primary" href="#/student-workflow">Open full workflow</a>
      </div>
    </div>
  `;

  el._studentWorkflowListener = async () => {
    await mountWorkflowSummary(el, scope);
  };
  document.addEventListener('student101:workflow-updated', el._studentWorkflowListener);
}

export default {
  id: 'student-workflow',
  title: 'Workflow',
  icon: ICON,
  showInSidebar: true,
  widgets: [
    {
      id: 'workflow-widget',
      title: 'Workflow Widget',
      defaultW: 7,
      defaultH: 6,
      minW: 5,
      minH: 5,
      required: true,
      kicker: 'Start Here',
      async render(el, ctx) {
        await mountWorkflowSummary(el, ctx?.userEmail || 'default');
      },
    },
  ],

  async mount(el, ctx) {
    mountedPageScope = ctx?.userEmail || 'default';
    el.innerHTML = `
      <div class="student-page-shell">
        <div class="student-page-header">
          <h2 class="student-page-title">Workflow Widget</h2>
          <p class="student-page-subtitle">Define the workflow shape first so the rest of the dashboard has something real to support.</p>
        </div>
        <div class="card"></div>
      </div>
    `;

    const card = el.querySelector('.card');
    mountedPageEl = card;
    if (card) {
      await mountWorkflowEditor(card, { compact: false, scope: mountedPageScope });
    }
  },

  unmount() {
    window.clearTimeout(mountedPageEl?._workflowSaveTimer);
    detachWorkflowSummaryListener(mountedPageEl);
    mountedPageEl = null;
  },
};
