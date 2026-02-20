import { describe, it, expect, vi } from "vitest";
import { UIStateStore, panelV2ToPanelState } from "./ui-state-store";
import type { UIState } from "./ui-state-store";
import type { DashboardContentV2, PanelV2 } from "../schema";

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

describe("panelV2ToPanelState", () => {
  it("converts a basic panel", () => {
    const panel = makePanel("p1", "map");
    const state = panelV2ToPanelState(panel);
    expect(state.id).toBe("p1");
    expect(state.viewType).toBe("map");
    expect(state.visible).toBe(true);
    expect(state.collapsed).toBe(false);
    expect(state.selection).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("sets visible=false for collapsed panels", () => {
    const panel: PanelV2 = { ...makePanel("p1"), collapsed: true };
    const state = panelV2ToPanelState(panel);
    expect(state.collapsed).toBe(true);
    expect(state.visible).toBe(false);
  });

  it("sets visible=false for panels with showWhen", () => {
    const panel: PanelV2 = {
      ...makePanel("p1"),
      showWhen: { linkedPanelHasSelection: "other" },
    };
    const state = panelV2ToPanelState(panel);
    expect(state.visible).toBe(false);
  });

  it("computes dataFingerprint", () => {
    const panel = makePanel("p1", "chart");
    const state = panelV2ToPanelState(panel);
    expect(state.dataFingerprint).toHaveLength(6);
    expect(typeof state.dataFingerprint).toBe("string");
  });

  it("computes dataSummary for known content shapes", () => {
    const panel: PanelV2 = {
      id: "p1",
      viewType: "datatable",
      structuredContent: { type: "datatable", rows: [1, 2, 3], columns: ["a", "b"] },
    };
    const state = panelV2ToPanelState(panel);
    expect(state.dataSummary).toBe("3 rows, 2 columns");
  });
});

describe("UIStateStore", () => {
  it("returns initial state", () => {
    const state = makeState([makePanel("p1")]);
    const store = new UIStateStore(state);
    expect(store.getState()).toBe(state);
  });

  it("updates state immutably", () => {
    const state = makeState([makePanel("p1")]);
    const store = new UIStateStore(state);
    store.setState((prev) => ({ ...prev, layout: "grid" }));
    expect(store.getState().layout).toBe("grid");
    expect(store.getState()).not.toBe(state);
  });

  it("notifies listeners on setState", () => {
    const store = new UIStateStore(makeState());
    const listener = vi.fn();
    store.subscribe(listener);
    store.setState((s) => s);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("unsubscribe stops notifications", () => {
    const store = new UIStateStore(makeState());
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    unsub();
    store.setState((s) => s);
    expect(listener).not.toHaveBeenCalled();
  });

  it("getPanel finds by id", () => {
    const state = makeState([makePanel("p1"), makePanel("p2")]);
    const store = new UIStateStore(state);
    expect(store.getPanel("p1")?.id).toBe("p1");
    expect(store.getPanel("p2")?.id).toBe("p2");
    expect(store.getPanel("missing")).toBeUndefined();
  });

  it("fromDashboard creates store from v2.0 data", () => {
    const data: DashboardContentV2 = {
      type: "dashboard",
      version: "2.0",
      layout: { type: "named", preset: "investigation" },
      panels: [
        makePanel("map", "map"),
        makePanel("table", "datatable"),
      ],
      links: [
        {
          source: "map",
          target: "table",
          type: "selection",
          sourceField: "fid",
          targetField: "id",
        },
      ],
    };
    const store = UIStateStore.fromDashboard(data);
    const state = store.getState();
    expect(state.version).toBe("3.0");
    expect(state.panels).toHaveLength(2);
    expect(state.panels[0].id).toBe("map");
    expect(state.links).toHaveLength(1);
  });

  it("fromDashboard defaults links to empty array", () => {
    const data: DashboardContentV2 = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [makePanel("p1")],
    };
    const store = UIStateStore.fromDashboard(data);
    expect(store.getState().links).toEqual([]);
  });

  it("supports multiple listeners", () => {
    const store = new UIStateStore(makeState());
    const l1 = vi.fn();
    const l2 = vi.fn();
    store.subscribe(l1);
    store.subscribe(l2);
    store.setState((s) => s);
    expect(l1).toHaveBeenCalledTimes(1);
    expect(l2).toHaveBeenCalledTimes(1);
  });
});
