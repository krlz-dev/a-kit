import { useRef, useCallback } from 'react';
import { MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH } from '../constants/ganttTheme';

export function useSidebarResize(sidebarWidth, updateSidebarWidth) {
  const resizeRef = useRef(null);

  const onResizeStart = useCallback((e) => {
    resizeRef.current = { startX: e.clientX, startWidth: sidebarWidth };
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, [sidebarWidth]);

  const onResizeMove = useCallback((e) => {
    if (!resizeRef.current) return;
    const dx = e.clientX - resizeRef.current.startX;
    const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, resizeRef.current.startWidth + dx));
    updateSidebarWidth(newWidth);
  }, [updateSidebarWidth]);

  const onResizeEnd = useCallback(() => {
    if (!resizeRef.current) return;
    resizeRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  return { onResizeStart, onResizeMove, onResizeEnd };
}
