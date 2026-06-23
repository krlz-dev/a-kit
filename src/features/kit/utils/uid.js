let _id = 1;
export const uid = () => `n${_id++}`;
export const cuid = () => `c${_id++}`;

export const NODE_W = 130;
export const NODE_H = 72;
export const GROUP_W = 220;
export const GROUP_H = 160;
export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

export const CANVAS_PRESETS = [
  { label: '1920 × 1080', w: 1920, h: 1080 },
  { label: '2560 × 1440', w: 2560, h: 1440 },
  { label: '3840 × 2160', w: 3840, h: 2160 },
  { label: '1080 × 1080', w: 1080, h: 1080 },
  { label: '1200 × 628',  w: 1200, h: 628  },
];

export const getCenter = (n) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });
