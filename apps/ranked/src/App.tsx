import { useCallback } from "react";
import { useView } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  Badge,
  Button,
  ScrollArea,
} from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn, listContainer, listItem } from "@chuk/view-ui/animations";
import type { RankedContent, RankedItem, RankedAction } from "./schema";

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                               */
/* ------------------------------------------------------------------ */

export function RankedView() {
  const { data, callTool } =
    useView<RankedContent>("ranked", "1.0");

  if (!data) return null;

  return <RankedRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                      */
/* ------------------------------------------------------------------ */

export interface RankedRendererProps {
  data: RankedContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

export function RankedRenderer({ data, onCallTool }: RankedRendererProps) {
  const {
    title,
    items,
    maxScore: maxScoreProp,
    showDelta,
    scoreLabel,
    scoreSuffix = "",
  } = data;

  const maxScore =
    maxScoreProp ?? Math.max(...items.map((i) => i.score), 1);

  const handleAction = useCallback(
    async (action: RankedAction) => {
      if (onCallTool) {
        await onCallTool(action.tool, action.arguments ?? {});
      }
    },
    [onCallTool],
  );

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      {/* Header */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="px-6 pt-6 pb-2 flex-shrink-0"
      >
        {title && (
          <h1 className="text-xl font-semibold leading-tight">{title}</h1>
        )}
        {scoreLabel && (
          <p className="mt-1 text-sm text-muted-foreground">{scoreLabel}</p>
        )}
      </motion.div>

      {/* List area */}
      <ScrollArea className="flex-1 min-h-0">
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="visible"
          className="px-6 pb-6 space-y-2"
        >
          {items.map((item) => (
            <motion.div key={item.id} variants={listItem}>
              <RankedRow
                item={item}
                maxScore={maxScore}
                showDelta={showDelta}
                scoreSuffix={scoreSuffix}
                onAction={handleAction}
              />
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Row                                                               */
/* ------------------------------------------------------------------ */

interface RankedRowProps {
  item: RankedItem;
  maxScore: number;
  showDelta?: boolean;
  scoreSuffix: string;
  onAction: (action: RankedAction) => void;
}

function RankedRow({
  item,
  maxScore,
  showDelta,
  scoreSuffix,
  onAction,
}: RankedRowProps) {
  const {
    rank,
    title,
    subtitle,
    score,
    previousRank,
    badges,
    metadata,
    image,
    actions,
  } = item;

  const fillPct = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        {/* Rank number */}
        <div
          className={`w-[48px] flex-shrink-0 text-center text-2xl font-bold ${rankColour(rank)}`}
        >
          {rank}
        </div>

        {/* Delta indicator */}
        {showDelta && previousRank != null && (
          <div className="w-5 flex-shrink-0 text-center text-sm leading-none">
            <DeltaIndicator rank={rank} previousRank={previousRank} />
          </div>
        )}

        {/* Image */}
        {image && (
          <img
            src={image.url}
            alt={image.alt ?? title}
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{title}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}

          {/* Badges */}
          {badges && badges.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {badges.map((badge, i) => (
                <Badge key={i} variant={badge.variant ?? "default"}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Metadata */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="flex gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
              {Object.entries(metadata).map(([key, value]) => (
                <span key={key}>
                  <span className="font-medium">{key}:</span> {value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score bar + value */}
        <div className="w-[140px] flex-shrink-0 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <span className="text-sm font-medium tabular-nums whitespace-nowrap">
            {score}{scoreSuffix}
          </span>
        </div>

        {/* Action buttons */}
        {actions && actions.length > 0 && (
          <div className="flex gap-1 flex-shrink-0">
            {actions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => onAction(action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function rankColour(rank: number): string {
  if (rank === 1) return "text-amber-500";   // gold
  if (rank === 2) return "text-gray-400";    // silver
  if (rank === 3) return "text-amber-700";   // bronze
  return "text-muted-foreground";
}

function DeltaIndicator({
  rank,
  previousRank,
}: {
  rank: number;
  previousRank: number;
}) {
  const delta = previousRank - rank; // positive = improved
  if (delta > 0) return <span className="text-green-500">&#9650;</span>;
  if (delta < 0) return <span className="text-red-500">&#9660;</span>;
  return <span className="text-gray-400">&#8212;</span>;
}
