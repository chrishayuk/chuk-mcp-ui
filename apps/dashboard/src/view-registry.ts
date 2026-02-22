const CDN_BASE = "https://mcp-views.chukai.io";

/**
 * Built-in registry mapping viewType to CDN URL.
 * Fallback constructs URL from viewType for unknown types.
 */
const BUILT_IN_VIEWS: Record<string, string> = {
  // Core
  map: `${CDN_BASE}/map/v1`,
  datatable: `${CDN_BASE}/datatable/v1`,
  chart: `${CDN_BASE}/chart/v1`,
  form: `${CDN_BASE}/form/v1`,
  markdown: `${CDN_BASE}/markdown/v1`,
  video: `${CDN_BASE}/video/v1`,
  pdf: `${CDN_BASE}/pdf/v1`,
  dashboard: `${CDN_BASE}/dashboard/v1`,
  split: `${CDN_BASE}/split/v1`,
  tabs: `${CDN_BASE}/tabs/v1`,
  detail: `${CDN_BASE}/detail/v1`,
  counter: `${CDN_BASE}/counter/v1`,
  code: `${CDN_BASE}/code/v1`,
  progress: `${CDN_BASE}/progress/v1`,
  confirm: `${CDN_BASE}/confirm/v1`,
  json: `${CDN_BASE}/json/v1`,
  status: `${CDN_BASE}/status/v1`,
  // Interactive
  compare: `${CDN_BASE}/compare/v1`,
  gallery: `${CDN_BASE}/gallery/v1`,
  ranked: `${CDN_BASE}/ranked/v1`,
  poll: `${CDN_BASE}/poll/v1`,
  quiz: `${CDN_BASE}/quiz/v1`,
  chat: `${CDN_BASE}/chat/v1`,
  image: `${CDN_BASE}/image/v1`,
  log: `${CDN_BASE}/log/v1`,
  timeline: `${CDN_BASE}/timeline/v1`,
  tree: `${CDN_BASE}/tree/v1`,
  // Developer & Config
  alert: `${CDN_BASE}/alert/v1`,
  diff: `${CDN_BASE}/diff/v1`,
  embed: `${CDN_BASE}/embed/v1`,
  filter: `${CDN_BASE}/filter/v1`,
  kanban: `${CDN_BASE}/kanban/v1`,
  settings: `${CDN_BASE}/settings/v1`,
  stepper: `${CDN_BASE}/stepper/v1`,
  // Data Visualization
  gauge: `${CDN_BASE}/gauge/v1`,
  heatmap: `${CDN_BASE}/heatmap/v1`,
  crosstab: `${CDN_BASE}/crosstab/v1`,
  scatter: `${CDN_BASE}/scatter/v1`,
  boxplot: `${CDN_BASE}/boxplot/v1`,
  timeseries: `${CDN_BASE}/timeseries/v1`,
  treemap: `${CDN_BASE}/treemap/v1`,
  sunburst: `${CDN_BASE}/sunburst/v1`,
  pivot: `${CDN_BASE}/pivot/v1`,
  profile: `${CDN_BASE}/profile/v1`,
  // Specialist
  audio: `${CDN_BASE}/audio/v1`,
  carousel: `${CDN_BASE}/carousel/v1`,
  terminal: `${CDN_BASE}/terminal/v1`,
  "gis-legend": `${CDN_BASE}/gis-legend/v1`,
  layers: `${CDN_BASE}/layers/v1`,
  minimap: `${CDN_BASE}/minimap/v1`,
  spectrogram: `${CDN_BASE}/spectrogram/v1`,
};

/**
 * Resolve a panel's viewType to a URL.
 *
 * Priority: viewUrl > registry lookup > CDN fallback.
 */
export function resolveViewUrl(
  panel: { viewUrl?: string; viewType?: string },
  customRegistry?: Record<string, string>,
): string {
  if (panel.viewUrl) return panel.viewUrl;
  if (!panel.viewType) {
    throw new Error("Panel must have either viewUrl or viewType");
  }
  const custom = customRegistry?.[panel.viewType];
  if (custom) return custom;
  return BUILT_IN_VIEWS[panel.viewType] ?? `${CDN_BASE}/${panel.viewType}/v1`;
}

export { BUILT_IN_VIEWS, CDN_BASE };
