import { describe, it, expect } from "vitest";
import { applyPatch, applyOp, changedPanelIds } from "./patch-engine";
import { panelV2ToPanelState } from "./ui-state-store";
import type { UIState } from "./ui-state-store";
import type { UIPatch, PatchOp, PanelV2 } from "../schema";

function makePanel(id: string, content: Record<string, unknown> = {}): PanelV2 {
  return { id, viewType: "chart", structuredContent: content };
}

function makeState(panels: PanelV2[] = [], links: UIState["links"] = []): UIState {
  return {
    version: "3.0",
    layout: "auto",
    panels: panels.map(panelV2ToPanelState),
    links,
  };
}

function patch(...ops: PatchOp[]): UIPatch {
  return { type: "ui_patch", version: "3.0", ops };
}

describe("applyOp: add-panel", () => {
  it("adds a panel at the end", () => {
    const state = makeState([makePanel("p1")]);
    const result = applyOp(state, {
      op: "add-panel",
      panel: makePanel("p2"),
    });
    expect(result.panels).toHaveLength(2);
    expect(result.panels[1].id).toBe("p2");
    expect(result.panels[1].visible).toBe(true);
  });

  it("adds a panel after a specific panel", () => {
    const state = makeState([makePanel("p1"), makePanel("p3")]);
    const result = applyOp(state, {
      op: "add-panel",
      panel: makePanel("p2"),
      after: "p1",
    });
    expect(result.panels).toHaveLength(3);
    expect(result.panels[1].id).toBe("p2");
  });

  it("adds at end when 'after' panel not found", () => {
    const state = makeState([makePanel("p1")]);
    const result = applyOp(state, {
      op: "add-panel",
      panel: makePanel("p2"),
      after: "missing",
    });
    expect(result.panels[result.panels.length - 1].id).toBe("p2");
  });
});

describe("applyOp: remove-panel", () => {
  it("removes a panel by id", () => {
    const state = makeState([makePanel("p1"), makePanel("p2")]);
    const result = applyOp(state, { op: "remove-panel", panelId: "p1" });
    expect(result.panels).toHaveLength(1);
    expect(result.panels[0].id).toBe("p2");
  });

  it("also removes links referencing the panel", () => {
    const state = makeState(
      [makePanel("a"), makePanel("b")],
      [{ source: "a", target: "b", type: "selection", sourceField: "x", targetField: "y" }],
    );
    const result = applyOp(state, { op: "remove-panel", panelId: "a" });
    expect(result.links).toHaveLength(0);
  });
});

describe("applyOp: update-panel", () => {
  it("replace: replaces entire structuredContent", () => {
    const state = makeState([makePanel("p1", { old: true })]);
    const result = applyOp(state, {
      op: "update-panel",
      panelId: "p1",
      action: "replace",
      data: { new: true },
    });
    expect(result.panels[0].structuredContent).toEqual({ new: true });
  });

  it("replace with targetField: replaces a specific field", () => {
    const state = makeState([makePanel("p1", { title: "old", rows: [] })]);
    const result = applyOp(state, {
      op: "update-panel",
      panelId: "p1",
      action: "replace",
      data: { rows: [1, 2] },
      targetField: "rows",
    });
    const content = result.panels[0].structuredContent as Record<string, unknown>;
    expect(content.title).toBe("old");
    expect(content.rows).toEqual([1, 2]);
  });

  it("merge: merges data into structuredContent", () => {
    const state = makeState([makePanel("p1", { a: 1, b: 2 })]);
    const result = applyOp(state, {
      op: "update-panel",
      panelId: "p1",
      action: "merge",
      data: { b: 3, c: 4 },
    });
    const content = result.panels[0].structuredContent as Record<string, unknown>;
    expect(content).toEqual({ a: 1, b: 3, c: 4 });
  });

  it("append with targetField: appends to array", () => {
    const state = makeState([makePanel("p1", { rows: [1, 2] })]);
    const result = applyOp(state, {
      op: "update-panel",
      panelId: "p1",
      action: "append",
      data: { rows: [3, 4] },
      targetField: "rows",
    });
    const content = result.panels[0].structuredContent as Record<string, unknown>;
    expect(content.rows).toEqual([1, 2, 3, 4]);
  });

  it("updates dataFingerprint after content change", () => {
    const state = makeState([makePanel("p1", { v: 1 })]);
    const oldFp = state.panels[0].dataFingerprint;
    const result = applyOp(state, {
      op: "update-panel",
      panelId: "p1",
      action: "replace",
      data: { v: 2 },
    });
    expect(result.panels[0].dataFingerprint).not.toBe(oldFp);
  });
});

describe("applyOp: show-panel", () => {
  it("sets visible to true", () => {
    const state = makeState([makePanel("p1")]);
    state.panels[0].visible = false;
    const result = applyOp(state, { op: "show-panel", panelId: "p1", visible: true });
    expect(result.panels[0].visible).toBe(true);
  });

  it("sets visible to false", () => {
    const state = makeState([makePanel("p1")]);
    const result = applyOp(state, { op: "show-panel", panelId: "p1", visible: false });
    expect(result.panels[0].visible).toBe(false);
  });
});

