# kit-a

System architecture diagrams in the browser. Free, no account, no installs.

**[kit-a.com](https://kit-a.com)**

Node-based canvas for designing system architectures. Drag, connect, and label components — everything runs in your browser and is saved locally.

- **14 node types** — Client, Server, Database, API, Auth, Queue, Cache, Storage, Bucket, Function, Monitor, Mobile, Web App, Group
- **1,800+ cloud service icons** — AWS, Azure, GCP, Microsoft 365, and more (all free)
- **Connections** — labeled, colored (7 options), directional or bidirectional, with animated flow
- **6 starter templates** — 3-Tier Web App, Microservices, Event-Driven, Auth Flow, Auth0 Integration, CI/CD Pipeline
- **Export** — PNG, JPG, animated GIF, PDF, JSON
- **Canvas** — pan, zoom (0.2x–3x), undo/redo (40 states), keyboard shortcuts
- **Local storage** — your working canvas auto-saves; save and reload named designs from the Designs tab

## Quick Start

```bash
npm install
npm run dev
```

No account, no backend — open it and start drawing. Designs are stored in your browser's `localStorage`; use Export JSON to back up or move them.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run gen:icons` | Regenerate the cloud icon catalog |

## Tech Stack

- **Frontend** — React 19, React Router 7, Vite 7
- **Storage** — Browser `localStorage` (no backend)
- **Export** — html2canvas-pro, gif.js, jspdf
- **Hosting** — GitHub Pages

## Project Structure

```
src/
├── features/
│   └── kit/          # The architecture diagram editor (canvas, sidebar, export)
├── shared/           # Shared hooks, components, theme constants
└── main.jsx          # Router setup
```
