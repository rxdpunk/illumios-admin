import * as registry from './core/registry.js';
import * as router from './core/router.js';

import studentHomeMod from './modules/student-home.js';
import studentWorkflowMod from './modules/student-workflow.js';
import studentPromptBankMod from './modules/student-prompt-bank.js';
import studentWeeklyUseMod from './modules/student-weekly-use.js';
import studentVisibleWinMod from './modules/student-visible-win.js';

let booted = false;

[
  studentWorkflowMod,
  studentHomeMod,
  studentPromptBankMod,
  studentWeeklyUseMod,
  studentVisibleWinMod,
].forEach((mod) => registry.register(mod));

export function initStudentApp() {
  if (booted) return;
  booted = true;

  const emailEl = document.getElementById('user-email');
  const roleEl = document.getElementById('user-role');
  const avatarEl = document.getElementById('user-avatar');
  const dateEl = document.getElementById('nav-date');
  const phaseBadge = document.getElementById('phase-badge');
  const customizeBtn = document.getElementById('customize-btn');

  if (emailEl) emailEl.textContent = 'Local student workspace';
  if (roleEl) roleEl.textContent = 'Workflow first / provider second';
  if (avatarEl) avatarEl.textContent = 'A';

  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  if (phaseBadge) {
    phaseBadge.textContent = 'Student MVP / Workflow Widget';
  }

  if (customizeBtn) {
    customizeBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('mc:toggle-customize'));
    });
  }

  router.init({
    view: document.getElementById('view'),
    pageTitle: document.getElementById('page-title'),
    nav: document.getElementById('sidebar-nav'),
    defaultModule: 'student-workflow',
    userEmail: 'academia-101-student',
  });
}

if (typeof window !== 'undefined') {
  window.initStudentApp = initStudentApp;
  window.addEventListener('DOMContentLoaded', () => {
    initStudentApp();
  });
}
