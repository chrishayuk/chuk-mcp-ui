import type { Meta, StoryObj } from "@storybook/react";
import { useRef } from "react";
import { useViewExport } from "./use-view-export";

const SAMPLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "period", label: "Period" },
  { key: "status", label: "Status" },
  { key: "grade", label: "Grade" },
];

const SAMPLE_ROWS = [
  { name: "Roman Villa", period: "Roman", status: "At Risk", grade: "II*" },
  { name: "Saxon Church", period: "Saxon", status: "Good", grade: "I" },
  { name: "Medieval Castle", period: "Medieval", status: "At Risk", grade: "I" },
  { name: "Tudor Manor", period: "Tudor", status: "Good", grade: "II" },
  { name: "Georgian Bridge", period: "Georgian", status: "Fair", grade: "II" },
];

function ExportDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { exportCsv, exportJson, isExporting } = useViewExport({ containerRef });

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 500, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => exportCsv(SAMPLE_COLUMNS, SAMPLE_ROWS, "heritage-sites.csv")}
          style={btnStyle}
        >
          Export CSV
        </button>
        <button
          onClick={() => exportJson(SAMPLE_ROWS, "heritage-sites.json")}
          style={btnStyle}
        >
          Export JSON
        </button>
        {isExporting && (
          <span style={{ fontSize: 12, color: "#888", alignSelf: "center" }}>Exporting...</span>
        )}
      </div>

      <div ref={containerRef}>
        <table style={{ borderCollapse: "collapse", fontSize: 14, width: "100%" }}>
          <thead>
            <tr>
              {SAMPLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    borderBottom: "2px solid #e5e7eb",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#666",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ROWS.map((row) => (
              <tr key={row.name}>
                {SAMPLE_COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {row[col.key as keyof typeof row]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>
        isExporting: {String(isExporting)} | rows: {SAMPLE_ROWS.length} | columns: {SAMPLE_COLUMNS.length}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 6,
  border: "1px solid #ddd",
  background: "#f0f0f0",
  cursor: "pointer",
  fontSize: 13,
};

const meta = {
  title: "Hooks/useViewExport",
  component: ExportDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof ExportDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TableExport: Story = {};
