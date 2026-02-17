const FAQ_ITEMS = [
  {
    question: 'What is kit-a?',
    answer:
      'kit-a is a browser-based toolkit for creating system architecture diagrams and Gantt project timelines. It runs entirely in your browser — no sign-up, no installation, no data sent to any server.',
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
    question: 'Does kit-a require an account?',
    answer:
      'No. kit-a runs entirely in your browser with zero configuration. Your work is saved locally via localStorage, and you can export/import projects as JSON files.',
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
