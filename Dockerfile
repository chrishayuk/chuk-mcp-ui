FROM node:22-alpine

WORKDIR /app

# Copy only the server and built dist files — no npm install needed
COPY server.mjs .

# 66 View apps (single-file HTML each)
# Phase 1-2 (original 27)
COPY apps/chart/dist/mcp-app.html      apps/chart/dist/mcp-app.html
COPY apps/chart/dist-ssr               apps/chart/dist-ssr
COPY apps/alert/dist-ssr                apps/alert/dist-ssr
COPY apps/annotation/dist-ssr           apps/annotation/dist-ssr
COPY apps/audio/dist-ssr                apps/audio/dist-ssr
COPY apps/boxplot/dist-ssr              apps/boxplot/dist-ssr
COPY apps/calendar/dist-ssr             apps/calendar/dist-ssr
COPY apps/carousel/dist-ssr             apps/carousel/dist-ssr
COPY apps/chat/dist-ssr                 apps/chat/dist-ssr
COPY apps/code/dist-ssr                 apps/code/dist-ssr
COPY apps/compare/dist-ssr              apps/compare/dist-ssr
COPY apps/confirm/dist-ssr              apps/confirm/dist-ssr
COPY apps/counter/dist-ssr              apps/counter/dist-ssr
COPY apps/crosstab/dist-ssr             apps/crosstab/dist-ssr
COPY apps/datatable/dist-ssr            apps/datatable/dist-ssr
COPY apps/detail/dist-ssr               apps/detail/dist-ssr
COPY apps/diff/dist-ssr                 apps/diff/dist-ssr
COPY apps/embed/dist-ssr                apps/embed/dist-ssr
COPY apps/filter/dist-ssr               apps/filter/dist-ssr
COPY apps/flowchart/dist-ssr            apps/flowchart/dist-ssr
COPY apps/form/dist-ssr                 apps/form/dist-ssr
COPY apps/funnel/dist-ssr               apps/funnel/dist-ssr
COPY apps/gallery/dist-ssr              apps/gallery/dist-ssr
COPY apps/gantt/dist-ssr                apps/gantt/dist-ssr
COPY apps/gauge/dist-ssr                apps/gauge/dist-ssr
COPY apps/geostory/dist-ssr             apps/geostory/dist-ssr
COPY apps/gis-legend/dist-ssr           apps/gis-legend/dist-ssr
COPY apps/globe/dist-ssr                apps/globe/dist-ssr
COPY apps/graph/dist-ssr                apps/graph/dist-ssr
COPY apps/heatmap/dist-ssr              apps/heatmap/dist-ssr
COPY apps/image/dist-ssr                apps/image/dist-ssr
COPY apps/investigation/dist-ssr        apps/investigation/dist-ssr
COPY apps/json/dist-ssr                 apps/json/dist-ssr
COPY apps/kanban/dist-ssr               apps/kanban/dist-ssr
COPY apps/layers/dist-ssr               apps/layers/dist-ssr
COPY apps/log/dist-ssr                  apps/log/dist-ssr
COPY apps/map/dist-ssr                  apps/map/dist-ssr
COPY apps/markdown/dist-ssr             apps/markdown/dist-ssr
COPY apps/minimap/dist-ssr              apps/minimap/dist-ssr
COPY apps/neural/dist-ssr               apps/neural/dist-ssr
COPY apps/notebook/dist-ssr             apps/notebook/dist-ssr
COPY apps/pivot/dist-ssr                apps/pivot/dist-ssr
COPY apps/poll/dist-ssr                 apps/poll/dist-ssr
COPY apps/profile/dist-ssr              apps/profile/dist-ssr
COPY apps/progress/dist-ssr             apps/progress/dist-ssr
COPY apps/quiz/dist-ssr                 apps/quiz/dist-ssr
COPY apps/ranked/dist-ssr               apps/ranked/dist-ssr
COPY apps/sankey/dist-ssr               apps/sankey/dist-ssr
COPY apps/scatter/dist-ssr              apps/scatter/dist-ssr
COPY apps/settings/dist-ssr             apps/settings/dist-ssr
COPY apps/slides/dist-ssr               apps/slides/dist-ssr
COPY apps/spectrogram/dist-ssr          apps/spectrogram/dist-ssr
COPY apps/split/dist-ssr                apps/split/dist-ssr
COPY apps/status/dist-ssr               apps/status/dist-ssr
COPY apps/stepper/dist-ssr              apps/stepper/dist-ssr
COPY apps/sunburst/dist-ssr             apps/sunburst/dist-ssr
COPY apps/swimlane/dist-ssr             apps/swimlane/dist-ssr
COPY apps/tabs/dist-ssr                 apps/tabs/dist-ssr
COPY apps/terminal/dist-ssr             apps/terminal/dist-ssr
COPY apps/threed/dist-ssr               apps/threed/dist-ssr
COPY apps/timeline/dist-ssr             apps/timeline/dist-ssr
COPY apps/timeseries/dist-ssr           apps/timeseries/dist-ssr
COPY apps/tree/dist-ssr                 apps/tree/dist-ssr
COPY apps/treemap/dist-ssr              apps/treemap/dist-ssr
COPY apps/video/dist-ssr                apps/video/dist-ssr
COPY apps/chat/dist/mcp-app.html       apps/chat/dist/mcp-app.html
COPY apps/code/dist/mcp-app.html       apps/code/dist/mcp-app.html
COPY apps/compare/dist/mcp-app.html    apps/compare/dist/mcp-app.html
COPY apps/confirm/dist/mcp-app.html    apps/confirm/dist/mcp-app.html
COPY apps/counter/dist/mcp-app.html    apps/counter/dist/mcp-app.html
COPY apps/dashboard/dist/mcp-app.html  apps/dashboard/dist/mcp-app.html
COPY apps/datatable/dist/mcp-app.html  apps/datatable/dist/mcp-app.html
COPY apps/detail/dist/mcp-app.html     apps/detail/dist/mcp-app.html
COPY apps/form/dist/mcp-app.html       apps/form/dist/mcp-app.html
COPY apps/gallery/dist/mcp-app.html    apps/gallery/dist/mcp-app.html
COPY apps/image/dist/mcp-app.html      apps/image/dist/mcp-app.html
COPY apps/json/dist/mcp-app.html       apps/json/dist/mcp-app.html
COPY apps/log/dist/mcp-app.html        apps/log/dist/mcp-app.html
COPY apps/map/dist/mcp-app.html        apps/map/dist/mcp-app.html
COPY apps/markdown/dist/mcp-app.html   apps/markdown/dist/mcp-app.html
COPY apps/pdf/dist-ssr                 apps/pdf/dist-ssr
COPY apps/pdf/dist/mcp-app.html        apps/pdf/dist/mcp-app.html
COPY apps/poll/dist/mcp-app.html       apps/poll/dist/mcp-app.html
COPY apps/progress/dist/mcp-app.html   apps/progress/dist/mcp-app.html
COPY apps/quiz/dist/mcp-app.html       apps/quiz/dist/mcp-app.html
COPY apps/ranked/dist/mcp-app.html     apps/ranked/dist/mcp-app.html
COPY apps/split/dist/mcp-app.html      apps/split/dist/mcp-app.html
COPY apps/status/dist/mcp-app.html     apps/status/dist/mcp-app.html
COPY apps/tabs/dist/mcp-app.html       apps/tabs/dist/mcp-app.html
COPY apps/timeline/dist/mcp-app.html   apps/timeline/dist/mcp-app.html
COPY apps/tree/dist/mcp-app.html       apps/tree/dist/mcp-app.html
COPY apps/video/dist/mcp-app.html      apps/video/dist/mcp-app.html
# Phase 3 (7 new)
COPY apps/alert/dist/mcp-app.html      apps/alert/dist/mcp-app.html
COPY apps/diff/dist/mcp-app.html       apps/diff/dist/mcp-app.html
COPY apps/embed/dist/mcp-app.html      apps/embed/dist/mcp-app.html
COPY apps/filter/dist/mcp-app.html     apps/filter/dist/mcp-app.html
COPY apps/kanban/dist/mcp-app.html     apps/kanban/dist/mcp-app.html
COPY apps/settings/dist/mcp-app.html   apps/settings/dist/mcp-app.html
COPY apps/stepper/dist/mcp-app.html    apps/stepper/dist/mcp-app.html
# Phase 4 (17 new)
COPY apps/audio/dist/mcp-app.html       apps/audio/dist/mcp-app.html
COPY apps/boxplot/dist/mcp-app.html     apps/boxplot/dist/mcp-app.html
COPY apps/carousel/dist/mcp-app.html    apps/carousel/dist/mcp-app.html
COPY apps/crosstab/dist/mcp-app.html    apps/crosstab/dist/mcp-app.html
COPY apps/gauge/dist/mcp-app.html       apps/gauge/dist/mcp-app.html
COPY apps/gis-legend/dist/mcp-app.html  apps/gis-legend/dist/mcp-app.html
COPY apps/heatmap/dist/mcp-app.html     apps/heatmap/dist/mcp-app.html
COPY apps/layers/dist/mcp-app.html      apps/layers/dist/mcp-app.html
COPY apps/minimap/dist/mcp-app.html     apps/minimap/dist/mcp-app.html
COPY apps/pivot/dist/mcp-app.html       apps/pivot/dist/mcp-app.html
COPY apps/profile/dist/mcp-app.html     apps/profile/dist/mcp-app.html
COPY apps/scatter/dist/mcp-app.html     apps/scatter/dist/mcp-app.html
COPY apps/spectrogram/dist/mcp-app.html apps/spectrogram/dist/mcp-app.html
COPY apps/sunburst/dist/mcp-app.html    apps/sunburst/dist/mcp-app.html
COPY apps/terminal/dist/mcp-app.html    apps/terminal/dist/mcp-app.html
COPY apps/timeseries/dist/mcp-app.html  apps/timeseries/dist/mcp-app.html
COPY apps/treemap/dist/mcp-app.html     apps/treemap/dist/mcp-app.html
# Phase 6 Compound (15 new)
COPY apps/annotation/dist/mcp-app.html    apps/annotation/dist/mcp-app.html
COPY apps/calendar/dist/mcp-app.html      apps/calendar/dist/mcp-app.html
COPY apps/flowchart/dist/mcp-app.html     apps/flowchart/dist/mcp-app.html
COPY apps/funnel/dist/mcp-app.html        apps/funnel/dist/mcp-app.html
COPY apps/gantt/dist/mcp-app.html         apps/gantt/dist/mcp-app.html
COPY apps/geostory/dist/mcp-app.html      apps/geostory/dist/mcp-app.html
COPY apps/globe/dist/mcp-app.html         apps/globe/dist/mcp-app.html
COPY apps/graph/dist/mcp-app.html         apps/graph/dist/mcp-app.html
COPY apps/investigation/dist/mcp-app.html apps/investigation/dist/mcp-app.html
COPY apps/neural/dist/mcp-app.html        apps/neural/dist/mcp-app.html
COPY apps/notebook/dist/mcp-app.html      apps/notebook/dist/mcp-app.html
COPY apps/sankey/dist/mcp-app.html        apps/sankey/dist/mcp-app.html
COPY apps/slides/dist/mcp-app.html        apps/slides/dist/mcp-app.html
COPY apps/swimlane/dist/mcp-app.html      apps/swimlane/dist/mcp-app.html
COPY apps/threed/dist/mcp-app.html        apps/threed/dist/mcp-app.html

# Playground (multi-file SPA)
COPY apps/playground/dist              apps/playground/dist

# Storybook (static build)
COPY storybook-static                  storybook-static

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=2s --retries=3 \
  CMD wget -qO- http://localhost:8000/health || exit 1

CMD ["node", "server.mjs"]
