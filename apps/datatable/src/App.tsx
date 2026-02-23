import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useView, resolveTemplates, useViewEvents } from "@chuk/view-shared";
import {
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  ScrollArea,
  cn,
} from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { DataTableContent, Column, RowAction } from "./schema";

export function DataTableView() {
  const { data, callTool } =
    useView<DataTableContent>("datatable", "1.0");

  if (!data) return null;

  return <DataTable data={data} onCallTool={callTool} />;
}

export interface DataTableProps {
  data: DataTableContent;
  onCallTool: (name: string, args: Record<string, unknown>) => Promise<void>;
}

export function DataTable({ data, onCallTool }: DataTableProps) {
  const { emitSelect } = useViewEvents();
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
    <div className="flex flex-col h-full font-sans text-foreground bg-background">
      {(title || filterable || exportable) && (
        <div className="flex items-center justify-between px-4 py-3 border-b flex-wrap gap-2">
          {title && <h2 className="m-0 text-base font-semibold">{title}</h2>}
          <div className="flex items-center gap-2">
            {filterable && (
              <Input
                type="text"
                placeholder="Filter..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-48"
                aria-label="Filter table"
              />
            )}
            {exportable && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                Export CSV
              </Button>
            )}
          </div>
        </div>
      )}
      <ScrollArea className="flex-1">
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    style={{ width: col.width, textAlign: col.align ?? "left" }}
                    className={cn(
                      "sticky top-0 bg-muted font-semibold text-xs uppercase tracking-wider select-none whitespace-nowrap",
                      sortable && col.sortable !== false && "cursor-pointer"
                    )}
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
                      <span className="text-[10px] ml-0.5">
                        {sortDir === "asc" ? " \u25b2" : " \u25bc"}
                      </span>
                    )}
                  </TableHead>
                ))}
                {actions && actions.length > 0 && (
                  <TableHead className="sticky top-0 bg-muted font-semibold text-xs uppercase tracking-wider select-none whitespace-nowrap">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {filter ? "No matching rows." : "No data."}
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row, i) => {
                  const rowId = String(row.nhle_id ?? row.id ?? "");
                  const isHighlighted = rowId && rowId === highlightedId;
                  return (
                    <TableRow
                      key={i}
                      ref={isHighlighted ? highlightRef : undefined}
                      className={cn(
                        "border-b transition-colors",
                        isHighlighted && "bg-primary/15",
                        rowId && "cursor-pointer"
                      )}
                      onClick={() => {
                        if (rowId && panelId) {
                          setHighlightedId(rowId);
                          emitSelect([rowId], "id");
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
                        <TableCell
                          key={col.key}
                          className={cn(
                            col.align === "right" && "text-right",
                            col.align === "center" && "text-center"
                          )}
                        >
                          <CellValue column={col} value={row[col.key]} />
                        </TableCell>
                      ))}
                      {actions && actions.length > 0 && (
                        <TableCell>
                          <div className="flex gap-1">
                            {actions.map((action, ai) => (
                              <Button
                                key={ai}
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleAction(action, row)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </motion.div>
      </ScrollArea>
      <div className="px-4 py-2 text-xs text-muted-foreground border-t">
        {sortedRows.length} of {rows.length} rows
        {filter && ` (filtered)`}
      </div>
    </div>
  );
}

function CellValue({ column, value }: { column: Column; value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">&mdash;</span>;
  }

  switch (column.type) {
    case "badge": {
      const str = String(value);
      const color = column.badgeColors?.[str] ?? undefined;
      return (
        <Badge className="text-white" style={{ backgroundColor: color }}>
          {str}
        </Badge>
      );
    }
    case "boolean":
      return <span>{value ? "\u2713" : "\u2717"}</span>;
    case "link":
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline no-underline"
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
