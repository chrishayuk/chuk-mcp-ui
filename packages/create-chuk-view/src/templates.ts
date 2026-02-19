interface TemplateOpts {
  viewName: string;
  pascalName: string;
  camelName: string;
  withAnimation: boolean;
}

export function packageJson(opts: TemplateOpts): string {
  const deps: Record<string, string> = {
    "@chuk/view-shared": "workspace:*",
    "@chuk/view-ui": "workspace:*",
    "@modelcontextprotocol/ext-apps": "^1.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zod": "^4.0.0",
  };
  if (opts.withAnimation) {
    deps["framer-motion"] = "^11.0.0";
  }

  return JSON.stringify({
    name: `@chuk/view-${opts.viewName}`,
    version: "1.0.0",
    description: `${opts.pascalName} View for MCP Apps`,
    type: "module",
    main: "dist/mcp-app.html",
    exports: {
      ".": "./dist/mcp-app.html",
      "./schema": "./schemas/input.json",
      "./types": "./src/schema.ts",
      "./zod": "./src/zod.ts",
    },
    files: ["dist/mcp-app.html", "schemas/input.json", "src/schema.ts", "src/zod.ts"],
    keywords: ["mcp", "mcp-apps", "ext-apps", "view", opts.viewName],
    scripts: {
      dev: "vite",
      build: "vite build",
      "type-check": "tsc --noEmit",
      test: "vitest run",
      clean: "rm -rf dist",
    },
    dependencies: deps,
    devDependencies: {
      "@tailwindcss/vite": "^4.0.0",
      "@vitejs/plugin-react": "^4.3.0",
      "@types/react": "^18.3.0",
      "@types/react-dom": "^18.3.0",
      typescript: "^5.7.0",
      vite: "^6.0.0",
      "vite-plugin-singlefile": "^2.0.0",
      vitest: "^3.0.0",
      ajv: "^8.17.0",
    },
  }, null, 2) + "\n";
}

export function viteConfig(): string {
  return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: { input: "mcp-app.html" },
  },
});
`;
}

export function tsConfig(): string {
  return JSON.stringify({
    extends: "../../tsconfig.base.json",
    compilerOptions: { outDir: "./dist", rootDir: "./src" },
    include: ["src"],
    exclude: ["src/**/*.stories.tsx"],
  }, null, 2) + "\n";
}

export function vitestConfig(): string {
  return `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
`;
}

export function mcpAppHtml(opts: TemplateOpts): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@chuk/view-${opts.viewName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/mcp-app.tsx"></script>
  </body>
</html>
`;
}

export function mcpAppTsx(opts: TemplateOpts): string {
  return `import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@chuk/view-ui/styles";
import { ${opts.pascalName}View } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <${opts.pascalName}View />
  </StrictMode>
);
`;
}

export function schemaTs(opts: TemplateOpts): string {
  return `export interface ${opts.pascalName}Content {
  type: "${opts.viewName}";
  version: "1.0";
  title?: string;
  // TODO: Add your schema fields here
}
`;
}

export function zodTs(opts: TemplateOpts): string {
  return `import { z } from "zod";

export const ${opts.camelName}Schema = z.object({
  type: z.literal("${opts.viewName}"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  // TODO: Add your Zod fields here
});

export type ${opts.pascalName}Content = z.infer<typeof ${opts.camelName}Schema>;
`;
}

export function appTsx(opts: TemplateOpts): string {
  const animationImports = opts.withAnimation
    ? `import { motion } from "framer-motion";
import { slideUp } from "@chuk/view-ui/animations";
`
    : "";

  const wrapOpen = opts.withAnimation
    ? `      <motion.div variants={slideUp} initial="hidden" animate="visible">`
    : `      <div>`;
  const wrapClose = opts.withAnimation
    ? `      </motion.div>`
    : `      </div>`;

  return `import { useView, Fallback } from "@chuk/view-shared";
${animationImports}import type { ${opts.pascalName}Content } from "./schema";

export function ${opts.pascalName}View() {
  const { data, content, isConnected } =
    useView<${opts.pascalName}Content>("${opts.viewName}", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <${opts.pascalName}Renderer data={data} />;
}

export interface ${opts.pascalName}RendererProps {
  data: ${opts.pascalName}Content;
}

export function ${opts.pascalName}Renderer({ data }: ${opts.pascalName}RendererProps) {
  return (
    <div className="h-full flex items-center justify-center font-sans text-foreground bg-background p-4">
${wrapOpen}
        <div className="text-center">
          <h1 className="text-2xl font-bold">{data.title ?? "${opts.pascalName}"}</h1>
          <p className="mt-2 text-muted-foreground">
            TODO: Build your ${opts.viewName} View here
          </p>
        </div>
${wrapClose}
    </div>
  );
}
`;
}

