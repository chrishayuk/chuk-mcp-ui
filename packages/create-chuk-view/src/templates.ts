export type Template = "blank" | "list" | "detail" | "wizard";

export const TEMPLATES: Template[] = ["blank", "list", "detail", "wizard"];

interface TemplateOpts {
  viewName: string;
  pascalName: string;
  camelName: string;
  withAnimation: boolean;
  template: Template;
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

const rootEl = document.getElementById("root")!;

if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootEl,
    <StrictMode>
      <${opts.pascalName}View />
    </StrictMode>
  );
} else {
  ReactDOM.createRoot(rootEl).render(
    <StrictMode>
      <${opts.pascalName}View />
    </StrictMode>
  );
}
`;
}

export function schemaTs(opts: TemplateOpts): string {
  if (opts.template === "list") return schemaTsList(opts);
  if (opts.template === "detail") return schemaTsDetail(opts);
  if (opts.template === "wizard") return schemaTsWizard(opts);
  return `export interface ${opts.pascalName}Content {
  type: "${opts.viewName}";
  version: "1.0";
  title?: string;
  // TODO: Add your schema fields here
}
`;
}

function schemaTsList(opts: TemplateOpts): string {
  return `export interface ${opts.pascalName}Item {
  id: string;
  label: string;
  description?: string;
  status?: "active" | "inactive" | "pending";
}

export interface ${opts.pascalName}Content {
  type: "${opts.viewName}";
  version: "1.0";
  title?: string;
  items: ${opts.pascalName}Item[];
  columns?: Array<{ key: keyof ${opts.pascalName}Item; label: string }>;
}
`;
}

function schemaTsDetail(opts: TemplateOpts): string {
  return `export interface ${opts.pascalName}Field {
  label: string;
  value: string | number | boolean;
  type?: "text" | "number" | "badge" | "link";
}

export interface ${opts.pascalName}Section {
  title: string;
  fields: ${opts.pascalName}Field[];
}

export interface ${opts.pascalName}Content {
  type: "${opts.viewName}";
  version: "1.0";
  title: string;
  subtitle?: string;
  sections: ${opts.pascalName}Section[];
  actions?: Array<{ label: string; action: string; variant?: "default" | "destructive" }>;
}
`;
}

function schemaTsWizard(opts: TemplateOpts): string {
  return `export interface ${opts.pascalName}StepField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox";
  required?: boolean;
  options?: string[];
}

export interface ${opts.pascalName}Step {
  id: string;
  title: string;
  description?: string;
  fields: ${opts.pascalName}StepField[];
}

export interface ${opts.pascalName}Content {
  type: "${opts.viewName}";
  version: "1.0";
  title?: string;
  steps: ${opts.pascalName}Step[];
}
`;
}

export function zodTs(opts: TemplateOpts): string {
  if (opts.template === "list") return zodTsList(opts);
  if (opts.template === "detail") return zodTsDetail(opts);
  if (opts.template === "wizard") return zodTsWizard(opts);
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

function zodTsList(opts: TemplateOpts): string {
  return `import { z } from "zod";

const itemSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
});

export const ${opts.camelName}Schema = z.object({
  type: z.literal("${opts.viewName}"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  items: z.array(itemSchema),
  columns: z.array(z.object({ key: z.string(), label: z.string() })).optional(),
});

export type ${opts.pascalName}Content = z.infer<typeof ${opts.camelName}Schema>;
`;
}

function zodTsDetail(opts: TemplateOpts): string {
  return `import { z } from "zod";

const fieldSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  type: z.enum(["text", "number", "badge", "link"]).optional(),
});

const sectionSchema = z.object({
  title: z.string(),
  fields: z.array(fieldSchema),
});

export const ${opts.camelName}Schema = z.object({
  type: z.literal("${opts.viewName}"),
  version: z.literal("1.0"),
  title: z.string(),
  subtitle: z.string().optional(),
  sections: z.array(sectionSchema),
  actions: z.array(z.object({
    label: z.string(),
    action: z.string(),
    variant: z.enum(["default", "destructive"]).optional(),
  })).optional(),
});

export type ${opts.pascalName}Content = z.infer<typeof ${opts.camelName}Schema>;
`;
}

function zodTsWizard(opts: TemplateOpts): string {
  return `import { z } from "zod";

const stepFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(["text", "number", "select", "checkbox"]),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
});

const stepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(stepFieldSchema),
});

export const ${opts.camelName}Schema = z.object({
  type: z.literal("${opts.viewName}"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  steps: z.array(stepSchema),
});

export type ${opts.pascalName}Content = z.infer<typeof ${opts.camelName}Schema>;
`;
}

export function appTsx(opts: TemplateOpts): string {
  if (opts.template === "list") return appTsxList(opts);
  if (opts.template === "detail") return appTsxDetail(opts);
  if (opts.template === "wizard") return appTsxWizard(opts);
  return appTsxBlank(opts);
}

function appTsxBlank(opts: TemplateOpts): string {
  return `import { useView, Fallback } from "@chuk/view-shared";
import type { ${opts.pascalName}Content } from "./schema";

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
      <div className="text-center">
        <h1 className="text-2xl font-bold">{data.title ?? "${opts.pascalName}"}</h1>
        <p className="mt-2 text-muted-foreground">
          TODO: Build your ${opts.viewName} View here
        </p>
      </div>
    </div>
  );
}
`;
}

function appTsxList(opts: TemplateOpts): string {
  return `import { useState } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import type { ${opts.pascalName}Content, ${opts.pascalName}Item } from "./schema";

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
  const [selected, setSelected] = useState<string | null>(null);
  const columns = data.columns ?? [
    { key: "label" as const, label: "Name" },
    { key: "status" as const, label: "Status" },
  ];

  const statusColor = (status?: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50";
      case "inactive": return "text-red-600 bg-red-50";
      case "pending": return "text-amber-600 bg-amber-50";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      {data.title && (
        <div className="px-4 py-3 border-b border-border">
          <h1 className="text-lg font-semibold">{data.title}</h1>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2 text-left font-medium text-muted-foreground">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr
                key={item.id}
                onClick={() => setSelected(item.id === selected ? null : item.id)}
                className={\`border-b border-border cursor-pointer transition-colors \${
                  item.id === selected ? "bg-primary/5" : "hover:bg-muted/50"
                }\`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5">
                    {col.key === "status" ? (
                      <span className={\`px-2 py-0.5 rounded text-xs font-medium \${statusColor(item.status)}\`}>
                        {item[col.key] ?? "—"}
                      </span>
                    ) : (
                      <span>{String(item[col.key] ?? "—")}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.items.length === 0 && (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            No items to display.
          </div>
        )}
      </div>
    </div>
  );
}
`;
}

function appTsxDetail(opts: TemplateOpts): string {
  return `import { useView, Fallback } from "@chuk/view-shared";
import type { ${opts.pascalName}Content } from "./schema";

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
    <div className="h-full flex flex-col font-sans text-foreground bg-background overflow-auto">
      <div className="px-6 py-4 border-b border-border">
        <h1 className="text-xl font-bold">{data.title}</h1>
        {data.subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{data.subtitle}</p>
        )}
      </div>

      <div className="flex-1 p-6 space-y-6">
        {data.sections.map((section, i) => (
          <div key={i} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h2>
            <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {section.fields.map((field, j) => (
                <div key={j} className="contents">
                  <span className="text-muted-foreground">{field.label}</span>
                  {field.type === "badge" ? (
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary w-fit">
                      {String(field.value)}
                    </span>
                  ) : field.type === "link" ? (
                    <a href={String(field.value)} className="text-primary hover:underline">
                      {String(field.value)}
                    </a>
                  ) : (
                    <span className="text-foreground">{String(field.value)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {data.actions && data.actions.length > 0 && (
        <div className="px-6 py-4 border-t border-border flex gap-2">
          {data.actions.map((action, i) => (
            <button
              key={i}
              className={\`px-4 py-2 text-sm rounded font-medium transition-colors \${
                action.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }\`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
`;
}

function appTsxWizard(opts: TemplateOpts): string {
  return `import { useState } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import type { ${opts.pascalName}Content } from "./schema";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const step = data.steps[currentStep];
  const isLast = currentStep === data.steps.length - 1;
  const isFirst = currentStep === 0;

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      {data.title && (
        <div className="px-6 py-4 border-b border-border">
          <h1 className="text-lg font-semibold">{data.title}</h1>
        </div>
      )}

      {/* Step indicators */}
      <div className="px-6 py-3 border-b border-border flex gap-2">
        {data.steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={\`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium \${
              i === currentStep
                ? "bg-primary text-primary-foreground"
                : i < currentStep
                ? "bg-green-100 text-green-700"
                : "bg-muted text-muted-foreground"
            }\`}>
              {i < currentStep ? "\\u2713" : i + 1}
            </div>
            <span className={\`text-sm \${i === currentStep ? "font-medium" : "text-muted-foreground"}\`}>
              {s.title}
            </span>
            {i < data.steps.length - 1 && (
              <div className="w-8 h-px bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 p-6 overflow-auto">
        {step.description && (
          <p className="mb-4 text-sm text-muted-foreground">{step.description}</p>
        )}
        <div className="space-y-4 max-w-md">
          {step.fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  value={formData[field.name] ?? ""}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={formData[field.name] === "true"}
                  onChange={(e) => updateField(field.name, String(e.target.checked))}
                  className="h-4 w-4"
                />
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-border flex justify-between">
        <button
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={isFirst}
          className="px-4 py-2 text-sm rounded border border-border disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={() => isLast ? null : setCurrentStep((s) => s + 1)}
          className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground font-medium"
        >
          {isLast ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}
`;
}

export function inputJson(opts: TemplateOpts): string {
  if (opts.template === "list") return inputJsonList(opts);
  if (opts.template === "detail") return inputJsonDetail(opts);
  if (opts.template === "wizard") return inputJsonWizard(opts);
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

function inputJsonList(opts: TemplateOpts): string {
  return JSON.stringify({
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["type", "version", "items"],
    properties: {
      type: { const: opts.viewName },
      version: { const: "1.0" },
      title: { type: "string" },
      items: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "label"],
          properties: {
            id: { type: "string" },
            label: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["active", "inactive", "pending"] },
          },
        },
      },
    },
  }, null, 2) + "\n";
}

