import { useRef, useCallback } from 'react';
import { viewConfig } from '../utils/viewConfig';
import { daysBetween, formatDate, parseDate } from '../utils/dateUtils';

export function useTaskDrag(currentView, startDate, endDate, moveTask) {
  const dragRef = useRef(null);

  const onBarMouseDown = useCallback((e, task) => {
    if (task.type === 'group') return;
    const bar = e.currentTarget;
    const isResize = e.target.dataset.resize;

    dragRef.current = {
      id: task.id,
      bar,
      isResize: !!isResize,
      resizeDir: isResize || null,
      startX: e.clientX,
      origLeft: parseInt(bar.style.left),
      origWidth: parseInt(bar.style.width),
      task,
    };

    bar.style.opacity = '0.8';
    bar.style.zIndex = '20';
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d) return;

    const config = viewConfig[currentView];
    const dx = e.clientX - d.startX;
    const unitsDelta = Math.round(dx / config.cellWidth);

    if (d.isResize) {
      if (d.resizeDir === 'right') {
        const nw = d.origWidth + unitsDelta * config.cellWidth;
        if (nw >= config.cellWidth) d.bar.style.width = `${nw}px`;
      } else {
        const nw = d.origWidth - unitsDelta * config.cellWidth;
        if (nw >= config.cellWidth) {
          d.bar.style.left = `${d.origLeft + unitsDelta * config.cellWidth}px`;
          d.bar.style.width = `${nw}px`;
        }
      }
    } else {
      d.bar.style.left = `${d.origLeft + unitsDelta * config.cellWidth}px`;
    }
  }, [currentView]);

  const onMouseUp = useCallback(() => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;

    d.bar.style.opacity = '';
    d.bar.style.zIndex = '';

    const config = viewConfig[currentView];
    const newLeft = parseInt(d.bar.style.left) - 2;
    const newWidth = parseInt(d.bar.style.width) + 4;
    const startUnits = Math.round(newLeft / config.cellWidth);
    const durationUnits = Math.round(newWidth / config.cellWidth);

    let newStart, newEnd;
    if (currentView === 'days') {
      newStart = new Date(startDate);
      newStart.setDate(newStart.getDate() + startUnits);
      newEnd = new Date(newStart);
      newEnd.setDate(newEnd.getDate() + durationUnits - 1);
    } else {
      const units = config.getUnits(startDate, endDate);
      if (startUnits >= 0 && startUnits < units.length) {
        newStart = new Date(units[startUnits].date);
        const endIdx = Math.min(startUnits + durationUnits - 1, units.length - 1);
        const endUnit = units[endIdx];

        if (currentView === 'weeks' && endUnit.endDate) {
          newEnd = new Date(endUnit.endDate);
        } else if (currentView === 'months') {
          newEnd = new Date(endUnit.date.getFullYear(), endUnit.date.getMonth() + 1, 0);
        } else if (currentView === 'quarters') {
          const qm = Math.floor(endUnit.date.getMonth() / 3) * 3 + 2;
          newEnd = new Date(endUnit.date.getFullYear(), qm + 1, 0);
        } else if (currentView === 'semesters') {
          const sm = Math.floor(endUnit.date.getMonth() / 6) * 6 + 5;
          newEnd = new Date(endUnit.date.getFullYear(), sm + 1, 0);
        } else if (currentView === 'years') {
          newEnd = new Date(endUnit.date.getFullYear(), 11, 31);
        } else {
          newEnd = new Date(endUnit.date);
        }
      } else {
        newStart = parseDate(d.task.start);
        newEnd = parseDate(d.task.end);
      }
    }

    const oldStart = parseDate(d.task.start);
    const oldEnd = parseDate(d.task.end);
    if (newStart.getTime() !== oldStart.getTime() || newEnd.getTime() !== oldEnd.getTime()) {
      const daysMoved = daysBetween(oldStart, newStart);
      moveTask(d.task.id, formatDate(newStart), formatDate(newEnd), daysMoved);
    }
  }, [currentView, startDate, endDate, moveTask]);

  return { onBarMouseDown, onMouseMove, onMouseUp };
}
