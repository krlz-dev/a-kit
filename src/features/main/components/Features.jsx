const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    iconBg: 'rgba(99,102,241,0.12)',
    badge: 'Arch',
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
    badge: 'Arch',
    title: 'Smart Connections',
    desc: 'Labeled, colored, directional or bidirectional. Animated flow visualization with adjustable speed. 7 color options.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
        <rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="12" height="4" rx="1"/>
        <rect x="3" y="16" width="15" height="4" rx="1"/>
      </svg>
    ),
    iconBg: 'rgba(236,72,153,0.12)',
    badge: 'Gantt',
    title: 'Interactive Timeline',
    desc: '6 view modes \u2014 days, weeks, months, quarters, years, or full timeline. Drag bars to reschedule, resize to adjust duration.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    iconBg: 'rgba(245,158,11,0.12)',
    badge: 'Gantt',
    title: 'Tasks & Dependencies',
    desc: 'Tasks, groups, and milestones with progress tracking. Define dependencies between tasks. Assign owners and color-code by team.',
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
      </svg>
    ),
    iconBg: 'rgba(16,185,129,0.12)',
    title: 'Save & Load',
    desc: 'Cloud storage with your account. Export and import as JSON. Access your projects from any device via the Console.',
  },
];

export default function Features() {
  return (
    <section className="landing-section" id="features">
      <div className="landing-container reveal">
        <div className="section-label">// features</div>
        <h2 className="section-title">Everything you need.<br />Nothing you don&apos;t.</h2>
        <p className="section-sub">Built for engineers who think in systems. No learning curve, no heavy desktop app. Simple pricing, powerful tools.</p>

        <div className="features-grid">
          {FEATURES.map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-card-top">
                <div className="feature-icon" style={{ background: f.iconBg }}>{f.icon}</div>
                {f.badge && <span className="feature-badge">{f.badge}</span>}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
