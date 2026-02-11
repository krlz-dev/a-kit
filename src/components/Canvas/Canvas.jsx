import { ACCENT, TEXT_DIM } from '../../constants';
import ConnectionLayer from './ConnectionLayer';
import CanvasNode from './CanvasNode';
import AddMenu from './AddMenu';
import Toast from '../Toast';

export default function Canvas({
  canvasRef, nodes, connections, nodeMap,
  selected, selectedConn, dragging, connectMode, editingLabel,
  animating, speed, toast,
  addMenuOpen, onToggleAddMenu, onAddNode,
  onCanvasClick, onNodePointerDown, onNodeDoubleClick,
  onLabelChange, onEditDone, onSelectConn,
}) {
  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <div ref={canvasRef} onClick={onCanvasClick} style={{ width: "100%", height: "100%", position: "relative", touchAction: "none" }}>

        {/* Dot grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.7" fill="rgba(200,230,0,0.045)" />
            </pattern>
            <radialGradient id="glw" cx="50%" cy="40%">
              <stop offset="0%" stopColor="rgba(200,230,0,0.025)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
          <rect width="100%" height="100%" fill="url(#glw)" />
        </svg>

        <ConnectionLayer
          connections={connections} nodeMap={nodeMap}
          selectedConn={selectedConn} onSelectConn={onSelectConn}
          animating={animating} speed={speed}
        />

        {/* Empty state */}
        {nodes.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", gap: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", border: `2px dashed ${ACCENT}22`,
              display: "flex", alignItems: "center", justifyContent: "center", animation: "float 4s ease-in-out infinite",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24">
                <path d="M14 12l-2 2-2-2 2-2 2 2zm-2-6l2.12 2.12 2.5-2.5L12 1 7.38 5.62l2.5 2.5L12 6zm-6 6l2.12-2.12-2.5-2.5L1 12l4.62 4.62 2.5-2.5L6 12zm12 0l-2.12 2.12 2.5 2.5L23 12l-4.62-4.62-2.5 2.5L18 12zm-6 6l-2.12-2.12-2.5 2.5L12 23l4.62-4.62-2.5-2.5L12 18z" fill={ACCENT} opacity="0.3" />
              </svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: `${ACCENT}88`, letterSpacing: "-0.01em" }}>Add a node to start</div>
            <div style={{ fontSize: 12, color: TEXT_DIM }}>Click the + button or load a template</div>
          </div>
        )}

        {/* Nodes */}
        {nodes.map(node => (
          <CanvasNode
            key={node.id} node={node}
            selected={selected} dragging={dragging}
            connectMode={connectMode} editingLabel={editingLabel}
            onPointerDown={(e) => onNodePointerDown(e, node)}
            onDoubleClick={(e) => onNodeDoubleClick(e, node.id)}
            onLabelChange={onLabelChange} onEditDone={onEditDone}
          />
        ))}

        {/* Connect mode banner */}
        {connectMode && nodeMap[connectMode] && (
          <div style={{
            position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 30,
            background: "rgba(10,14,10,0.92)", border: `1px solid ${ACCENT}30`, borderRadius: 10,
            padding: "7px 18px", fontSize: 12, fontWeight: 600, color: ACCENT,
            backdropFilter: "blur(12px)", animation: "fadeIn 0.15s ease-out",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, animation: "dotPulse 1s ease infinite" }} />
            Linking from {nodeMap[connectMode].label}… click a target
          </div>
        )}

        <Toast message={toast} />

        <AddMenu open={addMenuOpen} onToggle={onToggleAddMenu} onAdd={onAddNode} />
      </div>
    </div>
  );
}
