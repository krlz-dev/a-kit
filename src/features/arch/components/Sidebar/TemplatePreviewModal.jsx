import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ACCENT, ACCENT_DIM, BG, TEXT, TEXT_DIM, CARD_BG, CARD_BORDER, DIVIDER } from '../../constants';
import { deserializeDesign } from '../../utils/storage';
import CanvasNode from '../Canvas/CanvasNode';
import ConnectionLayer from '../Canvas/ConnectionLayer';

const PREVIEW_W = 680;
const PREVIEW_H = 480;

function buildPreview(template) {
  const { nodes, connections } = deserializeDesign(
    { name: template.name, nodes: template.nodes, conns: template.conns },
    { center: false },
  );

  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + n.w > maxX) maxX = n.x + n.w;
    if (n.y + n.h > maxY) maxY = n.y + n.h;
  }
  const bboxW = maxX - minX || 1;
  const bboxH = maxY - minY || 1;
  const pad = 40;
  const scale = Math.min((PREVIEW_W - pad * 2) / bboxW, (PREVIEW_H - pad * 2) / bboxH, 1);
  const scaledW = bboxW * scale;
  const scaledH = bboxH * scale;
  const offsetX = (PREVIEW_W - scaledW) / 2 - minX * scale;
  const offsetY = (PREVIEW_H - scaledH) / 2 - minY * scale;

  // Apply transform to nodes
  const scaledNodes = nodes.map(n => ({
    ...n,
    x: n.x * scale + offsetX,
    y: n.y * scale + offsetY,
    w: n.w * scale,
    h: n.h * scale,
  }));

  const nodeMap = {};
  scaledNodes.forEach(n => { nodeMap[n.id] = n; });

  return { nodes: scaledNodes, connections, nodeMap };
}

const noop = () => {};

export default function TemplatePreviewModal({ template, nodeCount, onConfirm, onClose }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const hasWork = nodeCount > 0;
  const preview = useMemo(() => buildPreview(template), [template]);

  function handleUse() {
    if (hasWork && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    onConfirm();
  }

  return createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: PREVIEW_W + 40, background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 14px' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{template.name}</div>
          <div style={{ fontSize: 12, color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>{template.desc}</div>
        </div>

        {/* Preview canvas — uses actual CanvasNode + ConnectionLayer */}
        <div style={{
          margin: '0 18px', borderRadius: 12, background: BG,
          position: 'relative', width: PREVIEW_W, height: PREVIEW_H, overflow: 'hidden',
          border: `1px solid ${DIVIDER}`,
        }}>
          {/* Dot grid background (same as real canvas) */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <pattern id="preview-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="0.7" fill="rgba(200,230,0,0.045)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#preview-dots)" />
          </svg>

          {/* Connections (with animation) */}
          <ConnectionLayer
            connections={preview.connections}
            nodeMap={preview.nodeMap}
            selectedConn={null}
            onSelectConn={noop}
            animating={true}
            speed={3}
          />

          {/* Nodes */}
          {preview.nodes.map(node => (
            <CanvasNode
              key={node.id}
              node={node}
              selected={null}
              dragging={null}
              connectMode={null}
              editingLabel={null}
              onPointerDown={noop}
              onDoubleClick={noop}
              onLabelChange={noop}
              onEditDone={noop}
              onResizeStart={noop}
            />
          ))}
        </div>

        {/* Warning banner */}
        {hasWork && showConfirm && (
          <div style={{
            margin: '12px 18px 0', padding: '10px 14px', borderRadius: 8,
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            fontSize: 11, color: '#fbbf24', lineHeight: 1.5,
          }}>
            This will replace your current diagram. You can undo with Ctrl+Z.
          </div>
        )}

        {/* Actions */}
        <div style={{
          padding: '16px 18px 18px', display: 'flex', justifyContent: 'flex-end', gap: 10,
          marginTop: 4,
        }}>
          <button onClick={onClose} style={{
            padding: '9px 22px', borderRadius: 8, border: `1px solid ${DIVIDER}`,
            background: 'transparent', color: TEXT_DIM, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancel</button>

          {showConfirm ? (
            <button onClick={onConfirm} style={{
              padding: '9px 22px', borderRadius: 8, border: 'none',
              background: '#f59e0b', color: BG, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Replace</button>
          ) : (
            <button onClick={handleUse} style={{
              padding: '9px 22px', borderRadius: 8, border: 'none',
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`,
              color: BG, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Use template</button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
