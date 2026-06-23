import { ACCENT, TEXT, TEXT_DIM, TEXT_MID, SURFACE, CARD_BORDER } from '../../constants';
import NodeIcon from '../NodeIcon';

export default function MultiSelectInspector({ nodes, multiSelected, onFocusNode, onDeleteMultiSelected, onDeselectAll }) {
  const selectedNodes = nodes.filter(n => multiSelected.has(n.id));

  return (
    <div>
      {/* Header with count badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          minWidth: 22, height: 22, borderRadius: 12,
          background: ACCENT, color: '#000',
          fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 6px',
        }}>
          {selectedNodes.length}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>nodes selected</span>
      </div>

      {/* Scrollable node list */}
      <div style={{
        maxHeight: 200, overflowY: 'auto',
        border: `1px solid ${CARD_BORDER}`, borderRadius: 10,
        marginBottom: 10,
      }}>
        {selectedNodes.map(node => (
          <div
            key={node.id}
            onClick={() => onFocusNode(node.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px',
              cursor: 'pointer',
              borderBottom: `1px solid ${CARD_BORDER}`,
              transition: 'background 0.12s',
            }}
            onPointerEnter={e => { e.currentTarget.style.background = SURFACE; }}
            onPointerLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <NodeIcon icon={node.icon} iconUrl={node.iconUrl} color={node.color} size={16} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: TEXT_MID,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{node.label}</div>
              <div style={{ fontSize: 9, color: TEXT_DIM }}>{node.type}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <button className="sidebar-btn" onClick={onDeselectAll}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" /></svg>
          Deselect all
        </button>
        <button className="sidebar-btn danger" onClick={onDeleteMultiSelected}>
          <svg width="15" height="15" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" /></svg>
          Delete selected ({selectedNodes.length})
        </button>
      </div>
    </div>
  );
}
