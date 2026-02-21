import { createHighlighterCore } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";

type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>;

let highlighter: Highlighter | null = null;
let initPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (highlighter) return Promise.resolve(highlighter);
  if (initPromise) return initPromise;

  initPromise = createHighlighterCore({
    themes: [
      import("@shikijs/themes/github-dark"),
      import("@shikijs/themes/github-light"),
    ],
    langs: [
      import("@shikijs/langs/javascript"),
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/python"),
      import("@shikijs/langs/json"),
      import("@shikijs/langs/yaml"),
      import("@shikijs/langs/html"),
      import("@shikijs/langs/css"),
      import("@shikijs/langs/shellscript"),
      import("@shikijs/langs/markdown"),
      import("@shikijs/langs/jsx"),
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/sql"),
      import("@shikijs/langs/go"),
      import("@shikijs/langs/rust"),
      import("@shikijs/langs/java"),
      import("@shikijs/langs/c"),
      import("@shikijs/langs/cpp"),
      import("@shikijs/langs/ruby"),
      import("@shikijs/langs/php"),
      import("@shikijs/langs/xml"),
    ],
    engine: createJavaScriptRegexEngine(),
  }).then((h) => {
    highlighter = h;
    return h;
  });

  return initPromise;
}

export async function highlight(
  code: string,
  lang: string,
  theme: "github-dark" | "github-light",
): Promise<string> {
  const h = await getHighlighter();
  const loaded = h.getLoadedLanguages();
  const safeLang = loaded.includes(lang) ? lang : "plaintext";
  return h.codeToHtml(code, { lang: safeLang, theme });
}
