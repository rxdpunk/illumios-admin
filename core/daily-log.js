import { storage } from './storage.js';

export const DAILY_LOG_KEY = 'dailyLog/entries';
export const DAILY_LOG_TASK_ROLLUPS_KEY = 'dailyLog/task-rollups';
export const DAILY_LOG_ROLLUPS_CHANGED_EVENT = 'mc:daily-log-rollups-changed';

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function shortenSentence(text, max = 140) {
  if (!text) return '';
  const sentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || text;
  return sentence.length > max ? sentence.slice(0, max - 1).trimEnd() + '…' : sentence;
}

function normalizeRollups(rollups) {
  return Array.isArray(rollups)
    ? rollups
        .filter(item => item && item.taskId && item.summary)
        .sort((a, b) => String(b.completedAt || '').localeCompare(String(a.completedAt || '')))
    : [];
}

function notifyRollupChange(date) {
  document.dispatchEvent(new CustomEvent(DAILY_LOG_ROLLUPS_CHANGED_EVENT, {
    detail: { date },
  }));
}

export function summarizeTaskForDailyLog(task) {
  const text = cleanText(task?.text);
  const note = shortenSentence(cleanText(task?.note));
  return note ? `${text} — ${note}` : text;
}

export async function getTaskRollupsByDay() {
  const saved = await storage.get(DAILY_LOG_TASK_ROLLUPS_KEY, {});
  return saved && typeof saved === 'object' ? saved : {};
}

export async function getTaskRollups(date = todayIso()) {
  const all = await getTaskRollupsByDay();
  return normalizeRollups(all[date]);
}

export async function addCompletedTaskToDailyLog(task, date = todayIso()) {
  if (!task?.id) return;

  const all = await getTaskRollupsByDay();
  const changedDates = new Set();

  Object.keys(all).forEach(day => {
    const next = normalizeRollups(all[day]).filter(item => item.taskId !== task.id);
    if (next.length !== normalizeRollups(all[day]).length) {
      changedDates.add(day);
    }
    if (next.length) all[day] = next;
    else delete all[day];
  });

  const dayItems = normalizeRollups(all[date]);
  dayItems.unshift({
    taskId: task.id,
    text: cleanText(task.text),
    summary: summarizeTaskForDailyLog(task),
    completedAt: new Date().toISOString(),
    tag: cleanText(task.tag),
  });
  all[date] = normalizeRollups(dayItems);
  changedDates.add(date);

  await storage.set(DAILY_LOG_TASK_ROLLUPS_KEY, all);
  changedDates.forEach(notifyRollupChange);
}

export async function removeCompletedTaskFromDailyLog(taskId) {
  if (!taskId) return;

  const all = await getTaskRollupsByDay();
  const changedDates = [];

  Object.keys(all).forEach(day => {
    const current = normalizeRollups(all[day]);
    const next = current.filter(item => item.taskId !== taskId);
    if (next.length !== current.length) {
      changedDates.push(day);
      if (next.length) all[day] = next;
      else delete all[day];
    }
  });

  if (!changedDates.length) return;

  await storage.set(DAILY_LOG_TASK_ROLLUPS_KEY, all);
  changedDates.forEach(notifyRollupChange);
}
