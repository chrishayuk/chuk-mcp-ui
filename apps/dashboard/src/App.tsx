import { useRef, useEffect, useCallback } from "react";
import { useView, Fallback, ViewBusProvider, useViewBusContainer } from "@chuk/view-shared";
import { cn } from "@chuk/view-ui";
import type { DashboardContent, Panel } from "./schema";

/**
 * Dashboard composition View.
 *
 * Embeds child Views in iframes, passes structuredContent to each
 * via postMessage, and routes messages between children for
 * cross-View communication via the ViewBusProvider.
 */
export function DashboardView() {
  const { data, content, isConnected } =
    useView<DashboardContent>("dashboard", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return (
    <ViewBusProvider>
      <Dashboard data={data} />
    </ViewBusProvider>
  );
}

export function Dashboard({ data }: { data: DashboardContent }) {
  const { title, layout, panels, gap = "8px" } = data;

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
          <PanelFrame key={panel.id} panel={panel} layout={layout} />
        ))}
      </div>
    </div>
  );
}

function PanelFrame({
  panel,
  layout,
}: {
  panel: Panel;
  layout: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { registerChild, unregisterChild } = useViewBusContainer();

  // Register iframe with the message bus
  useEffect(() => {
    if (iframeRef.current) {
      registerChild(panel.id, iframeRef.current);
    }
    return () => unregisterChild(panel.id);
  }, [panel.id, registerChild, unregisterChild]);

  // When iframe loads, send it the structuredContent
  const handleLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    iframe.contentWindow.postMessage(
      {
        type: "mcp-app:tool-result",
        content: [],
        structuredContent: panel.structuredContent,
        __chuk_panel_id: panel.id,
      },
      "*"
    );
  }, [panel.structuredContent, panel.id]);

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
