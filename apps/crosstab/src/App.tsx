import { useMemo } from "react";
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
import type { CrosstabContent, CrosstabAnnotation } from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper (postMessage / useView)                              */
/* ------------------------------------------------------------------ */

export function CrosstabView() {
  const { data } =
    useView<CrosstabContent>("crosstab", "1.0");

  if (!data) return null;

  return <CrosstabRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                    */
/* ------------------------------------------------------------------ */

export interface CrosstabRendererProps {
  data: CrosstabContent;
}

/* ------------------------------------------------------------------ */
/*  Colour helpers                                                    */
/* ------------------------------------------------------------------ */

function parseHexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function interpolateColor(
  min: string,
  max: string,
  t: number,
): string {
  const [r1, g1, b1] = parseHexToRgb(min);
  const [r2, g2, b2] = parseHexToRgb(max);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

/* ------------------------------------------------------------------ */
/*  Annotation lookup                                                 */
/* ------------------------------------------------------------------ */

function findAnnotation(
  annotations: CrosstabAnnotation[] | undefined,
  row: number,
  col: number,
): CrosstabAnnotation | undefined {
  return annotations?.find((a) => a.row === row && a.col === col);
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */

export function CrosstabRenderer({ data }: CrosstabRendererProps) {
  const {
    title,
    rowHeaders,
    columnHeaders,
    values,
    formatting = "none",
    colorScale = { min: "#dbeafe", max: "#1e40af" },
    showTotals = false,
    annotations,
  } = data;

  /* Flatten values to compute min/max for normalisation */
  const { minVal, maxVal } = useMemo(() => {
    const flat = values.flat();
    return {
      minVal: Math.min(...flat),
      maxVal: Math.max(...flat),
    };
  }, [values]);

  const normalize = (v: number) =>
    maxVal === minVal ? 0.5 : (v - minVal) / (maxVal - minVal);

  /* Row totals & column totals */
  const rowTotals = useMemo(
    () => values.map((row) => row.reduce((a, b) => a + b, 0)),
    [values],
  );

  const colTotals = useMemo(
    () =>
      columnHeaders.map((_, ci) =>
        values.reduce((sum, row) => sum + (row[ci] ?? 0), 0),
      ),
    [values, columnHeaders],
  );

  const grandTotal = useMemo(
    () => rowTotals.reduce((a, b) => a + b, 0),
    [rowTotals],
  );

  /* Cell style based on formatting mode */
  const cellStyle = (value: number): React.CSSProperties => {
    if (formatting === "heatmap") {
      const t = normalize(value);
      return {
        backgroundColor: interpolateColor(colorScale.min, colorScale.max, t),
        color: t > 0.6 ? "#ffffff" : "#1e293b",
      };
    }
    return {};
  };

  /* Cell content based on formatting mode */
  const cellContent = (value: number, ri: number, ci: number) => {
    const annotation = findAnnotation(annotations, ri, ci);

    const inner = (() => {
      if (formatting === "percentage") {
        const rowSum = rowTotals[ri];
        const pct = rowSum === 0 ? 0 : (value / rowSum) * 100;
        return `${pct.toFixed(1)}%`;
      }
      if (formatting === "bars") {
        const t = normalize(value);
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
              <div
                className="h-full bg-primary rounded transition-all"
                style={{ width: `${t * 100}%` }}
              />
            </div>
            <span className="text-xs tabular-nums w-10 text-right">
              {value}
            </span>
          </div>
        );
      }
      return value.toLocaleString();
    })();

    return (
      <div className="relative">
        {inner}
        {annotation?.label && (
          <span className="text-[10px] text-muted-foreground block leading-tight">
            {annotation.label}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[900px] mx-auto p-6"
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
                  <TableRow>
                    <TableHead className="sticky left-0 z-10 bg-background" />
                    {columnHeaders.map((col) => (
                      <TableHead
                        key={col}
                        className="text-center whitespace-nowrap"
                      >
                        {col}
                      </TableHead>
                    ))}
                    {showTotals && (
                      <TableHead className="text-center font-bold whitespace-nowrap">
                        Total
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {values.map((row, ri) => (
                    <TableRow key={rowHeaders[ri]}>
                      <TableCell className="sticky left-0 z-10 bg-background font-medium whitespace-nowrap">
                        {rowHeaders[ri]}
                      </TableCell>
                      {row.map((value, ci) => {
                        const annotation = findAnnotation(annotations, ri, ci);
                        return (
                          <TableCell
                            key={ci}
                            className={cn(
                              "text-center tabular-nums",
                              formatting === "bars" && "min-w-[140px]",
                              annotation?.highlight &&
                                "ring-2 ring-primary ring-inset rounded",
                            )}
                            style={cellStyle(value)}
                          >
                            {cellContent(value, ri, ci)}
                          </TableCell>
                        );
                      })}
                      {showTotals && (
                        <TableCell className="text-center font-bold tabular-nums">
                          {rowTotals[ri].toLocaleString()}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  {showTotals && (
                    <TableRow>
                      <TableCell className="sticky left-0 z-10 bg-background font-bold whitespace-nowrap">
                        Total
                      </TableCell>
                      {colTotals.map((total, ci) => (
                        <TableCell
                          key={ci}
                          className="text-center font-bold tabular-nums"
                        >
                          {total.toLocaleString()}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold tabular-nums">
                        {grandTotal.toLocaleString()}
                      </TableCell>
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
