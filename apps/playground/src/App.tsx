import { useState, useEffect, useRef, useCallback } from "react";
import { samples, type ViewType } from "./samples";
import { Header } from "./components/Header";
import { ViewSelector } from "./components/ViewSelector";
import { JsonEditor } from "./components/JsonEditor";
import { PreviewPane } from "./components/PreviewPane";
import { CopyButton } from "./components/CopyButton";

export function App() {
  const [selectedView, setSelectedView] = useState<ViewType>("counter");
  const [jsonText, setJsonText] = useState(
    JSON.stringify(samples.counter, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<object | null>(samples.counter);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // When view type changes, load the sample payload
  const handleViewChange = useCallback((view: ViewType) => {
    setSelectedView(view);
    const sample = samples[view];
    const text = JSON.stringify(sample, null, 2);
    setJsonText(text);
    setJsonError(null);
    setParsedData(sample);
  }, []);

  // Debounced JSON parsing on text change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonText);
        setJsonError(null);
        setParsedData(parsed);
      } catch (e) {
        setJsonError(e instanceof Error ? e.message : "Invalid JSON");
        setParsedData(null);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [jsonText]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      <Header theme={theme} onThemeToggle={setTheme} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: View selector + JSON editor */}
        <div className="w-1/2 flex flex-col border-r border-border">
          <ViewSelector value={selectedView} onChange={handleViewChange} />
          <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border bg-muted/30">
            structuredContent
          </div>
          <JsonEditor
            value={jsonText}
            onChange={setJsonText}
            error={jsonError}
          />
        </div>

        {/* Right panel: Preview */}
        <div className="w-1/2 flex flex-col">
          <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-muted/30">
            <span className="text-sm text-muted-foreground">Preview</span>
            <CopyButton jsonText={jsonText} />
          </div>
          <PreviewPane viewType={selectedView} data={parsedData} />
        </div>
      </div>
    </div>
  );
}
