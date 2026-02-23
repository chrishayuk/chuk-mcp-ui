import { useView } from "@chuk/view-shared";
import { Card, CardContent, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn, listContainer, listItem } from "@chuk/view-ui/animations";
import type { ProgressContent, ProgressTrack } from "./schema";

export function ProgressView() {
  const { data } =
    useView<ProgressContent>("progress", "1.0");

  if (!data) return null;

  return <ProgressRenderer data={data} />;
}

export interface ProgressRendererProps {
  data: ProgressContent;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-primary",
  complete: "bg-emerald-500",
  error: "bg-red-500",
  pending: "bg-muted-foreground/30",
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-primary animate-pulse",
  complete: "bg-emerald-500",
  error: "bg-red-500",
  pending: "bg-muted-foreground/30",
};

export function ProgressRenderer({ data }: ProgressRendererProps) {
  const { title, overall, tracks } = data;

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
            {(title || overall !== undefined) && (
              <div className="mb-4">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {overall !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Overall</span>
                      <span className="font-medium">{Math.round(overall)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, overall))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tracks */}
            <motion.div
              variants={listContainer}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {tracks.map((track) => (
                <motion.div key={track.id} variants={listItem}>
                  <TrackRow track={track} />
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function TrackRow({ track }: { track: ProgressTrack }) {
  const { label, value, max = 100, status = "active", detail } = track;
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = STATUS_COLORS[status] ?? STATUS_COLORS.active;
  const dotColor = STATUS_DOT[status] ?? STATUS_DOT.active;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full flex-shrink-0", dotColor)} />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-muted-foreground">
          {Math.round(percent)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300 ease-out", barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
      {detail && (
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      )}
    </div>
  );
}
