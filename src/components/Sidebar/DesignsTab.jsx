import { useState } from 'react';
import { ACCENT, TEXT, TEXT_DIM, TEXT_MID, SURFACE } from '../../constants';

export default function DesignsTab({
  nodes, connections,
  savedDesigns,
  onSaveDesign, onLoadDesign, onDeleteDesign,
  onExportDesign, onExportSavedDesign, onImportDesign,
}) {
  const [saveName, setSaveName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSave = () => {
    const name = saveName.trim();
    if (!name) return;
    onSaveDesign(name);
    setSaveName('');
    setShowInput(false);
  };

  return (
    <div>
      {/* Save current */}
      <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
        Current Canvas
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {showInput ? (
          <div style={{ display: "flex", gap: 4 }}>
            <input
              autoFocus
              placeholder="Design name..."
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowInput(false); }}
              style={{
                flex: 1, background: SURFACE, border: `1px solid ${ACCENT}30`,
                borderRadius: 6, color: TEXT, fontSize: 11, padding: "6px 8px",
                outline: "none", fontFamily: "'IBM Plex Mono', monospace",
              }}
            />
            <button className="sidebar-btn" onClick={handleSave} style={{ flex: "none", width: 60 }}>
              Save
            </button>
          </div>
        ) : (
          <button className="sidebar-btn" onClick={() => setShowInput(true)} disabled={nodes.length === 0}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" fill="currentColor" /></svg>
            Save current design
          </button>
        )}

        <button className="sidebar-btn" onClick={onExportDesign} disabled={nodes.length === 0}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" /></svg>
          Export as JSON
        </button>

        <button className="sidebar-btn" onClick={onImportDesign}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" fill="currentColor" /></svg>
          Import from JSON
        </button>
      </div>

      {/* Saved designs list */}
      {savedDesigns.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
            Saved ({savedDesigns.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {savedDesigns.map(d => (
              <div key={d.savedAt} style={{
                background: SURFACE, borderRadius: 10, padding: "10px 12px",
                border: `1px solid rgba(200,230,0,0.04)`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 3 }}>
                  {d.name}
                </div>
                <div style={{ fontSize: 10, color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8 }}>
                  {d.nodes.length} nodes · {new Date(d.savedAt).toLocaleDateString()}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="sidebar-btn" onClick={() => onLoadDesign(d)} style={{ flex: 1, fontSize: 10, padding: "4px 0" }}>
                    Load
                  </button>
                  <button className="sidebar-btn" onClick={() => onExportSavedDesign(d)} style={{ flex: 1, fontSize: 10, padding: "4px 0" }}>
                    Export
                  </button>
                  <button className="sidebar-btn danger" onClick={() => onDeleteDesign(d.savedAt)} style={{ flex: "none", fontSize: 10, padding: "4px 8px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
