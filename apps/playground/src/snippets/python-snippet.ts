import { CONTENT_CLASS, decoratorName, toolFuncName } from "./view-metadata";

export function generatePythonSnippet(
  viewName: string,
  sampleData: object,
): string {
  const contentClass = CONTENT_CLASS[viewName];
  const funcName = toolFuncName(viewName);
  const jsonStr = JSON.stringify(sampleData, null, 4);
  const indented = jsonStr
    .split("\n")
    .map((line, i) => (i === 0 ? line : "    " + line))
    .join("\n");

  // Views without a Pydantic class use generic view_tool + dict
  if (!contentClass) {
    return `from mcp.server.fastmcp import FastMCP
from chuk_view_schemas.fastmcp import view_tool

mcp = FastMCP("my-server")

@view_tool(mcp, "${funcName}", "${viewName}")
async def ${funcName}() -> dict:
    """Display a ${viewName} view."""
    return ${indented}
`;
  }

  const decorator = decoratorName(viewName);
  return `from mcp.server.fastmcp import FastMCP
from chuk_view_schemas import ${contentClass}
from chuk_view_schemas.fastmcp import ${decorator}

mcp = FastMCP("my-server")

@${decorator}(mcp, "${funcName}")
async def ${funcName}() -> ${contentClass}:
    """Display a ${viewName} view."""
    data = ${indented}
    return ${contentClass}(**data)
`;
}
