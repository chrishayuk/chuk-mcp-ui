import { useRef, useCallback } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { cn } from "@chuk/view-ui";
import type { SplitContent, SplitPanel } from "./schema";

export function SplitView() {
  const { data, content, isConnected } =
    useView<SplitContent>("split", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <Split data={data} />;
}

export function Split({ data }: { data: SplitContent }) {
  const { direction = "horizontal", ratio = "50:50", left, right } = data;
  const [leftRatio, rightRatio] = ratio.split(":").map(Number);
  const isHorizontal = direction === "horizontal";

  return (
    <div
      className={cn(
        "flex w-full h-full gap-1 p-1 bg-background",
        isHorizontal ? "flex-row" : "flex-col"
      )}
    >
      <ChildPanel
        panel={left}
        flex={leftRatio}
      />
      <ChildPanel
        panel={right}
        flex={rightRatio}
      />
    </div>
  );
}

function ChildPanel({ panel, flex }: { panel: SplitPanel; flex: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "mcp-app:tool-result",
        content: [],
        structuredContent: panel.structuredContent,
      },
      "*"
    );
  }, [panel.structuredContent]);

  return (
    <div
      className="flex flex-col border rounded-md overflow-hidden min-w-0 min-h-0"
      style={{ flex }}
    >
      {panel.label && (
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border-b uppercase tracking-wider font-sans">
          {panel.label}
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={panel.viewUrl}
        onLoad={handleLoad}
        sandbox="allow-scripts allow-same-origin"
        className="flex-1 w-full border-none"
        title={panel.label ?? "panel"}
      />
    </div>
  );
}
