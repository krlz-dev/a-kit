const ACCENT = '#c8e600';

export default function MarqueeRect({ marquee }) {
  if (!marquee) return null;
  const x = Math.min(marquee.startX, marquee.currentX);
  const y = Math.min(marquee.startY, marquee.currentY);
  const w = Math.abs(marquee.currentX - marquee.startX);
  const h = Math.abs(marquee.currentY - marquee.startY);
  if (w < 2 && h < 2) return null;

  const dot = (left, top) => (
    <div style={{
      position: 'absolute', left: left - 3, top: top - 3,
      width: 6, height: 6, background: ACCENT,
    }} />
  );

  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      border: `1.5px dashed ${ACCENT}`,
      background: `${ACCENT}08`,
      pointerEvents: 'none',
      zIndex: 50,
    }}>
      {dot(0, 0)}
      {dot(w, 0)}
      {dot(0, h)}
      {dot(w, h)}
    </div>
  );
}
