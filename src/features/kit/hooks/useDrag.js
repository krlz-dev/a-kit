import { useState, useCallback, useEffect, useRef } from 'react';

export function useDrag(canvasRef) {
  const [dragging, setDragging] = useState(null);
  const dragOff = useRef({ x: 0, y: 0 });

  const startDrag = useCallback((e, node) => {
    const rect = canvasRef.current.getBoundingClientRect();
    dragOff.current = { x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y };
    setDragging(node.id);
  }, [canvasRef]);

  const onNodePointerDown = useCallback((e, node, onSelect) => {
    e.stopPropagation();
    onSelect();
    startDrag(e, node);
  }, [startDrag]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      // We dispatch a custom event so App can update nodes
      const detail = {
        id: dragging,
        x: Math.max(0, e.clientX - rect.left - dragOff.current.x),
        y: Math.max(0, e.clientY - rect.top - dragOff.current.y),
        maxX: rect.width,
        maxY: rect.height,
      };
      window.dispatchEvent(new CustomEvent('node-drag', { detail }));
    };
    const onUp = () => setDragging(null);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, canvasRef]);

  return { dragging, dragOff, onNodePointerDown, startDrag };
}
