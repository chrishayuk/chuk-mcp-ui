import { useRef, useCallback, useEffect } from "react";
import { CDN_BASE as BASE_URL } from "../config";

interface PreviewPaneProps {
  viewType: string;
  data: object | null;
  theme?: "light" | "dark";
}

export function PreviewPane({ viewType, data, theme = "light" }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Track initial data per viewType so we embed it in the hash.
  // Re-computes during render only when viewType changes — data edits
  // do NOT change the src (updates go via postMessage instead).
  // Theme is included in the initial URL; live changes go via postMessage.
  const snapshotRef = useRef<{ viewType: string; src: string } | null>(null);
  if (!snapshotRef.current || snapshotRef.current.viewType !== viewType) {
    const base = `${BASE_URL}/${viewType}/v1?theme=${theme}`;
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
      BASE_URL
    );
  }, [data]);

  // Send theme to iframe via postMessage (on change and after load)
  const sendTheme = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: "mcp-app:theme-change", theme },
      BASE_URL
    );
  }, [theme]);

  // Also send data + theme via postMessage on load + retry
  const handleLoad = useCallback(() => {
    sendData();
    sendTheme();
    setTimeout(() => { sendData(); sendTheme(); }, 200);
  }, [sendData, sendTheme]);

  // Listen for "view-ready" signal from the iframe's useView hook
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "mcp-app:view-ready") {
        sendData();
        sendTheme();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sendData, sendTheme]);

  // Re-send when data changes (user edits JSON)
  useEffect(() => {
    sendData();
  }, [sendData]);

  // Re-send theme when it changes
  useEffect(() => {
    sendTheme();
  }, [sendTheme]);

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
