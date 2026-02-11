const STACK = [
  { symbol: '\u25C6', color: '#61dafb', name: 'React 19', tag: 'UI' },
  { symbol: '\u26A1', color: '#646cff', name: 'Vite 7', tag: 'Build' },
  { symbol: '{ }', color: '#c8e600', name: 'Vanilla CSS', tag: 'Style' },
  { symbol: 'A', color: '#f59e0b', name: 'IBM Plex Mono', tag: 'Font' },
  { symbol: '\u2610', color: '#10b981', name: 'html2canvas', tag: 'Export' },
  { symbol: '\u25C9', color: '#ec4899', name: 'gif.js', tag: 'Animation' },
];

export default function Stack() {
  return (
    <section className="landing-section" id="stack">
      <div className="landing-container reveal" style={{ textAlign: 'center' }}>
        <div className="section-label">// stack</div>
        <h2 className="section-title">Minimal by design.</h2>
        <p className="section-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          No Electron. No heavy frameworks. Just the essentials, optimized for speed.
        </p>

        <div className="stack-row">
          {STACK.map(s => (
            <div className="stack-chip" key={s.name}>
              <span style={{ color: s.color }}>{s.symbol}</span> {s.name} <span className="tag">{s.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
