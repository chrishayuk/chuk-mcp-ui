import { useState, useMemo, useRef, useEffect } from "react";
import { generatePythonSnippet } from "../snippets/python-snippet";
import { generateChukMcpSnippet } from "../snippets/chuk-mcp-snippet";
import { generateTypeScriptSnippet } from "../snippets/typescript-snippet";
import { CDN_BASE } from "../config";

interface SnippetTabProps {
  viewType: string;
  data: object | null;
}

type Lang = "python" | "chuk-mcp" | "typescript" | "html";

const LABELS: Record<Lang, string> = {
  python: "FastMCP",
  "chuk-mcp": "ChukMCP",
  typescript: "TypeScript",
  html: "HTML Embed",
};

export function SnippetTab({ viewType, data }: SnippetTabProps) {
  const [lang, setLang] = useState<Lang>("python");
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const snippet = useMemo(() => {
    const d = data ?? {};
    switch (lang) {
      case "python":
        return generatePythonSnippet(viewType, d);
      case "chuk-mcp":
        return generateChukMcpSnippet(viewType, d);
      case "typescript":
        return generateTypeScriptSnippet(viewType, d);
      case "html": {
        const encoded = encodeURIComponent(JSON.stringify(d));
        return `<iframe
  src="${CDN_BASE}/${viewType}/v1#${encoded}"
  width="100%"
  height="400"
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
></iframe>`;
      }
    }
  }, [lang, viewType, data]);

  const copy = () => {
    navigator.clipboard.writeText(snippet).then(
      () => {
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      },
      () => { /* clipboard blocked by permissions or insecure context */ },
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2 bg-muted/30">
        {(["python", "chuk-mcp", "typescript", "html"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-2 py-1 text-xs rounded ${
              lang === l
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
            aria-label={`Show ${LABELS[l]} snippet`}
          >
            {LABELS[l]}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={copy}
          className="px-2 py-1 text-xs rounded border border-border bg-background text-foreground hover:bg-muted"
          aria-label="Copy snippet to clipboard"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
          {snippet}
        </pre>
      </div>
    </div>
  );
}
