const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    iconBg: 'rgba(99,102,241,0.12)',
    title: 'Node-Based Canvas',
    desc: '14 component types \u2014 Client, Server, DB, API, Auth, Queue, Cache, Cloud, Function, and more. Drag to place, double-click to rename.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    ),
    iconBg: 'rgba(6,182,212,0.12)',
    title: 'Smart Connections',
    desc: 'Labeled, colored, directional or bidirectional. Animated flow visualization with adjustable speed. 7 color options.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8e600" strokeWidth="2">
        <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    iconBg: 'rgba(200,230,0,0.12)',
    title: 'Multi-Format Export',
    desc: 'PNG at 2x resolution, JPG, animated GIF, and WebM video. Share diagrams anywhere \u2014 docs, slides, or Slack.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
        <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
        <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
      </svg>
    ),
    iconBg: 'rgba(245,158,11,0.12)',
    title: 'Full Undo/Redo',
    desc: '40-state history with Ctrl+Z / Ctrl+Shift+Z. Move fast, break things, then undo them. Every action is reversible.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    iconBg: 'rgba(236,72,153,0.12)',
    title: 'Zero Dependencies*',
    desc: 'React + Vite + two focused libraries. No state management bloat, no CSS frameworks, no vendor lock-in. *Almost zero.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
      </svg>
    ),
    iconBg: 'rgba(16,185,129,0.12)',
    title: 'Save & Load',
    desc: 'Persist to localStorage, export/import as JSON. Your diagrams live in your browser \u2014 no account required, ever.',
  },
];

export default function Features() {
  return (
    <section className="landing-section" id="features">
      <div className="landing-container reveal">
        <div className="section-label">// features</div>
        <h2 className="section-title">Everything you need.<br />Nothing you don&apos;t.</h2>
        <p className="section-sub">Built for engineers who think in systems. No learning curve, no enterprise pricing, no 200MB Electron app.</p>

        <div className="features-grid">
          {FEATURES.map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon" style={{ background: f.iconBg }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
