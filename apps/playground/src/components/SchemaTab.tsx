import { useState } from "react";
import { schemas } from "../data/schemas";
import { typeSources } from "../data/type-sources";

interface SchemaTabProps {
  viewType: string;
}

export function SchemaTab({ viewType }: SchemaTabProps) {
  const [mode, setMode] = useState<"json" | "typescript">("json");
  const schema = schemas[viewType];
  const typeSource = typeSources[viewType];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2 bg-muted/30">
        <button
          onClick={() => setMode("json")}
          className={`px-2 py-1 text-xs rounded ${
            mode === "json"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          JSON Schema
        </button>
        <button
          onClick={() => setMode("typescript")}
          className={`px-2 py-1 text-xs rounded ${
            mode === "typescript"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          TypeScript
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {mode === "json" && schema && (
          <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
            {JSON.stringify(schema, null, 2)}
          </pre>
        )}
        {mode === "json" && !schema && (
          <p className="text-sm text-muted-foreground">No JSON Schema available.</p>
        )}
        {mode === "typescript" && typeSource && (
          <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
            {typeSource}
          </pre>
        )}
        {mode === "typescript" && !typeSource && (
          <p className="text-sm text-muted-foreground">No TypeScript source available.</p>
        )}
      </div>
    </div>
  );
}