describe("applyOp: collapse-panel", () => {
  it("sets collapsed to true", () => {
    const state = makeState([makePanel("p1")]);
    const result = applyOp(state, { op: "collapse-panel", panelId: "p1", collapsed: true });
    expect(result.panels[0].collapsed).toBe(true);
  });
});

describe("applyOp: add-link", () => {
  it("adds a link", () => {
    const state = makeState([makePanel("a"), makePanel("b")]);
    const result = applyOp(state, {
      op: "add-link",
      link: { source: "a", target: "b", type: "filter", sourceField: "x", targetField: "y" },
    });
    expect(result.links).toHaveLength(1);
    expect(result.links[0].type).toBe("filter");
  });
});

describe("applyOp: remove-link", () => {
  it("removes a link by source and target", () => {
    const state = makeState(
      [makePanel("a"), makePanel("b")],
      [{ source: "a", target: "b", type: "selection", sourceField: "x", targetField: "y" }],
    );
    const result = applyOp(state, { op: "remove-link", source: "a", target: "b" });
    expect(result.links).toHaveLength(0);
  });

  it("only removes matching link", () => {
    const state = makeState(
      [makePanel("a"), makePanel("b"), makePanel("c")],
      [
        { source: "a", target: "b", type: "selection", sourceField: "x", targetField: "y" },
        { source: "b", target: "c", type: "filter", sourceField: "x", targetField: "y" },
      ],
    );
    const result = applyOp(state, { op: "remove-link", source: "a", target: "b" });
    expect(result.links).toHaveLength(1);
    expect(result.links[0].source).toBe("b");
  });
});

describe("applyOp: update-layout", () => {
  it("updates the layout", () => {
    const state = makeState([makePanel("p1")]);
    const result = applyOp(state, { op: "update-layout", layout: "tabs" });
    expect(result.layout).toBe("tabs");
  });

  it("accepts object layout", () => {
    const state = makeState([makePanel("p1")]);
    const result = applyOp(state, { op: "update-layout", layout: { type: "grid", columns: 3 } });
    expect(result.layout).toEqual({ type: "grid", columns: 3 });
  });
});

describe("applyOp: set-loading", () => {
  it("sets loading state", () => {
    const state = makeState([makePanel("p1")]);
    const result = applyOp(state, { op: "set-loading", panelId: "p1", loading: true });
    expect(result.panels[0].loading).toBe(true);
  });
});

describe("applyOp: set-error", () => {
  it("sets error message", () => {
    const state = makeState([makePanel("p1")]);
    const result = applyOp(state, { op: "set-error", panelId: "p1", error: "Failed" });
    expect(result.panels[0].error).toBe("Failed");
  });

  it("clears error with null", () => {
    const state = makeState([makePanel("p1")]);
    state.panels[0].error = "old error";
    const result = applyOp(state, { op: "set-error", panelId: "p1", error: null });
    expect(result.panels[0].error).toBeNull();
  });
});

describe("applyPatch", () => {
  it("applies multiple ops in order", () => {
    const state = makeState([makePanel("p1")]);
    const result = applyPatch(state, patch(
      { op: "add-panel", panel: makePanel("p2") },
      { op: "set-loading", panelId: "p1", loading: true },
      { op: "collapse-panel", panelId: "p2", collapsed: true },
    ));
    expect(result.panels).toHaveLength(2);
    expect(result.panels[0].loading).toBe(true);
    expect(result.panels[1].collapsed).toBe(true);
  });

  it("handles empty ops array", () => {
    const state = makeState([makePanel("p1")]);
    const result = applyPatch(state, patch());
    expect(result).toBe(state);
  });
});

describe("changedPanelIds", () => {
  it("detects changed fingerprints", () => {
    const old = makeState([makePanel("p1", { v: 1 }), makePanel("p2", { v: 2 })]);
    const updated = applyOp(old, {
      op: "update-panel",
      panelId: "p1",
      action: "replace",
      data: { v: 99 },
    });
    const changed = changedPanelIds(old, updated);
    expect(changed.has("p1")).toBe(true);
    expect(changed.has("p2")).toBe(false);
  });

  it("detects new panels", () => {
    const old = makeState([makePanel("p1")]);
    const updated = applyOp(old, { op: "add-panel", panel: makePanel("p2") });
    const changed = changedPanelIds(old, updated);
    expect(changed.has("p2")).toBe(true);
  });

  it("detects removed panels", () => {
    const old = makeState([makePanel("p1"), makePanel("p2")]);
    const updated = applyOp(old, { op: "remove-panel", panelId: "p2" });
    const changed = changedPanelIds(old, updated);
    expect(changed.has("p2")).toBe(true);
  });
});
