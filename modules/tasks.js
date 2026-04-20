// Tasks module — full task manager with buckets, notes, and priority tags.
// Stored in localStorage under mc:tasks/list
import { storage } from '../core/storage.js';
import {
  addCompletedTaskToDailyLog,
  removeCompletedTaskFromDailyLog,
} from '../core/daily-log.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;

const STORAGE_KEY = 'tasks/list';
const STORAGE_VERSION_KEY = 'tasks/version';
const SEED_VERSION = '2026-04-20-monday-shift-v1';
const NEXT_WORKDAY = '2026-04-20';

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function humanDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function isDeferred(task) {
  return Boolean(task.deferUntil && task.deferUntil > isoToday());
}

function isReadyToday(task) {
  return task.bucket === 'Today' && (!task.deferUntil || task.deferUntil <= isoToday());
}

function mondayShiftNote(text) {
  return `${text} Pick this back up Monday, Apr 20.`;
}

// ── Seed tasks from TASKS.md (first-run defaults) ─────────────────────────
const SEED_TASKS = [
  {
    id: 't-1', bucket: 'Today', text: 'Create the website GHL waitlist workflow and capture the inbound webhook URL',
    done: false,
    deferUntil: NEXT_WORKDAY,
    note: mondayShiftNote('The website code is already shifted to a founding-cohort / priority-list flow. The missing piece is the live GHL workflow + webhook URL that the Vercel app can actually hit.'),
    tag: '🔴 Urgent',
  },
  {
    id: 't-2', bucket: 'Today', text: 'Add website Vercel env vars and deploy the waitlist flow live',
    done: false,
    deferUntil: NEXT_WORKDAY,
    note: mondayShiftNote('Set ILLUMIOS_GHL_INBOUND_WEBHOOK_URL and ILLUMIOS_GHL_LOCATION_ID, then push the polished waitlist version so illumios.com can capture priority-list leads for real.'),
    tag: '🔴 Urgent',
  },
  {
    id: 't-3', bucket: 'Today', text: 'Decide whether website waitlist leads go to GHL only or GHL + Supabase backup',
    done: false,
    deferUntil: NEXT_WORKDAY,
    note: mondayShiftNote('The code already supports the handoff shape. Make one explicit storage decision before layering extra plumbing into the live waitlist flow.'),
    tag: '🟡 Soon',
  },
  {
    id: 't-4', bucket: 'Today', text: 'Convert the Hub PRD into an implementation plan',
    done: false,
    deferUntil: NEXT_WORKDAY,
    note: mondayShiftNote('Take the student portal PRD and turn it into a real route map, schema, auth model, session unlock model, question flow, and attendance flow for hub.illumios.com.'),
    tag: '🔴 Urgent',
  },
  {
    id: 't-5', bucket: 'This Week', text: 'Scaffold the first real Hub app slice on Next.js + TypeScript + Supabase + Vercel',
    done: false,
    note: 'The repo direction is now locked. The next move is the actual app baseline, not another planning pass.',
    tag: '🟡 Soon',
  },
  {
    id: 't-6', bucket: 'This Week', text: 'Choose the Cohort 1 live delivery tool: Zoom Webinar or Google Meet pilot',
    done: false,
    note: 'The current recommendation is Zoom Webinar. Confirm it or deliberately accept the constraints of a Google Meet pilot before portal work assumes the wrong delivery model.',
    tag: '🟡 Soon',
  },
  {
    id: 't-7', bucket: 'This Week', text: 'Define Hub cohort, session, attendance, and question flows',
    done: false,
    note: 'Lock the first operator workflows before implementing portal UI: cohort setup, session unlock rules, attendance confirmations, and private question handling.',
    tag: '🟡 Soon',
  },
  {
    id: 't-8', bucket: 'This Week', text: 'Confirm Google OAuth origins for the live admin hosts',
    done: false,
    note: 'Keep https://admin.illumios.com and https://illumios-admin.vercel.app authorized so the live admin surface stays stable after the Vercel cutover.',
    tag: '🟡 Soon',
  },
  {
    id: 't-9', bucket: 'This Week', text: 'Decide whether to keep public/legacy and the archived Next rebuild in the admin repo',
    done: false,
    note: 'The current admin direction is the exact static replica. Clean up archive strategy once the cutover is comfortably stable.',
    tag: '🟢 Low',
  },
  {
    id: 't-10', bucket: 'This Week', text: 'Set up admin tracking for program operations',
    done: false,
    note: 'Track program leads, booked calls, enrollments, attendance, feedback, and testimonials in the live dashboard now that admin.illumios.com is stable.',
    tag: '🟡 Soon',
  },
  {
    id: 't-11', bucket: 'This Week', text: 'Choose the Prospecting Website Builder persistence layer and deployment target',
    done: false,
    note: 'The product shape is now real and the UI prototype works. Decide whether the next slice is local prototype hardening, Supabase-backed persistence, or another persistence path, and where it should run.',
    tag: '🟡 Soon',
  },
  {
    id: 't-12', bucket: 'This Week', text: 'Replace Prospecting Website Builder seeded data with real persistence and review-state mutation',
    done: false,
    note: 'Do not keep expanding read-only prototype screens. Add real package state updates and saved data first.',
    tag: '🟡 Soon',
  },
  {
    id: 't-13', bucket: 'This Week', text: 'Define the Facebook-first ingestion path and AI qualification interface for Prospecting Website Builder',
    done: false,
    note: 'Lock the operator workflow and service boundary before building enrichment or outreach automation.',
    tag: '🟡 Soon',
  },
  {
    id: 't-14', bucket: 'This Week', text: 'Replace the temporary founder initials with the final headshot when it is ready',
    done: false,
    note: 'The current website recommendation is photo first, video later. Do not ship the wrong image just to fill the space.',
    tag: '🟢 Low',
  },
  {
    id: 't-15', bucket: 'This Week', text: 'Recruit the first Illumios Academia cohort from the waitlist and warm network',
    done: false,
    note: 'Once the website handoff is live, push outreach through the founding-cohort / priority-list framing instead of the old paused-applications posture.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-16', bucket: 'Later', text: 'Migrate illumios.com from GitHub Pages to Vercel after the live waitlist flow is stable',
    done: false,
    note: 'Do not treat the infrastructure migration as the first priority. Prove the handoff and capture path first.',
    tag: '🟢 Low',
  },
  {
    id: 't-17', bucket: 'Later', text: 'Add automated verification for the static admin app',
    done: false,
    note: 'Now that admin.illumios.com is live on the static replica, add a lightweight regression check path for future deploy confidence.',
    tag: '🟢 Low',
  },
  {
    id: 't-18', bucket: 'Later', text: 'Build live-data widgets in admin after the GHL private integration key is set',
    done: false,
    note: 'Target widgets: program leads, open conversations, calls, enrollments, attendance, feedback, and testimonials.',
    tag: '🟢 Low',
  },
  {
    id: 't-19', bucket: 'Later', text: 'Add replay, worksheet, and private message data models to the Hub',
    done: false,
    note: 'Do this after the first route map and auth model exist so portal features attach to real structures instead of placeholders.',
    tag: '🟢 Low',
  },
  {
    id: 't-20', bucket: 'Later', text: 'Add authentication to Prospecting Website Builder if it moves beyond single-operator internal use',
    done: false,
    note: 'Keep v1 lean. Add auth only when operator scope or deployment shape makes it necessary.',
    tag: '🟢 Low',
  },
  {
    id: 't-21', bucket: 'Waiting On', text: 'Website waitlist webhook values from GHL setup',
    done: false,
    note: 'The website code is ready, but deployment is blocked until the inbound webhook URL and location wiring are in hand.',
    tag: '⏳ Blocked',
  },
  {
    id: 't-22', bucket: 'Waiting On', text: 'A2P SMS campaign carrier approval',
    done: false,
    note: 'Still pending. Calls work now, but SMS-related follow-up remains constrained.',
    tag: '⏳ Blocked',
  },
  {
    id: 't-23', bucket: 'Done', text: 'admin.illumios.com live on Vercel',
    done: true,
    note: 'The exact static admin dashboard replica is deployed and serving from the live admin host.',
    tag: '✅ Complete',
  },
  {
    id: 't-24', bucket: 'Done', text: 'Website founding-cohort waitlist flow implemented in code',
    done: true,
    note: 'The current Next.js website flow now supports priority-list capture, confirmation-state handling, and waitlist-specific lead payloads.',
    tag: '✅ Complete',
  },
  {
    id: 't-25', bucket: 'Done', text: 'Illumios Academia Hub direction locked',
    done: true,
    note: 'The student portal repo now has a PRD, project AGENTS.md, intended domain, recommended stack, and MVP delivery recommendation.',
    tag: '✅ Complete',
  },
  {
    id: 't-26', bucket: 'Done', text: 'Prospecting Website Builder MVP prototype built',
    done: true,
    note: 'The queue-first review interface, prospect detail pages, seeded data model, and baseline Next.js app shell are all in place and verified.',
    tag: '✅ Complete',
  },
];

