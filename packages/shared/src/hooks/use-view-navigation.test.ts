import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewNavigation } from "./use-view-navigation";

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

describe("useViewNavigation", () => {
  it("starts with empty stack when no initialRoute", () => {
    const { result } = renderHook(() => useViewNavigation());

    expect(result.current.current).toBeNull();
    expect(result.current.stack).toEqual([]);
    expect(result.current.currentIndex).toBe(-1);
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  it("starts with initialRoute when provided", () => {
    const initial = { target: "home", params: { id: 1 } };
    const { result } = renderHook(() =>
      useViewNavigation({ initialRoute: initial })
    );

    expect(result.current.current).toEqual(initial);
    expect(result.current.stack).toEqual([initial]);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  it("push() adds entry and broadcasts navigate message", () => {
    const { result } = renderHook(() => useViewNavigation());

    act(() => result.current.push("detail", { id: 42 }));

    expect(result.current.current).toEqual({ target: "detail", params: { id: 42 } });
    expect(result.current.stack).toHaveLength(1);
    expect(mockSend).toHaveBeenCalledWith({
      type: "navigate",
      target: "detail",
      params: { id: 42 },
    });
  });

  it("replace() swaps current entry and broadcasts", () => {
    const { result } = renderHook(() =>
      useViewNavigation({ initialRoute: { target: "list", params: {} } })
    );

    act(() => result.current.replace("detail", { id: 7 }));

    expect(result.current.current).toEqual({ target: "detail", params: { id: 7 } });
    expect(result.current.stack).toHaveLength(1);
    expect(result.current.currentIndex).toBe(0);
    expect(mockSend).toHaveBeenCalledWith({
      type: "navigate",
      target: "detail",
      params: { id: 7 },
    });
  });

  it("goBack() moves index down", () => {
    const { result } = renderHook(() => useViewNavigation());

    act(() => result.current.push("list"));
    act(() => result.current.push("detail"));

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.canGoBack).toBe(true);

    act(() => result.current.goBack());

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.current).toEqual({ target: "list", params: {} });
    expect(result.current.canGoForward).toBe(true);
  });

  it("goForward() moves index up", () => {
    const { result } = renderHook(() => useViewNavigation());

    act(() => result.current.push("list"));
    act(() => result.current.push("detail"));
    act(() => result.current.goBack());

    expect(result.current.currentIndex).toBe(0);

    act(() => result.current.goForward());

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.current).toEqual({ target: "detail", params: {} });
  });

  it("goBack() is a no-op at bottom of stack", () => {
    const { result } = renderHook(() =>
      useViewNavigation({ initialRoute: { target: "home", params: {} } })
    );

    act(() => result.current.goBack());

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.current).toEqual({ target: "home", params: {} });
  });

  it("push() after goBack() trims forward entries", () => {
    const { result } = renderHook(() => useViewNavigation());

    // Push A, B, C
    act(() => result.current.push("A"));
    act(() => result.current.push("B"));
    act(() => result.current.push("C"));

    expect(result.current.stack).toHaveLength(3);

    // Go back to B
    act(() => result.current.goBack());
    expect(result.current.current).toEqual({ target: "B", params: {} });

    // Push D — C should be gone
    act(() => result.current.push("D"));

    expect(result.current.stack).toHaveLength(3);
    expect(result.current.stack.map((e) => e.target)).toEqual(["A", "B", "D"]);
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.canGoForward).toBe(false);
  });

  it("incoming navigate message pushes onto stack", () => {
    const { result } = renderHook(() => useViewNavigation());

    act(() => {
      simulateBusMessage("navigate", { target: "settings", params: { tab: "general" } });
    });

    expect(result.current.current).toEqual({ target: "settings", params: { tab: "general" } });
    expect(result.current.stack).toHaveLength(1);
  });

  it("fires onNavigate callback on push", () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useViewNavigation({ onNavigate }));

    act(() => result.current.push("detail", { id: 5 }));

    expect(onNavigate).toHaveBeenCalledWith({ target: "detail", params: { id: 5 } });
  });
});
