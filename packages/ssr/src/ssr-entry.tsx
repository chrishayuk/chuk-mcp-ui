/**
 * Universal SSR module — single bundle for all view renderers.
 *
 * Replaces 65 per-view dist-ssr bundles with one shared bundle.
 * Shares a single React runtime, reducing memory from ~65 MB to ~3 MB.
 *
 * Usage:  import { render } from "./ssr-entry";
 *         const html = render("chart", chartData);
 *
 * Views that require browser APIs (Leaflet, Chart.js, pdf.js) render
 * lightweight placeholders — the client bundle hydrates into the full
 * interactive component.
 */
import { renderToString } from "react-dom/server";

// ── SSR-safe view renderer imports ─────────────────────────────────
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
import { DataTable } from "@apps/datatable/src/App";
import { DetailRenderer } from "@apps/detail/src/App";
import { DiffRenderer } from "@apps/diff/src/App";
import { EmbedRenderer } from "@apps/embed/src/App";
import { FilterRenderer } from "@apps/filter/src/App";
import { FlowchartRenderer } from "@apps/flowchart/src/App";
import { DynamicForm } from "@apps/form/src/App";
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
import { Split } from "@apps/split/src/App";
import { StatusRenderer } from "@apps/status/src/App";
import { StepperRenderer } from "@apps/stepper/src/App";
import { SunburstRenderer } from "@apps/sunburst/src/App";
import { SwimlaneRenderer } from "@apps/swimlane/src/App";
import { TabsInner } from "@apps/tabs/src/App";
import { TerminalRenderer } from "@apps/terminal/src/App";
import { ThreedRenderer } from "@apps/threed/src/App";
import { TimelineRenderer } from "@apps/timeline/src/App";
import { TreeRenderer } from "@apps/tree/src/App";
import { TreemapRenderer } from "@apps/treemap/src/App";
import { VideoRenderer } from "@apps/video/src/App";
import { WizardRenderer } from "@apps/wizard/src/App";
import { TranscriptRenderer } from "@apps/transcript/src/App";
// ShaderRenderer not imported — WebGL needs canvas, uses placeholder below

// ── Browser-dependent views: chart (Chart.js), map/minimap/layers
//    (Leaflet), profile/scatter/timeseries (Chart.js), pdf (pdf.js)
//    These render lightweight placeholders — client hydrates fully.
// ────────────────────────────────────────────────────────────────────

// ── Noop callbacks for components that require them ────────────────
const noop = async () => {};

