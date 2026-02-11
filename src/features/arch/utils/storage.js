import { uid, cuid, NODE_W, NODE_H, GROUP_W, GROUP_H, CANVAS_W, CANVAS_H } from './uid';
import { COMPONENTS } from '../constants/components';

const STORAGE_KEY = 'akit-designs';

/* ── localStorage CRUD ── */

export function getSavedDesigns() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveDesign(design) {
  const designs = getSavedDesigns();
  designs.unshift(design);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  return designs;
}

export function deleteDesign(savedAt) {
  const designs = getSavedDesigns().filter(d => d.savedAt !== savedAt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  return designs;
}

/* ── Serialize (state → portable JSON) ── */

export function serializeDesign(name, nodes, connections) {
  const idToIdx = {};
  nodes.forEach((n, i) => { idToIdx[n.id] = i; });

  const serializedNodes = nodes.map(n => {
    const entry = { type: n.type, label: n.label, color: n.color, x: Math.round(n.x), y: Math.round(n.y) };
    const defaultW = n.type === 'group' ? GROUP_W : NODE_W;
    const defaultH = n.type === 'group' ? GROUP_H : NODE_H;
    if (n.w !== defaultW) entry.w = n.w;
    if (n.h !== defaultH) entry.h = n.h;
    return entry;
  });

  const serializedConns = connections.map(c => {
    const entry = { from: idToIdx[c.from], to: idToIdx[c.to], color: c.color };
    if (c.bidir) entry.bidir = true;
    if (c.label) entry.label = c.label;
    return entry;
  });

  return {
    version: 1,
    name,
    savedAt: Date.now(),
    nodes: serializedNodes,
    connections: serializedConns,
  };
}

/* ── Deserialize (portable JSON → state) ── */

export function deserializeDesign(design, { center = false } = {}) {
  const newNodes = design.nodes.map(n => {
    const comp = COMPONENTS.find(c => c.type === n.type);
    const isGroup = n.type === 'group';
    return {
      id: uid(),
      type: n.type,
      label: n.label,
      color: n.color,
      icon: comp?.icon || COMPONENTS[0].icon,
      x: n.x,
      y: n.y,
      w: n.w || (isGroup ? GROUP_W : NODE_W),
      h: n.h || (isGroup ? GROUP_H : NODE_H),
    };
  });

  const newConns = (design.connections || design.conns || []).map(c => {
    if (Array.isArray(c)) {
      // Template format: [fromIdx, toIdx, color, bidir?, label?]
      return {
        id: cuid(),
        from: newNodes[c[0]].id,
        to: newNodes[c[1]].id,
        color: c[2],
        bidir: c[3] || false,
        label: c[4] || '',
      };
    }
    // Saved design format: { from, to, color, bidir?, label? }
    return {
      id: cuid(),
      from: newNodes[c.from].id,
      to: newNodes[c.to].id,
      color: c.color,
      bidir: c.bidir || false,
      label: c.label || '',
    };
  });

  if (center && newNodes.length > 0) {
    const minX = Math.min(...newNodes.map(n => n.x));
    const maxX = Math.max(...newNodes.map(n => n.x + n.w));
    const minY = Math.min(...newNodes.map(n => n.y));
    const maxY = Math.max(...newNodes.map(n => n.y + n.h));
    const dx = (CANVAS_W - (maxX - minX)) / 2 - minX;
    const dy = (CANVAS_H - (maxY - minY)) / 2 - minY;
    newNodes.forEach(n => { n.x += dx; n.y += dy; });
  }

  return { nodes: newNodes, connections: newConns };
}

/* ── Export as .json file ── */

export function exportDesignAsJSON(design) {
  const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${design.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Import from .json file ── */

export function importDesignFromFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.nodes || !Array.isArray(data.nodes)) {
            return reject(new Error('Invalid design file'));
          }
          resolve(data);
        } catch { reject(new Error('Invalid JSON')); }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}
