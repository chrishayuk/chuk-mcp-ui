import { useMemo } from "react";
import { useView } from "@chuk/view-shared";
import { Card, CardContent } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { ThreedContent, ThreedObject } from "./schema";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);

const DEFAULT_COLORS: Record<string, string> = {
  box: "#3b82f6",
  sphere: "#22c55e",
  cylinder: "#f59e0b",
  cone: "#ef4444",
  torus: "#8b5cf6",
};

/* ------------------------------------------------------------------ */
/*  Isometric projection                                               */
/* ------------------------------------------------------------------ */

interface Point2D {
  x: number;
  y: number;
}

function isoProject(x: number, y: number, z: number): Point2D {
  return {
    x: (x - z) * COS30,
    y: (x + z) * SIN30 - y,
  };
}

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

function darken(hex: string, factor: number): string {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor);
  return `rgb(${r},${g},${b})`;
}

function lighten(hex: string, factor: number): string {
  const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * factor));
  const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * factor));
  const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * factor));
  return `rgb(${r},${g},${b})`;
}

/* ------------------------------------------------------------------ */
/*  Geometry renderers                                                 */
/* ------------------------------------------------------------------ */

function BoxShape({ obj, offset }: { obj: ThreedObject; offset: Point2D }) {
  const [sx, sy, sz] = obj.scale ?? [1, 1, 1];
  const color = obj.color ?? DEFAULT_COLORS.box;
  const hw = sx * 30;
  const hh = sy * 30;
  const hd = sz * 30;
  const [px, py, pz] = obj.position;

  // 8 corners of the box
  const corners = [
    isoProject(px - hw, py - hh, pz - hd), // 0: front-bottom-left
    isoProject(px + hw, py - hh, pz - hd), // 1: front-bottom-right
    isoProject(px + hw, py + hh, pz - hd), // 2: front-top-right
    isoProject(px - hw, py + hh, pz - hd), // 3: front-top-left
    isoProject(px - hw, py - hh, pz + hd), // 4: back-bottom-left
    isoProject(px + hw, py - hh, pz + hd), // 5: back-bottom-right
    isoProject(px + hw, py + hh, pz + hd), // 6: back-top-right
    isoProject(px - hw, py + hh, pz + hd), // 7: back-top-left
  ].map((p) => ({ x: p.x + offset.x, y: p.y + offset.y }));

  // Three visible faces
  const topFace = [corners[3], corners[2], corners[6], corners[7]]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
  const leftFace = [corners[3], corners[7], corners[4], corners[0]]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
  const rightFace = [corners[2], corners[1], corners[5], corners[6]]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const wireframe = obj.wireframe;

  return (
    <g>
      <polygon points={leftFace} fill={wireframe ? "none" : darken(color, 0.6)} stroke={color} strokeWidth={wireframe ? 1 : 0.5} />
      <polygon points={rightFace} fill={wireframe ? "none" : darken(color, 0.8)} stroke={color} strokeWidth={wireframe ? 1 : 0.5} />
      <polygon points={topFace} fill={wireframe ? "none" : lighten(color, 1.1)} stroke={color} strokeWidth={wireframe ? 1 : 0.5} />
    </g>
  );
}

function SphereShape({ obj, offset }: { obj: ThreedObject; offset: Point2D }) {
  const [sx] = obj.scale ?? [1, 1, 1];
  const color = obj.color ?? DEFAULT_COLORS.sphere;
  const radius = sx * 30;
  const center = isoProject(...obj.position);
  const cx = center.x + offset.x;
  const cy = center.y + offset.y;
  const gradientId = `sphere-grad-${obj.id}`;
  const wireframe = obj.wireframe;

  return (
    <g>
      {!wireframe && (
        <defs>
          <radialGradient id={gradientId} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor={lighten(color, 1.4)} />
            <stop offset="70%" stopColor={color} />
            <stop offset="100%" stopColor={darken(color, 0.5)} />
          </radialGradient>
        </defs>
      )}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={wireframe ? "none" : `url(#${gradientId})`}
        stroke={color}
        strokeWidth={wireframe ? 1 : 0.5}
      />
      {wireframe && (
        <>
          <ellipse cx={cx} cy={cy} rx={radius} ry={radius * 0.35} fill="none" stroke={color} strokeWidth="0.7" />
          <ellipse cx={cx} cy={cy} rx={radius * 0.35} ry={radius} fill="none" stroke={color} strokeWidth="0.7" />
        </>
      )}
    </g>
  );
}

