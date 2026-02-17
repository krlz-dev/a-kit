# kit-a

Architecture diagrams and project timelines in the browser. No installs, no bloat.

**[kit-a.com](https://kit-a.com)**

## Tools

### Arch — System Architecture Diagrams

Node-based canvas for designing system architectures. Drag, connect, and label components.

- **14 node types** — Client, Server, Database, API, Auth, Queue, Cache, Storage, Bucket, Function, Monitor, Mobile, Web App, Group
- **1,767 cloud service icons** — AWS (739), Azure (661), GCP (216), Microsoft 365 (155), and more
- **Connections** — labeled, colored (7 options), directional or bidirectional, with animated flow
- **6 starter templates** — 3-Tier Web App, Microservices, Event-Driven, Auth Flow, Auth0 Integration, CI/CD Pipeline
- **Export** — PNG, JPG, animated GIF, WebM video, JSON
- **Canvas** — pan, zoom (0.2x–3x), undo/redo (40 states), keyboard shortcuts

### Gantt — Project Timelines

Interactive Gantt chart for project scheduling and tracking.

- **6 view modes** — Days, Weeks, Months, Quarters, Years, Full Timeline
- **Task management** — drag to reschedule, resize to adjust duration, progress tracking (0–100%)
- **Organization** — task grouping/nesting, milestones, dependencies, team member assignment with color-coding
- **Export** — SVG, JSON

## Quick Start

```bash
npm install
npm run dev
```

No account required to try both tools. Sign up for cloud save and unlimited projects.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Tech Stack

- **Frontend** — React 19, React Router 7, Vite 7
- **Backend** — Supabase (auth, database, edge functions)
- **Payments** — Flow.cl (Chilean payment gateway)
- **Export** — html2canvas, gif.js
- **Hosting** — GitHub Pages

## Project Structure

```
src/
├── features/
│   ├── arch/        # Architecture diagram editor
│   ├── gantt/       # Gantt chart timeline
│   ├── main/        # Landing page
│   ├── auth/        # Login, register, password reset
│   └── console/     # Projects, account, billing
├── shared/          # Auth context, Supabase client, billing API
└── main.jsx         # Router setup
supabase/
├── functions/       # Edge functions (payments, webhooks)
└── migrations/      # Database schema
```

## Pricing

| Plan | Price | Details |
| --- | --- | --- |
| Free | $0 | 1 project, full features |
| Monthly | $2,000 CLP | Unlimited projects, cancel anytime |
| Lifetime | $100,000 CLP | One-time payment, limited availability |
