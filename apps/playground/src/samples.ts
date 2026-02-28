export const VIEW_TYPES = [
  // Phase 1-2 (original 27)
  "alert",
  "chart",
  "chat",
  "code",
  "compare",
  "confirm",
  "counter",
  "dashboard",
  "datatable",
  "detail",
  "diff",
  "embed",
  "filter",
  "form",
  "gallery",
  "image",
  "json",
  "kanban",
  "log",
  "map",
  "markdown",
  "pdf",
  "poll",
  "progress",
  "quiz",
  "ranked",
  "settings",
  "split",
  "status",
  "stepper",
  "tabs",
  "timeline",
  "tree",
  "video",
  // Phase 4 (17)
  "audio",
  "boxplot",
  "carousel",
  "crosstab",
  "gauge",
  "gis-legend",
  "heatmap",
  "layers",
  "minimap",
  "pivot",
  "profile",
  "scatter",
  "spectrogram",
  "sunburst",
  "terminal",
  "timeseries",
  "treemap",
  // Phase 6 Compound (15)
  "annotation",
  "calendar",
  "flowchart",
  "funnel",
  "gantt",
  "geostory",
  "globe",
  "graph",
  "investigation",
  "neural",
  "notebook",
  "sankey",
  "slides",
  "swimlane",
  "threed",
  "font",
  "shader",
  "transcript",
  "wizard",
] as const;

export type ViewType = (typeof VIEW_TYPES)[number];

