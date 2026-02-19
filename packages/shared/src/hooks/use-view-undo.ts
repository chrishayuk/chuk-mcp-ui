import { useReducer, useCallback, useMemo } from "react";

export interface ViewUndoState<T> {
  state: T;
  set: (value: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface UseViewUndoOptions<T> {
  initialState: T;
  maxHistory?: number;
}

// ── Reducer internals ──────────────────────────────────────────────

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

type UndoAction<T> =
  | { type: "SET"; value: T }
  | { type: "UNDO" }
  | { type: "REDO" };

function createReducer<T>(maxHistory: number) {
  return function reducer(
    state: UndoRedoState<T>,
    action: UndoAction<T>
  ): UndoRedoState<T> {
    switch (action.type) {
      case "SET": {
        const past = [...state.past, state.present];
        if (past.length > maxHistory) past.splice(0, past.length - maxHistory);
        return { past, present: action.value, future: [] };
      }
      case "UNDO": {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        return {
          past: state.past.slice(0, -1),
          present: previous,
          future: [state.present, ...state.future],
        };
      }
      case "REDO": {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        return {
          past: [...state.past, state.present],
          present: next,
          future: state.future.slice(1),
        };
      }
    }
  };
}

// ── Hook ────────────────────────────────────────────────────────────

export function useViewUndo<T>(options: UseViewUndoOptions<T>): ViewUndoState<T> {
  const { initialState, maxHistory = 50 } = options;

  const reducer = useMemo(() => createReducer<T>(maxHistory), [maxHistory]);

  const [internal, dispatch] = useReducer(reducer, {
    past: [],
    present: initialState,
    future: [],
  });

  const set = useCallback(
    (value: T | ((prev: T) => T)) => {
      // Functional updater support: resolve against current present.
      // We dispatch the resolved value — the reducer only sees concrete values.
      if (typeof value === "function") {
        // We need to read current present inside dispatch, but useReducer
        // doesn't expose state in dispatch. Use a wrapper action pattern:
        dispatch({ type: "SET", value: (value as (prev: T) => T)(internal.present) });
      } else {
        dispatch({ type: "SET", value });
      }
    },
    [internal.present]
  );

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  return {
    state: internal.present,
    set,
    undo,
    redo,
    canUndo: internal.past.length > 0,
    canRedo: internal.future.length > 0,
  };
}
