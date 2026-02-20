import type { Meta, StoryObj } from "@storybook/react";
import { Dashboard, DashboardV2 } from "./App";
import { ViewBusProvider } from "@chuk/view-shared";

// ── v1.0 stories ─────────────────────────────────────────────────

const meta = {
  title: "Views/Dashboard",
  component: Dashboard,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <ViewBusProvider><div style={{ height: "600px" }}><Story /></div></ViewBusProvider>],
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FourPanelGrid: Story = {
  args: {
    data: {
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
  },
};

// ── v2.0 stories ─────────────────────────────────────────────────

const v2Meta = {
  title: "Views/Dashboard V2",
  component: DashboardV2,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <ViewBusProvider><div style={{ height: "600px" }}><Story /></div></ViewBusProvider>],
} satisfies Meta<typeof DashboardV2>;

type StoryV2 = StoryObj<typeof v2Meta>;

export const AutoLayoutTwoPanels: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "Two Panel Auto Layout",
      layout: "auto",
      panels: [
        { id: "map", label: "Map", viewType: "map", structuredContent: { type: "map", version: "1.0", layers: [] } },
        { id: "table", label: "Results", viewType: "datatable", structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] } },
      ],
    },
  },
};

export const AutoLayoutKpiStrip: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "KPI Dashboard",
      layout: "auto",
      panels: [
        { id: "c1", label: "Users", viewType: "counter", structuredContent: {} },
        { id: "c2", label: "Revenue", viewType: "counter", structuredContent: {} },
        { id: "c3", label: "Uptime", viewType: "gauge", structuredContent: {} },
        { id: "chart", label: "Trend", viewType: "chart", structuredContent: {} },
      ],
    },
  },
};

export const TabLayout: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "Tabbed Dashboard",
      layout: "tabs",
      panels: [
        { id: "overview", label: "Overview", viewType: "chart", structuredContent: {} },
        { id: "details", label: "Details", viewType: "datatable", structuredContent: {} },
        { id: "settings", label: "Settings", viewType: "form", structuredContent: {} },
      ],
    },
  },
};

export const GridObjectLayout: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "3-Column Grid",
      layout: { type: "grid", columns: 3 },
      gap: "12px",
      panels: [
        { id: "p1", label: "Chart 1", viewType: "chart", structuredContent: {} },
        { id: "p2", label: "Chart 2", viewType: "chart", structuredContent: {} },
        { id: "p3", label: "Chart 3", viewType: "chart", structuredContent: {} },
        { id: "p4", label: "Table", viewType: "datatable", structuredContent: {} },
        { id: "p5", label: "Map", viewType: "map", structuredContent: {} },
        { id: "p6", label: "Form", viewType: "form", structuredContent: {} },
      ],
    },
  },
};

export const NamedPresetInvestigation: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "Investigation Board",
      layout: { type: "named", preset: "investigation" },
      panels: [
        { id: "map", label: "Map", viewType: "map", structuredContent: { type: "map", version: "1.0", layers: [] } },
        { id: "table", label: "Monuments", viewType: "datatable", structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] } },
        { id: "detail", label: "Detail", viewType: "detail", structuredContent: {} },
      ],
    },
  },
};

export const NamedPresetMapSidebar: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "Map with Sidebar",
      layout: { type: "named", preset: "map-sidebar" },
      panels: [
        { id: "map", label: "Map", viewType: "map", structuredContent: {} },
        { id: "list", label: "Results", viewType: "datatable", structuredContent: {} },
      ],
    },
  },
};

export const NamedPresetDashboardKpi: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "KPI Dashboard",
      layout: { type: "named", preset: "dashboard-kpi" },
      panels: [
        { id: "c1", label: "Users", viewType: "counter", structuredContent: {} },
        { id: "c2", label: "Revenue", viewType: "counter", structuredContent: {} },
        { id: "c3", label: "Growth", viewType: "gauge", structuredContent: {} },
        { id: "chart", label: "Trend Chart", viewType: "chart", structuredContent: {} },
      ],
    },
  },
};

