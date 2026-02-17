export default function ToolsShowcase() {
  return (
    <section className="landing-section">
      <div className="landing-container reveal" style={{ textAlign: 'center' }}>
        <div className="section-label">// tools</div>
        <h2 className="section-title">Two tools. One toolkit.</h2>
        <p className="section-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          Architecture diagrams and project timelines, built with the same dark-mode DNA.
        </p>

        <div className="tools-grid">
          <a href="#/arch" className="tool-card">
            <div className="tool-card-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <h3>kit-a Arch</h3>
            <p>
              Visual system architecture on a drag-and-drop canvas. 14 node types, animated
              connections with labels, cloud provider catalog, and 6 starter templates.
              Export to PNG 2x, JPG, animated GIF, or WebM.
            </p>
            <span className="tool-link">
              Try Arch Editor
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </a>

          <a href="#/gantt" className="tool-card">
            <div className="tool-card-icon" style={{ background: 'rgba(6,182,212,0.12)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                <rect x="3" y="4" width="18" height="4" rx="1" /><rect x="3" y="10" width="12" height="4" rx="1" />
                <rect x="3" y="16" width="15" height="4" rx="1" />
              </svg>
            </div>
            <h3>kit-a Gantt</h3>
            <p>
              Interactive Gantt charts for project planning. 6 view modes from days to years,
              drag to schedule and resize tasks, define dependencies, track progress with
              milestones, and assign team members. Export or import as JSON.
            </p>
            <span className="tool-link">
              Try Gantt Planner
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
