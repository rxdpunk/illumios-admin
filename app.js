// illumios admin — bootstrap
import * as registry from './core/registry.js';
import * as router from './core/router.js';

import homeMod from './modules/home.js';
import quickLinksMod from './modules/quick-links.js';
import planMod from './modules/plan.js';
import dailyLogMod from './modules/daily-log.js';
import weeklyMod from './modules/weekly-planner.js';
import tasksMod from './modules/tasks.js';
import businessPlanMod from './modules/business-plan.js';
import settingsMod from './modules/settings.js';

const CLIENT_ID = '278545755272-2lq117irlb0bnc6t4ggp29p8dkq8v1kq.apps.googleusercontent.com';
const ALLOWED_DOMAIN = 'illumios.com';
const AUTH_KEY = 'mc_auth';

// Register modules (order = sidebar order)
[homeMod, planMod, dailyLogMod, weeklyMod, tasksMod, businessPlanMod, quickLinksMod, settingsMod]
  .forEach(m => registry.register(m));

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

function getAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; }
}

function setAuth(a) {
  if (a) localStorage.setItem(AUTH_KEY, JSON.stringify(a));
  else localStorage.removeItem(AUTH_KEY);
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function startApp(auth) {
  document.getElementById('gate').hidden = true;
  document.getElementById('app').hidden = false;

  const chip = document.getElementById('user-chip');
  if (chip) chip.textContent = auth.email || '';

  const dateEl = document.getElementById('nav-date');
  if (dateEl) dateEl.textContent = formatDate(new Date());

  const signOut = document.getElementById('sign-out-btn');
  if (signOut) signOut.onclick = () => {
    setAuth(null);
    location.reload();
  };

  router.init({
    view: document.getElementById('view'),
    pageTitle: document.getElementById('page-title'),
    nav: document.getElementById('sidebar-nav'),
    defaultModule: 'home',
  });
}

function showGate() {
  document.getElementById('app').hidden = true;
  const gate = document.getElementById('gate');
  gate.hidden = false;

  window.handleCredentialResponse = (resp) => {
    const payload = decodeJwt(resp.credential);
    if (!payload) return alert('Sign-in failed.');
    if (!payload.email || !payload.email.endsWith('@' + ALLOWED_DOMAIN)) {
      return alert('Access restricted to @' + ALLOWED_DOMAIN + ' accounts.');
    }
    const auth = { email: payload.email, name: payload.name, picture: payload.picture, ts: Date.now() };
    setAuth(auth);
    startApp(auth);
  };

  // Render Google button if library loaded
  const tryRender = () => {
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({ client_id: CLIENT_ID, callback: window.handleCredentialResponse });
      const btn = document.getElementById('g-signin-btn');
      if (btn) google.accounts.id.renderButton(btn, { theme: 'filled_blue', size: 'large', text: 'signin_with' });
    } else {
      setTimeout(tryRender, 200);
    }
  };
  tryRender();
}

const existing = getAuth();
if (existing && existing.email && existing.email.endsWith('@' + ALLOWED_DOMAIN)) {
  startApp(existing);
} else {
  showGate();
}
