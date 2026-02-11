export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-badge">
        <span className="dot" />
        Open Source &middot; Browser-Based &middot; Zero Config
      </div>
      <h1>Architecture &amp; planning,<br /><span className="accent">wired different.</span></h1>
      <p className="hero-sub">
        A lightweight toolkit for system architecture diagrams and project timelines.
        Drag, connect, plan, export. No sign-up. No bloat.
      </p>
      <div className="hero-actions">
        <a href="#/arch" className="landing-btn landing-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Open Arch
        </a>
        <a href="#/gantt" className="landing-btn landing-btn-ghost">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="12" height="4" rx="1"/><rect x="3" y="16" width="15" height="4" rx="1"/></svg>
          Open Gantt
        </a>
      </div>

      <div className="hero-terminal">
        <div className="terminal-bar">
          <span className="terminal-dot" />
          <span className="terminal-dot" />
          <span className="terminal-dot" />
        </div>
        <div className="terminal-body">
          <span className="comment">// design your architecture</span><br />
          <span className="prompt">$</span> <span className="cmd">kit-a add --node client server database</span><br />
          <span className="prompt">$</span> <span className="cmd">kit-a connect client:api --label &quot;REST&quot; --color cyan</span><br />
          <span className="prompt">$</span> <span className="cmd">kit-a connect api:db --label &quot;queries&quot; --bidirectional</span><br />
          <span className="output">&gt; 3 nodes, 2 connections &mdash; diagram ready</span><br />
          <span className="prompt">$</span> <span className="cmd">kit-a export --format png --2x</span><br />
          <span className="output">&gt; exported: architecture.png (2048&times;1536)</span><br />
          <span className="prompt">$</span> <span className="cursor" />
        </div>
      </div>
    </section>
  );
}
