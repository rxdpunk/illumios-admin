import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;

const STORAGE_KEY = 'student101/prompt-bank';
let mountedPageEl = null;
let mountedPageScope = 'default';

function storageKey(scope = 'default') {
  return `${STORAGE_KEY}/${scope}`;
}

const DEFAULT_PROMPTS = {
  triage: 'You are helping a small business owner process inbox messages. Review the email below and classify it as Reply now, Reply later, Ignore, Needs human judgment, or Looks suspicious. Explain the classification in one sentence. If a reply is appropriate, draft a warm professional response under 140 words using plain business language and one clear next step. Flag any money, login, link, or attachment risk clearly.',
  drafting: 'Draft a warm and professional reply to this message. Keep it under 140 words, use plain business language, do not invent facts, and end with one clear next step.',
  rewrite: 'Rewrite this draft so it sounds clear, calm, and helpful. Keep the meaning, remove fluff, and preserve any important constraints or risks.',
};

function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_PROMPTS));
}

async function getPromptBank() {
  const saved = await storage.get(storageKey(mountedPageScope), null);
  return { ...cloneDefaults(), ...(saved || {}) };
}

async function getPromptBankForScope(scope = 'default') {
  const saved = await storage.get(storageKey(scope), null);
  return { ...cloneDefaults(), ...(saved || {}) };
}

async function setPromptBank(scope, data) {
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

async function mountPromptBank(el, scope = 'default') {
  window.clearTimeout(el._promptBankSaveTimer);
  let data = await getPromptBankForScope(scope);

  el.innerHTML = `
    <div class="student-widget-stack">
      <div class="student-widget-intro">
        <h4>Prompt Bank</h4>
        <p>Keep the prompts reusable and tool-neutral so you can swap email or model providers later.</p>
      </div>

      <div class="prompt-bank-list">
        <label class="prompt-card">
          <span class="prompt-card-title">Triage prompt</span>
          <span class="prompt-card-copy">Classify the message and explain why.</span>
          <textarea class="workflow-textarea" rows="5" name="triage">${escapeHtml(data.triage)}</textarea>
        </label>

        <label class="prompt-card">
          <span class="prompt-card-title">Draft prompt</span>
          <span class="prompt-card-copy">Draft the first useful response.</span>
          <textarea class="workflow-textarea" rows="5" name="drafting">${escapeHtml(data.drafting)}</textarea>
        </label>

        <label class="prompt-card">
          <span class="prompt-card-title">Rewrite prompt</span>
          <span class="prompt-card-copy">Clean up tone before the final send.</span>
          <textarea class="workflow-textarea" rows="4" name="rewrite">${escapeHtml(data.rewrite)}</textarea>
        </label>
      </div>

      <div class="student-save-row">
        <span class="student-save-status" data-role="save-status">Autosaves locally</span>
        <button class="btn-sm btn-ghost" data-action="reset-prompts">Load starter prompts</button>
      </div>
    </div>
  `;

  const statusEl = el.querySelector('[data-role="save-status"]');
  const updateStatus = (message) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    window.clearTimeout(updateStatus.timer);
    updateStatus.timer = window.setTimeout(() => {
      statusEl.textContent = 'Autosaves locally';
    }, 1500);
  };

  el.querySelectorAll('textarea[name]').forEach((field) => {
    field.addEventListener('input', () => {
      data[field.name] = field.value.trim();
      window.clearTimeout(el._promptBankSaveTimer);
      el._promptBankSaveTimer = window.setTimeout(async () => {
        await setPromptBank(scope, data);
        updateStatus('Saved');
      }, 300);
    });
  });

  el.querySelector('[data-action="reset-prompts"]')?.addEventListener('click', async () => {
    window.clearTimeout(el._promptBankSaveTimer);
    data = cloneDefaults();
    await setPromptBank(scope, data);
    await mountPromptBank(el, scope);
  });
}

async function mountPromptBankSummary(el, scope = 'default') {
  const data = await getPromptBankForScope(scope);
  const entries = [
    ['Triage prompt', data.triage],
    ['Draft prompt', data.drafting],
    ['Rewrite prompt', data.rewrite],
  ];

  el.innerHTML = `
    <div class="student-widget-stack">
      <div class="student-widget-intro">
        <h4>Prompt Bank</h4>
        <p>Keep the reusable prompts here, then edit the full text on the dedicated page.</p>
      </div>

      <div class="prompt-summary-list">
        ${entries.map(([label, prompt]) => `
          <div class="prompt-summary-item">
            <span class="prompt-card-title">${label}</span>
            <span class="prompt-card-copy">${escapeHtml(prompt.slice(0, 120))}${prompt.length > 120 ? '...' : ''}</span>
          </div>
        `).join('')}
      </div>

      <div class="student-save-row">
        <span class="student-save-status">Prompt text saved locally</span>
        <a class="btn-sm btn-primary" href="#/student-prompt-bank">Open Prompt Bank</a>
      </div>
    </div>
  `;
}

export default {
  id: 'student-prompt-bank',
  title: 'Prompt Bank',
  icon: ICON,
  showInSidebar: true,
  widgets: [
    {
      id: 'prompt-bank-widget',
      title: 'Prompt Bank',
      defaultW: 5,
      defaultH: 4,
      minW: 3,
      minH: 4,
      kicker: 'Reference',
      async render(el, ctx) {
        await mountPromptBankSummary(el, ctx?.userEmail || 'default');
      },
    },
  ],

  async mount(el, ctx) {
    mountedPageScope = ctx?.userEmail || 'default';
    el.innerHTML = `
      <div class="student-page-shell">
        <div class="student-page-header">
          <h2 class="student-page-title">Prompt Bank</h2>
          <p class="student-page-subtitle">Store the prompts that power the workflow so your process survives provider changes.</p>
        </div>
        <div class="card"></div>
      </div>
    `;
    const card = el.querySelector('.card');
    mountedPageEl = card;
    if (card) await mountPromptBank(card, mountedPageScope);
  },

  unmount() {
    window.clearTimeout(mountedPageEl?._promptBankSaveTimer);
    mountedPageEl = null;
  },
};
