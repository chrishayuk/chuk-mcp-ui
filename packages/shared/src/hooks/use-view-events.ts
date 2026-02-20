import { useCallback } from "react";
import { useViewBus } from "../bus";
import type {
  SelectMessage,
  FilterMessage,
  UpdateMessage,
  ViewMessage,
} from "../bus/types";

// ── Event types ──────────────────────────────────────────────────

export type ViewEventType =
  | "select"
  | "deselect"
  | "filter-change"
  | "submit"
  | "action"
  | "draw";

export interface ViewEventPayload {
  select: { ids: string[]; field?: string };
  deselect: Record<string, never>;
  "filter-change": { field: string; value: unknown };
  submit: { tool?: string; values: Record<string, unknown> };
  action: { name: string; args?: Record<string, unknown> };
  draw: { geometry: unknown; bounds?: unknown };
}

// ── Hook return type ─────────────────────────────────────────────

export interface ViewEventsState {
  /** Emit a selection event (user clicked a row, feature, bar, etc.) */
  emitSelect: (ids: string[], field?: string) => void;
  /** Emit a deselection event (user cleared selection) */
  emitDeselect: () => void;
  /** Emit a filter change event */
  emitFilterChange: (field: string, value: unknown) => void;
  /** Emit a form submit event */
  emitSubmit: (values: Record<string, unknown>, tool?: string) => void;
  /** Emit an action button event */
  emitAction: (name: string, args?: Record<string, unknown>) => void;
  /** Emit a draw/bbox event */
  emitDraw: (geometry: unknown, bounds?: unknown) => void;
}

type BusSend = Omit<ViewMessage, "source">;

// ── Hook ─────────────────────────────────────────────────────────

/**
 * Convenience hook for emitting typed interaction events via the ViewBus.
 *
 * Wraps useViewBus.send() with typed methods for each event type.
 * Events are sent as ViewBus select/filter/update messages, ensuring
 * they're properly routed through the dashboard's CrossViewLink system
 * and captured by the EventQueue for LLM context.
 */
export function useViewEvents(): ViewEventsState {
  const bus = useViewBus();

  const emitSelect = useCallback(
    (ids: string[], field?: string) => {
      const msg: Omit<SelectMessage, "source"> & { field?: string } = {
        type: "select",
        ids,
        ...(field !== undefined ? { field } : {}),
      };
      bus.send(msg as BusSend);
    },
    [bus],
  );

  const emitDeselect = useCallback(() => {
    const msg: Omit<SelectMessage, "source"> = { type: "select", ids: [] };
    bus.send(msg as BusSend);
  }, [bus]);

  const emitFilterChange = useCallback(
    (field: string, value: unknown) => {
      const msg: Omit<FilterMessage, "source"> = { type: "filter", field, value };
      bus.send(msg as BusSend);
    },
    [bus],
  );

  const emitSubmit = useCallback(
    (values: Record<string, unknown>, tool?: string) => {
      const msg: Omit<UpdateMessage, "source"> = {
        type: "update",
        field: "__submit",
        value: { tool, values },
      };
      bus.send(msg as BusSend);
    },
    [bus],
  );

  const emitAction = useCallback(
    (name: string, args?: Record<string, unknown>) => {
      const msg: Omit<UpdateMessage, "source"> = {
        type: "update",
        field: "__action",
        value: { name, args },
      };
      bus.send(msg as BusSend);
    },
    [bus],
  );

  const emitDraw = useCallback(
    (geometry: unknown, bounds?: unknown) => {
      const msg: Omit<UpdateMessage, "source"> = {
        type: "update",
        field: "__draw",
        value: { geometry, bounds },
      };
      bus.send(msg as BusSend);
    },
    [bus],
  );

  return {
    emitSelect,
    emitDeselect,
    emitFilterChange,
    emitSubmit,
    emitAction,
    emitDraw,
  };
}
