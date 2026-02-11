import { TIMELINE_HEADER_HEIGHT } from '../constants/ganttTheme';

const S = {
  header: {
    height: TIMELINE_HEADER_HEIGHT, background: '#0e140e',
    borderBottom: '1px solid rgba(200,230,0,0.06)',
    display: 'flex', position: 'sticky', top: 0, zIndex: 10,
  },
  monthGroup: { textAlign: 'center', borderRight: '1px solid rgba(200,230,0,0.06)' },
  monthName: {
    fontSize: 11, fontWeight: 600, color: '#7a8e7a', padding: '4px 0',
    borderBottom: '1px solid rgba(200,230,0,0.04)',
  },
  days: { display: 'flex' },
  day: {
    flex: 1, textAlign: 'center', fontSize: 10, color: '#4a5c4a', padding: '4px 0',
  },
  weekend: { background: 'rgba(200,230,0,0.03)', color: '#3a4a3a' },
  today: { background: 'rgba(200,230,0,0.08)', color: '#c8e600', fontWeight: 600 },
};

function groupUnits(units, keyFn) {
  const groups = [];
  let current = null;
  units.forEach(u => {
    const key = keyFn(u);
    if (!current || current.key !== key) {
      current = { key, label: '', units: [] };
      groups.push(current);
    }
    current.units.push(u);
  });
  return groups;
}

export default function TimelineHeader({ units, cellWidth, currentView }) {
  if (currentView === 'days') {
    const groups = groupUnits(units, u => `${u.month}-${u.year}`);
    groups.forEach(g => { g.label = `${g.units[0].month} ${g.units[0].year}`; });

    return (
      <div style={S.header}>
        {groups.map((g, gi) => (
          <div key={gi} style={{ ...S.monthGroup, width: g.units.length * cellWidth }}>
            <div style={S.monthName}>{g.label}</div>
            <div style={S.days}>
              {g.units.map((u, i) => (
                <div key={i} style={{
                  ...S.day, minWidth: cellWidth,
                  ...(u.isWeekend ? S.weekend : {}),
                  ...(u.isToday ? S.today : {}),
                }}>
                  {u.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (currentView === 'weeks') {
    const groups = groupUnits(units, u => `${u.month}-${u.year}`);
    groups.forEach(g => { g.label = `${g.units[0].month} ${g.units[0].year}`; });

    return (
      <div style={S.header}>
        {groups.map((g, gi) => (
          <div key={gi} style={{ ...S.monthGroup, width: g.units.length * cellWidth }}>
            <div style={S.monthName}>{g.label}</div>
            <div style={S.days}>
              {g.units.map((u, i) => (
                <div key={i} style={{ ...S.day, minWidth: cellWidth }}>{u.label}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // months, quarters, semesters, years — group by year
  const groups = groupUnits(units, u => u.year);
  groups.forEach(g => { g.label = String(g.units[0].year); });

  return (
    <div style={S.header}>
      {groups.map((g, gi) => (
        <div key={gi} style={{ ...S.monthGroup, width: g.units.length * cellWidth }}>
          <div style={S.monthName}>{g.label}</div>
          <div style={S.days}>
            {g.units.map((u, i) => (
              <div key={i} style={{ ...S.day, minWidth: cellWidth }}>{u.label}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