export const NamedPresetCompare: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "Side by Side Compare",
      layout: { type: "named", preset: "compare" },
      panels: [
        { id: "left", label: "Before", viewType: "image", structuredContent: {} },
        { id: "right", label: "After", viewType: "image", structuredContent: {} },
      ],
    },
  },
};

export const NamedPresetReport: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "Heritage Report",
      layout: { type: "named", preset: "report" },
      panels: [
        { id: "summary", label: "Summary", viewType: "markdown", structuredContent: {} },
        { id: "data", label: "Data Table", viewType: "datatable", structuredContent: {} },
        { id: "chart", label: "Visualization", viewType: "chart", structuredContent: {} },
      ],
    },
  },
};

export const WithCrossViewLinks: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "Linked Panels",
      layout: "auto",
      panels: [
        { id: "map", label: "Map", viewType: "map", structuredContent: {}, selectionField: "feature_id" },
        { id: "table", label: "Results", viewType: "datatable", structuredContent: {}, selectionField: "id" },
      ],
      links: [
        { source: "map", target: "table", type: "selection", sourceField: "feature_id", targetField: "id", bidirectional: true },
      ],
    },
  },
};

export const WithCollapsedPanel: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "Collapsed Panel Demo",
      layout: "auto",
      panels: [
        { id: "main", label: "Main View", viewType: "chart", structuredContent: {} },
        { id: "hidden", label: "Advanced Settings", viewType: "form", structuredContent: {}, collapsed: true },
      ],
    },
  },
};

export const WithShowWhen: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "Conditional Panel",
      layout: "auto",
      panels: [
        { id: "map", label: "Map", viewType: "map", structuredContent: {} },
        { id: "detail", label: "Feature Detail", viewType: "detail", structuredContent: {}, showWhen: { linkedPanelHasSelection: "map" } },
      ],
    },
  },
};

export const SplitVerticalV2: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "Vertical Split",
      layout: "split-vertical",
      panels: [
        { id: "top", label: "Summary", viewType: "markdown", structuredContent: {} },
        { id: "bottom", label: "Data", viewType: "datatable", structuredContent: {} },
      ],
    },
  },
};

export const CustomViewRegistry: StoryV2 = {
  render: (args) => <ViewBusProvider><div style={{ height: "600px" }}><DashboardV2 {...args} /></div></ViewBusProvider>,
  args: {
    data: {
      type: "dashboard",
      version: "2.0",
      title: "Custom Registry",
      layout: "auto",
      panels: [
        { id: "custom", label: "Custom View", viewType: "custom-widget", structuredContent: {} },
      ],
      viewRegistry: { "custom-widget": "about:blank" },
    },
  },
};

// ── Sprint 5b/5c: v3.0 Runtime stories ─────────────────────────────

const codeBlockStyle: React.CSSProperties = {
  background: "#1e1e2e",
  color: "#cdd6f4",
  padding: "16px",
  borderRadius: "8px",
  fontFamily: "'Fira Code', 'Consolas', monospace",
  fontSize: "13px",
  lineHeight: 1.6,
  overflow: "auto",
  whiteSpace: "pre",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#89b4fa",
  marginBottom: "8px",
  fontFamily: "system-ui, sans-serif",
};

const containerStyle: React.CSSProperties = {
  padding: "24px",
  fontFamily: "system-ui, sans-serif",
  maxWidth: "720px",
};

const noteStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#6c7086",
  marginTop: "12px",
  fontStyle: "italic",
  fontFamily: "system-ui, sans-serif",
};

