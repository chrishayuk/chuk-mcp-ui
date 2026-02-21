/**
 * generate-manifest.ts
 *
 * Reads every apps/* /schemas/input.json and generates a typed
 * VIEW_MANIFEST array in src/view-manifest.ts.
 *
 * Run: tsx scripts/generate-manifest.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "../../..");
const APPS_DIR = path.join(ROOT, "apps");
const OUT_FILE = path.resolve(__dirname, "../src/view-manifest.ts");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface JsonSchema {
  type?: string;
  const?: unknown;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  oneOf?: JsonSchema[];
  $defs?: Record<string, JsonSchema>;
  definitions?: Record<string, JsonSchema>;
}

/** Known interactive tool-related property names */
const CALL_TOOL_FIELDS = new Set([
  "submitTool",
  "confirmTool",
  "cancelTool",
  "voteTool",
  "validateTool",
  "completeTool",
  "respondTool",
  "saveTool",
  "moveTool",
  "loadChildrenTool",
  "resultsTool",
  "actions",
  "onConfirm",
  "onCancel",
]);

/**
 * Walk the schema properties and detect whether any interactive /
 * callTool related fields exist. Checks top-level properties plus
 * one level into array items (e.g. alert has actions inside
 * alerts[].actions which references tools).
 */
function detectCallTool(schema: JsonSchema): boolean {
  const props = schema.properties ?? {};

  // Check top-level properties
  for (const key of Object.keys(props)) {
    if (CALL_TOOL_FIELDS.has(key)) return true;
  }

  // Check one level deeper: array items' properties
  for (const propSchema of Object.values(props)) {
    if (propSchema.type === "array" && propSchema.items?.properties) {
      for (const key of Object.keys(propSchema.items.properties)) {
        if (CALL_TOOL_FIELDS.has(key)) return true;
      }
    }
  }

  // Also check inside oneOf variants
  if (schema.oneOf) {
    for (const variant of schema.oneOf) {
      const variantProps = variant.properties ?? {};
      for (const key of Object.keys(variantProps)) {
        if (CALL_TOOL_FIELDS.has(key)) return true;
      }
    }
  }

  return false;
}

/**
 * Classify a view name into a category.
 */
function categorize(name: string): string {
  const categories: Record<string, string[]> = {
    canvas: ["chart", "scatter", "boxplot", "heatmap", "timeseries", "funnel", "sankey", "gauge"],
    visualization: ["treemap", "sunburst", "graph", "neural", "flowchart", "swimlane", "gantt"],
    text: ["markdown", "code", "json", "diff", "log", "terminal", "notebook"],
    media: ["image", "video", "audio", "carousel", "gallery", "spectrogram", "pdf", "embed"],
    interactive: [
      "form", "confirm", "alert", "poll", "quiz", "chat", "settings", "filter",
      "annotation", "playground",
    ],
    layout: ["dashboard", "split", "tabs", "layers", "minimap", "slides"],
    data: [
      "datatable", "crosstab", "pivot", "ranked", "kanban", "tree", "calendar",
      "timeline", "stepper", "investigation",
    ],
    compound: [
      "detail", "profile", "status", "compare", "counter", "progress", "map",
      "gis-legend", "globe", "geostory", "threed",
    ],
  };

  for (const [cat, names] of Object.entries(categories)) {
    if (names.includes(name)) return cat;
  }

  return "compound";
}

/**
 * Extract the `type` const value from a schema, handling oneOf wrappers.
 */
function extractTypeConst(schema: JsonSchema): string {
  // Direct property
  if (schema.properties?.type?.const) {
    return String(schema.properties.type.const);
  }
  // Inside oneOf
  if (schema.oneOf) {
    for (const variant of schema.oneOf) {
      if (variant.properties?.type?.const) {
        return String(variant.properties.type.const);
      }
    }
  }
  return "unknown";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const appDirs = fs
    .readdirSync(APPS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const entries: Array<{
    name: string;
    type: string;
    hasCallTool: boolean;
    category: string;
  }> = [];

  for (const appName of appDirs) {
    const schemaPath = path.join(APPS_DIR, appName, "schemas", "input.json");
    if (!fs.existsSync(schemaPath)) continue;

    const rawSchema = JSON.parse(
      fs.readFileSync(schemaPath, "utf-8"),
    ) as JsonSchema;

    const viewType = extractTypeConst(rawSchema);
    const hasCallTool = detectCallTool(rawSchema);
    const category = categorize(appName);

    entries.push({
      name: appName,
      type: viewType,
      hasCallTool,
      category,
    });
  }

  // Build TypeScript output
  const lines: string[] = [];
  lines.push(`export interface ViewMeta {`);
  lines.push(`  name: string;`);
  lines.push(`  type: string;`);
  lines.push(`  hasCallTool: boolean;`);
  lines.push(`  category: string;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const VIEW_MANIFEST: ViewMeta[] = [`);

  for (const entry of entries) {
    lines.push(
      `  { name: ${JSON.stringify(entry.name)}, type: ${JSON.stringify(entry.type)}, hasCallTool: ${entry.hasCallTool}, category: ${JSON.stringify(entry.category)} },`,
    );
  }

  lines.push(`];`);
  lines.push(``);

  // Ensure output directory exists
  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUT_FILE, lines.join("\n"));

  console.log(`Generated: ${entries.length} view entries`);
  console.log(`Output: ${OUT_FILE}`);

  // Summary
  const byCat = entries.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log(`\nBy category:`);
  for (const [cat, count] of Object.entries(byCat).sort()) {
    console.log(`  ${cat}: ${count}`);
  }

  const withTool = entries.filter((e) => e.hasCallTool).length;
  console.log(`\nWith callTool: ${withTool}/${entries.length}`);
}

main();
