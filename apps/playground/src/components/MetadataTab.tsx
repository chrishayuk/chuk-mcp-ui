import { useState, useRef, useEffect } from "react";
import { Badge } from "@chuk/view-ui";
import type { ViewEntry } from "../catalogue-registry";
import { CDN_BASE } from "../config";

interface MetadataTabProps {
  entry: ViewEntry;
}

export function MetadataTab({ entry }: MetadataTabProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(label);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(null), 2000);
      },
      () => { /* clipboard blocked by permissions or insecure context */ },
    );
  };

  const cdnUrl = `${CDN_BASE}/${entry.name}/v1`;
  const ssrUrl = `${CDN_BASE}/${entry.name}/v1/ssr`;

  return (
    <div className="p-4 space-y-4 overflow-auto">
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
        <span className="text-muted-foreground">View</span>
        <span className="font-mono text-foreground">{entry.name}</span>

        <span className="text-muted-foreground">Category</span>
        <div>
          <Badge variant="secondary">{entry.category}</Badge>
        </div>

        <span className="text-muted-foreground">Phase</span>
        <span className="text-foreground">{entry.phase}</span>

        <span className="text-muted-foreground">SSR</span>
        <span className={entry.ssr ? "text-green-600" : "text-amber-500"}>
          {entry.ssr ? "Full SSR" : "Placeholder (browser-dependent)"}
        </span>

        <span className="text-muted-foreground">CDN URL</span>
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono break-all">
            {cdnUrl}
          </code>
          <button
            onClick={() => copyText(cdnUrl, "cdn")}
            className="text-xs text-primary hover:underline shrink-0"
            aria-label="Copy CDN URL"
          >
            {copied === "cdn" ? "Copied!" : "Copy"}
          </button>
        </div>

        <span className="text-muted-foreground">SSR URL</span>
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono break-all">
            {ssrUrl}
          </code>
          <button
            onClick={() => copyText(ssrUrl, "ssr")}
            className="text-xs text-primary hover:underline shrink-0"
            aria-label="Copy SSR URL"
          >
            {copied === "ssr" ? "Copied!" : "Copy"}
          </button>
        </div>

        <span className="text-muted-foreground">Tags</span>
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
