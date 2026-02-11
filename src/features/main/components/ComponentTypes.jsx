const NODES = [
  { name: 'Client', color: '#6366f1' },
  { name: 'Server', color: '#3b82f6' },
  { name: 'Database', color: '#f97316' },
  { name: 'API', color: '#06b6d4' },
  { name: 'Auth', color: '#f59e0b' },
  { name: 'Queue', color: '#ec4899' },
  { name: 'Cache', color: '#eab308' },
  { name: 'Cloud', color: '#64748b' },
  { name: 'Bucket', color: '#64748b' },
  { name: 'Function', color: '#a855f7' },
  { name: 'Monitor', color: '#14b8a6' },
  { name: 'Mobile', color: '#8b5cf6' },
  { name: 'Web App', color: '#10b981' },
  { name: 'Group', color: '#4ade80' },
];

export default function ComponentTypes() {
  return (
    <section className="landing-section">
      <div className="landing-container reveal" style={{ textAlign: 'center' }}>
        <div className="section-label">// components</div>
        <h2 className="section-title">14 node types. Infinite combinations.</h2>
        <p className="section-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          Every building block for modern system architecture. Group them, connect them, export them.
        </p>

        <div className="nodes-wrap">
          {NODES.map(n => (
            <span
              key={n.name}
              className="node-chip"
              style={{
                borderColor: `${n.color}4d`,
                background: `${n.color}0f`,
              }}
            >
              <span className="dot" style={{ background: n.color }} />
              {n.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