const BUCKETS = ['Today', 'This Week', 'Later', 'Waiting On', 'Done'];

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function uid() { return 't-' + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }

function migrateTasks(saved) {
  return saved.map(task => {
    if (!task.done && task.bucket === 'Today') {
      return {
        ...task,
        deferUntil: task.deferUntil || NEXT_WORKDAY,
      };
    }
    return task;
  });
}

async function load() {
  const saved = await storage.get(STORAGE_KEY, null);
  const version = await storage.get(STORAGE_VERSION_KEY, null);
  if (saved && Array.isArray(saved) && version === SEED_VERSION) return saved;
  if (saved && Array.isArray(saved) && version !== SEED_VERSION) {
    await storage.set('tasks/list-backup', saved);
    const migrated = migrateTasks(saved);
    await storage.set(STORAGE_KEY, migrated);
    await storage.set(STORAGE_VERSION_KEY, SEED_VERSION);
    return migrated;
  }
  await storage.set(STORAGE_KEY, SEED_TASKS);
  await storage.set(STORAGE_VERSION_KEY, SEED_VERSION);
  return SEED_TASKS.map(t => ({...t}));
}

async function save(tasks) { await storage.set(STORAGE_KEY, tasks); }

// ── Render ─────────────────────────────────────────────────────────────────
function renderTask(t, idx) {
  return `
    <div class="task-row ${t.done ? 'task-done' : ''}" data-idx="${idx}">
      <div class="task-row-main">
        <label class="task-check-wrap">
          <input type="checkbox" class="task-cb" data-idx="${idx}" ${t.done ? 'checked' : ''}>
          <span class="task-checkmark"></span>
        </label>
        <div class="task-text-area">
          <div class="task-text">${esc(t.text)}</div>
          ${t.note ? `<div class="task-note-text">${esc(t.note)}</div>` : ''}
        </div>
        <div class="task-actions-row">
          ${t.deferUntil && !t.done ? `<span class="task-tag">📅 ${esc(humanDate(t.deferUntil))}</span>` : ''}
          ${t.tag ? `<span class="task-tag">${esc(t.tag)}</span>` : ''}
          <button class="task-action-btn task-note-btn" data-idx="${idx}" title="Add/edit note">📝</button>
          <button class="task-action-btn task-delete-btn" data-idx="${idx}" title="Delete">✕</button>
        </div>
      </div>
      <div class="task-note-editor" id="note-editor-${idx}" style="display:none">
        <textarea class="task-note-ta" data-idx="${idx}" rows="2" placeholder="Add a note…">${esc(t.note || '')}</textarea>
        <div class="task-note-btns">
          <button class="btn-sm btn-primary task-note-save" data-idx="${idx}">Save</button>
          <button class="btn-sm task-note-cancel" data-idx="${idx}">Cancel</button>
        </div>
      </div>
    </div>`;
}

