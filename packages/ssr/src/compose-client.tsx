/**
 * Client hydration entry point for SSR-composed pages.
 *
 * Reads `window.__COMPOSE_STATE__` injected by the compose engine,
 * creates a ComposeBus for cross-view communication, and hydrates
 * (or mounts) each panel's React component.
 *
 * - Views that were fully SSR-rendered use `hydrateRoot()` to attach
 *   event handlers to existing DOM.
 * - Browser-dependent views (marked with `data-ssr-placeholder`) use
 *   `createRoot()` to replace the lightweight placeholder with the
 *   full interactive component.
 */
import { StrictMode, createElement } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { createComposeBus } from "@chuk/view-shared/bus/compose-bus";
import { buildLinkFilter } from "@apps/dashboard/src/link-resolver";
import { ComposeBusProvider } from "@chuk/view-shared/bus/ComposeBusProvider";

// ── Import all renderers ────────────────────────────────────────────
import { AlertRenderer } from "@apps/alert/src/App";
import { AnnotationRenderer } from "@apps/annotation/src/App";
import { AudioRenderer } from "@apps/audio/src/App";
import { BoxplotRenderer } from "@apps/boxplot/src/App";
import { CalendarRenderer } from "@apps/calendar/src/App";
import { CarouselRenderer } from "@apps/carousel/src/App";
import { ChatRenderer } from "@apps/chat/src/App";
import { CodeRenderer } from "@apps/code/src/App";
import { CompareRenderer } from "@apps/compare/src/App";
import { ConfirmRenderer } from "@apps/confirm/src/App";
import { CounterRenderer } from "@apps/counter/src/App";
import { CrosstabRenderer } from "@apps/crosstab/src/App";
import { DataTableRenderer } from "@apps/datatable/src/App";
import { DetailRenderer } from "@apps/detail/src/App";
import { DiffRenderer } from "@apps/diff/src/App";
import { EmbedRenderer } from "@apps/embed/src/App";
import { FilterRenderer } from "@apps/filter/src/App";
import { FlowchartRenderer } from "@apps/flowchart/src/App";
import { FormRenderer } from "@apps/form/src/App";
import { FunnelRenderer } from "@apps/funnel/src/App";
import { GalleryRenderer } from "@apps/gallery/src/App";
import { GanttRenderer } from "@apps/gantt/src/App";
import { GaugeRenderer } from "@apps/gauge/src/App";
import { GeostoryRenderer } from "@apps/geostory/src/App";
import { GisLegendRenderer } from "@apps/gis-legend/src/App";
import { GlobeRenderer } from "@apps/globe/src/App";
import { GraphRenderer } from "@apps/graph/src/App";
import { HeatmapRenderer } from "@apps/heatmap/src/App";
import { ImageRenderer } from "@apps/image/src/App";
import { InvestigationRenderer } from "@apps/investigation/src/App";
import { JsonRenderer } from "@apps/json/src/App";
import { KanbanRenderer } from "@apps/kanban/src/App";
import { LogRenderer } from "@apps/log/src/App";
import { MarkdownRenderer } from "@apps/markdown/src/App";
import { NeuralRenderer } from "@apps/neural/src/App";
import { NotebookRenderer } from "@apps/notebook/src/App";
import { PivotRenderer } from "@apps/pivot/src/App";
import { PollRenderer } from "@apps/poll/src/App";
import { ProgressRenderer } from "@apps/progress/src/App";
import { QuizRenderer } from "@apps/quiz/src/App";
import { RankedRenderer } from "@apps/ranked/src/App";
import { SankeyRenderer } from "@apps/sankey/src/App";
import { SettingsRenderer } from "@apps/settings/src/App";
import { SlidesRenderer } from "@apps/slides/src/App";
import { SpectrogramRenderer } from "@apps/spectrogram/src/App";
import { SplitRenderer } from "@apps/split/src/App";
import { StatusRenderer } from "@apps/status/src/App";
import { StepperRenderer } from "@apps/stepper/src/App";
import { SunburstRenderer } from "@apps/sunburst/src/App";
import { SwimlaneRenderer } from "@apps/swimlane/src/App";
import { TabsRenderer } from "@apps/tabs/src/App";
import { TerminalRenderer } from "@apps/terminal/src/App";
import { ThreedRenderer } from "@apps/threed/src/App";
import { TimelineRenderer } from "@apps/timeline/src/App";
import { TreeRenderer } from "@apps/tree/src/App";
import { TreemapRenderer } from "@apps/treemap/src/App";
import { VideoRenderer } from "@apps/video/src/App";
import { WizardRenderer } from "@apps/wizard/src/App";
import { TranscriptRenderer } from "@apps/transcript/src/App";

