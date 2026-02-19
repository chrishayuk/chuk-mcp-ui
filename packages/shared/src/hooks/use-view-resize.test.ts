import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewResize } from "./use-view-resize";

// ── ResizeObserver mock ─────────────────────────────────────────────

type ResizeCallback = (entries: Array<{ contentRect: { width: number; height: number } }>) => void;

let resizeCallback: ResizeCallback | null = null;
let observedElement: Element | null = null;

const mockDisconnect = vi.fn();

class MockResizeObserver {
  constructor(cb: ResizeCallback) {
    resizeCallback = cb;
  }
  observe(el: Element) {
    observedElement = el;
  }
  unobserve() {}
  disconnect() {
    mockDisconnect();
  }
}

function triggerResize(width: number, height: number) {
  resizeCallback?.([{ contentRect: { width, height } }]);
}

beforeEach(() => {
  vi.useFakeTimers();
  resizeCallback = null;
  observedElement = null;
  mockDisconnect.mockClear();
  // @ts-expect-error - mock
  globalThis.ResizeObserver = MockResizeObserver;

  // Mock document.documentElement dimensions
  Object.defineProperty(document.documentElement, "clientWidth", { value: 1024, configurable: true });
  Object.defineProperty(document.documentElement, "clientHeight", { value: 768, configurable: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useViewResize", () => {
  it("returns initial dimensions from document.documentElement", () => {
    const { result } = renderHook(() => useViewResize());
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
    expect(result.current.breakpoint).toBe("lg");
  });

  it("observes document.documentElement by default", () => {
    renderHook(() => useViewResize());
    expect(observedElement).toBe(document.documentElement);
  });

  it("updates on resize after debounce", () => {
    const { result } = renderHook(() => useViewResize({ debounceMs: 100 }));

    act(() => {
      triggerResize(400, 300);
      vi.advanceTimersByTime(100);
    });

    expect(result.current.width).toBe(400);
    expect(result.current.height).toBe(300);
    expect(result.current.breakpoint).toBe("xs");
  });

  it("debounces rapid resizes", () => {
    const { result } = renderHook(() => useViewResize({ debounceMs: 150 }));

    act(() => {
      triggerResize(400, 300);
      vi.advanceTimersByTime(50);
      triggerResize(500, 400);
      vi.advanceTimersByTime(50);
      triggerResize(600, 500);
      vi.advanceTimersByTime(150);
    });

    // Should reflect the last resize only
    expect(result.current.width).toBe(600);
    expect(result.current.height).toBe(500);
  });

  it("maps breakpoints correctly", () => {
    const { result } = renderHook(() => useViewResize({ debounceMs: 0 }));

    // xs: < 480
    act(() => { triggerResize(320, 480); vi.advanceTimersByTime(0); });
    expect(result.current.breakpoint).toBe("xs");

    // sm: 480-767
    act(() => { triggerResize(480, 640); vi.advanceTimersByTime(0); });
    expect(result.current.breakpoint).toBe("sm");

    // md: 768-1023
    act(() => { triggerResize(768, 600); vi.advanceTimersByTime(0); });
    expect(result.current.breakpoint).toBe("md");

    // lg: 1024-1279
    act(() => { triggerResize(1024, 768); vi.advanceTimersByTime(0); });
    expect(result.current.breakpoint).toBe("lg");

    // xl: >= 1280
    act(() => { triggerResize(1440, 900); vi.advanceTimersByTime(0); });
    expect(result.current.breakpoint).toBe("xl");
  });

  it("supports custom breakpoints", () => {
    const { result } = renderHook(() =>
      useViewResize({
        debounceMs: 0,
        breakpoints: { sm: 300, md: 500, lg: 700, xl: 900 },
      })
    );

    act(() => { triggerResize(600, 400); vi.advanceTimersByTime(0); });
    expect(result.current.breakpoint).toBe("md");

    act(() => { triggerResize(800, 400); vi.advanceTimersByTime(0); });
    expect(result.current.breakpoint).toBe("lg");
  });

  it("disconnects observer on unmount", () => {
    const { unmount } = renderHook(() => useViewResize());
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
