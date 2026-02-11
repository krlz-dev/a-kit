export const TEMPLATES = [
  {
    name: "3-Tier Web App", desc: "Client → API → Database",
    nodes: [
      { type: "web", label: "Frontend", color: "#10b981", x: 340, y: 60 },
      { type: "api", label: "API Gateway", color: "#06b6d4", x: 340, y: 200 },
      { type: "server", label: "App Server", color: "#3b82f6", x: 340, y: 340 },
      { type: "database", label: "Database", color: "#f97316", x: 340, y: 480 },
    ],
    conns: [[0, 1, "#c8e600"], [1, 2, "#06b6d4"], [2, 3, "#f59e0b"]],
  },
  {
    name: "Microservices", desc: "Gateway + services + queue",
    nodes: [
      { type: "client", label: "Client", color: "#6366f1", x: 320, y: 40 },
      { type: "api", label: "Gateway", color: "#06b6d4", x: 320, y: 170 },
      { type: "server", label: "User Svc", color: "#3b82f6", x: 140, y: 320 },
      { type: "server", label: "Order Svc", color: "#3b82f6", x: 500, y: 320 },
      { type: "queue", label: "Message Queue", color: "#ec4899", x: 320, y: 440 },
      { type: "database", label: "Users DB", color: "#f97316", x: 140, y: 560 },
      { type: "database", label: "Orders DB", color: "#f97316", x: 500, y: 560 },
    ],
    conns: [[0, 1, "#c8e600"], [1, 2, "#06b6d4"], [1, 3, "#06b6d4"], [2, 4, "#ec4899"], [3, 4, "#ec4899"], [2, 5, "#f59e0b"], [3, 6, "#f59e0b"]],
  },
  {
    name: "Event-Driven", desc: "Producers → Queue → Consumers",
    nodes: [
      { type: "mobile", label: "Mobile App", color: "#8b5cf6", x: 160, y: 60 },
      { type: "web", label: "Web App", color: "#10b981", x: 480, y: 60 },
      { type: "queue", label: "Event Bus", color: "#ec4899", x: 320, y: 220 },
      { type: "func", label: "Processor", color: "#a855f7", x: 160, y: 380 },
      { type: "monitor", label: "Analytics", color: "#14b8a6", x: 480, y: 380 },
      { type: "database", label: "Data Store", color: "#f97316", x: 320, y: 520 },
    ],
    conns: [[0, 2, "#8b5cf6"], [1, 2, "#10b981"], [2, 3, "#ec4899"], [2, 4, "#ec4899"], [3, 5, "#f59e0b"], [4, 5, "#14b8a6"]],
  },
  {
    name: "Auth Flow", desc: "Login → Auth → Cache → DB",
    nodes: [
      { type: "client", label: "User", color: "#6366f1", x: 320, y: 40 },
      { type: "auth", label: "Auth Service", color: "#f59e0b", x: 320, y: 180 },
      { type: "cache", label: "Session Cache", color: "#eab308", x: 140, y: 340 },
      { type: "database", label: "User Store", color: "#f97316", x: 500, y: 340 },
      { type: "server", label: "App Server", color: "#3b82f6", x: 320, y: 480 },
    ],
    conns: [[0, 1, "#c8e600"], [1, 2, "#eab308"], [1, 3, "#f59e0b"], [1, 4, "#06b6d4"], [2, 4, "#eab308"]],
  },
  {
    name: "CI/CD Pipeline", desc: "Code → Build → Deploy → Monitor",
    nodes: [
      { type: "web", label: "Git Repo", color: "#10b981", x: 320, y: 40 },
      { type: "func", label: "Build", color: "#a855f7", x: 320, y: 170 },
      { type: "server", label: "Test Runner", color: "#3b82f6", x: 320, y: 300 },
      { type: "cloud", label: "Deploy", color: "#64748b", x: 320, y: 430 },
      { type: "monitor", label: "Monitoring", color: "#14b8a6", x: 320, y: 560 },
    ],
    conns: [[0, 1, "#10b981"], [1, 2, "#a855f7"], [2, 3, "#3b82f6"], [3, 4, "#06b6d4"]],
  },
];
