import { useMemo, useState, useCallback } from "react";
import { useView } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  ScrollArea,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  cn,
} from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { PivotContent, PivotValue } from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper (postMessage / useView)                              */
/* ------------------------------------------------------------------ */

export function PivotView() {
  const { data } =
    useView<PivotContent>("pivot", "1.0");

  if (!data) return null;

  return <PivotRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                    */
/* ------------------------------------------------------------------ */

export interface PivotRendererProps {
  data: PivotContent;
}

/* ------------------------------------------------------------------ */
/*  Aggregation helpers                                               */
/* ------------------------------------------------------------------ */

function computeAggregate(
  values: number[],
  aggregate: PivotValue["aggregate"],
): number {
  if (values.length === 0) return 0;

  switch (aggregate) {
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "count":
      return values.length;
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
  }
}

function formatValue(
  value: number,
  format: PivotValue["format"],
): string {
  switch (format) {
    case "percent":
      return `${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
    case "currency":
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    default:
      return value.toLocaleString();
  }
}

/* ------------------------------------------------------------------ */
/*  Row key helper                                                    */
/* ------------------------------------------------------------------ */

function buildKey(record: Record<string, unknown>, fields: string[]): string {
  return fields.map((f) => String(record[f] ?? "")).join("|||");
}

function parseKey(key: string): string[] {
  return key.split("|||");
}

/* ------------------------------------------------------------------ */
/*  Pivot engine types                                                */
/* ------------------------------------------------------------------ */

interface PivotCell {
  values: number[];
  aggregate: PivotValue["aggregate"];
  format?: PivotValue["format"];
}

interface PivotRow {
  rowKey: string;
  rowLabels: string[];
  cells: Map<string, PivotCell[]>;
}

interface PivotResult {
  pivotRows: PivotRow[];
  columnKeys: string[];
  columnLabelsMap: Map<string, string[]>;
  valueDefinitions: PivotValue[];
}

/* ------------------------------------------------------------------ */
/*  Pivot engine                                                      */
/* ------------------------------------------------------------------ */

function buildPivotData(
  data: Record<string, unknown>[],
  rows: string[],
  columns: string[],
  values: PivotValue[],
): PivotResult {
  /* Group data by row key, then by column key */
  const rowMap = new Map<string, Map<string, Record<string, unknown>[]>>();
  const columnKeysSet = new Set<string>();
  const columnLabelsMap = new Map<string, string[]>();

  for (const record of data) {
    const rk = buildKey(record, rows);
    const ck = buildKey(record, columns);

    columnKeysSet.add(ck);
    if (!columnLabelsMap.has(ck)) {
      columnLabelsMap.set(ck, parseKey(ck));
    }

    if (!rowMap.has(rk)) {
      rowMap.set(rk, new Map());
    }
    const colMap = rowMap.get(rk)!;
    if (!colMap.has(ck)) {
      colMap.set(ck, []);
    }
    colMap.get(ck)!.push(record);
  }

  const columnKeys = [...columnKeysSet].sort();

  /* Build pivot rows */
  const pivotRows: PivotRow[] = [];

  for (const [rk, colMap] of rowMap) {
    const cells = new Map<string, PivotCell[]>();

    for (const ck of columnKeys) {
      const records = colMap.get(ck) ?? [];
      const cellValues: PivotCell[] = values.map((v) => ({
        values: records
          .map((r) => {
            const raw = r[v.field];
            return typeof raw === "number" ? raw : Number(raw);
          })
          .filter((n) => !isNaN(n)),
        aggregate: v.aggregate,
        format: v.format,
      }));
      cells.set(ck, cellValues);
    }

    pivotRows.push({
      rowKey: rk,
      rowLabels: parseKey(rk),
      cells,
    });
  }

  return { pivotRows, columnKeys, columnLabelsMap, valueDefinitions: values };
}

/* ------------------------------------------------------------------ */
/*  Total computation helpers                                         */
/* ------------------------------------------------------------------ */

function computeRowTotal(
  row: PivotRow,
  columnKeys: string[],
  valueIndex: number,
  aggregate: PivotValue["aggregate"],
): number {
  const allValues: number[] = [];
  for (const ck of columnKeys) {
    const cellArr = row.cells.get(ck);
    if (cellArr && cellArr[valueIndex]) {
      allValues.push(...cellArr[valueIndex].values);
    }
  }
  return computeAggregate(allValues, aggregate);
}

function computeColumnTotal(
  pivotRows: PivotRow[],
  columnKey: string,
  valueIndex: number,
  aggregate: PivotValue["aggregate"],
): number {
  const allValues: number[] = [];
  for (const row of pivotRows) {
    const cellArr = row.cells.get(columnKey);
    if (cellArr && cellArr[valueIndex]) {
      allValues.push(...cellArr[valueIndex].values);
    }
  }
  return computeAggregate(allValues, aggregate);
}

function computeGrandTotal(
  pivotRows: PivotRow[],
  columnKeys: string[],
  valueIndex: number,
  aggregate: PivotValue["aggregate"],
): number {
  const allValues: number[] = [];
  for (const row of pivotRows) {
    for (const ck of columnKeys) {
      const cellArr = row.cells.get(ck);
      if (cellArr && cellArr[valueIndex]) {
        allValues.push(...cellArr[valueIndex].values);
      }
    }
  }
  return computeAggregate(allValues, aggregate);
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */

export function PivotRenderer({ data }: PivotRendererProps) {
  const {
    title,
    data: rawData,
    rows,
    columns,
    values,
    sortable = false,
    showTotals = false,
  } = data;

  /* Build pivot table */
  const pivot = useMemo(
    () => buildPivotData(rawData, rows, columns, values),
    [rawData, rows, columns, values],
  );

  /* Sort state */
  const [sortColKey, setSortColKey] = useState<string | null>(null);
  const [sortValIdx, setSortValIdx] = useState(0);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = useCallback(
    (colKey: string, valIdx: number) => {
      if (!sortable) return;
      if (sortColKey === colKey && sortValIdx === valIdx) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortColKey(colKey);
        setSortValIdx(valIdx);
        setSortDir("asc");
      }
    },
    [sortable, sortColKey, sortValIdx],
  );

  /* Sorted rows */
  const sortedRows = useMemo(() => {
    if (!sortColKey) return pivot.pivotRows;
    return [...pivot.pivotRows].sort((a, b) => {
      const aCells = a.cells.get(sortColKey);
      const bCells = b.cells.get(sortColKey);
      const aVal = aCells?.[sortValIdx]
        ? computeAggregate(aCells[sortValIdx].values, aCells[sortValIdx].aggregate)
        : 0;
      const bVal = bCells?.[sortValIdx]
        ? computeAggregate(bCells[sortValIdx].values, bCells[sortValIdx].aggregate)
        : 0;
      const cmp = aVal - bVal;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [pivot.pivotRows, sortColKey, sortValIdx, sortDir]);

  /* Number of row header columns */
  const rowHeaderCount = rows.length;
  /* Total columns for spanning: colKeys * values.length + (showTotals ? values.length : 0) */
  const hasMultipleValues = values.length > 1;

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[1200px] mx-auto p-6"
      >
        <Card>
          <CardContent className="p-6">
            {/* Header */}
            {title && (
              <h2 className="text-lg font-semibold mb-4">{title}</h2>
            )}

            {/* Scrollable table */}
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  {/* Grouped column header row: spans across value columns */}
                  <TableRow>
                    {/* Empty cells for row header columns */}
                    {rows.map((r, i) => (
                      <TableHead
                        key={`rh-spacer-${i}`}
                        className="sticky left-0 z-10 bg-background"
                        rowSpan={hasMultipleValues ? 2 : 1}
                      >
                        {r}
                      </TableHead>
                    ))}
                    {/* Column group headers */}
                    {pivot.columnKeys.map((ck) => {
                      const labels = pivot.columnLabelsMap.get(ck) ?? [];
                      return (
                        <TableHead
                          key={ck}
                          colSpan={values.length}
                          className="text-center whitespace-nowrap border-l"
                        >
                          {labels.join(" / ")}
                        </TableHead>
                      );
                    })}
                    {/* Totals group header */}
                    {showTotals && (
                      <TableHead
                        colSpan={values.length}
                        className="text-center font-bold whitespace-nowrap border-l"
                      >
                        Total
                      </TableHead>
                    )}
                  </TableRow>

                  {/* Value sub-header row (only when multiple values) */}
                  {hasMultipleValues && (
                    <TableRow>
                      {pivot.columnKeys.map((ck) =>
                        values.map((v, vi) => {
                          const isSorted = sortColKey === ck && sortValIdx === vi;
                          return (
                            <TableHead
                              key={`${ck}-${vi}`}
                              className={cn(
                                "text-center whitespace-nowrap text-xs",
                                vi === 0 && "border-l",
                                sortable && "cursor-pointer select-none",
                              )}
                              onClick={() => handleSort(ck, vi)}
                              aria-sort={
                                isSorted
                                  ? sortDir === "asc"
                                    ? "ascending"
                                    : "descending"
                                  : undefined
                              }
                            >
                              {v.label ?? `${v.aggregate}(${v.field})`}
                              {isSorted && (
                                <span className="text-[10px] ml-0.5">
                                  {sortDir === "asc" ? " \u25B2" : " \u25BC"}
                                </span>
                              )}
                            </TableHead>
                          );
                        }),
                      )}
                      {showTotals &&
                        values.map((v, vi) => (
                          <TableHead
                            key={`total-${vi}`}
                            className={cn(
                              "text-center font-bold whitespace-nowrap text-xs",
                              vi === 0 && "border-l",
                            )}
                          >
                            {v.label ?? `${v.aggregate}(${v.field})`}
                          </TableHead>
                        ))}
                    </TableRow>
                  )}

                  {/* Single value header: sortable column headers */}
                  {!hasMultipleValues && values.length === 1 && (
                    <TableRow>
                      {pivot.columnKeys.map((ck) => {
                        const isSorted = sortColKey === ck && sortValIdx === 0;
                        return (
                          <TableHead
                            key={`${ck}-val`}
                            className={cn(
                              "text-center whitespace-nowrap text-xs border-l",
                              sortable && "cursor-pointer select-none",
                            )}
                            onClick={() => handleSort(ck, 0)}
                            aria-sort={
                              isSorted
                                ? sortDir === "asc"
                                  ? "ascending"
                                  : "descending"
                                : undefined
                            }
                          >
                            {values[0].label ?? `${values[0].aggregate}(${values[0].field})`}
                            {isSorted && (
                              <span className="text-[10px] ml-0.5">
                                {sortDir === "asc" ? " \u25B2" : " \u25BC"}
                              </span>
                            )}
                          </TableHead>
                        );
                      })}
                      {showTotals && (
                        <TableHead className="text-center font-bold whitespace-nowrap text-xs border-l">
                          {values[0].label ?? `${values[0].aggregate}(${values[0].field})`}
                        </TableHead>
                      )}
                    </TableRow>
                  )}
                </TableHeader>

                <TableBody>
                  {sortedRows.map((row) => (
                    <TableRow key={row.rowKey}>
                      {/* Row headers */}
                      {row.rowLabels.map((label, i) => (
                        <TableCell
                          key={`rh-${i}`}
                          className="sticky left-0 z-10 bg-background font-medium whitespace-nowrap"
                        >
                          {label}
                        </TableCell>
                      ))}
                      {/* Data cells */}
                      {pivot.columnKeys.map((ck) => {
                        const cellArr = row.cells.get(ck) ?? [];
                        return values.map((v, vi) => {
                          const cell = cellArr[vi];
                          const computed = cell
                            ? computeAggregate(cell.values, cell.aggregate)
                            : 0;
                          return (
                            <TableCell
                              key={`${ck}-${vi}`}
                              className={cn(
                                "text-center tabular-nums",
                                vi === 0 && "border-l",
                              )}
                            >
                              {formatValue(computed, v.format)}
                            </TableCell>
                          );
                        });
                      })}
                      {/* Row totals */}
                      {showTotals &&
                        values.map((v, vi) => (
                          <TableCell
                            key={`rt-${vi}`}
                            className={cn(
                              "text-center font-bold tabular-nums",
                              vi === 0 && "border-l",
                            )}
                          >
                            {formatValue(
                              computeRowTotal(row, pivot.columnKeys, vi, v.aggregate),
                              v.format,
                            )}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}

                  {/* Column totals row */}
                  {showTotals && (
                    <TableRow>
                      {/* "Total" label spanning all row-header columns */}
                      <TableCell
                        colSpan={rowHeaderCount}
                        className="sticky left-0 z-10 bg-background font-bold whitespace-nowrap"
                      >
                        Total
                      </TableCell>
                      {/* Column totals */}
                      {pivot.columnKeys.map((ck) =>
                        values.map((v, vi) => (
                          <TableCell
                            key={`ct-${ck}-${vi}`}
                            className={cn(
                              "text-center font-bold tabular-nums",
                              vi === 0 && "border-l",
                            )}
                          >
                            {formatValue(
                              computeColumnTotal(sortedRows, ck, vi, v.aggregate),
                              v.format,
                            )}
                          </TableCell>
                        )),
                      )}
                      {/* Grand totals */}
                      {values.map((v, vi) => (
                        <TableCell
                          key={`gt-${vi}`}
                          className={cn(
                            "text-center font-bold tabular-nums",
                            vi === 0 && "border-l",
                          )}
                        >
                          {formatValue(
                            computeGrandTotal(sortedRows, pivot.columnKeys, vi, v.aggregate),
                            v.format,
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
