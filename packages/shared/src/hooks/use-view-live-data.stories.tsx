import type { Meta, StoryObj } from "@storybook/react";
import { useState, useCallback, useRef, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────────────

interface ServerEntry {
  name: string;
  status: "healthy" | "degraded" | "down";
  responseMs: number;
}

interface BoardData {
  servers: ServerEntry[];
}

type LiveStatus = "idle" | "connected" | "polling" | "paused" | "error";

const INITIAL_SERVERS: ServerEntry[] = [
  { name: "api-east-1", status: "healthy", responseMs: 42 },
  { name: "api-west-2", status: "healthy", responseMs: 78 },
  { name: "db-primary", status: "healthy", responseMs: 15 },
  { name: "cache-01", status: "healthy", responseMs: 3 },
  { name: "worker-queue", status: "healthy", responseMs: 120 },
];

function randomize(servers: ServerEntry[]): ServerEntry[] {
  return servers.map((s) => ({
    ...s,
    status: (["healthy", "healthy", "healthy", "degraded", "down"] as const)[
      Math.floor(Math.random() * 5)
    ],
    responseMs: Math.round(Math.random() * 300 + 1),
  }));
}

const STATUS_COLOR: Record<string, string> = {
  healthy: "#22c55e",
  degraded: "#eab308",
  down: "#ef4444",
};

const DOT_COLOR: Record<LiveStatus, string> = {
  idle: "#94a3b8",
  connected: "#22c55e",
  polling: "#22c55e",
  paused: "#eab308",
  error: "#ef4444",
};

// ── Demo component (simulates hook API without a real App) ──────────

function LiveDataDemo() {
  const [data, setData] = useState<BoardData>({ servers: INITIAL_SERVERS });
  const [status, setStatus] = useState<LiveStatus>("idle");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const countRef = useRef(0);

  const applyUpdate = useCallback(() => {
    if (pausedRef.current) return;
    setData((prev) => ({ servers: randomize(prev.servers) }));
    countRef.current++;
    setUpdateCount(countRef.current);
    setLastUpdated(Date.now());
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(applyUpdate, 2000);
    setStatus("polling");
  }, [applyUpdate]);

  useEffect(() => {
    startPolling();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startPolling]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    startPolling();
  }, [startPolling]);

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 540, display: "grid", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span
          style={{
            width: 10, height: 10, borderRadius: "50%",
            background: DOT_COLOR[status], display: "inline-block",
          }}
        />
        <strong style={{ fontSize: 15 }}>Live Status Board</strong>
        <span style={{ fontSize: 12, color: "#888", marginLeft: "auto" }}>
          Updates: {updateCount}
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={pause}
          disabled={status === "paused"}
          style={{
            padding: "6px 16px", borderRadius: 6, border: "1px solid #d1d5db",
            background: status === "paused" ? "#f3f4f6" : "#fff",
            cursor: status === "paused" ? "default" : "pointer", fontSize: 13,
          }}
        >
          Pause
        </button>
        <button
          onClick={resume}
          disabled={status !== "paused"}
          style={{
            padding: "6px 16px", borderRadius: 6, border: "1px solid #d1d5db",
            background: status !== "paused" ? "#f3f4f6" : "#fff",
            cursor: status !== "paused" ? "default" : "pointer", fontSize: 13,
          }}
        >
          Resume
        </button>
      </div>

      {/* Last updated */}
      <div style={{ fontSize: 12, color: "#666" }}>
        Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "---"}
      </div>

      {/* Table */}
      <table style={{ borderCollapse: "collapse", fontSize: 14, width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e5e7eb" }}>Server</th>
            <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e5e7eb" }}>Status</th>
            <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "2px solid #e5e7eb" }}>Response (ms)</th>
          </tr>
        </thead>
        <tbody>
          {data.servers.map((s) => (
            <tr key={s.name}>
              <td style={{ padding: "6px 12px", borderBottom: "1px solid #f0f0f0", fontFamily: "monospace" }}>{s.name}</td>
              <td style={{ padding: "6px 12px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: STATUS_COLOR[s.status], fontWeight: 600 }}>{s.status}</span>
              </td>
              <td style={{ padding: "6px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right", fontFamily: "monospace" }}>
                {s.responseMs}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Debug footer */}
      <div style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>
        status: {status} | updateCount: {updateCount} | lastUpdated: {String(lastUpdated)}
      </div>
    </div>
  );
}

const meta = {
  title: "Hooks/useViewLiveData",
  component: LiveDataDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof LiveDataDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LiveStatusBoard: Story = {};
