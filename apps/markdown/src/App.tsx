import { useMemo } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import { marked } from "marked";
import { useView } from "@chuk/view-shared";
import type { MarkdownContent } from "./schema";

// Configure marked: links open in new tab
const renderer = new marked.Renderer();
const origLink = renderer.link.bind(renderer);
renderer.link = function (token) {
  const html = origLink(token);
  return html.replace("<a ", '<a target="_blank" rel="noopener noreferrer" ');
};

marked.setOptions({ renderer, breaks: true });

export function MarkdownView() {
  const { data } =
    useView<MarkdownContent>("markdown", "1.0");

  if (!data) return null;

  return <MarkdownRenderer data={data} />;
}

export function MarkdownRenderer({ data }: { data: MarkdownContent }) {
  const html = useMemo(
    () => marked.parse(data.content) as string,
    [data.content]
  );

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="h-full overflow-auto font-sans text-foreground bg-background"
    >
      {data.title && (
        <div className="px-3 py-2 text-[15px] font-semibold border-b">
          {data.title}
        </div>
      )}
      <style>{markdownStyles}</style>
      <div
        className="md-body px-6 py-4 max-w-[800px]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </motion.div>
  );
}

const markdownStyles = `
.md-body h1, .md-body h2, .md-body h3, .md-body h4 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: var(--color-foreground);
}
.md-body h1 {
  font-size: 1.8em;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.3em;
}
.md-body h2 {
  font-size: 1.4em;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.3em;
}
.md-body h3 { font-size: 1.2em; }
.md-body h4 { font-size: 1.05em; }
.md-body p { margin: 0.8em 0; line-height: 1.6; }
.md-body code {
  background: var(--color-surface);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.9em;
}
.md-body pre {
  background: var(--color-surface);
  padding: 16px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  border: 1px solid var(--color-border);
}
.md-body pre code {
  background: none;
  padding: 0;
}
.md-body blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid var(--color-primary);
  background: var(--color-surface);
}
.md-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}
.md-body th, .md-body td {
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  text-align: left;
}
.md-body th {
  background: var(--color-surface);
  font-weight: 600;
}
.md-body img {
  max-width: 100%;
  border-radius: var(--radius-md);
}
.md-body a {
  color: var(--color-primary);
}
.md-body ul, .md-body ol {
  padding-left: 2em;
}
.md-body li {
  margin: 0.3em 0;
}
.md-body hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 2em 0;
}
`;
