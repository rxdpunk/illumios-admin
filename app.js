// illumios Mission Control — Bootstrap
// ⚠️  Auth lives VERBATIM in index.html — DO NOT touch it here.
// The inline <script> calls window.initModularApp(email) after sign-in.
// This module only handles post-auth setup and module routing.

import * as registry from './core/registry.js';
import * as router   from './core/router.js';

import homeMod         from './modules/home.js';
import planMod         from './modules/plan.js';
import dailyLogMod     from './modules/daily-log.js';
import weeklyMod       from './modules/weekly-planner.js';
import tasksMod        from './modules/tasks.js';
import businessPlanMod from './modules/business-plan.js';
import quickLinksMod   from './modules/quick-links.js';
import docsMod         from './modules/docs.js';
import settingsMod     from './modules/settings.js';

// Register modules — order = sidebar order
[homeMod, planMod, dailyLogMod, weeklyMod, tasksMod, businessPlanMod, docsMod, quickLinksMod, settingsMod]
  .forEach(m => registry.register(m));

// ── Bridge — called by inline auth script ─────────────────────────────────
window.initModularApp = function initModularApp(email) {
  // Populate user chip in sidebar footer
  const emailEl  = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');
  if (emailEl)  emailEl.textContent  = email || '';
  if (avatarEl) avatarEl.textContent = (email || 'U')[0].toUpperCase();

  // Set today's date in topbar
  const dateEl = document.getElementById('nav-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  }

  // Wire the Customize button — dispatches event so Home module can handle it
  const customizeBtn = document.getElementById('customize-btn');
  if (customizeBtn) {
    customizeBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('mc:toggle-customize'));
    });
  }

  // Boot the hash router
  router.init({
    view:          document.getElementById('view'),
    pageTitle:     document.getElementById('page-title'),
    nav:           document.getElementById('sidebar-nav'),
    defaultModule: 'home',
    userEmail:     email,
  });
};
