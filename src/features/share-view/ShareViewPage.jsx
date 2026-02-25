import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSharedProject } from '../../shared/lib/shareApi';
import { deserializeDesign } from '../arch/utils/storage';
import { ACCENT, BG, TEXT, TEXT_DIM, CARD_BORDER } from '../../shared/constants';
import CanvasNode from '../arch/components/Canvas/CanvasNode';
import ConnectionLayer from '../arch/components/Canvas/ConnectionLayer';

const noop = () => {};

export default function ShareViewPage() {
  const { projectId } = useParams();
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [nodeMap, setNodeMap] = useState({});
  const [canvasSize, setCanvasSize] = useState({ w: 1920, h: 1080 });
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetchSharedProject(projectId)
      .then(project => {
        setProjectName(project.name || 'Untitled');
        const { nodes: n, connections: c, canvasSize: cs } = deserializeDesign(project.data);
        setNodes(n);
        setConnections(c);
        setCanvasSize(cs);
        const map = {};
        n.forEach(node => { map[node.id] = node; });
        setNodeMap(map);
        setLoading(false);
      })
      .catch(() => {
        setError('Project not found');
        setLoading(false);
      });
  }, [projectId]);

  // Center the diagram on first load
  useEffect(() => {
    if (nodes.length === 0) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + n.w > maxX) maxX = n.x + n.w;
      if (n.y + n.h > maxY) maxY = n.y + n.h;
    }
    const bboxW = maxX - minX || 1;
    const bboxH = maxY - minY || 1;
    const pad = 80;
    const fitZoom = Math.min((vw - pad * 2) / bboxW, (vh - pad * 2) / bboxH, 1.5);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setPan({ x: vw / 2 - cx * fitZoom, y: vh / 2 - cy * fitZoom });
    setZoom(fitZoom);
  }, [nodes]);

  const handlePointerDown = useCallback((e) => {
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...pan };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pan]);

  const handlePointerMove = useCallback((e) => {
    if (!isPanning.current) return;
    setPan({
      x: panOrigin.current.x + (e.clientX - panStart.current.x),
      y: panOrigin.current.y + (e.clientY - panStart.current.y),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => {
      const newZ = Math.min(Math.max(z * delta, 0.1), 5);
      setPan(p => ({
        x: mx - (mx - p.x) * (newZ / z),
        y: my - (my - p.y) * (newZ / z),
      }));
      return newZ;
    });
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: BG, color: ACCENT, fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 14, fontWeight: 600,
      }}>
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: BG, fontFamily: "'IBM Plex Mono', monospace", gap: 12,
      }}>
        <div style={{ fontSize: 48, opacity: 0.3 }}>404</div>
        <div style={{ fontSize: 14, color: TEXT_DIM }}>{error}</div>
        <a href="/" style={{ fontSize: 12, color: ACCENT, textDecoration: 'none', marginTop: 8 }}>Go to a-kit</a>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#000', position: 'relative',
    }}>
      {/* Canvas area */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        style={{
          width: '100%', height: '100%', position: 'relative',
          touchAction: 'none', cursor: isPanning.current ? 'grabbing' : 'grab',
        }}
      >
        <div style={{
          position: 'absolute',
          width: canvasSize.w, height: canvasSize.h,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}>
          {/* Canvas background */}
          <div style={{ position: 'absolute', inset: 0, background: '#141414', borderRadius: 12 }} />

          {/* Dot grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <pattern id="share-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="0.7" fill="rgba(200,230,0,0.045)" />
              </pattern>
              <radialGradient id="share-glw" cx="50%" cy="40%">
                <stop offset="0%" stopColor="rgba(200,230,0,0.025)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#share-dots)" />
            <rect width="100%" height="100%" fill="url(#share-glw)" />
          </svg>

          <ConnectionLayer
            connections={connections} nodeMap={nodeMap}
            selectedConn={null} onSelectConn={noop}
            animating={true} speed={2.5}
          />

          {nodes.map(node => (
            <CanvasNode
              key={node.id} node={node}
              selected={null} dragging={null}
              connectMode={null} editingLabel={null}
              onPointerDown={noop} onDoubleClick={noop}
              onLabelChange={noop} onEditDone={noop}
              onResizeStart={noop}
            />
          ))}
        </div>
      </div>

      {/* Overlay header */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16,
        display: 'flex', alignItems: 'center', gap: 12,
        pointerEvents: 'none', zIndex: 20,
      }}>
        <a
          href="/"
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10,
            background: 'rgba(10,14,10,0.85)', border: `1px solid ${CARD_BORDER}`,
            backdropFilter: 'blur(12px)', textDecoration: 'none',
            color: ACCENT, fontSize: 13, fontWeight: 700,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          a-kit
        </a>
        <div style={{
          padding: '8px 14px', borderRadius: 10,
          background: 'rgba(10,14,10,0.85)', border: `1px solid ${CARD_BORDER}`,
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: TEXT,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            {projectName}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: TEXT_DIM,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            padding: '2px 8px', borderRadius: 6,
            background: 'rgba(200,230,0,0.06)',
          }}>
            Read-only
          </span>
        </div>
      </div>
    </div>
  );
}
