import { useState, useCallback, useMemo } from "react";
import { useView } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Separator,
  ScrollArea,
  cn,
} from "@chuk/view-ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  fadeIn,
  listContainer,
  listItem,
} from "@chuk/view-ui/animations";
import type { AlertContent, AlertItem, AlertAction } from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper                                                       */
/* ------------------------------------------------------------------ */

export function AlertView() {
  const { data, callTool } =
    useView<AlertContent>("alert", "1.0");

  if (!data) return null;

  return <AlertRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface AlertRendererProps {
  data: AlertContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Severity colour helpers                                            */
/* ------------------------------------------------------------------ */

const SEVERITY_BORDER: Record<string, string> = {
  info: "border-l-4 border-l-blue-500",
  success: "border-l-4 border-l-emerald-500",
  warning: "border-l-4 border-l-amber-500",
  error: "border-l-4 border-l-red-500",
  critical: "border-l-4 border-l-red-600",
};

const SEVERITY_DOT: Record<string, string> = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  critical: "bg-red-600 animate-pulse",
};

const SEVERITY_BADGE: Record<string, string> = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  critical: "bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-200",
};

const SEVERITY_LABEL: Record<string, string> = {
  info: "Info",
  success: "Success",
  warning: "Warning",
  error: "Error",
  critical: "Critical",
};

/* ------------------------------------------------------------------ */
/*  Alert Renderer                                                     */
/* ------------------------------------------------------------------ */

export function AlertRenderer({ data, onCallTool }: AlertRendererProps) {
  const { title, alerts, groupBy, dismissible: globalDismissible } = data;

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleAction = useCallback(
    async (action: AlertAction) => {
      if (onCallTool) {
        await onCallTool(action.tool, action.arguments);
      }
    },
    [onCallTool]
  );

  /* Filter out dismissed alerts */
  const visibleAlerts = useMemo(
    () => alerts.filter((a) => !dismissedIds.has(a.id)),
    [alerts, dismissedIds]
  );

  /* Summary counts */
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const alert of visibleAlerts) {
      counts[alert.severity] = (counts[alert.severity] ?? 0) + 1;
    }
    return counts;
  }, [visibleAlerts]);

  /* Group alerts if groupBy is set */
  const groupedAlerts = useMemo(() => {
    if (!groupBy) return [{ label: "", alerts: visibleAlerts }];

    const groups = new Map<string, AlertItem[]>();
    for (const alert of visibleAlerts) {
      const key =
        groupBy === "severity"
          ? alert.severity
          : groupBy === "category"
            ? alert.category ?? "Uncategorized"
            : alert.source ?? "Unknown";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(alert);
    }

    return Array.from(groups.entries()).map(([label, items]) => ({
      label,
      alerts: items,
    }));
  }, [visibleAlerts, groupBy]);

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          {title && (
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
          )}

          {/* Summary counter badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {(["critical", "error", "warning", "info", "success"] as const).map(
              (sev) =>
                severityCounts[sev] ? (
                  <Badge key={sev} className={cn(SEVERITY_BADGE[sev])}>
                    {severityCounts[sev]} {SEVERITY_LABEL[sev]}
                  </Badge>
                ) : null
            )}
          </div>
        </div>

        <Separator />

        {/* Alert list */}
        <ScrollArea className="flex-1 px-6 py-4">
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {groupedAlerts.map((group) => (
              <div key={group.label}>
                {/* Group header */}
                {group.label && (
                  <div className="py-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {groupBy === "severity"
                        ? SEVERITY_LABEL[group.label] ?? group.label
                        : group.label}
                    </span>
                  </div>
                )}

                {/* Alerts in this group */}
                <AnimatePresence initial={false}>
                  {group.alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      variants={listItem}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      layout
                      className="mb-3"
                    >
                      <AlertCard
                        alert={alert}
                        dismissible={alert.dismissible ?? globalDismissible ?? false}
                        onDismiss={() => dismiss(alert.id)}
                        onAction={handleAction}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}

            {visibleAlerts.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No alerts to display.
              </div>
            )}
          </motion.div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Alert Card                                                         */
/* ------------------------------------------------------------------ */

interface AlertCardProps {
  alert: AlertItem;
  dismissible: boolean;
  onDismiss: () => void;
  onAction: (action: AlertAction) => void;
}

function AlertCard({ alert, dismissible, onDismiss, onAction }: AlertCardProps) {
  const borderColor = SEVERITY_BORDER[alert.severity] ?? SEVERITY_BORDER.info;
  const dotColor = SEVERITY_DOT[alert.severity] ?? SEVERITY_DOT.info;

  return (
    <Card className={cn(borderColor)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Severity dot */}
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5",
              dotColor
            )}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium flex-1 min-w-0">
                {alert.title}
              </span>
              <Badge className={cn("flex-shrink-0 text-[10px]", SEVERITY_BADGE[alert.severity])}>
                {SEVERITY_LABEL[alert.severity]}
              </Badge>
            </div>

            {/* Message */}
            {alert.message && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {alert.message}
              </p>
            )}

            {/* Source + timestamp */}
            {(alert.source || alert.timestamp) && (
              <div className="text-xs text-muted-foreground mt-1.5">
                {alert.source}
                {alert.source && alert.timestamp && " \u00B7 "}
                {alert.timestamp}
              </div>
            )}

            {/* Metadata */}
            {alert.metadata && Object.keys(alert.metadata).length > 0 && (
              <div className="mt-2 space-y-1">
                {Object.entries(alert.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-baseline gap-2 text-xs">
                    <span className="text-muted-foreground min-w-[80px] flex-shrink-0">
                      {key}
                    </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {alert.actions && alert.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {alert.actions.map((action, i) => (
                  <Button
                    key={i}
                    variant={action.variant === "destructive" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => onAction(action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Dismiss button */}
          {dismissible && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label={`Dismiss alert: ${alert.title}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="3" x2="11" y2="11" />
                <line x1="11" y1="3" x2="3" y2="11" />
              </svg>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
