FROM node:22-alpine

WORKDIR /app

# Copy only the server and built dist files — no npm install needed
COPY server.mjs .
COPY apps/chart/dist/mcp-app.html      apps/chart/dist/mcp-app.html
COPY apps/dashboard/dist/mcp-app.html  apps/dashboard/dist/mcp-app.html
COPY apps/datatable/dist/mcp-app.html  apps/datatable/dist/mcp-app.html
COPY apps/form/dist/mcp-app.html       apps/form/dist/mcp-app.html
COPY apps/map/dist/mcp-app.html        apps/map/dist/mcp-app.html
COPY apps/split/dist/mcp-app.html      apps/split/dist/mcp-app.html
COPY apps/tabs/dist/mcp-app.html       apps/tabs/dist/mcp-app.html
COPY apps/video/dist/mcp-app.html      apps/video/dist/mcp-app.html
COPY apps/pdf/dist/mcp-app.html        apps/pdf/dist/mcp-app.html
COPY apps/markdown/dist/mcp-app.html   apps/markdown/dist/mcp-app.html

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=2s --retries=3 \
  CMD wget -qO- http://localhost:8000/health || exit 1

CMD ["node", "server.mjs"]
