import type { Meta, StoryObj } from "@storybook/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useViewStream } from "./use-view-stream";

// Minimal mock App that allows us to trigger streaming events
function createMockApp() {
  const handlers: Record<string, ((params: Record<string, unknown>) => void) | undefined> = {};
  return {
    set ontoolinputpartial(fn: (params: Record<string, unknown>) => void) {
      handlers.ontoolinputpartial = fn;
    },
    set ontoolinput(fn: (params: Record<string, unknown>) => void) {
      handlers.ontoolinput = fn;
    },
    firePartial(args: Record<string, unknown>) {
      handlers.ontoolinputpartial?.({ arguments: args });
    },
    fireInput(args: Record<string, unknown>) {
      handlers.ontoolinput?.({ arguments: args });
    },
  };
}

interface TableRow {
  id: number;
  name: string;
  value: number;
}

const FULL_DATA = {
  type: "datatable",
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "value", label: "Value" },
  ],
  rows: [
    { id: 1, name: "Alpha", value: 100 },
    { id: 2, name: "Beta", value: 250 },
    { id: 3, name: "Gamma", value: 175 },
    { id: 4, name: "Delta", value: 320 },
    { id: 5, name: "Epsilon", value: 410 },
    { id: 6, name: "Zeta", value: 290 },
    { id: 7, name: "Eta", value: 185 },
    { id: 8, name: "Theta", value: 560 },
  ],
};

function StreamDemo() {
  const [mockApp] = useState(createMockApp);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isStreaming, progress } = useViewStream<typeof FULL_DATA>(mockApp as any);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);

  const startStream = useCallback(() => {
    stepRef.current = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      stepRef.current++;
      const rowCount = stepRef.current;
      const partial = {
        ...FULL_DATA,
        rows: FULL_DATA.rows.slice(0, rowCount),
      };

      if (rowCount >= FULL_DATA.rows.length) {
        mockApp.fireInput(partial);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        mockApp.firePartial(partial);
      }
    }, 400);
  }, [mockApp]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const rows = (data?.rows ?? []) as TableRow[];

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 500, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={startStream}
          style={{
            padding: "8px 20px",
            borderRadius: 6,
            border: "none",
            background: "#3b82f6",
            color: "#fff",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Start Streaming
        </button>
        <span style={{ fontSize: 13, fontFamily: "monospace", color: "#888" }}>
          {isStreaming ? "streaming..." : progress === 1 ? "complete" : "idle"}
        </span>
      </div>

      {isStreaming && (
        <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${(rows.length / FULL_DATA.rows.length) * 100}%`,
              background: "#3b82f6",
              transition: "width 0.3s",
            }}
          />
        </div>
      )}

      <table style={{ borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            {FULL_DATA.columns.map((col) => (
              <th
                key={col.key}
                style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e5e7eb" }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td style={{ padding: "6px 12px", borderBottom: "1px solid #f0f0f0" }}>{row.id}</td>
              <td style={{ padding: "6px 12px", borderBottom: "1px solid #f0f0f0" }}>{row.name}</td>
              <td style={{ padding: "6px 12px", borderBottom: "1px solid #f0f0f0" }}>{row.value}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} style={{ padding: "16px 12px", color: "#999", textAlign: "center" }}>
                Click "Start Streaming" to begin
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>
        rows: {rows.length}/{FULL_DATA.rows.length} | isStreaming: {String(isStreaming)} | progress: {String(progress)}
      </div>
    </div>
  );
}

const meta = {
  title: "Hooks/useViewStream",
  component: StreamDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof StreamDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StreamingTable: Story = {};
