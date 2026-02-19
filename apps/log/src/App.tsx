import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { ScrollArea, Input, Button, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { LogContent, LogLevel } from "./schema";

/* ------------------------------------------------------------------ */
/*  View                                                               */
/* ------------------------------------------------------------------ */

export function LogView() {
  const { data, content, isConnected } =
    useView<LogContent>("log", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <LogRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export interface LogRendererProps {
  data: LogContent;
}

const ALL_LEVELS: LogLevel[] = ["debug", "info", "warn", "error", "fatal"];

const LEVEL_COLOR: Record<LogLevel, string> = {
  debug: "text-gray-500",
  info: "text-blue-500",
  warn: "text-amber-500",
  error: "text-red-500",
  fatal: "text-purple-500",
};

const LEVEL_BG: Record<LogLevel, string> = {
  debug: "bg-gray-500/10",
  info: "bg-blue-500/10",
  warn: "bg-amber-500/10",
  error: "bg-red-500/10",
  fatal: "bg-purple-500/10",
};

/* ------------------------------------------------------------------ */
/*  Renderer                                                           */
/* ------------------------------------------------------------------ */

export function LogRenderer({ data }: LogRendererProps) {
  const {
    title,
    entries,
    levels,
    searchable = false,
    autoScroll: initialAutoScroll = true,
    showTimestamp = true,
    monospace = false,
  } = data;

  /* Level filter */
  const [visibleLevels, setVisibleLevels] = useState<Set<LogLevel>>(
    () => new Set(levels ?? ALL_LEVELS),
  );

  /* Search */
  const [search, setSearch] = useState("");

  /* Auto-scroll */
  const [autoScroll, setAutoScroll] = useState(initialAutoScroll);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevEntryCount = useRef(entries.length);

  /* Expanded entry */
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* Toggle a level */
  const toggleLevel = useCallback((level: LogLevel) => {
    setVisibleLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }, []);

  /* Filtered entries */
  const filteredEntries = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return entries.filter((entry) => {
      if (!visibleLevels.has(entry.level)) return false;
      if (lowerSearch && !entry.message.toLowerCase().includes(lowerSearch) &&
          !(entry.source?.toLowerCase().includes(lowerSearch))) return false;
      return true;
    });
  }, [entries, visibleLevels, search]);

  /* Auto-scroll on new entries */
  useEffect(() => {
    if (entries.length > prevEntryCount.current && autoScroll && !paused) {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
    prevEntryCount.current = entries.length;
  }, [entries.length, autoScroll, paused]);

  /* Detect user scroll-up to pause */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !autoScroll) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    setPaused(!atBottom);
  }, [autoScroll]);

  /* Resume auto-scroll */
  const resume = useCallback(() => {
    setPaused(false);
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  /* Clear search */
  const clearSearch = useCallback(() => setSearch(""), []);

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {title && <span className="text-sm font-semibold">{title}</span>}

          {/* Level filter buttons */}
          {ALL_LEVELS.map((level) => (
            <Button
              key={level}
              variant={visibleLevels.has(level) ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "text-xs h-6 px-2",
                visibleLevels.has(level) ? LEVEL_COLOR[level] : "text-muted-foreground opacity-50",
              )}
              onClick={() => toggleLevel(level)}
            >
              {level.toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {searchable && (
            <Input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 h-7 text-xs"
              aria-label="Search logs"
            />
          )}
          {search && (
            <Button variant="ghost" size="sm" className="text-xs h-6" onClick={clearSearch}>
              Clear
            </Button>
          )}
          <Button
            variant={autoScroll ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-6"
            onClick={() => { setAutoScroll((v) => !v); setPaused(false); }}
          >
            Auto-scroll {autoScroll ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      {/* Log area */}
      <ScrollArea className="flex-1" ref={scrollRef} onScroll={handleScroll}>
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className={cn("px-2 py-1", monospace && "font-mono")}
        >
          {filteredEntries.map((entry, idx) => {
            const entryId = entry.id ?? `${entry.timestamp}-${idx}`;
            const isExpanded = expandedId === entryId;

            return (
              <div key={entryId}>
                <div
                  className={cn(
                    "flex items-baseline gap-2 px-2 py-0.5 cursor-pointer hover:bg-muted/50 rounded-sm",
                    idx % 2 === 0 && "bg-muted/30",
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : entryId)}
                >
                  {/* Timestamp */}
                  {showTimestamp && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {entry.timestamp}
                    </span>
                  )}

                  {/* Level */}
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase whitespace-nowrap flex-shrink-0 rounded px-1",
                      LEVEL_COLOR[entry.level],
                      LEVEL_BG[entry.level],
                    )}
                  >
                    {entry.level}
                  </span>

                  {/* Source */}
                  {entry.source && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      [{entry.source}]
                    </span>
                  )}

                  {/* Message */}
                  <span className="text-sm break-words min-w-0">
                    {search
                      ? highlightSearch(entry.message, search)
                      : entry.message}
                  </span>
                </div>

                {/* Expanded metadata */}
                {isExpanded && entry.metadata && (
                  <div className="ml-8 px-2 py-1 mb-1 bg-muted/40 rounded text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(entry.metadata, null, 2)}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t text-xs text-muted-foreground">
        <span>
          {filteredEntries.length} of {entries.length} entries
        </span>
        {autoScroll && paused && (
          <Button
            variant="secondary"
            size="sm"
            className="text-xs h-5 px-2"
            onClick={resume}
          >
            Paused -- Click to resume
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function highlightSearch(text: string, search: string): React.ReactNode {
  if (!search) return text;
  const lower = text.toLowerCase();
  const searchLower = search.toLowerCase();
  const idx = lower.indexOf(searchLower);
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
        {text.slice(idx, idx + search.length)}
      </mark>
      {text.slice(idx + search.length)}
    </>
  );
}
