import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewLiveData } from "./use-view-live-data";

// ── Mock App ────────────────────────────────────────────────────────

function createMockApp() {
  const handlers: Record<string, ((params: Record<string, unknown>) => void) | undefined> = {};
  return {
    set ontoolinputpartial(fn: ((params: Record<string, unknown>) => void) | undefined) {
      handlers.ontoolinputpartial = fn ?? undefined;
    },
    set ontoolinput(fn: ((params: Record<string, unknown>) => void) | undefined) {
      handlers.ontoolinput = fn ?? undefined;
    },
    firePartial(args: Record<string, unknown>) {
      handlers.ontoolinputpartial?.({ arguments: args });
    },
    callServerTool: vi.fn(),
  };
}

describe("useViewLiveData", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("starts idle with null data", () => {
    const { result } = renderHook(() => useViewLiveData());
    expect(result.current.data).toBeNull();
    expect(result.current.status).toBe("idle");
    expect(result.current.lastUpdated).toBeNull();
    expect(result.current.updateCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it("receives streaming updates via ontoolinputpartial and sets connected status", () => {
    const mockApp = createMockApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => useViewLiveData<any>({ app: mockApp as any }));

    act(() => {
      mockApp.firePartial({ type: "status", cpu: 42 });
    });

    expect(result.current.data).toEqual({ type: "status", cpu: 42 });
    expect(result.current.status).toBe("connected");
    expect(result.current.updateCount).toBe(1);
  });

  it("applies replace merge strategy by default", () => {
    const mockApp = createMockApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => useViewLiveData<any>({ app: mockApp as any }));

    act(() => { mockApp.firePartial({ a: 1, b: 2 }); });
    act(() => { mockApp.firePartial({ c: 3 }); });

    expect(result.current.data).toEqual({ c: 3 });
  });

  it("applies shallow-merge strategy", () => {
    const mockApp = createMockApp();
    const { result } = renderHook(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useViewLiveData<any>({ app: mockApp as any, mergeStrategy: "shallow-merge" })
    );

    act(() => { mockApp.firePartial({ a: 1 }); });
    act(() => { mockApp.firePartial({ b: 2 }); });

    expect(result.current.data).toEqual({ a: 1, b: 2 });
  });

  it("applies custom merge function", () => {
    const mockApp = createMockApp();
    interface Accumulator { items: number[] }
    const merge = (existing: Accumulator | null, incoming: Accumulator): Accumulator =>
      existing ? { items: [...existing.items, ...incoming.items] } : incoming;

    const { result } = renderHook(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useViewLiveData<Accumulator>({ app: mockApp as any, mergeStrategy: merge })
    );

    act(() => { mockApp.firePartial({ items: [1, 2] }); });
    act(() => { mockApp.firePartial({ items: [3] }); });

    expect(result.current.data).toEqual({ items: [1, 2, 3] });
  });

  it("polls on interval when pollingInterval > 0", async () => {
    const mockApp = createMockApp();
    mockApp.callServerTool.mockResolvedValue({ cpu: 55 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderHook(() =>
      useViewLiveData<any>({
        app: mockApp as any,
        pollingInterval: 1000,
        pollingTool: "get-status",
      })
    );

    expect(mockApp.callServerTool).not.toHaveBeenCalled();

    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(mockApp.callServerTool).toHaveBeenCalledTimes(1);
    expect(mockApp.callServerTool).toHaveBeenCalledWith({
      name: "get-status",
      arguments: {},
    });

    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(mockApp.callServerTool).toHaveBeenCalledTimes(2);
  });

  it("pause() stops applying updates", () => {
    const mockApp = createMockApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => useViewLiveData<any>({ app: mockApp as any }));

    act(() => { result.current.pause(); });
    expect(result.current.status).toBe("paused");

    act(() => { mockApp.firePartial({ ignored: true }); });
    expect(result.current.data).toBeNull();
  });

  it("resume() resumes applying updates", () => {
    const mockApp = createMockApp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => useViewLiveData<any>({ app: mockApp as any }));

    act(() => { result.current.pause(); });
    act(() => { mockApp.firePartial({ ignored: true }); });
    expect(result.current.data).toBeNull();

    act(() => { result.current.resume(); });
    act(() => { mockApp.firePartial({ received: true }); });
    expect(result.current.data).toEqual({ received: true });
  });

  it("refresh() triggers single poll even when paused", async () => {
    const mockApp = createMockApp();
    mockApp.callServerTool.mockResolvedValue({ fresh: true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() =>
      useViewLiveData<any>({ app: mockApp as any, pollingInterval: 5000 })
    );

    act(() => { result.current.pause(); });

    await act(async () => { await result.current.refresh(); });
    expect(mockApp.callServerTool).toHaveBeenCalledTimes(1);
  });

  it("reset() clears data and restarts", async () => {
    const mockApp = createMockApp();
    mockApp.callServerTool.mockResolvedValue({ cpu: 10 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() =>
      useViewLiveData<any>({ app: mockApp as any, pollingInterval: 2000 })
    );

    await act(async () => { vi.advanceTimersByTime(2000); });
    expect(result.current.updateCount).toBe(1);

    act(() => { result.current.reset(); });
    expect(result.current.data).toBeNull();
    expect(result.current.updateCount).toBe(0);
    expect(result.current.lastUpdated).toBeNull();
  });

  it("tracks lastUpdated and updateCount correctly", () => {
    const mockApp = createMockApp();
    const now = 1700000000000;
    vi.setSystemTime(now);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => useViewLiveData<any>({ app: mockApp as any }));

    act(() => { mockApp.firePartial({ v: 1 }); });
    expect(result.current.updateCount).toBe(1);
    expect(result.current.lastUpdated).toBe(now);

    vi.setSystemTime(now + 5000);
    act(() => { mockApp.firePartial({ v: 2 }); });
    expect(result.current.updateCount).toBe(2);
    expect(result.current.lastUpdated).toBe(now + 5000);
  });

  it("sets error status on poll failure", async () => {
    vi.useRealTimers();
    const mockApp = createMockApp();
    mockApp.callServerTool.mockRejectedValue(new Error("Connection lost"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() =>
      useViewLiveData<any>({ app: mockApp as any })
    );

    // Use refresh() to trigger a single poll and await the rejection
    await act(async () => { await result.current.refresh(); });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("Connection lost");
  });
});
