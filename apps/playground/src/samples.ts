export const VIEW_TYPES = [
  "chart",
  "code",
  "confirm",
  "counter",
  "dashboard",
  "datatable",
  "detail",
  "form",
  "json",
  "map",
  "markdown",
  "pdf",
  "progress",
  "split",
  "status",
  "tabs",
  "video",
] as const;

export type ViewType = (typeof VIEW_TYPES)[number];

export const samples: Record<ViewType, object> = {
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

  code: {
    type: "code",
    version: "1.0",
    code: 'import { useView, Fallback } from "@chuk/view-shared";\nimport type { CounterContent } from "./schema";\n\nexport function CounterView() {\n  const { data, content, isConnected } =\n    useView<CounterContent>("counter", "1.0");\n\n  if (!isConnected) return <Fallback message="Connecting..." />;\n  if (!data) return <Fallback content={content ?? undefined} />;\n\n  return <CounterRenderer data={data} />;\n}',
    language: "typescript",
    title: "CounterView.tsx",
    lineNumbers: true,
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
      {
        id: "1",
        name: "Alice Johnson",
        status: "Active",
        score: 92,
        active: true,
      },
      {
        id: "2",
        name: "Bob Smith",
        status: "Inactive",
        score: 67,
        active: false,
      },
      {
        id: "3",
        name: "Carol White",
        status: "Pending",
        score: 85,
        active: true,
      },
      {
        id: "4",
        name: "David Brown",
        status: "Active",
        score: 74,
        active: true,
      },
      {
        id: "5",
        name: "Eve Davis",
        status: "Inactive",
        score: 58,
        active: false,
      },
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
      {
        label: "Edit Profile",
        tool: "edit_user",
        args: { id: "usr_123" },
      },
      {
        label: "Send Message",
        tool: "send_message",
        args: { to: "usr_123" },
      },
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

  json: {
    type: "json",
    version: "1.0",
    title: "API Response",
    data: {
      status: 200,
      data: {
        users: [
          {
            id: 1,
            name: "Alice Johnson",
            email: "alice@example.com",
            active: true,
          },
          {
            id: 2,
            name: "Bob Smith",
            email: "bob@example.com",
            active: false,
          },
          {
            id: 3,
            name: "Carol White",
            email: "carol@example.com",
            active: true,
          },
        ],
        pagination: { page: 1, perPage: 25, total: 3 },
      },
      meta: { requestId: "req_abc123", duration: 45 },
    },
    expandDepth: 2,
    searchable: true,
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
              properties: {
                name: "Tower of London",
                category: "Historical",
              },
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

  progress: {
    type: "progress",
    version: "1.0",
    title: "Build Pipeline",
    overall: 65,
    tracks: [
      {
        id: "lint",
        label: "Lint",
        value: 100,
        max: 100,
        status: "complete",
        detail: "No issues found",
      },
      {
        id: "compile",
        label: "Compile",
        value: 100,
        max: 100,
        status: "complete",
        detail: "Done in 2.3s",
      },
      {
        id: "test",
        label: "Test",
        value: 45,
        max: 100,
        status: "active",
        detail: "Running suite 3 of 7...",
      },
      {
        id: "deploy",
        label: "Deploy",
        value: 0,
        max: 100,
        status: "pending",
      },
    ],
  },

  split: {
    type: "split",
    version: "1.0",
    direction: "horizontal",
    ratio: "60:40",
    left: {
      label: "Left Panel",
      viewUrl: "about:blank",
      structuredContent: {},
    },
    right: {
      label: "Right Panel",
      viewUrl: "about:blank",
      structuredContent: {},
    },
  },

  status: {
    type: "status",
    version: "1.0",
    title: "Production Systems",
    items: [
      {
        id: "api",
        label: "API Server",
        status: "ok",
        detail: "Response time: 45ms",
        lastChecked: "2 min ago",
      },
      {
        id: "db",
        label: "Database",
        status: "ok",
        detail: "Connections: 12/100",
        lastChecked: "1 min ago",
      },
      {
        id: "cache",
        label: "Redis Cache",
        status: "ok",
        detail: "Memory: 256MB/1GB",
        lastChecked: "30s ago",
      },
      {
        id: "cdn",
        label: "CDN",
        status: "ok",
        detail: "Hit rate: 98.5%",
        lastChecked: "5 min ago",
        url: "https://cdn.example.com",
      },
      {
        id: "queue",
        label: "Message Queue",
        status: "ok",
        detail: "0 messages pending",
        lastChecked: "1 min ago",
      },
    ],
  },

  tabs: {
    type: "tabs",
    version: "1.0",
    activeTab: "tab1",
    tabs: [
      {
        id: "tab1",
        label: "Overview",
        viewUrl: "about:blank",
        structuredContent: {},
      },
      {
        id: "tab2",
        label: "Details",
        viewUrl: "about:blank",
        structuredContent: {},
      },
      {
        id: "tab3",
        label: "Settings",
        viewUrl: "about:blank",
        structuredContent: {},
      },
    ],
  },

  video: {
    type: "video",
    version: "1.0",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Sample Video",
  },
};
