#!/usr/bin/env node

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { validateViewName, toPascalCase, toCamelCase } from "./utils.js";
import * as templates from "./templates.js";
import type { Template } from "./templates.js";

function main() {
  const args = process.argv.slice(2);

  const withAnimation = args.includes("--with-animation");
  const templateArg = args.find((a: string) => a.startsWith("--template="));
  const template: Template = templateArg
    ? (templateArg.split("=")[1] as Template)
    : "blank";
  const positional = args.filter((a: string) => !a.startsWith("--"));

  if (positional.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: create-chuk-view <view-name> [options]

Options:
  --template=<type>   Template pattern: blank (default), list, detail, wizard
  --with-animation    Add framer-motion dependency
  --help, -h          Show this help message

Examples:
  npx create-chuk-view my-custom-view
  npx create-chuk-view my-custom-view --template=list
  npx create-chuk-view my-custom-view --template=detail
  npx create-chuk-view my-custom-view --template=wizard --with-animation
`);
    process.exit(positional.length === 0 && !args.includes("--help") ? 1 : 0);
  }

  if (!templates.TEMPLATES.includes(template)) {
    console.error(`Error: Unknown template "${template}". Choose from: ${templates.TEMPLATES.join(", ")}`);
    process.exit(1);
  }

  const viewName = positional[0];
  const validationError = validateViewName(viewName);
  if (validationError) {
    console.error(`Error: ${validationError}`);
    process.exit(1);
  }

  const pascalName = toPascalCase(viewName);
  const camelName = toCamelCase(viewName);
  const outDir = resolve(process.cwd(), viewName);

  if (existsSync(outDir)) {
    console.error(`Error: Directory "${viewName}" already exists.`);
    process.exit(1);
  }

  const opts = { viewName, pascalName, camelName, withAnimation, template };

  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(outDir, "src"), { recursive: true });
  mkdirSync(join(outDir, "schemas"), { recursive: true });

  const files: Array<[string, string]> = [
    ["package.json", templates.packageJson(opts)],
    [".gitignore", templates.gitignore()],
    ["vite.config.ts", templates.viteConfig()],
    ["vite.config.ssr.ts", templates.viteConfigSsr()],
    ["tsconfig.json", templates.tsConfig()],
    ["vitest.config.ts", templates.vitestConfig()],
    ["mcp-app.html", templates.mcpAppHtml(opts)],
    ["src/mcp-app.tsx", templates.mcpAppTsx(opts)],
    ["src/ssr-entry.tsx", templates.ssrEntryTsx(opts)],
    ["src/schema.ts", templates.schemaTs(opts)],
    ["src/zod.ts", templates.zodTs(opts)],
    ["src/App.tsx", templates.appTsx(opts)],
    ["schemas/input.json", templates.inputJson(opts)],
    ["src/schema.test.ts", templates.schemaTestTs(opts)],
    ["src/zod.test.ts", templates.zodTestTs(opts)],
    [`src/${pascalName}.stories.tsx`, templates.storiesTsx(opts)],
    ["COMPONENT.md", templates.componentMd(opts)],
  ];

  for (const [filePath, content] of files) {
    writeFileSync(join(outDir, filePath), content, "utf-8");
  }

  console.log(`
  Created @chuk/view-${viewName} with ${files.length} files:

    ${viewName}/
      package.json
      .gitignore
      vite.config.ts          (SPA build → dist/mcp-app.html)
      vite.config.ssr.ts      (SSR build → dist-ssr/)
      tsconfig.json
      vitest.config.ts
      mcp-app.html
      schemas/input.json
      src/mcp-app.tsx          (hydrate or createRoot)
      src/ssr-entry.tsx        (renderToString for SSR)
      src/schema.ts
      src/zod.ts
      src/App.tsx              (View + Renderer)
      src/schema.test.ts
      src/zod.test.ts
      src/${pascalName}.stories.tsx
      COMPONENT.md

  Next steps:

    1. Move into the monorepo:
       mv ${viewName} apps/${viewName}

    2. Install dependencies:
       pnpm install

    3. Start development:
       pnpm --filter @chuk/view-${viewName} dev

    4. Edit src/schema.ts to define your data shape
    5. Edit src/App.tsx to build your View

    6. Run tests:
       pnpm --filter @chuk/view-${viewName} test

    7. Build (SPA + SSR):
       pnpm --filter @chuk/view-${viewName} build
`);
}

main();
