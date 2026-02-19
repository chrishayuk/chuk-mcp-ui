import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewToast } from "./use-view-toast";

describe("useViewToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with empty toasts", () => {
    const { result } = renderHook(() => useViewToast());
    expect(result.current.toasts).toEqual([]);
  });

  it("toast() adds a message and returns an id", () => {
    const { result } = renderHook(() => useViewToast());

    let id: string;
    act(() => {
      id = result.current.toast("Hello");
    });

    expect(id!).toMatch(/^toast-/);
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Hello");
    expect(result.current.toasts[0].severity).toBe("info");
  });

  it("success() sets severity to success", () => {
    const { result } = renderHook(() => useViewToast());

    act(() => {
      result.current.success("Saved!");
    });

    expect(result.current.toasts[0].severity).toBe("success");
    expect(result.current.toasts[0].message).toBe("Saved!");
  });

  it("error() sets severity to error", () => {
    const { result } = renderHook(() => useViewToast());

    act(() => {
      result.current.error("Failed!");
    });

    expect(result.current.toasts[0].severity).toBe("error");
  });

  it("warning() sets severity to warning", () => {
    const { result } = renderHook(() => useViewToast());

    act(() => {
      result.current.warning("Careful!");
    });

    expect(result.current.toasts[0].severity).toBe("warning");
  });

  it("info() sets severity to info", () => {
    const { result } = renderHook(() => useViewToast());

    act(() => {
      result.current.info("FYI");
    });

    expect(result.current.toasts[0].severity).toBe("info");
  });

  it("dismiss() removes a specific toast", () => {
    const { result } = renderHook(() => useViewToast());

    let id1: string;
    let id2: string;
    act(() => {
      id1 = result.current.toast("First");
      id2 = result.current.toast("Second");
    });

    expect(result.current.toasts).toHaveLength(2);

    act(() => {
      result.current.dismiss(id1!);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].id).toBe(id2!);
  });

  it("dismissAll() clears everything", () => {
    const { result } = renderHook(() => useViewToast());

    act(() => {
      result.current.toast("A");
      result.current.toast("B");
      result.current.toast("C");
    });

    expect(result.current.toasts).toHaveLength(3);

    act(() => {
      result.current.dismissAll();
    });

    expect(result.current.toasts).toEqual([]);
  });

  it("auto-dismiss fires after duration", () => {
    const { result } = renderHook(() =>
      useViewToast({ defaultDuration: 2000 })
    );

    act(() => {
      result.current.toast("Temporary");
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("maxToasts evicts oldest when exceeded", () => {
    const { result } = renderHook(() =>
      useViewToast({ maxToasts: 2 })
    );

    act(() => {
      result.current.toast("First");
      result.current.toast("Second");
      result.current.toast("Third");
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].message).toBe("Second");
    expect(result.current.toasts[1].message).toBe("Third");
  });

  it("null duration prevents auto-dismiss", () => {
    const { result } = renderHook(() => useViewToast());

    act(() => {
      result.current.toast("Sticky", { duration: null });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Sticky");
  });

  it("cleans up timers on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    const { result, unmount } = renderHook(() =>
      useViewToast({ defaultDuration: 5000 })
    );

    act(() => {
      result.current.toast("One");
      result.current.toast("Two");
    });

    expect(result.current.toasts).toHaveLength(2);

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
