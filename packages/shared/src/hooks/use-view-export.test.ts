import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewExport } from "./use-view-export";

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

// ── Mock download-related APIs ──────────────────────────────────────

const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();
const clickedAnchors: Array<{ href: string; download: string }> = [];

beforeEach(() => {
  mockSend.mockClear();
  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();
  clickedAnchors.length = 0;
  subscriptions.clear();

  globalThis.URL.createObjectURL = mockCreateObjectURL;
  globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

  // Intercept anchor clicks without breaking React's DOM operations
  const origCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag: string, options?: ElementCreationOptions) => {
    const el = origCreateElement(tag, options);
    if (tag === "a") {
      el.click = () => {
        clickedAnchors.push({
          href: (el as HTMLAnchorElement).href || el.getAttribute("href") || "",
          download: (el as HTMLAnchorElement).download || el.getAttribute("download") || "",
        });
      };
    }
    return el;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useViewExport", () => {
  describe("exportCsv", () => {
    it("generates CSV and triggers download", () => {
      const { result } = renderHook(() => useViewExport());

      const columns = [
        { key: "name", label: "Name" },
        { key: "age", label: "Age" },
      ];
      const rows = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ];

      act(() => result.current.exportCsv(columns, rows, "test.csv"));

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: "text/csv;charset=utf-8" })
      );
      expect(clickedAnchors.length).toBe(1);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("escapes commas and quotes in CSV values", () => {
      const { result } = renderHook(() => useViewExport());

      const columns = [{ key: "val", label: "Value" }];
      const rows = [
        { val: 'has "quotes"' },
        { val: "has, comma" },
        { val: "has\nnewline" },
      ];

      act(() => result.current.exportCsv(columns, rows));

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(clickedAnchors.length).toBe(1);
    });

    it("handles null/undefined values", () => {
      const { result } = renderHook(() => useViewExport());

      const columns = [{ key: "val", label: "Value" }];
      const rows = [{ val: null }, { val: undefined }, {}];

      act(() => result.current.exportCsv(columns, rows as Record<string, unknown>[]));
      expect(clickedAnchors.length).toBe(1);
    });
  });

  describe("exportJson", () => {
    it("generates JSON and triggers download", () => {
      const { result } = renderHook(() => useViewExport());
      const data = { items: [1, 2, 3] };

      act(() => result.current.exportJson(data, "test.json"));

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: "application/json" })
      );
      expect(clickedAnchors.length).toBe(1);
    });
  });

  describe("exportPng", () => {
    it("returns early when containerRef is missing", async () => {
      const { result } = renderHook(() => useViewExport());

      await act(async () => {
        await result.current.exportPng();
      });

      expect(result.current.isExporting).toBe(false);
    });
  });

  describe("bus integration", () => {
    it("calls onExportRequest when export-request message arrives", () => {
      const onExportRequest = vi.fn();
      renderHook(() => useViewExport({ onExportRequest }));

      act(() => {
        simulateBusMessage("export-request", { format: "csv" });
      });

      expect(onExportRequest).toHaveBeenCalledWith("csv");
    });

    it("does not crash when onExportRequest is not provided", () => {
      renderHook(() => useViewExport());

      expect(() => {
        act(() => {
          simulateBusMessage("export-request", { format: "png" });
        });
      }).not.toThrow();
    });
  });
});
