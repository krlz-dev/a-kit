const FAQ_ITEMS = [
  {
    question: 'What is kit-a?',
    answer:
      'kit-a is a browser-based toolkit for creating system architecture diagrams and Gantt project timelines. Create a free account to try it out, and upgrade to premium for the full experience.',
  },
  {
    question: 'Is kit-a free?',
    answer:
      'You can create a free account to explore the tools and save 1 project. Premium plans unlock unlimited projects, the full cloud provider catalog (1,700+ icons from AWS, Azure, GCP, and M365), and priority access to new features.',
  },
  {
    question: 'What are the premium plans?',
    answer:
      'Monthly at $2,000 CLP/month or Lifetime at $100,000 CLP (one-time, limited availability). Both include unlimited projects, full cloud provider catalog, and cloud storage. Prices are in CLP (Chilean Pesos) with approximate local equivalents shown on the billing page.',
  },
  {
    question: 'What do I get with premium?',
    answer:
      'Premium unlocks unlimited projects, the cloud provider catalog with 1,700+ icons from AWS, Azure, GCP, and Microsoft 365, and all future features as they launch.',
  },
  {
    question: 'What types of architecture diagrams can I create?',
    answer:
      'kit-a includes 14 node types: Client, Server, Database, API, Auth, Queue, Cache, Cloud, Bucket, Function, Monitor, Mobile, Web App, and Group. Connect them with labeled, colored, directional or bidirectional connections with animated flow visualization. Premium users also get access to the full cloud provider catalog.',
  },
  {
    question: 'Does kit-a include starter templates?',
    answer:
      'Yes. kit-a ships with 6 architecture templates: 3-Tier Web App, Microservices, Event-Driven, Auth Flow, Auth0 Integration, and CI/CD Pipeline. Load any template and customize it to match your system.',
  },
  {
    question: 'How does the Gantt chart planner work?',
    answer:
      'The Gantt planner offers 6 view modes (days, weeks, months, quarters, years, full timeline). Drag bars to reschedule, resize to adjust duration, define task dependencies, set milestones, track progress, and color-code by team.',
  },
  {
    question: 'What export formats are supported?',
    answer:
      'kit-a exports to PNG (at 2x resolution), JPG, animated GIF, and WebM video. Share your diagrams and timelines in docs, slides, or messaging apps.',
  },
  {
    question: 'How is my data stored?',
    answer:
      'Your projects are stored securely in the cloud and accessible from any device via the Console. All accounts include cloud storage — premium plans unlock unlimited projects.',
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
