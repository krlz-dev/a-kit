import { ACCENT } from '../../constants';
import { getCenter } from '../../utils/uid';

export default function ConnectionLayer({ connections, nodeMap, selectedConn, onSelectConn, animating, speed }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}>
      <defs>
        {connections.map(conn => {
          const color = selectedConn === conn.id ? ACCENT : conn.color;
          return [
            <marker key={`ah-end-${conn.id}`} id={`ah-end-${conn.id}`}
              markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill={color} />
            </marker>,
            conn.bidir && (
              <marker key={`ah-start-${conn.id}`} id={`ah-start-${conn.id}`}
                markerWidth="6" markerHeight="4" refX="1" refY="2" orient="auto">
                <polygon points="6 0, 0 2, 6 4" fill={color} />
              </marker>
            ),
          ];
        })}
      </defs>
      {connections.map(conn => {
        const a = nodeMap[conn.from], b = nodeMap[conn.to];
        if (!a || !b) return null;
        const f = getCenter(a), t = getCenter(b);
        const dx = t.x - f.x, dy = t.y - f.y, dist = Math.sqrt(dx * dx + dy * dy);
        const bend = Math.min(dist * 0.22, 70);
        const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
        const nx = -dy / (dist || 1) * bend, ny = dx / (dist || 1) * bend;
        const pathD = `M${f.x},${f.y} Q${mx + nx * 0.5},${my + ny * 0.5} ${t.x},${t.y}`;
        const revPathD = `M${t.x},${t.y} Q${mx + nx * 0.5},${my + ny * 0.5} ${f.x},${f.y}`;
        const pid = `p-${conn.id}`;
        const rpid = `rp-${conn.id}`;
        const isSel = selectedConn === conn.id;
        const dur = speed + "s";
        return (
          <g key={conn.id}>
            <path d={pathD} stroke="transparent" strokeWidth="20" fill="none"
              style={{ pointerEvents: "stroke", cursor: "pointer" }}
              onClick={(e) => { e.stopPropagation(); onSelectConn(conn.id); }} />
            <path d={pathD} stroke={isSel ? ACCENT : conn.color} strokeWidth={isSel ? 2 : 1} fill="none"
              opacity={isSel ? 0.55 : 0.14} strokeDasharray={isSel ? "none" : "6 5"}
              markerEnd={`url(#ah-end-${conn.id})`}
              markerStart={conn.bidir ? `url(#ah-start-${conn.id})` : undefined} />
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
            {conn.bidir && (
              <>
                <path id={rpid} d={revPathD} fill="none" stroke="none" />
                {animating && [0, 1, 2].map(i => (
                  <circle key={`r${i}`} r="3.5" fill={conn.color} opacity="0.8">
                    <animateMotion dur={dur} repeatCount="indefinite" begin={`${i * speed / 3}s`}>
                      <mpath href={`#${rpid}`} />
                    </animateMotion>
                    <animate attributeName="r" values="2;4.5;2" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
                  </circle>
                ))}
              </>
            )}
            {conn.label && (() => {
              const cx = mx + nx * 0.5;
              const cy = my + ny * 0.5;
              const labelMidX = (f.x + 2 * cx + t.x) / 4;
              const labelMidY = (f.y + 2 * cy + t.y) / 4;
              const labelColor = isSel ? ACCENT : conn.color;
              return (
                <g style={{ pointerEvents: "none" }}>
                  <rect x={labelMidX - conn.label.length * 2.7 - 6} y={labelMidY - 7}
                    width={conn.label.length * 5.4 + 12} height={16}
                    rx={4} fill="#0d1117" opacity={0.85} />
                  <text x={labelMidX} y={labelMidY + 4}
                    textAnchor="middle" fill={labelColor} opacity={0.85}
                    style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {conn.label}
                  </text>
                </g>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
}
