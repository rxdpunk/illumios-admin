// Tasks module — full task manager with buckets, notes, and priority tags.
// Stored in localStorage under mc:tasks/list
import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;

const STORAGE_KEY = 'tasks/list';
const STORAGE_VERSION_KEY = 'tasks/version';
const SEED_VERSION = '2026-04-14-academia-v4';

// ── Seed tasks from TASKS.md (first-run defaults) ─────────────────────────
const SEED_TASKS = [
  {
    id: 't-1', bucket: 'Today', text: 'Lock the public offer messaging stack for Illumios Academia',
    done: false,
    note: 'Use the PRD promise as the working default. Keep it focused on small business owners, time savings, smarter workflows, and the 30-day result.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-2', bucket: 'Today', text: 'Keep the canonical offer name and price visible everywhere',
    done: false,
    note: 'Use "Illumios Academia" with the subtitle "AI for Small Business Owners: Your First 30 Days" and a default target price of $497.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-3', bucket: 'Today', text: 'Choose the primary enrollment path for the first cohort',
    done: true,
    note: 'Current working path: website application -> fit quiz -> enrollment call. The remaining gap is real server-side GHL capture.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-4', bucket: 'Today', text: 'Align quiz copy and CTA to the main offer',
    done: false,
    note: 'Quiz outcomes should route qualified leads toward the program, not a generic services conversation.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-5', bucket: 'This Week', text: 'Write the invitation / simple sales page copy',
    done: false,
    note: 'This should be the concise asset you can send to warm contacts, BNI connections, and discovery-call prospects this week.',
    tag: '🟡 Soon',
  },
  {
    id: 't-6', bucket: 'This Week', text: 'Build the first delivery materials',
    done: false,
    note: 'Start with Session 1 outline and worksheet, then complete Sessions 2–4 so each session ends with a practical output.',
    tag: '🟡 Soon',
  },
  {
    id: 't-7', bucket: 'This Week', text: 'Set up admin tracking for program operations',
    done: false,
    note: 'Track Academia leads, booked calls, enrollments, attendance, feedback, and testimonials.',
    tag: '🟡 Soon',
  },
  {
    id: 't-8', bucket: 'This Week', text: 'Recruit the first cohort',
    done: false,
    note: 'Invite warm contacts, talk leads, and local-network prospects into the program first.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-9', bucket: 'This Week', text: 'Test Maya voice AI with offer-first positioning',
    done: false,
    note: 'Run a real call and verify disclosure, routing, customer-status detection, and the offer-first next-step path.',
    tag: '🟡 Soon',
  },
  {
    id: 't-10', bucket: 'This Week', text: 'Complete GHL affiliate signup',
    done: false,
    note: 'Get the affiliate link now so it can be placed into the curriculum when the first cohort becomes ongoing Academia.',
    tag: '🟡 Soon',
  },
  {
    id: 't-11', bucket: 'This Week', text: 'Wire quiz completions into GHL with an Academia-interest path',
    done: false,
    note: 'The website now gates quiz entry behind an application. Paste the inbound-webhook workflow URL into ghl-config.js in the website and quiz repos, then map contact creation in GHL.',
    tag: '🟡 Soon',
  },
  {
    id: 't-12', bucket: 'This Week', text: 'File the New Jersey LLC',
    done: false,
    note: 'This replaces the old Wyoming default and should stay consistent across threads.',
    tag: '🟡 Soon',
  },
  {
    id: 't-13', bucket: 'Later', text: 'Add GHL private integration key to the admin dashboard',
    done: false,
    note: 'Needed before live data widgets can show pipeline, conversations, leads, and calls.',
    tag: '🟢 Low',
  },
  {
    id: 't-14', bucket: 'Later', text: 'Build dashboard live-data widgets',
    done: false,
    note: 'Academia leads, open conversations, new leads today, discovery calls today, and Maya call log.',
    tag: '🟢 Low',
  },
  {
    id: 't-15', bucket: 'Later', text: 'Create testimonial and case-study capture template',
    done: false,
    note: 'You will need this immediately after the first cohort to turn wins into proof.',
    tag: '🟢 Low',
  },
  {
    id: 't-16', bucket: 'Waiting On', text: 'A2P SMS campaign carrier approval',
    done: false,
    note: 'Still pending. Calls work now, but SMS-related follow-up remains constrained.',
    tag: '⏳ Blocked',
  },
  {
    id: 't-17', bucket: 'Done', text: 'illumios.com live',
    done: true,
    note: 'Website is live and serving as the public marketing presence.',
    tag: '✅ Complete',
  },
  {
    id: 't-18', bucket: 'Done', text: 'AI Roadmap Quiz published',
    done: true,
    note: 'Quiz is live at quiz.illumios.com.',
    tag: '✅ Complete',
  },
  {
    id: 't-19', bucket: 'Done', text: 'DKIM activated',
    done: true,
    note: 'Email authentication is complete.',
    tag: '✅ Complete',
  },
  {
    id: 't-20', bucket: 'Done', text: 'GHL sub-account configured',
    done: true,
    note: 'Pipelines, workflows, calendar, and contacts are already in place.',
    tag: '✅ Complete',
  },
  {
    id: 't-21', bucket: 'Done', text: 'Maya AI Voice Receptionist live',
    done: true,
    note: 'The voice assistant is installed and operating.',
    tag: '✅ Complete',
  },
  {
    id: 't-22', bucket: 'Done', text: 'Google Workspace email live',
    done: true,
    note: 'steve@, sunshine@, and info@ are active.',
    tag: '✅ Complete',
  },
];

const BUCKETS = ['Today', 'This Week', 'Later', 'Waiting On', 'Done'];

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function uid() { return 't-' + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }

async function load() {
  const saved = await storage.get(STORAGE_KEY, null);
  const version = await storage.get(STORAGE_VERSION_KEY, null);
  if (saved && Array.isArray(saved) && version === SEED_VERSION) return saved;
  if (saved && Array.isArray(saved) && version !== SEED_VERSION) {
    await storage.set('tasks/list-backup', saved);
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
  const items = tasks.filter(t => t.done ? name === 'Done' : t.bucket === name);
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
  const todayItems = tasks.filter(t => !t.done && t.bucket === 'Today');
  const weekItems  = tasks.filter(t => !t.done && t.bucket === 'This Week').slice(0, 3);

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
    empty.textContent = 'All clear for today.';
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
      if (found) { found.done = true; found.bucket = 'Done'; await save(all); }
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
          tasks[idx].done = cb.checked;
          tasks[idx].bucket = cb.checked ? 'Done' : tasks[idx].bucket;
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
