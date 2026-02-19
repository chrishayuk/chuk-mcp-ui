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
  const src = `${BASE_URL}/${viewType}/v1`;

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

  // Send data when iframe loads
  const handleLoad = useCallback(() => {
    sendData();
  }, [sendData]);

  // Re-send when data changes (iframe already loaded)
  useEffect(() => {
    sendData();
  }, [sendData]);

  return (
    <iframe
      key={src}
      ref={iframeRef}
      src={src}
      onLoad={handleLoad}
      sandbox="allow-scripts allow-same-origin"
      className="flex-1 w-full border-none bg-background"
      title={`Preview: ${viewType}`}
    />
  );
}
