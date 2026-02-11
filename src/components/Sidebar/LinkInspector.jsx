import { TEXT, TEXT_DIM, SURFACE } from '../../constants';

export default function LinkInspector({ conn, nodeMap, onDelete }) {
  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Selected Link</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: SURFACE, borderRadius: 12, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: conn.color }} />
        <span style={{ fontSize: 12, color: TEXT }}>{nodeMap[conn.from]?.label} → {nodeMap[conn.to]?.label}</span>
      </div>
      <button className="sidebar-btn danger" onClick={onDelete}>
        <svg width="15" height="15" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" /></svg>
        Remove link
      </button>
    </div>
  );
}
