import { useState, useEffect, useRef } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

export interface ViewResizeState {
  width: number;
  height: number;
  breakpoint: Breakpoint;
}

interface UseViewResizeOptions {
  ref?: React.RefObject<HTMLElement>;
  debounceMs?: number;
  breakpoints?: { sm: number; md: number; lg: number; xl: number };
}

const DEFAULT_BREAKPOINTS = { sm: 480, md: 768, lg: 1024, xl: 1280 };

function getBreakpoint(
  width: number,
  bp: { sm: number; md: number; lg: number; xl: number }
): Breakpoint {
  if (width >= bp.xl) return "xl";
  if (width >= bp.lg) return "lg";
  if (width >= bp.md) return "md";
  if (width >= bp.sm) return "sm";
  return "xs";
}

function getInitialSize(el: HTMLElement | null): { width: number; height: number } {
  if (!el) return { width: 0, height: 0 };
  return { width: el.clientWidth, height: el.clientHeight };
}

export function useViewResize(options: UseViewResizeOptions = {}): ViewResizeState {
  const { debounceMs = 150, breakpoints = DEFAULT_BREAKPOINTS } = options;
  const bpRef = useRef(breakpoints);
  bpRef.current = breakpoints;

  const [state, setState] = useState<ViewResizeState>(() => {
    const el = options.ref?.current ?? document.documentElement;
    const { width, height } = getInitialSize(el);
    return { width, height, breakpoint: getBreakpoint(width, breakpoints) };
  });

  useEffect(() => {
    const el = options.ref?.current ?? document.documentElement;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const observer = new ResizeObserver((entries) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        const { width, height } = entry.contentRect;
        const w = Math.round(width);
        const h = Math.round(height);
        setState((prev) => {
          const bp = getBreakpoint(w, bpRef.current);
          if (prev.width === w && prev.height === h && prev.breakpoint === bp) {
            return prev;
          }
          return { width: w, height: h, breakpoint: bp };
        });
      }, debounceMs);
    });

    observer.observe(el);

    // Sync initial size after mount (ref may not have been ready during useState init)
    const { width, height } = getInitialSize(el);
    const w = Math.round(width);
    const h = Math.round(height);
    setState((prev) => {
      const bp = getBreakpoint(w, bpRef.current);
      if (prev.width === w && prev.height === h && prev.breakpoint === bp) {
        return prev;
      }
      return { width: w, height: h, breakpoint: bp };
    });

    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [options.ref, debounceMs]);

  return state;
}
