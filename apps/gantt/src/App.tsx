import { useState, useMemo, useCallback } from "react";
import { useView } from "@chuk/view-shared";
import { Card, CardContent, ScrollArea, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { GanttContent, GanttTask } from "./schema";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PALETTE = [
  "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
];

const ROW_HEIGHT = 36;
const ROW_GAP = 4;
const HEADER_HEIGHT = 40;
const LABEL_WIDTH = 180;
const DAY_WIDTH_MIN = 24;
const DAY_WIDTH_MAX = 40;
const GROUP_HEADER_HEIGHT = 28;
const BAR_HEIGHT = 22;
const BAR_RADIUS = 4;
const ARROW_SIZE = 6;
const MS_PER_DAY = 86400000;

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

function parseDate(s: string): Date {
  const parts = s.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_PER_DAY);
}

function formatDate(d: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

/* ------------------------------------------------------------------ */
/*  Layout types                                                       */
/* ------------------------------------------------------------------ */

interface LayoutRow {
  type: "task" | "group";
  task?: GanttTask;
  groupLabel?: string;
  y: number;
}

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                                */
/* ------------------------------------------------------------------ */

export function GanttView() {
  const { data } =
    useView<GanttContent>("gantt", "1.0");

  if (!data) return null;

  return <GanttRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface GanttRendererProps {
  data: GanttContent;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                       */
/* ------------------------------------------------------------------ */

export function GanttRenderer({ data }: GanttRendererProps) {
  const { title, tasks } = data;

  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{
    x: number;
    y: number;
    label: string;
    dates: string;
    progress?: string;
  } | null>(null);

  /* ---- Compute date range ---- */
  const { rangeStart, totalDays, dayWidth } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      return { rangeStart: today, totalDays: 14, dayWidth: DAY_WIDTH_MAX };
    }

    let minDate = data.startDate ? parseDate(data.startDate) : parseDate(tasks[0].start);
    let maxDate = data.endDate ? parseDate(data.endDate) : parseDate(tasks[0].end);

    for (const t of tasks) {
      const s = parseDate(t.start);
      const e = parseDate(t.end);
      if (s < minDate) minDate = s;
      if (e > maxDate) maxDate = e;
    }

    // Add padding
    const start = addDays(minDate, -1);
    const end = addDays(maxDate, 2);
    const days = Math.max(daysBetween(start, end), 1);

    // Determine day width based on range
    const dw = Math.max(DAY_WIDTH_MIN, Math.min(DAY_WIDTH_MAX, 600 / days));

    return { rangeStart: start, totalDays: days, dayWidth: dw };
  }, [tasks, data.startDate, data.endDate]);

  /* ---- Build rows with group headers ---- */
  const rows = useMemo(() => {
    const result: LayoutRow[] = [];
    let y = HEADER_HEIGHT;
    const seenGroups = new Set<string>();

    for (const task of tasks) {
      if (task.group && !seenGroups.has(task.group)) {
        seenGroups.add(task.group);
        result.push({ type: "group", groupLabel: task.group, y });
        y += GROUP_HEADER_HEIGHT + ROW_GAP;
      }
      result.push({ type: "task", task, y });
      y += ROW_HEIGHT + ROW_GAP;
    }
    return result;
  }, [tasks]);

  /* ---- Task lookup for dependencies ---- */
  const taskMap = useMemo(() => {
    const m = new Map<string, { task: GanttTask; row: LayoutRow }>();
    for (const r of rows) {
      if (r.type === "task" && r.task) {
        m.set(r.task.id, { task: r.task, row: r });
      }
    }
    return m;
  }, [rows]);

  /* ---- SVG dimensions ---- */
  const chartWidth = totalDays * dayWidth;
  const lastRow = rows[rows.length - 1];
  const svgHeight = lastRow
    ? lastRow.y + (lastRow.type === "group" ? GROUP_HEADER_HEIGHT : ROW_HEIGHT) + 20
    : HEADER_HEIGHT + 40;

  /* ---- Position helpers ---- */
  const dateToX = useCallback(
    (dateStr: string) => {
      const d = parseDate(dateStr);
      return daysBetween(rangeStart, d) * dayWidth;
    },
    [rangeStart, dayWidth],
  );

  /* ---- Event handlers ---- */
  const handleTaskEnter = useCallback(
    (task: GanttTask, row: LayoutRow) => {
      setHoveredTask(task.id);
      const x = dateToX(task.start);
      const barW = Math.max((dateToX(task.end) - x), dayWidth);
      setTooltipInfo({
        x: x + barW / 2,
        y: row.y - 4,
        label: task.label,
        dates: `${task.start} \u2013 ${task.end}`,
        progress:
          task.progress !== undefined ? `${task.progress}%` : undefined,
      });
    },
    [dateToX, dayWidth],
  );

  const handleTaskLeave = useCallback(() => {
    setHoveredTask(null);
    setTooltipInfo(null);
  }, []);

  /* ---- Generate date column headers ---- */
  const dateHeaders = useMemo(() => {
    const headers: { date: Date; x: number }[] = [];
    // Show every N days depending on day width
    const step = dayWidth >= 30 ? 1 : dayWidth >= 20 ? 2 : 7;
    for (let i = 0; i < totalDays; i += step) {
      const d = addDays(rangeStart, i);
      headers.push({ date: d, x: i * dayWidth });
    }
    return headers;
  }, [rangeStart, totalDays, dayWidth]);

  /* ---- Task color helper ---- */
  const taskColor = useCallback(
    (task: GanttTask, index: number) => {
      return task.color ?? PALETTE[index % PALETTE.length];
    },
    [],
  );

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full p-4"
      >
        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="flex-1 flex flex-col min-h-0 p-4">
            {title && (
              <h2 className="text-lg font-semibold mb-3 flex-shrink-0">
                {title}
              </h2>
            )}

            <ScrollArea className="flex-1 min-h-0">
              <div className="flex min-w-min">
                {/* Left labels column */}
                <div
                  className="flex-shrink-0 border-r border-border"
                  style={{ width: LABEL_WIDTH }}
                >
                  {/* Header spacer */}
                  <div
                    className="border-b border-border flex items-end px-3 pb-2 text-xs font-semibold text-muted-foreground"
                    style={{ height: HEADER_HEIGHT }}
                  >
                    Task
                  </div>

                  {/* Row labels */}
                  {rows.map((row, i) => {
                    if (row.type === "group") {
                      return (
                        <div
                          key={`group-${row.groupLabel}-${i}`}
                          className="flex items-center px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/30"
                          style={{
                            height: GROUP_HEADER_HEIGHT,
                            marginTop: i > 0 ? ROW_GAP : 0,
                          }}
                        >
                          {row.groupLabel}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={row.task!.id}
                        className={cn(
                          "flex items-center px-3 text-xs truncate",
                          hoveredTask === row.task!.id && "bg-muted/50",
                        )}
                        style={{
                          height: ROW_HEIGHT,
                          marginTop: ROW_GAP,
                        }}
                      >
                        {row.task!.label}
                      </div>
                    );
                  })}
                </div>

                {/* Right chart area */}
                <div className="flex-1 overflow-x-auto">
                  <svg
                    width={chartWidth}
                    height={svgHeight}
                    role="img"
                    aria-label={title ?? "Gantt chart"}
                  >
                    {/* Date column headers */}
                    {dateHeaders.map((dh, i) => (
                      <g key={i}>
                        <line
                          x1={dh.x}
                          y1={HEADER_HEIGHT}
                          x2={dh.x}
                          y2={svgHeight}
                          className="stroke-border"
                          strokeWidth="0.5"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={dh.x + 4}
                          y={HEADER_HEIGHT - 8}
                          className="fill-muted-foreground"
                          fontSize="10"
                        >
                          {formatDate(dh.date)}
                        </text>
                      </g>
                    ))}

                    {/* Header bottom line */}
                    <line
                      x1={0}
                      y1={HEADER_HEIGHT}
                      x2={chartWidth}
                      y2={HEADER_HEIGHT}
                      className="stroke-border"
                      strokeWidth="1"
                    />

                    {/* Dependency arrows */}
                    {rows.map((row) => {
                      if (row.type !== "task" || !row.task?.dependencies) {
                        return null;
                      }
                      return row.task.dependencies.map((depId) => {
                        const dep = taskMap.get(depId);
                        if (!dep) return null;

                        const fromX = dateToX(dep.task.end);
                        const fromY =
                          dep.row.y + ROW_HEIGHT / 2;
                        const toX = dateToX(row.task!.start);
                        const toY = row.y + ROW_HEIGHT / 2;

                        // Horizontal-then-vertical path
                        const midX = (fromX + toX) / 2;

                        return (
                          <g key={`dep-${depId}-${row.task!.id}`}>
                            <path
                              d={`M ${fromX},${fromY} L ${midX},${fromY} L ${midX},${toY} L ${toX},${toY}`}
                              fill="none"
                              className="stroke-muted-foreground"
                              strokeWidth="1.5"
                              strokeDasharray="4 2"
                            />
                            {/* Arrowhead */}
                            <polygon
                              points={`${toX},${toY} ${toX - ARROW_SIZE},${toY - ARROW_SIZE / 2} ${toX - ARROW_SIZE},${toY + ARROW_SIZE / 2}`}
                              className="fill-muted-foreground"
                            />
                          </g>
                        );
                      });
                    })}

                    {/* Task bars */}
                    {rows.map((row, rowIndex) => {
                      if (row.type !== "task" || !row.task) return null;
                      const task = row.task;
                      const x = dateToX(task.start);
                      const barWidth = Math.max(
                        dateToX(task.end) - x,
                        dayWidth,
                      );
                      const barY =
                        row.y + (ROW_HEIGHT - BAR_HEIGHT) / 2;
                      const color = taskColor(task, rowIndex);
                      const isHovered = hoveredTask === task.id;

                      return (
                        <g
                          key={task.id}
                          style={{ cursor: "pointer" }}
                          onMouseEnter={() =>
                            handleTaskEnter(task, row)
                          }
                          onMouseLeave={handleTaskLeave}
                        >
                          {/* Row highlight */}
                          {isHovered && (
                            <rect
                              x={0}
                              y={row.y}
                              width={chartWidth}
                              height={ROW_HEIGHT}
                              className="fill-muted/30"
                            />
                          )}

                          {/* Background bar */}
                          <rect
                            x={x}
                            y={barY}
                            width={barWidth}
                            height={BAR_HEIGHT}
                            rx={BAR_RADIUS}
                            fill={color}
                            opacity={isHovered ? 1 : 0.8}
                            style={{
                              transition: "opacity 0.2s ease",
                            }}
                          />

                          {/* Progress fill */}
                          {task.progress !== undefined &&
                            task.progress > 0 && (
                              <rect
                                x={x}
                                y={barY}
                                width={
                                  barWidth *
                                  Math.min(task.progress / 100, 1)
                                }
                                height={BAR_HEIGHT}
                                rx={BAR_RADIUS}
                                fill={color}
                                opacity={1}
                              />
                            )}

                          {/* Progress track overlay (lighter area for remaining) */}
                          {task.progress !== undefined &&
                            task.progress < 100 && (
                              <rect
                                x={
                                  x +
                                  barWidth *
                                    Math.min(task.progress / 100, 1)
                                }
                                y={barY}
                                width={
                                  barWidth *
                                  (1 - Math.min(task.progress / 100, 1))
                                }
                                height={BAR_HEIGHT}
                                rx={0}
                                fill="rgba(255,255,255,0.25)"
                              />
                            )}

                          {/* Bar label */}
                          {barWidth > 40 && (
                            <text
                              x={x + 6}
                              y={barY + BAR_HEIGHT / 2}
                              dominantBaseline="central"
                              className="pointer-events-none fill-primary-foreground"
                              fontSize="10"
                              fontWeight="600"
                            >
                              {task.label.length >
                              Math.floor(barWidth / 7)
                                ? task.label.slice(
                                    0,
                                    Math.floor(barWidth / 7) - 1,
                                  ) + "\u2026"
                                : task.label}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Tooltip */}
                    {tooltipInfo && (
                      <g className="pointer-events-none">
                        <rect
                          x={tooltipInfo.x - 80}
                          y={tooltipInfo.y - 42}
                          width={160}
                          height={tooltipInfo.progress ? 40 : 30}
                          rx={4}
                          className="fill-popover stroke-border"
                          strokeWidth="1"
                        />
                        <text
                          x={tooltipInfo.x}
                          y={
                            tooltipInfo.y -
                            (tooltipInfo.progress ? 30 : 24)
                          }
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="fill-foreground"
                          fontSize="10"
                          fontWeight="600"
                        >
                          {tooltipInfo.label}
                        </text>
                        <text
                          x={tooltipInfo.x}
                          y={
                            tooltipInfo.y -
                            (tooltipInfo.progress ? 18 : 12)
                          }
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="fill-muted-foreground"
                          fontSize="9"
                        >
                          {tooltipInfo.dates}
                        </text>
                        {tooltipInfo.progress && (
                          <text
                            x={tooltipInfo.x}
                            y={tooltipInfo.y - 6}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="fill-muted-foreground"
                            fontSize="9"
                          >
                            Progress: {tooltipInfo.progress}
                          </text>
                        )}
                      </g>
                    )}
                  </svg>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
