// Tasks module — full task manager with buckets, notes, and priority tags.
// Stored in localStorage under mc:tasks/list
import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;

const STORAGE_KEY = 'tasks/list';

// ── Seed tasks from TASKS.md (first-run defaults) ─────────────────────────
const SEED_TASKS = [
  {
    id: 't-1', bucket: 'Today', text: 'Test Maya voice AI with updated prompt',
    done: false,
    note: 'Live call to verify AI disclosure, routing, customer status detection. Some broken routing was left unfinished — exact issue unknown.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-2', bucket: 'Today', text: 'Publish AI Roadmap Quiz to quiz.illumios.com',
    done: false,
    note: 'GHL custom HTML element unresponsive on double-click; try right-click or gear icon in the orange toolbar.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-3', bucket: 'This Week', text: 'Complete GHL affiliate signup',
    done: false,
    note: 'GHL offers 40% recurring. Sign up at highlevel.com/affiliate-program, get link, place at Module 4 of curriculum.',
    tag: '🟡 Soon',
  },
  {
    id: 't-4', bucket: 'This Week', text: 'Verify CleverFlo Sales Pipeline rename in GHL',
    done: false,
    note: 'May already be done — quick check in GHL → Pipelines.',
    tag: '🟢 Low',
  },
  {
    id: 't-5', bucket: 'This Week', text: 'Admin dashboard modular refactor',
    done: false,
    note: 'Surgical approach: keep Google auth block verbatim. Gridstack.js widget grid with Customize button.',
    tag: '🟡 Soon',
  },
  {
    id: 't-6', bucket: 'Later', text: 'Pass 2: illumios-data private repo + fine-grained PAT',
    done: false,
    note: 'GitHub-as-database backend. Swap storage.js adapter from localStorage to GitHub REST API.',
    tag: '🟢 Low',
  },
  {
    id: 't-7', bucket: 'Waiting On', text: 'A2P SMS campaign carrier approval',
    done: false,
    note: 'No ETA. Calls work now.',
    tag: '⏳ Blocked',
  },
  {
    id: 't-8', bucket: 'Waiting On', text: 'File Wyoming LLC',
    done: false,
    note: 'Waiting on Sunshine sign-off.',
    tag: '⏳ Blocked',
  },
];

const BUCKETS = ['Today', 'This Week', 'Later', 'Waiting On', 'Done'];

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function uid() { return 't-' + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }

async function load() {
  const saved = await storage.get(STORAGE_KEY, null);
  if (saved && Array.isArray(saved)) return saved;
  // First run — seed with TASKS.md data
  await storage.set(STORAGE_KEY, SEED_TASKS);
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
