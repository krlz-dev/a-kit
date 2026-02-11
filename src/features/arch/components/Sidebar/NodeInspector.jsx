import { ACCENT, TEXT, TEXT_DIM, TEXT_MID, SURFACE } from '../../constants';
import Icon from '../../../../shared/components/Icon';

const PALETTE = ["#3b82f6","#6366f1","#8b5cf6","#a855f7","#ec4899","#f97316","#f59e0b","#eab308","#4ade80","#10b981","#14b8a6","#06b6d4","#64748b","#ef4444"];

export default function NodeInspector({
  node, connections, nodeMap, selected, selectedConn,
  connectMode, onSetEditingLabel, onToggleConnect, onUnlink, onDelete,
  onSelectConn, onRemoveConn, onNodeColorChange, pushUndo, nodes, allConnections, showToast,
}) {
  const nodeConnections = connections.filter(c => c.from === selected || c.to === selected);

  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Selected Node</div>

      {/* Node preview */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: SURFACE,
        borderRadius: 12, border: `1px solid ${node.color}25`, marginBottom: 14,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${node.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon path={node.icon} color={node.color} size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.label}</div>
          <div style={{ fontSize: 10, color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>{node.type}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <button className="sidebar-btn" onClick={() => onSetEditingLabel(selected)}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" /></svg>
          Rename
        </button>
        {connectMode === selected ? (
          <button className="sidebar-btn active" onClick={() => onToggleConnect()}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor" /></svg>
            Cancel linking…
          </button>
        ) : (
          <div style={{ display: "flex", gap: 3 }}>
            <button className="sidebar-btn" style={{ flex: 1 }} onClick={() => onToggleConnect(false)}>
              <span style={{ fontSize: 14 }}>{'\u2192'}</span> Link
            </button>
            <button className="sidebar-btn" style={{ flex: 1 }} onClick={() => onToggleConnect(true)}>
              <span style={{ fontSize: 14 }}>{'\u2194'}</span> Link
            </button>
          </div>
        )}
        <button className="sidebar-btn" onClick={onUnlink} disabled={nodeConnections.length === 0}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1S5.29 8.9 7 8.9h4V7H7zM2 4l1.5-1.5L21 20l-1.5 1.5L2 4z" fill="currentColor" /></svg>
          Unlink all ({nodeConnections.length})
        </button>
        <button className="sidebar-btn danger" onClick={onDelete}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" /></svg>
          Delete node
        </button>
      </div>

      {/* Color */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Color</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PALETTE.map(c => (
            <div key={c} onClick={() => onNodeColorChange(node.id, c)} style={{
              width: 18, height: 18, borderRadius: "50%", background: c, cursor: "pointer",
              border: node.color === c ? "2px solid white" : "2px solid transparent",
              opacity: node.color === c ? 1 : 0.5,
              transition: "all 0.15s",
            }} />
          ))}
        </div>
      </div>

      {/* Links list */}
      {nodeConnections.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Links</div>
          {nodeConnections.map(conn => {
            const other = conn.from === selected ? nodeMap[conn.to] : nodeMap[conn.from];
            if (!other) return null;
            return (
              <div key={conn.id} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8,
                marginBottom: 3, cursor: "pointer", transition: "all 0.15s",
                background: selectedConn === conn.id ? `${conn.color}12` : "transparent",
                border: `1px solid ${selectedConn === conn.id ? conn.color + "30" : "transparent"}`,
              }}
                onClick={() => onSelectConn(conn.id === selectedConn ? null : conn.id)}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: conn.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: TEXT_MID, flex: 1 }}>{conn.bidir ? "\u2194" : conn.from === selected ? "\u2192" : "\u2190"} {other.label}{conn.label && <span style={{ color: TEXT_DIM, fontSize: 10 }}> · {conn.label}</span>}</span>
                <span onClick={(e) => { e.stopPropagation(); onRemoveConn(conn.id); }}
                  style={{ fontSize: 15, color: TEXT_DIM, cursor: "pointer", lineHeight: 1, padding: "0 2px" }}
                  title="Remove link">×</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
