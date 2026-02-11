import { useEffect } from 'react';

export function useKeyboardShortcuts({ deleteSelected, editingLabel, undo, redo, clearSelection }) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !editingLabel) deleteSelected();
      if (e.key === 'Escape') clearSelection();
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteSelected, editingLabel, undo, redo, clearSelection]);
}
