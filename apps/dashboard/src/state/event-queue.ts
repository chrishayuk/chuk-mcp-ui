// ── Event types ──────────────────────────────────────────────────

export type InteractionEventType =
  | "select"
  | "deselect"
  | "filter-change"
  | "submit"
  | "action"
  | "draw"
  | "navigate";

export interface InteractionEvent {
  panelId: string;
  eventType: InteractionEventType;
  timestamp: number;
  payload: Record<string, unknown>;
}

// ── Queue policy ─────────────────────────────────────────────────

type QueuePolicy = "always" | "debounce" | "never";

const EVENT_POLICY: Record<InteractionEventType, QueuePolicy> = {
  select: "always",
  deselect: "always",
  "filter-change": "debounce",
  submit: "always",
  action: "always",
  draw: "always",
  navigate: "never",
};

const DEBOUNCE_MS = 2000;

// ── Classify incoming postMessage ────────────────────────────────

interface RawBusMessage {
  __chuk_bus?: boolean;
  message?: { type?: string; source?: string; ids?: unknown[]; [k: string]: unknown };
  __chuk_panel_id?: string;
  __chuk_event?: string;
  [k: string]: unknown;
}

/**
 * Attempt to classify a raw postMessage into an InteractionEvent.
 * Returns null if the message isn't classifiable.
 */
export function classifyMessage(data: RawBusMessage): InteractionEvent | null {
  // ViewBus envelope
  if (data.__chuk_bus && data.message) {
    const msg = data.message;
    const panelId = msg.source ?? "";
    const type = msg.type;

    if (type === "select") {
      const ids = Array.isArray(msg.ids) ? msg.ids : [];
      if (ids.length === 0) {
        return {
          panelId,
          eventType: "deselect",
          timestamp: Date.now(),
          payload: {},
        };
      }
      return {
        panelId,
        eventType: "select",
        timestamp: Date.now(),
        payload: { ids, field: msg.field },
      };
    }

    if (type === "filter") {
      return {
        panelId,
        eventType: "filter-change",
        timestamp: Date.now(),
        payload: { filters: msg },
      };
    }

    if (type === "navigate") {
      return {
        panelId,
        eventType: "navigate",
        timestamp: Date.now(),
        payload: { target: msg },
      };
    }

    return null;
  }

  // Legacy __chuk_panel_id messages
  if (data.__chuk_panel_id) {
    const panelId = data.__chuk_panel_id;
    const event = data.__chuk_event;

    if (event === "row-click" || event === "feature-click") {
      return {
        panelId,
        eventType: "select",
        timestamp: Date.now(),
        payload: { raw: data },
      };
    }

    if (event === "submit") {
      return {
        panelId,
        eventType: "submit",
        timestamp: Date.now(),
        payload: { raw: data },
      };
    }

    if (event === "draw") {
      return {
        panelId,
        eventType: "draw",
        timestamp: Date.now(),
        payload: { raw: data },
      };
    }

    if (event === "action") {
      return {
        panelId,
        eventType: "action",
        timestamp: Date.now(),
        payload: { raw: data },
      };
    }
  }

  return null;
}

// ── Event queue ──────────────────────────────────────────────────

type QueueListener = (event: InteractionEvent) => void;

export class EventQueue {
  private events: InteractionEvent[] = [];
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private listeners = new Set<QueueListener>();

  /** Push an event through the queue policy. */
  push(event: InteractionEvent): void {
    const policy = EVENT_POLICY[event.eventType] ?? "always";

    if (policy === "never") return;

    if (policy === "debounce") {
      const key = `${event.panelId}:${event.eventType}`;
      const existing = this.debounceTimers.get(key);
      if (existing) clearTimeout(existing);
      this.debounceTimers.set(
        key,
        setTimeout(() => {
          this.debounceTimers.delete(key);
          this.enqueue(event);
        }, DEBOUNCE_MS),
      );
      return;
    }

    this.enqueue(event);
  }

  /** Drain all queued events and clear the queue. */
  drain(): InteractionEvent[] {
    const drained = this.events.splice(0);
    return drained;
  }

  /** Current queue size. */
  get size(): number {
    return this.events.length;
  }

  /** Subscribe to new events being enqueued. */
  onEvent(listener: QueueListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Clear pending debounce timers (for cleanup). */
  dispose(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  private enqueue(event: InteractionEvent): void {
    this.events.push(event);
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
