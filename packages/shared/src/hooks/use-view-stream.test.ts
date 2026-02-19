import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewStream } from "./use-view-stream";

// ── Mock App ────────────────────────────────────────────────────────

function createMockApp() {
  const handlers: Record<string, (params: Record<string, unknown>) => void> = {};
  return {
    set ontoolinputpartial(fn: (params: Record<string, unknown>) => void) {
      handlers.ontoolinputpartial = fn;
    },
    set ontoolinput(fn: (params: Record<string, unknown>) => void) {
      handlers.ontoolinput = fn;
    },
    firePartial(args: Record<string, unknown>) {
      handlers.ontoolinputpartial?.({ arguments: args });
    },
    fireInput(args: Record<string, unknown>) {
      handlers.ontoolinput?.({ arguments: args });
    },
  };
}

describe("useViewStream", () => {
  it("returns null data initially", () => {
    const { result } = renderHook(() => useViewStream(null));
    expect(result.current.data).toBeNull();
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.progress).toBeNull();
  });

  it("does not error when app is null", () => {
    expect(() => {
      renderHook(() => useViewStream(null));
    }).not.toThrow();
  });

  it("updates data on ontoolinputpartial", () => {
    const mockApp = createMockApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => useViewStream<any>(mockApp as any));

    act(() => {
      mockApp.firePartial({ type: "map", center: { lat: 51, lon: 0 } });
    });

    expect(result.current.data).toEqual({ type: "map", center: { lat: 51, lon: 0 } });
    expect(result.current.isStreaming).toBe(true);
  });

  it("completes streaming on ontoolinput", () => {
    const mockApp = createMockApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => useViewStream<any>(mockApp as any));

    act(() => {
      mockApp.firePartial({ type: "map", center: { lat: 51, lon: 0 } });
    });
    expect(result.current.isStreaming).toBe(true);

    act(() => {
      mockApp.fireInput({ type: "map", center: { lat: 51, lon: 0 }, layers: [] });
    });
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.progress).toBe(1);
    expect(result.current.data).toEqual({ type: "map", center: { lat: 51, lon: 0 }, layers: [] });
  });

  it("filters by expectedType", () => {
    const mockApp = createMockApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() =>
      useViewStream<any>(mockApp as any, { expectedType: "map" })
    );

    act(() => {
      mockApp.firePartial({ type: "chart", data: [] });
    });
    expect(result.current.data).toBeNull(); // wrong type, ignored

    act(() => {
      mockApp.firePartial({ type: "map", center: { lat: 0, lon: 0 } });
    });
    expect(result.current.data).toEqual({ type: "map", center: { lat: 0, lon: 0 } });
  });

  it("ignores partial with no arguments", () => {
    const mockApp = createMockApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => useViewStream<any>(mockApp as any));

    act(() => {
      mockApp.firePartial(undefined as unknown as Record<string, unknown>);
    });
    expect(result.current.data).toBeNull();
  });

  it("accumulates multiple partials (last wins)", () => {
    const mockApp = createMockApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => useViewStream<any>(mockApp as any));

    act(() => {
      mockApp.firePartial({ type: "map", center: { lat: 51, lon: 0 } });
    });
    act(() => {
      mockApp.firePartial({ type: "map", center: { lat: 51, lon: 0 }, layers: [{ id: "a" }] });
    });

    expect(result.current.data).toEqual({
      type: "map",
      center: { lat: 51, lon: 0 },
      layers: [{ id: "a" }],
    });
    expect(result.current.isStreaming).toBe(true);
  });
});
