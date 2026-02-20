import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventQueue, classifyMessage } from "./event-queue";
import type { InteractionEvent } from "./event-queue";

describe("classifyMessage", () => {
  it("classifies ViewBus select with ids", () => {
    const result = classifyMessage({
      __chuk_bus: true,
      message: { type: "select", source: "map", ids: [1, 2] },
    });
    expect(result).not.toBeNull();
    expect(result!.eventType).toBe("select");
    expect(result!.panelId).toBe("map");
    expect(result!.payload.ids).toEqual([1, 2]);
  });

  it("classifies ViewBus select with empty ids as deselect", () => {
    const result = classifyMessage({
      __chuk_bus: true,
      message: { type: "select", source: "map", ids: [] },
    });
    expect(result!.eventType).toBe("deselect");
  });

  it("classifies ViewBus filter", () => {
    const result = classifyMessage({
      __chuk_bus: true,
      message: { type: "filter", source: "filter-panel" },
    });
    expect(result!.eventType).toBe("filter-change");
    expect(result!.panelId).toBe("filter-panel");
  });

  it("classifies ViewBus navigate", () => {
    const result = classifyMessage({
      __chuk_bus: true,
      message: { type: "navigate", source: "nav" },
    });
    expect(result!.eventType).toBe("navigate");
  });

  it("classifies legacy row-click", () => {
    const result = classifyMessage({
      __chuk_panel_id: "table",
      __chuk_event: "row-click",
    });
    expect(result!.eventType).toBe("select");
    expect(result!.panelId).toBe("table");
  });

  it("classifies legacy feature-click", () => {
    const result = classifyMessage({
      __chuk_panel_id: "map",
      __chuk_event: "feature-click",
    });
    expect(result!.eventType).toBe("select");
    expect(result!.panelId).toBe("map");
  });

  it("classifies legacy submit", () => {
    const result = classifyMessage({
      __chuk_panel_id: "form",
      __chuk_event: "submit",
    });
    expect(result!.eventType).toBe("submit");
  });

  it("returns null for unknown message", () => {
    expect(classifyMessage({ random: true })).toBeNull();
    expect(classifyMessage({})).toBeNull();
  });
});

describe("EventQueue", () => {
  let queue: EventQueue;

  beforeEach(() => {
    queue = new EventQueue();
    vi.useFakeTimers();
  });

  afterEach(() => {
    queue.dispose();
    vi.useRealTimers();
  });

  function selectEvent(panelId = "p1"): InteractionEvent {
    return { panelId, eventType: "select", timestamp: Date.now(), payload: { ids: [1] } };
  }

  it("queues 'always' events immediately", () => {
    queue.push(selectEvent());
    expect(queue.size).toBe(1);
  });

  it("drain returns and clears events", () => {
    queue.push(selectEvent("a"));
    queue.push(selectEvent("b"));
    const drained = queue.drain();
    expect(drained).toHaveLength(2);
    expect(queue.size).toBe(0);
  });

  it("does not queue 'never' events", () => {
    queue.push({
      panelId: "nav",
      eventType: "navigate",
      timestamp: Date.now(),
      payload: {},
    });
    expect(queue.size).toBe(0);
  });

  it("debounces 'filter-change' events", () => {
    queue.push({
      panelId: "f",
      eventType: "filter-change",
      timestamp: Date.now(),
      payload: { a: 1 },
    });
    expect(queue.size).toBe(0);

    vi.advanceTimersByTime(2000);
    expect(queue.size).toBe(1);
  });

  it("resets debounce timer on new event", () => {
    queue.push({
      panelId: "f",
      eventType: "filter-change",
      timestamp: Date.now(),
      payload: { a: 1 },
    });
    vi.advanceTimersByTime(1500);
    expect(queue.size).toBe(0);

    // Push again before timer fires
    queue.push({
      panelId: "f",
      eventType: "filter-change",
      timestamp: Date.now(),
      payload: { a: 2 },
    });
    vi.advanceTimersByTime(1500);
    expect(queue.size).toBe(0);

    vi.advanceTimersByTime(500);
    expect(queue.size).toBe(1);
  });

  it("onEvent listener is called when event is enqueued", () => {
    const listener = vi.fn();
    queue.onEvent(listener);
    queue.push(selectEvent());
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ eventType: "select" }));
  });

  it("onEvent unsubscribe works", () => {
    const listener = vi.fn();
    const unsub = queue.onEvent(listener);
    unsub();
    queue.push(selectEvent());
    expect(listener).not.toHaveBeenCalled();
  });
});
