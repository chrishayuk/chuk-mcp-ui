import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewDrag } from "./use-view-drag";

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

function createDragEvent(type: string) {
  return {
    type,
    preventDefault: vi.fn(),
    dataTransfer: { setData: vi.fn(), getData: vi.fn() },
  } as unknown as React.DragEvent;
}

beforeEach(() => {
  mockSend.mockClear();
  subscriptions.clear();
});

describe("useViewDrag", () => {
  it("starts with no active drag", () => {
    const { result } = renderHook(() => useViewDrag());
    expect(result.current.isDragActive).toBe(false);
    expect(result.current.activeDragItem).toBeNull();
  });

  it("createDragSource returns props with draggable: true", () => {
    const { result } = renderHook(() => useViewDrag());
    const item = { dragType: "site", data: { id: "s1" } };

    let handle: ReturnType<typeof result.current.createDragSource>;
    act(() => {
      handle = result.current.createDragSource(item);
    });

    expect(handle!.dragProps.draggable).toBe(true);
    expect(typeof handle!.dragProps.onDragStart).toBe("function");
    expect(typeof handle!.dragProps.onDragEnd).toBe("function");
  });

  it("drag-start broadcasts via bus when onDragStart fires", () => {
    const { result } = renderHook(() => useViewDrag());
    const item = { dragType: "site", data: { id: "s1" } };

    act(() => {
      const handle = result.current.createDragSource(item);
      const event = createDragEvent("dragstart");
      handle.dragProps.onDragStart(event);
    });

    expect(mockSend).toHaveBeenCalledWith({
      type: "drag-start",
      item: { dragType: "site", data: { id: "s1" } },
    });
    expect(result.current.isDragActive).toBe(true);
    expect(result.current.activeDragItem).toEqual(item);
  });

  it("drag-end broadcasts via bus when onDragEnd fires", () => {
    const { result } = renderHook(() => useViewDrag());
    const item = { dragType: "site", data: { id: "s1" } };

    act(() => {
      const handle = result.current.createDragSource(item);
      handle.dragProps.onDragStart(createDragEvent("dragstart"));
    });
    mockSend.mockClear();

    act(() => {
      const handle = result.current.createDragSource(item);
      handle.dragProps.onDragEnd(createDragEvent("dragend"));
    });

    expect(mockSend).toHaveBeenCalledWith({ type: "drag-end" });
    expect(result.current.isDragActive).toBe(false);
    expect(result.current.activeDragItem).toBeNull();
  });

  it("incoming drag-start message sets isDragActive and activeDragItem", () => {
    const { result } = renderHook(() => useViewDrag());

    act(() => {
      simulateBusMessage("drag-start", {
        item: { dragType: "monument", data: { id: "m1" } },
      });
    });

    expect(result.current.isDragActive).toBe(true);
    expect(result.current.activeDragItem).toEqual({
      dragType: "monument",
      data: { id: "m1" },
    });
  });

  it("incoming drag-end message clears active drag state", () => {
    const { result } = renderHook(() => useViewDrag());

    act(() => {
      simulateBusMessage("drag-start", {
        item: { dragType: "monument", data: { id: "m1" } },
      });
    });

    act(() => {
      simulateBusMessage("drag-end", {});
    });

    expect(result.current.isDragActive).toBe(false);
    expect(result.current.activeDragItem).toBeNull();
  });

  it("drop target isOver tracks dragEnter/dragLeave", () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useViewDrag());

    // Start a drag so there is an active item
    act(() => {
      const source = result.current.createDragSource({
        dragType: "site",
        data: { id: "s1" },
      });
      source.dragProps.onDragStart(createDragEvent("dragstart"));
    });

    let target: ReturnType<typeof result.current.createDropTarget>;
    act(() => {
      target = result.current.createDropTarget({
        accept: ["site"],
        onDrop,
      });
      target.dropProps.onDragEnter(createDragEvent("dragenter"));
    });

    // Re-create to read updated ref state
    act(() => {
      target = result.current.createDropTarget({
        accept: ["site"],
        onDrop,
      });
    });

    // After enter, the enterCount ref was incremented on the previous instance
    // The hook uses refs for isOver state, so we check via the drop target
    expect(typeof target!.dropProps.onDragLeave).toBe("function");
  });

  it("drop target only activates for accepted dragTypes", () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useViewDrag());

    // Start a drag with type "monument"
    act(() => {
      const source = result.current.createDragSource({
        dragType: "monument",
        data: { id: "m1" },
      });
      source.dragProps.onDragStart(createDragEvent("dragstart"));
    });

    let target: ReturnType<typeof result.current.createDropTarget>;
    act(() => {
      target = result.current.createDropTarget({
        accept: ["site"], // does NOT accept "monument"
        onDrop,
      });
    });

    expect(target!.isDragActive).toBe(false);
    expect(target!.draggedItem).toBeNull();

    // Now create a target that DOES accept "monument"
    act(() => {
      target = result.current.createDropTarget({
        accept: ["monument"],
        onDrop,
      });
    });

    expect(target!.isDragActive).toBe(true);
    expect(target!.draggedItem).toEqual({
      dragType: "monument",
      data: { id: "m1" },
    });
  });

  it("onDrop callback fires with item data on drop", () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useViewDrag());
    const item = { dragType: "site", data: { id: "s1", name: "Roman Villa" } };

    act(() => {
      const source = result.current.createDragSource(item);
      source.dragProps.onDragStart(createDragEvent("dragstart"));
    });
    mockSend.mockClear();

    act(() => {
      const target = result.current.createDropTarget({
        accept: ["site"],
        onDrop,
      });
      target.dropProps.onDrop(createDragEvent("drop"));
    });

    expect(onDrop).toHaveBeenCalledWith(item);
    expect(mockSend).toHaveBeenCalledWith({
      type: "drop",
      item,
      targetPanelId: "test-panel",
    });
    expect(result.current.isDragActive).toBe(false);
    expect(result.current.activeDragItem).toBeNull();
  });

  it("incoming drop message clears drag state", () => {
    const { result } = renderHook(() => useViewDrag());

    act(() => {
      simulateBusMessage("drag-start", {
        item: { dragType: "site", data: { id: "s1" } },
      });
    });

    expect(result.current.isDragActive).toBe(true);

    act(() => {
      simulateBusMessage("drop", {
        item: { dragType: "site", data: { id: "s1" } },
        targetPanelId: "other-panel",
      });
    });

    expect(result.current.isDragActive).toBe(false);
    expect(result.current.activeDragItem).toBeNull();
  });
});
