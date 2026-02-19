import { useState } from "react";
import { Button } from "@chuk/view-ui";

interface CopyButtonProps {
  jsonText: string;
}

export function CopyButton({ jsonText }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy JSON"}
    </Button>
  );
}
