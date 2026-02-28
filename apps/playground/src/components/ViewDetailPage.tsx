import { useState, useEffect, useRef, useCallback } from "react";
import { Badge, Tabs, TabsList, TabsTrigger, TabsContent } from "@chuk/view-ui";
import { samples, type ViewType } from "../samples";
import type { ViewEntry } from "../catalogue-registry";
import { PreviewPane } from "./PreviewPane";
import { DataTab } from "./DataTab";
import { SchemaTab } from "./SchemaTab";
import { SnippetTab } from "./SnippetTab";
import { MetadataTab } from "./MetadataTab";

interface ViewDetailPageProps {
  entry: ViewEntry;
  theme?: "light" | "dark";
}

export function ViewDetailPage({ entry, theme = "light" }: ViewDetailPageProps) {
  const viewType = entry.name as ViewType;
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(samples[viewType] ?? {}, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<object | null>(
    samples[viewType] ?? null,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Reset when view changes
  useEffect(() => {
    const sample = samples[viewType] ?? {};
    const text = JSON.stringify(sample, null, 2);
    setJsonText(text);
    setJsonError(null);
    setParsedData(sample);
  }, [viewType]);

  // Debounced JSON parsing — on error, keep last valid data for preview
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonText);
        setJsonError(null);
        setParsedData(parsed);
      } catch (e) {
        setJsonError(e instanceof Error ? e.message : "Invalid JSON");
        // Keep last valid parsedData so the preview doesn't go blank
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [jsonText]);

  const handleJsonChange = useCallback((text: string) => {
    setJsonText(text);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar: view info */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-muted/30 shrink-0">
        <span className="font-semibold text-foreground">{entry.displayName}</span>
        <Badge variant="secondary" className="text-[10px]">
          {entry.category}
        </Badge>
        <Badge
          variant={entry.ssr ? "default" : "outline"}
          className="text-[10px]"
        >
          {entry.ssr ? "SSR" : "Client"}
        </Badge>
        <span className="text-xs text-muted-foreground ml-2">
          {entry.description}
        </span>
      </div>

      {/* Main content: preview + tabs */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Preview */}
        <div className="w-1/2 flex flex-col border-r border-border">
          <PreviewPane viewType={entry.name} data={parsedData} theme={theme} />
        </div>

        {/* Right: Tabs */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <Tabs defaultValue="data" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-3 mt-2 shrink-0">
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="snippets">Snippets</TabsTrigger>
              <TabsTrigger value="meta">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="flex-1 overflow-hidden">
              <DataTab
                viewType={viewType}
                jsonText={jsonText}
                jsonError={jsonError}
                onChange={handleJsonChange}
              />
            </TabsContent>

            <TabsContent value="schema" className="flex-1 overflow-hidden">
              <SchemaTab viewType={entry.name} />
            </TabsContent>

            <TabsContent value="snippets" className="flex-1 overflow-hidden">
              <SnippetTab viewType={entry.name} data={parsedData} />
            </TabsContent>

            <TabsContent value="meta" className="flex-1 overflow-hidden">
              <MetadataTab entry={entry} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
