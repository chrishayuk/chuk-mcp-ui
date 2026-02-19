import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewUndo } from "./use-view-undo";

describe("useViewUndo", () => {
  it("returns initial state", () => {
    const { result } = renderHook(() =>
      useViewUndo({ initialState: "hello" })
    );
    expect(result.current.state).toBe("hello");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("updates state with set()", () => {
    const { result } = renderHook(() =>
      useViewUndo({ initialState: 0 })
    );

    act(() => result.current.set(1));
    expect(result.current.state).toBe(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("supports functional updater", () => {
    const { result } = renderHook(() =>
      useViewUndo({ initialState: 10 })
    );

    act(() => result.current.set((prev) => prev + 5));
    expect(result.current.state).toBe(15);
  });

  it("undoes to previous state", () => {
    const { result } = renderHook(() =>
      useViewUndo({ initialState: "a" })
    );

    act(() => result.current.set("b"));
    act(() => result.current.set("c"));
    expect(result.current.state).toBe("c");

    act(() => result.current.undo());
    expect(result.current.state).toBe("b");
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.state).toBe("a");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("redoes to next state", () => {
    const { result } = renderHook(() =>
      useViewUndo({ initialState: "a" })
    );

    act(() => result.current.set("b"));
    act(() => result.current.set("c"));
    act(() => result.current.undo());
    act(() => result.current.undo());

    act(() => result.current.redo());
    expect(result.current.state).toBe("b");

    act(() => result.current.redo());
    expect(result.current.state).toBe("c");
    expect(result.current.canRedo).toBe(false);
  });

  it("clears future on new set after undo", () => {
    const { result } = renderHook(() =>
      useViewUndo({ initialState: "a" })
    );

    act(() => result.current.set("b"));
    act(() => result.current.set("c"));
    act(() => result.current.undo()); // back to "b"

    act(() => result.current.set("d")); // fork: "b" -> "d"
    expect(result.current.state).toBe("d");
    expect(result.current.canRedo).toBe(false);

    act(() => result.current.undo());
    expect(result.current.state).toBe("b");
  });

  it("undo at empty past is a no-op", () => {
    const { result } = renderHook(() =>
      useViewUndo({ initialState: "x" })
    );

    act(() => result.current.undo());
    expect(result.current.state).toBe("x");
  });

  it("redo at empty future is a no-op", () => {
    const { result } = renderHook(() =>
      useViewUndo({ initialState: "x" })
    );

    act(() => result.current.redo());
    expect(result.current.state).toBe("x");
  });

  it("respects maxHistory cap", () => {
    const { result } = renderHook(() =>
      useViewUndo({ initialState: 0, maxHistory: 3 })
    );

    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.set(3));
    act(() => result.current.set(4)); // past should be [2, 3, 4] after cap

    // Can undo 3 times (maxHistory=3)
    act(() => result.current.undo());
    expect(result.current.state).toBe(3);
    act(() => result.current.undo());
    expect(result.current.state).toBe(2);
    act(() => result.current.undo());
    expect(result.current.state).toBe(1);

    // Cannot undo further — 0 was trimmed
    act(() => result.current.undo());
    expect(result.current.state).toBe(1);
    expect(result.current.canUndo).toBe(false);
  });

  it("works with complex objects", () => {
    const { result } = renderHook(() =>
      useViewUndo({ initialState: { x: 1, y: 2 } })
    );

    act(() => result.current.set({ x: 10, y: 20 }));
    expect(result.current.state).toEqual({ x: 10, y: 20 });

    act(() => result.current.undo());
    expect(result.current.state).toEqual({ x: 1, y: 2 });
  });
});
