/**
 * curated.ts
 *
 * Hand-picked full sample data for 12 representative views.
 * Each entry matches the first story in the corresponding
 * apps/<view>/src/*.stories.tsx file.
 */

export const CURATED_FIXTURES: Record<string, object> = {
  // ── Canvas ─────────────────────────────────────────────────────────
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
          { x: 5.1, y: 3.5 },
          { x: 4.9, y: 3.0 },
          { x: 4.7, y: 3.2 },
          { x: 4.6, y: 3.1 },
          { x: 5.0, y: 3.6 },
          { x: 5.4, y: 3.9 },
          { x: 4.6, y: 3.4 },
          { x: 5.0, y: 3.4 },
          { x: 4.4, y: 2.9 },
          { x: 4.9, y: 3.1 },
        ],
      },
      {
        label: "Versicolor",
        color: "#ff6384",
        pointStyle: "triangle",
        points: [
          { x: 7.0, y: 3.2 },
          { x: 6.4, y: 3.2 },
          { x: 6.9, y: 3.1 },
          { x: 5.5, y: 2.3 },
          { x: 6.5, y: 2.8 },
          { x: 5.7, y: 2.8 },
          { x: 6.3, y: 3.3 },
          { x: 4.9, y: 2.4 },
          { x: 6.6, y: 2.9 },
          { x: 5.2, y: 2.7 },
        ],
      },
      {
        label: "Virginica",
        color: "#4bc0c0",
        pointStyle: "rect",
        points: [
          { x: 6.3, y: 3.3 },
          { x: 5.8, y: 2.7 },
          { x: 7.1, y: 3.0 },
          { x: 6.3, y: 2.9 },
          { x: 6.5, y: 3.0 },
          { x: 7.6, y: 3.0 },
          { x: 4.9, y: 2.5 },
          { x: 7.3, y: 2.9 },
          { x: 6.7, y: 2.5 },
          { x: 7.2, y: 3.6 },
        ],
      },
    ],
    xAxis: { label: "Sepal Length (cm)" },
    yAxis: { label: "Sepal Width (cm)" },
    legend: { position: "top" },
  },

  // ── Text ───────────────────────────────────────────────────────────
  markdown: {
    type: "markdown",
    version: "1.0",
    title: "Getting Started",
    content: `# Welcome to the Project

This is an introduction to our documentation. Here you will find everything you need to get started.

## Overview

The platform provides a **powerful** set of tools for building *interactive* applications. It combines modern technologies with an intuitive interface.

### Key Features

This section covers the most important features of the platform. Each feature is designed to improve your workflow and productivity.

## Next Steps

Read on to learn more about configuration, deployment, and best practices. We recommend starting with the installation guide below.`,
  },

  code: {
    type: "code",
    version: "1.0",
    code: `import { useView, Fallback } from "@chuk/view-shared";
import type { CounterContent } from "./schema";

export function CounterView() {
  const { data, content, isConnected } =
    useView<CounterContent>("counter", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <CounterRenderer data={data} />;
}`,
    language: "typescript",
    title: "CounterView.tsx",
    lineNumbers: true,
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

  // ── Interactive (callTool) ─────────────────────────────────────────
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

  // ── Simple ─────────────────────────────────────────────────────────
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
    controls: {
      zoom: true,
      fullscreen: true,
      thumbnails: false,
    },
  },

  // ── Data ───────────────────────────────────────────────────────────
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
    actions: [
      {
        label: "Edit",
        tool: "edit_user",
        arguments: { id: "{{id}}", name: "{{name}}" },
      },
      {
        label: "Delete",
        tool: "delete_user",
        arguments: { id: "{{id}}" },
        confirm: "Are you sure you want to delete this user?",
      },
    ],
  },

  // ── Layout ─────────────────────────────────────────────────────────
  dashboard: {
    type: "dashboard",
    version: "1.0",
    title: "Sample Dashboard",
    layout: "grid",
    gap: "8px",
    panels: [
      { id: "p1", label: "Panel 1", viewUrl: "about:blank", structuredContent: {}, width: "50%", height: "50%" },
      { id: "p2", label: "Panel 2", viewUrl: "about:blank", structuredContent: {}, width: "50%", height: "50%" },
      { id: "p3", label: "Panel 3", viewUrl: "about:blank", structuredContent: {}, width: "50%", height: "50%" },
      { id: "p4", label: "Panel 4", viewUrl: "about:blank", structuredContent: {}, width: "50%", height: "50%" },
    ],
  },

  // ── Phase 6 Advanced ────────────────────────────────────────────────
  wizard: {
    type: "wizard",
    version: "1.0",
    title: "Setup Wizard",
    steps: [
      {
        id: "step1",
        title: "Your Name",
        fields: {
          name: { type: "string", title: "Full Name" },
        },
        required: ["name"],
      },
      {
        id: "step2",
        title: "Preferences",
        fields: {
          color: { type: "string", title: "Favorite Color", enum: ["red", "blue", "green"], widget: "radio" },
        },
      },
    ],
    submitTool: "finish_wizard",
    submitLabel: "Finish",
  },

  transcript: {
    type: "transcript",
    version: "1.0",
    title: "Interview",
    speakers: [
      { id: "host", name: "Host", color: "#3b82f6" },
      { id: "guest", name: "Guest", color: "#ef4444" },
    ],
    entries: [
      { id: "1", speaker: "host", text: "Welcome to the show. Tell us about yourself.", timestamp: "0" },
      { id: "2", speaker: "guest", text: "Thanks for having me. I work in software engineering.", timestamp: "15" },
      { id: "3", speaker: "host", text: "What are you most excited about right now?", timestamp: "30" },
      { id: "4", speaker: "guest", text: "The intersection of AI and developer tools. It's transforming how we build software.", timestamp: "45" },
    ],
    searchable: true,
    showTimestamps: true,
  },

  shader: {
    type: "shader",
    version: "1.0",
    title: "Color Gradient",
    fragmentShader: "precision mediump float;\\nuniform vec2 iResolution;\\nvoid main() {\\n    vec2 uv = gl_FragCoord.xy / iResolution;\\n    gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);\\n}",
    width: 256,
    height: 256,
    animate: false,
  },
};
