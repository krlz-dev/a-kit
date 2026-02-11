import { ACCENT, TEXT, TEXT_DIM, SURFACE, BG } from '../../constants';

export default function LinkInspector({ conn, nodeMap, onDelete, onToggleDirection, onConnLabelChange }) {
  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Selected Link</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: SURFACE, borderRadius: 12, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: conn.color }} />
        <span style={{ fontSize: 12, color: TEXT }}>{nodeMap[conn.from]?.label} {conn.bidir ? "\u2194" : "\u2192"} {nodeMap[conn.to]?.label}</span>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Label</div>
        <input
          type="text"
          value={conn.label || ""}
          onChange={e => onConnLabelChange(conn.id, e.target.value)}
          placeholder="Connection label…"
          style={{
            width: "100%", padding: "8px 10px", background: BG, border: `1px solid ${SURFACE}`,
            borderRadius: 8, color: TEXT, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
            outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = ACCENT}
          onBlur={e => e.target.style.borderColor = SURFACE}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <button className="sidebar-btn" onClick={onToggleDirection}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>{conn.bidir ? "\u2194" : "\u2192"}</span>
          {conn.bidir ? "Make one-way" : "Make bidirectional"}
        </button>
        <button className="sidebar-btn danger" onClick={onDelete}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" /></svg>
          Remove link
        </button>
      </div>
    </div>
  );
}
