import { useState, useMemo } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Button, Badge, ScrollArea, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { DiffContent, DiffHunk, DiffLine } from "./schema";

/* ------------------------------------------------------------------ */
/*  View (connected to MCP)                                           */
/* ------------------------------------------------------------------ */

export function DiffView() {
  const { data, content, isConnected } =
    useView<DiffContent>("diff", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <DiffRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                      */
/* ------------------------------------------------------------------ */

export interface DiffRendererProps {
  data: DiffContent;
}

export function DiffRenderer({ data }: DiffRendererProps) {
  const {
    title,
    language,
    mode: initialMode = "unified",
    fileA,
    fileB,
    hunks,
  } = data;

  const [mode, setMode] = useState<"unified" | "split">(initialMode);

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mx-auto p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {title && (
              <h1 className="text-lg font-semibold leading-tight">{title}</h1>
            )}
            {language && (
              <Badge variant="secondary" className="text-xs">
                {language}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode((m) => (m === "unified" ? "split" : "unified"))}
            className="text-xs"
          >
            {mode === "unified" ? "Split" : "Unified"}
          </Button>
        </div>

        {/* File name tabs */}
        {(fileA || fileB) && (
          <div className="flex border-b border-border mb-0">
            {fileA && (
              <div className="px-3 py-1.5 text-xs font-mono text-muted-foreground bg-muted rounded-t border border-b-0 border-border">
                {fileA}
              </div>
            )}
            {fileB && fileB !== fileA && (
              <div className="px-3 py-1.5 text-xs font-mono text-muted-foreground bg-muted rounded-t border border-b-0 border-border ml-1">
                {fileB}
              </div>
            )}
          </div>
        )}

        {/* Diff content */}
        <div className="border border-border rounded-b overflow-hidden">
          <ScrollArea className="max-h-[80vh]">
            {mode === "unified" ? (
              <UnifiedDiff hunks={hunks} />
            ) : (
              <SplitDiff hunks={hunks} />
            )}
          </ScrollArea>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Unified Diff                                                      */
/* ------------------------------------------------------------------ */

function UnifiedDiff({ hunks }: { hunks: DiffHunk[] }) {
  return (
    <table className="w-full border-collapse font-mono text-sm">
      <tbody>
        {hunks.map((hunk, hunkIdx) => (
          <UnifiedHunk key={hunkIdx} hunk={hunk} isFirst={hunkIdx === 0} />
        ))}
      </tbody>
    </table>
  );
}

function UnifiedHunk({ hunk, isFirst }: { hunk: DiffHunk; isFirst: boolean }) {
  const header = hunk.headerB
    ? `${hunk.headerA} ${hunk.headerB}`
    : hunk.headerA;

  return (
    <>
      {/* Hunk separator */}
      <tr className={cn("bg-muted/50", !isFirst && "border-t border-border")}>
        <td
          colSpan={3}
          className="px-3 py-1 text-xs text-muted-foreground select-none"
        >
          {header}
        </td>
      </tr>

      {/* Lines */}
      {hunk.lines.map((line, lineIdx) => (
        <UnifiedLine key={lineIdx} line={line} />
      ))}
    </>
  );
}

function UnifiedLine({ line }: { line: DiffLine }) {
  const prefix =
    line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";

  const rowClass = cn(
    "border-t border-border/30",
    line.type === "add" && "bg-green-50 dark:bg-green-900/10",
    line.type === "remove" && "bg-red-50 dark:bg-red-900/10"
  );

  const prefixClass = cn(
    "select-none",
    line.type === "add" && "text-green-700 dark:text-green-400",
    line.type === "remove" && "text-red-700 dark:text-red-400"
  );

  return (
    <tr className={rowClass}>
      <td className="w-12 px-2 py-0 text-right text-xs text-muted-foreground select-none align-top whitespace-nowrap">
        {line.lineA ?? ""}
      </td>
      <td className="w-12 px-2 py-0 text-right text-xs text-muted-foreground select-none align-top whitespace-nowrap">
        {line.lineB ?? ""}
      </td>
      <td className="px-3 py-0 whitespace-pre">
        <span className={prefixClass}>{prefix}</span>
        {line.content}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Split Diff                                                        */
/* ------------------------------------------------------------------ */

interface SplitPair {
  left: DiffLine | null;
  right: DiffLine | null;
}

function useSplitPairs(hunks: DiffHunk[]): { hunkHeader: string; pairs: SplitPair[] }[] {
  return useMemo(() => {
    return hunks.map((hunk) => {
      const header = hunk.headerB
        ? `${hunk.headerA} ${hunk.headerB}`
        : hunk.headerA;

      const pairs: SplitPair[] = [];
      const removes: DiffLine[] = [];
      const adds: DiffLine[] = [];

      const flushChanges = () => {
        const max = Math.max(removes.length, adds.length);
        for (let i = 0; i < max; i++) {
          pairs.push({
            left: i < removes.length ? removes[i] : null,
            right: i < adds.length ? adds[i] : null,
          });
        }
        removes.length = 0;
        adds.length = 0;
      };

      for (const line of hunk.lines) {
        if (line.type === "context") {
          flushChanges();
          pairs.push({ left: line, right: line });
        } else if (line.type === "remove") {
          removes.push(line);
        } else {
          adds.push(line);
        }
      }
      flushChanges();

      return { hunkHeader: header, pairs };
    });
  }, [hunks]);
}

function SplitDiff({ hunks }: { hunks: DiffHunk[] }) {
  const splitData = useSplitPairs(hunks);

  return (
    <div className="flex">
      {/* Left panel */}
      <table className="w-1/2 border-collapse font-mono text-sm border-r border-border">
        <tbody>
          {splitData.map((hunk, hunkIdx) => (
            <SplitHunkSide
              key={hunkIdx}
              header={hunk.hunkHeader}
              pairs={hunk.pairs}
              side="left"
              isFirst={hunkIdx === 0}
            />
          ))}
        </tbody>
      </table>

      {/* Right panel */}
      <table className="w-1/2 border-collapse font-mono text-sm">
        <tbody>
          {splitData.map((hunk, hunkIdx) => (
            <SplitHunkSide
              key={hunkIdx}
              header={hunk.hunkHeader}
              pairs={hunk.pairs}
              side="right"
              isFirst={hunkIdx === 0}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SplitHunkSide({
  header,
  pairs,
  side,
  isFirst,
}: {
  header: string;
  pairs: SplitPair[];
  side: "left" | "right";
  isFirst: boolean;
}) {
  return (
    <>
      <tr className={cn("bg-muted/50", !isFirst && "border-t border-border")}>
        <td
          colSpan={2}
          className="px-3 py-1 text-xs text-muted-foreground select-none"
        >
          {header}
        </td>
      </tr>

      {pairs.map((pair, pairIdx) => {
        const line = side === "left" ? pair.left : pair.right;

        if (!line) {
          return (
            <tr key={pairIdx} className="border-t border-border/30 bg-muted/20">
              <td className="w-12 px-2 py-0 text-right text-xs text-muted-foreground select-none" />
              <td className="px-3 py-0 whitespace-pre">&nbsp;</td>
            </tr>
          );
        }

        const isAdd = line.type === "add";
        const isRemove = line.type === "remove";

        const rowClass = cn(
          "border-t border-border/30",
          isAdd && "bg-green-50 dark:bg-green-900/10",
          isRemove && "bg-red-50 dark:bg-red-900/10"
        );

        const lineNum = side === "left" ? line.lineA : line.lineB;

        return (
          <tr key={pairIdx} className={rowClass}>
            <td className="w-12 px-2 py-0 text-right text-xs text-muted-foreground select-none align-top whitespace-nowrap">
              {lineNum ?? ""}
            </td>
            <td className="px-3 py-0 whitespace-pre">{line.content}</td>
          </tr>
        );
      })}
    </>
  );
}
