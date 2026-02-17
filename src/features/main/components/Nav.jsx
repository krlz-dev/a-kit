import { useAuth } from '../../../shared/context/AuthContext';

export default function Nav() {
  const { user } = useAuth();

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Try Arch
          </a>
          <a href="#/gantt" className="nav-tool-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="12" height="4" rx="1"/><rect x="3" y="16" width="15" height="4" rx="1"/></svg>
            Try Gantt
          </a>
          {user ? (
            <a href="#/console" className="nav-tool-link" style={{ color: '#c8e600' }}>
              Console
            </a>
          ) : (
            <a href="#/login" className="nav-tool-link" style={{ color: '#7a8e7a' }}>
              Sign in
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
