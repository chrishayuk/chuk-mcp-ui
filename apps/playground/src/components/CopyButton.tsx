import { useState, useRef, useEffect } from "react";
import { Button } from "@chuk/view-ui";

interface CopyButtonProps {
  jsonText: string;
}

export function CopyButton({ jsonText }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be blocked by permissions or insecure context
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} aria-label="Copy JSON to clipboard">
      {copied ? "Copied!" : "Copy JSON"}
    </Button>
  );
}
