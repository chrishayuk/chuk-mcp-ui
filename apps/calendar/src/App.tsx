import { useState, useMemo, useCallback } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent, CardHeader, CardTitle, Button, cn } from "@chuk/view-ui";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { CalendarContent, CalendarEvent } from "./schema";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DEFAULT_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseDate(s: string): Date {
  // Handle date-only strings (YYYY-MM-DD) as local dates
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(s);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDateFull(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                                */
/* ------------------------------------------------------------------ */

export function CalendarView() {
  const { data, content, isConnected } =
    useView<CalendarContent>("calendar", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <CalendarRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                       */
/* ------------------------------------------------------------------ */

export function CalendarRenderer({ data }: { data: CalendarContent }) {
  const initialDate = data.defaultDate ? parseDate(data.defaultDate) : new Date();
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [viewMode, setViewMode] = useState<"month" | "agenda">(
    data.defaultView === "agenda" ? "agenda" : "month"
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const goToPrevMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }, []);

  // Index events by date string for fast lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of data.events) {
      const start = parseDate(event.start);
      const key = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
      const existing = map.get(key) ?? [];
      existing.push(event);
      map.set(key, existing);
    }
    return map;
  }, [data.events]);

  // Sorted events for agenda view
  const sortedEvents = useMemo(() => {
    return [...data.events].sort(
      (a, b) => parseDate(a.start).getTime() - parseDate(b.start).getTime()
    );
  }, [data.events]);

  // Events for the current month in agenda view
  const monthEvents = useMemo(() => {
    return sortedEvents.filter((e) => {
      const d = parseDate(e.start);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [sortedEvents, year, month]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col font-sans text-foreground bg-background"
    >
      <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
        {/* Header */}
        <CardHeader className="flex-shrink-0 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">
              {data.title ?? formatMonthYear(year, month)}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode("month")}>
                Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode("agenda")}>
                Agenda
              </Button>
            </div>
          </div>
          {/* Month navigation */}
          <div className="flex items-center gap-2 mt-2">
            <Button variant="ghost" size="sm" onClick={goToPrevMonth} aria-label="Previous month">
              <ChevronLeft />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {formatMonthYear(year, month)}
            </span>
            <Button variant="ghost" size="sm" onClick={goToNextMonth} aria-label="Next month">
              <ChevronRight />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 overflow-auto pt-0">
          {viewMode === "month" ? (
            <MonthGrid
              year={year}
              month={month}
              eventsByDate={eventsByDate}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
            />
          ) : (
            <AgendaList
              events={monthEvents}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
            />
          )}
        </CardContent>
      </Card>

      {/* Event detail popover */}
      <AnimatePresence>
        {selectedEvent && (
          <EventPopover
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Month Grid                                                         */
/* ------------------------------------------------------------------ */

interface MonthGridProps {
  year: number;
  month: number;
  eventsByDate: Map<string, CalendarEvent[]>;
  selectedEvent: CalendarEvent | null;
  onSelectEvent: (e: CalendarEvent) => void;
}

function MonthGrid({ year, month, eventsByDate, selectedEvent, onSelectEvent }: MonthGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date();

  // Build grid cells: leading blanks + days of month
  const cells: Array<{ day: number; events: CalendarEvent[] }> = [];

  // Leading blank cells
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: 0, events: [] });
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${month}-${d}`;
    cells.push({ day: d, events: eventsByDate.get(key) ?? [] });
  }

  // Trailing blanks to fill last row
  while (cells.length % 7 !== 0) {
    cells.push({ day: 0, events: [] });
  }

  const weeks: Array<typeof cells> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Week rows */}
      <div className="flex-1 grid" style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((cell, ci) => {
              const isToday =
                cell.day > 0 &&
                isSameDay(new Date(year, month, cell.day), today);

              return (
                <div
                  key={ci}
                  className={cn(
                    "border-r last:border-r-0 p-1 min-h-[60px] overflow-hidden",
                    cell.day === 0 && "bg-muted/30",
                  )}
                >
                  {cell.day > 0 && (
                    <>
                      <div
                        className={cn(
                          "text-xs mb-0.5 w-6 h-6 flex items-center justify-center rounded-full",
                          isToday && "bg-primary text-primary-foreground font-bold",
                        )}
                      >
                        {cell.day}
                      </div>
                      <div className="space-y-0.5">
                        {cell.events.slice(0, 3).map((evt, ei) => (
                          <EventPill
                            key={evt.id}
                            event={evt}
                            index={ei}
                            isSelected={selectedEvent?.id === evt.id}
                            onClick={() => onSelectEvent(evt)}
                          />
                        ))}
                        {cell.events.length > 3 && (
                          <div className="text-[10px] text-muted-foreground pl-1">
                            +{cell.events.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Event Pill                                                         */
/* ------------------------------------------------------------------ */

interface EventPillProps {
  event: CalendarEvent;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

function EventPill({ event, index, isSelected, onClick }: EventPillProps) {
  const color = event.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate",
        "cursor-pointer transition-opacity hover:opacity-80",
        isSelected && "ring-1 ring-primary",
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderLeft: `2px solid ${color}`,
      }}
      title={event.title}
    >
      {event.title}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Agenda List                                                        */
/* ------------------------------------------------------------------ */

interface AgendaListProps {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  onSelectEvent: (e: CalendarEvent) => void;
}

function AgendaList({ events, selectedEvent, onSelectEvent }: AgendaListProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No events this month
      </div>
    );
  }

  // Group events by date
  const grouped = new Map<string, CalendarEvent[]>();
  for (const evt of events) {
    const d = parseDate(evt.start);
    const key = d.toISOString().split("T")[0];
    const existing = grouped.get(key) ?? [];
    existing.push(evt);
    grouped.set(key, existing);
  }

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([dateKey, dayEvents]) => {
        const date = parseDate(dateKey);
        return (
          <div key={dateKey}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {formatDateFull(date)}
            </h3>
            <div className="space-y-1">
              {dayEvents.map((evt, ei) => {
                const start = parseDate(evt.start);
                const color = evt.color ?? DEFAULT_COLORS[ei % DEFAULT_COLORS.length];
                const isSelected = selectedEvent?.id === evt.id;

                return (
                  <button
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className={cn(
                      "w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      "hover:bg-muted/50",
                      isSelected && "bg-muted",
                    )}
                  >
                    <div
                      className="w-1 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {evt.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {evt.allDay ? "All day" : formatTime(start)}
                        {evt.end && !evt.allDay && ` - ${formatTime(parseDate(evt.end))}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Event Popover                                                      */
/* ------------------------------------------------------------------ */

interface EventPopoverProps {
  event: CalendarEvent;
  onClose: () => void;
}

function EventPopover({ event, onClose }: EventPopoverProps) {
  const start = parseDate(event.start);
  const color = event.color ?? DEFAULT_COLORS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border rounded-xl shadow-lg p-4 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <h3 className="font-semibold text-sm">{event.title}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <CloseIcon />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>{formatDateFull(start)}</div>
          {!event.allDay && (
            <div>
              {formatTime(start)}
              {event.end && ` - ${formatTime(parseDate(event.end))}`}
            </div>
          )}
          {event.allDay && <div>All day</div>}
          {event.description && (
            <p className="mt-2 text-foreground/80">{event.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4l-4 4 4 4" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 3l8 8M11 3l-8 8" />
    </svg>
  );
}