export function inputJson(opts: TemplateOpts): string {
  return JSON.stringify({
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["type", "version"],
    properties: {
      type: { const: opts.viewName },
      version: { const: "1.0" },
      title: { type: "string" },
    },
  }, null, 2) + "\n";
}

export function schemaTestTs(opts: TemplateOpts): string {
  return `import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("${opts.viewName} schema validation", () => {
  it("accepts minimal valid ${opts.viewName}", () => {
    const data = {
      type: "${opts.viewName}",
      version: "1.0",
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "wrong",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });
});
`;
}

export function zodTestTs(opts: TemplateOpts): string {
  return `import { describe, it, expect } from "vitest";
import { ${opts.camelName}Schema } from "./zod";

describe("${opts.viewName} zod schema validation", () => {
  it("accepts minimal valid ${opts.viewName}", () => {
    const data = {
      type: "${opts.viewName}",
      version: "1.0",
    };
    expect(${opts.camelName}Schema.safeParse(data).success).toBe(true);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "wrong",
      version: "1.0",
    };
    expect(${opts.camelName}Schema.safeParse(data).success).toBe(false);
  });
});
`;
}

export function storiesTsx(opts: TemplateOpts): string {
  return `import type { Meta, StoryObj } from "@storybook/react";
import { ${opts.pascalName}Renderer } from "./App";
import type { ${opts.pascalName}Content } from "./schema";

const meta = {
  title: "Views/${opts.pascalName}",
  component: ${opts.pascalName}Renderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof ${opts.pascalName}Renderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: {
      type: "${opts.viewName}",
      version: "1.0",
      title: "Sample ${opts.pascalName}",
    } satisfies ${opts.pascalName}Content,
  },
};
`;
}

export function componentMd(opts: TemplateOpts): string {
  return `# Component Spec: @chuk/view-${opts.viewName}

## 1. Identity

| Field       | Value                          |
|-------------|--------------------------------|
| Name        | \`@chuk/view-${opts.viewName}\` |
| Type        | \`${opts.viewName}\`           |
| Version     | \`1.0\`                        |
| Description | TODO: Add description          |

---

## 2. Dependencies

| Kind     | Dependency                       | Version        |
|----------|----------------------------------|----------------|
| Runtime  | React                            | \`^18.3.0\`    |
| Runtime  | react-dom                        | \`^18.3.0\`    |
| Runtime  | \`@chuk/view-shared\`            | \`workspace:*\` |
| Runtime  | \`@chuk/view-ui\`                | \`workspace:*\` |
| Runtime  | \`@modelcontextprotocol/ext-apps\` | \`^1.0.0\`   |
| Build    | vite                             | \`^6.0.0\`     |
| Build    | vite-plugin-singlefile           | \`^2.0.0\`     |

---

## 3. Schema

\`\`\`typescript
interface ${opts.pascalName}Content {
  type: "${opts.viewName}";
  version: "1.0";
  title?: string;
  // TODO: Define your schema
}
\`\`\`

---

## 4. Rendering

TODO: Document rendering behavior.

---

## 5. Test Cases

- Accepts valid ${opts.pascalName}Content
- Rejects wrong type
- Rejects missing required fields

---

## 6. Storybook

Story file: \`src/${opts.pascalName}.stories.tsx\`

| Story   | Description          |
|---------|----------------------|
| Default | Minimal valid data   |
`;
}
