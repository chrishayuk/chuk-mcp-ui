import { useState, useCallback, useMemo, type DragEvent } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  Badge,
  ScrollArea,
  cn,
} from "@chuk/view-ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  fadeIn,
  listContainer,
  listItem,
} from "@chuk/view-ui/animations";
import type {
  KanbanContent,
  KanbanColumn,
  KanbanCard,
  KanbanLabel,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper                                                       */
/* ------------------------------------------------------------------ */

export function KanbanView() {
  const { data, content, callTool, isConnected } =
    useView<KanbanContent>("kanban", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <KanbanRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface KanbanRendererProps {
  data: KanbanContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Priority colour helpers                                            */
/* ------------------------------------------------------------------ */

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-blue-400",
  medium: "bg-amber-400",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

/* ------------------------------------------------------------------ */
/*  Drag-and-drop data helpers                                         */
/* ------------------------------------------------------------------ */

interface DragPayload {
  cardId: string;
  sourceColumnId: string;
}

function encodeDragPayload(payload: DragPayload): string {
  return JSON.stringify(payload);
}

function decodeDragPayload(raw: string): DragPayload | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      typeof parsed.cardId === "string" &&
      typeof parsed.sourceColumnId === "string"
    ) {
      return parsed as DragPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Kanban Renderer                                                    */
/* ------------------------------------------------------------------ */

export function KanbanRenderer({ data, onCallTool }: KanbanRendererProps) {
  const { title, columns: initialColumns, moveTool } = data;

  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  /* ---- Move card between columns ---- */
  const moveCard = useCallback(
    (cardId: string, sourceColumnId: string, targetColumnId: string) => {
      if (sourceColumnId === targetColumnId) return;

      setColumns((prev) => {
        const sourceCol = prev.find((c) => c.id === sourceColumnId);
        if (!sourceCol) return prev;

        const card = sourceCol.cards.find((c) => c.id === cardId);
        if (!card) return prev;

        return prev.map((col) => {
          if (col.id === sourceColumnId) {
            return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
          }
          if (col.id === targetColumnId) {
            return { ...col, cards: [...col.cards, card] };
          }
          return col;
        });
      });

      /* Call moveTool if configured */
      if (moveTool && onCallTool) {
        onCallTool(moveTool, {
          cardId,
          from: sourceColumnId,
          to: targetColumnId,
        });
      }
    },
    [moveTool, onCallTool]
  );

  /* ---- Drag event handlers ---- */
  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, cardId: string, columnId: string) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "application/json",
        encodeDragPayload({ cardId, sourceColumnId: columnId })
      );
    },
    []
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>, columnId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverColumnId(columnId);
    },
    []
  );

  const handleDragLeave = useCallback(
    (_e: DragEvent<HTMLDivElement>, columnId: string) => {
      setDragOverColumnId((prev) => (prev === columnId ? null : prev));
    },
    []
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, targetColumnId: string) => {
      e.preventDefault();
      setDragOverColumnId(null);

      const raw = e.dataTransfer.getData("application/json");
      const payload = decodeDragPayload(raw);
      if (!payload) return;

      moveCard(payload.cardId, payload.sourceColumnId, targetColumnId);
    },
    [moveCard]
  );

  const handleDragEnd = useCallback(() => {
    setDragOverColumnId(null);
  }, []);

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

        {/* Board */}
        <div className="flex-1 overflow-x-auto px-4 pb-4">
          <div className="flex gap-4 h-full min-w-min">
            {columns.map((column) => (
              <ColumnContainer
                key={column.id}
                column={column}
                isDragOver={dragOverColumnId === column.id}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Column Container                                                   */
/* ------------------------------------------------------------------ */

interface ColumnContainerProps {
  column: KanbanColumn;
  isDragOver: boolean;
  onDragStart: (
    e: DragEvent<HTMLDivElement>,
    cardId: string,
    columnId: string
  ) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>, columnId: string) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>, columnId: string) => void;
  onDrop: (e: DragEvent<HTMLDivElement>, columnId: string) => void;
  onDragEnd: () => void;
}

function ColumnContainer({
  column,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: ColumnContainerProps) {
  const { id, label, color, limit, cards } = column;
  const isOverLimit = limit !== undefined && cards.length >= limit;

  return (
    <div
      className={cn(
        "flex flex-col w-72 min-w-[18rem] rounded-lg border bg-muted/30 transition-colors",
        isDragOver && "border-primary ring-2 ring-primary/20"
      )}
      onDragOver={(e) => onDragOver(e, id)}
      onDragLeave={(e) => onDragLeave(e, id)}
      onDrop={(e) => onDrop(e, id)}
    >
      {/* Colored header strip */}
      <div
        className="h-1.5 rounded-t-lg"
        style={{ backgroundColor: color ?? "var(--border)" }}
      />

      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="text-sm font-semibold flex-1 truncate">{label}</span>
        <Badge
          variant={isOverLimit ? "destructive" : "secondary"}
          className="text-[10px] tabular-nums"
        >
          {cards.length}
          {limit !== undefined && ` / ${limit}`}
        </Badge>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 px-2 pb-2">
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2"
        >
          <AnimatePresence mode="popLayout">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                variants={listItem}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                layout
              >
                <KanbanCardComponent
                  card={card}
                  columnId={id}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </ScrollArea>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Kanban Card                                                        */
/* ------------------------------------------------------------------ */

interface KanbanCardComponentProps {
  card: KanbanCard;
  columnId: string;
  onDragStart: (
    e: DragEvent<HTMLDivElement>,
    cardId: string,
    columnId: string
  ) => void;
  onDragEnd: () => void;
}

function KanbanCardComponent({
  card,
  columnId,
  onDragStart,
  onDragEnd,
}: KanbanCardComponentProps) {
  const { id, title: cardTitle, description, assignee, labels, priority, image } = card;

  return (
    <Card
      className="cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md"
      draggable
      onDragStart={(e) => onDragStart(e as unknown as DragEvent<HTMLDivElement>, id, columnId)}
      onDragEnd={onDragEnd}
    >
      <CardContent className="p-3">
        {/* Image */}
        {image && (
          <div className="mb-2 -mx-3 -mt-3 overflow-hidden rounded-t-lg">
            <img
              src={image}
              alt=""
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {/* Priority + Title row */}
        <div className="flex items-start gap-2">
          {priority && (
            <span
              className={cn(
                "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                PRIORITY_DOT[priority]
              )}
              title={PRIORITY_LABEL[priority]}
            />
          )}
          <span className="text-sm font-medium flex-1 min-w-0 leading-snug">
            {cardTitle}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
            {description}
          </p>
        )}

        {/* Labels */}
        {labels && labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {labels.map((lbl) => (
              <LabelBadge key={lbl.text} label={lbl} />
            ))}
          </div>
        )}

        {/* Footer: assignee */}
        {assignee && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
            <AssigneeAvatar name={assignee} />
            <span className="text-xs text-muted-foreground truncate">
              {assignee}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Label Badge                                                        */
/* ------------------------------------------------------------------ */

function LabelBadge({ label }: { label: KanbanLabel }) {
  return (
    <Badge
      variant="outline"
      className="text-[10px]"
      style={
        label.color
          ? { borderColor: label.color, color: label.color }
          : undefined
      }
    >
      {label.text}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Assignee Avatar                                                    */
/* ------------------------------------------------------------------ */

function AssigneeAvatar({ name }: { name: string }) {
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  const bgColor = useMemo(() => {
    /* Simple deterministic colour from name */
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 60%)`;
  }, [name]);

  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white"
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
}