// ── Browser-dependent views — full client renderers ─────────────────
// These were placeholder-SSR'd and need full createRoot mounting.
// Lazy-loaded to avoid bundling browser-heavy deps for pages that
// don't use them.
const lazyChart = () => import("@apps/chart/src/App");
const lazyMap = () => import("@apps/map/src/App");
const lazyMinimap = () => import("@apps/minimap/src/App");
const lazyLayers = () => import("@apps/layers/src/App");
const lazyProfile = () => import("@apps/profile/src/App");
const lazyScatter = () => import("@apps/scatter/src/App");
const lazyTimeseries = () => import("@apps/timeseries/src/App");
const lazyPdf = () => import("@apps/pdf/src/App");

// ── Noop for components that need callbacks ─────────────────────────
const noop = async () => {};

// ── Renderer dispatch table ─────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RendererEntry = (data: any) => React.ReactElement;

const renderers: Record<string, RendererEntry> = {
  alert:         (d) => createElement(AlertRenderer, { data: d }),
  annotation:    (d) => createElement(AnnotationRenderer, { data: d }),
  audio:         (d) => createElement(AudioRenderer, { data: d }),
  boxplot:       (d) => createElement(BoxplotRenderer, { data: d }),
  calendar:      (d) => createElement(CalendarRenderer, { data: d }),
  carousel:      (d) => createElement(CarouselRenderer, { data: d }),
  chat:          (d) => createElement(ChatRenderer, { data: d }),
  code:          (d) => createElement(CodeRenderer, { data: d }),
  compare:       (d) => createElement(CompareRenderer, { data: d }),
  confirm:       (d) => createElement(ConfirmRenderer, { data: d }),
  counter:       (d) => createElement(CounterRenderer, { data: d }),
  crosstab:      (d) => createElement(CrosstabRenderer, { data: d }),
  datatable:     (d) => createElement(DataTableRenderer, { data: d, onCallTool: noop }),
  detail:        (d) => createElement(DetailRenderer, { data: d }),
  diff:          (d) => createElement(DiffRenderer, { data: d }),
  embed:         (d) => createElement(EmbedRenderer, { data: d }),
  filter:        (d) => createElement(FilterRenderer, { data: d }),
  flowchart:     (d) => createElement(FlowchartRenderer, { data: d }),
  form:          (d) => createElement(FormRenderer, { data: d }),
  funnel:        (d) => createElement(FunnelRenderer, { data: d }),
  gallery:       (d) => createElement(GalleryRenderer, { data: d }),
  gantt:         (d) => createElement(GanttRenderer, { data: d }),
  gauge:         (d) => createElement(GaugeRenderer, { data: d }),
  geostory:      (d) => createElement(GeostoryRenderer, { data: d }),
  "gis-legend":  (d) => createElement(GisLegendRenderer, { data: d }),
  globe:         (d) => createElement(GlobeRenderer, { data: d }),
  graph:         (d) => createElement(GraphRenderer, { data: d }),
  heatmap:       (d) => createElement(HeatmapRenderer, { data: d }),
  image:         (d) => createElement(ImageRenderer, { data: d }),
  investigation: (d) => createElement(InvestigationRenderer, { data: d }),
  json:          (d) => createElement(JsonRenderer, { data: d }),
  kanban:        (d) => createElement(KanbanRenderer, { data: d }),
  log:           (d) => createElement(LogRenderer, { data: d }),
  markdown:      (d) => createElement(MarkdownRenderer, { data: d }),
  neural:        (d) => createElement(NeuralRenderer, { data: d }),
  notebook:      (d) => createElement(NotebookRenderer, { data: d }),
  pivot:         (d) => createElement(PivotRenderer, { data: d }),
  poll:          (d) => createElement(PollRenderer, { data: d }),
  progress:      (d) => createElement(ProgressRenderer, { data: d }),
  quiz:          (d) => createElement(QuizRenderer, { data: d }),
  ranked:        (d) => createElement(RankedRenderer, { data: d }),
  sankey:        (d) => createElement(SankeyRenderer, { data: d }),
  settings:      (d) => createElement(SettingsRenderer, { data: d }),
  slides:        (d) => createElement(SlidesRenderer, { data: d }),
  spectrogram:   (d) => createElement(SpectrogramRenderer, { data: d }),
  split:         (d) => createElement(SplitRenderer, { data: d }),
  status:        (d) => createElement(StatusRenderer, { data: d }),
  stepper:       (d) => createElement(StepperRenderer, { data: d }),
  sunburst:      (d) => createElement(SunburstRenderer, { data: d }),
  swimlane:      (d) => createElement(SwimlaneRenderer, { data: d }),
  tabs:          (d) => createElement(TabsRenderer, { data: d }),
  terminal:      (d) => createElement(TerminalRenderer, { data: d }),
  threed:        (d) => createElement(ThreedRenderer, { data: d }),
  timeline:      (d) => createElement(TimelineRenderer, { data: d }),
  tree:          (d) => createElement(TreeRenderer, { data: d }),
  treemap:       (d) => createElement(TreemapRenderer, { data: d }),
  video:         (d) => createElement(VideoRenderer, { data: d }),
  wizard:        (d) => createElement(WizardRenderer, { data: d }),
  transcript:    (d) => createElement(TranscriptRenderer, { data: d }),
};

