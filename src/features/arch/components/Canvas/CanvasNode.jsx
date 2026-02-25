import { ACCENT, CARD_BG, CARD_BORDER, TEXT, TEXT_MID } from '../../constants';
import NodeIcon from '../NodeIcon';

export default function CanvasNode({
  node, selected, dragging, connectMode, editingLabel, isMultiSelected,
  onPointerDown, onDoubleClick, onLabelChange, onEditDone, onResizeStart,
}) {
  const isSel = selected === node.id;
  const isHighlighted = isSel || isMultiSelected;
  const isTarget = connectMode && connectMode !== node.id;
  const isSrc = connectMode === node.id;
  const isGroup = node.type === 'group';

  if (isGroup) {
    return (
      <div
        data-node="true"
        onPointerDown={onPointerDown}
        onDoubleClick={onDoubleClick}
        style={{
          position: "absolute", left: node.x, top: node.y, width: node.w, height: node.h,
          zIndex: isHighlighted ? 1 : 0,
          background: `${node.color}0a`,
          border: `2px dashed ${isSrc ? ACCENT : isTarget ? `${ACCENT}44` : isHighlighted ? `${node.color}80` : `${node.color}25`}`,
          borderRadius: 16,
          cursor: dragging === node.id ? "grabbing" : isTarget ? "pointer" : "grab",
          transition: dragging === node.id ? "none" : "border-color 0.2s, box-shadow 0.2s",
          boxShadow: isHighlighted ? `0 0 0 1px ${node.color}25, 0 4px 20px ${node.color}10` : "none",
          touchAction: "none",
        }}
      >
        {/* Top-left label badge */}
        <div style={{
          position: "absolute", top: 8, left: 10,
          display: "flex", alignItems: "center", gap: 6,
          padding: "3px 10px 3px 6px",
          background: `${node.color}15`,
          borderRadius: 8,
          maxWidth: node.w - 28,
        }}>
          <NodeIcon icon={node.icon} iconUrl={node.iconUrl} color={node.color} size={14} />
          {editingLabel === node.id ? (
            <input
              autoFocus
              defaultValue={node.label}
              onBlur={(e) => { onLabelChange(node.id, e.target.value); onEditDone(); }}
              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") onEditDone(); }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                width: 100, background: "rgba(0,0,0,0.5)", border: `1px solid ${ACCENT}40`,
                borderRadius: 4, color: TEXT, fontSize: 10, fontWeight: 600,
                padding: "2px 4px", outline: "none", fontFamily: "'IBM Plex Mono', monospace",
              }}
            />
          ) : (
            <span style={{
              fontSize: 10, fontWeight: 600, color: node.color, opacity: 0.9,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {node.label}
            </span>
          )}
        </div>

        {/* Resize handle */}
        <div
          onPointerDown={(e) => { e.stopPropagation(); onResizeStart(e); }}
          style={{
            position: "absolute", bottom: 0, right: 0,
            width: 18, height: 18, cursor: "nwse-resize",
            opacity: isHighlighted ? 0.7 : 0.2,
            transition: "opacity 0.2s",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ position: "absolute", bottom: 4, right: 4 }}>
            <path d="M8 2L8 8L2 8" fill="none" stroke={node.color} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {isSrc && (
          <div style={{
            position: "absolute", top: -5, right: -5, width: 12, height: 12, borderRadius: "50%",
            background: ACCENT, animation: "dotPulse 1s ease infinite", boxShadow: `0 0 10px ${ACCENT}`,
          }} />
        )}

        {isMultiSelected && (
          <div style={{
            position: "absolute", inset: -1, borderRadius: 16,
            border: `1.5px solid ${ACCENT}40`,
            pointerEvents: "none",
          }} />
        )}
      </div>
    );
  }

  // Regular node rendering
  return (
    <div
      data-node="true"
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      style={{
        position: "absolute", left: node.x, top: node.y, width: node.w, minHeight: node.h,
        zIndex: isHighlighted || dragging === node.id ? 15 : 10,
        background: CARD_BG, backdropFilter: "blur(12px)",
        border: `1.5px solid ${isSrc ? ACCENT : isTarget ? `${ACCENT}44` : isHighlighted ? `${node.color}70` : CARD_BORDER}`,
        borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
        padding: "10px 6px",
        cursor: dragging === node.id ? "grabbing" : isTarget ? "pointer" : "grab",
        transition: dragging === node.id ? "none" : "all 0.2s ease",
        boxShadow: isHighlighted
          ? `0 0 0 1px ${node.color}30, 0 4px 20px ${node.color}15`
          : isTarget ? `0 0 16px ${ACCENT}12` : "0 2px 12px rgba(0,0,0,0.3)",
        transform: isTarget ? "scale(1.06)" : isHighlighted && dragging !== node.id ? "scale(1.03)" : "scale(1)",
        touchAction: "none",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 20, right: 20, height: 2, background: node.color, opacity: 0.25, borderRadius: "0 0 2px 2px" }} />

      <NodeIcon icon={node.icon} iconUrl={node.iconUrl} color={node.color} size={22} />

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
          fontSize: 11, fontWeight: 600, color: TEXT_MID, textAlign: "center", lineHeight: 1.25,
          maxWidth: node.w - 12, wordBreak: "break-word",
        }}>{node.label}</span>
      )}

      {isSrc && (
        <div style={{
          position: "absolute", top: -5, right: -5, width: 12, height: 12, borderRadius: "50%",
          background: ACCENT, animation: "dotPulse 1s ease infinite", boxShadow: `0 0 10px ${ACCENT}`,
        }} />
      )}

      {isMultiSelected && (
        <div style={{
          position: "absolute", inset: -1, borderRadius: 16,
          border: `1.5px solid ${ACCENT}40`,
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}
