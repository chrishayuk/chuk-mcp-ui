/**
 * React context for the in-memory ComposeBus.
 *
 * Wraps each panel in a composed page, providing the bus instance
 * and the panel's ID to all hooks underneath.
 */
import { createContext, useContext, type ReactNode } from "react";
import type { ComposeBus } from "./compose-bus";

interface ComposeBusContextValue {
  bus: ComposeBus;
  panelId: string;
}

const ComposeBusContext = createContext<ComposeBusContextValue | null>(null);

/**
 * Returns the compose bus context, or null if not inside a ComposeBusProvider.
 */
export function useComposeBus(): ComposeBusContextValue | null {
  return useContext(ComposeBusContext);
}

/**
 * Provides ComposeBus + panelId to all children.
 * Used by the compose-client to wrap each hydrated panel.
 */
export function ComposeBusProvider({
  bus,
  panelId,
  children,
}: {
  bus: ComposeBus;
  panelId: string;
  children: ReactNode;
}) {
  return (
    <ComposeBusContext.Provider value={{ bus, panelId }}>
      {children}
    </ComposeBusContext.Provider>
  );
}
