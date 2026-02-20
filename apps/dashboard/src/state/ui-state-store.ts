import type {
  DashboardContentV2,
  PanelV2,
  CrossViewLink,
  LayoutConfig,
} from "../schema";
import { computeFingerprint, computeDataSummary } from "./state-emitter";

// ── Panel state ──────────────────────────────────────────────────

export interface PanelSelection {
  field: string;
  values: unknown[];
  label?: string;
}

export interface PanelState {
  id: string;
  label?: string;
  viewType?: string;
  viewUrl?: string;
  visible: boolean;
  collapsed: boolean;
  selection: PanelSelection | null;
  dataFingerprint: string;
  loading: boolean;
  error: string | null;
  dataSummary: string;
  structuredContent: unknown;
}

// ── UI state ─────────────────────────────────────────────────────

export interface UIState {
  version: "3.0";
  layout: LayoutConfig;
  panels: PanelState[];
  links: CrossViewLink[];
}

// ── Store ────────────────────────────────────────────────────────

type Listener = () => void;

export class UIStateStore {
  private state: UIState;
  private listeners = new Set<Listener>();

  constructor(state: UIState) {
    this.state = state;
  }

  /** Current snapshot — safe for useSyncExternalStore. */
  getState(): UIState {
    return this.state;
  }

  /** Immutable update. Notifies listeners on every call. */
  setState(updater: (prev: UIState) => UIState): void {
    this.state = updater(this.state);
    for (const listener of this.listeners) {
      listener();
    }
  }

  /** Subscribe for change notifications. Returns unsubscribe function. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Find a panel by id. */
  getPanel(id: string): PanelState | undefined {
    return this.state.panels.find((p) => p.id === id);
  }

  /** Initialise from a v2.0 dashboard payload. */
  static fromDashboard(data: DashboardContentV2): UIStateStore {
    const panels: PanelState[] = data.panels.map((p) =>
      panelV2ToPanelState(p),
    );
    return new UIStateStore({
      version: "3.0",
      layout: data.layout,
      panels,
      links: data.links ?? [],
    });
  }
}

/** Convert a v2 panel definition to runtime PanelState. */
export function panelV2ToPanelState(p: PanelV2): PanelState {
  return {
    id: p.id,
    label: p.label,
    viewType: p.viewType,
    viewUrl: p.viewUrl,
    visible: !p.collapsed && !p.showWhen,
    collapsed: p.collapsed ?? false,
    selection: null,
    dataFingerprint: computeFingerprint(p.structuredContent),
    loading: false,
    error: null,
    dataSummary: computeDataSummary(p.structuredContent),
    structuredContent: p.structuredContent,
  };
}
