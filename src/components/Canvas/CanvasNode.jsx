import { ACCENT, CARD_BG, CARD_BORDER, TEXT, TEXT_MID } from '../../constants';
import Icon from '../Icon';

export default function CanvasNode({
  node, selected, dragging, connectMode, editingLabel,
  onPointerDown, onDoubleClick, onLabelChange, onEditDone,
}) {
  const isSel = selected === node.id;
  const isTarget = connectMode && connectMode !== node.id;
  const isSrc = connectMode === node.id;
  const isGroup = node.type === 'group';

  return (
    <div
      data-node="true"
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      style={{
        position: "absolute", left: node.x, top: node.y, width: node.w, height: node.h,
        zIndex: isGroup ? 5 : isSel || dragging === node.id ? 15 : 10,
        background: isGroup ? "rgba(16,22,16,0.45)" : CARD_BG,
        backdropFilter: "blur(12px)",
        border: isGroup
          ? `2px dashed ${isSrc ? ACCENT : isTarget ? `${ACCENT}44` : isSel ? `${node.color}70` : `${node.color}30`}`
          : `1.5px solid ${isSrc ? ACCENT : isTarget ? `${ACCENT}44` : isSel ? `${node.color}70` : CARD_BORDER}`,
        borderRadius: isGroup ? 20 : 16,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
        cursor: dragging === node.id ? "grabbing" : isTarget ? "pointer" : "grab",
        transition: dragging === node.id ? "none" : "all 0.2s ease",
        boxShadow: isSel
          ? `0 0 0 1px ${node.color}30, 0 4px 20px ${node.color}15`
          : isTarget ? `0 0 16px ${ACCENT}12` : "0 2px 12px rgba(0,0,0,0.3)",
        transform: isTarget ? "scale(1.06)" : isSel && dragging !== node.id ? "scale(1.03)" : "scale(1)",
        touchAction: "none",
      }}
    >
      {!isGroup && (
        <div style={{ position: "absolute", top: 0, left: 20, right: 20, height: 2, background: node.color, opacity: 0.25, borderRadius: "0 0 2px 2px" }} />
      )}

      <Icon path={node.icon} color={node.color} size={isGroup ? 28 : 22} />

      {editingLabel === node.id ? (
        <input
          autoFocus
          defaultValue={node.label}
          onBlur={(e) => { onLabelChange(node.id, e.target.value); onEditDone(); }}
          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") onEditDone(); }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            width: node.w - 16, background: "rgba(0,0,0,0.5)", border: `1px solid ${ACCENT}40`,
            borderRadius: 6, color: TEXT, fontSize: 11, fontWeight: 600, textAlign: "center",
            padding: "3px 4px", outline: "none", fontFamily: "'IBM Plex Mono', monospace",
          }}
        />
      ) : (
        <span style={{
          fontSize: 11, fontWeight: 600, color: TEXT_MID, textAlign: "center", lineHeight: 1.15,
          maxWidth: node.w - 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{node.label}</span>
      )}

      {isSrc && (
        <div style={{
          position: "absolute", top: -5, right: -5, width: 12, height: 12, borderRadius: "50%",
          background: ACCENT, animation: "dotPulse 1s ease infinite", boxShadow: `0 0 10px ${ACCENT}`,
        }} />
      )}
    </div>
  );
}
