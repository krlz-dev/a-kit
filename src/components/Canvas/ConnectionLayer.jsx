import { ACCENT } from '../../constants';
import { getCenter } from '../../utils/uid';

export default function ConnectionLayer({ connections, nodeMap, selectedConn, onSelectConn, animating, speed }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
      {connections.map(conn => {
        const a = nodeMap[conn.from], b = nodeMap[conn.to];
        if (!a || !b) return null;
        const f = getCenter(a), t = getCenter(b);
        const dx = t.x - f.x, dy = t.y - f.y, dist = Math.sqrt(dx * dx + dy * dy);
        const bend = Math.min(dist * 0.22, 70);
        const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
        const nx = -dy / (dist || 1) * bend, ny = dx / (dist || 1) * bend;
        const pathD = `M${f.x},${f.y} Q${mx + nx * 0.5},${my + ny * 0.5} ${t.x},${t.y}`;
        const pid = `p-${conn.id}`;
        const isSel = selectedConn === conn.id;
        const dur = speed + "s";
        return (
          <g key={conn.id}>
            <path d={pathD} stroke="transparent" strokeWidth="20" fill="none"
              style={{ pointerEvents: "stroke", cursor: "pointer" }}
              onClick={(e) => { e.stopPropagation(); onSelectConn(conn.id); }} />
            <path d={pathD} stroke={isSel ? ACCENT : conn.color} strokeWidth={isSel ? 2 : 1} fill="none"
              opacity={isSel ? 0.55 : 0.14} strokeDasharray={isSel ? "none" : "6 5"} />
            <path id={pid} d={pathD} fill="none" stroke="none" />
            {animating && [0, 1, 2].map(i => (
              <circle key={i} r="3.5" fill={conn.color} opacity="0.8">
                <animateMotion dur={dur} repeatCount="indefinite" begin={`${i * speed / 3}s`}>
                  <mpath href={`#${pid}`} />
                </animateMotion>
                <animate attributeName="r" values="2;4.5;2" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
              </circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
