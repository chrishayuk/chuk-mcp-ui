import { useState, useCallback, useMemo } from "react";
import { useView, Fallback } from "@chuk/view-shared";
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
  collapseExpand,
} from "@chuk/view-ui/animations";
import type {
  TimelineContent,
  TimelineEvent,
  TimelineGroup,
  TimelineAction,
  TimelineDetail,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper                                                       */
/* ------------------------------------------------------------------ */

export function TimelineView() {
  const { data, content, callTool, isConnected } =
    useView<TimelineContent>("timeline", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <TimelineRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface TimelineRendererProps {
  data: TimelineContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Severity / colour helpers                                          */
/* ------------------------------------------------------------------ */

const SEVERITY_DOT: Record<string, string> = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

const SEVERITY_RING: Record<string, string> = {
  info: "ring-blue-500/30",
  success: "ring-emerald-500/30",
  warning: "ring-amber-500/30",
  error: "ring-red-500/30",
};

/* ------------------------------------------------------------------ */
/*  Date grouping helper                                               */
/* ------------------------------------------------------------------ */

function formatDateGroup(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  } catch {
    return dateStr;
  }
}

function formatEventDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/* ------------------------------------------------------------------ */
/*  Timeline Renderer                                                  */
/* ------------------------------------------------------------------ */

export function TimelineRenderer({ data, onCallTool }: TimelineRendererProps) {
  const { title, events, groups } = data;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [visibleGroups, setVisibleGroups] = useState<Set<string>>(
    () => new Set(groups?.map((g) => g.id) ?? [])
  );

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setVisibleGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const handleAction = useCallback(
    async (action: TimelineAction) => {
      if (onCallTool) {
        await onCallTool(action.tool, action.arguments);
      }
    },
    [onCallTool]
  );

  /* Filter events by visible groups */
  const filteredEvents = useMemo(() => {
    if (!groups || groups.length === 0) return events;
    return events.filter(
      (e) => !e.group || visibleGroups.has(e.group)
    );
  }, [events, groups, visibleGroups]);

  /* Sort events by date (newest first) */
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredEvents]);

  /* Group events by month/year for date group headers */
  const dateGroups = useMemo(() => {
    const grouped: { label: string; events: TimelineEvent[] }[] = [];
    let currentLabel = "";
    for (const event of sortedEvents) {
      const label = formatDateGroup(event.date);
      if (label !== currentLabel) {
        currentLabel = label;
        grouped.push({ label, events: [event] });
      } else {
        grouped[grouped.length - 1].events.push(event);
      }
    }
    return grouped;
  }, [sortedEvents]);

  /* Resolve group colour */
  const groupMap = useMemo(() => {
    const m = new Map<string, TimelineGroup>();
    groups?.forEach((g) => m.set(g.id, g));
    return m;
  }, [groups]);

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

          {/* Group filter badges */}
          {groups && groups.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {groups.map((group) => {
                const active = visibleGroups.has(group.id);
                return (
                  <button
                    key={group.id}
                    onClick={() => toggleGroup(group.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer",
                      "border",
                      active
                        ? "border-border bg-secondary text-secondary-foreground"
                        : "border-transparent bg-muted/50 text-muted-foreground opacity-50"
                    )}
                  >
                    {group.color && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                    )}
                    {group.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Timeline area */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="relative">
            {/* Central vertical line */}
            <div className="absolute left-[17px] top-0 bottom-0 w-0 border-l-2 border-border" />

            <motion.div
              variants={listContainer}
              initial="hidden"
              animate="visible"
              className="space-y-1"
            >
              {dateGroups.map((dateGroup) => (
                <div key={dateGroup.label}>
                  {/* Date group header */}
                  {dateGroups.length > 1 && (
                    <div className="relative pl-10 py-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {dateGroup.label}
                      </span>
                    </div>
                  )}

                  {/* Events in this group */}
                  {dateGroup.events.map((event) => (
                    <motion.div key={event.id} variants={listItem}>
                      <EventCard
                        event={event}
                        expanded={expandedIds.has(event.id)}
                        onToggle={() => toggleExpanded(event.id)}
                        onAction={handleAction}
                        groupMap={groupMap}
                      />
                    </motion.div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Event Card                                                         */
/* ------------------------------------------------------------------ */

interface EventCardProps {
  event: TimelineEvent;
  expanded: boolean;
  onToggle: () => void;
  onAction: (action: TimelineAction) => void;
  groupMap: Map<string, TimelineGroup>;
}

function EventCard({
  event,
  expanded,
  onToggle,
  onAction,
  groupMap,
}: EventCardProps) {
  const dotColor = event.color
    ? undefined
    : SEVERITY_DOT[event.severity ?? "info"];
  const ringColor = SEVERITY_RING[event.severity ?? "info"];
  const group = event.group ? groupMap.get(event.group) : undefined;

  return (
    <div className="relative flex items-start gap-3 py-1.5">
      {/* Dot on the timeline */}
      <div className="relative z-10 flex-shrink-0 mt-2.5">
        <span
          className={cn(
            "block w-3 h-3 rounded-full ring-4",
            dotColor,
            ringColor
          )}
          style={event.color ? { backgroundColor: event.color } : undefined}
        />
      </div>

      {/* Card */}
      <Card
        className={cn(
          "flex-1 cursor-pointer transition-shadow hover:shadow-md",
          expanded && "shadow-md"
        )}
        onClick={onToggle}
      >
        <CardContent className="p-3">
          {/* First row: icon + title */}
          <div className="flex items-center gap-2">
            {event.icon && (
              <span className="text-base flex-shrink-0">{event.icon}</span>
            )}
            <span className="text-sm font-medium flex-1 min-w-0 truncate">
              {event.title}
            </span>
            {group && (
              <Badge
                variant="outline"
                className="text-[10px] flex-shrink-0"
                style={group.color ? { borderColor: group.color, color: group.color } : undefined}
              >
                {group.label}
              </Badge>
            )}
          </div>

          {/* Date */}
          <div className="text-xs text-muted-foreground mt-1">
            {formatEventDate(event.date)}
            {event.endDate && ` \u2013 ${formatEventDate(event.endDate)}`}
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Expandable content */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                variants={collapseExpand}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {event.description}
                  </p>
                )}

                {/* Details key-value pairs */}
                {event.details && event.details.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {event.details.map((detail, i) => (
                      <DetailRow key={i} detail={detail} />
                    ))}
                  </div>
                )}

                {/* Action button */}
                {event.action && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(event.action!);
                      }}
                    >
                      {event.action.label}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail Row                                                         */
/* ------------------------------------------------------------------ */

function DetailRow({ detail }: { detail: TimelineDetail }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-muted-foreground min-w-[100px] flex-shrink-0">
        {detail.label}
      </span>
      <span className="text-xs">{detail.value}</span>
    </div>
  );
}
