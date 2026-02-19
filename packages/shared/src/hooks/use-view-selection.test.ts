import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewSelection } from "./use-view-selection";

// ── Mock useViewBus ─────────────────────────────────────────────────

type Handler = (msg: Record<string, unknown>, sourcePanelId?: string) => void;

const mockSend = vi.fn();
const subscriptions = new Map<string, Set<Handler>>();

vi.mock("../bus", () => ({
  useViewBus: () => ({
    send: mockSend,
    subscribe: (type: string, handler: Handler) => {
      if (!subscriptions.has(type)) subscriptions.set(type, new Set());
      subscriptions.get(type)!.add(handler);
      return () => subscriptions.get(type)?.delete(handler);
    },
    subscribeAll: vi.fn(() => () => {}),
    panelId: "test-panel",
  }),
}));

function simulateBusMessage(type: string, payload: Record<string, unknown>) {
  const handlers = subscriptions.get(type);
  if (handlers) {
    for (const handler of handlers) {
      handler({ type, source: "other-panel", ...payload }, "other-panel");
    }
  }
}

beforeEach(() => {
  mockSend.mockClear();
  subscriptions.clear();
});

describe("useViewSelection", () => {
  it("starts with empty selection", () => {
    const { result } = renderHook(() => useViewSelection());
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.highlightedId).toBeNull();
  });

  it("select() updates local state and broadcasts", () => {
    const { result } = renderHook(() => useViewSelection());

    act(() => result.current.select(["id1", "id2"]));

    expect(result.current.selectedIds).toEqual(["id1", "id2"]);
    expect(mockSend).toHaveBeenCalledWith({ type: "select", ids: ["id1", "id2"] });
  });

  it("highlight() updates local state and broadcasts", () => {
    const { result } = renderHook(() => useViewSelection());

    act(() => result.current.highlight("id1"));

    expect(result.current.highlightedId).toBe("id1");
    expect(mockSend).toHaveBeenCalledWith({ type: "highlight", id: "id1" });
  });

  it("highlight(null) clears highlight without broadcasting", () => {
    const { result } = renderHook(() => useViewSelection());

    act(() => result.current.highlight("id1"));
    mockSend.mockClear();

    act(() => result.current.highlight(null));
    expect(result.current.highlightedId).toBeNull();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("clearSelection() resets both and broadcasts empty select", () => {
    const { result } = renderHook(() => useViewSelection());

    act(() => result.current.select(["id1"]));
    act(() => result.current.highlight("id1"));
    mockSend.mockClear();

    act(() => result.current.clearSelection());
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.highlightedId).toBeNull();
    expect(mockSend).toHaveBeenCalledWith({ type: "select", ids: [] });
  });

  it("incoming select message updates selectedIds", () => {
    const { result } = renderHook(() => useViewSelection());

    act(() => {
      simulateBusMessage("select", { ids: ["ext1", "ext2"] });
    });

    expect(result.current.selectedIds).toEqual(["ext1", "ext2"]);
  });

  it("incoming highlight message updates highlightedId", () => {
    const { result } = renderHook(() => useViewSelection());

    act(() => {
      simulateBusMessage("highlight", { id: "ext1" });
    });

    expect(result.current.highlightedId).toBe("ext1");
  });
});
