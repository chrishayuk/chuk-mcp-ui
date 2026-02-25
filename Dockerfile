FROM node:22-alpine

WORKDIR /app

# Copy only the server and built dist files
COPY server.mjs .

# Universal SSR module (single bundle replaces 65 per-view SSR bundles)
# React is externalized from the bundle — install just react + react-dom
COPY packages/ssr/dist                  packages/ssr/dist
RUN npm install --no-save react@18 react-dom@18

# 66 View apps (single-file HTML each)
# Phase 1-2 (original 27)
COPY apps/chart/dist/mcp-app.html      apps/chart/dist/mcp-app.html
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
