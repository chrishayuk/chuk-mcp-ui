import { useState, useMemo, useRef, useCallback } from "react";
import { useView } from "@chuk/view-shared";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import { Input } from "@chuk/view-ui";
import type { TranscriptContent, TranscriptEntry, SpeakerInfo } from "./schema";

export function TranscriptView() {
  const { data } = useView<TranscriptContent>("transcript", "1.0");
  if (!data) return null;
  return <TranscriptRenderer data={data} />;
}

export interface TranscriptRendererProps {
  data: TranscriptContent;
}

// Stable color palette for speakers without explicit colors
const SPEAKER_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
];

export function TranscriptRenderer({ data }: TranscriptRendererProps) {
  const { entries, speakers, title, description, searchable, showTimestamps = true } = data;
  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const speakerMap = useMemo(() => {
    const map = new Map<string, SpeakerInfo & { resolvedColor: string }>();
    let colorIdx = 0;
    // Pre-populate from speakers array
    for (const s of speakers ?? []) {
      map.set(s.id, { ...s, resolvedColor: s.color ?? SPEAKER_COLORS[colorIdx++ % SPEAKER_COLORS.length] });
    }
    // Fill in any speakers not in the array
    for (const entry of entries) {
      if (!map.has(entry.speaker)) {
        map.set(entry.speaker, {
          id: entry.speaker,
          name: entry.speaker,
          resolvedColor: SPEAKER_COLORS[colorIdx++ % SPEAKER_COLORS.length],
        });
      }
    }
    return map;
  }, [entries, speakers]);

  const filteredEntries = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.text.toLowerCase().includes(q) ||
        (speakerMap.get(e.speaker)?.name ?? e.speaker).toLowerCase().includes(q)
    );
  }, [entries, search, speakerMap]);

  const formatTimestamp = useCallback((entry: TranscriptEntry): string | null => {
    if (!entry.timestamp) return null;
    // If it looks like a number (seconds offset), format as mm:ss
    const num = Number(entry.timestamp);
    if (!isNaN(num)) {
      const mins = Math.floor(num / 60);
      const secs = Math.floor(num % 60);
      return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    // Otherwise try to format as time
    try {
      const d = new Date(entry.timestamp);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return entry.timestamp;
    }
  }, []);

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="max-w-[700px] mx-auto p-6">
        {title && <h2 className="mb-1 text-lg font-semibold">{title}</h2>}
        {description && <p className="mb-4 text-sm text-muted-foreground">{description}</p>}

        {/* Speaker legend */}
        {speakers && speakers.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {speakers.map((s) => {
              const info = speakerMap.get(s.id);
              return (
                <div key={s.id} className="flex items-center gap-1.5 text-xs">
                  {s.avatar ? (
                    <img src={s.avatar} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: info?.resolvedColor }}
                    />
                  )}
                  <span className="font-medium">{s.name}</span>
                  {s.role && <span className="text-muted-foreground">({s.role})</span>}
                </div>
              );
            })}
          </div>
        )}

        {searchable !== false && (
          <div className="mb-4">
            <Input
              placeholder="Search transcript..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm"
            />
          </div>
        )}

        {/* Entries */}
        <div ref={listRef} className="space-y-3">
          {filteredEntries.map((entry) => {
            const info = speakerMap.get(entry.speaker);
            const ts = showTimestamps ? formatTimestamp(entry) : null;

            return (
              <div key={entry.id} className="flex gap-3 group">
                {/* Timestamp column */}
                {showTimestamps && (
                  <div className="w-14 shrink-0 text-right">
                    {ts && (
                      <span className="text-xs text-muted-foreground font-mono tabular-nums">
                        {ts}
                      </span>
                    )}
                  </div>
                )}

                {/* Speaker color bar */}
                <div
                  className="w-1 rounded-full shrink-0"
                  style={{ backgroundColor: info?.resolvedColor }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: info?.resolvedColor }}
                    >
                      {info?.name ?? entry.speaker}
                    </span>
                    {entry.confidence !== undefined && entry.confidence < 0.8 && (
                      <span className="text-[10px] text-muted-foreground" title={`Confidence: ${Math.round(entry.confidence * 100)}%`}>
                        ~{Math.round(entry.confidence * 100)}%
                      </span>
                    )}
                    {entry.language && (
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {entry.language}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                </div>
              </div>
            );
          })}

          {filteredEntries.length === 0 && search && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No entries match "{search}"
            </p>
          )}
        </div>

        {/* Summary */}
        <p className="mt-4 text-xs text-muted-foreground text-center">
          {filteredEntries.length} of {entries.length} entries
          {speakerMap.size > 0 && ` \u00B7 ${speakerMap.size} speakers`}
        </p>
      </motion.div>
    </div>
  );
}
