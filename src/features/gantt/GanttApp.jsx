import { useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { HEADER_HEIGHT } from './constants/ganttTheme';
import { viewConfig } from './utils/viewConfig';
import { daysBetween, getToday } from './utils/dateUtils';
import { useGanttState } from './hooks/useGanttState';
import { useTaskDrag } from './hooks/useTaskDrag';
import { useSidebarResize } from './hooks/useSidebarResize';
import { useScrollSync } from './hooks/useScrollSync';
import { useGanttKeyboard } from './hooks/useGanttKeyboard';
import GanttHeader from './components/GanttHeader';
import TaskSidebar from './components/TaskSidebar';
import SidebarResizeHandle from './components/SidebarResizeHandle';
import TimelineHeader from './components/TimelineHeader';
import TimelineBody from './components/TimelineBody';
import TaskModal from './components/TaskModal';

export default function GanttApp() {
  const { projectId } = useParams();
  const state = useGanttState(projectId);
  const {
    tasks, currentView, sidebarWidth, startDate, endDate,
    modalTask, toast, canUndo, canRedo,
    setModalTask, changeView, updateSidebarWidth,
    addTask, updateTask, deleteTask, moveTask,
    importTasks, clearAll, undo, redo, showToast,
  } = state;

  const timelineAreaRef = useRef(null);
  const config = viewConfig[currentView];
  const units = config.getUnits(startDate, endDate);

  // Hooks
  const { onBarMouseDown, onMouseMove, onMouseUp } = useTaskDrag(currentView, startDate, endDate, moveTask);
  const { onResizeStart, onResizeMove, onResizeEnd } = useSidebarResize(sidebarWidth, updateSidebarWidth);
  const { taskListRef, timelineRef, onTaskListScroll, onTimelineScroll } = useScrollSync();
  useGanttKeyboard(undo, redo);

  // Global mouse handlers for drag/resize
  useEffect(() => {
    const handleMove = (e) => { onMouseMove(e); onResizeMove(e); };
    const handleUp = () => { onMouseUp(); onResizeEnd(); };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [onMouseMove, onMouseUp, onResizeMove, onResizeEnd]);

  const scrollToToday = useCallback(() => {
    const area = timelineAreaRef.current;
    if (!area) return;
    const today = getToday();
    let offset = 0;
    if (currentView === 'days') {
      offset = daysBetween(startDate, today) * config.cellWidth - area.clientWidth / 2;
    } else if (currentView === 'weeks') {
      const idx = units.findIndex(u => today >= u.date && today <= u.endDate);
      if (idx !== -1) offset = idx * config.cellWidth - area.clientWidth / 2;
    }
    area.scrollLeft = Math.max(0, offset);
  }, [currentView, startDate, config, units]);

  // Scroll to today on mount
  useEffect(() => {
    const id = setTimeout(scrollToToday, 100);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Modal handlers
  const handleSave = (id, data) => {
    if (id != null) updateTask(id, data);
    else addTask(data);
    setModalTask(null);
  };

  const handleDelete = (id) => {
    deleteTask(id);
    setModalTask(null);
  };

  return (
    <div style={{
      height: '100vh', background: '#080c08', color: '#d8e4d8',
      fontFamily: "'IBM Plex Mono', monospace", overflow: 'hidden',
    }}>
      <GanttHeader
        currentView={currentView}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onChangeView={changeView}
        onAddTask={() => setModalTask({})}
        onScrollToToday={scrollToToday}
        tasks={tasks}
        startDate={startDate}
        endDate={endDate}
        sidebarWidth={sidebarWidth}
        onExportJSON={() => {}}
        onImportJSON={importTasks}
        onClearAll={clearAll}
      />

      <div style={{ display: 'flex', marginTop: HEADER_HEIGHT, height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <TaskSidebar
            tasks={tasks}
            sidebarWidth={sidebarWidth}
            listRef={taskListRef}
            onScroll={onTaskListScroll}
            onEditTask={(task) => setModalTask(task)}
          />
          <SidebarResizeHandle onMouseDown={onResizeStart} />
        </div>

        <div
          ref={(el) => { timelineAreaRef.current = el; timelineRef.current = el; }}
          onScroll={onTimelineScroll}
          style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', position: 'relative' }}
        >
          <div style={{ minWidth: '100%', position: 'relative' }}>
            <TimelineHeader units={units} cellWidth={config.cellWidth} currentView={currentView} />
            <TimelineBody
              tasks={tasks}
              units={units}
              cellWidth={config.cellWidth}
              currentView={currentView}
              startDate={startDate}
              onBarMouseDown={onBarMouseDown}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalTask && (
        <TaskModal
          task={modalTask}
          tasks={tasks}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalTask(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1100,
          background: 'rgba(200,230,0,0.12)', border: '1px solid rgba(200,230,0,0.2)',
          color: '#c8e600', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
