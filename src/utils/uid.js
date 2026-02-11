let _id = 1;
export const uid = () => `n${_id++}`;
export const cuid = () => `c${_id++}`;

export const NODE_W = 130;
export const NODE_H = 72;

export const getCenter = (n) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });
