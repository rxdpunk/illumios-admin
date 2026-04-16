// Tasks module — full task manager with buckets, notes, and priority tags.
// Stored in localStorage under mc:tasks/list
import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;

const STORAGE_KEY = 'tasks/list';
const STORAGE_VERSION_KEY = 'tasks/version';
const SEED_VERSION = '2026-04-16-academia-v6';

// ── Seed tasks from TASKS.md (first-run defaults) ─────────────────────────
const SEED_TASKS = [
  {
    id: 't-1', bucket: 'Today', text: 'Bite 1: lock the learner outputs for 101',
    done: false,
    note: 'Open the 101 PRD and 101 course-materials index, then write the Session 1-4 learner outputs in one sentence each. Done = you can say what a learner leaves with after each session without rereading the whole pack.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-2', bucket: 'Today', text: 'Bite 2: choose one example business for the whole rehearsal',
    done: false,
    note: 'Pick one realistic business type and carry it all the way through Sessions 1-4 so prep stays simple. Done = one example business and one through-line use case for prompts, workflow, and the 30-day plan.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-3', bucket: 'Today', text: 'Bite 3: schedule one founder teach-through block',
    done: false,
    note: 'Put one 60- to 90-minute rehearsal block on the calendar. If focus is limited, walk Session 1 fully and only skim Sessions 2-4. Done = the block exists and you know which docs you will open.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-4', bucket: 'This Week', text: 'Lock Illumios Academia 101 delivery readiness',
    done: false,
    note: 'Treat 101 as the active front-door live offer. Exit condition = session order is locked, learner outputs are clear, demos/examples are ready, and support/replay/follow-up are defined.',
    tag: '🟡 Soon',
  },
  {
    id: 't-5', bucket: 'This Week', text: 'Run one founder rehearsal of Sessions 1-4',
    done: false,
    note: 'Use one example business all the way through. Capture only what feels confusing, too long, or too fragile, then fix the canonical notes or worksheets.',
    tag: '🟡 Soon',
  },
  {
    id: 't-6', bucket: 'This Week', text: 'Prepare Cohort 1 teaching assets from the existing pack',
    done: false,
    note: 'Use the facilitator-ready slide outline if simple session slides are needed. Do not expand into polished decks, LMS buildout, or evergreen assets yet.',
    tag: '🟡 Soon',
  },
  {
    id: 't-7', bucket: 'This Week', text: 'Write the invitation / simple sales page copy',
    done: false,
    note: 'This should be the concise asset you can send to warm contacts, BNI connections, and discovery-call prospects this week.',
    tag: '🟡 Soon',
  },
  {
    id: 't-8', bucket: 'This Week', text: 'Align the quiz to the main offer',
    done: false,
    note: 'Outcome copy and CTA should route qualified people toward Illumios Academia, not a generic services conversation.',
    tag: '🟡 Soon',
  },
  {
    id: 't-9', bucket: 'This Week', text: 'Update cross-repo audience wording',
    done: false,
    note: 'Website, quiz, Maya, and related copy should reflect business owners, entrepreneurs, and independent professionals without drifting into generic "for everyone" positioning.',
    tag: '🟡 Soon',
  },
  {
    id: 't-10', bucket: 'This Week', text: 'Wire website application into GHL contact capture',
    done: false,
    note: 'The website now gates quiz entry behind name/email, but the handoff still needs to create or update a real contact.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-11', bucket: 'This Week', text: 'Wire quiz completions into GHL contact capture',
    done: false,
    note: 'Quiz completions should create or update contacts, tag offer interest, and trigger the right follow-up path.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-12', bucket: 'This Week', text: 'Set up admin tracking for program operations',
    done: false,
    note: 'Track program leads, booked calls, enrollments, attendance, feedback, and testimonials.',
    tag: '🟡 Soon',
  },
  {
    id: 't-13', bucket: 'This Week', text: 'Recruit the first cohort',
    done: false,
    note: 'Invite warm contacts, talk leads, and local-network prospects into the program first.',
    tag: '🔴 Urgent',
  },
  {
    id: 't-14', bucket: 'This Week', text: 'Sunshine: complete access setup and take ownership of one 30-minute daily Illumios task',
    done: false,
    note: 'Finish Google Workspace setup, verify admin access, then choose one clearly owned starter task before expecting Maya testing or admin follow-through.',
    tag: '🟡 Soon',
  },
  {
    id: 't-15', bucket: 'This Week', text: 'Sunshine: test Maya voice AI with offer-first positioning',
    done: false,
    note: 'Run a live call to verify AI disclosure, routing, and education-first messaging after Sunshine access is working.',
    tag: '🟡 Soon',
  },
  {
    id: 't-16', bucket: 'This Week', text: 'Lock the Vercel conversion start trigger for the Hub',
    done: false,
    note: 'Do not migrate the whole web stack yet. Start Hub build work once the enrollment path is stable and before participant delivery depends on it.',
    tag: '🟡 Soon',
  },
  {
    id: 't-17', bucket: 'This Week', text: 'Start Phase 1 foundation for hub.illumios.com on Vercel',
    done: false,
    note: 'Begin once website and quiz contact-capture handoffs are working. Scope: choose starter, stand up Next.js app, configure Vercel, configure Supabase, and reserve domain setup path.',
    tag: '🟡 Soon',
  },
  {
    id: 't-18', bucket: 'This Week', text: 'File the New Jersey LLC',
    done: false,
    note: 'This is the current formation direction and should stay consistent across threads.',
    tag: '🟡 Soon',
  },
  {
    id: 't-19', bucket: 'This Week', text: 'Complete GHL affiliate signup',
    done: false,
    note: 'Get the affiliate link now so it can be placed into the curriculum when the first cohort becomes ongoing Academia.',
    tag: '🟡 Soon',
  },
  {
    id: 't-20', bucket: 'This Week', text: 'Verify sales pipeline naming in GHL',
    done: false,
    note: 'Cosmetic cleanup task. May already be done, but confirm the naming is clean and consistent.',
    tag: '🟡 Soon',
  },
  {
    id: 't-21', bucket: 'Later', text: 'Add GHL private integration key to the admin dashboard',
    done: false,
    note: 'Needed before live-data widgets can show pipeline, conversations, new leads, and calls today.',
    tag: '🟢 Low',
  },
  {
    id: 't-22', bucket: 'Later', text: 'Build dashboard live-data widgets',
    done: false,
    note: 'Build Academia leads, open conversations, new leads today, discovery calls today, and Maya call log after the GHL private integration key is set.',
    tag: '🟢 Low',
  },
  {
    id: 't-23', bucket: 'Later', text: 'Create testimonial and case-study capture template',
    done: false,
    note: 'You will need this immediately after the first cohort to turn wins into proof.',
    tag: '🟢 Low',
  },
  {
    id: 't-24', bucket: 'Later', text: 'Migrate illumios.com from GitHub Pages to Vercel',
    done: false,
    note: 'Do this after the application -> quiz -> enrollment flow is validated. Keep hub.illumios.com as the first Vercel app surface and move the public marketing site second.',
    tag: '🟢 Low',
  },
  {
    id: 't-25', bucket: 'Later', text: 'GHL workflow: Morning Briefing',
    done: false,
    note: '7:30am trigger to email Steve and Sunshine with yesterday’s new contacts, unread conversations, and today’s appointments.',
    tag: '🟢 Low',
  },
  {
    id: 't-26', bucket: 'Later', text: 'GHL workflow: Discovery Call Prep Brief',
    done: false,
    note: 'Appointment trigger 30 minutes before the call to email the host with contact name, tags, and GHL notes link.',
    tag: '🟢 Low',
  },
  {
    id: 't-27', bucket: 'Later', text: 'GHL workflow: Dead Lead Revival',
    done: false,
    note: 'When a warm lead has no activity for 14+ days, create a task and add a needs-follow-up tag.',
    tag: '🟢 Low',
  },
  {
    id: 't-28', bucket: 'Later', text: 'GHL workflow: Weekly Digest',
    done: false,
    note: 'Sunday evening summary email with weekly lead count, calls, and appointments.',
    tag: '🟢 Low',
  },
  {
    id: 't-29', bucket: 'Later', text: 'GHL workflow: Content Reminder',
    done: false,
    note: 'MWF reminder to Steve and Sunshine with a one-line content prompt.',
    tag: '🟢 Low',
  },
  {
    id: 't-30', bucket: 'Later', text: 'Pass 2: private illumios-data repo + fine-grained PAT',
    done: false,
    note: 'GitHub-as-database backend for admin dashboard persistent storage after the GHL live-data widgets work.',
    tag: '🟢 Low',
  },
  {
    id: 't-31', bucket: 'Waiting On', text: 'A2P SMS campaign carrier approval',
    done: false,
    note: 'Still pending. Calls work now, but SMS-related follow-up remains constrained.',
    tag: '⏳ Blocked',
  },
  {
    id: 't-32', bucket: 'Done', text: 'Lock the public offer messaging stack for Illumios Academia',
    done: true,
    note: 'Working default is now anchored to the PRD promise and focused on business owners, entrepreneurs, independent professionals, time savings, smarter workflows, and the 30-day result.',
    tag: '✅ Complete',
  },
  {
    id: 't-33', bucket: 'Done', text: 'Audit the current Academia course-material state',
    done: true,
    note: 'Confirmed the shared 4-session Illumios Academia pack exists, 101 is the current front-door offer, and the full 101-104 ladder is now mapped in repo memory.',
    tag: '✅ Complete',
  },
  {
    id: 't-34', bucket: 'Done', text: 'Choose the primary enrollment path for the first cohort',
    done: true,
    note: 'Current working path: website application -> fit quiz -> enrollment call.',
    tag: '✅ Complete',
  },
  {
    id: 't-35', bucket: 'Done', text: 'illumios.com live',
    done: true,
    note: 'Website is live and serving as the public marketing presence.',
    tag: '✅ Complete',
  },
  {
    id: 't-36', bucket: 'Done', text: 'AI Roadmap Quiz published',
    done: true,
    note: 'Quiz is live at quiz.illumios.com.',
    tag: '✅ Complete',
  },
  {
    id: 't-37', bucket: 'Done', text: 'DKIM activated',
    done: true,
    note: 'Email authentication is complete.',
    tag: '✅ Complete',
  },
  {
    id: 't-38', bucket: 'Done', text: 'GHL sub-account configured',
    done: true,
    note: 'Pipelines, workflows, calendar, and contacts are already in place.',
    tag: '✅ Complete',
  },
  {
    id: 't-39', bucket: 'Done', text: 'A2P 10DLC brand approved',
    done: true,
    note: 'Brand approval is complete. SMS campaign carrier approval is still pending as a separate item.',
    tag: '✅ Complete',
  },
  {
    id: 't-40', bucket: 'Done', text: 'Maya AI Voice Receptionist live',
    done: true,
    note: 'The voice assistant is installed and operating.',
    tag: '✅ Complete',
  },
  {
    id: 't-41', bucket: 'Done', text: 'Google Workspace email live',
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
