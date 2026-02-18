import { useState, useMemo } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { ScrollArea, Input, Button } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { JsonContent } from "./schema";

export function JsonView() {
  const { data, content, isConnected } =
    useView<JsonContent>("json", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <JsonRenderer data={data} />;
}

export interface JsonRendererProps {
  data: JsonContent;
}

export function JsonRenderer({ data: viewData }: JsonRendererProps) {
  const { data, title, expandDepth = 1, searchable = false } = viewData;
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b gap-2">
        <div className="flex items-center gap-2">
          {title && <span className="text-sm font-semibold">{title}</span>}
        </div>
        <div className="flex items-center gap-2">
          {searchable && (
            <Input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 h-7 text-xs"
              aria-label="Search JSON"
            />
          )}
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setExpandAll(true)}>
            Expand All
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setExpandAll(false)}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="p-4 font-mono text-sm"
        >
          <JsonNode
            value={data}
            depth={0}
            expandDepth={expandDepth}
            expandAll={expandAll}
            search={search.toLowerCase()}
          />
        </motion.div>
      </ScrollArea>
    </div>
  );
}

interface JsonNodeProps {
  keyName?: string;
  value: unknown;
  depth: number;
  expandDepth: number;
  expandAll: boolean | null;
  search: string;
  isLast?: boolean;
}

function JsonNode({ keyName, value, depth, expandDepth, expandAll, search, isLast = true }: JsonNodeProps) {
  const defaultOpen = expandAll !== null ? expandAll : depth < expandDepth;
  const [open, setOpen] = useState(defaultOpen);

  // Sync with expandAll toggle
  useMemo(() => {
    if (expandAll !== null) setOpen(expandAll);
  }, [expandAll]);

  const comma = isLast ? "" : ",";

  if (value === null) {
    return (
      <div className="leading-relaxed">
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span className="text-muted-foreground italic">null</span>
        {comma}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="leading-relaxed">
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span className="text-amber-600 dark:text-amber-400">{String(value)}</span>
        {comma}
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="leading-relaxed">
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span className="text-blue-600 dark:text-blue-400">{value}</span>
        {comma}
      </div>
    );
  }

  if (typeof value === "string") {
    const display = search && value.toLowerCase().includes(search)
      ? highlightSearch(value, search)
      : `"${value}"`;
    return (
      <div className="leading-relaxed">
        {keyName !== undefined && <KeyLabel name={keyName} />}
        {typeof display === "string" ? (
          <span className="text-emerald-600 dark:text-emerald-400">{display}</span>
        ) : (
          <span className="text-emerald-600 dark:text-emerald-400">{display}</span>
        )}
        {comma}
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="leading-relaxed">
          {keyName !== undefined && <KeyLabel name={keyName} />}
          <span>{"[]"}</span>
          {comma}
        </div>
      );
    }

    return (
      <div className="leading-relaxed">
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span
          className="cursor-pointer select-none hover:text-primary"
          onClick={() => setOpen(!open)}
        >
          {open ? "[" : `[...] (${value.length})`}
        </span>
        {open && (
          <div className="pl-4 border-l border-border/50 ml-1">
            {value.map((item, i) => (
              <JsonNode
                key={i}
                value={item}
                depth={depth + 1}
                expandDepth={expandDepth}
                expandAll={expandAll}
                search={search}
                isLast={i === value.length - 1}
              />
            ))}
          </div>
        )}
        {open && <div>{"]"}{comma}</div>}
        {!open && ""}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return (
        <div className="leading-relaxed">
          {keyName !== undefined && <KeyLabel name={keyName} />}
          <span>{"{}"}</span>
          {comma}
        </div>
      );
    }

    return (
      <div className="leading-relaxed">
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span
          className="cursor-pointer select-none hover:text-primary"
          onClick={() => setOpen(!open)}
        >
          {open ? "{" : `{...} (${entries.length})`}
        </span>
        {open && (
          <div className="pl-4 border-l border-border/50 ml-1">
            {entries.map(([k, v], i) => (
              <JsonNode
                key={k}
                keyName={k}
                value={v}
                depth={depth + 1}
                expandDepth={expandDepth}
                expandAll={expandAll}
                search={search}
                isLast={i === entries.length - 1}
              />
            ))}
          </div>
        )}
        {open && <div>{"}"}{comma}</div>}
      </div>
    );
  }

  return (
    <div className="leading-relaxed">
      {keyName !== undefined && <KeyLabel name={keyName} />}
      <span>{String(value)}</span>
      {comma}
    </div>
  );
}

function KeyLabel({ name }: { name: string }) {
  return (
    <span className="text-purple-600 dark:text-purple-400">
      "{name}"<span className="text-foreground">: </span>
    </span>
  );
}

function highlightSearch(value: string, search: string): React.ReactNode {
  const lower = value.toLowerCase();
  const idx = lower.indexOf(search);
  if (idx === -1) return `"${value}"`;

  return (
    <>
      "{value.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
        {value.slice(idx, idx + search.length)}
      </mark>
      {value.slice(idx + search.length)}"
    </>
  );
}
