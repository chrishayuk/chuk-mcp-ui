import type { UIState, PanelState } from "./ui-state-store";
import type { InteractionEvent } from "./event-queue";

// ── Fingerprint ──────────────────────────────────────────────────

/**
 * Compute a 6-character hash of structured content.
 * Simple DJB2 hash — fast and good enough for change detection.
 */
export function computeFingerprint(content: unknown): string {
  const str = JSON.stringify(content ?? null);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36).slice(0, 6).padStart(6, "0");
}

// ── Data summary ─────────────────────────────────────────────────

/**
 * Heuristic summary of structured content for the LLM.
 * Looks for common shapes (features, rows, value) and produces a compact string.
 */
export function computeDataSummary(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const c = content as Record<string, unknown>;

  // GeoJSON-like: { features: [...] }
  if (Array.isArray(c.features)) {
    return `${c.features.length} features`;
  }

  // Map: { layers: [...] }
  if (Array.isArray(c.layers)) {
    const totalFeatures = (c.layers as Array<Record<string, unknown>>).reduce(
      (sum, layer) =>
        sum + (Array.isArray(layer.features) ? layer.features.length : 0),
      0,
    );
    return `${c.layers.length} layers, ${totalFeatures} features`;
  }

  // Datatable: { rows: [...], columns: [...] }
  if (Array.isArray(c.rows)) {
    const cols = Array.isArray(c.columns) ? c.columns.length : 0;
    return `${c.rows.length} rows, ${cols} columns`;
  }

  // Counter/gauge: { value: N }
  if (c.value !== undefined) {
    return `value: ${c.value}`;
  }

  // Chart: { series: [...] }
  if (Array.isArray(c.series)) {
    return `${c.series.length} series`;
  }

  // Items array (gallery, ranked, etc.)
  if (Array.isArray(c.items)) {
    return `${c.items.length} items`;
  }

  return "";
}

// ── Serialisation ────────────────────────────────────────────────

/** Compact panel state for LLM context (no raw data). */
interface SerializedPanel {
  id: string;
  label?: string;
  viewType?: string;
  visible: boolean;
  collapsed: boolean;
  selection: PanelState["selection"];
  dataFingerprint: string;
  dataSummary: string;
  loading: boolean;
  error: string | null;
}

/** Serialise UIState to compact JSON suitable for LLM context (~800 tokens for 6 panels). */
export function serialiseUIState(state: UIState): string {
  const compact = {
    version: state.version,
    layout: state.layout,
    panels: state.panels.map(
      (p): SerializedPanel => ({
        id: p.id,
        label: p.label,
        viewType: p.viewType,
        visible: p.visible,
        collapsed: p.collapsed,
        selection: p.selection,
        dataFingerprint: p.dataFingerprint,
        dataSummary: p.dataSummary,
        loading: p.loading,
        error: p.error,
      }),
    ),
    links: state.links,
  };
  return JSON.stringify(compact);
}

// ── Emitter ──────────────────────────────────────────────────────

/**
 * Interface for pushing state to the LLM's model context.
 * Compatible with the ext-apps App.updateModelContext method.
 */
export interface ModelContextSender {
  updateModelContext(
    params: {
      content?: Array<{ type: "text"; text: string }>;
      structuredContent?: Record<string, unknown>;
    },
    ...args: unknown[]
  ): Promise<unknown>;
}

/**
 * Emit current UI state and pending events to the LLM via updateModelContext.
 * Each call overwrites the previous context. Host defers until next user message.
 */
export async function emitState(
  sender: ModelContextSender,
  state: UIState,
  events: InteractionEvent[],
): Promise<void> {
  const stateJson = serialiseUIState(state);
  const eventsJson = JSON.stringify(events);

  await sender.updateModelContext({
    content: [
      {
        type: "text",
        text: `<ui_state>\n${stateJson}\n</ui_state>\n<ui_events>\n${eventsJson}\n</ui_events>`,
      },
    ],
  });
}

// ── Rate-limited emitter ─────────────────────────────────────────

/**
 * Create a rate-limited emitter that batches state pushes.
 * At most one updateModelContext call per `intervalMs` (default 500ms).
 */
export function createRateLimitedEmitter(
  sender: ModelContextSender,
  intervalMs = 500,
): {
  emit: (state: UIState, events: InteractionEvent[]) => void;
  dispose: () => void;
} {
  let pending: { state: UIState; events: InteractionEvent[] } | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastEmit = 0;

  function flush() {
    if (!pending) return;
    const { state, events } = pending;
    pending = null;
    lastEmit = Date.now();
    timer = null;
    emitState(sender, state, events).catch(() => {
      // Swallow errors — host may not support updateModelContext
    });
  }

  return {
    emit(state: UIState, events: InteractionEvent[]) {
      pending = { state, events };
      const elapsed = Date.now() - lastEmit;
      if (elapsed >= intervalMs) {
        flush();
      } else if (!timer) {
        timer = setTimeout(flush, intervalMs - elapsed);
      }
    },
    dispose() {
      if (timer) clearTimeout(timer);
      pending = null;
    },
  };
}
