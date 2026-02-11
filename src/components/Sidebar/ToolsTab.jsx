import { ACCENT, BG, TEXT, TEXT_DIM, TEXT_MID, SURFACE, CONN_COLORS } from '../../constants';
import NodeInspector from './NodeInspector';
import LinkInspector from './LinkInspector';

export default function ToolsTab({
  nodes, connections, nodeMap,
  selected, selectedConn, selectedNode, selectedConnObj,
  connectMode, animating, speed, connColorIdx, undoStack, redoStack,
  onSetEditingLabel, onToggleConnect, onUnlinkSelected, onDeleteSelected,
  onSelectConn, onRemoveConn, onToggleConnDirection,
  onConnLabelChange,
  onToggleAnimating, onSetSpeed, onSetConnColorIdx,
  onUndo, onRedo, onClearAll,
  onSaveDesign, onExportDesign, onImportDesign,
  pushUndo, showToast,
}) {
  if (selectedNode) {
    return (
      <NodeInspector
        node={selectedNode} connections={connections} nodeMap={nodeMap}
        selected={selected} selectedConn={selectedConn}
        connectMode={connectMode}
        onSetEditingLabel={onSetEditingLabel} onToggleConnect={onToggleConnect}
        onUnlink={onUnlinkSelected} onDelete={onDeleteSelected}
        onSelectConn={onSelectConn} onRemoveConn={onRemoveConn}
        pushUndo={pushUndo} nodes={nodes} allConnections={connections} showToast={showToast}
      />
    );
  }

  if (selectedConnObj) {
    return (
      <LinkInspector conn={selectedConnObj} nodeMap={nodeMap} onDelete={onDeleteSelected} onToggleDirection={() => onToggleConnDirection(selectedConnObj.id)} onConnLabelChange={onConnLabelChange} />
    );
  }

  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Canvas</div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, padding: "10px 12px", background: SURFACE, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, fontFamily: "'IBM Plex Mono', monospace" }}>{nodes.length}</div>
          <div style={{ fontSize: 9, color: TEXT_DIM, marginTop: 2 }}>Nodes</div>
        </div>
        <div style={{ flex: 1, padding: "10px 12px", background: SURFACE, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, fontFamily: "'IBM Plex Mono', monospace" }}>{connections.length}</div>
          <div style={{ fontSize: 9, color: TEXT_DIM, marginTop: 2 }}>Links</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Controls</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <button className="sidebar-btn" onClick={onToggleAnimating}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d={animating ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"} fill="currentColor" /></svg>
          {animating ? "Pause animation" : "Play animation"}
        </button>
        <button className="sidebar-btn" onClick={onUndo} disabled={undoStack.current.length === 0}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill="currentColor" /></svg>
          Undo
          <span style={{ marginLeft: "auto", fontSize: 10, color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>⌘Z</span>
        </button>
        <button className="sidebar-btn" onClick={onRedo} disabled={redoStack.current.length === 0}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" fill="currentColor" /></svg>
          Redo
          <span style={{ marginLeft: "auto", fontSize: 10, color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>⌘⇧Z</span>
        </button>
        <button className="sidebar-btn danger" onClick={onClearAll} disabled={nodes.length === 0}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" /></svg>
          Clear all
        </button>
      </div>

      {/* Speed */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em" }}>Speed</span>
          <span style={{ fontSize: 11, color: TEXT_MID, fontFamily: "'IBM Plex Mono', monospace" }}>{speed.toFixed(1)}s</span>
        </div>
        <input type="range" min="0.8" max="6" step="0.1" value={speed} onChange={e => onSetSpeed(parseFloat(e.target.value))} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 9, color: TEXT_DIM }}>Fast</span>
          <span style={{ fontSize: 9, color: TEXT_DIM }}>Slow</span>
        </div>
      </div>

      {/* Link color */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Link Color</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CONN_COLORS.map((c, i) => (
            <div key={c} className={`conn-color-dot ${connColorIdx === i ? "active" : ""}`}
              style={{ background: c, opacity: connColorIdx === i ? 1 : 0.4 }}
              onClick={() => onSetConnColorIdx(i)} />
          ))}
        </div>
      </div>

      {/* File */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>File</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <button className="sidebar-btn" onClick={() => onSaveDesign(prompt("Design name:") || "")} disabled={nodes.length === 0}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" fill="currentColor" /></svg>
            Save
          </button>
          <button className="sidebar-btn" onClick={onExportDesign} disabled={nodes.length === 0}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" /></svg>
            Export JSON
          </button>
          <button className="sidebar-btn" onClick={onImportDesign}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" fill="currentColor" /></svg>
            Import JSON
          </button>
        </div>
      </div>

    </div>
  );
}
