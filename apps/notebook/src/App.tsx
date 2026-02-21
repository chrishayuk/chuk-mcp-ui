import { useMemo, useState } from "react";
import { marked } from "marked";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent, ScrollArea, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { listContainer, listItem, fadeIn } from "@chuk/view-ui/animations";
import type {
  NotebookContent,
  NotebookCell,
  MarkdownCell,
  CodeCell,
  TableCell,
  ImageCell,
  CounterCell,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  Marked configuration                                               */
/* ------------------------------------------------------------------ */

const renderer = new marked.Renderer();
const origLink = renderer.link.bind(renderer);
renderer.link = function (token) {
  const html = origLink(token);
  return html.replace("<a ", '<a target="_blank" rel="noopener noreferrer" ');
};

marked.setOptions({ renderer, breaks: true });

/* ------------------------------------------------------------------ */
/*  Cell type accent colors                                            */
/* ------------------------------------------------------------------ */

const CELL_ACCENT: Record<string, string> = {
  markdown: "border-l-blue-500",
  code: "border-l-emerald-500",
  table: "border-l-amber-500",
  image: "border-l-purple-500",
  counter: "border-l-rose-500",
};

const CELL_LABEL: Record<string, string> = {
  markdown: "Markdown",
  code: "Code",
  table: "Table",
  image: "Image",
  counter: "Counter",
};

/* ------------------------------------------------------------------ */
/*  Chevron icon                                                       */
/* ------------------------------------------------------------------ */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cn(
        "transition-transform duration-200",
        open ? "rotate-90" : "rotate-0"
      )}
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Cell wrapper                                                       */
/* ------------------------------------------------------------------ */

