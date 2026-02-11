# A-Kit

Visual architecture diagram editor. Design system architectures by dragging, connecting, and labeling component nodes on a canvas.

Built with React 19 + Vite. No heavy dependencies — just a fast, minimal tool.

## Features

- **Node-based canvas** — drag and connect components (Server, Database, API, Client, Queue, Cache, Auth, etc.)
- **Connections** — labeled, colored, with optional bidirectional arrows and animated flow
- **Templates** — start from pre-built architectures (3-Tier Web App, Microservices, Event-Driven)
- **Save/Load** — persist designs to localStorage, export/import as JSON
- **Undo/Redo** — full history support (up to 40 states)
- **Keyboard shortcuts** — Delete, Escape, Ctrl+Z / Ctrl+Shift+Z

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start dev server             |
| `npm run build`     | Production build to `/dist`  |
| `npm run preview`   | Preview production build     |
| `npm run lint`      | Run ESLint                   |

## Tech Stack

React 19 / Vite 7 / vanilla CSS (inline) / localStorage for persistence
