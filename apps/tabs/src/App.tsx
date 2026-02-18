import { useState, useRef, useCallback, useEffect } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { cn } from "@chuk/view-ui";
import type { TabsContent, Tab } from "./schema";

export function TabsView() {
  const { data, content, isConnected } =
    useView<TabsContent>("tabs", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <TabsInner data={data} />;
}

export function TabsInner({ data }: { data: TabsContent }) {
  const { tabs, activeTab } = data;
  const [active, setActive] = useState(activeTab ?? tabs[0]?.id ?? "");

  const currentTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="flex flex-col h-full font-sans bg-background">
      <div
        role="tablist"
        className="flex border-b-2 bg-muted"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === active}
            onClick={() => setActive(tab.id)}
            className={cn(
              "px-5 py-2.5 border-b-2 bg-transparent text-sm cursor-pointer font-inherit -mb-[2px]",
              tab.id === active
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground font-normal"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="flex-1 overflow-hidden">
        {currentTab && <TabPanel tab={currentTab} />}
      </div>
    </div>
  );
}

function TabPanel({ tab }: { tab: Tab }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "mcp-app:tool-result",
        content: [],
        structuredContent: tab.structuredContent,
      },
      "*"
    );
  }, [tab.structuredContent]);

  // Re-send data if structuredContent changes (tab switch with same URL)
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "mcp-app:tool-result",
          content: [],
          structuredContent: tab.structuredContent,
        },
        "*"
      );
    }
  }, [tab.structuredContent]);

  return (
    <iframe
      ref={iframeRef}
      src={tab.viewUrl}
      onLoad={handleLoad}
      sandbox="allow-scripts allow-same-origin"
      className="w-full h-full border-none"
      title={tab.label}
    />
  );
}
