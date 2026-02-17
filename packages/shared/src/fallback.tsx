import { CSS_VARS } from "./theme";

interface FallbackProps {
  message?: string;
  content?: Array<{ type: string; text?: string }>;
}

/**
 * Fallback component rendered when structuredContent is missing,
 * has the wrong type, or has an incompatible version.
 */
export function Fallback({ message, content }: FallbackProps) {
  const text =
    message ||
    content
      ?.filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("\n") ||
    "No data to display.";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "2rem",
        fontFamily: `var(${CSS_VARS.fontFamily})`,
        color: `var(${CSS_VARS.colorTextSecondary})`,
        backgroundColor: `var(${CSS_VARS.colorBackground})`,
        textAlign: "center",
        whiteSpace: "pre-wrap",
      }}
    >
      {text}
    </div>
  );
}