function renderBucket(name, tasks) {
  const items = tasks.filter(t => {
    if (t.done) return name === 'Done';
    if (name === 'Today') return isReadyToday(t);
    if (name === 'This Week') return t.bucket === 'This Week' || (t.bucket === 'Today' && isDeferred(t));
    return t.bucket === name;
  });
  return `
    <div class="task-bucket">
      <div class="task-bucket-header">
        <span class="task-bucket-name">${esc(name)}</span>
        <span class="task-bucket-count">${items.length}</span>
      </div>
      <div class="task-bucket-body" id="bucket-${name.replace(/\s/g,'-')}">
        ${items.length
          ? items.map((t) => renderTask(t, tasks.indexOf(t))).join('')
          : `<div class="task-empty-bucket">Nothing here yet.</div>`}
      </div>
      ${name !== 'Done' && name !== 'Waiting On' ? `
        <button class="task-add-btn" data-bucket="${name}">+ Add task</button>` : ''}
    </div>`;
}

// ── Home widget ────────────────────────────────────────────────────────────
const TAG_COLOR = {
  '🔴 Urgent': 'var(--red)',
  '🟡 Soon':   'var(--yellow)',
  '🟢 Low':    'var(--green)',
  '⏳ Blocked': 'var(--muted)',
};

async function renderTodayWidget(el) {
  const tasks     = await load();
  const todayItems = tasks.filter(t => !t.done && isReadyToday(t));
  const deferredTodayItems = tasks.filter(t => !t.done && t.bucket === 'Today' && isDeferred(t));
  const weekItems  = tasks.filter(t => !t.done && (t.bucket === 'This Week' || (t.bucket === 'Today' && isDeferred(t)))).slice(0, 3);

  el.textContent = '';
  const outer = document.createElement('div');
  outer.style.cssText = 'display:flex;flex-direction:column;height:100%;gap:6px;padding:4px 0';

  // Today task list
  const list = document.createElement('div');
  list.style.cssText = 'flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:5px;min-height:0';

  if (todayItems.length) {
    todayItems.forEach(t => {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;align-items:flex-start;gap:7px';

      const label = document.createElement('label');
      label.className = 'task-check-wrap';
      label.style.cssText = 'margin-top:2px;flex-shrink:0';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'task-cb task-widget-cb';
      cb.dataset.id = t.id;
      const checkmark = document.createElement('span');
      checkmark.className = 'task-checkmark';
      label.append(cb, checkmark);

      const dotColor = TAG_COLOR[t.tag];
      if (dotColor) {
        const dot = document.createElement('span');
        dot.style.cssText = `width:7px;height:7px;border-radius:50%;background:${dotColor};flex-shrink:0;margin-top:5px`;
        wrap.append(label, dot);
      } else {
        wrap.append(label);
      }

      const text = document.createElement('span');
      text.style.cssText = 'font-size:0.84rem;line-height:1.45;color:var(--cream);flex:1;min-width:0';
      text.textContent = t.text;
      wrap.append(text);
      list.appendChild(wrap);
    });
  } else {
    const empty = document.createElement('div');
    empty.style.cssText = 'color:var(--muted);font-size:0.85rem;padding:4px 0';
    empty.textContent = deferredTodayItems.length
      ? `Today's open work has been shifted to Monday, Apr 20.`
      : 'All clear for today.';
    list.appendChild(empty);
  }
  outer.appendChild(list);

  // Up Next section
  if (weekItems.length) {
    const divider = document.createElement('div');
    divider.style.cssText = 'border-top:1px solid var(--border);margin:2px 0';
    outer.appendChild(divider);

    const upLabel = document.createElement('div');
    upLabel.style.cssText = 'font-size:0.7rem;font-weight:700;letter-spacing:.05em;color:var(--muted);text-transform:uppercase;margin-bottom:2px';
    upLabel.textContent = 'Up Next';
    outer.appendChild(upLabel);

    const upList = document.createElement('div');
    upList.style.cssText = 'display:flex;flex-direction:column;gap:3px';
    weekItems.forEach(t => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:baseline;gap:5px;font-size:0.78rem';
      const dot = document.createElement('span');
      dot.style.cssText = 'color:var(--muted);flex-shrink:0';
      dot.textContent = '·';
      const txt = document.createElement('span');
      txt.style.cssText = 'color:var(--muted);line-height:1.4';
      txt.textContent = t.text;
      row.append(dot, txt);
      upList.appendChild(row);
    });
    outer.appendChild(upList);
  }

  const link = document.createElement('a');
  link.href = '#/tasks';
  link.className = 'link-btn';
  link.style.marginTop = 'auto';
  link.textContent = 'View All Tasks →';
  outer.appendChild(link);

  el.appendChild(outer);

  el.querySelectorAll('.task-widget-cb').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
      const all = await load();
      const found = all.find(t => t.id === checkbox.dataset.id);
      if (found) {
        found.done = true;
        found.previousBucket = found.bucket === 'Done' ? (found.previousBucket || 'Today') : found.bucket;
        found.bucket = 'Done';
        await addCompletedTaskToDailyLog(found);
        await save(all);
      }
      renderTodayWidget(el);
    });
  });
}