const runtimeMeta = {
  title: "Views/Dashboard Runtime",
  component: (props: { children?: React.ReactNode }) => <div>{props.children}</div>,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<any>;

type RuntimeStory = StoryObj<typeof runtimeMeta>;

// ── 1. PatchAddPanel ────────────────────────────────────────────────

export const PatchAddPanel: RuntimeStory = {
  render: () => (
    <div style={containerStyle}>
      <h2 style={{ margin: "0 0 4px", fontFamily: "system-ui, sans-serif" }}>ui_patch: add-panel</h2>
      <p style={{ color: "#a6adc8", fontSize: "13px", marginTop: 0 }}>
        The LLM emits a <code>ui_patch</code> tool-call to mutate the dashboard at runtime.
        Below is the data shape for an <strong>add-panel</strong> operation applied to an
        existing v2.0 dashboard state.
      </p>
      <div style={{ marginBottom: "16px" }}>
        <div style={sectionTitleStyle}>Initial dashboard state (v2.0)</div>
        <pre style={codeBlockStyle}>{JSON.stringify({
          type: "dashboard",
          version: "2.0",
          title: "Investigation Board",
          layout: { type: "named", preset: "investigation" },
          panels: [
            { id: "map", label: "Map", viewType: "map" },
            { id: "table", label: "Monuments", viewType: "datatable" },
          ],
        }, null, 2)}</pre>
      </div>
      <div>
        <div style={sectionTitleStyle}>UIPatch (add-panel)</div>
        <pre style={codeBlockStyle}>{JSON.stringify({
          type: "ui_patch",
          version: "1.0",
          ops: [
            {
              op: "add-panel",
              panel: {
                id: "detail",
                label: "Feature Detail",
                viewType: "detail",
                structuredContent: {},
              },
              after: "table",
            },
          ],
        }, null, 2)}</pre>
      </div>
      <p style={noteStyle}>
        PatchEngine validates the op, inserts the panel after "table", and triggers a
        re-render via StateEmitter.
      </p>
    </div>
  ),
};

// ── 2. PatchUpdatePanel ─────────────────────────────────────────────

export const PatchUpdatePanel: RuntimeStory = {
  render: () => (
    <div style={containerStyle}>
      <h2 style={{ margin: "0 0 4px", fontFamily: "system-ui, sans-serif" }}>ui_patch: update-panel</h2>
      <p style={{ color: "#a6adc8", fontSize: "13px", marginTop: 0 }}>
        The <strong>update-panel</strong> operation performs a shallow merge on an existing
        panel's properties. Only the fields specified in <code>patch</code> are changed;
        everything else is preserved.
      </p>
      <div style={{ marginBottom: "16px" }}>
        <div style={sectionTitleStyle}>Panel before patch</div>
        <pre style={codeBlockStyle}>{JSON.stringify({
          id: "table",
          label: "Monuments",
          viewType: "datatable",
          structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] },
        }, null, 2)}</pre>
      </div>
      <div>
        <div style={sectionTitleStyle}>UIPatch (update-panel)</div>
        <pre style={codeBlockStyle}>{JSON.stringify({
          type: "ui_patch",
          version: "1.0",
          ops: [
            {
              op: "update-panel",
              id: "table",
              patch: {
                label: "Listed Buildings",
                structuredContent: {
                  type: "datatable",
                  version: "1.0",
                  columns: [
                    { key: "name", label: "Name" },
                    { key: "grade", label: "Grade" },
                    { key: "date", label: "Date Listed" },
                  ],
                  rows: [
                    { name: "St Mary's Church", grade: "I", date: "1952-03-14" },
                    { name: "Old Rectory", grade: "II*", date: "1967-08-22" },
                  ],
                },
              },
            },
          ],
        }, null, 2)}</pre>
      </div>
      <p style={noteStyle}>
        The merge keeps id, viewType, and any other unmentioned fields intact.
      </p>
    </div>
  ),
};

// ── 3. PatchMultiOp ─────────────────────────────────────────────────

