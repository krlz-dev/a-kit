import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ACCENT, BG, TEXT, TEXT_DIM, TEXT_MID, SURFACE, CARD_BORDER, CONN_COLORS, COMPONENTS, CLOUD_COMPONENTS, PROVIDERS, DIVIDER } from '../../constants';
import { CANVAS_PRESETS } from '../../utils/uid';
import { exportAsPNG, exportAsJPG, exportAsGIF, exportAsPDF } from '../../utils/exportCanvas';
import { useAuth } from '../../../../shared/context/AuthContext';
import { fetchSubscription } from '../../../../shared/lib/subscriptionApi';
import NodeIcon from '../NodeIcon';
import NodeInspector from './NodeInspector';
import LinkInspector from './LinkInspector';
import MultiSelectInspector from './MultiSelectInspector';
import ShareModal from './ShareModal';

const ALL_COMPONENTS = [
  ...COMPONENTS.map(c => ({ ...c, provider: 'generic', category: 'Generic' })),
  ...CLOUD_COMPONENTS,
];

function Section({ label, open, onToggle, children }) {
  return (
    <div style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: 12, marginTop: 12 }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, marginBottom: open ? 10 : 0,
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill={TEXT_DIM}
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open && children}
    </div>
  );
}

export default function ToolsTab({
  nodes, connections, nodeMap,
  selected, selectedConn, selectedNode, selectedConnObj,
  connectMode, animating, speed, connColorIdx, undoStack, redoStack,
  canvasSize, onSetCanvasSize,
  multiSelected, onFocusNode, onDeleteMultiSelected,
  onSetEditingLabel, onToggleConnect, onUnlinkSelected, onDeleteSelected,
  onSelectConn, onRemoveConn, onToggleConnDirection,
  onConnLabelChange,
  onToggleAnimating, onSetSpeed, onSetConnColorIdx,
  onUndo, onRedo, onClearAll,
  onExportDesign, onImportDesign,
  onNodeColorChange, onAddNode, onDeselectAll,
  pushUndo, showToast,
}) {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportScale, setExportScale] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProvider, setActiveProvider] = useState('all');
  const [visibleCount, setVisibleCount] = useState(50);
  const [openSections, setOpenSections] = useState({ canvas: true, controls: true, speed: false, linkColor: false, file: false });
  const toggle = useCallback((key) => setOpenSections(s => ({ ...s, [key]: !s[key] })), []);

  useEffect(() => {
    if (!user) { setIsPaid(false); return; }
    fetchSubscription().then(sub => {
      setIsPaid(sub?.plan === 'monthly' || sub?.plan === 'lifetime');
    }).catch(() => setIsPaid(false));
  }, [user]);

  const doExport = async (type, fn) => {
    setExporting(type);
    setExportProgress(0);
    showToast(`Exporting ${type.toUpperCase()}…`);
    try {
      await fn((p) => setExportProgress(p));
      showToast(`Exported as ${type.toUpperCase()}`);
    } catch (err) {
      showToast(err.message || 'Export failed');
    }
    setExporting(null);
    setExportProgress(0);
  };

  const filtered = useMemo(() => {
    let list = ALL_COMPONENTS;
    if (!isPaid) {
      list = list.filter(c => c.provider === 'generic');
    } else if (activeProvider !== 'all') {
      list = list.filter(c => c.provider === activeProvider);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.label.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }
    return list;
  }, [searchQuery, activeProvider, isPaid]);

  const handleProviderChange = (id) => {
    if (!isPaid && id !== 'all' && id !== 'generic') {
      showToast('Upgrade to unlock cloud components');
      return;
    }
    setActiveProvider(id);
    setVisibleCount(50);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setVisibleCount(50);
  };

  const breadcrumb = (label) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
      <span
        onClick={onDeselectAll}
        style={{
          fontSize: 10, fontWeight: 600, color: ACCENT, cursor: 'pointer',
          letterSpacing: '0.05em', transition: 'opacity 0.15s',
        }}
        onPointerEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
        onPointerLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >Tools</span>
      <span style={{ fontSize: 10, color: TEXT_DIM }}>/</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_MID, letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );

  if (multiSelected && multiSelected.size > 1) {
    return (
      <div>
        {breadcrumb('Multi-Select')}
        <MultiSelectInspector
          nodes={nodes} multiSelected={multiSelected}
          onFocusNode={onFocusNode}
          onDeleteMultiSelected={onDeleteMultiSelected}
          onDeselectAll={onDeselectAll}
        />
      </div>
    );
  }

  if (selectedNode) {
    return (
      <div>
        {breadcrumb('Selected Node')}
        <NodeInspector
          node={selectedNode} connections={connections} nodeMap={nodeMap}
          selected={selected} selectedConn={selectedConn}
          connectMode={connectMode}
          onSetEditingLabel={onSetEditingLabel} onToggleConnect={onToggleConnect}
          onUnlink={onUnlinkSelected} onDelete={onDeleteSelected}
          onSelectConn={onSelectConn} onRemoveConn={onRemoveConn}
          onNodeColorChange={onNodeColorChange}
          pushUndo={pushUndo} nodes={nodes} allConnections={connections} showToast={showToast}
        />
      </div>
    );
  }

  if (selectedConnObj) {
    return (
      <div>
        {breadcrumb('Selected Link')}
        <LinkInspector conn={selectedConnObj} nodeMap={nodeMap} onDelete={onDeleteSelected} onToggleDirection={() => onToggleConnDirection(selectedConnObj.id)} onConnLabelChange={onConnLabelChange} />
      </div>
    );
  }

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Search components…"
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            width: '100%', padding: '8px 10px', borderRadius: 10,
            border: `1px solid ${CARD_BORDER}`, background: SURFACE,
            color: TEXT, fontSize: 12, outline: 'none',
            fontFamily: "'IBM Plex Mono', monospace",
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Provider tabs */}
      <div className="provider-tabs-scroll" style={{
        display: 'flex', gap: 4, marginBottom: 10, overflowX: 'auto',
        paddingBottom: 4,
      }}>
        <button
          onClick={() => handleProviderChange('all')}
          style={{
            padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
            background: activeProvider === 'all' ? ACCENT : SURFACE,
            color: activeProvider === 'all' ? BG : TEXT_MID,
            transition: 'all 0.15s',
          }}
        >All</button>
        {PROVIDERS.map(p => {
          const isCloudTab = p.id !== 'generic';
          const isLocked = !isPaid && isCloudTab;
          return (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              style={{
                padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                background: activeProvider === p.id ? p.color : SURFACE,
                color: activeProvider === p.id ? '#fff' : TEXT_MID,
                opacity: isLocked ? 0.5 : 1,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 3,
              }}
            >
              {p.label}
              {isLocked && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Component grid */}
      <div className="component-grid-scroll" style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {visible.map((item, i) => (
            <div key={`${item.provider}-${item.type}-${i}`} className="icon-tile" onClick={() => onAddNode(item)}>
              <NodeIcon icon={item.icon} iconUrl={item.iconUrl} color={item.color} size={26} />
              <div className="icon-tooltip">
                {item.label}
                {item.category && item.category !== 'Generic' && (
                  <span style={{ color: TEXT_DIM, fontWeight: 400 }}> · {item.category}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result count + Show more */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: !isPaid ? 8 : 16 }}>
        <span style={{ fontSize: 10, color: TEXT_DIM }}>{filtered.length} components</span>
        {hasMore && (
          <button
            onClick={() => setVisibleCount(v => v + 50)}
            style={{
              padding: '4px 10px', borderRadius: 8, border: `1px solid ${CARD_BORDER}`,
              background: SURFACE, color: ACCENT, fontSize: 10, fontWeight: 600,
              cursor: 'pointer',
            }}
          >Show more</button>
        )}
      </div>

      {/* Upgrade banner for free/try users */}
      {!isPaid && (
        <div style={{
          padding: '8px 12px', borderRadius: 10, marginBottom: 16,
          background: SURFACE, border: `1px solid ${CARD_BORDER}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={ACCENT}>
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
          </svg>
          <span style={{ fontSize: 10, color: TEXT_MID, flex: 1 }}>
            Unlock 1800+ cloud components —{' '}
            <a
              href="/#/console/billing"
              style={{ color: ACCENT, fontWeight: 600, textDecoration: 'none' }}
            >Upgrade</a>
          </span>
        </div>
      )}

      <Section label="Canvas" open={openSections.canvas} onToggle={() => toggle('canvas')}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, padding: '10px 12px', background: SURFACE, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, fontFamily: "'IBM Plex Mono', monospace" }}>{nodes.length}</div>
            <div style={{ fontSize: 9, color: TEXT_DIM, marginTop: 2 }}>Nodes</div>
          </div>
          <div style={{ flex: 1, padding: '10px 12px', background: SURFACE, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, fontFamily: "'IBM Plex Mono', monospace" }}>{connections.length}</div>
            <div style={{ fontSize: 9, color: TEXT_DIM, marginTop: 2 }}>Links</div>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 9, color: TEXT_DIM, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Canvas Size</div>
          <select
            value={`${canvasSize.w}x${canvasSize.h}`}
            onChange={(e) => {
              const preset = CANVAS_PRESETS.find(p => `${p.w}x${p.h}` === e.target.value);
              if (preset) onSetCanvasSize({ w: preset.w, h: preset.h });
            }}
            style={{
              width: '100%', padding: '6px 8px', borderRadius: 8,
              border: `1px solid ${CARD_BORDER}`, background: SURFACE,
              color: TEXT, fontSize: 11, outline: 'none',
              fontFamily: "'IBM Plex Mono', monospace",
              cursor: 'pointer',
            }}
          >
            {CANVAS_PRESETS.map(p => (
              <option key={`${p.w}x${p.h}`} value={`${p.w}x${p.h}`}>{p.label}</option>
            ))}
          </select>
        </div>
      </Section>

      <Section label="Controls" open={openSections.controls} onToggle={() => toggle('controls')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <button className="sidebar-btn" onClick={onToggleAnimating}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d={animating ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"} fill="currentColor" /></svg>
            {animating ? 'Pause animation' : 'Play animation'}
          </button>
          <button className="sidebar-btn" onClick={onUndo} disabled={undoStack.current.length === 0}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill="currentColor" /></svg>
            Undo
            <span style={{ marginLeft: 'auto', fontSize: 10, color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>{'\u2318'}Z</span>
          </button>
          <button className="sidebar-btn" onClick={onRedo} disabled={redoStack.current.length === 0}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" fill="currentColor" /></svg>
            Redo
            <span style={{ marginLeft: 'auto', fontSize: 10, color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>{'\u2318\u21e7'}Z</span>
          </button>
          <button className="sidebar-btn danger" onClick={onClearAll} disabled={nodes.length === 0}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" /></svg>
            Clear all
          </button>
        </div>
      </Section>

      <Section label="Speed" open={openSections.speed} onToggle={() => toggle('speed')}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: TEXT_MID, fontFamily: "'IBM Plex Mono', monospace" }}>{speed.toFixed(1)}s</span>
          </div>
          <input type="range" min="0.8" max="6" step="0.1" value={speed} onChange={e => onSetSpeed(parseFloat(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 9, color: TEXT_DIM }}>Fast</span>
            <span style={{ fontSize: 9, color: TEXT_DIM }}>Slow</span>
          </div>
        </div>
      </Section>

      <Section label="Link Color" open={openSections.linkColor} onToggle={() => toggle('linkColor')}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CONN_COLORS.map((c, i) => (
            <div key={c} className={`conn-color-dot ${connColorIdx === i ? 'active' : ''}`}
              style={{ background: c, opacity: connColorIdx === i ? 1 : 0.4 }}
              onClick={() => onSetConnColorIdx(i)} />
          ))}
        </div>
      </Section>

      <Section label="File" open={openSections.file} onToggle={() => toggle('file')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <button className="sidebar-btn" onClick={onExportDesign} disabled={nodes.length === 0}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" /></svg>
            Export JSON
          </button>
          <button className="sidebar-btn" onClick={onImportDesign}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" fill="currentColor" /></svg>
            Import JSON
          </button>
          <button
            className="sidebar-btn"
            onClick={() => setShowShareModal(true)}
            disabled={!projectId}
            title={!projectId ? 'Save to cloud first to share' : 'Share a read-only link'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" fill="currentColor" /></svg>
            Share
          </button>
        </div>
        <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 12, marginBottom: 8 }}>Export As</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {[1, 2, 3].map(s => (
            <button key={s} onClick={() => setExportScale(s)} style={{
              flex: 1, padding: '4px 0', borderRadius: 8, border: `1px solid ${exportScale === s ? ACCENT : CARD_BORDER}`,
              background: exportScale === s ? `${ACCENT}18` : SURFACE,
              color: exportScale === s ? ACCENT : TEXT_MID,
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'IBM Plex Mono', monospace",
              transition: 'all 0.15s',
            }}>{s}x</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <button className="sidebar-btn" onClick={() => doExport('png', () => exportAsPNG({ scale: exportScale }))} disabled={nodes.length === 0 || exporting}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor" /></svg>
            {exporting === 'png' ? 'Exporting…' : 'PNG'}
          </button>
          <button className="sidebar-btn" onClick={() => doExport('jpg', () => exportAsJPG({ scale: exportScale }))} disabled={nodes.length === 0 || exporting}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor" /></svg>
            {exporting === 'jpg' ? 'Exporting…' : 'JPG'}
          </button>
          <button className="sidebar-btn" onClick={() => doExport('gif', (p) => exportAsGIF({ scale: exportScale, onProgress: p }))} disabled={nodes.length === 0 || exporting}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" fill="currentColor" /></svg>
            {exporting === 'gif' ? 'Exporting…' : 'GIF'}
          </button>
          <button className="sidebar-btn" onClick={() => doExport('pdf', () => exportAsPDF({ scale: exportScale }))} disabled={nodes.length === 0 || exporting}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" fill="currentColor" /></svg>
            {exporting === 'pdf' ? 'Exporting…' : 'PDF'}
          </button>
        </div>
        {exporting && (
          <div style={{ marginTop: 6, fontSize: 10, color: ACCENT, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, animation: 'dotPulse 1s ease infinite' }} />
            {exporting === 'gif' ? 'Capturing frames…' : 'Processing…'}
            {exporting === 'gif' && (
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{exportProgress}%</span>
            )}
          </div>
        )}
      </Section>

      {showShareModal && projectId && (
        <ShareModal projectId={projectId} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
