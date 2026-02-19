import { ROW_HEIGHT, TIMELINE_HEADER_HEIGHT } from '../constants/ganttTheme';

const S = {
  sidebar: {
    display: 'flex', flexDirection: 'column', background: '#0e140e',
    borderRight: '2px solid rgba(200,230,0,0.08)', position: 'relative',
  },
  header: {
    height: TIMELINE_HEADER_HEIGHT, borderBottom: '1px solid rgba(200,230,0,0.06)',
    display: 'flex', alignItems: 'center', padding: '0 16px',
    fontSize: 11, fontWeight: 600, color: '#b0c4b0', textTransform: 'uppercase', letterSpacing: 1,
  },
  list: { flex: 1, overflowY: 'auto' },
  row: {
    height: ROW_HEIGHT, display: 'flex', alignItems: 'center', padding: '0 8px 0 16px',
    borderBottom: '1px solid rgba(200,230,0,0.04)', cursor: 'pointer', transition: 'background 0.15s',
  },
  icon: { width: 20, marginRight: 8, color: '#8a9b8a', display: 'flex', alignItems: 'center' },
  name: {
    flex: 1, fontSize: 13, color: '#d8e4d8', whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis',
  },
  editBtn: {
    padding: '2px 6px', border: '1px solid rgba(200,230,0,0.1)', borderRadius: 6,
    background: 'transparent', color: '#b0c4b0', cursor: 'pointer', fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace", display: 'none',
  },
  assignee: {
    width: 28, height: 28, borderRadius: '50%', background: '#818cf8',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 600, flexShrink: 0,
  },
};

const FolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>
);
const DiamondIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f97316">
    <path d="M12 2l10 10-10 10L2 12z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 11 12 14 22 4" opacity="0.4"/>
  </svg>
);

export default function TaskSidebar({ tasks, sidebarWidth, listRef, onScroll, onEditTask }) {
  return (
    <div style={{ ...S.sidebar, width: sidebarWidth, minWidth: 200, maxWidth: 600 }}>
      <div style={S.header}>
        <span>Task Name</span>
        <span style={{ marginLeft: 'auto' }}>Assignee</span>
      </div>
      <div style={S.list} ref={listRef} onScroll={onScroll}>
        {tasks.map(task => {
          const isGroup = task.type === 'group';
          const isMilestone = task.type === 'milestone';
          return (
            <div
              key={task.id}
              style={{
                ...S.row,
                ...(isGroup ? { background: 'rgba(200,230,0,0.04)', fontWeight: 600 } : {}),
              }}
              className="gantt-task-row"
              onClick={() => onEditTask(task)}
            >
              <span style={S.icon}>
                {isGroup ? <FolderIcon /> : isMilestone ? <DiamondIcon /> : <CheckIcon />}
              </span>
              <span style={S.name}>{task.name}</span>
              {task.assignee ? (
                <span style={S.assignee}>{task.assignee}</span>
              ) : (
                <span style={{ width: 28 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
