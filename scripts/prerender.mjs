/**
 * Post-build prerender script.
 *
 * Runs after `vite build` and injects static landing-page HTML into
 * dist/index.html so that crawlers see real content instead of an
 * empty <div id="root"></div>.
 *
 * React will replace this HTML on load — no hydrateRoot needed.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const INDEX = resolve(DIST, 'index.html');

// ---------------------------------------------------------------------------
// Data (mirrors the arrays defined inside each React component)
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    iconBg: 'rgba(99,102,241,0.12)',
    badge: 'Arch',
    title: 'Node-Based Canvas',
    desc: '14 component types \u2014 Client, Server, DB, API, Auth, Queue, Cache, Cloud, Function, and more. Drag to place, double-click to rename.',
  },
  {
    iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    iconBg: 'rgba(6,182,212,0.12)',
    badge: 'Arch',
    title: 'Smart Connections',
    desc: 'Labeled, colored, directional or bidirectional. Animated flow visualization with adjustable speed. 7 color options.',
  },
  {
    iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="12" height="4" rx="1"/><rect x="3" y="16" width="15" height="4" rx="1"/></svg>',
    iconBg: 'rgba(236,72,153,0.12)',
    badge: 'Gantt',
    title: 'Interactive Timeline',
    desc: '6 view modes \u2014 days, weeks, months, quarters, years, or full timeline. Drag bars to reschedule, resize to adjust duration.',
  },
  {
    iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    iconBg: 'rgba(245,158,11,0.12)',
    badge: 'Gantt',
    title: 'Tasks &amp; Dependencies',
    desc: 'Tasks, groups, and milestones with progress tracking. Define dependencies between tasks. Assign owners and color-code by team.',
  },
  {
    iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8e600" stroke-width="2"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
    iconBg: 'rgba(200,230,0,0.12)',
    badge: null,
    title: 'Multi-Format Export',
    desc: 'PNG at 2x resolution, JPG, animated GIF, and WebM video. Share diagrams anywhere \u2014 docs, slides, or Slack.',
  },
  {
    iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
    iconBg: 'rgba(16,185,129,0.12)',
    badge: null,
    title: 'Save &amp; Load',
    desc: 'Cloud storage with your account. Export and import as JSON. Access your projects from any device via the Console.',
  },
];

const NODES = [
  { name: 'Client',   color: '#6366f1' },
  { name: 'Server',   color: '#3b82f6' },
  { name: 'Database', color: '#f97316' },
  { name: 'API',      color: '#06b6d4' },
  { name: 'Auth',     color: '#f59e0b' },
  { name: 'Queue',    color: '#ec4899' },
  { name: 'Cache',    color: '#eab308' },
  { name: 'Cloud',    color: '#64748b' },
  { name: 'Bucket',   color: '#64748b' },
  { name: 'Function', color: '#a855f7' },
  { name: 'Monitor',  color: '#14b8a6' },
  { name: 'Mobile',   color: '#8b5cf6' },
  { name: 'Web App',  color: '#10b981' },
  { name: 'Group',    color: '#4ade80' },
];

const TEMPLATES = [
  { icon: '\u25C7', color: '#3b82f6', name: '3-Tier Web App',    desc: 'Client \u2192 API \u2192 Database' },
  { icon: '\u25CE', color: '#06b6d4', name: 'Microservices',     desc: 'Gateway + Services + Queue' },
  { icon: '\u2605', color: '#ec4899', name: 'Event-Driven',      desc: 'Producers \u2192 Queue \u2192 Consumers' },
  { icon: '\u26DF', color: '#f59e0b', name: 'Auth Flow',         desc: 'Login \u2192 Auth \u2192 Cache \u2192 DB' },
  { icon: '\u25C6', color: '#a855f7', name: 'Auth0 Integration', desc: 'Web App + Auth0 + API' },
  { icon: '\u25B6', color: '#10b981', name: 'CI/CD Pipeline',    desc: 'Code \u2192 Build \u2192 Deploy \u2192 Monitor' },
];

const FAQ_ITEMS = [
  {
    question: 'What is kit-a?',
    answer: 'kit-a is a browser-based toolkit for creating system architecture diagrams and Gantt project timelines. Create a free account to try it out, and upgrade to premium for the full experience.',
  },
  {
    question: 'Is kit-a free?',
    answer: 'You can create a free account to explore the tools and save 1 project. Premium plans unlock unlimited projects, the full cloud provider catalog (1,700+ icons from AWS, Azure, GCP, and M365), and priority access to new features.',
  },
  {
    question: 'What are the premium plans?',
    answer: 'Monthly at $2,000 CLP/month or Lifetime at $100,000 CLP (one-time, limited availability). Both include unlimited projects, full cloud provider catalog, and cloud storage. Prices are in CLP (Chilean Pesos) with approximate local equivalents shown on the billing page.',
  },
  {
    question: 'What do I get with premium?',
    answer: 'Premium unlocks unlimited projects, the cloud provider catalog with 1,700+ icons from AWS, Azure, GCP, and Microsoft 365, and all future features as they launch.',
  },
  {
    question: 'What types of architecture diagrams can I create?',
    answer: 'kit-a includes 14 node types: Client, Server, Database, API, Auth, Queue, Cache, Cloud, Bucket, Function, Monitor, Mobile, Web App, and Group. Connect them with labeled, colored, directional or bidirectional connections with animated flow visualization. Premium users also get access to the full cloud provider catalog.',
  },
  {
    question: 'Does kit-a include starter templates?',
    answer: 'Yes. kit-a ships with 6 architecture templates: 3-Tier Web App, Microservices, Event-Driven, Auth Flow, Auth0 Integration, and CI/CD Pipeline. Load any template and customize it to match your system.',
  },
  {
    question: 'How does the Gantt chart planner work?',
    answer: 'The Gantt planner offers 6 view modes (days, weeks, months, quarters, years, full timeline). Drag bars to reschedule, resize to adjust duration, define task dependencies, set milestones, track progress, and color-code by team.',
  },
  {
    question: 'What export formats are supported?',
    answer: 'kit-a exports to PNG (at 2x resolution), JPG, animated GIF, and WebM video. Share your diagrams and timelines in docs, slides, or messaging apps.',
  },
  {
    question: 'How is my data stored?',
    answer: 'Your projects are stored securely in the cloud and accessible from any device via the Console. All accounts include cloud storage \u2014 premium plans unlock unlimited projects.',
  },
];

// ---------------------------------------------------------------------------
// SVG Icons (reused across components)
// ---------------------------------------------------------------------------

const ICON_ARCH_GRID = (w, h, stroke) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`;

const ICON_GANTT_BARS = (w, h, stroke) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="12" height="4" rx="1"/><rect x="3" y="16" width="15" height="4" rx="1"/></svg>`;

const ICON_ARROW_RIGHT =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';

const ICON_LOGIN =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13 12H3"/></svg>';

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function buildNav() {
  return `<nav class="landing-nav"><div class="landing-container"><a href="#/" class="nav-brand"><svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#080c08"/><path d="M18 16l-2 2-2-2 2-2 2 2zm-2-6l2.12 2.12 2.5-2.5L16 5l-4.62 4.62 2.5 2.5L16 10zm-6 6l2.12-2.12-2.5-2.5L5 16l4.62 4.62 2.5-2.5L10 16zm12 0l-2.12 2.12 2.5 2.5L27 16l-4.62-4.62-2.5 2.5L22 16zm-6 6l-2.12-2.12-2.5 2.5L16 27l4.62-4.62-2.5-2.5L16 22z" fill="#c8e600"/></svg><span>kit-a <span class="ver">v1.0</span></span></a><div class="nav-links"><a href="#/arch" class="nav-tool-link">${ICON_ARCH_GRID(14, 14, '#6366f1')} Try Arch</a><a href="#/gantt" class="nav-tool-link">${ICON_GANTT_BARS(14, 14, '#06b6d4')} Try Gantt</a><a href="#/login" class="nav-tool-link" style="color:#b0c4b0">Sign in</a></div></div></nav>`;
}

function buildHero() {
  return `<section class="hero"><div class="hero-badge"><span class="dot"></span>Browser-Based &middot; Zero Config &middot; Instant Setup</div><h1>Architecture &amp; planning,<br><span class="accent">wired different.</span></h1><p class="hero-sub">A lightweight toolkit for system architecture diagrams and project timelines. Drag, connect, plan, export. Try free, upgrade to unlock the full experience.</p><div class="hero-actions"><a href="#/arch" class="landing-btn landing-btn-primary">${ICON_ARCH_GRID(16, 16, 'currentColor')} Try Arch</a><a href="#/gantt" class="landing-btn landing-btn-ghost">${ICON_GANTT_BARS(16, 16, 'currentColor')} Try Gantt</a></div><div class="hero-previews"><a href="#/arch" class="hero-preview-card"><div class="preview-label">${ICON_ARCH_GRID(14, 14, '#6366f1')} Arch</div><div class="arch-preview"><div class="arch-canvas"><svg class="arch-conn-svg" viewBox="0 0 260 100" fill="none"><defs><marker id="arrow-fwd" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><polygon points="0 0, 6 2, 0 4" fill="#06b6d4"/></marker><marker id="arrow-bwd" markerWidth="6" markerHeight="4" refX="1" refY="2" orient="auto"><polygon points="6 0, 0 2, 6 4" fill="#06b6d4"/></marker></defs><path d="M82 50 Q130 20 178 50" stroke="#06b6d4" stroke-width="1" stroke-dasharray="6 5" opacity="0.45" marker-end="url(#arrow-fwd)" marker-start="url(#arrow-bwd)"/><rect x="109" y="22" width="42" height="16" rx="4" fill="#0d1117" opacity="0.85"/><text x="130" y="33" text-anchor="middle" fill="#06b6d4" font-size="9" font-family="IBM Plex Mono, monospace" opacity="0.85">REST</text><circle r="2.5" fill="#06b6d4" opacity="0.8"><animateMotion dur="3s" repeatCount="indefinite" path="M82 50 Q130 20 178 50"/></circle><circle r="2.5" fill="#06b6d4" opacity="0.5"><animateMotion dur="3s" repeatCount="indefinite" begin="1s" path="M178 50 Q130 20 82 50"/></circle></svg><div class="arch-node-real" style="left:10px;top:50%;transform:translateY(-50%)"><div class="arch-node-bar" style="background:#3b82f6"></div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><circle cx="6" cy="6" r="1" fill="#3b82f6"/><circle cx="6" cy="18" r="1" fill="#3b82f6"/></svg><span class="arch-node-label">Server</span></div><div class="arch-node-real" style="right:10px;top:50%;transform:translateY(-50%)"><div class="arch-node-bar" style="background:#10b981"></div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg><span class="arch-node-label">Web App</span></div></div></div></a><a href="#/gantt" class="hero-preview-card"><div class="preview-label">${ICON_GANTT_BARS(14, 14, '#06b6d4')} Gantt</div><div class="gantt-preview"><div class="gantt-row"><span class="gantt-label">Design</span><div class="gantt-track"><div class="gantt-bar" style="width:45%;left:0%;background:#6366f1"></div></div></div><div class="gantt-row"><span class="gantt-label">Frontend</span><div class="gantt-track"><div class="gantt-bar" style="width:55%;left:20%;background:#06b6d4"></div></div></div><div class="gantt-row"><span class="gantt-label">Backend</span><div class="gantt-track"><div class="gantt-bar" style="width:50%;left:15%;background:#10b981"></div></div></div><div class="gantt-row"><span class="gantt-label">Testing</span><div class="gantt-track"><div class="gantt-bar" style="width:35%;left:55%;background:#f59e0b"></div></div></div><div class="gantt-row"><span class="gantt-label">Launch</span><div class="gantt-track"><div class="gantt-bar gantt-milestone" style="left:90%;background:#ec4899"></div></div></div></div></a></div></section>`;
}

function buildToolsShowcase() {
  return `<section class="landing-section"><div class="landing-container reveal visible" style="text-align:center"><div class="section-label">// tools</div><h2 class="section-title">Two tools. One toolkit.</h2><p class="section-sub" style="margin-left:auto;margin-right:auto">Architecture diagrams and project timelines, built with the same dark-mode DNA.</p><div class="tools-grid"><a href="#/arch" class="tool-card"><div class="tool-card-icon" style="background:rgba(99,102,241,0.12)">${ICON_ARCH_GRID(26, 26, '#6366f1')}</div><h3>kit-a Arch</h3><p>Visual system architecture on a drag-and-drop canvas. 14 node types, animated connections with labels, cloud provider catalog, and 6 starter templates. Export to PNG 2x, JPG, animated GIF, or WebM.</p><span class="tool-link">Try Arch Editor ${ICON_ARROW_RIGHT}</span></a><a href="#/gantt" class="tool-card"><div class="tool-card-icon" style="background:rgba(6,182,212,0.12)">${ICON_GANTT_BARS(26, 26, '#06b6d4')}</div><h3>kit-a Gantt</h3><p>Interactive Gantt charts for project planning. 6 view modes from days to years, drag to schedule and resize tasks, define dependencies, track progress with milestones, and assign team members. Export or import as JSON.</p><span class="tool-link">Try Gantt Planner ${ICON_ARROW_RIGHT}</span></a></div></div></section>`;
}

function buildFeatures() {
  const cards = FEATURES.map(f => {
    const badge = f.badge ? `<span class="feature-badge">${f.badge}</span>` : '';
    return `<div class="feature-card"><div class="feature-card-top"><div class="feature-icon" style="background:${f.iconBg}">${f.iconSvg}</div>${badge}</div><h3>${f.title}</h3><p>${f.desc}</p></div>`;
  }).join('');

  return `<section class="landing-section" id="features"><div class="landing-container reveal visible"><div class="section-label">// features</div><h2 class="section-title">Everything you need.<br>Nothing you don&#x27;t.</h2><p class="section-sub">Built for engineers who think in systems. No learning curve, no heavy desktop app. Simple pricing, powerful tools.</p><div class="features-grid">${cards}</div></div></section>`;
}

function buildComponentTypes() {
  const chips = NODES.map(n =>
    `<span class="node-chip" style="border-color:${n.color}4d;background:${n.color}0f"><span class="dot" style="background:${n.color}"></span>${n.name}</span>`
  ).join('');

  return `<section class="landing-section"><div class="landing-container reveal visible" style="text-align:center"><div class="section-label">// components</div><h2 class="section-title">14 node types. Infinite combinations.</h2><p class="section-sub" style="margin-left:auto;margin-right:auto">Every building block for modern system architecture. Group them, connect them, export them.</p><div class="nodes-wrap">${chips}</div></div></section>`;
}

function buildTemplates() {
  const cards = TEMPLATES.map(t =>
    `<div class="landing-template-card"><div class="icon" style="color:${t.color}">${t.icon}</div><h3>${t.name}</h3><p>${t.desc}</p></div>`
  ).join('');

  return `<section class="landing-section" id="templates"><div class="landing-container reveal visible" style="text-align:center"><div class="section-label">// templates</div><h2 class="section-title">Start from a blueprint.</h2><p class="section-sub" style="margin-left:auto;margin-right:auto">Six battle-tested architecture patterns. Load, customize, ship.</p><div class="landing-templates-grid">${cards}</div></div></section>`;
}

function buildFAQ() {
  const items = FAQ_ITEMS.map(item =>
    `<details class="faq-item"><summary class="faq-question">${item.question}</summary><p class="faq-answer">${item.answer}</p></details>`
  ).join('');

  return `<section class="landing-section" id="faq"><div class="landing-container reveal visible"><div class="section-label">// faq</div><h2 class="section-title">Frequently asked questions</h2><div class="faq-list">${items}</div></div></section>`;
}

function buildCTA() {
  return `<section class="landing-cta reveal visible"><div class="landing-container"><h2>Design systems.<br>Plan timelines.<br><span style="color:#c8e600">Ship faster.</span></h2><p>Try it free. Upgrade when you&#x27;re ready. Runs in your browser.</p><div class="hero-actions" style="justify-content:center"><a href="#/register" class="landing-btn landing-btn-primary">${ICON_LOGIN} Create Free Account</a><a href="#/arch" class="landing-btn landing-btn-ghost">${ICON_ARCH_GRID(16, 16, 'currentColor')} Try Arch</a><a href="#/gantt" class="landing-btn landing-btn-ghost">${ICON_GANTT_BARS(16, 16, 'currentColor')} Try Gantt</a></div></div></section>`;
}

function buildFooter() {
  return `<footer class="landing-footer"><div class="landing-container"><p>Built by krlz-dev</p></div></footer>`;
}

// ---------------------------------------------------------------------------
// Assemble full landing HTML
// ---------------------------------------------------------------------------

function buildLandingHTML() {
  return [
    '<div style="background:#080c08;color:#d8e4d8;min-height:100vh;line-height:1.6;overflow-x:hidden">',
    '<div class="dot-grid"></div>',
    buildNav(),
    '<main><article>',
    buildHero(),
    buildToolsShowcase(),
    buildFeatures(),
    buildComponentTypes(),
    buildTemplates(),
    buildFAQ(),
    buildCTA(),
    '</article></main>',
    buildFooter(),
    '</div>',
  ].join('');
}

// ---------------------------------------------------------------------------
// Inject into dist/index.html
// ---------------------------------------------------------------------------

let html = readFileSync(INDEX, 'utf-8');

const landingHTML = buildLandingHTML();

// Replace empty <div id="root"></div> with pre-rendered content
html = html.replace(
  '<div id="root"></div>',
  `<div id="root">${landingHTML}</div>`,
);

writeFileSync(INDEX, html, 'utf-8');

console.log('\u2713 Pre-rendered landing page injected into dist/index.html');
console.log(`  \u2192 Injected ${landingHTML.length.toLocaleString()} characters of HTML`);
