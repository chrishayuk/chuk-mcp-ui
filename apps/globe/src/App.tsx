import { useMemo, useState, useCallback } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { GlobeContent, GlobePoint, GlobeArc } from "./schema";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GLOBE_RADIUS = 180;
const CX = 200;
const CY = 200;
const SVG_SIZE = 400;

const DEG2RAD = Math.PI / 180;

/* ------------------------------------------------------------------ */
/*  Projection                                                         */
/* ------------------------------------------------------------------ */

interface Projected {
  x: number;
  y: number;
  visible: boolean;
}

function project(
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
  radius: number
): Projected {
  const latR = lat * DEG2RAD;
  const lonR = lon * DEG2RAD;
  const cLatR = centerLat * DEG2RAD;
  const cLonR = centerLon * DEG2RAD;

  const x = radius * Math.cos(latR) * Math.sin(lonR - cLonR);
  const y = radius * (
    Math.cos(cLatR) * Math.sin(latR) -
    Math.sin(cLatR) * Math.cos(latR) * Math.cos(lonR - cLonR)
  );

  const cosC =
    Math.sin(cLatR) * Math.sin(latR) +
    Math.cos(cLatR) * Math.cos(latR) * Math.cos(lonR - cLonR);

  return {
    x: CX + x,
    y: CY - y,
    visible: cosC > 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Graticule lines                                                    */
/* ------------------------------------------------------------------ */

function Graticule({
  centerLat,
  centerLon,
}: {
  centerLat: number;
  centerLon: number;
}) {
  const paths = useMemo(() => {
    const lines: string[] = [];

    // Latitude lines every 30 degrees
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: string[] = [];
      for (let lon = -180; lon <= 180; lon += 5) {
        const p = project(lat, lon, centerLat, centerLon, GLOBE_RADIUS);
        if (p.visible) {
          pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
        } else if (pts.length > 0) {
          lines.push("M " + pts.join(" L "));
          pts.length = 0;
        }
      }
      if (pts.length > 1) lines.push("M " + pts.join(" L "));
    }

    // Longitude lines every 30 degrees
    for (let lon = -180; lon < 180; lon += 30) {
      const pts: string[] = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        const p = project(lat, lon, centerLat, centerLon, GLOBE_RADIUS);
        if (p.visible) {
          pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
        } else if (pts.length > 0) {
          lines.push("M " + pts.join(" L "));
          pts.length = 0;
        }
      }
      if (pts.length > 1) lines.push("M " + pts.join(" L "));
    }

    return lines;
  }, [centerLat, centerLon]);

  return (
    <>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          className="stroke-muted-foreground"
          strokeWidth="0.5"
          opacity="0.3"
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Arc between two points                                             */
/* ------------------------------------------------------------------ */

function ArcPath({
  arc,
  pointMap,
  centerLat,
  centerLon,
}: {
  arc: GlobeArc;
  pointMap: Map<string, GlobePoint>;
  centerLat: number;
  centerLon: number;
}) {
  const from = pointMap.get(arc.from);
  const to = pointMap.get(arc.to);
  if (!from || !to) return null;

  // Interpolate along the great circle (simplified: linear interpolation in lat/lon)
  const steps = 32;
  const pts: { x: number; y: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = from.lat + (to.lat - from.lat) * t;
    const lon = from.lon + (to.lon - from.lon) * t;
    const p = project(lat, lon, centerLat, centerLon, GLOBE_RADIUS);
    if (p.visible) {
      pts.push({ x: p.x, y: p.y });
    }
  }

  if (pts.length < 2) return null;

  // Elevate the arc: add a bulge to the midpoint
  const midIdx = Math.floor(pts.length / 2);
  const arcColor = arc.color ?? "#f59e0b";

  // Create path with a slight curve by lifting midpoints
  const pathParts = pts.map((p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    // Lift middle points slightly for arc effect
    const lift = Math.sin((i / pts.length) * Math.PI) * 20;
    return `L ${p.x.toFixed(1)} ${(p.y - lift).toFixed(1)}`;
  });

  const midPt = pts[midIdx];
  const midLift = Math.sin((midIdx / pts.length) * Math.PI) * 20;

  return (
    <g>
      <path
        d={pathParts.join(" ")}
        fill="none"
        stroke={arcColor}
        strokeWidth="2"
        opacity="0.7"
        strokeLinecap="round"
      />
      {arc.label && midPt && (
        <text
          x={midPt.x}
          y={midPt.y - midLift - 8}
          textAnchor="middle"
          fontSize="9"
          fontFamily="sans-serif"
          fill={arcColor}
        >
          {arc.label}
        </text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                                */
/* ------------------------------------------------------------------ */

export function GlobeView() {
  const { data, content, isConnected } =
    useView<GlobeContent>("globe", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <GlobeRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                       */
/* ------------------------------------------------------------------ */

export interface GlobeRendererProps {
  data: GlobeContent;
}

export function GlobeRenderer({ data }: GlobeRendererProps) {
  const initialLat = data.rotation?.lat ?? 20;
  const initialLon = data.rotation?.lon ?? 0;

  const [rotation, setRotation] = useState({ lat: initialLat, lon: initialLon });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, lat: 0, lon: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      setDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY, lat: rotation.lat, lon: rotation.lon });
      (e.target as SVGSVGElement).setPointerCapture?.(e.pointerId);
    },
    [rotation]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragging) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setRotation({
        lon: dragStart.lon + dx * 0.5,
        lat: Math.max(-80, Math.min(80, dragStart.lat - dy * 0.5)),
      });
    },
    [dragging, dragStart]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const pointMap = useMemo(
    () => new Map(data.points.map((p) => [p.id, p])),
    [data.points]
  );

  const projectedPoints = useMemo(
    () =>
      data.points.map((p) => ({
        ...p,
        ...project(p.lat, p.lon, rotation.lat, rotation.lon, GLOBE_RADIUS),
      })),
    [data.points, rotation.lat, rotation.lon]
  );

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="h-full flex flex-col"
      >
        <Card className="m-4 flex-1 flex flex-col overflow-hidden">
          {data.title && (
            <div className="px-4 py-3 border-b">
              <h2 className="text-base font-semibold m-0">{data.title}</h2>
            </div>
          )}
          <CardContent className="flex-1 p-4 flex items-center justify-center overflow-hidden">
            <svg
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              className="w-full h-full"
              style={{ maxWidth: SVG_SIZE, maxHeight: SVG_SIZE, cursor: dragging ? "grabbing" : "grab" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <defs>
                <radialGradient id="globe-gradient" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#4da6ff" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#1a6bb5" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0d3b66" stopOpacity="0.95" />
                </radialGradient>
                <radialGradient id="globe-shadow" cx="50%" cy="50%" r="50%">
                  <stop offset="85%" stopColor="transparent" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
                </radialGradient>
              </defs>

              {/* Globe sphere */}
              <circle
                cx={CX}
                cy={CY}
                r={GLOBE_RADIUS}
                fill="url(#globe-gradient)"
              />

              {/* Graticule */}
              <Graticule centerLat={rotation.lat} centerLon={rotation.lon} />

              {/* Shadow rim */}
              <circle
                cx={CX}
                cy={CY}
                r={GLOBE_RADIUS}
                fill="url(#globe-shadow)"
              />

              {/* Arcs */}
              {data.arcs?.map((arc) => (
                <ArcPath
                  key={`${arc.from}-${arc.to}`}
                  arc={arc}
                  pointMap={pointMap}
                  centerLat={rotation.lat}
                  centerLon={rotation.lon}
                />
              ))}

              {/* Points (only visible hemisphere) */}
              {projectedPoints
                .filter((p) => p.visible)
                .map((p) => (
                  <g key={p.id}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={p.size ?? 5}
                      fill={p.color ?? "#ff4444"}
                      stroke="#fff"
                      strokeWidth="1.5"
                      opacity="0.9"
                    />
                    <text
                      x={p.x}
                      y={p.y - (p.size ?? 5) - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="sans-serif"
                      className="fill-foreground"
                      style={{ pointerEvents: "none" }}
                    >
                      {p.label}
                    </text>
                  </g>
                ))}

              {/* Globe border */}
              <circle
                cx={CX}
                cy={CY}
                r={GLOBE_RADIUS}
                fill="none"
                className="stroke-border"
                strokeWidth="1"
              />
            </svg>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
