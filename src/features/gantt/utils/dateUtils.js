export function daysBetween(d1, d2) {
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function parseDate(str) {
  return new Date(str + 'T00:00:00');
}

export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function calculateDateRange(tasks) {
  const today = getToday();
  if (tasks.length === 0) {
    const start = new Date(today);
    start.setDate(start.getDate() - 7);
    const end = new Date(today);
    end.setDate(end.getDate() + 60);
    return { startDate: start, endDate: end };
  }

  let minDate = parseDate(tasks[0].start);
  let maxDate = parseDate(tasks[0].end);

  tasks.forEach(t => {
    const s = parseDate(t.start);
    const e = parseDate(t.end);
    if (s < minDate) minDate = s;
    if (e > maxDate) maxDate = e;
  });

  const startDate = new Date(minDate);
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date(maxDate);
  endDate.setDate(endDate.getDate() + 14);
  return { startDate, endDate };
}
