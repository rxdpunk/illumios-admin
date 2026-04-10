// Weekly Planner module — 7-day view with top-3 priorities and notes per day.
// Stored in localStorage under mc:weekly/YYYY-Www
import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Get Monday of the week containing `date`
function weekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon…
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ISO week key: YYYY-Www
function weekKey(monday) {
  const jan1 = new Date(monday.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((monday - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `weekly/${monday.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// Array of 7 Date objects Mon→Sun
function weekDates(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function isoDate(d) { return d.toISOString().slice(0, 10); }

function fmtDay(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isToday(d) { return isoDate(d) === isoDate(new Date()); }

// ── Week data shape: { [isoDate]: { priorities: string[], note: string } }
async function loadWeek(monday) {
  const k = weekKey(monday);
  return (await storage.get(k, null)) || {};
}

async function saveWeek(monday, data) {
  await storage.set(weekKey(monday), data);
}

export default {
  id: 'weekly',
  title: 'Weekly Planner',
  icon: ICON,
  showInSidebar: true,

  async mount(el) {
    let monday = weekStart(new Date());

    const render = async () => {
      const data  = await loadWeek(monday);
      const dates = weekDates(monday);

      const weekLabel = `${fmtDay(dates[0])} – ${fmtDay(dates[6])}, ${dates[0].getFullYear()}`;

      el.innerHTML = `
        <div class="weekly-shell">
          <div class="weekly-nav">
            <button class="btn-sm" id="week-prev">← Prev</button>
            <span class="weekly-label">${esc(weekLabel)}</span>
            <button class="btn-sm" id="week-next">Next →</button>
            <button class="btn-sm btn-ghost" id="week-today">Today</button>
          </div>
          <div class="week-grid">
            ${dates.map((d, i) => {
              const key = isoDate(d);
              const day = data[key] || { priorities: ['', '', ''], note: '' };
              const today = isToday(d);
              return `
                <div class="week-day ${today ? 'week-today' : ''}">
                  <div class="week-day-header">
                    <span class="week-day-name">${DAYS[i]}</span>
                    <span class="week-day-date">${fmtDay(d)}</span>
                    ${today ? '<span class="week-today-chip">Today</span>' : ''}
                  </div>
                  <div class="week-priorities">
                    ${[0,1,2].map(pi => `
                      <div class="week-priority-row">
                        <span class="week-p-num">${pi + 1}</span>
                        <input type="text"
                          class="week-priority-input"
                          data-date="${key}" data-pi="${pi}"
                          placeholder="Priority ${pi + 1}…"
                          value="${esc(day.priorities[pi] || '')}">
                      </div>`).join('')}
                  </div>
                  <textarea
                    class="week-note-ta"
                    data-date="${key}"
                    rows="3"
                    placeholder="Notes…">${esc(day.note || '')}</textarea>
                </div>`;
            }).join('')}
          </div>
        </div>`;

      // Bind nav buttons
      document.getElementById('week-prev').addEventListener('click', () => {
        monday = new Date(monday); monday.setDate(monday.getDate() - 7); render();
      });
      document.getElementById('week-next').addEventListener('click', () => {
        monday = new Date(monday); monday.setDate(monday.getDate() + 7); render();
      });
      document.getElementById('week-today').addEventListener('click', () => {
        monday = weekStart(new Date()); render();
      });

      // Auto-save priority inputs on blur
      el.querySelectorAll('.week-priority-input').forEach(input => {
        input.addEventListener('change', async () => {
          const { date, pi } = input.dataset;
          const data = await loadWeek(monday);
          if (!data[date]) data[date] = { priorities: ['', '', ''], note: '' };
          data[date].priorities[Number(pi)] = input.value.trim();
          await saveWeek(monday, data);
        });
      });

      // Auto-save note textareas on blur
      el.querySelectorAll('.week-note-ta').forEach(ta => {
        let t = null;
        ta.addEventListener('input', () => {
          clearTimeout(t);
          t = setTimeout(async () => {
            const { date } = ta.dataset;
            const data = await loadWeek(monday);
            if (!data[date]) data[date] = { priorities: ['', '', ''], note: '' };
            data[date].note = ta.value;
            await saveWeek(monday, data);
          }, 800);
        });
      });
    };

    await render();
  },
};
