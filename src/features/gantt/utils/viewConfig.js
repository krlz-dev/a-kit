import { daysBetween, getWeekNumber, getToday } from './dateUtils';

const today = getToday();

export const viewConfig = {
  days: {
    label: 'Days',
    cellWidth: 36,
    getUnits: (start, end) => {
      const units = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        units.push({
          date: new Date(d),
          label: d.getDate().toString(),
          isWeekend: d.getDay() === 0 || d.getDay() === 6,
          isToday: d.toDateString() === today.toDateString(),
          month: d.toLocaleString('default', { month: 'short' }),
          year: d.getFullYear(),
        });
      }
      return units;
    },
    getDuration: (start, end) => daysBetween(start, end) + 1,
  },
  weeks: {
    label: 'Weeks',
    cellWidth: 60,
    getUnits: (start, end) => {
      const units = [];
      let current = new Date(start);
      current.setDate(current.getDate() - (current.getDay() || 7) + 1);
      while (current <= end) {
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);
        units.push({
          date: new Date(current),
          endDate: weekEnd,
          label: `W${getWeekNumber(current)}`,
          month: current.toLocaleString('default', { month: 'short' }),
          year: current.getFullYear(),
        });
        current.setDate(current.getDate() + 7);
      }
      return units;
    },
    getDuration: (start, end) => Math.ceil(daysBetween(start, end) / 7),
  },
  months: {
    label: 'Months',
    cellWidth: 80,
    getUnits: (start, end) => {
      const units = [];
      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      while (current <= end) {
        units.push({
          date: new Date(current),
          label: current.toLocaleString('default', { month: 'short' }),
          year: current.getFullYear(),
        });
        current.setMonth(current.getMonth() + 1);
      }
      return units;
    },
    getDuration: (start, end) =>
      (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1,
  },
  quarters: {
    label: 'Quarters',
    cellWidth: 100,
    getUnits: (start, end) => {
      const units = [];
      let current = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1);
      while (current <= end) {
        units.push({
          date: new Date(current),
          label: `Q${Math.floor(current.getMonth() / 3) + 1}`,
          year: current.getFullYear(),
        });
        current.setMonth(current.getMonth() + 3);
      }
      return units;
    },
    getDuration: (start, end) => {
      const startQ = Math.floor(start.getMonth() / 3);
      const endQ = Math.floor(end.getMonth() / 3);
      return (end.getFullYear() - start.getFullYear()) * 4 + endQ - startQ + 1;
    },
  },
  semesters: {
    label: 'Semesters',
    cellWidth: 120,
    getUnits: (start, end) => {
      const units = [];
      let current = new Date(start.getFullYear(), Math.floor(start.getMonth() / 6) * 6, 1);
      while (current <= end) {
        units.push({
          date: new Date(current),
          label: `S${Math.floor(current.getMonth() / 6) + 1}`,
          year: current.getFullYear(),
        });
        current.setMonth(current.getMonth() + 6);
      }
      return units;
    },
    getDuration: (start, end) => {
      const startS = Math.floor(start.getMonth() / 6);
      const endS = Math.floor(end.getMonth() / 6);
      return (end.getFullYear() - start.getFullYear()) * 2 + endS - startS + 1;
    },
  },
  years: {
    label: 'Years',
    cellWidth: 150,
    getUnits: (start, end) => {
      const units = [];
      let current = new Date(start.getFullYear(), 0, 1);
      while (current <= end) {
        units.push({
          date: new Date(current),
          label: current.getFullYear().toString(),
          year: current.getFullYear(),
        });
        current.setFullYear(current.getFullYear() + 1);
      }
      return units;
    },
    getDuration: (start, end) => end.getFullYear() - start.getFullYear() + 1,
  },
};

/** Find the unit index for a given date within a set of units */
export function findUnitIndex(units, date, view) {
  if (view === 'days') {
    return units.findIndex(u => u.date.toDateString() === date.toDateString());
  }
  if (view === 'weeks') {
    return units.findIndex(u => date >= u.date && date <= u.endDate);
  }
  if (view === 'months') {
    return units.findIndex(u =>
      date.getFullYear() === u.date.getFullYear() && date.getMonth() === u.date.getMonth(),
    );
  }
  if (view === 'quarters') {
    const q = Math.floor(date.getMonth() / 3);
    return units.findIndex(u =>
      date.getFullYear() === u.date.getFullYear() && Math.floor(u.date.getMonth() / 3) === q,
    );
  }
  if (view === 'semesters') {
    const s = Math.floor(date.getMonth() / 6);
    return units.findIndex(u =>
      date.getFullYear() === u.date.getFullYear() && Math.floor(u.date.getMonth() / 6) === s,
    );
  }
  if (view === 'years') {
    return units.findIndex(u => date.getFullYear() === u.date.getFullYear());
  }
  return -1;
}

/** Calculate pixel position and width for a task bar */
export function getBarGeometry(task, units, config, view, startDate) {
  const taskStart = new Date(task.start + 'T00:00:00');
  const taskEnd = new Date(task.end + 'T00:00:00');

  if (view === 'days') {
    const offsetDays = daysBetween(startDate, taskStart);
    const duration = daysBetween(taskStart, taskEnd) + 1;
    return {
      left: offsetDays * config.cellWidth + 2,
      width: duration * config.cellWidth - 4,
    };
  }

  let startIdx = findUnitIndex(units, taskStart, view);
  let endIdx = findUnitIndex(units, taskEnd, view);
  if (startIdx === -1) startIdx = 0;
  if (endIdx === -1) endIdx = units.length - 1;

  return {
    left: startIdx * config.cellWidth + 2,
    width: (endIdx - startIdx + 1) * config.cellWidth - 4,
  };
}
