/**
 * Example: TypeScript MCP server using a View from npm (inline path).
 *
 * This matches the Anthropic ext-apps pattern exactly:
 * readFileSync from node_modules, serve via ui:// scheme.
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";

// Read the pre-built View HTML from the npm package
const require = createRequire(import.meta.url);
const viewHtml = readFileSync(
  require.resolve("@chuk/view-datatable"),
  "utf-8"
);

const server = new Server({
  name: "sample-data-server",
  version: "1.0.0",
});

const resourceUri = "ui://sample-data/datatable";

// Register the View as a resource (served inline via MCP protocol)
registerAppResource(
  server,
  "datatable",
  resourceUri,
  { mimeType: RESOURCE_MIME_TYPE },
  async () => ({
    contents: [
      { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: viewHtml },
    ],
  })
);

// Register a tool that uses the View
registerAppTool(
  server,
  "list-employees",
  {
    title: "List Employees",
    description: "Show all employees in a sortable table.",
    inputSchema: {},
    _meta: { ui: { resourceUri } },
  },
  async () => ({
    content: [{ type: "text", text: "Showing 5 employees." }],
    structuredContent: {
      type: "datatable",
      version: "1.0",
      title: "Employees",
      sortable: true,
      filterable: true,
      exportable: true,
      columns: [
        { key: "name", label: "Name", sortable: true },
        { key: "department", label: "Department", type: "badge", badgeColors: {
          Engineering: "#3b82f6",
          Design: "#8b5cf6",
          Marketing: "#f59e0b",
          Sales: "#10b981",
        }},
        { key: "role", label: "Role" },
        { key: "joined", label: "Joined", type: "date", sortable: true },
      ],
      rows: [
        { name: "Alice Chen", department: "Engineering", role: "Senior Engineer", joined: "2022-03-15" },
        { name: "Bob Smith", department: "Design", role: "Lead Designer", joined: "2021-09-01" },
        { name: "Carol Jones", department: "Marketing", role: "Marketing Manager", joined: "2023-01-10" },
        { name: "David Kim", department: "Engineering", role: "Staff Engineer", joined: "2020-06-20" },
        { name: "Eva Martinez", department: "Sales", role: "Account Executive", joined: "2023-07-05" },
      ],
    },
  })
);

// Connect
const transport = new StdioServerTransport();
await server.connect(transport);
