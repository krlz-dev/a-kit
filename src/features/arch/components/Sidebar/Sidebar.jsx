import { useState } from 'react';
import { ACCENT, ACCENT_DIM, BG, SIDEBAR_BG, TEXT, TEXT_DIM, DIVIDER } from '../../constants';
import ToolsTab from './ToolsTab';
import TemplatesTab from './TemplatesTab';
import DesignsTab from './DesignsTab';

export default function Sidebar({
  nodes, connections, nodeMap,
  selected, selectedConn, selectedNode, selectedConnObj,
  connectMode, animating, speed, connColorIdx, undoStack, redoStack,
  savedDesigns,
  onSetEditingLabel, onToggleConnect, onUnlinkSelected, onDeleteSelected,
  onSelectConn, onRemoveConn, onToggleConnDirection,
  onConnLabelChange,
  onToggleAnimating, onSetSpeed, onSetConnColorIdx,
  onUndo, onRedo, onClearAll, onLoadTemplate,
  onSaveDesign, onLoadDesign, onDeleteDesign,
  onExportDesign, onExportSavedDesign, onImportDesign,
  onNodeColorChange, onAddNode, onDeselectAll,
  pushUndo, showToast,
}) {
  const [sidebarTab, setSidebarTab] = useState("tools");

  return (
    <div style={{
      width: 260, flexShrink: 0, background: SIDEBAR_BG, borderRight: `1px solid ${DIVIDER}`,
      display: "flex", flexDirection: "column", backdropFilter: "blur(20px)", zIndex: 20,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 18px 14px", borderBottom: `1px solid ${DIVIDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <a href="#/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24"><path d="M14 12l-2 2-2-2 2-2 2 2zm-2-6l2.12 2.12 2.5-2.5L12 1 7.38 5.62l2.5 2.5L12 6zm-6 6l2.12-2.12-2.5-2.5L1 12l4.62 4.62 2.5-2.5L6 12zm12 0l-2.12 2.12 2.5 2.5L23 12l-4.62-4.62-2.5 2.5L18 12zm-6 6l-2.12-2.12-2.5 2.5L12 23l4.62-4.62-2.5-2.5L12 18z" fill={BG} /></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>kit-a Arch</div>
              <div style={{ fontSize: 10, color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>v1.0</div>
            </div>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${DIVIDER}` }}>
        {[
          { id: "tools", label: "Tools" },
          { id: "templates", label: "Templates" },
          { id: "saved", label: savedDesigns.length > 0 ? `Saved (${savedDesigns.length})` : "Saved" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setSidebarTab(tab.id)} style={{
            flex: 1, padding: "10px 0", background: "transparent", border: "none",
            borderBottom: sidebarTab === tab.id ? `2px solid ${ACCENT}` : "2px solid transparent",
            color: sidebarTab === tab.id ? ACCENT : TEXT_DIM,
            fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.2s", letterSpacing: "0.03em",
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
        {sidebarTab === "tools" && (
          <ToolsTab
            nodes={nodes} connections={connections} nodeMap={nodeMap}
            selected={selected} selectedConn={selectedConn}
            selectedNode={selectedNode} selectedConnObj={selectedConnObj}
            connectMode={connectMode} animating={animating} speed={speed}
            connColorIdx={connColorIdx} undoStack={undoStack} redoStack={redoStack}
            onSetEditingLabel={onSetEditingLabel} onToggleConnect={onToggleConnect}
            onUnlinkSelected={onUnlinkSelected} onDeleteSelected={onDeleteSelected}
            onSelectConn={onSelectConn} onRemoveConn={onRemoveConn}
            onToggleConnDirection={onToggleConnDirection}
            onConnLabelChange={onConnLabelChange}
            onToggleAnimating={onToggleAnimating} onSetSpeed={onSetSpeed}
            onSetConnColorIdx={onSetConnColorIdx}
            onUndo={onUndo} onRedo={onRedo} onClearAll={onClearAll}
            onSaveDesign={onSaveDesign}
            onExportDesign={onExportDesign}
            onImportDesign={onImportDesign}
            onNodeColorChange={onNodeColorChange}
            onAddNode={onAddNode} onDeselectAll={onDeselectAll}
            pushUndo={pushUndo} showToast={showToast}
          />
        )}
        {sidebarTab === "templates" && (
          <TemplatesTab onLoadTemplate={onLoadTemplate} />
        )}
        {sidebarTab === "saved" && (
          <DesignsTab
            savedDesigns={savedDesigns}
            onLoadDesign={onLoadDesign}
            onDeleteDesign={onDeleteDesign}
            onExportSavedDesign={onExportSavedDesign}
          />
        )}
      </div>

      {/* Bottom hint */}
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${DIVIDER}`, fontSize: 10, color: TEXT_DIM, lineHeight: 1.4 }}>
        {connectMode ? (
          <span style={{ color: ACCENT }}>Click a target node to link</span>
        ) : selected ? (
          "Press Delete to remove \u00B7 Double-click to rename"
        ) : (
          "Click a node to select \u00B7 Add components above"
        )}
      </div>
    </div>
  );
}