export const samples: Record<ViewType, object> = {
  /* ================================================================== */
  /*  Phase 1-2 views                                                   */
  /* ================================================================== */

  alert: {
    type: "alert",
    version: "1.0",
    title: "System Alerts",
    alerts: [
      {
        id: "a1",
        severity: "critical",
        title: "Database cluster unreachable",
        message:
          "Primary database node has been unreachable for 5 minutes. Failover initiated.",
        source: "db-monitor",
        category: "infrastructure",
        timestamp: "2024-01-15T10:30:00Z",
        actions: [
          {
            label: "View Logs",
            tool: "view_logs",
            arguments: { service: "postgres" },
          },
          {
            label: "Force Restart",
            tool: "restart_service",
            arguments: { service: "postgres", force: "true" },
            variant: "destructive",
          },
        ],
        metadata: { host: "db-primary-01", region: "us-east-1", uptime: "47d 12h" },
      },
      {
        id: "a2",
        severity: "error",
        title: "SSL certificate expiring",
        message: "Certificate for api.example.com expires in 3 days.",
        source: "cert-checker",
        category: "security",
        timestamp: "2024-01-15T09:00:00Z",
        actions: [
          {
            label: "Renew Certificate",
            tool: "renew_cert",
            arguments: { domain: "api.example.com" },
          },
        ],
      },
      {
        id: "a3",
        severity: "warning",
        title: "High memory usage",
        message:
          "Worker pool memory at 87%. Consider scaling horizontally.",
        source: "resource-monitor",
        category: "performance",
        timestamp: "2024-01-15T10:15:00Z",
        metadata: { pool: "worker-pool-3", instances: "8" },
      },
      {
        id: "a4",
        severity: "warning",
        title: "Slow query detected",
        message: "Query on users table taking >5s on average.",
        source: "query-analyzer",
        category: "performance",
        timestamp: "2024-01-15T10:20:00Z",
      },
      {
        id: "a5",
        severity: "info",
        title: "Deployment scheduled",
        message: "Version 2.4.1 deployment scheduled for 14:00 UTC.",
        source: "ci-cd",
        category: "deployment",
        timestamp: "2024-01-15T08:00:00Z",
      },
      {
        id: "a6",
        severity: "success",
        title: "Backup completed",
        message: "Daily backup completed successfully. 142GB archived.",
        source: "backup-service",
        category: "maintenance",
        timestamp: "2024-01-15T06:00:00Z",
        metadata: { size: "142GB", duration: "23m" },
      },
    ],
  },

  chart: {
    type: "chart",
    version: "1.0",
    title: "Sales by Region",
    chartType: "bar",
    data: [
      {
        label: "Q1",
        values: [
          { label: "North", value: 120 },
          { label: "South", value: 98 },
          { label: "East", value: 150 },
          { label: "West", value: 87 },
        ],
        color: "#3388ff",
      },
      {
        label: "Q2",
        values: [
          { label: "North", value: 140 },
          { label: "South", value: 110 },
          { label: "East", value: 165 },
          { label: "West", value: 95 },
        ],
        color: "#ff6384",
      },
      {
        label: "Q3",
        values: [
          { label: "North", value: 155 },
          { label: "South", value: 125 },
          { label: "East", value: 180 },
          { label: "West", value: 112 },
        ],
        color: "#ffce56",
      },
    ],
    xAxis: { label: "Region" },
    yAxis: { label: "Sales ($K)" },
  },

  chat: {
    type: "chat",
    version: "1.0",
    title: "Support Chat",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Hi, I need help with my recent order #12345.",
        timestamp: "2025-06-15T10:00:00Z",
        status: "sent",
      },
      {
        id: "msg-2",
        role: "assistant",
        content:
          "Hello! I'd be happy to help you with order #12345. Let me pull up the details. It looks like your order was shipped yesterday and is currently in transit.",
        timestamp: "2025-06-15T10:00:05Z",
      },
      {
        id: "msg-3",
        role: "user",
        content: "Great, when should I expect delivery?",
        timestamp: "2025-06-15T10:01:00Z",
        status: "sent",
      },
      {
        id: "msg-4",
        role: "assistant",
        content:
          "Based on the tracking information, your package is estimated to arrive by June 18th. Would you like me to send you the tracking link?",
        timestamp: "2025-06-15T10:01:10Z",
      },
    ],
    respondTool: "support_respond",
    placeholder: "Type your question...",
    suggestions: ["Track Order", "Return Item", "Contact Support"],
  },

  code: {
    type: "code",
    version: "1.0",
    code: 'import { useView, Fallback } from "@chuk/view-shared";\nimport type { CounterContent } from "./schema";\n\nexport function CounterView() {\n  const { data, content, isConnected } =\n    useView<CounterContent>("counter", "1.0");\n\n  if (!isConnected) return <Fallback message="Connecting..." />;\n  if (!data) return <Fallback content={content ?? undefined} />;\n\n  return <CounterRenderer data={data} />;\n}',
    language: "typescript",
    title: "CounterView.tsx",
    lineNumbers: true,
  },

  compare: {
    type: "compare",
    version: "1.0",
    before: {
      url: "https://picsum.photos/seed/before/800/600",
      alt: "Before image",
    },
    after: {
      url: "https://picsum.photos/seed/after/800/600",
      alt: "After image",
    },
    orientation: "horizontal",
    initialPosition: 50,
    labels: { before: "Before", after: "After" },
  },

  confirm: {
    type: "confirm",
    version: "1.0",
    title: "Delete Repository",
    message:
      "This will permanently delete the repository and all its contents. This action cannot be undone.",
    severity: "danger",
    details: [
      { label: "Repository", value: "acme/my-app" },
      { label: "Size", value: "2.3 GB" },
      { label: "Contributors", value: "12" },
    ],
    confirmLabel: "Yes, Delete Repository",
    cancelLabel: "Keep Repository",
    confirmTool: "delete_repo",
    confirmArgs: { id: "repo-123" },
    cancelTool: "cancel_action",
  },

  counter: {
    type: "counter",
    version: "1.0",
    value: 48250,
    label: "Monthly Revenue",
    prefix: "$",
    delta: { value: 12.5, label: "vs last month" },
    sparkline: [32000, 35000, 33000, 38000, 42000, 45000, 48250],
    color: "success",
  },

  dashboard: {
    type: "dashboard",
    version: "1.0",
    title: "Sample Dashboard",
    layout: "grid",
    gap: "8px",
    panels: [
      {
        id: "p1",
        label: "Panel 1",
        viewUrl: "about:blank",
        structuredContent: {},
        width: "50%",
        height: "50%",
      },
      {
        id: "p2",
        label: "Panel 2",
        viewUrl: "about:blank",
        structuredContent: {},
        width: "50%",
        height: "50%",
      },
      {
        id: "p3",
        label: "Panel 3",
        viewUrl: "about:blank",
        structuredContent: {},
        width: "50%",
        height: "50%",
      },
      {
        id: "p4",
        label: "Panel 4",
        viewUrl: "about:blank",
        structuredContent: {},
        width: "50%",
        height: "50%",
      },
    ],
  },

  datatable: {
    type: "datatable",
    version: "1.0",
    title: "Users",
    columns: [
      { key: "name", label: "Name", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "badge",
        badgeColors: {
          Active: "#22c55e",
          Inactive: "#ef4444",
          Pending: "#f59e0b",
        },
      },
      { key: "score", label: "Score", type: "number", align: "right" },
      { key: "active", label: "Active", type: "boolean", align: "center" },
    ],
    rows: [
      { id: "1", name: "Alice Johnson", status: "Active", score: 92, active: true },
      { id: "2", name: "Bob Smith", status: "Inactive", score: 67, active: false },
      { id: "3", name: "Carol White", status: "Pending", score: 85, active: true },
      { id: "4", name: "David Brown", status: "Active", score: 74, active: true },
      { id: "5", name: "Eve Davis", status: "Inactive", score: 58, active: false },
    ],
    sortable: true,
    filterable: true,
    exportable: true,
  },

  detail: {
    type: "detail",
    version: "1.0",
    title: "Jane Doe",
    subtitle: "Senior Software Engineer",
    image: { url: "https://i.pravatar.cc/150?u=jane", alt: "Jane Doe" },
    fields: [
      { label: "Email", value: "jane@example.com", type: "email" },
      { label: "Website", value: "https://jane.dev", type: "link" },
      { label: "Role", value: "Admin", type: "badge" },
      { label: "Joined", value: "January 15, 2024", type: "date" },
      { label: "Location", value: "San Francisco, CA" },
    ],
    actions: [
      { label: "Edit Profile", tool: "edit_user", args: { id: "usr_123" } },
      { label: "Send Message", tool: "send_message", args: { to: "usr_123" } },
    ],
    sections: [
      {
        title: "Employment",
        fields: [
          { label: "Company", value: "Acme Corp" },
          { label: "Department", value: "Engineering" },
          { label: "Start Date", value: "March 2022", type: "date" },
        ],
      },
    ],
  },

  diff: {
    type: "diff",
    version: "1.0",
    title: "Update greeting function",
    language: "typescript",
    mode: "unified",
    fileA: "src/greet.ts",
    fileB: "src/greet.ts",
    hunks: [
      {
        headerA: "@@ -1,7 +1,9 @@",
        lines: [
          { type: "context", content: "import { User } from './types';", lineA: 1, lineB: 1 },
          { type: "context", content: "", lineA: 2, lineB: 2 },
          { type: "remove", content: "export function greet(name: string) {", lineA: 3 },
          { type: "remove", content: "  return `Hello, ${name}`;", lineA: 4 },
          { type: "add", content: "export function greet(user: User) {", lineB: 3 },
          { type: "add", content: "  const { name, title } = user;", lineB: 4 },
          { type: "add", content: "  return `Hello, ${title} ${name}`;", lineB: 5 },
          { type: "context", content: "}", lineA: 5, lineB: 6 },
          { type: "context", content: "", lineA: 6, lineB: 7 },
          { type: "context", content: "export default greet;", lineA: 7, lineB: 8 },
        ],
      },
    ],
  },

  embed: {
    type: "embed",
    version: "1.0",
    url: "https://example.com",
    toolbar: true,
    title: "External Page",
  },

  filter: {
    type: "filter",
    version: "1.0",
    title: "Search Filters",
    layout: "horizontal",
    submitMode: "instant",
    filters: [
      { id: "query", label: "Search", type: "text", placeholder: "Search by name..." },
      {
        id: "category",
        label: "Category",
        type: "select",
        placeholder: "All categories",
        options: [
          { value: "electronics", label: "Electronics", count: 142 },
          { value: "clothing", label: "Clothing", count: 89 },
          { value: "books", label: "Books", count: 214 },
          { value: "home", label: "Home & Garden", count: 67 },
        ],
      },
      { id: "in-stock", label: "In Stock Only", type: "toggle", defaultValue: false },
    ],
  },

  form: {
    type: "form",
    version: "1.0",
    title: "Contact Us",
    schema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", title: "Name" },
        email: { type: "string", title: "Email" },
        message: { type: "string", title: "Message" },
      },
    },
    uiSchema: {
      order: ["name", "email", "message"],
      fields: {
        name: { placeholder: "Enter your name" },
        email: { placeholder: "you@example.com" },
        message: { widget: "textarea", placeholder: "Your message..." },
      },
    },
    submitTool: "submit_form",
  },

  gallery: {
    type: "gallery",
    version: "1.0",
    title: "Product Catalog",
    filterable: true,
    sortable: true,
    sortFields: ["Price", "Category"],
    items: [
      {
        id: "prod-1",
        title: "Wireless Headphones",
        subtitle: "Premium Audio",
        description:
          "Noise-cancelling over-ear headphones with 30-hour battery life and premium drivers.",
        image: { url: "https://picsum.photos/seed/headphones/400/225", alt: "Wireless Headphones" },
        badges: [{ label: "New" }, { label: "Sale", variant: "secondary" }],
        metadata: { Price: "$249.99", Category: "Audio" },
        actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-1" } }],
      },
      {
        id: "prod-2",
        title: "Mechanical Keyboard",
        subtitle: "Cherry MX Blue",
        description:
          "Full-size mechanical keyboard with RGB backlighting and programmable macros.",
        image: { url: "https://picsum.photos/seed/keyboard/400/225", alt: "Mechanical Keyboard" },
        badges: [{ label: "New" }],
        metadata: { Price: "$149.99", Category: "Peripherals" },
        actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-2" } }],
      },
      {
        id: "prod-3",
        title: "Ultrawide Monitor",
        subtitle: '34" QHD Display',
        description:
          "34-inch curved ultrawide monitor with 144Hz refresh rate and HDR support.",
        image: { url: "https://picsum.photos/seed/monitor/400/225", alt: "Ultrawide Monitor" },
        badges: [{ label: "Sale", variant: "secondary" }],
        metadata: { Price: "$599.99", Category: "Displays" },
        actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-3" } }],
      },
      {
        id: "prod-4",
        title: "USB-C Hub",
        subtitle: "7-in-1 Adapter",
        description:
          "Compact hub with HDMI, USB-A, SD card reader, and 100W power delivery.",
        image: { url: "https://picsum.photos/seed/usbhub/400/225", alt: "USB-C Hub" },
        metadata: { Price: "$49.99", Category: "Accessories" },
        actions: [{ label: "Add to Cart", tool: "add_to_cart", arguments: { productId: "prod-4" } }],
      },
    ],
  },

  image: {
    type: "image",
    version: "1.0",
    title: "Aerial Photography - Site Survey",
    images: [
      {
        id: "aerial-1",
        url: "https://picsum.photos/1200/800",
        alt: "Aerial photograph of survey site",
        caption: "Site survey taken 2024-01-15, north-facing view",
      },
    ],
    annotations: [
      {
        id: "ann-1",
        imageId: "aerial-1",
        type: "circle",
        x: 400,
        y: 300,
        radius: 50,
        label: "Building A",
        color: "#ff3333",
        description: "Main structure, approximately 200sqm",
      },
      {
        id: "ann-2",
        imageId: "aerial-1",
        type: "rect",
        x: 600,
        y: 200,
        width: 120,
        height: 80,
        label: "Parking Zone",
        color: "#33aaff",
        description: "Designated visitor parking area",
      },
      {
        id: "ann-3",
        imageId: "aerial-1",
        type: "point",
        x: 250,
        y: 450,
        label: "Access Point",
        color: "#33cc33",
        description: "Main pedestrian entrance",
      },
    ],
    controls: { zoom: true, fullscreen: true, thumbnails: false },
  },

  json: {
    type: "json",
    version: "1.0",
    title: "API Response",
    data: {
      status: 200,
      data: {
        users: [
          { id: 1, name: "Alice Johnson", email: "alice@example.com", active: true },
          { id: 2, name: "Bob Smith", email: "bob@example.com", active: false },
          { id: 3, name: "Carol White", email: "carol@example.com", active: true },
        ],
        pagination: { page: 1, perPage: 25, total: 3 },
      },
      meta: { requestId: "req_abc123", duration: 45 },
    },
    expandDepth: 2,
    searchable: true,
  },

  kanban: {
    type: "kanban",
    version: "1.0",
    title: "Sprint 24 Board",
    moveTool: "move_card",
    columns: [
      {
        id: "todo",
        label: "To Do",
        color: "#6366f1",
        cards: [
          {
            id: "card-1",
            title: "Design new onboarding flow",
            description: "Create wireframes and high-fidelity mockups for the redesigned user onboarding experience.",
            assignee: "Sarah Chen",
            priority: "high",
            labels: [
              { text: "Design", color: "#8b5cf6" },
              { text: "UX", color: "#06b6d4" },
            ],
          },
          {
            id: "card-2",
            title: "Update API rate limiting",
            description: "Implement sliding window rate limiter for public API endpoints.",
            assignee: "Marcus Johnson",
            priority: "medium",
            labels: [{ text: "Backend", color: "#f59e0b" }],
          },
        ],
      },
      {
        id: "in-progress",
        label: "In Progress",
        color: "#f59e0b",
        limit: 3,
        cards: [
          {
            id: "card-4",
            title: "Implement OAuth2 PKCE flow",
            description: "Add PKCE support to the authentication module for SPA clients.",
            assignee: "Alex Rivera",
            priority: "critical",
            labels: [
              { text: "Security", color: "#ef4444" },
              { text: "Backend", color: "#f59e0b" },
            ],
          },
          {
            id: "card-5",
            title: "Fix dashboard chart rendering",
            description: "Charts fail to render when dataset exceeds 10k points.",
            assignee: "Priya Patel",
            priority: "high",
            labels: [{ text: "Bug", color: "#ef4444" }],
          },
        ],
      },
      {
        id: "review",
        label: "In Review",
        color: "#8b5cf6",
        limit: 2,
        cards: [
          {
            id: "card-6",
            title: "Add CSV export to reports",
            description: "Users can now export any report as CSV with custom column selection.",
            assignee: "Jordan Lee",
            priority: "medium",
            labels: [
              { text: "Feature", color: "#3b82f6" },
              { text: "Frontend", color: "#06b6d4" },
            ],
          },
        ],
      },
      {
        id: "done",
        label: "Done",
        color: "#10b981",
        cards: [
          { id: "card-7", title: "Upgrade to Node 22", assignee: "Marcus Johnson", priority: "low", labels: [{ text: "Infra", color: "#64748b" }] },
          {
            id: "card-8",
            title: "Fix email template rendering",
            description: "Resolved UTF-8 encoding issue in transactional emails.",
            assignee: "Priya Patel",
            priority: "medium",
            labels: [{ text: "Bug", color: "#ef4444" }],
          },
        ],
      },
    ],
  },

  log: {
    type: "log",
    version: "1.0",
    title: "Application Server",
    searchable: true,
    autoScroll: true,
    showTimestamp: true,
    entries: [
      { id: "1", timestamp: "2024-03-15T10:00:01.123Z", level: "info", source: "server", message: "Server starting on port 3000" },
      { id: "2", timestamp: "2024-03-15T10:00:01.200Z", level: "debug", source: "config", message: "Loading configuration from /etc/app/config.yaml" },
      { id: "3", timestamp: "2024-03-15T10:00:01.350Z", level: "info", source: "db", message: "Connected to PostgreSQL at localhost:5432" },
      { id: "4", timestamp: "2024-03-15T10:00:01.500Z", level: "info", source: "cache", message: "Redis connection established" },
      { id: "5", timestamp: "2024-03-15T10:00:02.001Z", level: "info", source: "auth", message: "JWT middleware initialized with RS256" },
      { id: "6", timestamp: "2024-03-15T10:00:02.100Z", level: "warn", source: "auth", message: "Token expiry set to 24h -- consider reducing for production" },
      { id: "7", timestamp: "2024-03-15T10:00:02.200Z", level: "info", source: "routes", message: "Registered 42 API routes" },
      { id: "8", timestamp: "2024-03-15T10:00:03.000Z", level: "info", source: "server", message: "Server ready -- accepting connections" },
      { id: "9", timestamp: "2024-03-15T10:00:10.450Z", level: "info", source: "http", message: "POST /api/auth/login 200 45ms" },
      { id: "10", timestamp: "2024-03-15T10:00:15.800Z", level: "warn", source: "rate-limit", message: "Rate limit threshold at 80% for IP 192.168.1.50" },
      { id: "11", timestamp: "2024-03-15T10:00:25.300Z", level: "error", source: "db", message: "Query timeout after 5000ms on users_search" },
      { id: "12", timestamp: "2024-03-15T10:00:50.000Z", level: "fatal", source: "memory", message: "Heap usage at 95% -- OOM kill imminent" },
      { id: "13", timestamp: "2024-03-15T10:00:51.000Z", level: "info", source: "gc", message: "GC completed -- heap freed 400MB" },
      { id: "14", timestamp: "2024-03-15T10:01:00.000Z", level: "info", source: "metrics", message: "Requests in last minute: 156, avg latency: 18ms, p99: 120ms" },
    ],
  },

  map: {
    type: "map",
    version: "1.0",
    center: { lat: 51.505, lon: -0.1 },
    zoom: 13,
    basemap: "osm",
    layers: [
      {
        id: "landmarks",
        label: "London Landmarks",
        features: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [-0.1, 51.505] },
              properties: { name: "Big Ben", category: "Landmark" },
            },
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [-0.076, 51.508] },
              properties: { name: "Tower of London", category: "Historical" },
            },
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [-0.119, 51.503] },
              properties: { name: "London Eye", category: "Attraction" },
            },
          ],
        },
        popup: { title: "{properties.name}", fields: ["category"] },
      },
    ],
  },

  markdown: {
    type: "markdown",
    version: "1.0",
    title: "Getting Started",
    content:
      "# Welcome to the Project\n\nThis is an introduction to our documentation.\n\n## Overview\n\nThe platform provides a **powerful** set of tools for building *interactive* applications.\n\n### Key Features\n\n- Feature one\n- Feature two\n- Feature three\n\n## Code Example\n\n```typescript\nconst hello = 'world';\nconsole.log(hello);\n```\n\n## Next Steps\n\nRead on to learn more about configuration and deployment.",
  },

  pdf: {
    type: "pdf",
    version: "1.0",
    url: "data:application/pdf;base64,JVBERi0xLjAKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNSAwIFI+Pj4+Pj5lbmRvYmoKNCAwIG9iajw8L0xlbmd0aCA0ND4+c3RyZWFtCkJUIC9GMSAyNCBUZiAxMDAgNzAwIFRkIChIZWxsbyBXb3JsZCkgVGogRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj5lbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNTkgMDAwMDAgbiAKMDAwMDAwMDExMiAwMDAwMCBuIAowMDAwMDAwMjYxIDAwMDAwIG4gCjAwMDAwMDAzNTcgMDAwMDAgbiAKdHJhaWxlcjw8L1NpemUgNi9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjQzMQolJUVPRg==",
    title: "Sample PDF",
  },

  poll: {
    type: "poll",
    version: "1.0",
    title: "Developer Survey",
    description: "Help us understand your preferences",
    questions: [
      {
        id: "q1",
        type: "single-choice",
        prompt: "What's your favorite framework?",
        options: [
          { id: "react", label: "React", color: "#61dafb" },
          { id: "vue", label: "Vue", color: "#42b883" },
          { id: "svelte", label: "Svelte", color: "#ff3e00" },
          { id: "angular", label: "Angular", color: "#dd0031" },
        ],
      },
    ],
    voteTool: "submit_vote",
  },

  progress: {
    type: "progress",
    version: "1.0",
    title: "Build Pipeline",
    overall: 65,
    tracks: [
      { id: "lint", label: "Lint", value: 100, max: 100, status: "complete", detail: "No issues found" },
      { id: "compile", label: "Compile", value: 100, max: 100, status: "complete", detail: "Done in 2.3s" },
      { id: "test", label: "Test", value: 45, max: 100, status: "active", detail: "Running suite 3 of 7..." },
      { id: "deploy", label: "Deploy", value: 0, max: 100, status: "pending" },
    ],
  },

  quiz: {
    type: "quiz",
    version: "1.0",
    title: "General Knowledge Quiz",
    description: "Test your knowledge across geography, history, and science.",
    validateTool: "validate_answer",
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        prompt: "What is the largest ocean on Earth?",
        category: "Geography",
        points: 2,
        timeLimit: 30,
        explanation: "The Pacific Ocean covers approximately 63 million square miles.",
        options: [
          { id: "q1-a", label: "Pacific Ocean" },
          { id: "q1-b", label: "Atlantic Ocean" },
          { id: "q1-c", label: "Indian Ocean" },
          { id: "q1-d", label: "Arctic Ocean" },
        ],
      },
      {
        id: "q2",
        type: "multiple-choice",
        prompt: "In which year did the Berlin Wall fall?",
        category: "History",
        points: 2,
        timeLimit: 30,
        options: [
          { id: "q2-a", label: "1989" },
          { id: "q2-b", label: "1991" },
          { id: "q2-c", label: "1985" },
          { id: "q2-d", label: "1990" },
        ],
      },
      {
        id: "q3",
        type: "multiple-choice",
        prompt: "What is the chemical symbol for gold?",
        category: "Science",
        points: 2,
        timeLimit: 30,
        options: [
          { id: "q3-a", label: "Au" },
          { id: "q3-b", label: "Ag" },
          { id: "q3-c", label: "Go" },
          { id: "q3-d", label: "Gd" },
        ],
      },
    ],
    settings: {
      timeLimit: 30,
      timeLimitMode: "per-question",
      showExplanation: true,
      showProgress: true,
      showScore: true,
      passingScore: 60,
    },
  },

  ranked: {
    type: "ranked",
    version: "1.0",
    title: "Search Results",
    scoreLabel: "Relevance",
    scoreSuffix: "%",
    maxScore: 100,
    items: [
      { id: "r1", rank: 1, title: "Introduction to Machine Learning", subtitle: "A comprehensive guide to ML fundamentals", score: 98, metadata: { author: "Dr. Smith", year: "2024" } },
      { id: "r2", rank: 2, title: "Deep Learning with Python", subtitle: "Hands-on neural network programming", score: 94, metadata: { author: "F. Chollet", year: "2023" } },
      { id: "r3", rank: 3, title: "Statistical Learning Theory", subtitle: "Mathematical foundations of learning algorithms", score: 89, metadata: { author: "V. Vapnik", year: "2022" } },
      { id: "r4", rank: 4, title: "Natural Language Processing in Action", subtitle: "Building NLP pipelines from scratch", score: 85, metadata: { author: "H. Lane", year: "2023" } },
      { id: "r5", rank: 5, title: "Reinforcement Learning: An Introduction", subtitle: "Classic RL textbook, updated edition", score: 82, metadata: { author: "R. Sutton", year: "2024" } },
    ],
  },

  settings: {
    type: "settings",
    version: "1.0",
    title: "Display Settings",
    saveTool: "save_display_settings",
    sections: [
      {
        id: "appearance",
        title: "Appearance",
        description: "Customise how the application looks",
        collapsible: true,
        fields: [
          {
            id: "theme",
            label: "Theme",
            description: "Choose your preferred colour scheme",
            type: "select",
            value: "system",
            options: [
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ],
          },
          {
            id: "font-size",
            label: "Font Size",
            description: "Adjust the base font size in pixels",
            type: "slider",
            value: 14,
            min: 10,
            max: 24,
            step: 1,
          },
          {
            id: "dark-mode",
            label: "Force Dark Mode",
            description: "Override system preference with dark mode",
            type: "toggle",
            value: false,
          },
        ],
      },
      {
        id: "notifications",
        title: "Notifications",
        description: "Control when and how you receive notifications",
        collapsible: true,
        fields: [
          {
            id: "email-notifications",
            label: "Email Notifications",
            description: "Receive updates via email",
            type: "toggle",
            value: true,
          },
          {
            id: "sound",
            label: "Sound Alerts",
            description: "Play a sound when notifications arrive",
            type: "toggle",
            value: false,
          },
          {
            id: "frequency",
            label: "Digest Frequency",
            description: "How often to send notification digests",
            type: "select",
            value: "daily",
            options: [
              { value: "realtime", label: "Real-time" },
              { value: "hourly", label: "Hourly" },
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
            ],
          },
        ],
      },
    ],
  },

  split: {
    type: "split",
    version: "1.0",
    direction: "horizontal",
    ratio: "60:40",
    left: { label: "Left Panel", viewUrl: "about:blank", structuredContent: {} },
    right: { label: "Right Panel", viewUrl: "about:blank", structuredContent: {} },
  },

  status: {
    type: "status",
    version: "1.0",
    title: "Production Systems",
    items: [
      { id: "api", label: "API Server", status: "ok", detail: "Response time: 45ms", lastChecked: "2 min ago" },
      { id: "db", label: "Database", status: "ok", detail: "Connections: 12/100", lastChecked: "1 min ago" },
      { id: "cache", label: "Redis Cache", status: "ok", detail: "Memory: 256MB/1GB", lastChecked: "30s ago" },
      { id: "cdn", label: "CDN", status: "ok", detail: "Hit rate: 98.5%", lastChecked: "5 min ago", url: "https://cdn.example.com" },
      { id: "queue", label: "Message Queue", status: "ok", detail: "0 messages pending", lastChecked: "1 min ago" },
    ],
  },

  stepper: {
    type: "stepper",
    version: "1.0",
    title: "Account Setup Wizard",
    steps: [
      { id: "account", label: "Account", description: "Create your account", status: "completed" },
      { id: "profile", label: "Profile", description: "Set up your profile", status: "completed" },
      {
        id: "preferences",
        label: "Preferences",
        description: "Choose your preferences",
        status: "active",
        detail: "Select your notification preferences and default workspace settings before continuing.",
      },
      { id: "integrations", label: "Integrations", description: "Connect services", status: "pending" },
      { id: "review", label: "Review", description: "Confirm and finish", status: "pending" },
    ],
    activeStep: 2,
    orientation: "horizontal",
  },

  tabs: {
    type: "tabs",
    version: "1.0",
    activeTab: "tab1",
    tabs: [
      { id: "tab1", label: "Overview", viewUrl: "about:blank", structuredContent: {} },
      { id: "tab2", label: "Details", viewUrl: "about:blank", structuredContent: {} },
      { id: "tab3", label: "Settings", viewUrl: "about:blank", structuredContent: {} },
    ],
  },

  timeline: {
    type: "timeline",
    version: "1.0",
    title: "Project History",
    events: [
      {
        id: "evt-1",
        title: "Project Kickoff",
        description: "Initial planning session with stakeholders. Defined scope, timeline, and resource allocation.",
        date: "2024-09-01",
        severity: "info",
        icon: "\u{1F680}",
        details: [
          { label: "Lead", value: "Sarah Chen" },
          { label: "Budget", value: "$250,000" },
        ],
      },
      { id: "evt-2", title: "Requirements Finalized", description: "All functional and non-functional requirements approved.", date: "2024-09-15", severity: "success", icon: "\u{1F4CB}", tags: ["milestone"] },
      {
        id: "evt-3",
        title: "Architecture Review",
        description: "Completed system architecture review. Selected microservices approach.",
        date: "2024-10-02",
        severity: "info",
        icon: "\u{1F3D7}\uFE0F",
        details: [
          { label: "Pattern", value: "Microservices" },
          { label: "Services", value: "12 planned" },
        ],
      },
      { id: "evt-4", title: "Sprint 1 Complete", date: "2024-10-20", severity: "success", icon: "\u2705", tags: ["sprint", "on-track"] },
      {
        id: "evt-5",
        title: "Performance Issue Detected",
        description: "Load testing revealed response time degradation above 200 concurrent users.",
        date: "2024-10-28",
        severity: "warning",
        icon: "\u26A0\uFE0F",
        tags: ["performance"],
      },
      { id: "evt-6", title: "Security Audit Passed", description: "Third-party security audit completed with no critical findings.", date: "2024-11-05", severity: "success", icon: "\u{1F512}", tags: ["security", "milestone"] },
      {
        id: "evt-7",
        title: "Deployment Pipeline Failure",
        description: "CI/CD pipeline broke due to expired certificates. Resolved within 4 hours.",
        date: "2024-11-12",
        severity: "error",
        icon: "\u{1F6A8}",
      },
      { id: "evt-8", title: "Beta Release", description: "First beta release deployed to staging. 50 beta testers onboarded.", date: "2024-11-20", severity: "success", icon: "\u{1F389}", tags: ["release", "milestone"] },
    ],
  },

  tree: {
    type: "tree",
    version: "1.0",
    title: "Project Explorer",
    selection: "single",
    expandDepth: 1,
    roots: [
      {
        id: "src",
        label: "src",
        icon: "\u{1F4C1}",
        children: [
          {
            id: "src-components",
            label: "components",
            icon: "\u{1F4C1}",
            children: [
              { id: "src-components-button", label: "Button.tsx", icon: "\u{1F4C4}" },
              { id: "src-components-input", label: "Input.tsx", icon: "\u{1F4C4}" },
              { id: "src-components-modal", label: "Modal.tsx", icon: "\u{1F4C4}" },
              { id: "src-components-table", label: "Table.tsx", icon: "\u{1F4C4}" },
            ],
          },
          {
            id: "src-utils",
            label: "utils",
            icon: "\u{1F4C1}",
            children: [
              { id: "src-utils-format", label: "format.ts", icon: "\u{1F4C4}" },
              { id: "src-utils-validate", label: "validate.ts", icon: "\u{1F4C4}" },
              { id: "src-utils-api", label: "api.ts", icon: "\u{1F4C4}" },
            ],
          },
          { id: "src-app", label: "App.tsx", icon: "\u{1F4C4}" },
          { id: "src-main", label: "main.tsx", icon: "\u{1F4C4}" },
        ],
      },
      {
        id: "public",
        label: "public",
        icon: "\u{1F4C1}",
        children: [
          { id: "public-index", label: "index.html", icon: "\u{1F310}" },
          { id: "public-favicon", label: "favicon.ico", icon: "\u{1F3A8}" },
        ],
      },
      { id: "package-json", label: "package.json", icon: "\u{1F4E6}" },
      { id: "tsconfig", label: "tsconfig.json", icon: "\u2699\uFE0F" },
      { id: "readme", label: "README.md", icon: "\u{1F4D6}" },
    ],
  },

  video: {
    type: "video",
    version: "1.0",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Sample Video",
  },

  /* ================================================================== */
  /*  Phase 4 views                                                     */
  /* ================================================================== */

  audio: {
    type: "audio",
    version: "1.0",
    url: "https://www.w3schools.com/html/horse.ogg",
    title: "The Daily Podcast \u2014 Episode 42",
    duration: 185,
  },

  boxplot: {
    type: "boxplot",
    version: "1.0",
    title: "Salary Distribution by Department",
    orientation: "vertical",
    showOutliers: false,
    yAxis: { label: "Annual Salary ($K)" },
    groups: [
      { label: "Engineering", color: "#3388ff", stats: { min: 85, q1: 110, median: 135, q3: 160, max: 195 } },
      { label: "Marketing", color: "#ff6384", stats: { min: 55, q1: 72, median: 90, q3: 115, max: 145 } },
      { label: "Sales", color: "#ffce56", stats: { min: 48, q1: 65, median: 82, q3: 105, max: 140 } },
      { label: "HR", color: "#4bc0c0", stats: { min: 50, q1: 68, median: 80, q3: 98, max: 125 } },
    ],
  },

  carousel: {
    type: "carousel",
    version: "1.0",
    title: "Product Gallery",
    items: [
      { id: "img-1", image: { url: "https://picsum.photos/seed/carousel1/800/400", alt: "Mountain landscape" }, title: "Mountain Vista", description: "A breathtaking view of snow-capped mountains at sunrise." },
      { id: "img-2", image: { url: "https://picsum.photos/seed/carousel2/800/400", alt: "Ocean sunset" }, title: "Ocean Sunset", description: "Golden light reflecting off calm ocean waters." },
      { id: "img-3", image: { url: "https://picsum.photos/seed/carousel3/800/400", alt: "Forest path" }, title: "Forest Path", description: "A winding trail through an ancient redwood forest." },
    ],
    showDots: true,
    showArrows: true,
    loop: true,
    transition: "slide",
  },

  crosstab: {
    type: "crosstab",
    version: "1.0",
    title: "Sales by Region and Quarter",
    rowHeaders: ["North", "South", "East", "West"],
    columnHeaders: ["Q1", "Q2", "Q3", "Q4"],
    values: [
      [120, 150, 180, 200],
      [90, 110, 95, 130],
      [200, 220, 250, 280],
      [75, 80, 110, 95],
    ],
    formatting: "heatmap",
    colorScale: { min: "#dbeafe", max: "#1e40af" },
    showTotals: true,
    annotations: [
      { row: 2, col: 3, label: "Record high", highlight: true },
      { row: 1, col: 2, label: "Below target" },
    ],
  },

  gauge: {
    type: "gauge",
    version: "1.0",
    value: 72,
    min: 0,
    max: 120,
    unit: "mph",
    thresholds: [
      { value: 60, color: "#22c55e" },
      { value: 90, color: "#f59e0b" },
      { value: 120, color: "#ef4444" },
    ],
    title: "Speed",
  },

  "gis-legend": {
    type: "gis-legend",
    version: "1.0",
    title: "Land Cover Classification",
    sections: [
      {
        title: "Vegetation",
        items: [
          { type: "polygon", label: "Forest", fillColor: "#228B22", strokeColor: "#145214" },
          { type: "polygon", label: "Grassland", fillColor: "#90EE90" },
          { type: "polygon", label: "Wetland", fillColor: "#4682B4", strokeColor: "#2F5F8F" },
          { type: "polygon", label: "Cropland", fillColor: "#DAA520" },
        ],
      },
      {
        title: "Built Environment",
        items: [
          { type: "polygon", label: "Urban Area", fillColor: "#808080", strokeColor: "#555" },
          { type: "polygon", label: "Industrial", fillColor: "#A0522D" },
          { type: "line", label: "Road", strokeColor: "#333", strokeWidth: 2 },
          { type: "line", label: "Railway", strokeColor: "#111", strokeWidth: 3 },
        ],
      },
      {
        title: "Water",
        items: [
          { type: "polygon", label: "Lake", fillColor: "#1E90FF" },
          { type: "line", label: "River", strokeColor: "#1E90FF", strokeWidth: 2 },
        ],
      },
    ],
  },

  heatmap: {
    type: "heatmap",
    version: "1.0",
    title: "Hourly Temperature (\u00B0C) \u2014 Weekly",
    rows: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    columns: ["0:00", "3:00", "6:00", "9:00", "12:00", "15:00", "18:00", "21:00"],
    values: [
      [13.4, 13.4, 15.2, 22.3, 28.3, 27.4, 20.7, 16.0],
      [13.0, 13.0, 14.8, 21.8, 27.8, 26.9, 20.2, 15.5],
      [12.7, 12.7, 14.5, 21.5, 27.5, 26.6, 19.9, 15.2],
      [13.1, 13.1, 14.9, 22.0, 28.0, 27.1, 20.4, 15.7],
      [13.4, 13.4, 15.2, 22.3, 28.3, 27.4, 20.7, 16.0],
      [15.4, 15.4, 17.2, 24.3, 30.3, 29.4, 22.7, 18.0],
      [15.0, 15.0, 16.8, 23.9, 29.9, 29.0, 22.3, 17.6],
    ],
    colorScale: "sequential",
    minColor: "#dbeafe",
    maxColor: "#dc2626",
    showValues: false,
  },

  layers: {
    type: "layers",
    version: "1.0",
    title: "London Infrastructure",
    center: { lat: 51.505, lon: -0.12 },
    zoom: 13,
    basemap: "osm",
    layers: [
      {
        id: "roads",
        label: "Roads",
        group: "Transport",
        features: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "LineString", coordinates: [[-0.14, 51.51], [-0.12, 51.515], [-0.1, 51.512]] },
              properties: { name: "Oxford Street", type: "A Road", lanes: 4 },
            },
            {
              type: "Feature",
              geometry: { type: "LineString", coordinates: [[-0.13, 51.505], [-0.11, 51.508], [-0.09, 51.506]] },
              properties: { name: "The Strand", type: "A Road", lanes: 3 },
            },
          ],
        },
        style: { color: "#e67e22", weight: 4, fillOpacity: 0.6 },
        popup: { title: "{properties.name}", fields: ["type", "lanes"] },
      },
      {
        id: "buildings",
        label: "Key Buildings",
        group: "Structures",
        features: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [-0.1246, 51.5007] },
              properties: { name: "Palace of Westminster", use: "Government", floors: 5 },
            },
          ],
        },
        style: { color: "#2c3e50", fillColor: "#95a5a6", weight: 2, fillOpacity: 0.5 },
        popup: { title: "{properties.name}", fields: ["use", "floors"] },
      },
      {
        id: "parks",
        label: "Parks",
        group: "Green Space",
        features: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [[[-0.155, 51.507], [-0.155, 51.512], [-0.145, 51.512], [-0.145, 51.507], [-0.155, 51.507]]],
              },
              properties: { name: "Hyde Park", area_ha: 142 },
            },
          ],
        },
        style: { color: "#27ae60", fillColor: "#2ecc71", weight: 2, fillOpacity: 0.4 },
        popup: { title: "{properties.name}", fields: ["area_ha"] },
      },
    ],
  },

  minimap: {
    type: "minimap",
    version: "1.0",
    title: "London Overview & Detail",
    layout: "horizontal",
    ratio: "1:2",
    linkZoom: false,
    overview: {
      center: { lat: 51.505, lon: -0.1 },
      zoom: 11,
      basemap: "osm",
      layers: [
        {
          id: "landmarks-overview",
          label: "Landmarks",
          features: {
            type: "FeatureCollection",
            features: [
              { type: "Feature", geometry: { type: "Point", coordinates: [-0.1246, 51.5007] }, properties: { name: "Big Ben" } },
              { type: "Feature", geometry: { type: "Point", coordinates: [-0.076, 51.508] }, properties: { name: "Tower of London" } },
            ],
          },
          style: { color: "#dc2626", radius: 5 },
        },
      ],
    },
    detail: {
      center: { lat: 51.505, lon: -0.1 },
      zoom: 15,
      basemap: "osm",
      layers: [
        {
          id: "landmarks-detail",
          label: "Landmarks",
          features: {
            type: "FeatureCollection",
            features: [
              { type: "Feature", geometry: { type: "Point", coordinates: [-0.1246, 51.5007] }, properties: { name: "Big Ben", category: "Landmark" } },
              { type: "Feature", geometry: { type: "Point", coordinates: [-0.076, 51.508] }, properties: { name: "Tower of London", category: "Historical" } },
            ],
          },
          popup: { title: "Landmark", fields: ["name", "category"] },
        },
      ],
    },
  },

  pivot: {
    type: "pivot",
    version: "1.0",
    title: "Revenue by Region and Quarter",
    data: [
      { region: "North", quarter: "Q1", revenue: 12000, deals: 5 },
      { region: "North", quarter: "Q2", revenue: 15000, deals: 7 },
      { region: "North", quarter: "Q3", revenue: 18000, deals: 9 },
      { region: "North", quarter: "Q4", revenue: 20000, deals: 11 },
      { region: "South", quarter: "Q1", revenue: 9000, deals: 4 },
      { region: "South", quarter: "Q2", revenue: 11000, deals: 6 },
      { region: "South", quarter: "Q3", revenue: 9500, deals: 3 },
      { region: "South", quarter: "Q4", revenue: 13000, deals: 8 },
      { region: "East", quarter: "Q1", revenue: 20000, deals: 10 },
      { region: "East", quarter: "Q2", revenue: 22000, deals: 12 },
      { region: "East", quarter: "Q3", revenue: 25000, deals: 14 },
      { region: "East", quarter: "Q4", revenue: 28000, deals: 16 },
      { region: "West", quarter: "Q1", revenue: 7500, deals: 3 },
      { region: "West", quarter: "Q2", revenue: 8000, deals: 4 },
      { region: "West", quarter: "Q3", revenue: 11000, deals: 6 },
      { region: "West", quarter: "Q4", revenue: 9500, deals: 5 },
    ],
    rows: ["region"],
    columns: ["quarter"],
    values: [{ field: "revenue", aggregate: "sum", label: "Revenue", format: "currency" }],
    sortable: true,
    showTotals: true,
  },

  profile: {
    type: "profile",
    version: "1.0",
    title: "Mountain Pass Elevation Profile",
    points: [
      { x: 0, y: 1200 },
      { x: 2, y: 1350 },
      { x: 4, y: 1580 },
      { x: 6, y: 1820 },
      { x: 8, y: 2100 },
      { x: 10, y: 2350 },
      { x: 12, y: 2500 },
      { x: 14, y: 2420 },
      { x: 16, y: 2200 },
      { x: 18, y: 1950 },
      { x: 20, y: 1700 },
      { x: 22, y: 1500 },
      { x: 24, y: 1350 },
    ],
    xLabel: "Distance (km)",
    yLabel: "Elevation (m)",
    fill: true,
    color: "#4bc0c0",
    markers: [
      { x: 12, label: "Summit", color: "#ff6384" },
      { x: 5, label: "Rest Stop" },
      { x: 20, label: "Campsite", color: "#36a2eb" },
    ],
  },

  scatter: {
    type: "scatter",
    version: "1.0",
    title: "Iris Dataset \u2014 Sepal Dimensions",
    subtitle: "Sepal length vs. sepal width by species",
    datasets: [
      {
        label: "Setosa",
        color: "#3388ff",
        pointStyle: "circle",
        points: [
          { x: 5.1, y: 3.5 }, { x: 4.9, y: 3.0 }, { x: 4.7, y: 3.2 },
          { x: 4.6, y: 3.1 }, { x: 5.0, y: 3.6 }, { x: 5.4, y: 3.9 },
        ],
      },
      {
        label: "Versicolor",
        color: "#ff6384",
        pointStyle: "triangle",
        points: [
          { x: 7.0, y: 3.2 }, { x: 6.4, y: 3.2 }, { x: 6.9, y: 3.1 },
          { x: 5.5, y: 2.3 }, { x: 6.5, y: 2.8 }, { x: 5.7, y: 2.8 },
        ],
      },
      {
        label: "Virginica",
        color: "#4bc0c0",
        pointStyle: "rect",
        points: [
          { x: 6.3, y: 3.3 }, { x: 5.8, y: 2.7 }, { x: 7.1, y: 3.0 },
          { x: 6.3, y: 2.9 }, { x: 6.5, y: 3.0 }, { x: 7.6, y: 3.0 },
        ],
      },
    ],
    xAxis: { label: "Sepal Length (cm)" },
    yAxis: { label: "Sepal Width (cm)" },
    legend: { position: "top" },
  },

  spectrogram: {
    type: "spectrogram",
    version: "1.0",
    title: "Speech Signal \u2014 Vowel Formants",
    data: {
      sampleRate: 16000,
      fftSize: 256,
      hopSize: 128,
      magnitudes: [
        [0.05, 0.08, 0.15, 0.72, 0.35, 0.12, 0.52, 0.28, 0.08, 0.05, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01],
        [0.06, 0.10, 0.20, 0.85, 0.40, 0.15, 0.58, 0.32, 0.10, 0.06, 0.04, 0.03, 0.02, 0.01, 0.01, 0.01],
        [0.05, 0.09, 0.18, 0.78, 0.38, 0.13, 0.55, 0.30, 0.09, 0.05, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01],
        [0.04, 0.06, 0.10, 0.30, 0.15, 0.08, 0.20, 0.12, 0.06, 0.04, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01],
        [0.05, 0.07, 0.12, 0.65, 0.32, 0.11, 0.48, 0.25, 0.08, 0.05, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01],
        [0.06, 0.10, 0.22, 0.90, 0.42, 0.16, 0.60, 0.34, 0.11, 0.06, 0.04, 0.03, 0.02, 0.01, 0.01, 0.01],
        [0.05, 0.08, 0.17, 0.75, 0.37, 0.13, 0.53, 0.29, 0.09, 0.05, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01],
        [0.04, 0.05, 0.08, 0.22, 0.12, 0.07, 0.15, 0.10, 0.05, 0.04, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01],
      ],
    },
    frequencyRange: { min: 0, max: 8000 },
    colorMap: "viridis",
    showFrequencyAxis: true,
    showTimeAxis: true,
  },

  sunburst: {
    type: "sunburst",
    version: "1.0",
    title: "Project Directory",
    showLabels: true,
    interactive: true,
    root: {
      id: "root",
      label: "project",
      children: [
        {
          id: "src",
          label: "src",
          color: "#3b82f6",
          children: [
            {
              id: "src-components",
              label: "components",
              children: [
                { id: "src-components-button", label: "Button.tsx", value: 120 },
                { id: "src-components-input", label: "Input.tsx", value: 85 },
                { id: "src-components-modal", label: "Modal.tsx", value: 200 },
                { id: "src-components-table", label: "Table.tsx", value: 310 },
              ],
            },
            {
              id: "src-utils",
              label: "utils",
              children: [
                { id: "src-utils-format", label: "format.ts", value: 45 },
                { id: "src-utils-validate", label: "validate.ts", value: 60 },
                { id: "src-utils-api", label: "api.ts", value: 150 },
              ],
            },
            { id: "src-app", label: "App.tsx", value: 50 },
            { id: "src-main", label: "main.tsx", value: 15 },
          ],
        },
        {
          id: "public",
          label: "public",
          color: "#22c55e",
          children: [
            { id: "public-index", label: "index.html", value: 30 },
            { id: "public-favicon", label: "favicon.ico", value: 5 },
            { id: "public-assets", label: "assets", value: 250 },
          ],
        },
        {
          id: "config",
          label: "config",
          color: "#f59e0b",
          children: [
            { id: "config-package", label: "package.json", value: 20 },
            { id: "config-tsconfig", label: "tsconfig.json", value: 10 },
            { id: "config-vite", label: "vite.config.ts", value: 15 },
          ],
        },
      ],
    },
  },

  terminal: {
    type: "terminal",
    version: "1.0",
    title: "Build Output",
    lines: [
      { text: "$ npm run build", timestamp: "10:30:00" },
      { text: "" },
      { text: "> project@1.0.0 build" },
      { text: "> vite build" },
      { text: "" },
      { text: "\x1b[36mvite\x1b[0m v6.0.0 building for production..." },
      { text: "\x1b[32m\u2713\x1b[0m 128 modules transformed." },
      { text: "\x1b[32m\u2713\x1b[0m built in 1.24s" },
      { text: "" },
      { text: "dist/index.html          \x1b[2m0.45 kB\x1b[0m \x1b[36m\u2502\x1b[0m gzip: 0.30 kB" },
      { text: "dist/assets/index.js     \x1b[1m\x1b[33m142.50 kB\x1b[0m \x1b[36m\u2502\x1b[0m gzip: 45.20 kB" },
      { text: "dist/assets/index.css    \x1b[2m8.30 kB\x1b[0m \x1b[36m\u2502\x1b[0m gzip: 2.10 kB" },
    ],
    theme: "dark",
    fontSize: "sm",
  },

  timeseries: {
    type: "timeseries",
    version: "1.0",
    title: "ACME Corp Stock Price",
    subtitle: "January 2025 \u2014 Daily Close",
    series: [
      {
        label: "ACME (Close)",
        data: [
          { t: "2025-01-01T00:00:00Z", v: 150.12 },
          { t: "2025-01-02T00:00:00Z", v: 151.45 },
          { t: "2025-01-03T00:00:00Z", v: 149.80 },
          { t: "2025-01-06T00:00:00Z", v: 152.30 },
          { t: "2025-01-07T00:00:00Z", v: 153.10 },
          { t: "2025-01-08T00:00:00Z", v: 151.95 },
          { t: "2025-01-09T00:00:00Z", v: 154.20 },
          { t: "2025-01-10T00:00:00Z", v: 155.80 },
          { t: "2025-01-13T00:00:00Z", v: 157.15 },
          { t: "2025-01-14T00:00:00Z", v: 156.40 },
          { t: "2025-01-15T00:00:00Z", v: 158.70 },
          { t: "2025-01-16T00:00:00Z", v: 160.25 },
          { t: "2025-01-17T00:00:00Z", v: 159.50 },
          { t: "2025-01-20T00:00:00Z", v: 161.80 },
          { t: "2025-01-21T00:00:00Z", v: 163.45 },
          { t: "2025-01-22T00:00:00Z", v: 162.10 },
          { t: "2025-01-23T00:00:00Z", v: 164.90 },
          { t: "2025-01-24T00:00:00Z", v: 166.30 },
          { t: "2025-01-27T00:00:00Z", v: 165.50 },
          { t: "2025-01-28T00:00:00Z", v: 167.85 },
          { t: "2025-01-29T00:00:00Z", v: 169.20 },
          { t: "2025-01-30T00:00:00Z", v: 168.40 },
          { t: "2025-01-31T00:00:00Z", v: 170.10 },
        ],
        color: "#3388ff",
      },
    ],
    xAxis: { label: "Date" },
    yAxis: { label: "Price (USD)", min: 145, max: 175 },
    zoom: true,
  },

  treemap: {
    type: "treemap",
    version: "1.0",
    title: "Disk Usage by Directory",
    showLabels: true,
    interactive: true,
    root: {
      id: "root",
      label: "/",
      children: [
        {
          id: "src",
          label: "src",
          color: "#3b82f6",
          children: [
            {
              id: "src-components",
              label: "components",
              children: [
                { id: "src-comp-button", label: "Button.tsx", value: 24 },
                { id: "src-comp-input", label: "Input.tsx", value: 18 },
                { id: "src-comp-modal", label: "Modal.tsx", value: 42 },
                { id: "src-comp-table", label: "Table.tsx", value: 56 },
                { id: "src-comp-form", label: "Form.tsx", value: 38 },
              ],
            },
            {
              id: "src-utils",
              label: "utils",
              children: [
                { id: "src-util-format", label: "format.ts", value: 12 },
                { id: "src-util-validate", label: "validate.ts", value: 28 },
                { id: "src-util-api", label: "api.ts", value: 34 },
              ],
            },
          ],
        },
        {
          id: "public",
          label: "public",
          color: "#22c55e",
          children: [
            { id: "pub-index", label: "index.html", value: 2 },
            { id: "pub-assets", label: "assets", value: 120 },
          ],
        },
        { id: "node_modules", label: "node_modules", color: "#ef4444", value: 450 },
        { id: "dist", label: "dist", color: "#f59e0b", value: 200 },
      ],
    },
  },

  /* ================================================================== */
  /*  Phase 6 Compound views                                            */
  /* ================================================================== */

  annotation: {
    type: "annotation",
    version: "1.0",
    title: "Chest X-Ray Analysis",
    imageUrl: "https://picsum.photos/seed/medical/800/600",
    imageWidth: 800,
    imageHeight: 600,
    annotations: [
      { kind: "circle", id: "region-1", cx: 320, cy: 280, r: 45, color: "#ef4444", label: "Opacity - Left Upper Lobe", strokeWidth: 2 },
      { kind: "circle", id: "region-2", cx: 520, cy: 320, r: 35, color: "#f59e0b", label: "Calcification", strokeWidth: 2 },
      { kind: "rect", id: "area-1", x: 200, y: 380, width: 180, height: 120, color: "#3b82f6", label: "Costophrenic Angle", strokeWidth: 2 },
      { kind: "text", id: "label-1", x: 30, y: 30, text: "PA View - Upright", color: "#e2e8f0", fontSize: 16 },
      { kind: "text", id: "label-2", x: 30, y: 560, text: "R", color: "#e2e8f0", fontSize: 24 },
    ],
  },

  calendar: {
    type: "calendar",
    version: "1.0",
    title: "Engineering Team Calendar",
    defaultDate: "2025-03-01",
    defaultView: "month",
    events: [
      { id: "sp1", title: "Sprint Planning", start: "2025-03-03T10:00:00", end: "2025-03-03T11:30:00", color: "#3b82f6", description: "Bi-weekly sprint planning for Sprint 24" },
      { id: "standup-m", title: "Daily Standup", start: "2025-03-03T09:15:00", end: "2025-03-03T09:30:00", color: "#22c55e" },
      { id: "standup-t", title: "Daily Standup", start: "2025-03-04T09:15:00", end: "2025-03-04T09:30:00", color: "#22c55e" },
      { id: "standup-w", title: "Daily Standup", start: "2025-03-05T09:15:00", end: "2025-03-05T09:30:00", color: "#22c55e" },
      { id: "retro", title: "Sprint Retro", start: "2025-03-14T15:00:00", end: "2025-03-14T16:00:00", color: "#f59e0b", description: "Sprint 23 retrospective" },
      { id: "deadline", title: "Q1 Feature Freeze", start: "2025-03-21", allDay: true, color: "#ef4444", description: "No new features after this date for Q1 release" },
      { id: "review", title: "Code Review Session", start: "2025-03-12T14:00:00", end: "2025-03-12T15:30:00", color: "#14b8a6" },
      { id: "demo", title: "Sprint Demo", start: "2025-03-14T14:00:00", end: "2025-03-14T15:00:00", color: "#f97316", description: "Sprint 23 demo to stakeholders" },
    ],
  },

  flowchart: {
    type: "flowchart",
    version: "1.0",
    title: "User Login Flow",
    direction: "TB",
    nodes: [
      { id: "start", label: "Start", shape: "ellipse", color: "#22c55e" },
      { id: "input", label: "Enter Credentials", shape: "parallelogram", color: "#8b5cf6" },
      { id: "checkUser", label: "Username Valid?", shape: "diamond", color: "#f59e0b" },
      { id: "checkPass", label: "Password Valid?", shape: "diamond", color: "#f59e0b" },
      { id: "error", label: "Show Error", shape: "rect", color: "#ef4444" },
      { id: "dashboard", label: "Load Dashboard", shape: "rect", color: "#3b82f6" },
      { id: "end", label: "End", shape: "ellipse", color: "#22c55e" },
    ],
    edges: [
      { source: "start", target: "input", label: "begin" },
      { source: "input", target: "checkUser" },
      { source: "checkUser", target: "checkPass", label: "yes" },
      { source: "checkUser", target: "error", label: "no", style: "dashed" },
      { source: "checkPass", target: "dashboard", label: "yes" },
      { source: "checkPass", target: "error", label: "no", style: "dashed" },
      { source: "dashboard", target: "end" },
      { source: "error", target: "input", label: "retry" },
    ],
  },

  funnel: {
    type: "funnel",
    version: "1.0",
    title: "Sales Conversion Funnel",
    showConversion: true,
    stages: [
      { label: "Visitors", value: 12000, color: "#3b82f6" },
      { label: "Leads", value: 5200, color: "#6366f1" },
      { label: "Qualified", value: 2800, color: "#8b5cf6" },
      { label: "Proposals", value: 1400, color: "#a855f7" },
      { label: "Closed", value: 600, color: "#c084fc" },
    ],
  },

  gantt: {
    type: "gantt",
    version: "1.0",
    title: "Software Project Plan",
    tasks: [
      { id: "design-ui", label: "UI Design", start: "2025-03-01", end: "2025-03-14", progress: 100, color: "#3b82f6", group: "Design" },
      { id: "design-api", label: "API Design", start: "2025-03-03", end: "2025-03-12", progress: 100, color: "#3b82f6", group: "Design" },
      { id: "dev-frontend", label: "Frontend Development", start: "2025-03-15", end: "2025-04-11", progress: 60, color: "#22c55e", dependencies: ["design-ui"], group: "Development" },
      { id: "dev-backend", label: "Backend Development", start: "2025-03-13", end: "2025-04-04", progress: 80, color: "#22c55e", dependencies: ["design-api"], group: "Development" },
      { id: "dev-integration", label: "Integration", start: "2025-04-05", end: "2025-04-18", progress: 20, color: "#22c55e", dependencies: ["dev-frontend", "dev-backend"], group: "Development" },
      { id: "test-unit", label: "Unit Testing", start: "2025-04-07", end: "2025-04-18", progress: 30, color: "#f59e0b", dependencies: ["dev-backend"], group: "Testing" },
      { id: "test-e2e", label: "E2E Testing", start: "2025-04-19", end: "2025-04-30", progress: 0, color: "#f59e0b", dependencies: ["dev-integration"], group: "Testing" },
      { id: "deploy-staging", label: "Deploy to Staging", start: "2025-05-01", end: "2025-05-05", progress: 0, color: "#8b5cf6", dependencies: ["test-e2e"], group: "Deployment" },
      { id: "deploy-prod", label: "Production Release", start: "2025-05-06", end: "2025-05-09", progress: 0, color: "#8b5cf6", dependencies: ["deploy-staging"], group: "Deployment" },
    ],
  },

  geostory: {
    type: "geostory",
    version: "1.0",
    title: "The Silk Road: A Journey Through Time",
    basemap: "terrain",
    steps: [
      {
        id: "sr-1",
        title: "Xi'an, China",
        text: "The ancient capital of Chang'an served as the eastern terminus of the Silk Road. From here, caravans laden with silk, spices, and precious goods would begin their arduous journey westward.",
        location: { lat: 34.26, lon: 108.94 },
        zoom: 8,
        marker: "Eastern Terminus",
      },
      {
        id: "sr-2",
        title: "Samarkand, Uzbekistan",
        text: "Known as the 'Jewel of the Silk Road,' Samarkand was a critical crossroads where Eastern and Western cultures met.",
        location: { lat: 39.65, lon: 66.96 },
        zoom: 10,
        marker: "Crossroads",
      },
      {
        id: "sr-3",
        title: "Baghdad, Iraq",
        text: "During the Islamic Golden Age, Baghdad was the intellectual capital of the world. The House of Wisdom attracted scholars from across the known world.",
        location: { lat: 33.31, lon: 44.37 },
        zoom: 9,
        marker: "House of Wisdom",
      },
      {
        id: "sr-4",
        title: "Constantinople (Istanbul), Turkey",
        text: "The gateway between East and West, Constantinople controlled the vital straits connecting the Black Sea to the Mediterranean.",
        location: { lat: 41.01, lon: 28.98 },
        zoom: 10,
        marker: "Gateway to Europe",
      },
      {
        id: "sr-5",
        title: "Venice, Italy",
        text: "The western terminus of the Silk Road, Venice grew fabulously wealthy as the primary European trading partner with the East.",
        location: { lat: 45.44, lon: 12.32 },
        zoom: 11,
        marker: "Western Terminus",
      },
    ],
  },

  globe: {
    type: "globe",
    version: "1.0",
    title: "Major World Cities",
    points: [
      { id: "nyc", lat: 40.7128, lon: -74.006, label: "New York", color: "#ef4444" },
      { id: "lon", lat: 51.5074, lon: -0.1278, label: "London", color: "#3b82f6" },
      { id: "tok", lat: 35.6762, lon: 139.6503, label: "Tokyo", color: "#f59e0b" },
      { id: "syd", lat: -33.8688, lon: 151.2093, label: "Sydney", color: "#22c55e" },
      { id: "par", lat: 48.8566, lon: 2.3522, label: "Paris", color: "#8b5cf6" },
      { id: "rio", lat: -22.9068, lon: -43.1729, label: "Rio de Janeiro", color: "#ec4899" },
      { id: "dub", lat: 25.2048, lon: 55.2708, label: "Dubai", color: "#f97316" },
      { id: "sin", lat: 1.3521, lon: 103.8198, label: "Singapore", color: "#14b8a6" },
    ],
    rotation: { lat: 20, lon: -30 },
  },

  graph: {
    type: "graph",
    version: "1.0",
    title: "Social Network",
    directed: false,
    nodes: [
      { id: "alice", label: "Alice", group: "engineering", size: 24 },
      { id: "bob", label: "Bob", group: "engineering", size: 20 },
      { id: "carol", label: "Carol", group: "engineering", size: 18 },
      { id: "dave", label: "Dave", group: "design", size: 22 },
      { id: "eve", label: "Eve", group: "design", size: 18 },
      { id: "frank", label: "Frank", group: "product", size: 20 },
      { id: "grace", label: "Grace", group: "product", size: 16 },
      { id: "heidi", label: "Heidi", group: "marketing", size: 20 },
      { id: "ivan", label: "Ivan", group: "marketing", size: 16 },
    ],
    edges: [
      { source: "alice", target: "bob", weight: 2 },
      { source: "alice", target: "carol" },
      { source: "alice", target: "dave" },
      { source: "bob", target: "carol", weight: 1.5 },
      { source: "bob", target: "frank" },
      { source: "carol", target: "eve" },
      { source: "dave", target: "eve", weight: 2 },
      { source: "dave", target: "frank" },
      { source: "frank", target: "grace" },
      { source: "frank", target: "heidi" },
      { source: "grace", target: "heidi" },
      { source: "heidi", target: "ivan", weight: 1.5 },
      { source: "ivan", target: "alice" },
    ],
  },

  investigation: {
    type: "investigation",
    version: "1.0",
    title: "Cold Case #1987-42: The Riverside Incident",
    evidence: [
      {
        id: "p1",
        label: "Marcus Webb",
        type: "person",
        description: "Last known person to see the victim. Alibi partially confirmed by workplace records.",
        tags: ["suspect", "interviewed", "alibi-partial"],
        metadata: { age: "42", occupation: "Warehouse manager", status: "Person of interest" },
      },
      {
        id: "p2",
        label: "Elena Torres",
        type: "person",
        description: "Neighbor who reported unusual activity on the night in question.",
        tags: ["witness", "cooperative"],
        metadata: { relation: "Neighbor", interviewed: "2024-03-15" },
      },
      {
        id: "d1",
        label: "Phone Records",
        type: "document",
        description: "Call logs from the evening of March 12th showing three calls to an unregistered number.",
        tags: ["forensic", "digital", "key-evidence"],
        metadata: { source: "Subpoena", pages: "47" },
      },
      {
        id: "d2",
        label: "Autopsy Report",
        type: "document",
        description: "Official medical examiner report. Cause of death: blunt force trauma.",
        tags: ["forensic", "official"],
        metadata: { examiner: "Dr. R. Patel", date: "2024-03-14" },
      },
      {
        id: "l1",
        label: "Riverside Park",
        type: "location",
        description: "Location where the victim was found. Evidence of a struggle near the eastern entrance.",
        tags: ["crime-scene", "processed"],
      },
      {
        id: "ev1",
        label: "Security Camera Footage",
        type: "event",
        description: "CCTV from nearby convenience store shows an unidentified figure at 11:47pm heading toward the park.",
        tags: ["digital", "key-evidence", "unresolved"],
      },
      {
        id: "o1",
        label: "Blue Fiber Sample",
        type: "object",
        description: "Synthetic fiber recovered from the scene. Matches common work uniforms. Pending DNA analysis.",
        tags: ["forensic", "pending"],
        metadata: { material: "Polyester blend", lab: "State Crime Lab" },
      },
    ],
    connections: [
      { from: "p1", to: "l1", label: "frequented area", strength: "medium" },
      { from: "p1", to: "d1", label: "phone owner", strength: "strong" },
      { from: "p1", to: "o1", label: "matching uniform", strength: "weak" },
      { from: "p2", to: "l1", label: "lives nearby", strength: "strong" },
      { from: "ev1", to: "l1", label: "near location", strength: "strong" },
      { from: "d2", to: "l1", label: "found at", strength: "strong" },
      { from: "o1", to: "l1", label: "recovered from", strength: "strong" },
    ],
    notes: "Priority: obtain DNA results from blue fiber sample. Cross-reference unregistered phone number with known associates.",
  },

  neural: {
    type: "neural",
    version: "1.0",
    title: "MNIST Digit Classifier",
    layers: [
      { name: "Input", type: "input", units: 784 },
      { name: "Hidden 1", type: "dense", units: 128 },
      { name: "Hidden 2", type: "dense", units: 64 },
      { name: "Output", type: "output", units: 10 },
    ],
  },

  notebook: {
    type: "notebook",
    version: "1.0",
    title: "Sales Analysis Q4 2024",
    cells: [
      {
        cellType: "markdown",
        source: "# Sales Analysis Q4 2024\nThis notebook analyzes quarterly sales data across all regions.",
      },
      {
        cellType: "table",
        columns: ["Region", "Q3", "Q4", "Growth"],
        rows: [
          ["North", "$1.2M", "$1.48M", "+23%"],
          ["South", "$890K", "$845K", "-5%"],
          ["East", "$1.05M", "$1.15M", "+9.5%"],
          ["West", "$760K", "$920K", "+21%"],
        ],
        caption: "Regional sales comparison Q3 vs Q4 2024",
      },
      {
        cellType: "markdown",
        source: "## Key Findings\n- North region grew by **23%**, driven by enterprise deals\n- South region declined by 5%, primarily due to seasonal effects\n- West region showed strong recovery with **21% growth**",
      },
      {
        cellType: "code",
        language: "python",
        source: "import pandas as pd\n\ndf = pd.read_csv('sales_q4.csv')\nsummary = df.groupby('region')['revenue'].agg(['sum', 'mean'])\nprint(summary.to_string())",
        output: "         sum      mean\nregion                   \nEast   1150000  287500.0\nNorth  1480000  370000.0\nSouth   845000  211250.0\nWest    920000  230000.0",
      },
    ],
  },

  sankey: {
    type: "sankey",
    version: "1.0",
    title: "Energy Flow",
    nodes: [
      { id: "solar", label: "Solar", color: "#f59e0b" },
      { id: "wind", label: "Wind", color: "#06b6d4" },
      { id: "gas", label: "Natural Gas", color: "#ef4444" },
      { id: "electricity", label: "Electricity", color: "#3b82f6" },
      { id: "heat", label: "Heat", color: "#f97316" },
      { id: "residential", label: "Residential", color: "#22c55e" },
      { id: "commercial", label: "Commercial", color: "#8b5cf6" },
      { id: "industrial", label: "Industrial", color: "#6366f1" },
    ],
    links: [
      { source: "solar", target: "electricity", value: 120 },
      { source: "solar", target: "heat", value: 30 },
      { source: "wind", target: "electricity", value: 80 },
      { source: "gas", target: "electricity", value: 150 },
      { source: "gas", target: "heat", value: 100 },
      { source: "electricity", target: "residential", value: 140 },
      { source: "electricity", target: "commercial", value: 120 },
      { source: "electricity", target: "industrial", value: 90 },
      { source: "heat", target: "residential", value: 60 },
      { source: "heat", target: "commercial", value: 40 },
      { source: "heat", target: "industrial", value: 30 },
    ],
  },

  slides: {
    type: "slides",
    version: "1.0",
    title: "Introduction to WebAssembly",
    transition: "slide",
    slides: [
      {
        title: "What is WebAssembly?",
        content: "WebAssembly (Wasm) is a binary instruction format for a stack-based virtual machine.\n\nIt is designed as a portable compilation target for programming languages, enabling deployment on the web for client and server applications.",
        layout: "center",
      },
      {
        title: "Key Benefits",
        content: "Near-native performance \u2014 compiled binary format runs at near-native speed.\n\nLanguage agnostic \u2014 compile from C, C++, Rust, Go, and more.\n\nSecure sandbox \u2014 runs in a memory-safe, sandboxed execution environment.\n\nWeb standard \u2014 supported by all major browsers since 2017.",
        layout: "default",
      },
      {
        title: "Use Cases",
        content: "Gaming and multimedia applications\n\nImage and video processing\n\nScientific simulations\n\nCryptography and blockchain\n\nServer-side computing with WASI",
        layout: "default",
      },
      {
        title: "Thank You",
        content: "Questions?\n\nResources: webassembly.org | MDN Web Docs | wasmtime.dev",
        layout: "center",
      },
    ],
  },

  swimlane: {
    type: "swimlane",
    version: "1.0",
    title: "Software Delivery Pipeline",
    lanes: [
      { id: "design", label: "Design", color: "#8b5cf6" },
      { id: "dev", label: "Development", color: "#3b82f6" },
      { id: "qa", label: "QA", color: "#f59e0b" },
      { id: "ops", label: "Ops", color: "#10b981" },
    ],
    columns: [
      { id: "backlog", label: "Backlog" },
      { id: "in-progress", label: "In Progress" },
      { id: "review", label: "Review" },
      { id: "done", label: "Done" },
    ],
    activities: [
      { id: "a1", laneId: "design", columnId: "backlog", label: "Create wireframes", description: "Dashboard layout wireframes for v2 redesign", status: "pending" },
      { id: "a2", laneId: "design", columnId: "in-progress", label: "Design system tokens", description: "Define spacing, color, and typography tokens", status: "active" },
      { id: "a3", laneId: "design", columnId: "done", label: "Logo refresh", status: "completed" },
      { id: "a4", laneId: "dev", columnId: "in-progress", label: "Implement auth flow", description: "OAuth2 PKCE flow for SPA clients", status: "active" },
      { id: "a5", laneId: "dev", columnId: "review", label: "API rate limiting", description: "Sliding window rate limiter for public endpoints", status: "active" },
      { id: "a6", laneId: "dev", columnId: "backlog", label: "Migrate to Node 22", status: "pending" },
      { id: "a7", laneId: "qa", columnId: "in-progress", label: "E2E test suite", description: "Playwright tests for critical user journeys", status: "active" },
      { id: "a8", laneId: "qa", columnId: "backlog", label: "Load testing", description: "Simulate 10k concurrent users", status: "blocked" },
      { id: "a9", laneId: "ops", columnId: "done", label: "Set up CI/CD", status: "completed" },
      { id: "a10", laneId: "ops", columnId: "in-progress", label: "Configure monitoring", description: "Grafana dashboards and PagerDuty alerts", status: "active" },
    ],
  },

  threed: {
    type: "threed",
    version: "1.0",
    title: "All Geometry Types",
    objects: [
      { id: "box", geometry: "box", position: [-3, 0, 0], color: "#3b82f6", label: "Box" },
      { id: "sphere", geometry: "sphere", position: [0, 0, -2], color: "#22c55e", label: "Sphere" },
      { id: "cylinder", geometry: "cylinder", position: [3, 0, 0], color: "#f59e0b", label: "Cylinder" },
      { id: "cone", geometry: "cone", position: [-1.5, 0, 3], color: "#ef4444", label: "Cone" },
      { id: "torus", geometry: "torus", position: [2, 0, 3], color: "#8b5cf6", label: "Torus" },
    ],
  },

  wizard: {
    type: "wizard",
    version: "1.0",
    title: "Account Setup",
    steps: [
      {
        id: "basics",
        title: "Basic Info",
        fields: {
          name: { type: "string", title: "Full Name" },
          email: { type: "string", title: "Email" },
        },
        required: ["name", "email"],
      },
      {
        id: "prefs",
        title: "Preferences",
        fields: {
          theme: { type: "string", title: "Theme", enum: ["light", "dark", "auto"], widget: "radio" },
          notifications: { type: "boolean", title: "Enable notifications" },
        },
      },
      {
        id: "confirm",
        title: "Confirmation",
        fields: {
          notes: { type: "string", title: "Additional notes", widget: "textarea" },
        },
      },
    ],
    submitTool: "create_account",
    submitLabel: "Create Account",
    allowNavigation: true,
  },

  transcript: {
    type: "transcript",
    version: "1.0",
    title: "Product Design Meeting",
    speakers: [
      { id: "alice", name: "Alice Chen", role: "Product Manager", color: "#3b82f6" },
      { id: "bob", name: "Bob Park", role: "Engineer", color: "#ef4444" },
      { id: "carol", name: "Carol Wu", role: "Designer", color: "#22c55e" },
    ],
    entries: [
      { id: "1", speaker: "alice", text: "Let's kick off the design review. We have three items on the agenda today.", timestamp: "0" },
      { id: "2", speaker: "bob", text: "Before we start, I wanted to flag a technical constraint with the new layout engine.", timestamp: "15" },
      { id: "3", speaker: "carol", text: "That's a good point. I've prepared two alternative mockups that work within those constraints.", timestamp: "45" },
      { id: "4", speaker: "alice", text: "Great, let's look at both options. Carol, can you walk us through them?", timestamp: "60" },
      { id: "5", speaker: "carol", text: "Sure. Option A keeps the sidebar but reduces it to 240px. Option B replaces it with a collapsible drawer.", timestamp: "90" },
      { id: "6", speaker: "bob", text: "Option B would be easier to implement and gives us better mobile support out of the box.", timestamp: "120" },
    ],
    searchable: true,
    showTimestamps: true,
  },

  font: {
    type: "font",
    version: "1.0",
    title: "Inter",
    fontFamily: "Inter, sans-serif",
    specimens: [
      { text: "The quick brown fox jumps over the lazy dog", size: 32, weight: 700 },
      { text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", size: 24, weight: 400 },
      { text: "abcdefghijklmnopqrstuvwxyz 0123456789", size: 24, weight: 400 },
      { text: "!@#$%^&*()_+-=[]{}|;':\",./<>?", size: 18, weight: 300 },
    ],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },

  shader: {
    type: "shader",
    version: "1.0",
    title: "UV Gradient",
    description: "A simple fragment shader showing UV coordinate visualization",
    fragmentShader: `precision mediump float;
uniform vec2 iResolution;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution;
    gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5 * sin(uv.x * 6.28), 1.0);
}`,
    width: 512,
    height: 512,
    animate: false,
  },
};

