import { useRef, useEffect, useCallback } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { cn } from "@chuk/view-ui";
import type { DashboardContent, Panel } from "./schema";

/**
 * Dashboard composition View.
 *
 * Embeds child Views in iframes, passes structuredContent to each
 * via postMessage, and routes messages between children for
 * cross-View communication.
 */
export function DashboardView() {
  const { data, content, isConnected } =
    useView<DashboardContent>("dashboard", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <Dashboard data={data} />;
}

export function Dashboard({ data }: { data: DashboardContent }) {
  const { title, layout, panels, gap = "8px" } = data;
  const iframeRefs = useRef<Map<string, HTMLIFrameElement>>(new Map());

  // Route messages between child Views
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg || typeof msg !== "object" || !msg.__chuk_panel_id) return;

      const sourcePanelId = msg.__chuk_panel_id;

      // Broadcast to all other panels
      for (const [panelId, iframe] of iframeRefs.current.entries()) {
        if (panelId !== sourcePanelId && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            { ...msg, __chuk_source_panel: sourcePanelId },
            "*"
          );
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const setIframeRef = useCallback(
    (panelId: string, el: HTMLIFrameElement | null) => {
      if (el) {
        iframeRefs.current.set(panelId, el);
      } else {
        iframeRefs.current.delete(panelId);
      }
    },
    []
  );

  return (
    <div className="h-full flex flex-col">
      {title && (
        <div className="px-3 py-2 text-[15px] font-semibold text-foreground border-b font-sans bg-background">
          {title}
        </div>
      )}
      <div
        className={cn(
          "w-full h-full font-sans bg-background overflow-hidden",
          layout === "split-vertical" ? "flex flex-col" : "flex flex-row",
          layout === "grid" && "flex-wrap"
        )}
        style={{ gap, padding: gap }}
      >
        {panels.map((panel) => (
          <PanelFrame
            key={panel.id}
            panel={panel}
            layout={layout}
            onRef={(el) => setIframeRef(panel.id, el)}
          />
        ))}
      </div>
    </div>
  );
}

function PanelFrame({
  panel,
  layout,
  onRef,
}: {
  panel: Panel;
  layout: string;
  onRef: (el: HTMLIFrameElement | null) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // When iframe loads, send it the structuredContent
  const handleLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    // Send a synthetic tool result to the child View
    iframe.contentWindow.postMessage(
      {
        type: "mcp-app:tool-result",
        content: [],
        structuredContent: panel.structuredContent,
        __chuk_panel_id: panel.id,
      },
      "*"
    );
  }, [panel.structuredContent]);

  useEffect(() => {
    onRef(iframeRef.current);
    return () => onRef(null);
  }, [onRef]);

  return (
    <div
      className="border rounded-md overflow-hidden relative flex flex-col"
      style={{
        flex: panel.width ? `0 0 ${panel.width}` : 1,
        height: panel.height ?? (layout === "split-vertical" ? undefined : "100%"),
        minWidth: panel.minWidth ?? 0,
        minHeight: panel.minHeight ?? 0,
      }}
    >
      {panel.label && (
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border-b uppercase tracking-wider">
          {panel.label}
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={panel.viewUrl}
        onLoad={handleLoad}
        sandbox="allow-scripts allow-same-origin"
        className="flex-1 w-full border-none"
        title={panel.label ?? panel.id}
      />
    </div>
  );
}
