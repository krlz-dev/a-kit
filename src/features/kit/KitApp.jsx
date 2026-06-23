import { useState, useRef, useCallback, useEffect } from 'react';
import { BG, TEXT, ACCENT, CONN_COLORS, TEMPLATES } from './constants';
import { uid, cuid, NODE_W, NODE_H, GROUP_W, GROUP_H, CANVAS_W, CANVAS_H, CANVAS_PRESETS } from './utils/uid';
import { useToast } from '../../shared/hooks/useToast';
import { useUndo } from '../../shared/hooks/useUndo';
import { useKeyboardShortcuts } from '../../shared/hooks/useKeyboardShortcuts';
import {
  serializeDesign, deserializeDesign,
  exportDesignAsJSON, importDesignFromFile,
  getSavedDesigns, saveDesign, deleteDesign,
} from './utils/storage';
import Sidebar from './components/Sidebar/Sidebar';
import Canvas from './components/Canvas/Canvas';

// Working canvas is persisted to localStorage so it survives reloads
const WORK_KEY = 'akit-working';

export default function KitApp() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedConn, setSelectedConn] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [connectMode, setConnectMode] = useState(null);
  const [animating, setAnimating] = useState(true);
  const [speed, setSpeed] = useState(2.5);
  const [connColorIdx, setConnColorIdx] = useState(0);
  const [bidir, setBidir] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ w: CANVAS_W, h: CANVAS_H });
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
  const [savedDesigns, setSavedDesigns] = useState(() => getSavedDesigns());
  const [loaded, setLoaded] = useState(false);
  const [multiSelected, setMultiSelected] = useState(new Set());
  const [marquee, setMarquee] = useState(null);
  const canvasRef = useRef(null);
  const dragOff = useRef({ x: 0, y: 0 });
  const resizing = useRef(null);
  const groupChildren = useRef([]);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panStart = useRef(null);
  const spaceHeldRef = useRef(false);
  const wasPanning = useRef(false);
  const marqueeStart = useRef(null);
  const multiDragOffsets = useRef(null);
  const wasMarquee = useRef(false);
  const transformTimer = useRef(null);
  const saveTimer = useRef(null);
  const lastTouchDist = useRef(null);
  const lastTouchMid = useRef(null);
  const isTwoFingerGesture = useRef(false);

  const { toast, showToast } = useToast();

  // Restore the working canvas from localStorage, or load a starter template on first visit
  useEffect(() => {
    let restored = false;
    try {
      const raw = localStorage.getItem(WORK_KEY);
      if (raw) {
        const design = JSON.parse(raw);
        if (design?.nodes?.length) {
          const { nodes: n, connections: c, canvasSize: cs } = deserializeDesign(design);
          setNodes(n);
          setConnections(c);
          if (cs) setCanvasSize(cs);
          restored = true;
        }
      }
    } catch { /* ignore corrupt storage */ }

    if (!restored) {
      const tpl = TEMPLATES[0];
      const { nodes: n, connections: c, canvasSize: cs } = deserializeDesign(
        { name: tpl.name, nodes: tpl.nodes, conns: tpl.conns },
        { center: true, canvasW: canvasSize.w, canvasH: canvasSize.h }
      );
      setNodes(n);
      setConnections(c);
      if (cs) setCanvasSize(cs);
    }
    setLoaded(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save the working canvas to localStorage (debounced 500ms)
  useEffect(() => {
    if (!loaded) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const design = serializeDesign('working', nodes, connections, canvasSize);
      try { localStorage.setItem(WORK_KEY, JSON.stringify(design)); } catch { /* quota exceeded */ }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [nodes, connections, canvasSize, loaded]);

  const markTransforming = useCallback(() => {
    setIsTransforming(true);
    clearTimeout(transformTimer.current);
    transformTimer.current = setTimeout(() => setIsTransforming(false), 150);
  }, []);

  const onSetCanvasSize = useCallback((size) => {
    setCanvasSize(size);
    setNodes(prev => prev.map(n => ({
      ...n,
      x: Math.min(n.x, Math.max(0, size.w - n.w)),
      y: Math.min(n.y, Math.max(0, size.h - n.h)),
    })));
  }, []);

  const resetSelection = useCallback(() => {
    setSelected(null);
    setSelectedConn(null);
    setMultiSelected(new Set());
  }, []);

  const { pushUndo, undo, redo, undoStack, redoStack } = useUndo(
    nodes, connections, setNodes, setConnections, resetSelection
  );

  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id] = n);
  const selectedNode = selected ? nodeMap[selected] : null;
  const selectedConnObj = selectedConn ? connections.find(c => c.id === selectedConn) : null;

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const x = (el.clientWidth - canvasSize.w) / 2;
    const y = (el.clientHeight - canvasSize.h) / 2;
    panRef.current = { x, y };
    setPan({ x, y });
  }, [canvasSize]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' && !e.target.closest('input')) {
        e.preventDefault();
        spaceHeldRef.current = true;
        setSpaceHeld(true);
      }
    };
    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        spaceHeldRef.current = false;
        setSpaceHeld(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    markTransforming();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const canvasX = (mouseX - panRef.current.x) / zoomRef.current;
    const canvasY = (mouseY - panRef.current.y) / zoomRef.current;
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    const newZoom = Math.max(0.2, Math.min(3, zoomRef.current * factor));
    const newPanX = mouseX - canvasX * newZoom;
    const newPanY = mouseY - canvasY * newZoom;
    zoomRef.current = newZoom;
    panRef.current = { x: newPanX, y: newPanY };
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [markTransforming]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // Two-finger touch gesture (pan + pinch zoom)
  const onTouchStart = useCallback((e) => {
    if (e.touches.length >= 2) {
      isTwoFingerGesture.current = true;
      setDragging(null);
      panStart.current = null;
      setIsPanning(false);
      resizing.current = null;
      marqueeStart.current = null;
      setMarquee(null);
      const t1 = e.touches[0], t2 = e.touches[1];
      lastTouchDist.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      lastTouchMid.current = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    if (e.touches.length < 2 || !isTwoFingerGesture.current) return;
    e.preventDefault();
    markTransforming();
    const t1 = e.touches[0], t2 = e.touches[1];
    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const midX = (t1.clientX + t2.clientX) / 2;
    const midY = (t1.clientY + t2.clientY) / 2;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !lastTouchMid.current || !lastTouchDist.current) return;
    const scale = dist / lastTouchDist.current;
    const prevFX = lastTouchMid.current.x - rect.left;
    const prevFY = lastTouchMid.current.y - rect.top;
    const cx = (prevFX - panRef.current.x) / zoomRef.current;
    const cy = (prevFY - panRef.current.y) / zoomRef.current;
    const curFX = midX - rect.left;
    const curFY = midY - rect.top;
    const newZoom = Math.max(0.2, Math.min(3, zoomRef.current * scale));
    const newPanX = curFX - cx * newZoom;
    const newPanY = curFY - cy * newZoom;
    zoomRef.current = newZoom;
    panRef.current = { x: newPanX, y: newPanY };
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
    lastTouchDist.current = dist;
    lastTouchMid.current = { x: midX, y: midY };
  }, [markTransforming]);

  const onTouchEnd = useCallback((e) => {
    if (e.touches.length < 2 && isTwoFingerGesture.current) {
      lastTouchDist.current = null;
      lastTouchMid.current = null;
      setTimeout(() => { isTwoFingerGesture.current = false; }, 50);
    }
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  // Auto-close sidebar on narrow screens, re-open on wide
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => setSidebarOpen(!e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const addNode = useCallback((item) => {
    pushUndo(nodes, connections);
    const isGroup = item.type === 'group';
    const w = isGroup ? GROUP_W : NODE_W;
    const h = isGroup ? GROUP_H : NODE_H;
    const canvas = canvasRef.current;
    const z = zoomRef.current;
    const cx = canvas ? ((canvas.clientWidth / 2 - panRef.current.x) / z - w / 2) : 200;
    const cy = canvas ? ((canvas.clientHeight / 2 - panRef.current.y) / z - h / 2) : 200;
    const offset = nodes.length * 18;
    setNodes(p => [...p, {
      id: uid(), ...item,
      x: cx + (offset % 120) - 40,
      y: cy + Math.floor(offset / 120) * 90,
      w, h,
    }]);
    showToast(`Added ${item.label}`);
  }, [nodes, connections, pushUndo, showToast]);

  const deleteMultiSelected = useCallback(() => {
    if (multiSelected.size === 0) return;
    pushUndo(nodes, connections);
    setConnections(p => p.filter(c => !multiSelected.has(c.from) && !multiSelected.has(c.to)));
    setNodes(p => p.filter(n => !multiSelected.has(n.id)));
    setMultiSelected(new Set());
    showToast(`Deleted ${multiSelected.size} nodes`);
  }, [multiSelected, nodes, connections, pushUndo, showToast]);

  const deleteSelected = useCallback(() => {
    if (multiSelected.size > 0) {
      deleteMultiSelected();
      return;
    }
    if (selected) {
      pushUndo(nodes, connections);
      setConnections(p => p.filter(c => c.from !== selected && c.to !== selected));
      setNodes(p => p.filter(n => n.id !== selected));
      setSelected(null);
      showToast("Node deleted");
    } else if (selectedConn) {
      pushUndo(nodes, connections);
      setConnections(p => p.filter(c => c.id !== selectedConn));
      setSelectedConn(null);
      showToast("Link removed");
    }
  }, [selected, selectedConn, multiSelected, nodes, connections, pushUndo, showToast, deleteMultiSelected]);

  const unlinkSelected = useCallback(() => {
    if (!selected) return;
    const linked = connections.filter(c => c.from === selected || c.to === selected);
    if (!linked.length) return showToast("No links to remove");
    pushUndo(nodes, connections);
    setConnections(p => p.filter(c => c.from !== selected && c.to !== selected));
    showToast(`Removed ${linked.length} link${linked.length > 1 ? "s" : ""}`);
  }, [selected, nodes, connections, pushUndo, showToast]);

  const onNodePointerDown = useCallback((e, node) => {
    if (e.button === 1 || spaceHeldRef.current) return;
    e.stopPropagation();
    if (connectMode) {
      if (connectMode !== node.id) {
        const exists = connections.some(c =>
          (c.from === connectMode && c.to === node.id) || (c.from === node.id && c.to === connectMode)
        );
        if (!exists) {
          pushUndo(nodes, connections);
          setConnections(p => [...p, { id: cuid(), from: connectMode, to: node.id, color: CONN_COLORS[connColorIdx % CONN_COLORS.length], bidir, label: "" }]);
          showToast("Connected");
        } else showToast("Already connected");
      }
      setConnectMode(null);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const px = panRef.current.x, py = panRef.current.y, z = zoomRef.current;

    // Shift+click: toggle node in/out of multiSelected
    if (e.shiftKey) {
      setMultiSelected(prev => {
        const next = new Set(prev);
        // Fold current single-selected into multi
        if (selected && !next.has(selected)) next.add(selected);
        // Toggle clicked node
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        // If only 1 left, fold back to single-select
        if (next.size === 1) {
          const [only] = next;
          setSelected(only);
          return new Set();
        }
        if (next.size > 0) setSelected(null);
        return next;
      });
      setSelectedConn(null);
      return;
    }

    // Click on multi-selected node (no shift): start multi-drag
    if (multiSelected.has(node.id)) {
      pushUndo(nodes, connections);
      dragOff.current = { x: (e.clientX - rect.left - px) / z - node.x, y: (e.clientY - rect.top - py) / z - node.y };
      const offsets = new Map();
      nodes.forEach(n => {
        if (multiSelected.has(n.id) && n.id !== node.id) {
          offsets.set(n.id, { x: n.x - node.x, y: n.y - node.y });
        }
      });
      multiDragOffsets.current = offsets;
      setDragging(node.id);
      groupChildren.current = [];
      return;
    }

    // Click on non-multi-selected node (no shift): clear multi, single-select+drag
    if (multiSelected.size > 0) {
      setMultiSelected(new Set());
    }

    dragOff.current = { x: (e.clientX - rect.left - px) / z - node.x, y: (e.clientY - rect.top - py) / z - node.y };
    setDragging(node.id);
    setSelected(node.id);
    setSelectedConn(null);

    if (node.type === 'group') {
      groupChildren.current = nodes
        .filter(n => {
          if (n.id === node.id) return false;
          const cx = n.x + n.w / 2;
          const cy = n.y + n.h / 2;
          return cx >= node.x && cx <= node.x + node.w &&
                 cy >= node.y && cy <= node.y + node.h;
        })
        .map(n => ({ id: n.id, offsetX: n.x - node.x, offsetY: n.y - node.y }));
    } else {
      groupChildren.current = [];
    }
  }, [connectMode, connections, connColorIdx, bidir, nodes, selected, multiSelected, pushUndo, showToast]);

  const onCanvasPointerDown = useCallback((e) => {
    if (e.button === 1 || (e.button === 0 && spaceHeldRef.current)) {
      e.preventDefault();
      panStart.current = {
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startPanX: panRef.current.x,
        startPanY: panRef.current.y,
      };
      setIsPanning(true);
      return;
    }
    // LMB on empty canvas (not on a node): start marquee
    if (e.button === 0 && !connectMode && !e.target.closest('[data-node]')) {
      const rect = canvasRef.current.getBoundingClientRect();
      const px = panRef.current.x, py = panRef.current.y, z = zoomRef.current;
      const cx = (e.clientX - rect.left - px) / z;
      const cy = (e.clientY - rect.top - py) / z;
      marqueeStart.current = { x: cx, y: cy, shiftKey: e.shiftKey };
      setMarquee({ startX: cx, startY: cy, currentX: cx, currentY: cy });
    }
  }, [connectMode]);

  const onResizeStart = useCallback((e, node) => {
    resizing.current = {
      id: node.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startW: node.w,
      startH: node.h,
    };
    setSelected(node.id);
    setSelectedConn(null);
  }, []);

  const onPtrMove = useCallback((e) => {
    if (isTwoFingerGesture.current) return;
    if (panStart.current) {
      markTransforming();
      const p = panStart.current;
      const newX = p.startPanX + (e.clientX - p.startMouseX);
      const newY = p.startPanY + (e.clientY - p.startMouseY);
      panRef.current = { x: newX, y: newY };
      setPan({ x: newX, y: newY });
      wasPanning.current = true;
      return;
    }
    // Marquee drag
    if (marqueeStart.current) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = panRef.current.x, py = panRef.current.y, z = zoomRef.current;
      const cx = (e.clientX - rect.left - px) / z;
      const cy = (e.clientY - rect.top - py) / z;
      setMarquee({ startX: marqueeStart.current.x, startY: marqueeStart.current.y, currentX: cx, currentY: cy });
      return;
    }
    if (resizing.current) {
      const r = resizing.current;
      const z = zoomRef.current;
      const newW = Math.max(140, r.startW + (e.clientX - r.startMouseX) / z);
      const newH = Math.max(80, r.startH + (e.clientY - r.startMouseY) / z);
      setNodes(p => p.map(n => n.id === r.id ? { ...n, w: newW, h: newH } : n));
      return;
    }
    if (!dragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = panRef.current.x, py = panRef.current.y, z = zoomRef.current;
    setNodes(p => {
      const dragNode = p.find(n => n.id === dragging);
      if (!dragNode) return p;
      const newX = Math.max(0, Math.min((e.clientX - rect.left - px) / z - dragOff.current.x, canvasSize.w - dragNode.w));
      const newY = Math.max(0, Math.min((e.clientY - rect.top - py) / z - dragOff.current.y, canvasSize.h - dragNode.h));

      // Multi-drag: move all multi-selected nodes together
      if (multiDragOffsets.current && multiDragOffsets.current.size > 0) {
        const offsets = multiDragOffsets.current;
        return p.map(n => {
          if (n.id === dragging) return { ...n, x: newX, y: newY };
          const off = offsets.get(n.id);
          if (off) {
            return {
              ...n,
              x: Math.max(0, Math.min(newX + off.x, canvasSize.w - n.w)),
              y: Math.max(0, Math.min(newY + off.y, canvasSize.h - n.h)),
            };
          }
          return n;
        });
      }

      const children = groupChildren.current;
      if (children.length === 0) {
        return p.map(n => n.id === dragging ? { ...n, x: newX, y: newY } : n);
      }
      const childMap = new Map(children.map(c => [c.id, c]));
      return p.map(n => {
        if (n.id === dragging) return { ...n, x: newX, y: newY };
        const child = childMap.get(n.id);
        if (child) return { ...n, x: newX + child.offsetX, y: newY + child.offsetY };
        return n;
      });
    });
  }, [dragging, markTransforming]);

  const onPtrUp = useCallback(() => {
    if (panStart.current) {
      panStart.current = null;
      setIsPanning(false);
    }
    // Marquee completion
    if (marqueeStart.current) {
      const ms = marqueeStart.current;
      const m = { startX: ms.x, startY: ms.y };
      marqueeStart.current = null;
      setMarquee(prev => {
        if (!prev) return null;
        const x1 = Math.min(m.startX, prev.currentX);
        const y1 = Math.min(m.startY, prev.currentY);
        const x2 = Math.max(m.startX, prev.currentX);
        const y2 = Math.max(m.startY, prev.currentY);
        if (x2 - x1 > 4 || y2 - y1 > 4) {
          const hit = nodes.filter(n => {
            const nx1 = n.x, ny1 = n.y, nx2 = n.x + n.w, ny2 = n.y + n.h;
            return nx1 < x2 && nx2 > x1 && ny1 < y2 && ny2 > y1;
          });
          if (hit.length > 0) {
            setMultiSelected(prev2 => {
              const next = ms.shiftKey ? new Set(prev2) : new Set();
              hit.forEach(n => next.add(n.id));
              // If only 1, fold to single-select
              if (next.size === 1) {
                const [only] = next;
                setSelected(only);
                return new Set();
              }
              setSelected(null);
              return next;
            });
            setSelectedConn(null);
          }
          wasMarquee.current = true;
        }
        return null;
      });
    }
    multiDragOffsets.current = null;
    setDragging(null);
    resizing.current = null;
  }, [nodes]);

  useEffect(() => {
    window.addEventListener("pointermove", onPtrMove);
    window.addEventListener("pointerup", onPtrUp);
    return () => {
      window.removeEventListener("pointermove", onPtrMove);
      window.removeEventListener("pointerup", onPtrUp);
    };
  }, [onPtrMove, onPtrUp]);

  const onCanvasClick = useCallback((e) => {
    if (wasPanning.current) {
      wasPanning.current = false;
      return;
    }
    if (wasMarquee.current) {
      wasMarquee.current = false;
      return;
    }
    if (!e.target.closest("[data-node]")) {
      if (connectMode) { setConnectMode(null); showToast("Cancelled"); }
      setSelected(null);
      setSelectedConn(null);
      setMultiSelected(new Set());
    }
  }, [connectMode, showToast]);

  const clearSelection = useCallback(() => {
    setConnectMode(null);
    setSelected(null);
    setSelectedConn(null);
    setMultiSelected(new Set());
  }, []);

  const focusNode = useCallback((nodeId) => {
    setSelected(nodeId);
    setMultiSelected(new Set());
    setSelectedConn(null);
  }, []);

  const toggleLinkMode = useCallback(() => {
    if (!selected) return;
    if (connectMode === selected) {
      // Already in link mode — toggle bidir
      setBidir(b => {
        showToast(b ? "\u2192 Uni-directional link" : "\u2194 Bi-directional link");
        return !b;
      });
    } else {
      // Enter link mode (uni-directional)
      setBidir(false);
      setConnectMode(selected);
      showToast("\u2192 Link mode — click a target node");
    }
  }, [selected, connectMode, showToast]);

  useKeyboardShortcuts({ deleteSelected, editingLabel, undo, redo, clearSelection, toggleLinkMode });

  const loadDesign = useCallback((design, opts) => {
    pushUndo(nodes, connections);
    const { nodes: newNodes, connections: newConns, canvasSize: cs } = deserializeDesign(design, { ...opts, canvasW: canvasSize.w, canvasH: canvasSize.h });
    setNodes(newNodes);
    setConnections(newConns);
    if (cs) setCanvasSize(cs);
    setSelected(null);
    setSelectedConn(null);
    showToast(`Loaded: ${design.name}`);
  }, [nodes, connections, canvasSize, pushUndo, showToast]);

  const loadTemplate = useCallback((tpl) => {
    loadDesign({ name: tpl.name, nodes: tpl.nodes, conns: tpl.conns }, { center: true });
  }, [loadDesign]);

  const onExportDesign = useCallback(() => {
    if (nodes.length === 0) return;
    const design = serializeDesign('Untitled', nodes, connections, canvasSize);
    exportDesignAsJSON(design);
    showToast("Exported as JSON");
  }, [nodes, connections, canvasSize, showToast]);

  const onImportDesign = useCallback(() => {
    importDesignFromFile()
      .then(data => loadDesign(data))
      .catch(err => showToast(err.message || "Import failed"));
  }, [loadDesign, showToast]);

  const onSaveDesign = useCallback(() => {
    if (nodes.length === 0) return showToast("Nothing to save");
    const name = (prompt("Save design as:", "Untitled") || "").trim();
    if (!name) return;
    const design = serializeDesign(name, nodes, connections, canvasSize);
    setSavedDesigns(saveDesign(design));
    showToast(`Saved "${name}"`);
  }, [nodes, connections, canvasSize, showToast]);

  const onDeleteDesign = useCallback((savedAt) => {
    setSavedDesigns(deleteDesign(savedAt));
    showToast("Design deleted");
  }, [showToast]);

  const onLabelChange = useCallback((nodeId, value) => {
    setNodes(p => p.map(n => n.id === nodeId ? { ...n, label: value || n.label } : n));
  }, []);

  const onNodeColorChange = useCallback((nodeId, color) => {
    pushUndo(nodes, connections);
    setNodes(p => p.map(n => n.id === nodeId ? { ...n, color } : n));
  }, [nodes, connections, pushUndo]);

  const onConnLabelChange = useCallback((connId, value) => {
    setConnections(p => p.map(c => c.id === connId ? { ...c, label: value } : c));
  }, []);

  const onConnColorChange = useCallback((connId, color) => {
    pushUndo(nodes, connections);
    setConnections(p => p.map(c => c.id === connId ? { ...c, color } : c));
  }, [nodes, connections, pushUndo]);

  const onToggleConnect = useCallback((bidirVal = false) => {
    if (connectMode === selected) {
      setConnectMode(null);
      showToast("Cancelled");
    } else {
      setBidir(bidirVal);
      setConnectMode(selected);
      showToast("Click another node to link");
    }
  }, [connectMode, selected, showToast]);

  const onSelectConn = useCallback((connId) => {
    setSelectedConn(connId);
    setSelected(null);
  }, []);

  const onRemoveConn = useCallback((connId) => {
    pushUndo(nodes, connections);
    setConnections(p => p.filter(c => c.id !== connId));
    showToast("Unlinked");
  }, [nodes, connections, pushUndo, showToast]);

  const onToggleConnDirection = useCallback((connId) => {
    pushUndo(nodes, connections);
    setConnections(p => p.map(c => c.id === connId ? { ...c, bidir: !c.bidir } : c));
  }, [nodes, connections, pushUndo]);

  const onClearAll = useCallback(() => {
    if (nodes.length === 0) return;
    pushUndo(nodes, connections);
    setNodes([]);
    setConnections([]);
    setSelected(null);
    setSelectedConn(null);
    setConnectMode(null);
    showToast("Canvas cleared");
  }, [nodes, connections, pushUndo, showToast]);

  return (
    <div style={{ height: "100vh", display: "flex", background: BG, color: TEXT, fontFamily: "'IBM Plex Mono', monospace", overflow: "hidden", userSelect: "none", position: "relative" }}>
      <Sidebar
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
        nodes={nodes} connections={connections} nodeMap={nodeMap}
        selected={selected} selectedConn={selectedConn}
        selectedNode={selectedNode} selectedConnObj={selectedConnObj}
        connectMode={connectMode} animating={animating} speed={speed}
        connColorIdx={connColorIdx} undoStack={undoStack} redoStack={redoStack}
        canvasSize={canvasSize} onSetCanvasSize={onSetCanvasSize}
        multiSelected={multiSelected}
        onFocusNode={focusNode}
        onDeleteMultiSelected={deleteMultiSelected}
        onSetEditingLabel={setEditingLabel}
        onToggleConnect={onToggleConnect}
        onUnlinkSelected={unlinkSelected}
        onDeleteSelected={deleteSelected}
        onSelectConn={(id) => setSelectedConn(id === selectedConn ? null : id)}
        onRemoveConn={onRemoveConn}
        onToggleConnDirection={onToggleConnDirection}
        onConnLabelChange={onConnLabelChange}
        onConnColorChange={onConnColorChange}
        onToggleAnimating={() => setAnimating(!animating)}
        onSetSpeed={setSpeed}
        onSetConnColorIdx={setConnColorIdx}
        onUndo={undo} onRedo={redo}
        onClearAll={onClearAll}
        onLoadTemplate={loadTemplate}
        onExportDesign={onExportDesign}
        onImportDesign={onImportDesign}
        savedDesigns={savedDesigns}
        onSaveDesign={onSaveDesign}
        onLoadDesign={loadDesign}
        onDeleteDesign={onDeleteDesign}
        onExportSavedDesign={exportDesignAsJSON}
        onNodeColorChange={onNodeColorChange}
        onAddNode={addNode}
        onDeselectAll={resetSelection}
        pushUndo={pushUndo} showToast={showToast}
      />
      <Canvas
        sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(true)}
        canvasRef={canvasRef} canvasSize={canvasSize} nodes={nodes} connections={connections} nodeMap={nodeMap}
        selected={selected} selectedConn={selectedConn} dragging={dragging}
        connectMode={connectMode} editingLabel={editingLabel}
        animating={animating} speed={speed} toast={toast}
        pan={pan} zoom={zoom} isPanning={isPanning} spaceHeld={spaceHeld} isTransforming={isTransforming}
        marquee={marquee} multiSelected={multiSelected}
        onCanvasClick={onCanvasClick}
        onCanvasPointerDown={onCanvasPointerDown}
        onNodePointerDown={onNodePointerDown}
        onNodeDoubleClick={(e, id) => { e.stopPropagation(); setEditingLabel(id); }}
        onLabelChange={onLabelChange}
        onEditDone={() => setEditingLabel(null)}
        onSelectConn={onSelectConn}
        onResizeStart={onResizeStart}
      />
    </div>
  );
}
