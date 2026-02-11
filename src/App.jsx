import { useState, useRef, useCallback, useEffect } from 'react';
import { BG, TEXT, ACCENT, CONN_COLORS, COMPONENTS } from './constants';
import { uid, cuid, NODE_W, NODE_H } from './utils/uid';
import { useToast } from './hooks/useToast';
import { useUndo } from './hooks/useUndo';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
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
  const [editingLabel, setEditingLabel] = useState(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const canvasRef = useRef(null);
  const dragOff = useRef({ x: 0, y: 0 });

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

  // Add node
  const addNode = useCallback((item) => {
    pushUndo(nodes, connections);
    const canvas = canvasRef.current;
    const cx = canvas ? canvas.clientWidth / 2 - NODE_W / 2 : 200;
    const cy = canvas ? canvas.clientHeight / 2 - NODE_H / 2 : 200;
    const offset = nodes.length * 18;
    setNodes(p => [...p, {
      id: uid(), ...item,
      x: cx + (offset % 120) - 40,
      y: cy + Math.floor(offset / 120) * 90,
      w: NODE_W, h: NODE_H,
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
    e.stopPropagation();
    if (connectMode) {
      if (connectMode !== node.id) {
        const exists = connections.some(c =>
          (c.from === connectMode && c.to === node.id) || (c.from === node.id && c.to === connectMode)
        );
        if (!exists) {
          pushUndo(nodes, connections);
          setConnections(p => [...p, { id: cuid(), from: connectMode, to: node.id, color: CONN_COLORS[connColorIdx % CONN_COLORS.length] }]);
          showToast("Connected ✓");
        } else showToast("Already connected");
      }
      setConnectMode(null);
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    dragOff.current = { x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y };
    setDragging(node.id);
    setSelected(node.id);
    setSelectedConn(null);
  }, [connectMode, connections, connColorIdx, nodes, pushUndo, showToast]);

  // Drag handling
  const onPtrMove = useCallback((e) => {
    if (!dragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setNodes(p => p.map(n => n.id === dragging ? {
      ...n,
      x: Math.max(0, Math.min(e.clientX - rect.left - dragOff.current.x, rect.width - n.w)),
      y: Math.max(0, Math.min(e.clientY - rect.top - dragOff.current.y, rect.height - n.h)),
    } : n));
  }, [dragging]);

  const onPtrUp = useCallback(() => setDragging(null), []);

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

  // Load template
  const loadTemplate = useCallback((tpl) => {
    pushUndo(nodes, connections);
    const newNodes = tpl.nodes.map(n => ({
      id: uid(), type: n.type, label: n.label, color: n.color,
      icon: COMPONENTS.find(c => c.type === n.type)?.icon || COMPONENTS[0].icon,
      x: n.x, y: n.y, w: NODE_W, h: NODE_H,
    }));
    const newConns = tpl.conns.map(([fi, ti, color]) => ({
      id: cuid(), from: newNodes[fi].id, to: newNodes[ti].id, color,
    }));
    setNodes(newNodes);
    setConnections(newConns);
    setSelected(null);
    setSelectedConn(null);
    showToast(`Loaded: ${tpl.name}`);
  }, [nodes, connections, pushUndo, showToast]);

  // Label change
  const onLabelChange = useCallback((nodeId, value) => {
    setNodes(p => p.map(n => n.id === nodeId ? { ...n, label: value || n.label } : n));
  }, []);

  // Toggle connect mode
  const onToggleConnect = useCallback(() => {
    if (connectMode === selected) {
      setConnectMode(null);
      showToast("Cancelled");
    } else {
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
    <div style={{ height: "100vh", display: "flex", background: BG, color: TEXT, fontFamily: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif", overflow: "hidden", userSelect: "none" }}>
      <Sidebar
        nodes={nodes} connections={connections} nodeMap={nodeMap}
        selected={selected} selectedConn={selectedConn}
        selectedNode={selectedNode} selectedConnObj={selectedConnObj}
        connectMode={connectMode} animating={animating} speed={speed}
        connColorIdx={connColorIdx} undoStack={undoStack} redoStack={redoStack}
        onSetEditingLabel={setEditingLabel}
        onToggleConnect={onToggleConnect}
        onUnlinkSelected={unlinkSelected}
        onDeleteSelected={deleteSelected}
        onSelectConn={(id) => setSelectedConn(id === selectedConn ? null : id)}
        onRemoveConn={onRemoveConn}
        onToggleAnimating={() => setAnimating(!animating)}
        onSetSpeed={setSpeed}
        onSetConnColorIdx={setConnColorIdx}
        onUndo={undo} onRedo={redo}
        onClearAll={onClearAll}
        onLoadTemplate={loadTemplate}
        pushUndo={pushUndo} showToast={showToast}
      />
      <Canvas
        canvasRef={canvasRef} nodes={nodes} connections={connections} nodeMap={nodeMap}
        selected={selected} selectedConn={selectedConn} dragging={dragging}
        connectMode={connectMode} editingLabel={editingLabel}
        animating={animating} speed={speed} toast={toast}
        addMenuOpen={addMenuOpen} onToggleAddMenu={setAddMenuOpen} onAddNode={addNode}
        onCanvasClick={onCanvasClick}
        onNodePointerDown={onNodePointerDown}
        onNodeDoubleClick={(e, id) => { e.stopPropagation(); setEditingLabel(id); }}
        onLabelChange={onLabelChange}
        onEditDone={() => setEditingLabel(null)}
        onSelectConn={onSelectConn}
      />
    </div>
  );
}
