import { useState, useRef, useCallback, useEffect } from "react";
import { useView } from "@chuk/view-shared";
import { Card, CardContent, Badge } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { CompareContent } from "./schema";

/* ------------------------------------------------------------------ */
/*  View (connected to MCP)                                           */
/* ------------------------------------------------------------------ */

export function CompareView() {
  const { data } =
    useView<CompareContent>("compare", "1.0");

  if (!data) return null;

  return <CompareRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                      */
/* ------------------------------------------------------------------ */

export interface CompareRendererProps {
  data: CompareContent;
}

export function CompareRenderer({ data }: CompareRendererProps) {
  const {
    title,
    before,
    after,
    orientation = "horizontal",
    initialPosition = 50,
    labels,
  } = data;

  const isHorizontal = orientation === "horizontal";

  const [position, setPosition] = useState(initialPosition);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      let pct: number;

      if (isHorizontal) {
        pct = ((clientX - rect.left) / rect.width) * 100;
      } else {
        pct = ((clientY - rect.top) / rect.height) * 100;
      }

      setPosition(clamp(pct, 0, 100));
    },
    [isHorizontal]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX, e.clientY);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX, e.clientY);
    },
    [updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let delta = 0;

      if (isHorizontal) {
        if (e.key === "ArrowLeft") delta = -1;
        else if (e.key === "ArrowRight") delta = 1;
      } else {
        if (e.key === "ArrowUp") delta = -1;
        else if (e.key === "ArrowDown") delta = 1;
      }

      if (delta !== 0) {
        e.preventDefault();
        setPosition((prev) => clamp(prev + delta, 0, 100));
      }
    },
    [isHorizontal]
  );

  /* Reset position when initialPosition changes */
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const cursorStyle = isHorizontal ? "col-resize" : "row-resize";

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[900px] mx-auto p-6"
      >
        {title && (
          <h1 className="text-xl font-semibold leading-tight mb-4">{title}</h1>
        )}

        <Card>
          <CardContent className="p-0 overflow-hidden">
            {/* Comparison container */}
            <div
              ref={containerRef}
              className="relative select-none overflow-hidden"
              style={{ cursor: cursorStyle }}
              role="slider"
              aria-label="Image comparison slider"
              aria-valuenow={Math.round(position)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-orientation={orientation}
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onKeyDown={handleKeyDown}
            >
              {/* After image (background / full layer) */}
              <img
                src={after.url}
                alt={after.alt ?? "After"}
                className="block w-full h-auto"
                draggable={false}
              />

              {/* Before image (clipped overlay) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={
                  isHorizontal
                    ? { width: `${position}%` }
                    : { height: `${position}%` }
                }
              >
                <img
                  src={before.url}
                  alt={before.alt ?? "Before"}
                  className={
                    isHorizontal
                      ? "block h-full w-auto max-w-none"
                      : "block w-full h-auto max-h-none"
                  }
                  style={
                    isHorizontal
                      ? { minWidth: containerRef.current?.offsetWidth ?? "100%" }
                      : { minHeight: containerRef.current?.offsetHeight ?? "100%" }
                  }
                  draggable={false}
                />
              </div>

              {/* Divider line */}
              {isHorizontal ? (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none"
                  style={{ left: `${position}%`, transform: "translateX(-50%)" }}
                >
                  {/* Grab handle */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-2 border-primary shadow-md pointer-events-auto"
                    style={{ cursor: cursorStyle }}
                  >
                    <div className="flex items-center justify-center h-full gap-0.5">
                      <div className="w-0.5 h-2.5 bg-primary rounded-full" />
                      <div className="w-0.5 h-2.5 bg-primary rounded-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-primary pointer-events-none"
                  style={{ top: `${position}%`, transform: "translateY(-50%)" }}
                >
                  {/* Grab handle */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-2 border-primary shadow-md pointer-events-auto"
                    style={{ cursor: cursorStyle }}
                  >
                    <div className="flex items-center justify-center h-full flex-col gap-0.5">
                      <div className="h-0.5 w-2.5 bg-primary rounded-full" />
                      <div className="h-0.5 w-2.5 bg-primary rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* Labels */}
              {labels?.before && (
                <div
                  className="absolute pointer-events-none"
                  style={
                    isHorizontal
                      ? { top: "12px", left: "12px" }
                      : { top: "12px", left: "12px" }
                  }
                >
                  <Badge
                    variant="secondary"
                    className="bg-black/50 text-white border-none backdrop-blur-sm"
                  >
                    {labels.before}
                  </Badge>
                </div>
              )}
              {labels?.after && (
                <div
                  className="absolute pointer-events-none"
                  style={
                    isHorizontal
                      ? { top: "12px", right: "12px" }
                      : { bottom: "12px", left: "12px" }
                  }
                >
                  <Badge
                    variant="secondary"
                    className="bg-black/50 text-white border-none backdrop-blur-sm"
                  >
                    {labels.after}
                  </Badge>
                </div>
              )}
            </div>

            {/* Caption bar */}
            {(before.caption || after.caption) && (
              <div className="flex justify-between px-4 py-2 text-xs text-muted-foreground border-t border-border">
                <span>{before.caption ?? ""}</span>
                <span>{after.caption ?? ""}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
