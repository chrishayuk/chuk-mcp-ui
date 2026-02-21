import { useState, useEffect, useMemo, useCallback } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Button, ScrollArea, cn } from "@chuk/view-ui";
import { highlight } from "./highlighter";
import type { CodeContent } from "./schema";

export function CodeView() {
  const { data, content, isConnected } =
    useView<CodeContent>("code", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <CodeRenderer data={data} />;
}

export interface CodeRendererProps {
  data: CodeContent;
}

export function CodeRenderer({ data }: CodeRendererProps) {
  const { code, language, title, lineNumbers = false, highlightLines } = data;
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = isDark ? "github-dark" : "github-light";

    highlight(code, language ?? "text", theme)
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });

    return () => {
      cancelled = true;
    };
  }, [code, language, highlightLines]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [code]);

  const lineCount = useMemo(() => code.split("\n").length, [code]);

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      {/* Header */}
      {(title || true) && (
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            {title && <span className="text-sm font-semibold">{title}</span>}
            {language && (
              <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                {language}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}

      {/* Code Content */}
      <ScrollArea className="flex-1">
        <div className="relative">
          {lineNumbers && (
            <div className="absolute left-0 top-0 py-4 pl-4 pr-2 text-right select-none text-xs text-muted-foreground font-mono leading-relaxed">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <div className={cn(lineNumbers && "pl-14")}>
            {html ? (
              <div
                className="code-output text-sm [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:m-0 [&_code]:font-mono [&_.highlighted-line]:bg-primary/10"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <pre className="p-4 m-0 text-sm font-mono overflow-auto whitespace-pre">
                <code>{code}</code>
              </pre>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