function CellWrapper({
  cell,
  children,
}: {
  cell: NotebookCell;
  children: React.ReactNode;
}) {
  const hasCollapse = cell.collapsed !== undefined;
  const [open, setOpen] = useState(!cell.collapsed);

  return (
    <motion.div variants={listItem}>
      <Card
        className={cn(
          "border-l-4 overflow-hidden",
          CELL_ACCENT[cell.cellType] ?? "border-l-gray-400"
        )}
      >
        {hasCollapse && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 w-full px-4 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <ChevronIcon open={open} />
            <span>{CELL_LABEL[cell.cellType] ?? cell.cellType}</span>
          </button>
        )}
        {(!hasCollapse || open) && <CardContent className="p-4">{children}</CardContent>}
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cell renderers                                                     */
/* ------------------------------------------------------------------ */

function MarkdownCellRenderer({ cell }: { cell: MarkdownCell }) {
  const html = useMemo(
    () => marked.parse(cell.source) as string,
    [cell.source]
  );

  return (
    <CellWrapper cell={cell}>
      <style>{markdownStyles}</style>
      <div
        className="nb-md-body max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </CellWrapper>
  );
}

function CodeCellRenderer({ cell }: { cell: CodeCell }) {
  return (
    <CellWrapper cell={cell}>
      <div className="relative">
        {cell.language && (
          <span className="absolute top-2 right-2 text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {cell.language}
          </span>
        )}
        <pre className="bg-zinc-950 dark:bg-zinc-900 text-zinc-100 rounded-md p-4 text-sm font-mono overflow-x-auto">
          <code>{cell.source}</code>
        </pre>
      </div>
      {cell.output && (
        <div className="mt-2">
          <div className="text-[10px] font-mono text-muted-foreground mb-1">
            Output
          </div>
          <pre className="bg-muted rounded-md p-3 text-sm font-mono overflow-x-auto text-foreground">
            <code>{cell.output}</code>
          </pre>
        </div>
      )}
    </CellWrapper>
  );
}

function TableCellRenderer({ cell }: { cell: TableCell }) {
  return (
    <CellWrapper cell={cell}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {cell.columns.map((col, i) => (
                <th
                  key={i}
                  className="text-left px-3 py-2 font-semibold border-b-2 border-border bg-muted/50"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cell.rows.map((row, ri) => (
              <tr
                key={ri}
                className={cn(
                  ri % 2 === 1 && "bg-muted/30"
                )}
              >
                {row.map((val, ci) => (
                  <td key={ci} className="px-3 py-2 border-b border-border">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {cell.caption && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {cell.caption}
        </div>
      )}
    </CellWrapper>
  );
}

function ImageCellRenderer({ cell }: { cell: ImageCell }) {
  return (
    <CellWrapper cell={cell}>
      <div className="flex flex-col items-center gap-2">
        <img
          src={cell.url}
          alt={cell.alt ?? ""}
          className="max-w-full rounded-md"
        />
        {cell.caption && (
          <div className="text-xs text-muted-foreground text-center">
            {cell.caption}
          </div>
        )}
      </div>
    </CellWrapper>
  );
}

function CounterCellRenderer({ cell }: { cell: CounterCell }) {
  const formatted = typeof cell.value === "number"
    ? cell.value.toLocaleString()
    : String(cell.value);

  return (
    <CellWrapper cell={cell}>
      <div className="flex flex-col items-center py-4">
        <div className="text-4xl font-bold tracking-tight text-foreground">
          {formatted}
        </div>
        {cell.label && (
          <div className="mt-1 text-sm text-muted-foreground">{cell.label}</div>
        )}
      </div>
    </CellWrapper>
  );
}

/* ------------------------------------------------------------------ */
/*  Cell dispatch                                                      */
/* ------------------------------------------------------------------ */

function CellRenderer({ cell }: { cell: NotebookCell }) {
  switch (cell.cellType) {
    case "markdown":
      return <MarkdownCellRenderer cell={cell} />;
    case "code":
      return <CodeCellRenderer cell={cell} />;
    case "table":
      return <TableCellRenderer cell={cell} />;
    case "image":
      return <ImageCellRenderer cell={cell} />;
    case "counter":
      return <CounterCellRenderer cell={cell} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  MCP-wired view                                                     */
/* ------------------------------------------------------------------ */

export function NotebookView() {
  const { data, content, isConnected } =
    useView<NotebookContent>("notebook", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <NotebookRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Pure renderer                                                      */
/* ------------------------------------------------------------------ */

export interface NotebookRendererProps {
  data: NotebookContent;
}

export function NotebookRenderer({ data }: NotebookRendererProps) {
  return (
    <div className="h-full font-sans text-foreground bg-background">
      <ScrollArea className="h-full">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="max-w-[900px] mx-auto px-4 py-6"
        >
          {data.title && (
            <h1 className="text-2xl font-bold tracking-tight mb-6">
              {data.title}
            </h1>
          )}
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4"
          >
            {data.cells.map((cell, i) => (
              <CellRenderer key={i} cell={cell} />
            ))}
          </motion.div>
        </motion.div>
      </ScrollArea>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Markdown styles                                                    */
/* ------------------------------------------------------------------ */

const markdownStyles = `
.nb-md-body h1, .nb-md-body h2, .nb-md-body h3, .nb-md-body h4 {
  margin-top: 1.2em;
  margin-bottom: 0.4em;
  color: var(--color-foreground);
}
.nb-md-body h1 {
  font-size: 1.6em;
  font-weight: 700;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.3em;
}
.nb-md-body h2 {
  font-size: 1.3em;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.2em;
}
.nb-md-body h3 { font-size: 1.15em; font-weight: 600; }
.nb-md-body h4 { font-size: 1.05em; font-weight: 600; }
.nb-md-body p { margin: 0.6em 0; line-height: 1.65; }
.nb-md-body strong { font-weight: 700; }
.nb-md-body em { font-style: italic; }
.nb-md-body code {
  background: var(--color-surface);
  padding: 2px 5px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.88em;
}
.nb-md-body pre {
  background: var(--color-surface);
  padding: 14px;
  border-radius: 6px;
  overflow-x: auto;
  border: 1px solid var(--color-border);
}
.nb-md-body pre code {
  background: none;
  padding: 0;
}
.nb-md-body blockquote {
  margin: 0.8em 0;
  padding: 0.4em 1em;
  border-left: 4px solid var(--color-primary);
  background: var(--color-surface);
}
.nb-md-body ul, .nb-md-body ol {
  padding-left: 1.8em;
  margin: 0.5em 0;
}
.nb-md-body li { margin: 0.25em 0; line-height: 1.6; }
.nb-md-body a { color: var(--color-primary); }
.nb-md-body img { max-width: 100%; border-radius: 6px; }
.nb-md-body hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1.5em 0;
}
.nb-md-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.8em 0;
}
.nb-md-body th, .nb-md-body td {
  border: 1px solid var(--color-border);
  padding: 6px 10px;
  text-align: left;
}
.nb-md-body th {
  background: var(--color-surface);
  font-weight: 600;
}
`;
