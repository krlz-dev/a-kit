import { ACCENT, TEXT, TEXT_DIM, SURFACE } from '../../constants';

export default function DesignsTab({
  savedDesigns,
  onLoadDesign, onDeleteDesign,
  onExportSavedDesign,
}) {
  if (savedDesigns.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 12px", color: TEXT_DIM, fontSize: 11, lineHeight: 1.6 }}>
        No saved designs yet.<br />Use <span style={{ color: ACCENT }}>Save</span> in Tools to save your canvas.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {savedDesigns.map(d => (
          <div key={d.savedAt} style={{
            background: SURFACE, borderRadius: 10, padding: "10px 12px",
            border: `1px solid rgba(200,230,0,0.04)`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {d.name}
              </div>
              <div style={{ fontSize: 10, color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
                {d.nodes.length} nodes · {new Date(d.savedAt).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
              <button className="sidebar-btn" title="Load design" onClick={() => onLoadDesign(d)} style={{ padding: "5px 7px", gap: 0, justifyContent: "center", borderColor: "rgba(200,230,0,0.1)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="currentColor" /></svg>
              </button>
              <button className="sidebar-btn" title="Export as JSON" onClick={() => onExportSavedDesign(d)} style={{ padding: "5px 7px", gap: 0, justifyContent: "center", borderColor: "rgba(200,230,0,0.1)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" /></svg>
              </button>
              <button className="sidebar-btn" title="Delete design" onClick={() => { if (confirm(`Delete "${d.name}"?`)) onDeleteDesign(d.savedAt); }} style={{ padding: "5px 7px", gap: 0, justifyContent: "center", color: "#f87171", borderColor: "rgba(248,113,113,0.15)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#f87171" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
