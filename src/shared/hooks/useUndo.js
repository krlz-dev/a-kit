import { useCallback, useRef } from 'react';

const MAX_UNDO = 40;

export function useUndo(nodes, connections, setNodes, setConnections, resetSelection) {
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const pushUndo = useCallback((n, c) => {
    undoStack.current.push({
      nodes: JSON.parse(JSON.stringify(n)),
      connections: JSON.parse(JSON.stringify(c)),
    });
    if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
    redoStack.current = [];
  }, []);

  const undo = useCallback(() => {
    if (!undoStack.current.length) return;
    redoStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections)),
    });
    const prev = undoStack.current.pop();
    setNodes(prev.nodes);
    setConnections(prev.connections);
    resetSelection();
  }, [nodes, connections, setNodes, setConnections, resetSelection]);

  const redo = useCallback(() => {
    if (!redoStack.current.length) return;
    undoStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections)),
    });
    const next = redoStack.current.pop();
    setNodes(next.nodes);
    setConnections(next.connections);
    resetSelection();
  }, [nodes, connections, setNodes, setConnections, resetSelection]);

  return { pushUndo, undo, redo, undoStack, redoStack };
}
