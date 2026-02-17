import { useRef, useEffect, useCallback } from "react";
import { useView, Fallback, CSS_VARS } from "@chuk/view-shared";
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

function Dashboard({ data }: { data: DashboardContent }) {
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

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: layout === "split-vertical" ? "column" : "row",
    flexWrap: layout === "grid" ? "wrap" : "nowrap",
    width: "100%",
    height: "100%",
    gap,
    padding: gap,
    boxSizing: "border-box",
    fontFamily: `var(${CSS_VARS.fontFamily})`,
    backgroundColor: `var(${CSS_VARS.colorBackground})`,
    overflow: "hidden",
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {title && (
        <div
          style={{
            padding: "8px 12px",
            fontSize: "15px",
            fontWeight: 600,
            color: `var(${CSS_VARS.colorText})`,
            borderBottom: `1px solid var(${CSS_VARS.colorBorder})`,
            fontFamily: `var(${CSS_VARS.fontFamily})`,
            backgroundColor: `var(${CSS_VARS.colorBackground})`,
          }}
        >
          {title}
        </div>
      )}
      <div style={containerStyle}>
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

  const panelStyle: React.CSSProperties = {
    flex: panel.width ? `0 0 ${panel.width}` : 1,
    height: panel.height ?? (layout === "split-vertical" ? undefined : "100%"),
    minWidth: panel.minWidth ?? 0,
    minHeight: panel.minHeight ?? 0,
    border: `1px solid var(${CSS_VARS.colorBorder})`,
    borderRadius: `var(${CSS_VARS.borderRadius})`,
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={panelStyle}>
      {panel.label && (
        <div
          style={{
            padding: "4px 8px",
            fontSize: "12px",
            fontWeight: 600,
            color: `var(${CSS_VARS.colorTextSecondary})`,
            backgroundColor: `var(${CSS_VARS.colorSurface})`,
            borderBottom: `1px solid var(${CSS_VARS.colorBorder})`,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {panel.label}
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={panel.viewUrl}
        onLoad={handleLoad}
        sandbox="allow-scripts allow-same-origin"
        style={{
          flex: 1,
          width: "100%",
          border: "none",
        }}
        title={panel.label ?? panel.id}
      />
    </div>
  );
}
