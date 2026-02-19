import { BAR_COLORS, ROW_HEIGHT } from '../constants/ganttTheme';
import { daysBetween, parseDate } from './dateUtils';
import { viewConfig, findUnitIndex } from './viewConfig';

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generateSVG(tasks, currentView, startDate, endDate, sidebarWidth) {
  const config = viewConfig[currentView];
  const units = config.getUnits(startDate, endDate);
  const totalWidth = units.length * config.cellWidth;
  const headerHeight = 50;
  const width = sidebarWidth + totalWidth;
  const height = headerHeight + tasks.length * ROW_HEIGHT;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  // Defs
  svg += '<defs>';
  Object.entries(BAR_COLORS).forEach(([name, colors]) => {
    svg += `<linearGradient id="grad-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.start}"/>
      <stop offset="100%" style="stop-color:${colors.end}"/>
    </linearGradient>`;
  });
  svg += `<marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#8a9b8a"/>
  </marker>`;
  svg += '</defs>';

  // Background (dark theme)
  svg += `<rect width="${width}" height="${height}" fill="#080c08"/>`;

  // Sidebar background
  svg += `<rect x="0" y="0" width="${sidebarWidth}" height="${height}" fill="#0e140e"/>`;
  svg += `<line x1="${sidebarWidth}" y1="0" x2="${sidebarWidth}" y2="${height}" stroke="rgba(200,230,0,0.08)" stroke-width="2"/>`;

  // Sidebar header
  svg += `<text x="16" y="30" font-family="'IBM Plex Mono', monospace" font-size="11" font-weight="600" fill="#b0c4b0">TASK NAME</text>`;

  // Timeline header
  svg += `<rect x="${sidebarWidth}" y="0" width="${totalWidth}" height="${headerHeight}" fill="#0e140e"/>`;
  svg += `<line x1="${sidebarWidth}" y1="${headerHeight}" x2="${width}" y2="${headerHeight}" stroke="rgba(200,230,0,0.06)"/>`;

  // Weekend/today columns (day view)
  if (currentView === 'days') {
    units.forEach((unit, idx) => {
      const x = sidebarWidth + idx * config.cellWidth;
      if (unit.isWeekend) svg += `<rect x="${x}" y="0" width="${config.cellWidth}" height="${height}" fill="rgba(200,230,0,0.03)"/>`;
      if (unit.isToday) svg += `<rect x="${x}" y="0" width="${config.cellWidth}" height="${height}" fill="rgba(200,230,0,0.06)"/>`;
    });
  }

  // Header labels
  let xOffset = sidebarWidth;
  if (currentView === 'days') {
    let current = new Date(startDate);
    while (current <= endDate) {
      const month = current.toLocaleString('default', { month: 'short' });
      const year = current.getFullYear();
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const displayEnd = monthEnd > endDate ? endDate : monthEnd;
      let dayCount = 0;
      for (let d = new Date(current); d <= displayEnd; d.setDate(d.getDate() + 1)) {
        svg += `<text x="${xOffset + dayCount * config.cellWidth + config.cellWidth / 2}" y="${headerHeight - 8}" font-family="'IBM Plex Mono', monospace" font-size="10" fill="#8a9b8a" text-anchor="middle">${d.getDate()}</text>`;
        dayCount++;
      }
      const monthWidth = dayCount * config.cellWidth;
      svg += `<text x="${xOffset + monthWidth / 2}" y="18" font-family="'IBM Plex Mono', monospace" font-size="11" font-weight="600" fill="#b0c4b0" text-anchor="middle">${month} ${year}</text>`;
      xOffset += monthWidth;
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
  } else {
    units.forEach(unit => {
      svg += `<text x="${xOffset + config.cellWidth / 2}" y="${headerHeight - 8}" font-family="'IBM Plex Mono', monospace" font-size="10" fill="#8a9b8a" text-anchor="middle">${unit.label}</text>`;
      xOffset += config.cellWidth;
    });
  }

  // Row lines
  for (let i = 0; i <= tasks.length; i++) {
    const y = headerHeight + i * ROW_HEIGHT;
    svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(200,230,0,0.04)"/>`;
  }

  // Task sidebar rows
  tasks.forEach((task, index) => {
    const y = headerHeight + index * ROW_HEIGHT;
    if (task.type === 'group') {
      svg += `<rect x="0" y="${y}" width="${sidebarWidth}" height="${ROW_HEIGHT}" fill="rgba(200,230,0,0.04)"/>`;
    }
    svg += `<text x="16" y="${y + ROW_HEIGHT / 2 + 4}" font-family="'IBM Plex Mono', monospace" font-size="12" fill="#d8e4d8" ${task.type === 'group' ? 'font-weight="600"' : ''}>${escapeXml(task.name)}</text>`;
    if (task.assignee) {
      svg += `<circle cx="${sidebarWidth - 24}" cy="${y + ROW_HEIGHT / 2}" r="12" fill="#818cf8"/>`;
      svg += `<text x="${sidebarWidth - 24}" y="${y + ROW_HEIGHT / 2 + 4}" font-family="'IBM Plex Mono', monospace" font-size="9" fill="white" text-anchor="middle" font-weight="600">${escapeXml(task.assignee)}</text>`;
    }
  });

  // Dependencies
  tasks.forEach((task, index) => {
    if (!task.dependsOn) return;
    const depIndex = tasks.findIndex(t => t.id === task.dependsOn);
    if (depIndex === -1) return;
    const depTask = tasks[depIndex];
    const depEnd = parseDate(depTask.end);
    const taskStart = parseDate(task.start);

    let x1, x2;
    if (currentView === 'days') {
      x1 = sidebarWidth + daysBetween(startDate, depEnd) * config.cellWidth + config.cellWidth;
      x2 = sidebarWidth + daysBetween(startDate, taskStart) * config.cellWidth;
    } else {
      let depEndIdx = findUnitIndex(units, depEnd, currentView);
      let taskStartIdx = findUnitIndex(units, taskStart, currentView);
      if (depEndIdx === -1) depEndIdx = units.length - 1;
      if (taskStartIdx === -1) taskStartIdx = 0;
      x1 = sidebarWidth + (depEndIdx + 1) * config.cellWidth;
      x2 = sidebarWidth + taskStartIdx * config.cellWidth;
    }

    const y1 = headerHeight + depIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
    const y2 = headerHeight + index * ROW_HEIGHT + ROW_HEIGHT / 2;
    const midX = (x1 + x2) / 2;
    svg += `<path d="M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}" fill="none" stroke="#8a9b8a" stroke-width="2" marker-end="url(#arrow)"/>`;
  });

  // Bars
  tasks.forEach((task, index) => {
    const taskStart = parseDate(task.start);
    const taskEnd = parseDate(task.end);
    let startOffset, barWidth;

    if (currentView === 'days') {
      startOffset = daysBetween(startDate, taskStart) * config.cellWidth;
      barWidth = (daysBetween(taskStart, taskEnd) + 1) * config.cellWidth - 4;
    } else {
      let startIdx = findUnitIndex(units, taskStart, currentView);
      let endIdx = findUnitIndex(units, taskEnd, currentView);
      if (startIdx === -1) startIdx = 0;
      if (endIdx === -1) endIdx = units.length - 1;
      startOffset = startIdx * config.cellWidth;
      barWidth = (endIdx - startIdx + 1) * config.cellWidth - 4;
    }

    const x = sidebarWidth + startOffset + 2;
    const y = headerHeight + index * ROW_HEIGHT;

    if (task.type === 'milestone') {
      const mx = sidebarWidth + startOffset + config.cellWidth / 2;
      const my = y + ROW_HEIGHT / 2;
      svg += `<rect x="${mx - 10}" y="${my - 10}" width="14" height="14" fill="#f97316" transform="rotate(45 ${mx} ${my})" rx="2"/>`;
    } else if (task.type === 'group') {
      svg += `<rect x="${x}" y="${y + 18}" width="${barWidth}" height="8" fill="#b0c4b0" rx="2"/>`;
      svg += `<polygon points="${x},${y + 26} ${x + 4},${y + 26} ${x + 2},${y + 30}" fill="#b0c4b0"/>`;
      svg += `<polygon points="${x + barWidth},${y + 26} ${x + barWidth - 4},${y + 26} ${x + barWidth - 2},${y + 30}" fill="#b0c4b0"/>`;
    } else {
      const color = task.color || 'blue';
      svg += `<rect x="${x}" y="${y + 10}" width="${barWidth}" height="24" fill="url(#grad-${color})" rx="4"/>`;
      if (task.progress > 0) {
        svg += `<rect x="${x}" y="${y + 10}" width="${barWidth * task.progress / 100}" height="24" fill="rgba(255,255,255,0.25)" rx="4"/>`;
      }
      svg += `<text x="${x + 8}" y="${y + 26}" font-family="'IBM Plex Mono', monospace" font-size="11" fill="white" font-weight="500">${escapeXml(task.name)}</text>`;
    }
  });

  // Today line
  if (currentView === 'days' || currentView === 'weeks') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let todayOffset = 0;
    if (currentView === 'days') {
      todayOffset = daysBetween(startDate, today) * config.cellWidth + config.cellWidth / 2;
    } else {
      const idx = units.findIndex(u => today >= u.date && today <= u.endDate);
      if (idx !== -1) todayOffset = idx * config.cellWidth + config.cellWidth / 2;
    }
    if (todayOffset >= 0 && todayOffset <= totalWidth) {
      const tx = sidebarWidth + todayOffset;
      svg += `<line x1="${tx}" y1="${headerHeight}" x2="${tx}" y2="${height}" stroke="#c8e600" stroke-width="2"/>`;
      svg += `<text x="${tx}" y="${headerHeight - 5}" font-family="'IBM Plex Mono', monospace" font-size="9" fill="#c8e600" text-anchor="middle" font-weight="600">Today</text>`;
    }
  }

  svg += '</svg>';
  return svg;
}

export function exportAsSVG(tasks, currentView, startDate, endDate, sidebarWidth) {
  const svg = generateSVG(tasks, currentView, startDate, endDate, sidebarWidth);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gantt-chart.svg';
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsPNG(tasks, currentView, startDate, endDate, sidebarWidth) {
  const svg = generateSVG(tasks, currentView, startDate, endDate, sidebarWidth);
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
  const svgEl = svgDoc.documentElement;
  const width = parseInt(svgEl.getAttribute('width'));
  const height = parseInt(svgEl.getAttribute('height'));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);
  ctx.fillStyle = '#080c08';
  ctx.fillRect(0, 0, width, height);

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = 'gantt-chart.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const svgBase64 = btoa(unescape(encodeURIComponent(svg)));
  img.src = 'data:image/svg+xml;base64,' + svgBase64;
}

export function exportJSON(tasks) {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gantt-project.json';
  a.click();
  URL.revokeObjectURL(url);
}
