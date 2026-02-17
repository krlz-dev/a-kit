import { useAuth } from '../../../shared/context/AuthContext';

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="hero">
      <div className="hero-badge">
        <span className="dot" />
        Open Source &middot; Browser-Based &middot; Zero Config
      </div>
      <h1>Architecture &amp; planning,<br /><span className="accent">wired different.</span></h1>
      <p className="hero-sub">
        A lightweight toolkit for system architecture diagrams and project timelines.
        Drag, connect, plan, export. No sign-up. No bloat.
      </p>
      <div className="hero-actions">
        {user ? (
          <a href="#/console" className="landing-btn landing-btn-primary">
            Go to Console
          </a>
        ) : (
          <>
            <a href="#/arch" className="landing-btn landing-btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Try Arch
            </a>
            <a href="#/gantt" className="landing-btn landing-btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="12" height="4" rx="1"/><rect x="3" y="16" width="15" height="4" rx="1"/></svg>
              Try Gantt
            </a>
          </>
        )}
      </div>

      <div className="hero-previews">
        {/* Arch mini-preview */}
        <a href="#/arch" className="hero-preview-card">
          <div className="preview-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Arch
          </div>
          <div className="arch-preview">
            {/* Canvas bg with dot grid */}
            <div className="arch-canvas">
              {/* Connection SVG */}
              <svg className="arch-conn-svg" viewBox="0 0 260 100" fill="none">
                <defs>
                  <marker id="arrow-fwd" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <polygon points="0 0, 6 2, 0 4" fill="#06b6d4" />
                  </marker>
                  <marker id="arrow-bwd" markerWidth="6" markerHeight="4" refX="1" refY="2" orient="auto">
                    <polygon points="6 0, 0 2, 6 4" fill="#06b6d4" />
                  </marker>
                </defs>
                <path
                  d="M82 50 Q130 20 178 50"
                  stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 5" opacity="0.45"
                  markerEnd="url(#arrow-fwd)" markerStart="url(#arrow-bwd)"
                />
                {/* Label */}
                <rect x="109" y="22" width="42" height="16" rx="4" fill="#0d1117" opacity="0.85" />
                <text x="130" y="33" textAnchor="middle" fill="#06b6d4" fontSize="9" fontFamily="IBM Plex Mono, monospace" opacity="0.85">REST</text>
                {/* Animated dots */}
                <circle r="2.5" fill="#06b6d4" opacity="0.8">
                  <animateMotion dur="3s" repeatCount="indefinite" path="M82 50 Q130 20 178 50" />
                </circle>
                <circle r="2.5" fill="#06b6d4" opacity="0.5">
                  <animateMotion dur="3s" repeatCount="indefinite" begin="1s" path="M178 50 Q130 20 82 50" />
                </circle>
              </svg>
              {/* Server node */}
              <div className="arch-node-real" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <div className="arch-node-bar" style={{ background: '#3b82f6' }} />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
                  <circle cx="6" cy="6" r="1" fill="#3b82f6"/><circle cx="6" cy="18" r="1" fill="#3b82f6"/>
                </svg>
                <span className="arch-node-label">Server</span>
              </div>
              {/* Web App node */}
              <div className="arch-node-real" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <div className="arch-node-bar" style={{ background: '#10b981' }} />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
                <span className="arch-node-label">Web App</span>
              </div>
            </div>
          </div>
        </a>

        {/* Gantt mini-preview */}
        <a href="#/gantt" className="hero-preview-card">
          <div className="preview-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
              <rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="12" height="4" rx="1"/>
              <rect x="3" y="16" width="15" height="4" rx="1"/>
            </svg>
            Gantt
          </div>
          <div className="gantt-preview">
            <div className="gantt-row">
              <span className="gantt-label">Design</span>
              <div className="gantt-track"><div className="gantt-bar" style={{ width: '45%', left: '0%', background: '#6366f1' }} /></div>
            </div>
            <div className="gantt-row">
              <span className="gantt-label">Frontend</span>
              <div className="gantt-track"><div className="gantt-bar" style={{ width: '55%', left: '20%', background: '#06b6d4' }} /></div>
            </div>
            <div className="gantt-row">
              <span className="gantt-label">Backend</span>
              <div className="gantt-track"><div className="gantt-bar" style={{ width: '50%', left: '15%', background: '#10b981' }} /></div>
            </div>
            <div className="gantt-row">
              <span className="gantt-label">Testing</span>
              <div className="gantt-track"><div className="gantt-bar" style={{ width: '35%', left: '55%', background: '#f59e0b' }} /></div>
            </div>
            <div className="gantt-row">
              <span className="gantt-label">Launch</span>
              <div className="gantt-track"><div className="gantt-bar gantt-milestone" style={{ left: '90%', background: '#ec4899' }} /></div>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