// ── Lazy renderer loaders for browser-dependent views ───────────────
const lazyRenderers: Record<string, () => Promise<RendererEntry>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chart:      async () => { const m = await lazyChart();      return (d: any) => createElement(m.ChartRenderer, { data: d }); },
  map:        async () => { const m = await lazyMap();        return (d: any) => createElement(m.LeafletMap, { data: d, app: null, onCallTool: noop }); },
  minimap:    async () => { const m = await lazyMinimap();    return (d: any) => createElement(m.MinimapRenderer, { data: d }); },
  layers:     async () => { const m = await lazyLayers();     return (d: any) => createElement(m.LayersRenderer, { data: d }); },
  profile:    async () => { const m = await lazyProfile();    return (d: any) => createElement(m.ProfileRenderer, { data: d }); },
  scatter:    async () => { const m = await lazyScatter();    return (d: any) => createElement(m.ScatterRenderer, { data: d }); },
  timeseries: async () => { const m = await lazyTimeseries(); return (d: any) => createElement(m.TimeseriesRenderer, { data: d }); },
  pdf:        async () => { const m = await lazyPdf();        return (d: any) => createElement(m.PdfRenderer, { data: d }); },
  // shader: not yet available — placeholder-only
};

// ── Compose state type ──────────────────────────────────────────────

interface ComposeState {
  sections: Array<{ id: string; view: string; data: unknown }>;
  links: Array<{
    source: string;
    target: string;
    type: string;
    sourceField: string;
    targetField: string;
    bidirectional?: boolean;
  }>;
  initialState: Record<string, unknown>;
}

declare global {
  interface Window {
    __COMPOSE_STATE__?: ComposeState;
  }
}

// ── Hydration boot ──────────────────────────────────────────────────

async function hydrate() {
  const state = window.__COMPOSE_STATE__;
  if (!state) {
    console.warn("[compose-client] No __COMPOSE_STATE__ found, skipping hydration.");
    return;
  }

  // Create the in-memory bus with link filtering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter = buildLinkFilter(state.links as any);
  const bus = createComposeBus(filter);

  // Register all panels
  for (const section of state.sections) {
    bus.registerPanel(section.id);
  }

  // Hydrate each panel
  for (const section of state.sections) {
    const panelEl = document.querySelector<HTMLElement>(
      `[data-panel="${CSS.escape(section.id)}"]`
    );
    if (!panelEl) {
      console.warn(`[compose-client] Panel element not found: ${section.id}`);
      continue;
    }

    const isPlaceholder = panelEl.hasAttribute("data-ssr-placeholder");

    // Build the React element
    let element: React.ReactElement;

    if (isPlaceholder && lazyRenderers[section.view]) {
      // Browser-dependent view — lazy load the full renderer
      try {
        const makeEl = await lazyRenderers[section.view]();
        element = makeEl(section.data);
      } catch (err) {
        console.error(`[compose-client] Failed to load ${section.view}:`, err);
        continue;
      }
    } else if (renderers[section.view]) {
      element = renderers[section.view](section.data);
    } else {
      console.warn(`[compose-client] Unknown view: ${section.view}`);
      continue;
    }

    // Wrap with ComposeBusProvider + StrictMode
    const wrapped = createElement(
      StrictMode,
      null,
      createElement(
        ComposeBusProvider,
        { bus, panelId: section.id, children: element },
      ),
    );

    // Hydrate or mount
    if (isPlaceholder) {
      // Replace placeholder entirely
      panelEl.innerHTML = "";
      const container = document.createElement("div");
      container.style.cssText = "display:contents";
      panelEl.appendChild(container);
      createRoot(container).render(wrapped);
    } else {
      // Hydrate existing SSR content
      hydrateRoot(panelEl, wrapped);
    }
  }
}

// Boot
hydrate().catch((err) => {
  console.error("[compose-client] Hydration failed:", err);
});
