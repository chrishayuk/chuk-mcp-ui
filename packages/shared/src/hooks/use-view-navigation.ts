import { useReducer, useCallback, useEffect, useRef } from "react";
import { useViewBus } from "../bus";
import type { ViewMessage } from "../bus";

type BusPayload = Omit<ViewMessage, "source">;

export interface NavigationEntry {
  target: string;
  params: Record<string, unknown>;
}

export interface ViewNavigationState {
  current: NavigationEntry | null;
  stack: readonly NavigationEntry[];
  currentIndex: number;
  push: (target: string, params?: Record<string, unknown>) => void;
  replace: (target: string, params?: Record<string, unknown>) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

interface UseViewNavigationOptions {
  panelId?: string;
  initialRoute?: NavigationEntry;
  onNavigate?: (entry: NavigationEntry) => void;
}

// ── Reducer ────────────────────────────────────────────────────────

interface NavState {
  stack: NavigationEntry[];
  index: number;
}

type NavAction =
  | { type: "PUSH"; entry: NavigationEntry }
  | { type: "REPLACE"; entry: NavigationEntry }
  | { type: "BACK" }
  | { type: "FORWARD" };

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case "PUSH": {
      // Trim any forward entries after current index, then append
      const trimmed = state.stack.slice(0, state.index + 1);
      return {
        stack: [...trimmed, action.entry],
        index: trimmed.length,
      };
    }
    case "REPLACE": {
      const next = [...state.stack];
      next[state.index] = action.entry;
      return { stack: next, index: state.index };
    }
    case "BACK": {
      if (state.index <= 0) return state;
      return { ...state, index: state.index - 1 };
    }
    case "FORWARD": {
      if (state.index >= state.stack.length - 1) return state;
      return { ...state, index: state.index + 1 };
    }
  }
}

// ── Hook ───────────────────────────────────────────────────────────

/**
 * Navigation stack hook.
 *
 * Wraps `useViewBus` to send and receive `navigate` messages. Manages a
 * browser-like history stack with back/forward support. Pushing after a
 * back operation trims forward entries, matching standard browser behaviour.
 */
export function useViewNavigation(
  options: UseViewNavigationOptions = {}
): ViewNavigationState {
  const bus = useViewBus({ panelId: options.panelId });
  const onNavigateRef = useRef(options.onNavigate);
  onNavigateRef.current = options.onNavigate;

  const [state, dispatch] = useReducer(navReducer, undefined, () => {
    if (options.initialRoute) {
      return { stack: [options.initialRoute], index: 0 };
    }
    return { stack: [], index: -1 };
  });

  const push = useCallback(
    (target: string, params: Record<string, unknown> = {}) => {
      const entry: NavigationEntry = { target, params };
      dispatch({ type: "PUSH", entry });
      bus.send({ type: "navigate", target, params } as BusPayload);
      onNavigateRef.current?.(entry);
    },
    [bus]
  );

  const replace = useCallback(
    (target: string, params: Record<string, unknown> = {}) => {
      const entry: NavigationEntry = { target, params };
      dispatch({ type: "REPLACE", entry });
      bus.send({ type: "navigate", target, params } as BusPayload);
      onNavigateRef.current?.(entry);
    },
    [bus]
  );

  const goBack = useCallback(() => dispatch({ type: "BACK" }), []);
  const goForward = useCallback(() => dispatch({ type: "FORWARD" }), []);

  useEffect(() => {
    const unsub = bus.subscribe("navigate", (msg) => {
      const entry: NavigationEntry = { target: msg.target, params: msg.params };
      dispatch({ type: "PUSH", entry });
      onNavigateRef.current?.(entry);
    });
    return unsub;
  }, [bus]);

  const current = state.stack[state.index] ?? null;
  const canGoBack = state.index > 0;
  const canGoForward = state.index < state.stack.length - 1;

  return {
    current,
    stack: state.stack,
    currentIndex: state.index,
    push,
    replace,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
  };
}
