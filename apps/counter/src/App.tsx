import { useMemo } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { slideUp } from "@chuk/view-ui/animations";
import type { CounterContent } from "./schema";

export function CounterView() {
  const { data, content, isConnected } =
    useView<CounterContent>("counter", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <CounterRenderer data={data} />;
}

export interface CounterRendererProps {
  data: CounterContent;
}

const COLOR_MAP: Record<string, { text: string; bg: string; delta: string }> = {
  default: { text: "text-foreground", bg: "bg-background", delta: "text-muted-foreground" },
  success: { text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", delta: "text-emerald-600 dark:text-emerald-400" },
  warning: { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", delta: "text-amber-600 dark:text-amber-400" },
  danger: { text: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", delta: "text-red-600 dark:text-red-400" },
};

export function CounterRenderer({ data }: CounterRendererProps) {
  const { value, label, prefix, suffix, delta, sparkline, icon, color = "default" } = data;
  const colors = COLOR_MAP[color] ?? COLOR_MAP.default;

  const formattedValue = useMemo(() => {
    const formatted = typeof value === "number" ? value.toLocaleString() : String(value);
    return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
  }, [value, prefix, suffix]);

  const sparklinePath = useMemo(() => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const w = 120;
    const h = 32;
    const step = w / (sparkline.length - 1);
    const points = sparkline
      .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
      .join(" ");
    return points;
  }, [sparkline]);

  return (
    <div className="h-full flex items-center justify-center font-sans text-foreground bg-background p-4">
      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[320px]"
      >
        <Card className={cn(colors.bg)}>
          <CardContent className="p-6 text-center">
            {icon && (
              <div className="text-2xl mb-2 text-muted-foreground">{icon}</div>
            )}
            <div className={cn("text-4xl font-bold tracking-tight", colors.text)}>
              {formattedValue}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{label}</div>

            {delta && (
              <div className={cn("mt-2 text-sm font-medium", delta.value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                {delta.value >= 0 ? "\u25b2" : "\u25bc"}{" "}
                {Math.abs(delta.value).toLocaleString()}
                {delta.label && (
                  <span className="ml-1 text-muted-foreground font-normal">
                    {delta.label}
                  </span>
                )}
              </div>
            )}

            {sparklinePath && (
              <div className="mt-3 flex justify-center">
                <svg width="120" height="32" viewBox="0 0 120 32" className="overflow-visible">
                  <polyline
                    points={sparklinePath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={cn(colors.text, "opacity-60")}
                  />
                </svg>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
