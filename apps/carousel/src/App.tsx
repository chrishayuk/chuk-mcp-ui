import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useView, Fallback } from "@chuk/view-shared";
import { Button, cn } from "@chuk/view-ui";
import { fadeIn } from "@chuk/view-ui/animations";
import type { CarouselContent, CarouselItem } from "./schema";

export function CarouselView() {
  const { data, content, isConnected } =
    useView<CarouselContent>("carousel", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <CarouselRenderer data={data} />;
}

export interface CarouselRendererProps {
  data: CarouselContent;
}

export function CarouselRenderer({ data }: CarouselRendererProps) {
  const {
    title,
    items,
    autoPlay = false,
    autoPlayInterval = 5000,
    showDots = true,
    showArrows = true,
    loop = true,
    transition = "slide",
  } = data;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = items.length;

  const goTo = useCallback(
    (index: number) => {
      if (loop) {
        setActiveIndex(((index % total) + total) % total);
      } else {
        setActiveIndex(Math.max(0, Math.min(index, total - 1)));
      }
    },
    [loop, total],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Auto-play logic
  useEffect(() => {
    if (!autoPlay || isHovered || total <= 1) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      goTo(activeIndex + 1);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoPlay, autoPlayInterval, isHovered, total, activeIndex, goTo]);

  const canGoPrev = loop || activeIndex > 0;
  const canGoNext = loop || activeIndex < total - 1;

  if (total === 0) return <Fallback message="No carousel items provided" />;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col font-sans text-foreground bg-background"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title bar */}
      {title && (
        <div className="flex items-center px-3 py-1.5 border-b bg-muted">
          <span className="text-[15px] font-semibold">{title}</span>
        </div>
      )}

      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Slide track */}
        {transition === "slide" ? (
          <div
            className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="w-full h-full flex-shrink-0 flex items-center justify-center"
              >
                <SlideContent item={item} />
              </div>
            ))}
          </div>
        ) : (
          /* Fade transition */
          <div className="absolute inset-0">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out",
                  i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0",
                )}
              >
                <SlideContent item={item} />
              </div>
            ))}
          </div>
        )}

        {/* Previous arrow */}
        {showArrows && canGoPrev && (
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background"
          >
            &#8249;
          </Button>
        )}

        {/* Next arrow */}
        {showArrows && canGoNext && (
          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background"
          >
            &#8250;
          </Button>
        )}
      </div>

      {/* Dot indicators */}
      {showDots && total > 1 && (
        <div className="flex items-center justify-center gap-2 py-2 border-t bg-muted">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => goTo(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                i === activeIndex
                  ? "bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function SlideContent({ item }: { item: CarouselItem }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 w-full h-full">
      {item.image && (
        <img
          src={item.image.url}
          alt={item.image.alt ?? ""}
          className="max-w-full max-h-[60%] object-contain select-none"
          draggable={false}
        />
      )}
      {item.title && (
        <h3 className="text-lg font-semibold text-center">{item.title}</h3>
      )}
      {item.description && (
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {item.description}
        </p>
      )}
      {item.action && (
        <Button variant="outline" size="sm">
          {item.action.label}
        </Button>
      )}
    </div>
  );
}
