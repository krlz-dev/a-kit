import { useState, useRef, useCallback, useEffect } from 'react';
import { BG, TEXT, ACCENT, CONN_COLORS, COMPONENTS } from './constants';
import { uid, cuid, NODE_W, NODE_H, GROUP_W, GROUP_H, CANVAS_W, CANVAS_H } from './utils/uid';
import { useToast } from './hooks/useToast';
import { useUndo } from './hooks/useUndo';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  getSavedDesigns, saveDesign as storeSaveDesign, deleteDesign as storeDeleteDesign,
  serializeDesign, deserializeDesign,
  exportDesignAsJSON, importDesignFromFile,
} from './utils/storage';
import Sidebar from './components/Sidebar/Sidebar';
import Canvas from './components/Canvas/Canvas';
import './App.css';

export default function App() {
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
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState(() => getSavedDesigns());
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const canvasRef = useRef(null);
  const dragOff = useRef({ x: 0, y: 0 });
  const resizing = useRef(null);
  const groupChildren = useRef([]);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panStart = useRef(null);
  const spaceHeldRef = useRef(false);
  const wasPanning = useRef(false);

  const { toast, showToast } = useToast();

  const resetSelection = useCallback(() => {
    setSelected(null);
    setSelectedConn(null);
  }, []);

  const { pushUndo, undo, redo, undoStack, redoStack } = useUndo(
    nodes, connections, setNodes, setConnections, resetSelection
  );

  // Node map for quick lookup
  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id] = n);
  const selectedNode = selected ? nodeMap[selected] : null;
  const selectedConnObj = selectedConn ? connections.find(c => c.id === selectedConn) : null;

  // Center canvas on mount
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const x = (el.clientWidth - CANVAS_W) / 2;
    const y = (el.clientHeight - CANVAS_H) / 2;
    panRef.current = { x, y };
    setPan({ x, y });
  }, []);

  // Space key tracking
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

  // Wheel zoom (toward cursor)
  const onWheel = useCallback((e) => {
    e.preventDefault();
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
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // Add node
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
    setAddMenuOpen(false);
    showToast(`Added ${item.label}`);
  }, [nodes, connections, pushUndo, showToast]);

  // Delete selected node or connection
  const deleteSelected = useCallback(() => {
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
  }, [selected, selectedConn, nodes, connections, pushUndo, showToast]);

  // Unlink all from selected
  const unlinkSelected = useCallback(() => {
    if (!selected) return;
    const linked = connections.filter(c => c.from === selected || c.to === selected);
    if (!linked.length) return showToast("No links to remove");
    pushUndo(nodes, connections);
    setConnections(p => p.filter(c => c.from !== selected && c.to !== selected));
    showToast(`Removed ${linked.length} link${linked.length > 1 ? "s" : ""}`);
  }, [selected, nodes, connections, pushUndo, showToast]);

  // Node pointer handling (connect or drag)
  const onNodePointerDown = useCallback((e, node) => {
    // Let middle button and space+click propagate for panning
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
          showToast("Connected ✓");
        } else showToast("Already connected");
      }
      setConnectMode(null);
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const px = panRef.current.x, py = panRef.current.y, z = zoomRef.current;
    dragOff.current = { x: (e.clientX - rect.left - px) / z - node.x, y: (e.clientY - rect.top - py) / z - node.y };
    setDragging(node.id);
    setSelected(node.id);
    setSelectedConn(null);

    // If dragging a group, snapshot contained children
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
  }, [connectMode, connections, connColorIdx, nodes, pushUndo, showToast]);

  // Canvas pointer down (panning)
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
    }
  }, []);

  // Resize start (for groups)
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

  // Drag / resize / pan handling
  const onPtrMove = useCallback((e) => {
    // Pan
    if (panStart.current) {
      const p = panStart.current;
      const newX = p.startPanX + (e.clientX - p.startMouseX);
      const newY = p.startPanY + (e.clientY - p.startMouseY);
      panRef.current = { x: newX, y: newY };
      setPan({ x: newX, y: newY });
      wasPanning.current = true;
      return;
    }
    // Resize
    if (resizing.current) {
      const r = resizing.current;
      const z = zoomRef.current;
      const newW = Math.max(140, r.startW + (e.clientX - r.startMouseX) / z);
      const newH = Math.max(80, r.startH + (e.clientY - r.startMouseY) / z);
      setNodes(p => p.map(n => n.id === r.id ? { ...n, w: newW, h: newH } : n));
      return;
    }
    // Drag
    if (!dragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = panRef.current.x, py = panRef.current.y, z = zoomRef.current;
    setNodes(p => {
      const dragNode = p.find(n => n.id === dragging);
      if (!dragNode) return p;
      const newX = Math.max(0, Math.min((e.clientX - rect.left - px) / z - dragOff.current.x, CANVAS_W - dragNode.w));
      const newY = Math.max(0, Math.min((e.clientY - rect.top - py) / z - dragOff.current.y, CANVAS_H - dragNode.h));
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
  }, [dragging]);

  const onPtrUp = useCallback(() => {
    if (panStart.current) {
      panStart.current = null;
      setIsPanning(false);
      // wasPanning stays true until next click
    }
    setDragging(null);
    resizing.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPtrMove);
    window.addEventListener("pointerup", onPtrUp);
    return () => {
      window.removeEventListener("pointermove", onPtrMove);
      window.removeEventListener("pointerup", onPtrUp);
    };
  }, [onPtrMove, onPtrUp]);

  // Canvas click (deselect)
  const onCanvasClick = useCallback((e) => {
    // Skip click after panning
    if (wasPanning.current) {
      wasPanning.current = false;
      return;
    }
    if (!e.target.closest("[data-node]") && !e.target.closest("[data-add-menu]")) {
      if (connectMode) { setConnectMode(null); showToast("Cancelled"); }
      setSelected(null);
      setSelectedConn(null);
    }
  }, [connectMode, showToast]);

  // Clear selection (for keyboard shortcuts)
  const clearSelection = useCallback(() => {
    setConnectMode(null);
    setSelected(null);
    setSelectedConn(null);
    setAddMenuOpen(false);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({ deleteSelected, editingLabel, undo, redo, clearSelection });

  // Load design (shared by templates and saved designs)
  const loadDesign = useCallback((design, opts) => {
    pushUndo(nodes, connections);
    const { nodes: newNodes, connections: newConns } = deserializeDesign(design, opts);
    setNodes(newNodes);
    setConnections(newConns);
    setSelected(null);
    setSelectedConn(null);
    showToast(`Loaded: ${design.name}`);
  }, [nodes, connections, pushUndo, showToast]);

  // Load template (wrapper for legacy template format)
  const loadTemplate = useCallback((tpl) => {
    loadDesign({ name: tpl.name, nodes: tpl.nodes, conns: tpl.conns }, { center: true });
  }, [loadDesign]);

  // Save current design
  const onSaveDesign = useCallback((name) => {
    if (nodes.length === 0) return;
    const design = serializeDesign(name, nodes, connections);
    const updated = storeSaveDesign(design);
    setSavedDesigns(updated);
    showToast(`Saved: ${name}`);
  }, [nodes, connections, showToast]);

  // Delete saved design
  const onDeleteDesign = useCallback((savedAt) => {
    const updated = storeDeleteDesign(savedAt);
    setSavedDesigns(updated);
    showToast("Design deleted");
  }, [showToast]);

  // Export current canvas as JSON
  const onExportDesign = useCallback(() => {
    if (nodes.length === 0) return;
    const design = serializeDesign('Untitled', nodes, connections);
    exportDesignAsJSON(design);
    showToast("Exported as JSON");
  }, [nodes, connections, showToast]);

  // Export a saved design as JSON
  const onExportSavedDesign = useCallback((design) => {
    exportDesignAsJSON(design);
    showToast("Exported as JSON");
  }, [showToast]);

  // Import design from JSON file
  const onImportDesign = useCallback(() => {
    importDesignFromFile()
      .then(data => loadDesign(data))
      .catch(err => showToast(err.message || "Import failed"));
  }, [loadDesign, showToast]);

  // Label change
  const onLabelChange = useCallback((nodeId, value) => {
    setNodes(p => p.map(n => n.id === nodeId ? { ...n, label: value || n.label } : n));
  }, []);

  // Node color change
  const onNodeColorChange = useCallback((nodeId, color) => {
    pushUndo(nodes, connections);
    setNodes(p => p.map(n => n.id === nodeId ? { ...n, color } : n));
  }, [nodes, connections, pushUndo]);

  // Connection label change
  const onConnLabelChange = useCallback((connId, value) => {
    setConnections(p => p.map(c => c.id === connId ? { ...c, label: value } : c));
  }, []);

  // Toggle connect mode (bidirVal sets direction for the link being created)
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

  // Select connection
  const onSelectConn = useCallback((connId) => {
    setSelectedConn(connId);
    setSelected(null);
  }, []);

  // Remove a single connection
  const onRemoveConn = useCallback((connId) => {
    pushUndo(nodes, connections);
    setConnections(p => p.filter(c => c.id !== connId));
    showToast("Unlinked");
  }, [nodes, connections, pushUndo, showToast]);

  // Toggle a connection's direction (one-way ↔ bidirectional)
  const onToggleConnDirection = useCallback((connId) => {
    pushUndo(nodes, connections);
    setConnections(p => p.map(c => c.id === connId ? { ...c, bidir: !c.bidir } : c));
  }, [nodes, connections, pushUndo]);

  // Clear all
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
    <div style={{ height: "100vh", display: "flex", background: BG, color: TEXT, fontFamily: "'IBM Plex Mono', monospace", overflow: "hidden", userSelect: "none" }}>
      <Sidebar
        nodes={nodes} connections={connections} nodeMap={nodeMap}
        selected={selected} selectedConn={selectedConn}
        selectedNode={selectedNode} selectedConnObj={selectedConnObj}
        connectMode={connectMode} animating={animating} speed={speed}
        connColorIdx={connColorIdx} undoStack={undoStack} redoStack={redoStack}
        savedDesigns={savedDesigns}
        onSetEditingLabel={setEditingLabel}
        onToggleConnect={onToggleConnect}
        onUnlinkSelected={unlinkSelected}
        onDeleteSelected={deleteSelected}
        onSelectConn={(id) => setSelectedConn(id === selectedConn ? null : id)}
        onRemoveConn={onRemoveConn}
        onToggleConnDirection={onToggleConnDirection}
        onConnLabelChange={onConnLabelChange}
        onToggleAnimating={() => setAnimating(!animating)}
        onSetSpeed={setSpeed}
        onSetConnColorIdx={setConnColorIdx}
        onUndo={undo} onRedo={redo}
        onClearAll={onClearAll}
        onLoadTemplate={loadTemplate}
        onSaveDesign={onSaveDesign}
        onLoadDesign={loadDesign}
        onDeleteDesign={onDeleteDesign}
        onExportDesign={onExportDesign}
        onExportSavedDesign={onExportSavedDesign}
        onImportDesign={onImportDesign}
        onNodeColorChange={onNodeColorChange}
        pushUndo={pushUndo} showToast={showToast}
      />
      <Canvas
        canvasRef={canvasRef} nodes={nodes} connections={connections} nodeMap={nodeMap}
        selected={selected} selectedConn={selectedConn} dragging={dragging}
        connectMode={connectMode} editingLabel={editingLabel}
        animating={animating} speed={speed} toast={toast}
        pan={pan} zoom={zoom} isPanning={isPanning} spaceHeld={spaceHeld}
        addMenuOpen={addMenuOpen} onToggleAddMenu={setAddMenuOpen} onAddNode={addNode}
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