function CylinderShape({ obj, offset }: { obj: ThreedObject; offset: Point2D }) {
  const [sx, sy] = obj.scale ?? [1, 1, 1];
  const color = obj.color ?? DEFAULT_COLORS.cylinder;
  const radius = sx * 25;
  const halfH = sy * 40;
  const [px, py, pz] = obj.position;
  const wireframe = obj.wireframe;

  const top = isoProject(px, py + halfH, pz);
  const bottom = isoProject(px, py - halfH, pz);
  const topCx = top.x + offset.x;
  const topCy = top.y + offset.y;
  const bottomCx = bottom.x + offset.x;
  const bottomCy = bottom.y + offset.y;
  const ellipseRy = radius * 0.35;

  return (
    <g>
      {/* Bottom ellipse */}
      <ellipse
        cx={bottomCx}
        cy={bottomCy}
        rx={radius}
        ry={ellipseRy}
        fill={wireframe ? "none" : darken(color, 0.6)}
        stroke={color}
        strokeWidth={wireframe ? 1 : 0.5}
      />
      {/* Body */}
      {!wireframe ? (
        <path
          d={`M ${topCx - radius} ${topCy} L ${bottomCx - radius} ${bottomCy} A ${radius} ${ellipseRy} 0 0 0 ${bottomCx + radius} ${bottomCy} L ${topCx + radius} ${topCy}`}
          fill={darken(color, 0.8)}
          stroke={color}
          strokeWidth="0.5"
        />
      ) : (
        <>
          <line x1={topCx - radius} y1={topCy} x2={bottomCx - radius} y2={bottomCy} stroke={color} strokeWidth="1" />
          <line x1={topCx + radius} y1={topCy} x2={bottomCx + radius} y2={bottomCy} stroke={color} strokeWidth="1" />
        </>
      )}
      {/* Top ellipse */}
      <ellipse
        cx={topCx}
        cy={topCy}
        rx={radius}
        ry={ellipseRy}
        fill={wireframe ? "none" : lighten(color, 1.1)}
        stroke={color}
        strokeWidth={wireframe ? 1 : 0.5}
      />
    </g>
  );
}

function ConeShape({ obj, offset }: { obj: ThreedObject; offset: Point2D }) {
  const [sx, sy] = obj.scale ?? [1, 1, 1];
  const color = obj.color ?? DEFAULT_COLORS.cone;
  const radius = sx * 25;
  const halfH = sy * 40;
  const [px, py, pz] = obj.position;
  const wireframe = obj.wireframe;

  const apex = isoProject(px, py + halfH, pz);
  const bottom = isoProject(px, py - halfH, pz);
  const apexX = apex.x + offset.x;
  const apexY = apex.y + offset.y;
  const bottomCx = bottom.x + offset.x;
  const bottomCy = bottom.y + offset.y;
  const ellipseRy = radius * 0.35;

  return (
    <g>
      {/* Base ellipse */}
      <ellipse
        cx={bottomCx}
        cy={bottomCy}
        rx={radius}
        ry={ellipseRy}
        fill={wireframe ? "none" : darken(color, 0.6)}
        stroke={color}
        strokeWidth={wireframe ? 1 : 0.5}
      />
      {/* Cone body */}
      {!wireframe ? (
        <>
          <path
            d={`M ${bottomCx - radius} ${bottomCy} L ${apexX} ${apexY} L ${bottomCx + radius} ${bottomCy}`}
            fill={darken(color, 0.8)}
            stroke={color}
            strokeWidth="0.5"
          />
          <path
            d={`M ${bottomCx - radius} ${bottomCy} A ${radius} ${ellipseRy} 0 0 0 ${bottomCx + radius} ${bottomCy}`}
            fill={darken(color, 0.7)}
            stroke="none"
          />
        </>
      ) : (
        <>
          <line x1={bottomCx - radius} y1={bottomCy} x2={apexX} y2={apexY} stroke={color} strokeWidth="1" />
          <line x1={bottomCx + radius} y1={bottomCy} x2={apexX} y2={apexY} stroke={color} strokeWidth="1" />
        </>
      )}
    </g>
  );
}

