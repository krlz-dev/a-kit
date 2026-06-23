import { ACCENT, TEXT, TEXT_DIM, TEXT_MID, SURFACE, CARD_BORDER, DIVIDER } from '../../constants';

const MOD = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

const SHORTCUTS = [
  { keys: [MOD, 'Z'], action: 'Undo' },
  { keys: [MOD, '⇧', 'Z'], action: 'Redo' },
  { keys: ['L'], action: 'Link mode, then click a target' },
  { keys: ['Del'], action: 'Delete selection' },
  { keys: ['Esc'], action: 'Clear selection' },
  { keys: ['Double-click'], action: 'Rename a node' },
  { keys: ['⇧', 'Click'], action: 'Add to selection' },
  { keys: ['Drag canvas'], action: 'Marquee-select' },
  { keys: ['Space', 'Drag'], action: 'Pan the canvas' },
  { keys: ['Scroll'], action: 'Zoom in / out' },
];

function Kbd({ children }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 6px', borderRadius: 5,
      background: SURFACE, border: `1px solid ${CARD_BORDER}`,
      color: TEXT_MID, fontSize: 10, fontWeight: 600, lineHeight: 1.3,
      fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

export default function AboutTab() {
  return (
    <div style={{ fontSize: 11.5, lineHeight: 1.6, color: TEXT_MID }}>
      <p style={{ marginBottom: 10 }}>
        <span style={{ color: ACCENT, fontWeight: 700 }}>kit-a</span> is a free, browser-based
        editor for system architecture diagrams. Drag components onto the canvas, connect
        them with labeled animated links, and export to PNG, GIF, PDF, or JSON.
      </p>
      <p style={{ marginBottom: 16, color: TEXT_DIM }}>
        No account, no backend. Your work auto-saves to this browser — use the
        <span style={{ color: TEXT_MID }}> Designs</span> tab to keep named copies, or
        <span style={{ color: TEXT_MID }}> Export JSON</span> to back up and move them.
      </p>

      <div style={{
        fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: 'uppercase',
        letterSpacing: '0.1em', borderTop: `1px solid ${DIVIDER}`, paddingTop: 12, marginBottom: 10,
      }}>Keyboard shortcuts</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {SHORTCUTS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ color: TEXT_DIM, flex: 1 }}>{s.action}</span>
            <span style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
              {s.keys.map((k, j) => <Kbd key={j}>{k}</Kbd>)}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 16, paddingTop: 12, borderTop: `1px solid ${DIVIDER}`,
        fontSize: 11, color: TEXT_DIM, textAlign: 'center', lineHeight: 1.6,
      }}>
        Thanks for using kit-a <span style={{ color: ACCENT }}>{'♥'}</span><br />
        Built by <a href="https://github.com/krlz-dev" target="_blank" rel="noreferrer"
          style={{ color: TEXT_MID, textDecoration: 'none', borderBottom: `1px solid ${CARD_BORDER}` }}>krlz-dev</a>
      </div>
    </div>
  );
}
