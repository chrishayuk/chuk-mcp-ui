import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewFilter } from "./use-view-filter";

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

describe("useViewFilter", () => {
  it("starts with empty filters", () => {
    const { result } = renderHook(() => useViewFilter());
    expect(result.current.filters).toEqual({});
  });

  it("setFilter() updates local state and broadcasts", () => {
    const { result } = renderHook(() => useViewFilter());

    act(() => result.current.setFilter("category", "roman"));

    expect(result.current.filters).toEqual({ category: "roman" });
    expect(mockSend).toHaveBeenCalledWith({
      type: "filter",
      field: "category",
      value: "roman",
    });
  });

  it("multiple filters coexist", () => {
    const { result } = renderHook(() => useViewFilter());

    act(() => result.current.setFilter("category", "roman"));
    act(() => result.current.setFilter("period", "medieval"));

    expect(result.current.filters).toEqual({
      category: "roman",
      period: "medieval",
    });
  });

  it("clearFilter() removes key and broadcasts null", () => {
    const { result } = renderHook(() => useViewFilter());

    act(() => result.current.setFilter("category", "roman"));
    mockSend.mockClear();

    act(() => result.current.clearFilter("category"));

    expect(result.current.filters).toEqual({});
    expect(mockSend).toHaveBeenCalledWith({
      type: "filter",
      field: "category",
      value: null,
    });
  });

  it("clearAll() removes all filters and broadcasts null for each", () => {
    const { result } = renderHook(() => useViewFilter());

    act(() => result.current.setFilter("category", "roman"));
    act(() => result.current.setFilter("period", "medieval"));
    mockSend.mockClear();

    act(() => result.current.clearAll());

    expect(result.current.filters).toEqual({});
    expect(mockSend).toHaveBeenCalledWith({
      type: "filter",
      field: "category",
      value: null,
    });
    expect(mockSend).toHaveBeenCalledWith({
      type: "filter",
      field: "period",
      value: null,
    });
  });

  it("incoming filter message updates local filters", () => {
    const { result } = renderHook(() => useViewFilter());

    act(() => {
      simulateBusMessage("filter", { field: "status", value: "at-risk" });
    });

    expect(result.current.filters).toEqual({ status: "at-risk" });
  });

  it("incoming filter with null value clears the key", () => {
    const { result } = renderHook(() => useViewFilter());

    act(() => result.current.setFilter("category", "roman"));

    act(() => {
      simulateBusMessage("filter", { field: "category", value: null });
    });

    expect(result.current.filters).toEqual({});
  });

  it("incoming filter with undefined value clears the key", () => {
    const { result } = renderHook(() => useViewFilter());

    act(() => result.current.setFilter("category", "roman"));

    act(() => {
      simulateBusMessage("filter", { field: "category", value: undefined });
    });

    expect(result.current.filters).toEqual({});
  });
});