export const PatchMultiOp: RuntimeStory = {
  render: () => (
    <div style={containerStyle}>
      <h2 style={{ margin: "0 0 4px", fontFamily: "system-ui, sans-serif" }}>ui_patch: multi-op batch</h2>
      <p style={{ color: "#a6adc8", fontSize: "13px", marginTop: 0 }}>
        A single <code>ui_patch</code> can contain multiple operations that are applied
        atomically. This example adds a cross-view link and sets loading state on a panel
        in one batch.
      </p>
      <div>
        <div style={sectionTitleStyle}>UIPatch (multi-op)</div>
        <pre style={codeBlockStyle}>{JSON.stringify({
          type: "ui_patch",
          version: "1.0",
          ops: [
            {
              op: "add-link",
              link: {
                source: "map",
                target: "table",
                type: "selection",
                sourceField: "feature_id",
                targetField: "id",
                bidirectional: true,
              },
            },
            {
              op: "set-loading",
              id: "table",
              loading: true,
              message: "Fetching listed buildings in view extent\u2026",
            },
          ],
        }, null, 2)}</pre>
      </div>
      <p style={noteStyle}>
        Ops are applied in order. If any op fails validation the entire patch is rejected
        (atomic semantics).
      </p>
    </div>
  ),
};

// ── 4. RuntimeStateOverview ─────────────────────────────────────────

const stateBoxStyle: React.CSSProperties = {
  border: "1px solid #45475a",
  borderRadius: "8px",
  padding: "12px 16px",
  marginBottom: "10px",
  background: "#1e1e2e",
};

const stateKeyStyle: React.CSSProperties = {
  color: "#f38ba8",
  fontFamily: "'Fira Code', monospace",
  fontSize: "12px",
};

const stateValStyle: React.CSSProperties = {
  color: "#a6e3a1",
  fontFamily: "'Fira Code', monospace",
  fontSize: "12px",
  marginLeft: "8px",
};

export const RuntimeStateOverview: RuntimeStory = {
  render: () => (
    <div style={containerStyle}>
      <h2 style={{ margin: "0 0 4px", fontFamily: "system-ui, sans-serif" }}>UIState shape</h2>
      <p style={{ color: "#a6adc8", fontSize: "13px", marginTop: 0 }}>
        The runtime maintains a <code>UIState</code> object that tracks every panel's
        current fingerprint, selection state, and loading status. This is the shape at
        a representative point during an investigation session.
      </p>

      {[
        { id: "map", fingerprint: "a3f7c2", selection: '{ feature_id: "MON-1042" }', loading: "false" },
        { id: "table", fingerprint: "e91b04", selection: '{ id: "MON-1042" }', loading: "false" },
        { id: "detail", fingerprint: "00d8f1", selection: "null", loading: "true" },
      ].map((panel) => (
        <div key={panel.id} style={stateBoxStyle}>
          <div style={{ marginBottom: "4px" }}>
            <span style={{ ...stateKeyStyle, color: "#89b4fa", fontWeight: 600 }}>panel</span>
            <span style={stateValStyle}>"{panel.id}"</span>
          </div>
          <div>
            <span style={stateKeyStyle}>fingerprint</span>
            <span style={stateValStyle}>{panel.fingerprint}</span>
          </div>
          <div>
            <span style={stateKeyStyle}>selection</span>
            <span style={stateValStyle}>{panel.selection}</span>
          </div>
          <div>
            <span style={stateKeyStyle}>loading</span>
            <span style={stateValStyle}>{panel.loading}</span>
          </div>
        </div>
      ))}

      <div style={sectionTitleStyle}>Global state fields</div>
      <pre style={codeBlockStyle}>{JSON.stringify({
        dashboardFingerprint: "b7ca30",
        activePanel: "map",
        pendingPatches: 0,
        lastPatchAt: "2026-02-20T14:32:01.440Z",
      }, null, 2)}</pre>

      <p style={noteStyle}>
        Fingerprints are SHA-256 truncations of structuredContent. They let the LLM
        detect stale context without re-reading full payloads.
      </p>
    </div>
  ),
};

// ── 5. EventFlowDiagram ─────────────────────────────────────────────

const flowBoxStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 18px",
  borderRadius: "8px",
  fontFamily: "'Fira Code', monospace",
  fontSize: "13px",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const arrowStyle: React.CSSProperties = {
  fontSize: "20px",
  color: "#6c7086",
  margin: "0 8px",
  fontFamily: "monospace",
};

