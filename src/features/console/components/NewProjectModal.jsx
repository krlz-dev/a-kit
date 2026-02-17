import { useState } from 'react';

export default function NewProjectModal({ onClose, onCreate }) {
  const [type, setType] = useState('arch');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name.trim(), type);
    setLoading(false);
    onClose();
  };

  return (
    <div className="console-modal-overlay" onClick={onClose}>
      <div className="console-modal" onClick={e => e.stopPropagation()}>
        <h3>New project</h3>
        <form onSubmit={handleCreate}>
          <div className="console-modal-field">
            <label>Type</label>
          </div>
          <div className="console-modal-types">
            <button
              type="button"
              className={`console-modal-type ${type === 'arch' ? 'selected' : ''}`}
              onClick={() => setType('arch')}
            >
              <span style={{ color: '#6366f1' }}>&#9679;</span> Architecture
            </button>
            <button
              type="button"
              className={`console-modal-type ${type === 'gantt' ? 'selected' : ''}`}
              onClick={() => setType('gantt')}
            >
              <span style={{ color: '#06b6d4' }}>&#9679;</span> Gantt
            </button>
          </div>
          <div className="console-modal-field">
            <label>Project name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="My project" autoFocus required />
          </div>
          <div className="console-modal-actions">
            <button type="button" className="console-btn console-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="console-btn console-btn-primary" disabled={loading || !name.trim()}>
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
