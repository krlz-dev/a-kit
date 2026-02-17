export default function CTA() {
  return (
    <section className="landing-cta reveal">
      <div className="landing-container">
        <h2>Design systems.<br />Plan timelines.<br /><span style={{ color: '#c8e600' }}>Ship faster.</span></h2>
        <p>Free. Open source. Runs in your browser. Forever.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <a href="#/arch" className="landing-btn landing-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Launch Arch
          </a>
          <a href="#/gantt" className="landing-btn landing-btn-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="12" height="4" rx="1"/><rect x="3" y="16" width="15" height="4" rx="1"/></svg>
            Launch Gantt
          </a>
        </div>
      </div>
    </section>
  );
}
