#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { snapshot, type SnapshotOptions } from "./snapshot.js";

const USAGE = `
chuk-view-test — Snapshot any chuk view with given data via headless Chromium

Usage:
  chuk-view-test --view <name> --data <path-or-json> [options]

Required:
  --view <name>         View name (e.g. counter, map, datatable)
  --data <path|json>    Path to a JSON file, or inline JSON string

Options:
  --output <path>       Output screenshot path (default: ./snapshot.png)
  --width <number>      Viewport width in px (default: 1280)
  --height <number>     Viewport height in px (default: 720)
  --theme <light|dark>  Color theme (default: light)
  --base-url <url>      View server URL (default: https://mcp-views.chukai.io)
  --timeout <ms>        Max wait for render in ms (default: 10000)
  --scale <number>      Device scale factor (default: 2)
  --help                Show this help message

Examples:
  chuk-view-test --view counter --data sample.json --output screenshot.png
  chuk-view-test --view map --data '{"type":"map","version":"1.0"}' --output map.png
  chuk-view-test --view datatable --data fixtures.json --width 1280 --height 720 --theme dark
`.trim();

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      args["help"] = "true";
      continue;
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = "true";
      }
    }
  }
  return args;
}

async function loadData(input: string): Promise<Record<string, unknown>> {
  // If the input starts with { or [, treat it as inline JSON
  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed) as Record<string, unknown>;
    } catch (err) {
      throw new Error(
        `Failed to parse inline JSON: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Otherwise treat it as a file path
  const filePath = resolve(input);
  let contents: string;
  try {
    contents = await readFile(filePath, "utf-8");
  } catch (err) {
    throw new Error(
      `Failed to read data file "${filePath}": ${err instanceof Error ? err.message : String(err)}`
    );
  }

  try {
    return JSON.parse(contents) as Record<string, unknown>;
  } catch (err) {
    throw new Error(
      `Failed to parse JSON from "${filePath}": ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

function requireArg(args: Record<string, string>, name: string): string {
  const value = args[name];
  if (!value) {
    console.error(`Error: --${name} is required.\n`);
    console.error(USAGE);
    process.exit(1);
  }
  return value;
}

function parseNumber(
  value: string | undefined,
  name: string,
  fallback: number
): number {
  if (value === undefined) return fallback;
  const n = Number(value);
  if (isNaN(n) || n <= 0) {
    console.error(`Error: --${name} must be a positive number, got "${value}".`);
    process.exit(1);
  }
  return n;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args["help"]) {
    console.log(USAGE);
    process.exit(0);
  }

  const view = requireArg(args, "view");
  const dataInput = requireArg(args, "data");
  const output = args["output"] ?? "./snapshot.png";
  const width = parseNumber(args["width"], "width", 1280);
  const height = parseNumber(args["height"], "height", 720);
  const scale = parseNumber(args["scale"], "scale", 2);
  const timeout = parseNumber(args["timeout"], "timeout", 10_000);
  const baseUrl = args["base-url"] ?? "https://mcp-views.chukai.io";

  const themeArg = args["theme"] ?? "light";
  if (themeArg !== "light" && themeArg !== "dark") {
    console.error(
      `Error: --theme must be "light" or "dark", got "${themeArg}".`
    );
    process.exit(1);
  }
  const theme = themeArg as "light" | "dark";

  let data: Record<string, unknown>;
  try {
    data = await loadData(dataInput);
  } catch (err) {
    console.error(
      `Error: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }

  const options: SnapshotOptions = {
    view,
    data,
    output,
    width,
    height,
    theme,
    baseUrl,
    timeout,
    deviceScaleFactor: scale,
  };

  try {
    await snapshot(options);
    const resolvedOutput = resolve(output);
    console.log(
      `\u2713 Snapshot saved to ${resolvedOutput} (${width}x${height})`
    );
  } catch (err) {
    console.error(
      `Error: Failed to capture snapshot for view "${view}": ${err instanceof Error ? err.message : String(err)}`
    );
    process.exit(1);
  }
}

main();
