import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  computeFingerprint,
  computeDataSummary,
  serialiseUIState,
  emitState,
  createRateLimitedEmitter,
} from "./state-emitter";
import type { UIState } from "./ui-state-store";
import type { ModelContextSender } from "./state-emitter";
import type { InteractionEvent } from "./event-queue";

function makeState(panels: UIState["panels"] = []): UIState {
  return { version: "3.0", layout: "auto", panels, links: [] };
}

function makePanel(id: string, content: unknown = {}) {
  return {
    id,
    visible: true,
    collapsed: false,
    selection: null,
    dataFingerprint: computeFingerprint(content),
    loading: false,
    error: null,
    dataSummary: computeDataSummary(content),
    structuredContent: content,
  };
}

describe("computeFingerprint", () => {
  it("returns a 6-character string", () => {
    const fp = computeFingerprint({ hello: "world" });
    expect(fp).toHaveLength(6);
    expect(typeof fp).toBe("string");
  });

  it("returns different fingerprints for different content", () => {
    const a = computeFingerprint({ a: 1 });
    const b = computeFingerprint({ b: 2 });
    expect(a).not.toBe(b);
  });

  it("returns same fingerprint for same content", () => {
    const a = computeFingerprint({ x: [1, 2, 3] });
    const b = computeFingerprint({ x: [1, 2, 3] });
    expect(a).toBe(b);
  });

  it("handles null/undefined", () => {
    const a = computeFingerprint(null);
    const b = computeFingerprint(undefined);
    expect(a).toBe(b); // both stringify to "null"
  });
});

describe("computeDataSummary", () => {
  it("summarizes rows and columns", () => {
    expect(computeDataSummary({ rows: [1, 2, 3], columns: ["a", "b"] }))
      .toBe("3 rows, 2 columns");
  });

  it("summarizes features", () => {
    expect(computeDataSummary({ features: [1, 2, 3, 4] }))
      .toBe("4 features");
  });

  it("summarizes layers", () => {
    expect(computeDataSummary({
      layers: [
        { features: [1, 2] },
        { features: [3] },
      ],
    })).toBe("2 layers, 3 features");
  });

  it("summarizes value", () => {
    expect(computeDataSummary({ value: 42 })).toBe("value: 42");
  });

  it("summarizes series", () => {
    expect(computeDataSummary({ series: [{ data: [] }, { data: [] }] }))
      .toBe("2 series");
  });

  it("summarizes items", () => {
    expect(computeDataSummary({ items: [1, 2, 3] })).toBe("3 items");
  });

  it("returns empty for non-object", () => {
    expect(computeDataSummary(null)).toBe("");
    expect(computeDataSummary(42)).toBe("");
  });
});

describe("serialiseUIState", () => {
  it("excludes structuredContent from serialization", () => {
    const state = makeState([
      makePanel("p1", { type: "map", layers: new Array(1000) }),
    ]);
    const json = serialiseUIState(state);
    const parsed = JSON.parse(json);
    expect(parsed.panels[0].structuredContent).toBeUndefined();
    expect(parsed.panels[0].dataFingerprint).toBeDefined();
    expect(parsed.panels[0].dataSummary).toBeDefined();
  });

  it("includes version, layout, links", () => {
    const state = makeState();
    const parsed = JSON.parse(serialiseUIState(state));
    expect(parsed.version).toBe("3.0");
    expect(parsed.layout).toBe("auto");
    expect(parsed.links).toEqual([]);
  });

  it("keeps under 800 tokens for 6 panels", () => {
    const panels = Array.from({ length: 6 }, (_, i) =>
      makePanel(`p${i}`, { type: "chart", series: [{ data: [] }] }),
    );
    const json = serialiseUIState(makeState(panels));
    // Rough token estimate: 1 token ≈ 4 chars
    const estimatedTokens = json.length / 4;
    expect(estimatedTokens).toBeLessThan(800);
  });
});

describe("emitState", () => {
  it("calls updateModelContext with ui_state and ui_events", async () => {
    const sender: ModelContextSender = {
      updateModelContext: vi.fn().mockResolvedValue({}),
    };
    const state = makeState([makePanel("p1")]);
    const events: InteractionEvent[] = [
      { panelId: "p1", eventType: "select", timestamp: 1, payload: { ids: [1] } },
    ];

    await emitState(sender, state, events);

    expect(sender.updateModelContext).toHaveBeenCalledTimes(1);
    const call = (sender.updateModelContext as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.content[0].type).toBe("text");
    expect(call.content[0].text).toContain("<ui_state>");
    expect(call.content[0].text).toContain("<ui_events>");
  });
});

describe("createRateLimitedEmitter", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("emits immediately when no recent emit", () => {
    const sender: ModelContextSender = {
      updateModelContext: vi.fn().mockResolvedValue({}),
    };
    const emitter = createRateLimitedEmitter(sender, 500);
    emitter.emit(makeState(), []);
    expect(sender.updateModelContext).toHaveBeenCalledTimes(1);
    emitter.dispose();
  });

  it("batches rapid-fire emits", () => {
    const sender: ModelContextSender = {
      updateModelContext: vi.fn().mockResolvedValue({}),
    };
    const emitter = createRateLimitedEmitter(sender, 500);

    emitter.emit(makeState(), []);
    expect(sender.updateModelContext).toHaveBeenCalledTimes(1);

    emitter.emit(makeState(), []);
    emitter.emit(makeState(), []);
    expect(sender.updateModelContext).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    expect(sender.updateModelContext).toHaveBeenCalledTimes(2);

    emitter.dispose();
  });
});
