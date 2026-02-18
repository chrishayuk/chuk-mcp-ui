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
    <div className="flex items-center justify-center h-full p-8 font-sans text-muted-foreground bg-background text-center whitespace-pre-wrap">
      {text}
    </div>
  );
}
