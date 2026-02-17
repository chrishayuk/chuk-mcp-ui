import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useView, Fallback, resolveTemplates, CSS_VARS } from "@chuk/view-shared";
import type { DataTableContent, Column, RowAction } from "./schema";

export function DataTableView() {
  const { data, content, callTool, isConnected } =
    useView<DataTableContent>("datatable", "1.0");

  if (!isConnected) {
    return <Fallback message="Connecting..." />;
  }

  if (!data) {
    return <Fallback content={content ?? undefined} />;
  }

  return <DataTable data={data} onCallTool={callTool} />;
}

interface DataTableProps {
  data: DataTableContent;
  onCallTool: (name: string, args: Record<string, unknown>) => Promise<void>;
}

function DataTable({ data, onCallTool }: DataTableProps) {
  const {
    title,
    columns,
    rows,
    sortable = true,
    filterable = true,
    exportable = false,
    actions,
  } = data;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");
  const [panelId, setPanelId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLTableRowElement | null>(null);

  // Cross-View messaging: listen for feature-click from other panels
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      if (msg.__chuk_panel_id && !panelId) {
        setPanelId(msg.__chuk_panel_id);
      }

      if (msg.__chuk_event === "feature-click" || msg.__chuk_event === "row-click") {
        const id = String(msg.nhle_id ?? msg.id ?? "");
        if (id) setHighlightedId(id);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [panelId]);

  // Scroll highlighted row into view
  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [highlightedId]);

  const handleSort = useCallback(
    (key: string) => {
      if (!sortable) return;
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortable, sortKey]
  );

  const filteredRows = useMemo(() => {
    if (!filter) return rows;
    const lower = filter.toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(lower);
      })
    );
  }, [rows, columns, filter]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredRows, sortKey, sortDir]);

  const handleExport = useCallback(() => {
    const header = columns.map((c) => c.label).join(",");
    const body = rows
      .map((row) =>
        columns.map((col) => {
          const v = row[col.key];
          const s = v === null || v === undefined ? "" : String(v);
          return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(",")
      )
      .join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title ?? "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [columns, rows, title]);

  const handleAction = useCallback(
    async (action: RowAction, row: Record<string, unknown>) => {
      if (action.confirm && !window.confirm(action.confirm)) return;
      const resolved = resolveTemplates(action.arguments, row);
      await onCallTool(action.tool, resolved);
    },
    [onCallTool]
  );

  return (
    <div style={styles.container}>
      {(title || filterable || exportable) && (
        <div style={styles.toolbar}>
          {title && <h2 style={styles.title}>{title}</h2>}
          <div style={styles.toolbarRight}>
            {filterable && (
              <input
                type="text"
                placeholder="Filter..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={styles.filterInput}
                aria-label="Filter table"
              />
            )}
            {exportable && (
              <button onClick={handleExport} style={styles.exportBtn}>
                Export CSV
              </button>
            )}
          </div>
        </div>
      )}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...styles.th,
                    width: col.width,
                    textAlign: col.align ?? "left",
                    cursor: sortable && col.sortable !== false ? "pointer" : "default",
                  }}
                  onClick={() =>
                    sortable && col.sortable !== false && handleSort(col.key)
                  }
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span style={styles.sortIndicator}>
                      {sortDir === "asc" ? " \u25b2" : " \u25bc"}
                    </span>
                  )}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th style={styles.th}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  style={styles.emptyCell}
                >
                  {filter ? "No matching rows." : "No data."}
                </td>
              </tr>
            ) : (
              sortedRows.map((row, i) => {
                const rowId = String(row.nhle_id ?? row.id ?? "");
                const isHighlighted = rowId && rowId === highlightedId;
                return (
                <tr
                  key={i}
                  ref={isHighlighted ? highlightRef : undefined}
                  style={{
                    ...styles.tr,
                    backgroundColor: isHighlighted
                      ? `color-mix(in srgb, var(${CSS_VARS.colorPrimary}) 15%, transparent)`
                      : undefined,
                    cursor: rowId ? "pointer" : undefined,
                  }}
                  onClick={() => {
                    if (rowId && panelId) {
                      setHighlightedId(rowId);
                      window.parent.postMessage(
                        {
                          __chuk_panel_id: panelId,
                          __chuk_event: "row-click",
                          nhle_id: rowId,
                          properties: row,
                        },
                        "*"
                      );
                    }
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        ...styles.td,
                        textAlign: col.align ?? "left",
                      }}
                    >
                      <CellValue column={col} value={row[col.key]} />
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        {actions.map((action, ai) => (
                          <button
                            key={ai}
                            onClick={() => handleAction(action, row)}
                            style={styles.actionBtn}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div style={styles.footer}>
        {sortedRows.length} of {rows.length} rows
        {filter && ` (filtered)`}
      </div>
    </div>
  );
}

function CellValue({ column, value }: { column: Column; value: unknown }) {
  if (value === null || value === undefined) {
    return <span style={styles.nullValue}>—</span>;
  }

  switch (column.type) {
    case "badge": {
      const str = String(value);
      const color = column.badgeColors?.[str] ?? `var(${CSS_VARS.colorPrimary})`;
      return <span style={{ ...styles.badge, backgroundColor: color }}>{str}</span>;
    }
    case "boolean":
      return <span>{value ? "\u2713" : "\u2717"}</span>;
    case "link":
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          {String(value)}
        </a>
      );
    case "number":
      return <span>{typeof value === "number" ? value.toLocaleString() : String(value)}</span>;
    case "date":
      return (
        <span>
          {value instanceof Date
            ? value.toLocaleDateString()
            : String(value)}
        </span>
      );
    default:
      return <span>{String(value)}</span>;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    fontFamily: `var(${CSS_VARS.fontFamily})`,
    color: `var(${CSS_VARS.colorText})`,
    backgroundColor: `var(${CSS_VARS.colorBackground})`,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: `1px solid var(${CSS_VARS.colorBorder})`,
    flexWrap: "wrap",
    gap: "8px",
  },
  toolbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
  },
  filterInput: {
    padding: "6px 12px",
    border: `1px solid var(${CSS_VARS.colorBorder})`,
    borderRadius: `var(${CSS_VARS.borderRadius})`,
    backgroundColor: `var(${CSS_VARS.colorSurface})`,
    color: `var(${CSS_VARS.colorText})`,
    fontSize: "14px",
    outline: "none",
  },
  exportBtn: {
    padding: "6px 12px",
    border: `1px solid var(${CSS_VARS.colorBorder})`,
    borderRadius: `var(${CSS_VARS.borderRadius})`,
    backgroundColor: `var(${CSS_VARS.colorSurface})`,
    color: `var(${CSS_VARS.colorText})`,
    fontSize: "13px",
    cursor: "pointer",
  },
  tableWrap: {
    flex: 1,
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    position: "sticky" as const,
    top: 0,
    padding: "10px 12px",
    borderBottom: `2px solid var(${CSS_VARS.colorBorder})`,
    backgroundColor: `var(${CSS_VARS.colorSurface})`,
    fontWeight: 600,
    fontSize: "13px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    userSelect: "none",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: `1px solid var(${CSS_VARS.colorBorder})`,
  },
  td: {
    padding: "8px 12px",
  },
  emptyCell: {
    padding: "32px",
    textAlign: "center",
    color: `var(${CSS_VARS.colorTextSecondary})`,
  },
  footer: {
    padding: "8px 16px",
    fontSize: "12px",
    color: `var(${CSS_VARS.colorTextSecondary})`,
    borderTop: `1px solid var(${CSS_VARS.colorBorder})`,
  },
  badge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 500,
    color: "#fff",
  },
  nullValue: {
    color: `var(${CSS_VARS.colorTextSecondary})`,
  },
  link: {
    color: `var(${CSS_VARS.colorPrimary})`,
    textDecoration: "none",
  },
  actionGroup: {
    display: "flex",
    gap: "4px",
  },
  actionBtn: {
    padding: "4px 8px",
    border: `1px solid var(${CSS_VARS.colorBorder})`,
    borderRadius: `var(${CSS_VARS.borderRadius})`,
    backgroundColor: "transparent",
    color: `var(${CSS_VARS.colorPrimary})`,
    fontSize: "12px",
    cursor: "pointer",
  },
  sortIndicator: {
    fontSize: "10px",
  },
};
