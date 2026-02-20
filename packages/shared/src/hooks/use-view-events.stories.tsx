import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useViewEvents } from "./use-view-events";
import { ViewBusProvider } from "../bus";

function EventsDemo() {
  const {
    emitSelect,
    emitDeselect,
    emitFilterChange,
    emitSubmit,
    emitAction,
    emitDraw,
  } = useViewEvents();

  const [log, setLog] = useState<string[]>([]);

  const append = (entry: string) =>
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${entry}`]);

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 520, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => {
            emitSelect(["site-42", "site-87"], "monument_id");
            append('select  ids=["site-42","site-87"]  field="monument_id"');
          }}
          style={{ ...btnStyle, background: "#dbeafe", borderColor: "#93c5fd" }}
        >
          Select
        </button>

        <button
          onClick={() => {
            emitDeselect();
            append("deselect");
          }}
          style={{ ...btnStyle, background: "#f3f4f6", borderColor: "#d1d5db" }}
        >
          Deselect
        </button>

        <button
          onClick={() => {
            emitFilterChange("period", "Medieval");
            append('filter-change  field="period"  value="Medieval"');
          }}
          style={{ ...btnStyle, background: "#fef3c7", borderColor: "#fcd34d" }}
        >
          Filter Change
        </button>

        <button
          onClick={() => {
            emitSubmit(
              { name: "Hadrian's Wall", period: "Roman", gridRef: "NY 7566" },
              "her_search_monuments",
            );
            append('submit  tool="her_search_monuments"  values={name,period,gridRef}');
          }}
          style={{ ...btnStyle, background: "#dcfce7", borderColor: "#86efac" }}
        >
          Submit
        </button>

        <button
          onClick={() => {
            emitAction("export_geojson", { format: "wkt", srid: 27700 });
            append('action  name="export_geojson"  args={format,srid}');
          }}
          style={{ ...btnStyle, background: "#e0e7ff", borderColor: "#a5b4fc" }}
        >
          Action
        </button>

        <button
          onClick={() => {
            emitDraw(
              { type: "Polygon", coordinates: [[[-1.55, 53.8], [-1.55, 53.82], [-1.52, 53.82], [-1.52, 53.8], [-1.55, 53.8]]] },
              { sw: [-1.55, 53.8], ne: [-1.52, 53.82] },
            );
            append("draw  geometry=Polygon  bounds={sw,ne}");
          }}
          style={{ ...btnStyle, background: "#fce7f3", borderColor: "#f9a8d4" }}
        >
          Draw
        </button>
      </div>

      <button
        onClick={() => setLog([])}
        style={{ ...btnStyle, background: "#f3f4f6", borderColor: "#d1d5db", justifySelf: "start" }}
      >
        Clear Log
      </button>

      {/* Event log */}
      <div
        style={{
          display: "grid",
          gap: 4,
          minHeight: 100,
          padding: 12,
          border: "1px dashed #d1d5db",
          borderRadius: 8,
          background: "#fafafa",
          fontFamily: "monospace",
          fontSize: 12,
          overflowY: "auto",
          maxHeight: 260,
        }}
      >
        {log.length === 0 && (
          <div style={{ color: "#9ca3af", textAlign: "center", padding: 16 }}>
            No events fired — click a button above
          </div>
        )}
        {log.map((entry, i) => (
          <div key={i} style={{ color: "#374151", lineHeight: 1.6 }}>
            {entry}
          </div>
        ))}
      </div>

      {/* Debug footer */}
      <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>
        events fired: {log.length}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 16px",
  borderRadius: 6,
  border: "1px solid #ddd",
  cursor: "pointer",
  fontSize: 14,
};

const meta: Meta<typeof EventsDemo> = {
  title: "Hooks/useViewEvents",
  component: EventsDemo,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ViewBusProvider>
        <Story />
      </ViewBusProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
