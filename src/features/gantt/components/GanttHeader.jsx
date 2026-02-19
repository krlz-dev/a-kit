import { useRef, useState } from 'react';
import { viewConfig } from '../utils/viewConfig';
import { exportAsSVG, exportAsPNG, exportJSON } from '../utils/ganttExport';

const S = {
  header: {
    height: 56, background: '#0e140e', borderBottom: '1px solid rgba(200,230,0,0.06)',
    display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8,
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  title: { fontSize: 16, fontWeight: 700, color: '#c8e600', marginRight: 8, textDecoration: 'none' },
  btn: {
    padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(200,230,0,0.1)',
    background: 'transparent', color: '#b0c4b0', cursor: 'pointer', fontSize: 12,
    fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace",
    display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
    position: 'relative',
  },
  btnDisabled: { opacity: 0.3, pointerEvents: 'none' },
  addBtn: {
    padding: '6px 14px', borderRadius: 8, border: 'none', background: '#c8e600', color: '#080c08',
    cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace",
    display: 'inline-flex', alignItems: 'center', gap: 4,
  },
  dropdown: {
    position: 'absolute', top: '100%', right: 0, marginTop: 4,
    background: '#0e140e', border: '1px solid rgba(200,230,0,0.1)', borderRadius: 8,
    padding: '4px 0', minWidth: 160, zIndex: 200,
  },
  dropItem: {
    display: 'block', width: '100%', padding: '8px 14px', border: 'none',
    background: 'transparent', color: '#d8e4d8', fontSize: 12, cursor: 'pointer',
    textAlign: 'left', fontFamily: "'IBM Plex Mono', monospace",
  },
  dropDivider: {
    height: 1, background: 'rgba(200,230,0,0.06)', margin: '4px 0',
  },
  dropHeader: {
    padding: '6px 14px', fontSize: 10, color: '#8a9b8a', textTransform: 'uppercase', letterSpacing: 1,
  },
};

export default function GanttHeader({
  currentView, canUndo, canRedo,
  onUndo, onRedo, onChangeView, onAddTask, onScrollToToday,
  tasks, startDate, endDate, sidebarWidth,
  onExportJSON, onImportJSON, onClearAll,
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const importRef = useRef(null);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        onImportJSON(data);
      } catch { /* ignore bad json */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header style={S.header}>
      <a href="#/" style={S.title}>kit-a Gantt</a>
      <div style={{ flex: 1 }} />

      {/* Undo/Redo */}
      <button style={{ ...S.btn, ...(canUndo ? {} : S.btnDisabled) }} onClick={onUndo} title="Undo (Ctrl+Z)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
      </button>
      <button style={{ ...S.btn, ...(canRedo ? {} : S.btnDisabled) }} onClick={onRedo} title="Redo (Ctrl+Y)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
      </button>

      {/* View Mode */}
      <div style={{ position: 'relative' }}>
        <button style={S.btn} onClick={() => { setViewOpen(!viewOpen); setMenuOpen(false); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {viewConfig[currentView]?.label || 'Days'}
        </button>
        {viewOpen && (
          <div style={S.dropdown}>
            {Object.keys(viewConfig).map(v => (
              <button key={v} style={{ ...S.dropItem, color: v === currentView ? '#c8e600' : '#d8e4d8' }}
                onClick={() => { onChangeView(v); setViewOpen(false); }}>
                {viewConfig[v].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Today */}
      <button style={S.btn} onClick={onScrollToToday}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Today
      </button>

      {/* Settings dropdown */}
      <div style={{ position: 'relative' }}>
        <button style={S.btn} onClick={() => { setMenuOpen(!menuOpen); setViewOpen(false); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </button>
        {menuOpen && (
          <div style={S.dropdown}>
            <div style={S.dropHeader}>Export Image</div>
            <button style={S.dropItem} onClick={() => { exportAsPNG(tasks, currentView, startDate, endDate, sidebarWidth); setMenuOpen(false); }}>
              Export as PNG
            </button>
            <button style={S.dropItem} onClick={() => { exportAsSVG(tasks, currentView, startDate, endDate, sidebarWidth); setMenuOpen(false); }}>
              Export as SVG
            </button>
            <div style={S.dropDivider} />
            <div style={S.dropHeader}>Project Data</div>
            <button style={S.dropItem} onClick={() => { exportJSON(tasks); setMenuOpen(false); }}>
              Export JSON
            </button>
            <button style={S.dropItem} onClick={() => { importRef.current?.click(); setMenuOpen(false); }}>
              Import JSON
            </button>
            <div style={S.dropDivider} />
            <button style={{ ...S.dropItem, color: '#f87171' }} onClick={() => { onClearAll(); setMenuOpen(false); }}>
              Clear All
            </button>
          </div>
        )}
      </div>

      <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />

      {/* Add Task */}
      <button style={S.addBtn} onClick={onAddTask}>+ Add Task</button>

      {/* Close dropdowns on click outside */}
      {(viewOpen || menuOpen) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150 }}
          onClick={() => { setViewOpen(false); setMenuOpen(false); }} />
      )}
    </header>
  );
}
