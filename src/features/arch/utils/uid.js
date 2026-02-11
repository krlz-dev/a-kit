let _id = 1;
export const uid = () => `n${_id++}`;
export const cuid = () => `c${_id++}`;

export const NODE_W = 130;
export const NODE_H = 72;
export const GROUP_W = 220;
export const GROUP_H = 160;
export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

export const getCenter = (n) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });
