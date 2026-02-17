import { useRef, useCallback } from "react";
import { useView, Fallback, CSS_VARS } from "@chuk/view-shared";
import type { SplitContent, SplitPanel } from "./schema";

export function SplitView() {
  const { data, content, isConnected } =
    useView<SplitContent>("split", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <Split data={data} />;
}

function Split({ data }: { data: SplitContent }) {
  const { direction = "horizontal", ratio = "50:50", left, right } = data;
  const [leftRatio, rightRatio] = ratio.split(":").map(Number);
  const isHorizontal = direction === "horizontal";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        width: "100%",
        height: "100%",
        gap: "4px",
        padding: "4px",
        boxSizing: "border-box",
        backgroundColor: `var(${CSS_VARS.colorBackground})`,
      }}
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
      style={{
        flex,
        display: "flex",
        flexDirection: "column",
        border: `1px solid var(${CSS_VARS.colorBorder})`,
        borderRadius: `var(${CSS_VARS.borderRadius})`,
        overflow: "hidden",
        minWidth: 0,
        minHeight: 0,
      }}
    >
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
            fontFamily: `var(${CSS_VARS.fontFamily})`,
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
        style={{ flex: 1, width: "100%", border: "none" }}
        title={panel.label ?? "panel"}
      />
    </div>
  );
}
