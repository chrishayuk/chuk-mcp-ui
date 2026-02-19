import { useState, useCallback } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Button, Input, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { EmbedContent } from "./schema";

export function EmbedView() {
  const { data, content, isConnected } =
    useView<EmbedContent>("embed", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <EmbedRenderer data={data} />;
}

export interface EmbedRendererProps {
  data: EmbedContent;
}

export function EmbedRenderer({ data }: EmbedRendererProps) {
  const {
    title,
    url,
    sandbox,
    allow,
    aspectRatio,
    toolbar,
    fallbackText,
  } = data;

  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const effectiveSandbox = sandbox ?? "allow-scripts allow-same-origin";

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(false);
    setIframeKey((k) => k + 1);
  }, []);

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const handleOpenNewTab = useCallback(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);

  if (error) {
    return (
      <div className="h-full flex flex-col font-sans text-foreground bg-background">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex-1 flex items-center justify-center p-6"
        >
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              {fallbackText ?? "Unable to load embedded content."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col min-h-0"
      >
        {/* Title */}
        {title && (
          <div className="px-3 py-2 text-[15px] font-semibold border-b border-border">
            {title}
          </div>
        )}

        {/* Toolbar */}
        {toolbar && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted">
            <Input
              readOnly
              value={url}
              className="flex-1 text-xs truncate bg-background"
            />
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenNewTab}>
              Open
            </Button>
          </div>
        )}

        {/* iframe container */}
        <div
          className={cn("flex-1 relative min-h-0", aspectRatio && "flex-none")}
          style={aspectRatio ? { aspectRatio } : undefined}
        >
          {/* Loading spinner overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="w-6 h-6 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
            </div>
          )}

          <iframe
            key={iframeKey}
            src={url}
            sandbox={effectiveSandbox}
            allow={allow}
            onLoad={handleLoad}
            onError={handleError}
            className="w-full flex-1 border-0"
            style={{ height: "100%" }}
            title={title ?? "Embedded content"}
          />
        </div>
      </motion.div>
    </div>
  );
}
