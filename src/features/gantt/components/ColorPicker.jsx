import { BAR_COLORS, COLOR_NAMES } from '../constants/ganttTheme';

export default function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {COLOR_NAMES.map(name => {
        const c = BAR_COLORS[name];
        const sel = value === name;
        return (
          <div
            key={name}
            onClick={() => onChange(name)}
            style={{
              width: 32, height: 32, borderRadius: 6, cursor: 'pointer',
              background: `linear-gradient(135deg, ${c.start}, ${c.end})`,
              border: sel ? '3px solid #d8e4d8' : '3px solid transparent',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          />
        );
      })}
    </div>
  );
}
