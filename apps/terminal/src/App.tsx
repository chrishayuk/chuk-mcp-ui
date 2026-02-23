import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useView } from "@chuk/view-shared";
import { ScrollArea, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { TerminalContent, TerminalTheme, TerminalFontSize } from "./schema";

/* ------------------------------------------------------------------ */
/*  View                                                               */
/* ------------------------------------------------------------------ */

export function TerminalView() {
  const { data } =
    useView<TerminalContent>("terminal", "1.0");

  if (!data) return null;

  return <TerminalRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export interface TerminalRendererProps {
  data: TerminalContent;
}

const THEME_CLASSES: Record<TerminalTheme, string> = {
  dark: "bg-black text-gray-200",
  light: "bg-white text-gray-900",
  green: "bg-black text-green-400",
  amber: "bg-black text-amber-400",
};

const FONT_SIZE_CLASSES: Record<TerminalFontSize, string> = {
  xs: "text-xs leading-4",
  sm: "text-sm leading-5",
  md: "text-base leading-6",
  lg: "text-lg leading-7",
};

/* ------------------------------------------------------------------ */
/*  ANSI SGR Parser                                                    */
/* ------------------------------------------------------------------ */

const ANSI_COLORS: Record<number, string> = {
  30: "text-gray-900 dark:text-gray-900",
  31: "text-red-500",
  32: "text-green-500",
  33: "text-yellow-500",
  34: "text-blue-500",
  35: "text-purple-500",
  36: "text-cyan-500",
  37: "text-gray-300",
  90: "text-gray-500",
  91: "text-red-400",
  92: "text-green-400",
  93: "text-yellow-300",
  94: "text-blue-400",
  95: "text-purple-400",
  96: "text-cyan-400",
  97: "text-white",
};

const ANSI_BG_COLORS: Record<number, string> = {
  40: "bg-gray-900",
  41: "bg-red-500",
  42: "bg-green-500",
  43: "bg-yellow-500",
  44: "bg-blue-500",
  45: "bg-purple-500",
  46: "bg-cyan-500",
  47: "bg-gray-300",
  100: "bg-gray-500",
  101: "bg-red-400",
  102: "bg-green-400",
  103: "bg-yellow-300",
  104: "bg-blue-400",
  105: "bg-purple-400",
  106: "bg-cyan-400",
  107: "bg-white",
};

interface AnsiSpan {
  text: string;
  classes: string;
}

function parseAnsi(input: string): AnsiSpan[] {
  const spans: AnsiSpan[] = [];
  const regex = /\x1b\[([0-9;]*)m/g;
  let lastIndex = 0;
  let fgClass = "";
  let bgClass = "";
  let bold = false;
  let italic = false;
  let underline = false;
  let dim = false;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    // Push text before this escape sequence
    if (match.index > lastIndex) {
      const classes = buildClasses(fgClass, bgClass, bold, italic, underline, dim);
      spans.push({ text: input.slice(lastIndex, match.index), classes });
    }
    lastIndex = regex.lastIndex;

    // Parse SGR codes
    const codes = match[1] ? match[1].split(";").map(Number) : [0];
    for (const code of codes) {
      if (code === 0) {
        fgClass = "";
        bgClass = "";
        bold = false;
        italic = false;
        underline = false;
        dim = false;
      } else if (code === 1) {
        bold = true;
      } else if (code === 2) {
        dim = true;
      } else if (code === 3) {
        italic = true;
      } else if (code === 4) {
        underline = true;
      } else if (code === 22) {
        bold = false;
        dim = false;
      } else if (code === 23) {
        italic = false;
      } else if (code === 24) {
        underline = false;
      } else if (ANSI_COLORS[code]) {
        fgClass = ANSI_COLORS[code];
      } else if (ANSI_BG_COLORS[code]) {
        bgClass = ANSI_BG_COLORS[code];
      } else if (code === 39) {
        fgClass = "";
      } else if (code === 49) {
        bgClass = "";
      }
    }
  }

  // Push remaining text
  if (lastIndex < input.length) {
    const classes = buildClasses(fgClass, bgClass, bold, italic, underline, dim);
    spans.push({ text: input.slice(lastIndex), classes });
  }

  return spans;
}

function buildClasses(
  fg: string,
  bg: string,
  bold: boolean,
  italic: boolean,
  underline: boolean,
  dim: boolean,
): string {
  const parts: string[] = [];
  if (fg) parts.push(fg);
  if (bg) parts.push(bg);
  if (bold) parts.push("font-bold");
  if (italic) parts.push("italic");
  if (underline) parts.push("underline");
  if (dim) parts.push("opacity-50");
  return parts.join(" ");
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                           */
/* ------------------------------------------------------------------ */

export function TerminalRenderer({ data }: TerminalRendererProps) {
  const {
    title,
    lines,
    scrollback,
    fontSize = "sm",
    showLineNumbers = false,
    theme = "dark",
  } = data;

  /* Auto-scroll */
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLineCount = useRef(lines.length);

  /* Apply scrollback limit */
  const visibleLines = useMemo(() => {
    if (scrollback && scrollback > 0 && lines.length > scrollback) {
      return lines.slice(lines.length - scrollback);
    }
    return lines;
  }, [lines, scrollback]);

  /* Line number gutter width */
  const gutterWidth = useMemo(() => {
    if (!showLineNumbers) return 0;
    return String(visibleLines.length).length;
  }, [showLineNumbers, visibleLines.length]);

  /* Auto-scroll on new lines */
  useEffect(() => {
    if (lines.length > prevLineCount.current && !paused) {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
    prevLineCount.current = lines.length;
  }, [lines.length, paused]);

  /* Detect user scroll-up to pause */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    setPaused(!atBottom);
  }, []);

  /* Resume auto-scroll */
  const resume = useCallback(() => {
    setPaused(false);
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  return (
    <div className={cn("h-full flex flex-col font-mono", THEME_CLASSES[theme])}>
      {/* Header */}
      {title && (
        <div className="flex items-center px-4 py-2 border-b border-current/10">
          <span className="text-sm font-semibold">{title}</span>
        </div>
      )}

      {/* Terminal area */}
      <ScrollArea className="flex-1" ref={scrollRef} onScroll={handleScroll}>
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <pre className={cn("px-3 py-2 whitespace-pre-wrap break-words", FONT_SIZE_CLASSES[fontSize])}>
            {visibleLines.map((line, idx) => (
              <div key={idx} className="flex">
                {/* Line number gutter */}
                {showLineNumbers && (
                  <span className="select-none opacity-40 pr-3 text-right flex-shrink-0" style={{ minWidth: `${gutterWidth + 1}ch` }}>
                    {String(idx + 1).padStart(gutterWidth, " ")}
                  </span>
                )}

                {/* Timestamp */}
                {line.timestamp && (
                  <span className="select-none opacity-50 pr-2 flex-shrink-0">
                    {line.timestamp}
                  </span>
                )}

                {/* ANSI-parsed text */}
                <span className="flex-1 min-w-0">
                  <AnsiLine text={line.text} />
                </span>
              </div>
            ))}
          </pre>
        </motion.div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-current/10 text-xs opacity-60">
        <span>{visibleLines.length} lines</span>
        {paused && (
          <button
            className="underline cursor-pointer hover:opacity-80"
            onClick={resume}
          >
            Paused -- Click to resume
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ANSI Line Component                                                */
/* ------------------------------------------------------------------ */

function AnsiLine({ text }: { text: string }) {
  const spans = useMemo(() => parseAnsi(text), [text]);

  if (spans.length === 0) return null;

  // If all spans have no classes, just render the text
  if (spans.every((s) => !s.classes)) {
    return <>{text.replace(/\x1b\[[0-9;]*m/g, "")}</>;
  }

  return (
    <>
      {spans.map((span, i) =>
        span.classes ? (
          <span key={i} className={span.classes}>
            {span.text}
          </span>
        ) : (
          <span key={i}>{span.text}</span>
        ),
      )}
    </>
  );
}
