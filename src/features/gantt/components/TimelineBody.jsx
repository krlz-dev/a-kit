import { ROW_HEIGHT, BAR_COLORS } from '../constants/ganttTheme';
import { getBarGeometry, findUnitIndex } from '../utils/viewConfig';
import { daysBetween, getToday, parseDate } from '../utils/dateUtils';

const today = getToday();

export default function TimelineBody({
  tasks, units, cellWidth, currentView, startDate,
  onBarMouseDown,
}) {
  const totalWidth = units.length * cellWidth;

  return (
    <div style={{ position: 'relative', width: totalWidth }}>
      {/* Row backgrounds */}
      {tasks.map((task, i) => (
        <div
          key={task.id}
          style={{
            height: ROW_HEIGHT,
            borderBottom: '1px solid rgba(200,230,0,0.04)',
            display: 'flex',
            position: 'relative',
            ...(task.type === 'group' ? { background: 'rgba(200,230,0,0.03)' } : {}),
          }}
        >
          {currentView === 'days'
            ? units.map((u, j) => (
                <div key={j} style={{
                  flex: '0 0 auto', width: cellWidth,
                  borderRight: '1px solid rgba(200,230,0,0.03)',
                  ...(u.isWeekend ? { background: 'rgba(200,230,0,0.03)' } : {}),
                  ...(u.isToday ? { background: 'rgba(200,230,0,0.06)' } : {}),
                }} />
              ))
            : units.map((_, j) => (
                <div key={j} style={{
                  flex: '0 0 auto', width: cellWidth,
                  borderRight: '1px solid rgba(200,230,0,0.03)',
                }} />
              ))}
        </div>
      ))}

      {/* Dependency arrows */}
      <DependencyLayer
        tasks={tasks}
        units={units}
        cellWidth={cellWidth}
        currentView={currentView}
        startDate={startDate}
        totalWidth={totalWidth}
      />

      {/* Bars */}
      {tasks.map((task, index) => {
        const geo = getBarGeometry(task, units, { cellWidth }, currentView, startDate);
        const top = index * ROW_HEIGHT;

        if (task.type === 'milestone') {
          return (
            <div
              key={task.id}
              style={{
                position: 'absolute', width: 20, height: 20,
                top: top + 12, left: geo.left + (cellWidth / 2) - 10,
                background: '#f97316', transform: 'rotate(45deg)',
                borderRadius: 3, cursor: 'pointer', zIndex: 5,
              }}
            />
          );
        }

        if (task.type === 'group') {
          return (
            <div key={task.id} style={{
              position: 'absolute', height: 8, top: top + 18,
              left: geo.left, width: geo.width,
              background: '#7a8e7a', borderRadius: 2, zIndex: 5,
            }}>
              <span style={{
                position: 'absolute', bottom: -4, left: 0, width: 8, height: 8,
                background: '#7a8e7a', clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }} />
              <span style={{
                position: 'absolute', bottom: -4, right: 0, width: 8, height: 8,
                background: '#7a8e7a', clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }} />
            </div>
          );
        }

        const c = BAR_COLORS[task.color] || BAR_COLORS.blue;
        return (
          <div
            key={task.id}
            style={{
              position: 'absolute', height: 24, top: top + 10,
              left: geo.left, width: geo.width,
              background: `linear-gradient(135deg, ${c.start}, ${c.end})`,
              borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 8px',
              fontSize: 11, color: 'white', fontWeight: 500, cursor: 'grab',
              transition: 'box-shadow 0.15s', zIndex: 5, userSelect: 'none',
            }}
            onMouseDown={(e) => onBarMouseDown(e, task)}
          >
            {task.progress > 0 && (
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${task.progress}%`, background: 'rgba(255,255,255,0.25)',
                borderRadius: '4px 0 0 4px', pointerEvents: 'none',
              }} />
            )}
            <span style={{
              position: 'relative', zIndex: 1, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none',
            }}>
              {task.name}
            </span>
            <div data-resize="left" style={{
              position: 'absolute', top: 0, bottom: 0, left: 0, width: 8, cursor: 'ew-resize',
            }} />
            <div data-resize="right" style={{
              position: 'absolute', top: 0, bottom: 0, right: 0, width: 8, cursor: 'ew-resize',
            }} />
          </div>
        );
      })}

      {/* Today line */}
      {(currentView === 'days' || currentView === 'weeks') && (() => {
        let offset = 0;
        if (currentView === 'days') {
          offset = daysBetween(startDate, today) * cellWidth + cellWidth / 2;
        } else {
          const idx = units.findIndex(u => today >= u.date && today <= u.endDate);
          if (idx !== -1) offset = idx * cellWidth + cellWidth / 2;
        }
        if (offset < 0 || offset > totalWidth) return null;
        return (
          <div style={{
            position: 'absolute', top: 0, left: offset, width: 2, height: tasks.length * ROW_HEIGHT,
            background: '#c8e600', zIndex: 6, pointerEvents: 'none',
          }}>
            <span style={{
              position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
              fontSize: 9, color: '#c8e600', fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              Today
            </span>
          </div>
        );
      })()}
    </div>
  );
}

function DependencyLayer({ tasks, units, cellWidth, currentView, startDate, totalWidth }) {
  const paths = [];
  tasks.forEach((task, index) => {
    if (!task.dependsOn) return;
    const depIndex = tasks.findIndex(t => t.id === task.dependsOn);
    if (depIndex === -1) return;
    const depTask = tasks[depIndex];
    const depEnd = parseDate(depTask.end);
    const taskStart = parseDate(task.start);

    let x1, x2;
    if (currentView === 'days') {
      x1 = daysBetween(startDate, depEnd) * cellWidth + cellWidth;
      x2 = daysBetween(startDate, taskStart) * cellWidth;
    } else {
      let depEndIdx = findUnitIndex(units, depEnd, currentView);
      let taskStartIdx = findUnitIndex(units, taskStart, currentView);
      if (depEndIdx === -1) depEndIdx = units.length - 1;
      if (taskStartIdx === -1) taskStartIdx = 0;
      x1 = (depEndIdx + 1) * cellWidth;
      x2 = taskStartIdx * cellWidth;
    }

    const y1 = depIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
    const y2 = index * ROW_HEIGHT + ROW_HEIGHT / 2;
    const midX = (x1 + x2) / 2;

    paths.push(
      <path
        key={`${task.id}-${depTask.id}`}
        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke="#4a5c4a"
        strokeWidth="2"
        markerEnd="url(#gantt-arrow)"
      />,
    );
  });

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 4 }}
      width={totalWidth}
      height={tasks.length * ROW_HEIGHT}
    >
      <defs>
        <marker id="gantt-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#4a5c4a" />
        </marker>
      </defs>
      {paths}
    </svg>
  );
}
