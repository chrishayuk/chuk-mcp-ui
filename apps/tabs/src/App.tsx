import { useState, useRef, useCallback, useEffect } from "react";
import { useView, Fallback, CSS_VARS } from "@chuk/view-shared";
import type { TabsContent, Tab } from "./schema";

export function TabsView() {
  const { data, content, isConnected } =
    useView<TabsContent>("tabs", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <Tabs data={data} />;
}

function Tabs({ data }: { data: TabsContent }) {
  const { tabs, activeTab } = data;
  const [active, setActive] = useState(activeTab ?? tabs[0]?.id ?? "");

  const currentTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: `var(${CSS_VARS.fontFamily})`,
        backgroundColor: `var(${CSS_VARS.colorBackground})`,
      }}
    >
      <div
        role="tablist"
        style={{
          display: "flex",
          borderBottom: `2px solid var(${CSS_VARS.colorBorder})`,
          backgroundColor: `var(${CSS_VARS.colorSurface})`,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === active}
            onClick={() => setActive(tab.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom:
                tab.id === active
                  ? `2px solid var(${CSS_VARS.colorPrimary})`
                  : "2px solid transparent",
              background: "none",
              color:
                tab.id === active
                  ? `var(${CSS_VARS.colorPrimary})`
                  : `var(${CSS_VARS.colorTextSecondary})`,
              fontWeight: tab.id === active ? 600 : 400,
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "inherit",
              marginBottom: "-2px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" style={{ flex: 1, overflow: "hidden" }}>
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
      style={{ width: "100%", height: "100%", border: "none" }}
      title={tab.label}
    />
  );
}
