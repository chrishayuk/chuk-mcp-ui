import { useMemo } from "react";
import { useView } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  ScrollArea,
  cn,
} from "@chuk/view-ui";
import { motion } from "framer-motion";
import {
  fadeIn,
  listContainer,
  listItem,
} from "@chuk/view-ui/animations";
import type {
  SwimlaneContent,
  SwimlaneActivity,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper                                                       */
/* ------------------------------------------------------------------ */

export function SwimlaneView() {
  const { data, callTool } =
    useView<SwimlaneContent>("swimlane", "1.0");

  if (!data) return null;

  return <SwimlaneRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface SwimlaneRendererProps {
  data: SwimlaneContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Status colour helpers                                              */
/* ------------------------------------------------------------------ */

const STATUS_COLORS: Record<string, string> = {
  pending: "border-l-gray-400 bg-gray-50 dark:bg-gray-900/40",
  active: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/30",
  completed: "border-l-green-500 bg-green-50 dark:bg-green-900/30",
  blocked: "border-l-red-500 bg-red-50 dark:bg-red-900/30",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "text-gray-600 dark:text-gray-400",
  active: "text-blue-600 dark:text-blue-400",
  completed: "text-green-600 dark:text-green-400",
  blocked: "text-red-600 dark:text-red-400",
};

/* ------------------------------------------------------------------ */
/*  Swimlane Renderer                                                  */
/* ------------------------------------------------------------------ */

export function SwimlaneRenderer({ data }: SwimlaneRendererProps) {
  const { title, lanes, columns, activities } = data;

  /* Build a lookup: laneId -> columnId -> activities[] */
  const activityMap = useMemo(() => {
    const map = new Map<string, Map<string, SwimlaneActivity[]>>();
    for (const lane of lanes) {
      const colMap = new Map<string, SwimlaneActivity[]>();
      for (const col of columns) {
        colMap.set(col.id, []);
      }
      map.set(lane.id, colMap);
    }
    for (const activity of activities) {
      const colMap = map.get(activity.laneId);
      if (colMap) {
        const list = colMap.get(activity.columnId);
        if (list) {
          list.push(activity);
        }
      }
    }
    return map;
  }, [lanes, columns, activities]);

  const gridTemplateColumns = `10rem repeat(${columns.length}, minmax(12rem, 1fr))`;

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full"
      >
        {/* Header */}
        {title && (
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}

        {/* Grid */}
        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="min-w-min">
            {/* Column headers */}
            <div
              className="grid gap-px sticky top-0 z-10 bg-background"
              style={{ gridTemplateColumns }}
            >
              {/* Empty cell for lane labels column */}
              <div className="p-3" />
              {columns.map((col) => (
                <div
                  key={col.id}
                  className="p-3 text-center text-sm font-semibold text-muted-foreground border-b-2 border-border"
                >
                  {col.label}
                </div>
              ))}
            </div>

            {/* Lane rows */}
            <motion.div
              variants={listContainer}
              initial="hidden"
              animate="visible"
            >
              {lanes.map((lane) => (
                <motion.div
                  key={lane.id}
                  variants={listItem}
                  className="grid gap-px border-b border-border last:border-b-0"
                  style={{ gridTemplateColumns }}
                >
                  {/* Lane label */}
                  <div className="p-3 flex items-start gap-2 border-r border-border">
                    {lane.color && (
                      <div
                        className="w-1 self-stretch rounded-full flex-shrink-0"
                        style={{ backgroundColor: lane.color }}
                      />
                    )}
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {lane.label}
                    </span>
                  </div>

                  {/* Activity cells */}
                  {columns.map((col) => {
                    const cellActivities =
                      activityMap.get(lane.id)?.get(col.id) ?? [];
                    return (
                      <div
                        key={col.id}
                        className="p-2 min-h-[5rem] border-r border-border last:border-r-0 flex flex-col gap-2"
                      >
                        {cellActivities.map((activity) => (
                          <ActivityCard key={activity.id} activity={activity} />
                        ))}
                      </div>
                    );
                  })}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity Card                                                      */
/* ------------------------------------------------------------------ */

function ActivityCard({ activity }: { activity: SwimlaneActivity }) {
  const { label, description, status, color } = activity;
  const statusClass = status ? STATUS_COLORS[status] : "";
  const badgeClass = status ? STATUS_BADGE[status] : "";

  return (
    <Card
      className={cn(
        "border-l-4 transition-shadow hover:shadow-md",
        statusClass
      )}
      style={color && !status ? { borderLeftColor: color } : undefined}
    >
      <CardContent className="p-2.5">
        <span className="text-xs font-medium leading-snug block">
          {label}
        </span>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
        {status && (
          <span
            className={cn(
              "text-[10px] font-medium mt-1.5 block capitalize",
              badgeClass
            )}
          >
            {status}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
