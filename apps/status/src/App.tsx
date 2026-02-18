import { useMemo } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent, Badge, Separator, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn, listContainer, listItem } from "@chuk/view-ui/animations";
import type { StatusContent, StatusItem, StatusSummary } from "./schema";

export function StatusView() {
  const { data, content, isConnected } =
    useView<StatusContent>("status", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <StatusRenderer data={data} />;
}

export interface StatusRendererProps {
  data: StatusContent;
}

const STATUS_DOT: Record<string, string> = {
  ok: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  unknown: "bg-gray-400",
  pending: "bg-blue-500 animate-pulse",
};

const STATUS_LABEL: Record<string, string> = {
  ok: "Operational",
  warning: "Degraded",
  error: "Outage",
  unknown: "Unknown",
  pending: "Checking...",
};

const HEALTH_BADGE: Record<string, string> = {
  healthy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  degraded: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  outage: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export function StatusRenderer({ data }: StatusRendererProps) {
  const { title, items, summary: providedSummary } = data;

  const summary = useMemo<StatusSummary>(() => {
    if (providedSummary) return providedSummary;
    return items.reduce(
      (acc, item) => {
        if (item.status === "ok") acc.ok++;
        else if (item.status === "warning") acc.warning++;
        else if (item.status === "error") acc.error++;
        return acc;
      },
      { ok: 0, warning: 0, error: 0 }
    );
  }, [items, providedSummary]);

  const overallHealth = useMemo(() => {
    if (summary.error > 0) return "outage";
    if (summary.warning > 0) return "degraded";
    return "healthy";
  }, [summary]);

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[600px] mx-auto p-6"
      >
        <Card>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{title ?? "System Status"}</h2>
              <Badge className={cn(HEALTH_BADGE[overallHealth])}>
                {overallHealth === "healthy"
                  ? "All Systems Operational"
                  : overallHealth === "degraded"
                    ? "Degraded Performance"
                    : "System Outage"}
              </Badge>
            </div>

            {/* Summary Bar */}
            <div className="flex items-center gap-4 text-sm mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {summary.ok} OK
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {summary.warning} Warning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {summary.error} Error
              </span>
            </div>

            <Separator className="mb-4" />

            {/* Items */}
            <motion.div
              variants={listContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {items.map((item) => (
                <motion.div key={item.id} variants={listItem}>
                  <StatusRow item={item} />
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatusRow({ item }: { item: StatusItem }) {
  const dotColor = STATUS_DOT[item.status] ?? STATUS_DOT.unknown;
  const statusLabel = STATUS_LABEL[item.status] ?? item.status;

  return (
    <div className="flex items-center gap-3 py-1">
      <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", dotColor)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {item.label}
              </a>
            ) : (
              item.label
            )}
          </span>
          <span className="text-xs text-muted-foreground">{statusLabel}</span>
        </div>
        {(item.detail || item.lastChecked) && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {item.detail}
            {item.detail && item.lastChecked && " \u00B7 "}
            {item.lastChecked && `Last checked: ${item.lastChecked}`}
          </div>
        )}
      </div>
    </div>
  );
}
