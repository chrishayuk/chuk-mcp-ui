/**
 * Generate a compatibility matrix markdown table from Playwright JSON output.
 *
 * Reads: docs/compat-matrix.json (Playwright JSON reporter output)
 * Writes: docs/compat-matrix.md (human-readable markdown table)
 */
import fs from "node:fs";
import path from "node:path";

const docsDir = path.resolve(import.meta.dirname, "..", "..", "..", "docs");
const jsonPath = path.join(docsDir, "compat-matrix.json");
const mdPath = path.join(docsDir, "compat-matrix.md");

interface PlaywrightResult {
  suites: Suite[];
}

interface Suite {
  title: string;
  suites?: Suite[];
  specs?: Spec[];
}

interface Spec {
  title: string;
  tests: Array<{
    results: Array<{ status: string }>;
  }>;
}

function specStatus(spec: Spec): string {
  const lastResult = spec.tests[0]?.results[0];
  if (!lastResult) return "?";
  return lastResult.status === "passed"
    ? "PASS"
    : lastResult.status === "skipped"
      ? "SKIP"
      : "FAIL";
}

// Collect all specs with their full suite path
interface FlatSpec {
  path: string[]; // suite titles from root to leaf
  title: string;
  status: string;
}

function flattenSpecs(suites: Suite[], parentPath: string[] = []): FlatSpec[] {
  const result: FlatSpec[] = [];
  for (const suite of suites) {
    const currentPath = [...parentPath, suite.title];
    if (suite.specs) {
      for (const spec of suite.specs) {
        result.push({
          path: currentPath,
          title: spec.title,
          status: specStatus(spec),
        });
      }
    }
    if (suite.suites) {
      result.push(...flattenSpecs(suite.suites, currentPath));
    }
  }
  return result;
}

function main() {
  if (!fs.existsSync(jsonPath)) {
    console.error(`JSON report not found at ${jsonPath}`);
    console.error(
      "Run Playwright tests first: pnpm --filter @chuk/compat-harness test",
    );
    process.exit(1);
  }

  const report: PlaywrightResult = JSON.parse(
    fs.readFileSync(jsonPath, "utf-8"),
  );

  const allSpecs = flattenSpecs(report.suites);

  // Build per-view results
  interface ViewRow {
    extApps: string;
    postMsg: string;
    themeL: string;
    themeD: string;
    callTool: string;
    resize: string;
    handshake: string;
    update: string;
  }

  const views = new Map<string, ViewRow>();

  function getRow(name: string): ViewRow {
    if (!views.has(name)) {
      views.set(name, {
        extApps: "-",
        postMsg: "-",
        themeL: "-",
        themeD: "-",
        callTool: "-",
        resize: "-",
        handshake: "-",
        update: "-",
      });
    }
    return views.get(name)!;
  }

  for (const spec of allSpecs) {
    const file = spec.path.find((p) => p.endsWith(".spec.ts")) ?? "";

    if (file === "smoke.spec.ts") {
      // Suite structure: smoke.spec.ts > <viewName> > "ext-apps: ..." / "postMessage: ..."
      const viewName = spec.path[spec.path.length - 1];
      if (viewName === file) continue;
      const row = getRow(viewName);
      if (spec.title.startsWith("ext-apps:")) row.extApps = spec.status;
      if (spec.title.startsWith("postMessage:")) row.postMsg = spec.status;
    }

    if (file === "theme.spec.ts") {
      // Suite: theme.spec.ts > "theme: <viewName>" > "light/dark theme renders correctly"
      const themeSuite = spec.path.find((p) => p.startsWith("theme: "));
      if (!themeSuite) continue;
      const viewName = themeSuite.replace("theme: ", "");
      const row = getRow(viewName);
      if (spec.title.includes("light")) row.themeL = spec.status;
      if (spec.title.includes("dark")) row.themeD = spec.status;
    }

    if (file === "calltool.spec.ts") {
      // Spec titles: "confirm: action dispatches...", "poll: vote dispatches...", "form: form elements..."
      const match = spec.title.match(/^(\w+):/);
      if (!match) continue;
      const viewName = match[1];
      getRow(viewName).callTool = spec.status;
    }

    if (file === "resize.spec.ts") {
      // Spec titles: "chart: adapts to viewport resize"
      const match = spec.title.match(/^(\w+):/);
      if (!match) continue;
      getRow(match[1]).resize = spec.status;
    }

    if (file === "handshake.spec.ts") {
      // Spec titles: "counter: shows Fallback...", "chart: postMessage with delay..."
      const match = spec.title.match(/^(\w+):/);
      if (!match) continue;
      getRow(match[1]).handshake = spec.status;
    }

    if (file === "update.spec.ts") {
      // Spec titles: "counter: handles replace update", "counter: handles merge update"
      const match = spec.title.match(/^(\w+):/);
      if (!match) continue;
      getRow(match[1]).update = spec.status;
    }
  }

  // Generate markdown
  const lines: string[] = [];
  lines.push("# Compatibility Matrix");
  lines.push("");
  lines.push(
    `Generated: ${new Date().toISOString().split("T")[0]} | Protocol: @modelcontextprotocol/ext-apps v1.0.1`,
  );
  lines.push("");
  lines.push(
    "| View | ext-apps | postMessage | Theme L | Theme D | callTool | Resize | Handshake | Update |",
  );
  lines.push(
    "|------|----------|-------------|---------|---------|----------|--------|-----------|--------|",
  );

  const sortedViews = [...views.keys()].sort();

  for (const viewName of sortedViews) {
    const r = views.get(viewName)!;
    lines.push(
      `| ${viewName} | ${r.extApps} | ${r.postMsg} | ${r.themeL} | ${r.themeD} | ${r.callTool} | ${r.resize} | ${r.handshake} | ${r.update} |`,
    );
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    `Total views tested: ${sortedViews.length} | Generated by \`@chuk/compat-harness\``,
  );
  lines.push("");

  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(mdPath, lines.join("\n"));
  console.log(`Compatibility matrix written to ${mdPath}`);
  console.log(`${sortedViews.length} views in matrix`);
}

main();
