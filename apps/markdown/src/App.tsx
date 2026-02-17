import { useMemo } from "react";
import { marked } from "marked";
import { useView, Fallback, CSS_VARS } from "@chuk/view-shared";
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
  const { data, content, isConnected } =
    useView<MarkdownContent>("markdown", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <MarkdownRenderer data={data} />;
}

function MarkdownRenderer({ data }: { data: MarkdownContent }) {
  const html = useMemo(
    () => marked.parse(data.content) as string,
    [data.content]
  );

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        fontFamily: `var(${CSS_VARS.fontFamily})`,
        color: `var(${CSS_VARS.colorText})`,
        backgroundColor: `var(${CSS_VARS.colorBackground})`,
      }}
    >
      {data.title && (
        <div
          style={{
            padding: "8px 12px",
            fontSize: "15px",
            fontWeight: 600,
            borderBottom: `1px solid var(${CSS_VARS.colorBorder})`,
          }}
        >
          {data.title}
        </div>
      )}
      <style>{markdownStyles}</style>
      <div
        className="md-body"
        style={{ padding: "16px 24px", maxWidth: "800px" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

const markdownStyles = `
.md-body h1, .md-body h2, .md-body h3, .md-body h4 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: var(${CSS_VARS.colorText});
}
.md-body h1 {
  font-size: 1.8em;
  border-bottom: 1px solid var(${CSS_VARS.colorBorder});
  padding-bottom: 0.3em;
}
.md-body h2 {
  font-size: 1.4em;
  border-bottom: 1px solid var(${CSS_VARS.colorBorder});
  padding-bottom: 0.3em;
}
.md-body h3 { font-size: 1.2em; }
.md-body h4 { font-size: 1.05em; }
.md-body p { margin: 0.8em 0; line-height: 1.6; }
.md-body code {
  background: var(${CSS_VARS.colorSurface});
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.9em;
}
.md-body pre {
  background: var(${CSS_VARS.colorSurface});
  padding: 16px;
  border-radius: var(${CSS_VARS.borderRadius});
  overflow-x: auto;
  border: 1px solid var(${CSS_VARS.colorBorder});
}
.md-body pre code {
  background: none;
  padding: 0;
}
.md-body blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid var(${CSS_VARS.colorPrimary});
  background: var(${CSS_VARS.colorSurface});
}
.md-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}
.md-body th, .md-body td {
  border: 1px solid var(${CSS_VARS.colorBorder});
  padding: 8px 12px;
  text-align: left;
}
.md-body th {
  background: var(${CSS_VARS.colorSurface});
  font-weight: 600;
}
.md-body img {
  max-width: 100%;
  border-radius: var(${CSS_VARS.borderRadius});
}
.md-body a {
  color: var(${CSS_VARS.colorPrimary});
}
.md-body ul, .md-body ol {
  padding-left: 2em;
}
.md-body li {
  margin: 0.3em 0;
}
.md-body hr {
  border: none;
  border-top: 1px solid var(${CSS_VARS.colorBorder});
  margin: 2em 0;
}
`;