export const EventFlowDiagram: RuntimeStory = {
  render: () => (
    <div style={{ ...containerStyle, maxWidth: "860px" }}>
      <h2 style={{ margin: "0 0 4px", fontFamily: "system-ui, sans-serif" }}>Event flow: iframe to patch</h2>
      <p style={{ color: "#a6adc8", fontSize: "13px", marginTop: 0 }}>
        When a user interacts with a panel (e.g. clicks a map feature), the event flows
        through several stages before the dashboard updates.
      </p>

      {/* Flow row */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 0", marginTop: "20px" }}>
        <span style={{ ...flowBoxStyle, background: "#1e1e2e", color: "#fab387", border: "1px solid #fab387" }}>
          iframe event
        </span>
        <span style={arrowStyle}>&rarr;</span>
        <span style={{ ...flowBoxStyle, background: "#1e1e2e", color: "#f9e2af", border: "1px solid #f9e2af" }}>
          EventQueue
        </span>
        <span style={arrowStyle}>&rarr;</span>
        <span style={{ ...flowBoxStyle, background: "#1e1e2e", color: "#a6e3a1", border: "1px solid #a6e3a1" }}>
          StateEmitter
        </span>
        <span style={arrowStyle}>&rarr;</span>
        <span style={{ ...flowBoxStyle, background: "#1e1e2e", color: "#89b4fa", border: "1px solid #89b4fa" }}>
          updateModelContext
        </span>
        <span style={arrowStyle}>&rarr;</span>
        <span style={{ ...flowBoxStyle, background: "#1e1e2e", color: "#cba6f7", border: "1px solid #cba6f7" }}>
          LLM
        </span>
        <span style={arrowStyle}>&rarr;</span>
        <span style={{ ...flowBoxStyle, background: "#1e1e2e", color: "#f38ba8", border: "1px solid #f38ba8" }}>
          ui_patch
        </span>
        <span style={arrowStyle}>&rarr;</span>
        <span style={{ ...flowBoxStyle, background: "#1e1e2e", color: "#94e2d5", border: "1px solid #94e2d5" }}>
          PatchEngine
        </span>
      </div>

      {/* Detail descriptions */}
      <div style={{ marginTop: "28px", display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px 16px", fontSize: "13px" }}>
        <span style={{ color: "#fab387", fontWeight: 600 }}>iframe event</span>
        <span style={{ color: "#cdd6f4" }}>User clicks, selects, or scrolls inside a panel's sandboxed iframe.</span>

        <span style={{ color: "#f9e2af", fontWeight: 600 }}>EventQueue</span>
        <span style={{ color: "#cdd6f4" }}>Debounces and deduplicates raw postMessage events from all panels.</span>

        <span style={{ color: "#a6e3a1", fontWeight: 600 }}>StateEmitter</span>
        <span style={{ color: "#cdd6f4" }}>Updates UIState (selections, fingerprints) and notifies subscribers.</span>

        <span style={{ color: "#89b4fa", fontWeight: 600 }}>updateModelContext</span>
        <span style={{ color: "#cdd6f4" }}>Composes a compact context delta and appends it to the conversation.</span>

        <span style={{ color: "#cba6f7", fontWeight: 600 }}>LLM</span>
        <span style={{ color: "#cdd6f4" }}>Receives the context update and decides whether to emit a ui_patch tool-call.</span>

        <span style={{ color: "#f38ba8", fontWeight: 600 }}>ui_patch</span>
        <span style={{ color: "#cdd6f4" }}>Structured JSON payload describing add/update/remove operations.</span>

        <span style={{ color: "#94e2d5", fontWeight: 600 }}>PatchEngine</span>
        <span style={{ color: "#cdd6f4" }}>Validates ops, applies them atomically to the dashboard state, and triggers re-render.</span>
      </div>

      <p style={noteStyle}>
        The full round-trip from user click to dashboard update typically completes in
        under 2 seconds when streaming is enabled.
      </p>
    </div>
  ),
};
