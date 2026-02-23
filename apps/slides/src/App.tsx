import { useState, useCallback, useEffect } from "react";
import { useView } from "@chuk/view-shared";
import { cn } from "@chuk/view-ui";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { SlidesContent, Slide } from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper                                                       */
/* ------------------------------------------------------------------ */

export function SlidesView() {
  const { data, callTool } =
    useView<SlidesContent>("slides", "1.0");

  if (!data) return null;

  return <SlidesRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface SlidesRendererProps {
  data: SlidesContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Transition variants                                                */
/* ------------------------------------------------------------------ */

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const noneVariants = {
  enter: {},
  center: {},
  exit: {},
};

function getVariants(transition?: string) {
  switch (transition) {
    case "slide":
      return slideVariants;
    case "none":
      return noneVariants;
    case "fade":
    default:
      return fadeVariants;
  }
}

/* ------------------------------------------------------------------ */
/*  Slides Renderer                                                    */
/* ------------------------------------------------------------------ */

export function SlidesRenderer({ data }: SlidesRendererProps) {
  const { title, slides, transition } = data;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const total = slides.length;
  const variants = getVariants(transition);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= total) return;
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex, total]
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  if (total === 0) {
    return (
      <div className="h-full flex items-center justify-center font-sans text-muted-foreground">
        No slides to display
      </div>
    );
  }

  const slide = slides[currentIndex];

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background select-none">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full"
      >
        {/* Title bar */}
        {title && (
          <div className="px-6 pt-4 pb-2 flex-shrink-0">
            <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
          </div>
        )}

        {/* Slide area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: transition === "none" ? 0 : 0.35, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <SlideContent slide={slide} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="flex-shrink-0 px-6 py-3 flex items-center justify-between border-t border-border">
          {/* Previous button */}
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              currentIndex === 0
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-foreground hover:bg-muted"
            )}
          >
            Previous
          </button>

          {/* Navigation dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentIndex
                    ? "bg-primary w-4"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Counter + Next */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">
              {currentIndex + 1} / {total}
            </span>
            <button
              onClick={goNext}
              disabled={currentIndex === total - 1}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                currentIndex === total - 1
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-foreground hover:bg-muted"
              )}
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Slide Content                                                      */
/* ------------------------------------------------------------------ */

function SlideContent({ slide }: { slide: Slide }) {
  const { title, content, layout = "default", image, background } = slide;

  const bgStyle: React.CSSProperties = background
    ? { backgroundColor: background }
    : {};

  switch (layout) {
    case "center":
      return (
        <div
          className="h-full flex flex-col items-center justify-center px-12 text-center"
          style={bgStyle}
        >
          {title && (
            <h1 className="text-3xl font-bold mb-6">{title}</h1>
          )}
          <div
            className="text-lg text-muted-foreground max-w-2xl leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      );

    case "split":
      return (
        <div className="h-full grid grid-cols-2 gap-0" style={bgStyle}>
          <div className="flex flex-col justify-center px-10 py-8">
            {title && (
              <h1 className="text-2xl font-bold mb-4">{title}</h1>
            )}
            <div
              className="text-base text-muted-foreground leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
          <div className="flex items-center justify-center bg-muted/30 overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={title ?? ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground/40 text-sm">No image</div>
            )}
          </div>
        </div>
      );

    case "image":
      return (
        <div className="h-full relative" style={bgStyle}>
          {image && (
            <img
              src={image}
              alt={title ?? ""}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative h-full flex flex-col items-center justify-center px-12 text-center text-white">
            {title && (
              <h1 className="text-3xl font-bold mb-6 drop-shadow-lg">{title}</h1>
            )}
            <div
              className="text-lg max-w-2xl leading-relaxed whitespace-pre-line drop-shadow-md"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      );

    case "default":
    default:
      return (
        <div className="h-full flex flex-col px-12 py-10" style={bgStyle}>
          {title && (
            <h1 className="text-2xl font-bold mb-6 flex-shrink-0">{title}</h1>
          )}
          <div
            className="flex-1 text-base text-muted-foreground leading-relaxed whitespace-pre-line overflow-auto"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      );
  }
}