function inputJsonDetail(opts: TemplateOpts): string {
  return JSON.stringify({
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["type", "version", "title", "sections"],
    properties: {
      type: { const: opts.viewName },
      version: { const: "1.0" },
      title: { type: "string" },
      subtitle: { type: "string" },
      sections: {
        type: "array",
        items: {
          type: "object",
          required: ["title", "fields"],
          properties: {
            title: { type: "string" },
            fields: {
              type: "array",
              items: {
                type: "object",
                required: ["label", "value"],
                properties: {
                  label: { type: "string" },
                  value: {},
                  type: { type: "string", enum: ["text", "number", "badge", "link"] },
                },
              },
            },
          },
        },
      },
    },
  }, null, 2) + "\n";
}

function inputJsonWizard(opts: TemplateOpts): string {
  return JSON.stringify({
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["type", "version", "steps"],
    properties: {
      type: { const: opts.viewName },
      version: { const: "1.0" },
      title: { type: "string" },
      steps: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "title", "fields"],
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            fields: {
              type: "array",
              items: {
                type: "object",
                required: ["name", "label", "type"],
                properties: {
                  name: { type: "string" },
                  label: { type: "string" },
                  type: { type: "string", enum: ["text", "number", "select", "checkbox"] },
                  required: { type: "boolean" },
                  options: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
      },
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

export function ssrEntryTsx(opts: TemplateOpts): string {
  return `import { renderToString } from "react-dom/server";
import { ${opts.pascalName}Renderer } from "./App";
import type { ${opts.pascalName}Content } from "./schema";

export function render(data: ${opts.pascalName}Content): string {
  return renderToString(<${opts.pascalName}Renderer data={data} />);
}
`;
}

export function viteConfigSsr(): string {
  return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  ssr: {
    noExternal: true,
  },
  build: {
    ssr: true,
    outDir: "dist-ssr",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/ssr-entry.tsx",
    },
  },
});
`;
}

export function gitignore(): string {
  return `node_modules/
dist/
dist-ssr/
dist-client/
.turbo/
*.tsbuildinfo
*.local
.DS_Store
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
