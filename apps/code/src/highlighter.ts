import { createHighlighterCore } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";

type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>;

let highlighter: Highlighter | null = null;
let initPromise: Promise<Highlighter> | null = null;

// Core languages bundled at build time (covers ~90% of MCP tool output).
// tsx/jsx are supersets of typescript/javascript so we only need those.
const CORE_LANGS = [
  import("@shikijs/langs/tsx"),
  import("@shikijs/langs/python"),
  import("@shikijs/langs/json"),
  import("@shikijs/langs/html"),
  import("@shikijs/langs/css"),
  import("@shikijs/langs/shellscript"),
  import("@shikijs/langs/sql"),
  import("@shikijs/langs/yaml"),
  import("@shikijs/langs/markdown"),
];

function getHighlighter(): Promise<Highlighter> {
  if (highlighter) return Promise.resolve(highlighter);
  if (initPromise) return initPromise;

  initPromise = createHighlighterCore({
    themes: [
      import("@shikijs/themes/github-dark"),
      import("@shikijs/themes/github-light"),
    ],
    langs: CORE_LANGS,
    engine: createJavaScriptRegexEngine(),
  }).then((h) => {
    highlighter = h;
    return h;
  });

  return initPromise;
}

// Maps language aliases and related names to the bundled grammar.
const LANG_ALIASES: Record<string, string> = {
  js: "tsx",
  javascript: "tsx",
  jsx: "tsx",
  ts: "tsx",
  typescript: "tsx",
  tsx: "tsx",
  py: "python",
  python: "python",
  bash: "shellscript",
  sh: "shellscript",
  shell: "shellscript",
  zsh: "shellscript",
  xml: "html",
  htm: "html",
  yml: "yaml",
  md: "markdown",
};

export async function highlight(
  code: string,
  lang: string,
  theme: "github-dark" | "github-light",
): Promise<string> {
  const h = await getHighlighter();
  const resolved = LANG_ALIASES[lang] ?? lang;
  const loaded = h.getLoadedLanguages();
  const safeLang = loaded.includes(resolved) ? resolved : "plaintext";
  return h.codeToHtml(code, { lang: safeLang, theme });
}
