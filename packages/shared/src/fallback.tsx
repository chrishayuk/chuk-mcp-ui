interface FallbackProps {
  message?: string;
  content?: Array<{ type: string; text?: string }>;
}

/**
 * Fallback component rendered when structuredContent is missing,
 * has the wrong type, or has an incompatible version.
 *
 * Uses inline styles instead of Tailwind so it renders correctly
 * even before the theme CSS has loaded.
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
        fontFamily: "var(--chuk-font-family, system-ui, sans-serif)",
        color: "var(--chuk-color-text-secondary, #666)",
        backgroundColor: "var(--chuk-color-background, #fff)",
        textAlign: "center",
        whiteSpace: "pre-wrap",
      }}
    >
      {text}
    </div>
  );
}
