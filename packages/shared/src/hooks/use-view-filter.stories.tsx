import type { Meta, StoryObj } from "@storybook/react";
import { useMemo } from "react";
import { useViewFilter } from "./use-view-filter";

const DATA = [
  { id: 1, name: "Roman Villa", period: "Roman", status: "At Risk" },
  { id: 2, name: "Saxon Church", period: "Saxon", status: "Good" },
  { id: 3, name: "Medieval Castle", period: "Medieval", status: "At Risk" },
  { id: 4, name: "Tudor Manor", period: "Tudor", status: "Good" },
  { id: 5, name: "Georgian Bridge", period: "Georgian", status: "Fair" },
  { id: 6, name: "Roman Fort", period: "Roman", status: "Good" },
  { id: 7, name: "Victorian Mill", period: "Victorian", status: "At Risk" },
  { id: 8, name: "Medieval Priory", period: "Medieval", status: "Fair" },
];

const PERIODS = [...new Set(DATA.map((d) => d.period))];
const STATUSES = [...new Set(DATA.map((d) => d.status))];

function FilterDemo() {
  const { filters, setFilter, clearFilter, clearAll } = useViewFilter();

  const filtered = useMemo(() => {
    return DATA.filter((row) => {
      for (const [field, value] of Object.entries(filters)) {
        if (value && row[field as keyof typeof row] !== value) return false;
      }
      return true;
    });
  }, [filters]);

  const activeCount = Object.keys(filters).length;

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 500, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <FilterSelect
          label="Period"
          options={PERIODS}
          value={(filters.period as string) ?? ""}
          onChange={(v) => (v ? setFilter("period", v) : clearFilter("period"))}
        />
        <FilterSelect
          label="Status"
          options={STATUSES}
          value={(filters.status as string) ?? ""}
          onChange={(v) => (v ? setFilter("status", v) : clearFilter("status"))}
        />
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid #ef4444",
              background: "#fef2f2",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: 12,
              alignSelf: "flex-end",
            }}
          >
            Clear All ({activeCount})
          </button>
        )}
      </div>

      <table style={{ borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Period</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.id}>
              <td style={tdStyle}>{row.name}</td>
              <td style={tdStyle}>{row.period}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 10,
                    fontSize: 11,
                    background:
                      row.status === "At Risk" ? "#fef2f2" : row.status === "Good" ? "#f0fdf4" : "#fffbeb",
                    color:
                      row.status === "At Risk" ? "#dc2626" : row.status === "Good" ? "#16a34a" : "#ca8a04",
                  }}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={3} style={{ ...tdStyle, textAlign: "center", color: "#999" }}>
                No results match filters
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>
        filters: {JSON.stringify(filters)} | showing: {filtered.length}/{DATA.length}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid #ddd",
          fontSize: 13,
          minWidth: 120,
        }}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "2px solid #e5e7eb",
  fontSize: 12,
  fontWeight: 600,
  color: "#666",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #f0f0f0",
};

const meta = {
  title: "Hooks/useViewFilter",
  component: FilterDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof FilterDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
