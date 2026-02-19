import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent, ScrollArea, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn, listContainer, listItem } from "@chuk/view-ui/animations";
import type {
  GisLegendContent,
  GisLegendItem,
  GisLegendSection,
  GisLegendGradientStop,
} from "./schema";

export function GisLegendView() {
  const { data, content, isConnected } =
    useView<GisLegendContent>("gis-legend", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <GisLegendRenderer data={data} />;
}

export interface GisLegendRendererProps {
  data: GisLegendContent;
}

const SWATCH_SIZE = 24;

function PointSwatch({ item }: { item: GisLegendItem }) {
  const r = (item.size ?? 8) / 2;
  return (
    <svg width={SWATCH_SIZE} height={SWATCH_SIZE} aria-hidden="true">
      <circle
        cx={SWATCH_SIZE / 2}
        cy={SWATCH_SIZE / 2}
        r={r}
        fill={item.fillColor ?? item.color ?? "#3b82f6"}
        stroke={item.strokeColor ?? "none"}
        strokeWidth={item.strokeWidth ?? 1}
      />
    </svg>
  );
}

function LineSwatch({ item }: { item: GisLegendItem }) {
  return (
    <svg width={SWATCH_SIZE} height={SWATCH_SIZE} aria-hidden="true">
      <line
        x1={2}
        y1={SWATCH_SIZE / 2}
        x2={SWATCH_SIZE - 2}
        y2={SWATCH_SIZE / 2}
        stroke={item.strokeColor ?? item.color ?? "#ef4444"}
        strokeWidth={item.strokeWidth ?? 2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function PolygonSwatch({ item }: { item: GisLegendItem }) {
  return (
    <svg width={SWATCH_SIZE} height={SWATCH_SIZE} aria-hidden="true">
      <rect
        x={3}
        y={5}
        width={SWATCH_SIZE - 6}
        height={SWATCH_SIZE - 10}
        rx={2}
        fill={item.fillColor ?? item.color ?? "#22c55e"}
        stroke={item.strokeColor ?? "none"}
        strokeWidth={item.strokeWidth ?? 1}
      />
    </svg>
  );
}

function GradientSwatch({ item }: { item: GisLegendItem }) {
  const stops: GisLegendGradientStop[] = item.gradientStops ?? [
    { value: "0%", color: "#fde047" },
    { value: "100%", color: "#dc2626" },
  ];
  const gradientId = `grad-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <svg width={SWATCH_SIZE} height={SWATCH_SIZE} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          {stops.map((s, i) => (
            <stop key={i} offset={s.value} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>
      <rect
        x={2}
        y={5}
        width={SWATCH_SIZE - 4}
        height={SWATCH_SIZE - 10}
        rx={2}
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

function IconSwatch({ item }: { item: GisLegendItem }) {
  return (
    <span
      className="inline-flex items-center justify-center text-sm"
      style={{
        width: SWATCH_SIZE,
        height: SWATCH_SIZE,
        color: item.color ?? "currentColor",
      }}
      aria-hidden="true"
    >
      {item.icon ?? "?"}
    </span>
  );
}

function LegendSwatch({ item }: { item: GisLegendItem }) {
  switch (item.type) {
    case "point":
      return <PointSwatch item={item} />;
    case "line":
      return <LineSwatch item={item} />;
    case "polygon":
      return <PolygonSwatch item={item} />;
    case "gradient":
      return <GradientSwatch item={item} />;
    case "icon":
      return <IconSwatch item={item} />;
    default:
      return <PointSwatch item={item} />;
  }
}

function LegendItemRow({ item }: { item: GisLegendItem }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <LegendSwatch item={item} />
      <span className="text-sm text-foreground">{item.label}</span>
    </div>
  );
}

function LegendSectionBlock({
  section,
  isHorizontal,
}: {
  section: GisLegendSection;
  isHorizontal: boolean;
}) {
  return (
    <div>
      {section.title && (
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          {section.title}
        </h3>
      )}
      <motion.div
        variants={listContainer}
        initial="hidden"
        animate="visible"
        className={cn(
          isHorizontal ? "flex flex-wrap gap-x-4 gap-y-1" : "space-y-1"
        )}
      >
        {section.items.map((item, idx) => (
          <motion.div key={idx} variants={listItem}>
            <LegendItemRow item={item} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function GisLegendRenderer({ data }: GisLegendRendererProps) {
  const { title, sections, orientation } = data;
  const isHorizontal = orientation === "horizontal";

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[600px] mx-auto p-6"
      >
        <Card>
          <CardContent className="p-6">
            {title && (
              <h2 className="text-lg font-semibold mb-4">{title}</h2>
            )}
            <ScrollArea className="max-h-[480px]">
              <div className={cn("space-y-4")}>
                {sections.map((section, idx) => (
                  <LegendSectionBlock
                    key={idx}
                    section={section}
                    isHorizontal={isHorizontal}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
