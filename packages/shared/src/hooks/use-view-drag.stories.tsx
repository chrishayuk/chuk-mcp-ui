import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useViewDrag } from "./use-view-drag";
import type { DragItem } from "./use-view-drag";

const INITIAL_ITEMS = [
  { id: "site-1", label: "Roman Villa", period: "Roman" },
  { id: "site-2", label: "Saxon Church", period: "Saxon" },
  { id: "site-3", label: "Medieval Castle", period: "Medieval" },
  { id: "site-4", label: "Tudor Manor", period: "Tudor" },
  { id: "site-5", label: "Georgian Bridge", period: "Georgian" },
  { id: "site-6", label: "Victorian Mill", period: "Victorian" },
];

function DragDemo() {
  const { createDragSource, createDropTarget, isDragActive, activeDragItem } =
    useViewDrag();

  const [available, setAvailable] = useState(INITIAL_ITEMS);
  const [selected, setSelected] = useState<typeof INITIAL_ITEMS>([]);
  const [isOver, setIsOver] = useState(false);

  const target = createDropTarget({
    accept: ["heritage-site"],
    onDrop: (item: DragItem) => {
      const id = item.data.id as string;
      const found = available.find((a) => a.id === id);
      if (found) {
        setAvailable((prev) => prev.filter((a) => a.id !== id));
        setSelected((prev) => [...prev, found]);
      }
    },
    onDragEnter: () => setIsOver(true),
    onDragLeave: () => setIsOver(false),
  });

  return (
    <div style={{ fontFamily: "sans-serif", display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* ── Available panel ──────────────────────────── */}
        <div>
          <div style={headerStyle}>Available ({available.length})</div>
          <div style={{ display: "grid", gap: 4 }}>
            {available.map((item) => {
              const source = createDragSource({
                dragType: "heritage-site",
                data: { id: item.id, label: item.label },
              });
              return (
                <div key={item.id} {...source.dragProps} style={itemStyle}>
                  <span style={{ cursor: "grab", marginRight: 8, color: "#999" }}>
                    &#x2807;
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: "#999" }}>{item.period}</span>
                </div>
              );
            })}
            {available.length === 0 && (
              <div style={emptyStyle}>All items moved</div>
            )}
          </div>
        </div>

        {/* ── Selected (drop zone) panel ──────────────── */}
        <div>
          <div style={headerStyle}>Selected ({selected.length})</div>
          <div
            {...target.dropProps}
            style={{
              minHeight: 200,
              padding: 8,
              borderRadius: 8,
              border: isOver ? "2px solid #3b82f6" : "2px dashed #d1d5db",
              background: isOver ? "#eff6ff" : "#f9fafb",
              transition: "all 0.15s",
              display: "grid",
              gap: 4,
              alignContent: "start",
            }}
          >
            {selected.map((item) => (
              <div key={item.id} style={itemStyle}>
                <span style={{ flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: 11, color: "#999" }}>{item.period}</span>
              </div>
            ))}
            {selected.length === 0 && (
              <div style={emptyStyle}>Drop items here</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Debug footer ───────────────────────────────── */}
      <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>
        isDragActive: {String(isDragActive)} | activeDragItem:{" "}
        {activeDragItem ? JSON.stringify(activeDragItem) : "null"} | dropped:{" "}
        {selected.length}
      </div>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#666",
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const itemStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 6,
  background: "#fff",
  border: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  fontSize: 14,
};

const emptyStyle: React.CSSProperties = {
  padding: 24,
  textAlign: "center",
  color: "#999",
  fontSize: 13,
};

const meta = {
  title: "Hooks/useViewDrag",
  component: DragDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof DragDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DragBetweenLists: Story = {};
