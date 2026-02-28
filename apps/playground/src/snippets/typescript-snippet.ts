export function generateTypeScriptSnippet(
  viewName: string,
  sampleData: object,
): string {
  const jsonStr = JSON.stringify(sampleData, null, 2);
  const indented = jsonStr
    .split("\n")
    .map((line, i) => (i === 0 ? line : "      " + line))
    .join("\n");

  return `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({ name: "my-server", version: "1.0.0" });

server.tool("show_${viewName.replace(/-/g, "_")}", async () => ({
  content: [
    {
      type: "resource",
      resource: {
        uri: "view:///${viewName}",
        mimeType: "application/json",
        text: JSON.stringify(${indented}),
      },
    },
  ],
}));
`;
}
