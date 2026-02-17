export default function Nav() {
  return (
    <nav className="landing-nav">
      <div className="landing-container">
        <a href="#/" className="nav-brand">
          <svg viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#080c08"/>
            <path d="M18 16l-2 2-2-2 2-2 2 2zm-2-6l2.12 2.12 2.5-2.5L16 5l-4.62 4.62 2.5 2.5L16 10zm-6 6l2.12-2.12-2.5-2.5L5 16l4.62 4.62 2.5-2.5L10 16zm12 0l-2.12 2.12 2.5 2.5L27 16l-4.62-4.62-2.5 2.5L22 16zm-6 6l-2.12-2.12-2.5 2.5L16 27l4.62-4.62-2.5-2.5L16 22z" fill="#c8e600"/>
          </svg>
          <span>kit-a <span className="ver">v1.0</span></span>
        </a>
        <div className="nav-links">
          <a href="#/arch" className="nav-tool-link">
            <span className="nav-tool-dot" style={{ background: '#6366f1' }} />
            Arch
          </a>
          <a href="#/gantt" className="nav-tool-link">
            <span className="nav-tool-dot" style={{ background: '#06b6d4' }} />
            Gantt
          </a>
        </div>
      </div>
    </nav>
  );
}
