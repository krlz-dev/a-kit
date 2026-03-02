import { useState } from 'react';
import { ACCENT, ACCENT_DIM, BG, SIDEBAR_BG, TEXT, TEXT_DIM, DIVIDER } from '../../constants';
import ToolsTab from './ToolsTab';
import TemplatesTab from './TemplatesTab';

export default function Sidebar({
  isOpen, onClose,
  nodes, connections, nodeMap,
  selected, selectedConn, selectedNode, selectedConnObj,
  connectMode, animating, speed, connColorIdx, undoStack, redoStack,
  canvasSize, onSetCanvasSize,
  multiSelected, onFocusNode, onDeleteMultiSelected,
  onSetEditingLabel, onToggleConnect, onUnlinkSelected, onDeleteSelected,
  onSelectConn, onRemoveConn, onToggleConnDirection,
  onConnLabelChange, onConnColorChange,
  onToggleAnimating, onSetSpeed, onSetConnColorIdx,
  onUndo, onRedo, onClearAll, onLoadTemplate,
  onExportDesign, onImportDesign,
  onNodeColorChange, onAddNode, onDeselectAll,
  pushUndo, showToast,
}) {
  const [sidebarTab, setSidebarTab] = useState("tools");

  return (
    <>
      {/* Drawer */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, zIndex: 30,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: SIDEBAR_BG, borderRight: `1px solid ${DIVIDER}`,
        display: "flex", flexDirection: "column", backdropFilter: "blur(20px)",
      }}>
        {/* Logo + Close */}
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
            <button onClick={onClose} style={{
              marginLeft: 'auto', background: 'transparent', border: 'none',
              color: TEXT_DIM, cursor: 'pointer', padding: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, transition: 'color 0.15s',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${DIVIDER}` }}>
          {[
            { id: "tools", label: "Tools" },
            { id: "templates", label: "Templates" },
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
        <div className="sidebar-scroll" style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
          {sidebarTab === "tools" && (
            <ToolsTab
              nodes={nodes} connections={connections} nodeMap={nodeMap}
              selected={selected} selectedConn={selectedConn}
              selectedNode={selectedNode} selectedConnObj={selectedConnObj}
              connectMode={connectMode} animating={animating} speed={speed}
              connColorIdx={connColorIdx} undoStack={undoStack} redoStack={redoStack}
              canvasSize={canvasSize} onSetCanvasSize={onSetCanvasSize}
              multiSelected={multiSelected} onFocusNode={onFocusNode}
              onDeleteMultiSelected={onDeleteMultiSelected}
              onSetEditingLabel={onSetEditingLabel} onToggleConnect={onToggleConnect}
              onUnlinkSelected={onUnlinkSelected} onDeleteSelected={onDeleteSelected}
              onSelectConn={onSelectConn} onRemoveConn={onRemoveConn}
              onToggleConnDirection={onToggleConnDirection}
              onConnLabelChange={onConnLabelChange}
              onConnColorChange={onConnColorChange}
              onToggleAnimating={onToggleAnimating} onSetSpeed={onSetSpeed}
              onSetConnColorIdx={onSetConnColorIdx}
              onUndo={onUndo} onRedo={onRedo} onClearAll={onClearAll}
              onExportDesign={onExportDesign}
              onImportDesign={onImportDesign}
              onNodeColorChange={onNodeColorChange}
              onAddNode={onAddNode} onDeselectAll={onDeselectAll}
              pushUndo={pushUndo} showToast={showToast}
            />
          )}
          {sidebarTab === "templates" && (
            <TemplatesTab onLoadTemplate={onLoadTemplate} nodes={nodes} />
          )}
        </div>

        {/* Bottom hint */}
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${DIVIDER}`, fontSize: 10, color: TEXT_DIM, lineHeight: 1.4 }}>
          {connectMode ? (
            <span style={{ color: ACCENT }}>Click a target node to link</span>
          ) : multiSelected && multiSelected.size > 1 ? (
            "Drag to move all \u00B7 Delete to remove \u00B7 Shift+click to toggle"
          ) : selected ? (
            "Press Delete to remove \u00B7 Double-click to rename"
          ) : (
            "Click a node to select \u00B7 Drag canvas to marquee-select"
          )}
        </div>
      </div>
    </>
  );
}
