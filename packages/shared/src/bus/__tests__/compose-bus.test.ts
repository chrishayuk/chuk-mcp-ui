import { describe, it, expect, vi, beforeEach } from "vitest";
import { createComposeBus, type ComposeBus } from "../compose-bus";
import type { ViewMessage, SelectMessage, FilterMessage } from "../types";

type SelectPayload = Omit<SelectMessage, "source">;
type FilterPayload = Omit<FilterMessage, "source">;

// Helper to flush microtasks
const flush = () => new Promise<void>((r) => setTimeout(r, 0));

describe("createComposeBus", () => {
  let bus: ComposeBus;

  beforeEach(() => {
    bus = createComposeBus();
  });

  it("delivers messages between registered panels", async () => {
    bus.registerPanel("a");
    bus.registerPanel("b");

    const handler = vi.fn();
    bus.subscribe("b", "select", handler);

    bus.send("a", { type: "select", ids: ["1", "2"] } as SelectPayload);
    await flush();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0]).toMatchObject({
      type: "select",
      source: "a",
      ids: ["1", "2"],
    });
    expect(handler.mock.calls[0][1]).toBe("a");
  });

  it("does not deliver messages to the sender", async () => {
    bus.registerPanel("a");

    const handler = vi.fn();
    bus.subscribe("a", "select", handler);

    bus.send("a", { type: "select", ids: ["1"] } as SelectPayload);
    await flush();

    expect(handler).not.toHaveBeenCalled();
  });

  it("subscribeAll receives all message types", async () => {
    bus.registerPanel("a");
    bus.registerPanel("b");

    const handler = vi.fn();
    bus.subscribeAll("b", handler);

    bus.send("a", { type: "select", ids: ["1"] } as SelectPayload);
    bus.send("a", { type: "filter", field: "x", value: 1 } as FilterPayload);
    await flush();

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[0][0].type).toBe("select");
    expect(handler.mock.calls[1][0].type).toBe("filter");
  });

  it("unsubscribe stops delivery", async () => {
    bus.registerPanel("a");
    bus.registerPanel("b");

    const handler = vi.fn();
    const unsub = bus.subscribe("b", "select", handler);

    bus.send("a", { type: "select", ids: ["1"] } as SelectPayload);
    await flush();
    expect(handler).toHaveBeenCalledOnce();

    unsub();
    bus.send("a", { type: "select", ids: ["2"] } as SelectPayload);
    await flush();
    expect(handler).toHaveBeenCalledOnce(); // Still just the one call
  });

  it("auto-registers panels on send", async () => {
    // Don't explicitly register — send auto-registers
    bus.registerPanel("b");
    const handler = vi.fn();
    bus.subscribe("b", "select", handler);

    bus.send("a", { type: "select", ids: ["1"] } as SelectPayload);
    await flush();

    expect(handler).toHaveBeenCalledOnce();
  });

  it("destroy clears all handlers", async () => {
    bus.registerPanel("a");
    bus.registerPanel("b");

    const handler = vi.fn();
    bus.subscribe("b", "select", handler);

    bus.destroy();

    bus.send("a", { type: "select", ids: ["1"] } as SelectPayload);
    await flush();

    expect(handler).not.toHaveBeenCalled();
  });

  describe("with link filter", () => {
    it("only delivers messages matching declared links", async () => {
      const filter = (
        message: ViewMessage,
        source: string,
        target: string,
      ): boolean => {
        // Only allow select messages from "table" to "map"
        return source === "table" && target === "map" && message.type === "select";
      };

      const filteredBus = createComposeBus(filter);
      filteredBus.registerPanel("table");
      filteredBus.registerPanel("map");
      filteredBus.registerPanel("chart");

      const mapHandler = vi.fn();
      const chartHandler = vi.fn();
      filteredBus.subscribe("map", "select", mapHandler);
      filteredBus.subscribe("chart", "select", chartHandler);

      filteredBus.send("table", { type: "select", ids: ["1"] } as SelectPayload);
      await flush();

      expect(mapHandler).toHaveBeenCalledOnce();
      expect(chartHandler).not.toHaveBeenCalled();
    });

    it("blocks messages not matching any link", async () => {
      const filter = () => false; // Block everything

      const filteredBus = createComposeBus(filter);
      filteredBus.registerPanel("a");
      filteredBus.registerPanel("b");

      const handler = vi.fn();
      filteredBus.subscribe("b", "select", handler);

      filteredBus.send("a", { type: "select", ids: ["1"] } as SelectPayload);
      await flush();

      expect(handler).not.toHaveBeenCalled();
    });

    it("passes all messages when no filter (undefined)", async () => {
      const noFilterBus = createComposeBus(undefined);
      noFilterBus.registerPanel("a");
      noFilterBus.registerPanel("b");
      noFilterBus.registerPanel("c");

      const handlerB = vi.fn();
      const handlerC = vi.fn();
      noFilterBus.subscribe("b", "select", handlerB);
      noFilterBus.subscribe("c", "select", handlerC);

      noFilterBus.send("a", { type: "select", ids: ["1"] } as SelectPayload);
      await flush();

      expect(handlerB).toHaveBeenCalledOnce();
      expect(handlerC).toHaveBeenCalledOnce();
    });
  });
});
