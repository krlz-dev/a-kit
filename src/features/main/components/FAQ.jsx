const FAQ_ITEMS = [
  {
    question: 'What is kit-a?',
    answer:
      'kit-a is a browser-based toolkit for creating system architecture diagrams and Gantt project timelines. Try the tools instantly with no sign-up, or create a free account to save your projects in the cloud.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'You can try both tools without an account — no sign-up required. To save projects and access them from anywhere, create a free account. The free plan includes 1 project with full cloud storage.',
  },
  {
    question: 'What are the paid plans?',
    answer:
      'The free plan gives you 1 project. For unlimited projects, choose Monthly at $2,000 CLP/month or Lifetime at $100,000 CLP (one-time, available for a limited time). Both plans include full access to all features and cloud storage.',
  },
  {
    question: 'What types of architecture diagrams can I create?',
    answer:
      'kit-a supports 14 node types including Client, Server, Database, API, Auth, Queue, Cache, Cloud, Bucket, Function, Monitor, Mobile, Web App, and Group. You can connect them with labeled, colored, directional or bidirectional connections with animated flow visualization.',
  },
  {
    question: 'Does kit-a include starter templates?',
    answer:
      'Yes. kit-a ships with 6 architecture templates: 3-Tier Web App, Microservices, Event-Driven, Auth Flow, Auth0 Integration, and CI/CD Pipeline. Load any template and customize it to match your system.',
  },
  {
    question: 'How does the Gantt chart planner work?',
    answer:
      'The Gantt planner offers 6 view modes (days, weeks, months, quarters, years, full timeline). You can drag bars to reschedule, resize to adjust duration, define task dependencies, set milestones, track progress, and color-code by team.',
  },
  {
    question: 'What export formats are supported?',
    answer:
      'kit-a exports to PNG (at 2x resolution), JPG, animated GIF, and WebM video. Share your diagrams and timelines in docs, slides, or messaging apps.',
  },
  {
    question: 'How is my data stored?',
    answer:
      'When you try the tools without an account, nothing is saved — it\'s a live demo. With an account, your projects are stored securely in the cloud and accessible from any device via the Console.',
  },
];

export default function FAQ() {
  return (
    <section className="landing-section" id="faq">
      <div className="landing-container reveal">
        <div className="section-label">// faq</div>
        <h2 className="section-title">Frequently asked questions</h2>
        <div className="faq-list">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="faq-item">
              <summary className="faq-question">{item.question}</summary>
              <p className="faq-answer">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
