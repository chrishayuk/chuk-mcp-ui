import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useView } from "@chuk/view-shared";
import { Card, CardContent, CardHeader, CardTitle } from "@chuk/view-ui";
import { fadeIn } from "@chuk/view-ui/animations";
import type { AnnotationContent, Annotation } from "./schema";

/* ------------------------------------------------------------------ */
/*  MCP-wired view                                                     */
/* ------------------------------------------------------------------ */

export function AnnotationView() {
  const { data } =
    useView<AnnotationContent>("annotation", "1.0");

  if (!data) return null;

  return <AnnotationRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Pure renderer (used by Storybook & MCP view)                       */
/* ------------------------------------------------------------------ */

export function AnnotationRenderer({ data }: { data: AnnotationContent }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(
    data.imageWidth && data.imageHeight
      ? { width: data.imageWidth, height: data.imageHeight }
      : null,
  );

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    if (!data.imageWidth || !data.imageHeight) {
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  }, [data.imageWidth, data.imageHeight]);

  const viewBox = dimensions
    ? `0 0 ${dimensions.width} ${dimensions.height}`
    : undefined;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col font-sans text-foreground bg-background"
    >
      <Card className="h-full flex flex-col overflow-hidden border-0 rounded-none shadow-none">
        {data.title && (
          <CardHeader className="px-3 py-2 border-b bg-muted">
            <CardTitle className="text-[15px] font-semibold">
              {data.title}
            </CardTitle>
          </CardHeader>
        )}

        <CardContent className="flex-1 p-0 relative overflow-hidden flex items-center justify-center">
          <div className="relative inline-block max-w-full max-h-full">
            <img
              ref={imgRef}
              src={data.imageUrl}
              alt={data.title ?? "Annotated image"}
              className="block max-w-full max-h-full select-none"
              draggable={false}
              onLoad={handleImageLoad}
              width={data.imageWidth}
              height={data.imageHeight}
            />

            {/* SVG overlay - sized to match image */}
            {viewBox && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={data.title ?? "Image annotations"}
              >
                <defs>
                  {/* Arrowhead markers - one per unique color */}
                  {data.annotations
                    .filter((a): a is Extract<Annotation, { kind: "arrow" }> => a.kind === "arrow")
                    .map((a) => {
                      const color = a.color ?? "var(--chuk-color-primary, #3b82f6)";
                      const markerId = `arrowhead-${a.id}`;
                      return (
                        <marker
                          key={markerId}
                          id={markerId}
                          markerWidth="10"
                          markerHeight="7"
                          refX="10"
                          refY="3.5"
                          orient="auto"
                          markerUnits="strokeWidth"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
                        </marker>
                      );
                    })}
                </defs>

                {data.annotations.map((annotation) => (
                  <AnnotationShape key={annotation.id} annotation={annotation} />
                ))}
              </svg>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual annotation SVG shapes                                   */
/* ------------------------------------------------------------------ */

function AnnotationShape({ annotation }: { annotation: Annotation }) {
  const defaultColor = "var(--chuk-color-primary, #3b82f6)";

  switch (annotation.kind) {
    case "circle": {
      const color = annotation.color ?? defaultColor;
      const sw = annotation.strokeWidth ?? 2;
      return (
        <g>
          <circle
            cx={annotation.cx}
            cy={annotation.cy}
            r={annotation.r}
            fill={color}
            fillOpacity={0.1}
            stroke={color}
            strokeWidth={sw}
          />
          {annotation.label && (
            <text
              x={annotation.cx}
              y={annotation.cy - annotation.r - 6}
              fill={color}
              fontSize={14}
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="auto"
            >
              {annotation.label}
            </text>
          )}
        </g>
      );
    }

    case "rect": {
      const color = annotation.color ?? defaultColor;
      const sw = annotation.strokeWidth ?? 2;
      return (
        <g>
          <rect
            x={annotation.x}
            y={annotation.y}
            width={annotation.width}
            height={annotation.height}
            fill={color}
            fillOpacity={0.1}
            stroke={color}
            strokeWidth={sw}
          />
          {annotation.label && (
            <text
              x={annotation.x + annotation.width / 2}
              y={annotation.y - 6}
              fill={color}
              fontSize={14}
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="auto"
            >
              {annotation.label}
            </text>
          )}
        </g>
      );
    }

    case "arrow": {
      const color = annotation.color ?? defaultColor;
      const sw = annotation.strokeWidth ?? 2;
      const markerId = `arrowhead-${annotation.id}`;
      const midX = (annotation.x1 + annotation.x2) / 2;
      const midY = (annotation.y1 + annotation.y2) / 2;
      return (
        <g>
          <line
            x1={annotation.x1}
            y1={annotation.y1}
            x2={annotation.x2}
            y2={annotation.y2}
            stroke={color}
            strokeWidth={sw}
            markerEnd={`url(#${markerId})`}
          />
          {annotation.label && (
            <text
              x={midX}
              y={midY - 8}
              fill={color}
              fontSize={13}
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="auto"
            >
              {annotation.label}
            </text>
          )}
        </g>
      );
    }

    case "text": {
      const color = annotation.color ?? defaultColor;
      const fontSize = annotation.fontSize ?? 16;
      return (
        <text
          x={annotation.x}
          y={annotation.y}
          fill={color}
          fontSize={fontSize}
          fontFamily="sans-serif"
          dominantBaseline="hanging"
        >
          {annotation.text}
        </text>
      );
    }

    default:
      return null;
  }
}