export default {
  id: 'tasks',
  title: 'Tasks',
  icon: ICON,
  showInSidebar: true,

  widgets: [{
    id:       'tasks-today',
    title:    "Today's Tasks",
    minW:     3,
    minH:     3,
    defaultW: 6,
    defaultH: 6,
    render:   renderTodayWidget,
  }],

  async mount(el) {
    let tasks = await load();

    const render = () => {
      el.innerHTML = `
        <div class="tasks-shell">
          <div class="tasks-header">
            <div class="tasks-title-row">
              <h2 class="tasks-heading">Task Board</h2>
              <button class="btn-sm btn-primary" id="tasks-add-top">+ New Task</button>
            </div>
            <div class="tasks-filter-row">
              <button class="tasks-filter active" data-filter="active">Active</button>
              <button class="tasks-filter" data-filter="all">All</button>
              <button class="tasks-filter" data-filter="done">Done</button>
            </div>
          </div>
          <div class="tasks-board" id="tasks-board">
            ${BUCKETS.map(b => renderBucket(b, tasks)).join('')}
          </div>
        </div>`;
      bindEvents();
    };

    const bindEvents = () => {
      // Filter buttons
      el.querySelectorAll('.tasks-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          el.querySelectorAll('.tasks-filter').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const f = btn.dataset.filter;
          el.querySelectorAll('.task-bucket').forEach(bucket => {
            if (f === 'done') {
              const name = bucket.querySelector('.task-bucket-name').textContent;
              bucket.style.display = name === 'Done' ? '' : 'none';
            } else if (f === 'active') {
              const name = bucket.querySelector('.task-bucket-name').textContent;
              bucket.style.display = name === 'Done' ? 'none' : '';
            } else {
              bucket.style.display = '';
            }
          });
        });
      });

      // Checkbox toggle
      el.querySelectorAll('.task-cb').forEach(cb => {
        cb.addEventListener('change', async () => {
          const idx = Number(cb.dataset.idx);
          const task = tasks[idx];
          const wasDone = task.done;

          task.done = cb.checked;
          if (cb.checked) {
            task.previousBucket = task.bucket === 'Done' ? (task.previousBucket || 'Today') : task.bucket;
            task.bucket = 'Done';
            await addCompletedTaskToDailyLog(task);
          } else {
            task.bucket = task.previousBucket || 'Today';
            delete task.previousBucket;
            if (wasDone) await removeCompletedTaskFromDailyLog(task.id);
          }
          await save(tasks);
          render();
        });
      });

      // Note toggle
      el.querySelectorAll('.task-note-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = btn.dataset.idx;
          const editor = document.getElementById('note-editor-' + idx);
          if (editor) editor.style.display = editor.style.display === 'none' ? '' : 'none';
        });
      });

      // Note save
      el.querySelectorAll('.task-note-save').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = Number(btn.dataset.idx);
          const ta = el.querySelector(`.task-note-ta[data-idx="${idx}"]`);
          if (ta) tasks[idx].note = ta.value.trim();
          if (tasks[idx].done) await addCompletedTaskToDailyLog(tasks[idx]);
          await save(tasks);
          render();
        });
      });

      // Note cancel
      el.querySelectorAll('.task-note-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = btn.dataset.idx;
          const editor = document.getElementById('note-editor-' + idx);
          if (editor) editor.style.display = 'none';
        });
      });

      // Delete task
      el.querySelectorAll('.task-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = Number(btn.dataset.idx);
          await removeCompletedTaskFromDailyLog(tasks[idx]?.id);
          tasks.splice(idx, 1);
          await save(tasks);
          render();
        });
      });

      // Add task (bucket-specific buttons)
      el.querySelectorAll('.task-add-btn').forEach(btn => {
        btn.addEventListener('click', () => promptAdd(btn.dataset.bucket));
      });

      // Add task (top button)
      const topAdd = el.querySelector('#tasks-add-top');
      if (topAdd) topAdd.addEventListener('click', () => promptAdd('Today'));
    };

    const promptAdd = (bucket) => {
      const text = window.prompt(`New task in "${bucket}":`);
      if (!text || !text.trim()) return;
      tasks.push({ id: uid(), bucket, text: text.trim(), done: false, note: '', tag: '' });
      save(tasks).then(render);
    };

    render();
  },
};
