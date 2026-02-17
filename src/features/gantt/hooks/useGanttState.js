import { useState, useCallback, useRef, useEffect } from 'react';
import { DEFAULT_TASKS } from '../constants/defaults';
import { DEFAULT_SIDEBAR_WIDTH } from '../constants/ganttTheme';
import { loadTasks, saveTasks, loadSettings, saveSettings } from '../utils/ganttStorage';
import { fetchProject, updateProjectData } from '../../../shared/lib/projectsApi';
import { calculateDateRange, formatDate, getToday } from '../utils/dateUtils';

const MAX_HISTORY = 50;

export function useGanttState(projectId) {
  const isCloud = !!projectId;
  const [tasks, setTasks] = useState(() => isCloud ? [] : (loadTasks() || [...DEFAULT_TASKS]));
  const [currentView, setCurrentView] = useState(() => loadSettings()?.currentView || 'days');
  const [sidebarWidth, setSidebarWidth] = useState(() => loadSettings()?.sidebarWidth || DEFAULT_SIDEBAR_WIDTH);
  const [modalTask, setModalTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [cloudLoaded, setCloudLoaded] = useState(!isCloud);

  const pastRef = useRef([]);
  const futureRef = useRef([]);
  const saveTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Cloud project loading
  useEffect(() => {
    if (!isCloud) return;
    fetchProject(projectId).then(project => {
      if (project?.data?.tasks) {
        setTasks(project.data.tasks);
      }
      setCloudLoaded(true);
    }).catch(() => {
      showToast('Failed to load project');
      setCloudLoaded(true);
    });
  }, [projectId, isCloud, showToast]);

  const pushHistory = useCallback(() => {
    pastRef.current = [...pastRef.current, JSON.parse(JSON.stringify(tasks))];
    if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift();
    futureRef.current = [];
  }, [tasks]);

  const updateTasks = useCallback((newTasks) => {
    setTasks(newTasks);
    if (isCloud) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateProjectData(projectId, { tasks: newTasks, settings: { currentView, sidebarWidth } }).catch(() => {});
      }, 2000);
    } else {
      saveTasks(newTasks);
    }
  }, [isCloud, projectId, currentView, sidebarWidth]);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    futureRef.current = [...futureRef.current, JSON.parse(JSON.stringify(tasks))];
    const prev = pastRef.current.pop();
    pastRef.current = [...pastRef.current];
    setTasks(prev);
    if (!isCloud) saveTasks(prev);
    showToast('Undo');
  }, [tasks, showToast, isCloud]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    pastRef.current = [...pastRef.current, JSON.parse(JSON.stringify(tasks))];
    const next = futureRef.current.pop();
    futureRef.current = [...futureRef.current];
    setTasks(next);
    if (!isCloud) saveTasks(next);
    showToast('Redo');
  }, [tasks, showToast, isCloud]);

  const changeView = useCallback((view) => {
    setCurrentView(view);
    saveSettings({ currentView: view, sidebarWidth });
  }, [sidebarWidth]);

  const updateSidebarWidth = useCallback((w) => {
    setSidebarWidth(w);
    saveSettings({ currentView, sidebarWidth: w });
  }, [currentView]);

  // Task CRUD
  const addTask = useCallback((taskData) => {
    pushHistory();
    const newTasks = [...tasks, { ...taskData, id: Date.now() }];
    updateTasks(newTasks);
    showToast('Task created');
  }, [tasks, pushHistory, updateTasks, showToast]);

  const updateTask = useCallback((id, taskData) => {
    pushHistory();
    const newTasks = tasks.map(t => (t.id === id ? { ...taskData, id } : t));
    updateTasks(newTasks);
    showToast('Task updated');
  }, [tasks, pushHistory, updateTasks, showToast]);

  const deleteTask = useCallback((id) => {
    pushHistory();
    const newTasks = tasks.filter(t => t.id !== id).map(t =>
      t.dependsOn === id ? { ...t, dependsOn: undefined } : t,
    );
    updateTasks(newTasks);
    showToast('Task deleted');
  }, [tasks, pushHistory, updateTasks, showToast]);

  const moveTask = useCallback((id, newStart, newEnd, daysMoved) => {
    pushHistory();
    const newTasks = JSON.parse(JSON.stringify(tasks));
    const task = newTasks.find(t => t.id === id);
    if (!task) return;
    task.start = newStart;
    task.end = newEnd;

    // Cascade to dependents
    if (daysMoved !== 0) {
      const shifted = shiftDependents(newTasks, id, daysMoved);
      if (shifted > 0) showToast(`Shifted ${shifted} dependent task${shifted > 1 ? 's' : ''}`);
    }
    updateTasks(newTasks);
  }, [tasks, pushHistory, updateTasks, showToast]);

  const importTasks = useCallback((imported) => {
    pushHistory();
    updateTasks(imported);
    showToast('Project imported');
  }, [pushHistory, updateTasks, showToast]);

  const clearAll = useCallback(() => {
    pushHistory();
    updateTasks([]);
    showToast('All tasks cleared');
  }, [pushHistory, updateTasks, showToast]);

  const { startDate, endDate } = calculateDateRange(tasks);

  return {
    tasks,
    currentView,
    sidebarWidth,
    startDate,
    endDate,
    modalTask,
    toast,
    cloudLoaded,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    setModalTask,
    changeView,
    updateSidebarWidth,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    importTasks,
    clearAll,
    undo,
    redo,
    showToast,
  };
}

function shiftDependents(tasks, taskId, daysMoved, visited = new Set()) {
  if (visited.has(taskId)) return 0;
  visited.add(taskId);
  let count = 0;
  tasks.forEach(t => {
    if (t.dependsOn === taskId) {
      const s = new Date(t.start + 'T00:00:00');
      const e = new Date(t.end + 'T00:00:00');
      s.setDate(s.getDate() + daysMoved);
      e.setDate(e.getDate() + daysMoved);
      t.start = formatDate(s);
      t.end = formatDate(e);
      count++;
      count += shiftDependents(tasks, t.id, daysMoved, visited);
    }
  });
  return count;
}
