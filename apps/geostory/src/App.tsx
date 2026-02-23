import { useState, useCallback, useEffect, useRef } from "react";
import { useView } from "@chuk/view-shared";
import { Card, CardContent, ScrollArea, cn } from "@chuk/view-ui";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { GeostoryContent, GeostoryStep } from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper                                                       */
/* ------------------------------------------------------------------ */

export function GeostoryView() {
  const { data } =
    useView<GeostoryContent>("geostory", "1.0");

  if (!data) return null;

  return <GeostoryRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface GeostoryRendererProps {
  data: GeostoryContent;
}

/* ------------------------------------------------------------------ */
/*  Location pin SVG icon                                              */
/* ------------------------------------------------------------------ */

function LocationPin({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Format coordinates                                                 */
/* ------------------------------------------------------------------ */

function formatCoord(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}\u00B0${latDir}, ${Math.abs(lon).toFixed(2)}\u00B0${lonDir}`;
}

/* ------------------------------------------------------------------ */
/*  Basemap background colours                                         */
/* ------------------------------------------------------------------ */

const BASEMAP_BG: Record<string, string> = {
  terrain: "bg-emerald-950/20",
  satellite: "bg-slate-950/30",
  simple: "bg-slate-100 dark:bg-slate-900",
};

/* ------------------------------------------------------------------ */
/*  Geostory Renderer                                                  */
/* ------------------------------------------------------------------ */

export function GeostoryRenderer({ data }: GeostoryRendererProps) {
  const { title, steps, basemap = "simple" } = data;

  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /* IntersectionObserver to detect active step */
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = stepRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (idx !== -1) {
              setActiveIndex(idx);
            }
          }
        }
      },
      {
        root,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0.1,
      }
    );

    for (const ref of stepRefs.current) {
      if (ref) observer.observe(ref);
    }

    return () => observer.disconnect();
  }, [steps.length]);

  const setStepRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      stepRefs.current[index] = el;
    },
    []
  );

  const activeStep = steps[activeIndex];

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full"
      >
        {/* Header */}
        {title && (
          <div className="px-6 pt-6 pb-3">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}

        {/* Split layout */}
        <div className="flex-1 flex min-h-0">
          {/* Left panel: scrolling narrative */}
          <div className="w-1/2 min-h-0 border-r border-border">
            <ScrollArea className="h-full">
              <div ref={scrollRef} className="h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Spacer so first item can reach observation zone */}
                  <div className="h-[30vh]" />

                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      ref={setStepRef(index)}
                      className="scroll-mt-24"
                    >
                      <StepCard
                        step={step}
                        isActive={index === activeIndex}
                        index={index}
                      />
                    </div>
                  ))}

                  {/* Spacer so last item can reach observation zone */}
                  <div className="h-[30vh]" />
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right panel: location card */}
          <div
            className={cn(
              "w-1/2 flex items-center justify-center p-8",
              BASEMAP_BG[basemap]
            )}
          >
            <AnimatePresence mode="wait">
              {activeStep && (
                <motion.div
                  key={activeStep.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-sm"
                >
                  <LocationCard step={activeStep} basemap={basemap} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step Card (left panel)                                             */
/* ------------------------------------------------------------------ */

interface StepCardProps {
  step: GeostoryStep;
  isActive: boolean;
  index: number;
}

function StepCard({ step, isActive, index }: StepCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300",
        isActive
          ? "border-primary shadow-md ring-2 ring-primary/20"
          : "opacity-60"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
            {index + 1}
          </span>
          <h3 className="text-sm font-semibold truncate">{step.title}</h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.text}
        </p>

        {step.image && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img
              src={step.image}
              alt={step.title}
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <LocationPin className="w-3.5 h-3.5" />
          <span>{formatCoord(step.location.lat, step.location.lon)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Location Card (right panel)                                        */
/* ------------------------------------------------------------------ */

interface LocationCardProps {
  step: GeostoryStep;
  basemap: string;
}

function LocationCard({ step, basemap }: LocationCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Map-like header area */}
      <div
        className={cn(
          "relative h-48 flex items-center justify-center",
          basemap === "satellite"
            ? "bg-gradient-to-br from-slate-800 to-slate-900"
            : basemap === "terrain"
              ? "bg-gradient-to-br from-emerald-800 to-teal-900"
              : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800"
        )}
      >
        {/* Pulsing dot for location */}
        <div className="relative">
          <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-50 w-8 h-8" />
          <span className="relative block w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow-lg" />
        </div>

        {/* Coordinate overlay */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-mono px-2 py-1 rounded">
          {formatCoord(step.location.lat, step.location.lon)}
        </div>

        {step.marker && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {step.marker}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start gap-2 mb-2">
          <LocationPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <h3 className="text-base font-semibold">{step.title}</h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.text}
        </p>

        {step.image && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img
              src={step.image}
              alt={step.title}
              className="w-full h-36 object-cover"
            />
          </div>
        )}

        {step.zoom && (
          <div className="mt-3 text-xs text-muted-foreground">
            Zoom level: {step.zoom}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