/**
 * Named sample datasets per view.
 * The "Default" key maps to the existing single sample above.
 * Additional named datasets can be added per view for the dataset switcher.
 */
export const namedSamples: Record<ViewType, Record<string, object>> =
  Object.fromEntries(
    VIEW_TYPES.map((v) => [v, { Default: samples[v] }]),
  ) as unknown as Record<ViewType, Record<string, object>>;

// Add extra named datasets for key demo views
namedSamples.counter["Minimal"] = {
  type: "counter",
  version: "1.0",
  value: 42,
  label: "Active Users",
};

namedSamples.counter["Error State"] = {
  type: "counter",
  version: "1.0",
  value: 3,
  label: "Failed Jobs",
  delta: { value: -200, label: "vs yesterday" },
  color: "danger",
};

namedSamples.datatable["Empty Table"] = {
  type: "datatable",
  version: "1.0",
  title: "No Results",
  columns: [
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
  ],
  rows: [],
};

namedSamples.chart["Line Chart"] = {
  type: "chart",
  version: "1.0",
  chartType: "line",
  data: [
    { label: "Jan", values: [10] },
    { label: "Feb", values: [25] },
    { label: "Mar", values: [18] },
    { label: "Apr", values: [32] },
    { label: "May", values: [28] },
    { label: "Jun", values: [45] },
  ],
  datasets: [{ label: "Revenue ($k)" }],
};

namedSamples.chart["Pie Chart"] = {
  type: "chart",
  version: "1.0",
  chartType: "pie",
  data: [
    { label: "Chrome", values: [65] },
    { label: "Safari", values: [19] },
    { label: "Firefox", values: [10] },
    { label: "Other", values: [6] },
  ],
  datasets: [{ label: "Browser Share" }],
};

namedSamples.timeline["Minimal"] = {
  type: "timeline",
  version: "1.0",
  events: [
    { date: "2024-01-15", title: "Project Started" },
    { date: "2024-06-01", title: "Beta Release" },
    { date: "2024-12-01", title: "GA Launch" },
  ],
};