function TorusShape({ obj, offset }: { obj: ThreedObject; offset: Point2D }) {
  const [sx] = obj.scale ?? [1, 1, 1];
  const color = obj.color ?? DEFAULT_COLORS.torus;
  const outerR = sx * 35;
  const innerR = outerR * 0.5;
  const center = isoProject(...obj.position);
  const cx = center.x + offset.x;
  const cy = center.y + offset.y;
  const wireframe = obj.wireframe;
  const ellipseRy = 0.4;

  return (
    <g>
      {/* Outer ellipse */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={outerR}
        ry={outerR * ellipseRy}
        fill={wireframe ? "none" : darken(color, 0.7)}
        stroke={color}
        strokeWidth={wireframe ? 1 : 1.5}
      />
      {/* Inner hole */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={innerR}
        ry={innerR * ellipseRy}
        fill={wireframe ? "none" : "var(--color-background, #fff)"}
        stroke={color}
        strokeWidth={wireframe ? 1 : 1.5}
      />
      {/* Top highlight ring */}
      {!wireframe && (
        <ellipse
          cx={cx}
          cy={cy - 3}
          rx={(outerR + innerR) / 2}
          ry={((outerR + innerR) / 2) * ellipseRy}
          fill="none"
          stroke={lighten(color, 1.3)}
          strokeWidth="3"
          opacity="0.4"
        />
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Object dispatcher                                                  */
/* ------------------------------------------------------------------ */

function ObjectShape({ obj, offset }: { obj: ThreedObject; offset: Point2D }) {
  const center = isoProject(...obj.position);
  const labelX = center.x + offset.x;
  const labelY = center.y + offset.y;

  return (
    <g>
      {obj.geometry === "box" && <BoxShape obj={obj} offset={offset} />}
      {obj.geometry === "sphere" && <SphereShape obj={obj} offset={offset} />}
      {obj.geometry === "cylinder" && <CylinderShape obj={obj} offset={offset} />}
      {obj.geometry === "cone" && <ConeShape obj={obj} offset={offset} />}
      {obj.geometry === "torus" && <TorusShape obj={obj} offset={offset} />}
      {obj.label && (
        <text
          x={labelX}
          y={labelY + 45}
          textAnchor="middle"
          fontSize="11"
          fontFamily="sans-serif"
          className="fill-foreground"
        >
          {obj.label}
        </text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                                */
/* ------------------------------------------------------------------ */

export function ThreedView() {
  const { data, requestDisplayMode, displayMode } =
    useView<ThreedContent>("threed", "1.0");

  if (!data) return null;

  return <ThreedRenderer data={data} onRequestDisplayMode={requestDisplayMode} displayMode={displayMode} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                       */
/* ------------------------------------------------------------------ */

export interface ThreedRendererProps {
  data: ThreedContent;
  onRequestDisplayMode?: (mode: "inline" | "fullscreen" | "pip") => Promise<string>;
  displayMode?: "inline" | "fullscreen" | "pip" | null;
}

export function ThreedRenderer({ data, onRequestDisplayMode, displayMode }: ThreedRendererProps) {
  // Sort objects by depth (distance from camera) for painter's algorithm
  const sortedObjects = useMemo(() => {
    return [...data.objects].sort((a, b) => {
      const [ax, ay, az] = a.position;
      const [bx, by, bz] = b.position;
      // Sort by depth: further objects first (larger x+z, smaller y)
      const depthA = ax + az - ay;
      const depthB = bx + bz - by;
      return depthA - depthB;
    });
  }, [data.objects]);

  // Compute SVG bounds based on projected positions
  const { viewBox, offset } = useMemo(() => {
    if (data.objects.length === 0) {
      return { viewBox: "-200 -200 400 400", offset: { x: 0, y: 0 } };
    }

    const projected = data.objects.map((obj) => isoProject(...obj.position));
    const padding = 120;
    const minX = Math.min(...projected.map((p) => p.x)) - padding;
    const maxX = Math.max(...projected.map((p) => p.x)) + padding;
    const minY = Math.min(...projected.map((p) => p.y)) - padding;
    const maxY = Math.max(...projected.map((p) => p.y)) + padding;

    const w = maxX - minX;
    const h = maxY - minY;
    const offX = -minX;
    const offY = -minY;

    return {
      viewBox: `0 0 ${w.toFixed(0)} ${h.toFixed(0)}`,
      offset: { x: offX, y: offY },
    };
  }, [data.objects]);

  const bgColor = data.background ?? undefined;

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background relative">
      {onRequestDisplayMode && (
        <button
          onClick={() => onRequestDisplayMode(displayMode === "fullscreen" ? "inline" : "fullscreen")}
          className="absolute top-2 right-2 z-[1000] bg-background/80 backdrop-blur-sm border rounded-md px-2 py-1 text-xs hover:bg-muted transition-colors"
        >
          {displayMode === "fullscreen" ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      )}
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
          <CardContent className="flex-1 p-4 flex items-center justify-center overflow-auto">
            <svg
              viewBox={viewBox}
              className="w-full h-full"
              style={{ maxHeight: "100%", background: bgColor }}
            >
              {sortedObjects.map((obj) => (
                <ObjectShape key={obj.id} obj={obj} offset={offset} />
              ))}
            </svg>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
