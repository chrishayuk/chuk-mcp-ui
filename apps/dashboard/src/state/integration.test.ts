import { describe, it, expect, vi } from "vitest";
import { classifyMessage } from "./event-queue";
import { applyOp, applyPatch } from "./patch-engine";
import { UIStateStore, panelV2ToPanelState } from "./ui-state-store";
import { serialiseUIState, emitState } from "./state-emitter";
import type { UIState } from "./ui-state-store";
import type { PanelV2, UIPatch } from "../schema";
import type { ModelContextSender } from "./state-emitter";

function makePanel(id: string, viewType = "chart"): PanelV2 {
  return { id, viewType, structuredContent: { type: viewType } };
}

function makeState(panels: PanelV2[] = []): UIState {
  return {
    version: "3.0",
    layout: "auto",
    panels: panels.map(panelV2ToPanelState),
    links: [],
  };
}

describe("Sprint 5c integration: event → context → patch cycle", () => {
  it("ViewBus select event is classified and updates store selection", () => {
    // Simulate: user clicks feature in map → ViewBus select → EventQueue → store update
    const store = UIStateStore.fromDashboard({
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [makePanel("map", "map"), makePanel("table", "datatable")],
    });

    // Classify the ViewBus message
    const event = classifyMessage({
      __chuk_bus: true,
      message: { type: "select", source: "map", ids: ["feat-1", "feat-2"], field: "feature_id" },
    });
    expect(event).not.toBeNull();
    expect(event!.eventType).toBe("select");

    // Update store (simulating what use-dashboard-runtime does)
    store.setState((prev) => ({
      ...prev,
      panels: prev.panels.map((p) =>
        p.id === event!.panelId
          ? { ...p, selection: { field: "feature_id", values: ["feat-1", "feat-2"] } }
          : p,
      ),
    }));

    const panel = store.getPanel("map");
    expect(panel?.selection).toEqual({
      field: "feature_id",
      values: ["feat-1", "feat-2"],
    });
  });

  it("deselect event clears selection in store", () => {
    const store = UIStateStore.fromDashboard({
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [makePanel("map", "map")],
    });

    // Set initial selection
    store.setState((prev) => ({
      ...prev,
      panels: prev.panels.map((p) =>
        p.id === "map"
          ? { ...p, selection: { field: "id", values: ["1"] } }
          : p,
      ),
    }));
    expect(store.getPanel("map")?.selection).not.toBeNull();

    // Classify deselect
    const event = classifyMessage({
      __chuk_bus: true,
      message: { type: "select", source: "map", ids: [] },
    });
    expect(event!.eventType).toBe("deselect");

    // Clear selection
    store.setState((prev) => ({
      ...prev,
      panels: prev.panels.map((p) =>
        p.id === event!.panelId ? { ...p, selection: null } : p,
      ),
    }));
    expect(store.getPanel("map")?.selection).toBeNull();
  });

  it("state serialisation → emitState → updateModelContext round trip", async () => {
    const store = UIStateStore.fromDashboard({
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [makePanel("map", "map"), makePanel("table", "datatable")],
    });

    const sender: ModelContextSender = {
      updateModelContext: vi.fn().mockResolvedValue({}),
    };

    const state = store.getState();
    const events = [
      { panelId: "map", eventType: "select" as const, timestamp: Date.now(), payload: { ids: ["1"] } },
    ];

    await emitState(sender, state, events);

    expect(sender.updateModelContext).toHaveBeenCalledTimes(1);
    const call = (sender.updateModelContext as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const text: string = call.content[0].text;
    expect(text).toContain("<ui_state>");
    expect(text).toContain("<ui_events>");

    // Verify the state JSON is parseable and has the right shape
    const stateMatch = text.match(/<ui_state>\n(.*)\n<\/ui_state>/s);
    expect(stateMatch).not.toBeNull();
    const parsed = JSON.parse(stateMatch![1]);
    expect(parsed.version).toBe("3.0");
    expect(parsed.panels).toHaveLength(2);
    // Verify structuredContent is NOT in the serialized output
    expect(parsed.panels[0].structuredContent).toBeUndefined();
    expect(parsed.panels[0].dataFingerprint).toBeDefined();
  });

  it("LLM patch adds panel and updates layout", () => {
    const state = makeState([makePanel("map", "map")]);

    const patch: UIPatch = {
      type: "ui_patch",
      version: "3.0",
      ops: [
        { op: "add-panel", panel: makePanel("detail", "detail"), after: "map" },
        { op: "update-layout", layout: { type: "named", preset: "investigation" } },
        {
          op: "add-link",
          link: {
            source: "map",
            target: "detail",
            type: "selection",
            sourceField: "feature_id",
            targetField: "id",
          },
        },
      ],
    };

    const result = applyPatch(state, patch);
    expect(result.panels).toHaveLength(2);
    expect(result.panels[1].id).toBe("detail");
    expect(result.panels[1].visible).toBe(true);
    expect(result.layout).toEqual({ type: "named", preset: "investigation" });
    expect(result.links).toHaveLength(1);
  });

  it("progressive patch: safe ops applied, unsafe ops skipped", () => {
    const state = makeState([makePanel("map", "map")]);

    // Simulate partial ops from streaming — mix of safe and unsafe
    const ops = [
      { op: "add-panel", panel: makePanel("chart", "chart") },
      { op: "set-loading", panelId: "map", loading: true },
      // These would be unsafe in partial mode
      { op: "update-panel", panelId: "map", action: "replace", data: { v: 1 } },
      { op: "remove-panel", panelId: "map" },
    ];

    // Filter to safe ops only (what the runtime does)
    const safeOps = ops.filter(
      (op) => op.op === "add-panel" || op.op === "set-loading",
    );
    expect(safeOps).toHaveLength(2);

    // Apply safe ops
    let current = state;
    for (const op of safeOps) {
      current = applyOp(current, op as any);
    }
    expect(current.panels).toHaveLength(2);
    expect(current.panels[0].loading).toBe(true);
    expect(current.panels[1].id).toBe("chart");
  });

  it("high-priority event classification for draw and submit", () => {
    const drawEvent = classifyMessage({
      __chuk_panel_id: "map",
      __chuk_event: "draw",
    });
    expect(drawEvent).not.toBeNull();
    expect(drawEvent!.eventType).toBe("draw");

    const submitEvent = classifyMessage({
      __chuk_panel_id: "form",
      __chuk_event: "submit",
    });
    expect(submitEvent).not.toBeNull();
    expect(submitEvent!.eventType).toBe("submit");
  });

  it("legacy messages still classified alongside ViewBus messages", () => {
    // Legacy pattern
    const legacy = classifyMessage({
      __chuk_panel_id: "table",
      __chuk_event: "row-click",
    });
    expect(legacy!.eventType).toBe("select");
    expect(legacy!.panelId).toBe("table");

    // ViewBus pattern
    const viewBus = classifyMessage({
      __chuk_bus: true,
      message: { type: "select", source: "table", ids: ["row-1"] },
    });
    expect(viewBus!.eventType).toBe("select");
    expect(viewBus!.panelId).toBe("table");
  });

  it("update-panel with ViewBus update message field mapping", () => {
    // Simulate ViewBus update messages being classified
    const updateEvent = classifyMessage({
      __chuk_bus: true,
      message: { type: "filter", source: "filter-panel" },
    });
    expect(updateEvent!.eventType).toBe("filter-change");
    expect(updateEvent!.panelId).toBe("filter-panel");
  });

  it("full turn cycle: init → interact → serialize → patch → verify", () => {
    // Step 1: Initialize from v2.0 dashboard
    const store = UIStateStore.fromDashboard({
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [
        makePanel("map", "map"),
        makePanel("table", "datatable"),
      ],
      links: [{
        source: "map",
        target: "table",
        type: "selection",
        sourceField: "feature_id",
        targetField: "id",
      }],
    });
    expect(store.getState().panels).toHaveLength(2);

    // Step 2: User selects a feature
    store.setState((prev) => ({
      ...prev,
      panels: prev.panels.map((p) =>
        p.id === "map"
          ? { ...p, selection: { field: "feature_id", values: ["feat-42"] } }
          : p,
      ),
    }));

    // Step 3: Serialize state (what gets sent to LLM)
    const serialized = serialiseUIState(store.getState());
    const parsed = JSON.parse(serialized);
    expect(parsed.panels[0].selection).toEqual({
      field: "feature_id",
      values: ["feat-42"],
    });

    // Step 4: LLM responds with a patch (adds detail panel)
    const patch: UIPatch = {
      type: "ui_patch",
      version: "3.0",
      ops: [
        {
          op: "add-panel",
          panel: {
            id: "detail",
            viewType: "detail",
            structuredContent: { type: "detail", title: "Feature 42" },
          },
          after: "table",
        },
        { op: "show-panel", panelId: "detail", visible: true },
      ],
    };

    const newState = applyPatch(store.getState(), patch);
    store.setState(() => newState);

    // Step 5: Verify final state
    expect(store.getState().panels).toHaveLength(3);
    expect(store.getPanel("detail")?.visible).toBe(true);
    expect(store.getPanel("detail")?.dataSummary).toBe("");
    expect(store.getPanel("map")?.selection?.values).toEqual(["feat-42"]);
  });
});
