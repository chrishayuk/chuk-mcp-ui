import type { Meta, StoryObj } from "@storybook/react";
import { useViewUndo } from "./use-view-undo";

function UndoTextDemo({ maxHistory }: { maxHistory?: number }) {
  const { state, set, undo, redo, canUndo, canRedo } = useViewUndo({
    initialState: "Hello, World!",
    maxHistory,
  });

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 400, display: "grid", gap: 16 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Text (edit and blur to record)</label>
        <input
          type="text"
          value={state}
          onChange={(e) => set(e.target.value)}
          onBlur={() => set(state)} // Record on blur for undo
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 6,
            fontSize: 16,
            marginTop: 4,
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={undo}
          disabled={!canUndo}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: "1px solid #ddd",
            background: canUndo ? "#f0f0f0" : "#fafafa",
            cursor: canUndo ? "pointer" : "not-allowed",
            opacity: canUndo ? 1 : 0.4,
          }}
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: "1px solid #ddd",
            background: canRedo ? "#f0f0f0" : "#fafafa",
            cursor: canRedo ? "pointer" : "not-allowed",
            opacity: canRedo ? 1 : 0.4,
          }}
        >
          Redo
        </button>
      </div>
      <div style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>
        canUndo: {String(canUndo)} | canRedo: {String(canRedo)}
      </div>
    </div>
  );
}

function UndoCounterDemo() {
  const { state, set, undo, redo, canUndo, canRedo } = useViewUndo({
    initialState: 0,
  });

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", display: "grid", gap: 16 }}>
      <div style={{ fontSize: 64, fontWeight: 700, fontFamily: "monospace" }}>{state}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => set((n) => n - 1)} style={btnStyle}>-1</button>
        <button onClick={() => set((n) => n + 1)} style={btnStyle}>+1</button>
        <button onClick={() => set((n) => n + 10)} style={btnStyle}>+10</button>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={undo} disabled={!canUndo} style={{ ...btnStyle, opacity: canUndo ? 1 : 0.4 }}>
          Undo
        </button>
        <button onClick={redo} disabled={!canRedo} style={{ ...btnStyle, opacity: canRedo ? 1 : 0.4 }}>
          Redo
        </button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 16px",
  borderRadius: 6,
  border: "1px solid #ddd",
  background: "#f0f0f0",
  cursor: "pointer",
  fontSize: 14,
};

const meta = {
  title: "Hooks/useViewUndo",
  component: UndoTextDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof UndoTextDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextEditor: Story = {};

export const Counter: Story = {
  render: () => <UndoCounterDemo />,
};

export const WithMaxHistory: Story = {
  args: { maxHistory: 5 },
};
