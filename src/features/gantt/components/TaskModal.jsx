import { useState, useEffect } from 'react';
import { formatDate, getToday } from '../utils/dateUtils';
import ColorPicker from './ColorPicker';

const S = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#0e140e', border: '1px solid rgba(200,230,0,0.1)', borderRadius: 12,
    width: 440, maxHeight: '90vh', overflow: 'auto',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid rgba(200,230,0,0.06)',
  },
  title: { fontSize: 16, fontWeight: 600, color: '#d8e4d8' },
  close: {
    background: 'none', border: 'none', color: '#7a8e7a', cursor: 'pointer',
    fontSize: 20, fontFamily: 'inherit',
  },
  body: { padding: 20, display: 'flex', flexDirection: 'column', gap: 16 },
  label: { fontSize: 12, fontWeight: 500, color: '#7a8e7a', marginBottom: 6, display: 'block' },
  input: {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(200,230,0,0.1)',
    background: '#080c08', color: '#d8e4d8', fontSize: 13, fontFamily: "'IBM Plex Mono', monospace",
    outline: 'none',
  },
  select: {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(200,230,0,0.1)',
    background: '#080c08', color: '#d8e4d8', fontSize: 13, fontFamily: "'IBM Plex Mono', monospace",
    outline: 'none',
  },
  row: { display: 'flex', gap: 12 },
  footer: {
    display: 'flex', alignItems: 'center', padding: '14px 20px',
    borderTop: '1px solid rgba(200,230,0,0.06)', gap: 8,
  },
  btn: {
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace",
  },
};

export default function TaskModal({ task, tasks, onSave, onDelete, onClose }) {
  const isEdit = task && task.id != null;
  const today = getToday();

  const [name, setName] = useState('');
  const [type, setType] = useState('task');
  const [start, setStart] = useState(formatDate(today));
  const [end, setEnd] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return formatDate(d);
  });
  const [assignee, setAssignee] = useState('');
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState('blue');
  const [dependsOn, setDependsOn] = useState('');

  useEffect(() => {
    if (isEdit) {
      setName(task.name || '');
      setType(task.type || 'task');
      setStart(task.start);
      setEnd(task.end);
      setAssignee(task.assignee || '');
      setProgress(task.progress || 0);
      setColor(task.color || 'blue');
      setDependsOn(task.dependsOn ? String(task.dependsOn) : '');
    }
  }, [task, isEdit]);

  const handleSave = () => {
    if (!name.trim() || !start) return;
    const finalEnd = type === 'milestone' ? start : end;
    const data = { name: name.trim(), start, end: finalEnd };
    if (type !== 'task') data.type = type;
    if (type === 'task') {
      if (assignee.trim()) data.assignee = assignee.trim();
      data.progress = progress;
      data.color = color;
      if (dependsOn) data.dependsOn = parseInt(dependsOn);
    }
    onSave(isEdit ? task.id : null, data);
  };

  const depOptions = (tasks || []).filter(t => t.id !== (task?.id) && t.type !== 'group');

  return (
    <div style={S.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>
        <div style={S.header}>
          <span style={S.title}>{isEdit ? 'Edit Task' : 'Add Task'}</span>
          <button style={S.close} onClick={onClose}>&times;</button>
        </div>

        <div style={S.body}>
          <div>
            <label style={S.label}>Task Name</label>
            <input style={S.input} value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>

          <div>
            <label style={S.label}>Type</label>
            <select style={S.select} value={type} onChange={e => setType(e.target.value)}>
              <option value="task">Task</option>
              <option value="group">Group</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>

          <div style={S.row}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Start Date</label>
              <input style={S.input} type="date" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            {type !== 'milestone' && (
              <div style={{ flex: 1 }}>
                <label style={S.label}>End Date</label>
                <input style={S.input} type="date" value={end} onChange={e => setEnd(e.target.value)} />
              </div>
            )}
          </div>

          {type === 'task' && (
            <>
              <div>
                <label style={S.label}>Assignee (initials)</label>
                <input style={S.input} value={assignee} onChange={e => setAssignee(e.target.value)} maxLength={3} placeholder="e.g. JD" />
              </div>

              <div>
                <label style={S.label}>Progress: {progress}%</label>
                <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(parseInt(e.target.value))}
                  style={{ width: '100%' }} />
              </div>

              <div>
                <label style={S.label}>Color</label>
                <ColorPicker value={color} onChange={setColor} />
              </div>

              <div>
                <label style={S.label}>Depends On</label>
                <select style={S.select} value={dependsOn} onChange={e => setDependsOn(e.target.value)}>
                  <option value="">None</option>
                  {depOptions.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div style={S.footer}>
          {isEdit && (
            <button style={{ ...S.btn, background: 'rgba(248,113,113,0.1)', color: '#f87171', marginRight: 'auto' }}
              onClick={() => onDelete(task.id)}>
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button style={{ ...S.btn, background: 'transparent', color: '#7a8e7a', border: '1px solid rgba(200,230,0,0.1)' }}
            onClick={onClose}>
            Cancel
          </button>
          <button style={{ ...S.btn, background: '#c8e600', color: '#080c08' }}
            onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
