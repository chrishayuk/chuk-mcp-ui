import type { Meta, StoryObj } from "@storybook/react";
import { useViewSelection } from "./use-view-selection";

const ITEMS = [
  { id: "site-1", label: "Roman Villa", period: "Roman" },
  { id: "site-2", label: "Saxon Church", period: "Saxon" },
  { id: "site-3", label: "Medieval Castle", period: "Medieval" },
  { id: "site-4", label: "Tudor Manor", period: "Tudor" },
  { id: "site-5", label: "Georgian Bridge", period: "Georgian" },
  { id: "site-6", label: "Victorian Mill", period: "Victorian" },
];

function SelectionDemo() {
  const { selectedIds, highlightedId, select, highlight, clearSelection } = useViewSelection();

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 400, display: "grid", gap: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>
        Click to select, hover to highlight
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        {ITEMS.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isHighlighted = highlightedId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => {
                const next = isSelected
                  ? selectedIds.filter((id) => id !== item.id)
                  : [...selectedIds, item.id];
                select(next);
              }}
              onMouseEnter={() => highlight(item.id)}
              onMouseLeave={() => highlight(null)}
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: isHighlighted ? "2px solid #3b82f6" : "2px solid transparent",
                background: isSelected ? "#dbeafe" : "#f9fafb",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontWeight: isSelected ? 600 : 400 }}>{item.label}</span>
              <span style={{ fontSize: 11, color: "#999" }}>{item.period}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => select(ITEMS.map((i) => i.id))}
          style={btnStyle}
        >
          Select All
        </button>
        <button onClick={clearSelection} style={btnStyle}>
          Clear
        </button>
      </div>
      <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>
        selected: [{selectedIds.join(", ")}]
        <br />
        highlighted: {highlightedId ?? "null"}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 6,
  border: "1px solid #ddd",
  background: "#f0f0f0",
  cursor: "pointer",
  fontSize: 12,
};

const meta = {
  title: "Hooks/useViewSelection",
  component: SelectionDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof SelectionDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
