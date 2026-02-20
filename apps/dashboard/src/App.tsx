import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { Fallback, ViewBusProvider, useViewBusContainer } from "@chuk/view-shared";
import { cn } from "@chuk/view-ui";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type {
  DashboardContentV1,
  DashboardContentV2,
  PanelV1,
  PanelV2,
} from "./schema";
import { resolveViewUrl } from "./view-registry";
import { resolveLayout } from "./auto-layout";
import { buildLinkFilter } from "./link-resolver";
import { usePanelVisibility } from "./use-panel-visibility";
import { useDashboardRuntime } from "./use-dashboard-runtime";

// ── Entry point ─────────────────────────────────────────────────

/**
 * Dashboard composition View.
 *
 * Detects schema version and renders via the appropriate path:
 * - v1.0: static layout with explicit viewUrls
 * - v2.0: composable layout with viewType resolution, auto layout,
 *         cross-view links, and conditional panels
 * - v3.0: patches applied to existing v2.0 state via the runtime
 */
export function DashboardView() {
  const { data, content, isConnected } = useDashboardRuntime();

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  if (data.version === "1.0") {
    return (
      <ViewBusProvider>
        <DashboardV1 data={data} />
      </ViewBusProvider>
    );
  }

  return <DashboardV2Root data={data} />;
}

// ── v1.0 renderer (unchanged from original) ─────────────────────

export function DashboardV1({ data }: { data: DashboardContentV1 }) {
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
          layout === "grid" && "flex-wrap",
        )}
        style={{ gap, padding: gap }}
      >
        {panels.map((panel) => (
          <PanelFrameV1 key={panel.id} panel={panel} layout={layout} />
        ))}
      </div>
    </div>
  );
}

/** Exported for Storybook backwards compat. */
export const Dashboard = DashboardV1;

// ── v2.0 renderer ───────────────────────────────────────────────

function DashboardV2Root({ data }: { data: DashboardContentV2 }) {
  const linkFilter = useMemo(
    () => buildLinkFilter(data.links),
    [data.links],
  );

  return (
    <ViewBusProvider filter={linkFilter}>
      <DashboardV2 data={data} />
    </ViewBusProvider>
  );
}

export function DashboardV2({ data }: { data: DashboardContentV2 }) {
  const { title, layout: layoutConfig, panels, gap = "8px" } = data;
  const { isPanelVisible, toggleCollapsed } =
    usePanelVisibility(panels);

  const visiblePanels = useMemo(
    () => panels.filter(isPanelVisible),
    [panels, isPanelVisible],
  );

  const collapsedPanels = useMemo(
    () => panels.filter((p) => p.collapsed && !isPanelVisible(p)),
    [panels, isPanelVisible],
  );

  const [activeTab, setActiveTab] = useState(0);
  const resolved = useMemo(
    () => resolveLayout(layoutConfig, visiblePanels),
    [layoutConfig, visiblePanels],
  );

  const isTabs = layoutConfig === "tabs";

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="h-full flex flex-col font-sans bg-background">
      {title && (
        <div className="px-3 py-2 text-[15px] font-semibold text-foreground border-b bg-background">
          {title}
        </div>
      )}

      {/* Collapsed panel tabs */}
      {collapsedPanels.length > 0 && (
        <div className="flex gap-1 px-2 py-1 border-b bg-muted/50">
          {collapsedPanels.map((p) => (
            <button
              key={p.id}
              className="px-3 py-1 text-xs font-semibold text-muted-foreground bg-muted border rounded cursor-pointer hover:bg-accent transition-colors"
              onClick={() => toggleCollapsed(p.id)}
            >
              {p.label ?? p.id} +
            </button>
          ))}
        </div>
      )}

      {/* Tab bar */}
      {isTabs && (
        <div className="flex border-b bg-background">
          {visiblePanels.map((p, i) => (
            <button
              key={p.id}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                i === activeTab
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveTab(i)}
            >
              {p.label ?? p.id}
            </button>
          ))}
        </div>
      )}

      {/* Panel container */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          display: resolved.display,
          flexDirection: resolved.direction,
          gridTemplateColumns: resolved.gridTemplateColumns,
          gridTemplateRows: resolved.gridTemplateRows,
          gridTemplateAreas: resolved.gridTemplateAreas,
          gap,
          padding: gap,
        }}
      >
        <AnimatePresence mode="popLayout">
          {visiblePanels.map((panel, i) => (
            <motion.div
              key={panel.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                ...(resolved.panelStyles.get(panel.id) ?? {}),
                flex: isTabs ? undefined : (panel.width ? `0 0 ${panel.width}` : 1),
                display: isTabs && i !== activeTab ? "none" : undefined,
              }}
              className="min-w-0 min-h-0"
            >
              <PanelFrameV2
                panel={panel}
                customRegistry={data.viewRegistry}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Panel frames ────────────────────────────────────────────────

function PanelFrameV1({
  panel,
  layout,
}: {
  panel: PanelV1;
  layout: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { registerChild, unregisterChild } = useViewBusContainer();

  useEffect(() => {
    if (iframeRef.current) {
      registerChild(panel.id, iframeRef.current);
    }
    return () => unregisterChild(panel.id);
  }, [panel.id, registerChild, unregisterChild]);

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
      "*",
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

function PanelFrameV2({
  panel,
  customRegistry,
}: {
  panel: PanelV2;
  customRegistry?: Record<string, string>;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { registerChild, unregisterChild } = useViewBusContainer();
  const url = resolveViewUrl(panel, customRegistry);

  useEffect(() => {
    if (iframeRef.current) {
      registerChild(panel.id, iframeRef.current);
    }
    return () => unregisterChild(panel.id);
  }, [panel.id, registerChild, unregisterChild]);

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
      "*",
    );
  }, [panel.structuredContent, panel.id]);

  return (
    <div className="h-full border rounded-md overflow-hidden relative flex flex-col">
      {panel.label && (
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border-b uppercase tracking-wider">
          {panel.label}
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={url}
        onLoad={handleLoad}
        sandbox="allow-scripts allow-same-origin"
        className="flex-1 w-full border-none"
        title={panel.label ?? panel.id}
      />
    </div>
  );
}
