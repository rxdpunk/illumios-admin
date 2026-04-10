// Tiny hash router. Routes look like '#/daily-log'.
// Falls back to the default module when hash is empty.

import * as registry from './registry.js';

let currentModule = null;
let viewEl        = null;
let pageTitleEl   = null;
let navEl         = null;
let defaultId     = 'home';
let userEmail     = '';

export function init({ view, pageTitle, nav, defaultModule, userEmail: email }) {
  viewEl      = view;
  pageTitleEl = pageTitle;
  navEl       = nav;
  userEmail   = email || '';
  if (defaultModule) defaultId = defaultModule;

  renderSidebar();
  window.addEventListener('hashchange', render);
  render();
}

function currentId() {
  const hash = window.location.hash || '';
  const m = hash.match(/^#\/([a-z0-9-]+)/i);
  return m ? m[1] : defaultId;
}

export function navigate(id) {
  window.location.hash = '#/' + id;
}

function renderSidebar() {
  if (!navEl) return;
  navEl.textContent = '';
  for (const mod of registry.sidebarModules()) {
    const btn = document.createElement('a');
    btn.className  = 'nav-item';
    btn.href       = '#/' + mod.id;
    btn.dataset.moduleId = mod.id;
    btn.innerHTML  = (mod.icon || '') + '<span>' + escapeHtml(mod.title) + '</span>';
    navEl.appendChild(btn);
  }
  updateActiveNav();
}

function updateActiveNav() {
  if (!navEl) return;
  const active = currentId();
  for (const el of navEl.querySelectorAll('.nav-item')) {
    el.classList.toggle('active', el.dataset.moduleId === active);
  }
}

async function render() {
  const id = currentId();
  let mod = registry.get(id);
  if (!mod) {
    mod = registry.get(defaultId);
    if (!mod) return;
  }

  // Unmount previous
  if (currentModule && typeof currentModule.unmount === 'function') {
    try { currentModule.unmount(); } catch (e) { console.error(e); }
  }

  // Clear view
  viewEl.textContent   = '';
  pageTitleEl.textContent = mod.title;
  updateActiveNav();

  // Context passed to every module — add userEmail so modules can namespace storage
  const ctx = { navigate, userEmail };

  try {
    await mod.mount(viewEl, ctx);
  } catch (err) {
    console.error('Module mount failed:', err);
    viewEl.innerHTML = `<div class="empty"><h3>Something went wrong</h3><p>${escapeHtml(String(err))}</p></div>`;
  }
  currentModule = mod;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
