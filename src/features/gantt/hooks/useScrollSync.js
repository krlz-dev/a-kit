import { useRef, useCallback } from 'react';

export function useScrollSync() {
  const taskListRef = useRef(null);
  const timelineRef = useRef(null);
  const syncingRef = useRef(false);

  const onTaskListScroll = useCallback(() => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (timelineRef.current && taskListRef.current) {
      timelineRef.current.scrollTop = taskListRef.current.scrollTop;
    }
    syncingRef.current = false;
  }, []);

  const onTimelineScroll = useCallback(() => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (taskListRef.current && timelineRef.current) {
      taskListRef.current.scrollTop = timelineRef.current.scrollTop;
    }
    syncingRef.current = false;
  }, []);

  return { taskListRef, timelineRef, onTaskListScroll, onTimelineScroll };
}
