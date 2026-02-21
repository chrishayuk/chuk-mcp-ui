import { useRef, useCallback, useEffect } from "react";

const BASE_URL = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://chuk-mcp-ui-views.fly.dev";

interface PreviewPaneProps {
  viewType: string;
  data: object | null;
}

export function PreviewPane({ viewType, data }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Track initial data per viewType so we embed it in the hash.
  // Re-computes during render only when viewType changes — data edits
  // do NOT change the src (updates go via postMessage instead).
  const snapshotRef = useRef<{ viewType: string; src: string } | null>(null);
  if (!snapshotRef.current || snapshotRef.current.viewType !== viewType) {
    const base = `${BASE_URL}/${viewType}/v1`;
    let src = base;
    if (data) {
      try {
        src = `${base}#${encodeURIComponent(JSON.stringify(data))}`;
      } catch { /* fallback to base */ }
    }
    snapshotRef.current = { viewType, src };
  }

  const iframeSrc = snapshotRef.current.src;

  const sendData = useCallback(() => {
    if (!iframeRef.current?.contentWindow || !data) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: "mcp-app:tool-result",
        content: [],
        structuredContent: data,
      },
      "*"
    );
  }, [data]);

  // Also send via postMessage on load + retry
  const handleLoad = useCallback(() => {
    sendData();
    setTimeout(sendData, 200);
  }, [sendData]);

  // Listen for "view-ready" signal from the iframe's useView hook
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "mcp-app:view-ready") {
        sendData();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sendData]);

  // Re-send when data changes (user edits JSON)
  useEffect(() => {
    sendData();
  }, [sendData]);

  return (
    <iframe
      key={`${BASE_URL}/${viewType}/v1`}
      ref={iframeRef}
      src={iframeSrc}
      onLoad={handleLoad}
      className="flex-1 w-full border-none bg-background"
      title={`Preview: ${viewType}`}
    />
  );
}
