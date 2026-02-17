import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ProjectCard({ project, onRename, onDelete }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(project.name);

  const typeColor = project.type === 'arch' ? '#6366f1' : '#06b6d4';
  const typeLabel = project.type === 'arch' ? 'Architecture' : 'Gantt';

  const handleClick = () => {
    if (menuOpen || renaming) return;
    navigate(`/${project.type}/${project.id}`);
  };

  const handleRename = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      onRename(project.id, newName.trim());
      setRenaming(false);
    }
  };

  return (
    <div className="project-card" onClick={handleClick}>
      <div className="project-card-header">
        <div className="project-card-type" style={{ color: typeColor }}>
          <span className="project-card-dot" style={{ background: typeColor }} />
          {typeLabel}
        </div>
        <button
          className="project-card-menu"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
        >
          &#x22EE;
        </button>
      </div>

      {renaming ? (
        <form onSubmit={handleRename} onClick={e => e.stopPropagation()}>
          <input
            className="console-modal-field"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
            onBlur={() => setRenaming(false)}
            style={{
              background: 'rgba(24,32,24,0.7)', border: '1px solid rgba(200,230,0,0.2)',
              borderRadius: 6, padding: '6px 10px', color: '#d8e4d8',
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, width: '100%', outline: 'none',
            }}
          />
        </form>
      ) : (
        <div className="project-card-name">{project.name}</div>
      )}

      <div className="project-card-meta">Updated {timeAgo(project.updated_at)}</div>

      {menuOpen && (
        <div className="project-card-actions" onClick={e => e.stopPropagation()}>
          <button className="project-card-action" onClick={() => { setMenuOpen(false); setRenaming(true); setNewName(project.name); }}>
            Rename
          </button>
          <button className="project-card-action danger" onClick={() => { setMenuOpen(false); onDelete(project.id); }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
