const TEMPLATES = [
  { icon: '\u25C7', color: '#3b82f6', name: '3-Tier Web App', desc: 'Client \u2192 API \u2192 Database' },
  { icon: '\u25CE', color: '#06b6d4', name: 'Microservices', desc: 'Gateway + Services + Queue' },
  { icon: '\u2605', color: '#ec4899', name: 'Event-Driven', desc: 'Producers \u2192 Queue \u2192 Consumers' },
  { icon: '\u26DF', color: '#f59e0b', name: 'Auth Flow', desc: 'Login \u2192 Auth \u2192 Cache \u2192 DB' },
  { icon: '\u25C6', color: '#a855f7', name: 'Auth0 Integration', desc: 'Web App + Auth0 + API' },
  { icon: '\u25B6', color: '#10b981', name: 'CI/CD Pipeline', desc: 'Code \u2192 Build \u2192 Deploy \u2192 Monitor' },
];

export default function Templates() {
  return (
    <section className="landing-section" id="templates">
      <div className="landing-container reveal" style={{ textAlign: 'center' }}>
        <div className="section-label">// templates</div>
        <h2 className="section-title">Start from a blueprint.</h2>
        <p className="section-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          Six battle-tested architecture patterns. Load, customize, ship.
        </p>

        <div className="landing-templates-grid">
          {TEMPLATES.map(t => (
            <div className="landing-template-card" key={t.name}>
              <div className="icon" style={{ color: t.color }}>{t.icon}</div>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