// ── Placeholder renderer for browser-dependent views ───────────────
function placeholder(label: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (d: any) => renderToString(
    <div className="flex flex-col h-full font-sans bg-background text-foreground">
      {d.title && (
        <div className="px-3 py-2 text-[15px] font-semibold border-b">
          {d.title}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground">
        Loading {label}…
      </div>
    </div>
  );
}

// ── Render dispatch table ──────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RenderFn = (data: any) => string;

const renderers: Record<string, RenderFn> = {
  alert:         (d) => renderToString(<AlertRenderer data={d} />),
  annotation:    (d) => renderToString(<AnnotationRenderer data={d} />),
  audio:         (d) => renderToString(<AudioRenderer data={d} />),
  boxplot:       (d) => renderToString(<BoxplotRenderer data={d} />),
  calendar:      (d) => renderToString(<CalendarRenderer data={d} />),
  carousel:      (d) => renderToString(<CarouselRenderer data={d} />),
  chart:         placeholder("chart"),           // Chart.js needs canvas
  chat:          (d) => renderToString(<ChatRenderer data={d} />),
  code:          (d) => renderToString(<CodeRenderer data={d} />),
  compare:       (d) => renderToString(<CompareRenderer data={d} />),
  confirm:       (d) => renderToString(<ConfirmRenderer data={d} />),
  counter:       (d) => renderToString(<CounterRenderer data={d} />),
  crosstab:      (d) => renderToString(<CrosstabRenderer data={d} />),
  datatable:     (d) => renderToString(<DataTable data={d} onCallTool={noop} />),
  detail:        (d) => renderToString(<DetailRenderer data={d} />),
  diff:          (d) => renderToString(<DiffRenderer data={d} />),
  embed:         (d) => renderToString(<EmbedRenderer data={d} />),
  filter:        (d) => renderToString(<FilterRenderer data={d} />),
  flowchart:     (d) => renderToString(<FlowchartRenderer data={d} />),
  form:          (d) => renderToString(<DynamicForm data={d} />),
  funnel:        (d) => renderToString(<FunnelRenderer data={d} />),
  gallery:       (d) => renderToString(<GalleryRenderer data={d} />),
  gantt:         (d) => renderToString(<GanttRenderer data={d} />),
  gauge:         (d) => renderToString(<GaugeRenderer data={d} />),
  geostory:      (d) => renderToString(<GeostoryRenderer data={d} />),
  "gis-legend":  (d) => renderToString(<GisLegendRenderer data={d} />),
  globe:         (d) => renderToString(<GlobeRenderer data={d} />),
  graph:         (d) => renderToString(<GraphRenderer data={d} />),
  heatmap:       (d) => renderToString(<HeatmapRenderer data={d} />),
  image:         (d) => renderToString(<ImageRenderer data={d} />),
  investigation: (d) => renderToString(<InvestigationRenderer data={d} />),
  json:          (d) => renderToString(<JsonRenderer data={d} />),
  kanban:        (d) => renderToString(<KanbanRenderer data={d} />),
  layers:        placeholder("map layers"),      // Leaflet needs window
  log:           (d) => renderToString(<LogRenderer data={d} />),
  map:           placeholder("map"),             // Leaflet needs window
  markdown:      (d) => renderToString(<MarkdownRenderer data={d} />),
  minimap:       placeholder("map"),             // Leaflet needs window
  neural:        (d) => renderToString(<NeuralRenderer data={d} />),
  notebook:      (d) => renderToString(<NotebookRenderer data={d} />),
  pdf:           placeholder("PDF"),             // pdf.js needs window
  pivot:         (d) => renderToString(<PivotRenderer data={d} />),
  poll:          (d) => renderToString(<PollRenderer data={d} />),
  profile:       placeholder("profile"),         // Chart.js needs canvas
  progress:      (d) => renderToString(<ProgressRenderer data={d} />),
  quiz:          (d) => renderToString(<QuizRenderer data={d} />),
  ranked:        (d) => renderToString(<RankedRenderer data={d} />),
  sankey:        (d) => renderToString(<SankeyRenderer data={d} />),
  scatter:       placeholder("scatter plot"),    // Chart.js needs canvas
  settings:      (d) => renderToString(<SettingsRenderer data={d} />),
  slides:        (d) => renderToString(<SlidesRenderer data={d} />),
  spectrogram:   (d) => renderToString(<SpectrogramRenderer data={d} />),
  split:         (d) => renderToString(<Split data={d} />),
  status:        (d) => renderToString(<StatusRenderer data={d} />),
  stepper:       (d) => renderToString(<StepperRenderer data={d} />),
  sunburst:      (d) => renderToString(<SunburstRenderer data={d} />),
  swimlane:      (d) => renderToString(<SwimlaneRenderer data={d} />),
  tabs:          (d) => renderToString(<TabsInner data={d} />),
  terminal:      (d) => renderToString(<TerminalRenderer data={d} />),
  threed:        (d) => renderToString(<ThreedRenderer data={d} />),
  timeline:      (d) => renderToString(<TimelineRenderer data={d} />),
  timeseries:    placeholder("time series"),     // Chart.js needs canvas
  tree:          (d) => renderToString(<TreeRenderer data={d} />),
  treemap:       (d) => renderToString(<TreemapRenderer data={d} />),
  video:         (d) => renderToString(<VideoRenderer data={d} />),
  wizard:        (d) => renderToString(<WizardRenderer data={d} />),
  transcript:    (d) => renderToString(<TranscriptRenderer data={d} />),
  shader:        placeholder("shader"),            // WebGL needs canvas
};

// ── Public API ─────────────────────────────────────────────────────

/** List of view names with SSR support */
export const views = Object.keys(renderers);

/** Render a view to an HTML string. Throws if view name is unknown. */
export function render(view: string, data: unknown): string {
  const fn = renderers[view];
  if (!fn) throw new Error(`Unknown SSR view: "${view}"`);
  return fn(data);
}
