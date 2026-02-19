import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useView, Fallback } from "@chuk/view-shared";
import { Button } from "@chuk/view-ui";
import { fadeIn } from "@chuk/view-ui/animations";
import type { ImageContent, ImageAnnotation } from "./schema";

export function ImageView() {
  const { data, content, isConnected } =
    useView<ImageContent>("image", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <ImageRenderer data={data} />;
}

export function ImageRenderer({ data }: { data: ImageContent }) {
  const [activeIndex, setActiveIndex] = useState(data.activeIndex ?? 0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const activeImage = data.images[activeIndex];
  const annotations = (data.annotations ?? []).filter(
    (a) => a.imageId === activeImage?.id,
  );
  const showZoom = data.controls?.zoom !== false;
  const showFullscreen = data.controls?.fullscreen !== false;
  const showThumbnails =
    data.images.length > 1 && data.controls?.thumbnails !== false;

  const clampZoom = useCallback(
    (z: number) => Math.min(5, Math.max(0.5, z)),
    [],
  );

  const handleZoomIn = useCallback(
    () => setZoom((z) => clampZoom(z + 0.5)),
    [clampZoom],
  );
  const handleZoomOut = useCallback(
    () => setZoom((z) => clampZoom(z - 0.5)),
    [clampZoom],
  );
  const handleFit = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      setZoom((z) => clampZoom(z + delta));
    },
    [clampZoom],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setZoom((z) => {
        const newZoom = clampZoom(z * 2);
        setPan((p) => ({ x: p.x - x, y: p.y - y }));
        return newZoom;
      });
    },
    [clampZoom],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoom <= 1) return;
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrigin.current = { ...pan };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [zoom, pan],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({
        x: panOrigin.current.x + dx,
        y: panOrigin.current.y + dy,
      });
    },
    [isPanning],
  );

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Reset zoom/pan when active image changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [activeIndex]);

  if (!activeImage) return <Fallback message="No images provided" />;

  return (
    <motion.div
      ref={containerRef}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col font-sans text-foreground bg-background"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted text-[13px] flex-wrap">
        {data.title && (
          <span className="text-[15px] font-semibold mr-auto">
            {data.title}
          </span>
        )}
        {!data.title && <span className="mr-auto" />}

        {showZoom && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              -
            </Button>
            <span className="min-w-[3.5rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 5}
            >
              +
            </Button>
            <Button variant="outline" size="sm" onClick={handleFit}>
              Fit
            </Button>
          </>
        )}

        {showFullscreen && (
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        )}
      </div>

      {/* Image viewport */}
      <div
        ref={viewportRef}
        className="flex-1 relative overflow-hidden"
        style={{ cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
          }}
        >
          <img
            ref={imgRef}
            src={activeImage.url}
            alt={activeImage.alt ?? ""}
            className="max-w-full max-h-full select-none pointer-events-none"
            draggable={false}
            width={activeImage.width}
            height={activeImage.height}
          />

          {/* SVG annotation overlay */}
          {annotations.length > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ overflow: "visible" }}
            >
              {annotations.map((ann) => (
                <AnnotationShape key={ann.id} annotation={ann} />
              ))}
            </svg>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      {showThumbnails && (
        <div className="flex gap-1 px-2 py-1.5 border-t bg-muted overflow-x-auto">
          {data.images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 rounded overflow-hidden ${
                i === activeIndex ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={img.alt ?? `Thumbnail ${i + 1}`}
                className="object-cover"
                style={{ width: 60, height: 60 }}
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      {/* Caption bar */}
      {activeImage.caption && (
        <div className="px-3 py-1.5 border-t text-sm text-muted-foreground">
          {activeImage.caption}
        </div>
      )}
    </motion.div>
  );
}

function AnnotationShape({ annotation }: { annotation: ImageAnnotation }) {
  const color = annotation.color ?? "#ff3333";

  switch (annotation.type) {
    case "circle":
      return (
        <circle
          cx={annotation.x}
          cy={annotation.y}
          r={annotation.radius ?? 20}
          fill="none"
          stroke={color}
          strokeWidth={2}
        >
          <title>
            {annotation.label}
            {annotation.description ? ` - ${annotation.description}` : ""}
          </title>
        </circle>
      );

    case "rect":
      return (
        <rect
          x={annotation.x}
          y={annotation.y}
          width={annotation.width ?? 40}
          height={annotation.height ?? 40}
          fill="none"
          stroke={color}
          strokeWidth={2}
        >
          <title>
            {annotation.label}
            {annotation.description ? ` - ${annotation.description}` : ""}
          </title>
        </rect>
      );

    case "point":
      return (
        <g>
          <circle cx={annotation.x} cy={annotation.y} r={6} fill={color}>
            <title>
              {annotation.label}
              {annotation.description ? ` - ${annotation.description}` : ""}
            </title>
          </circle>
          {annotation.label && (
            <text
              x={annotation.x + 10}
              y={annotation.y + 4}
              fill={color}
              fontSize={12}
              fontFamily="sans-serif"
            >
              {annotation.label}
            </text>
          )}
        </g>
      );

    case "text":
      return (
        <text
          x={annotation.x}
          y={annotation.y}
          fill={color}
          fontSize={14}
          fontFamily="sans-serif"
        >
          {annotation.label ?? ""}
          <title>
            {annotation.description ?? annotation.label ?? ""}
          </title>
        </text>
      );

    default:
      return null;
  }
}
