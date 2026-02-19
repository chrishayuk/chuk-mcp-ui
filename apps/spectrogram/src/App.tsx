import { useRef, useEffect, useMemo, useCallback } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { SpectrogramContent } from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper (postMessage / useView)                              */
/* ------------------------------------------------------------------ */

export function SpectrogramView() {
  const { data, content, isConnected } =
    useView<SpectrogramContent>("spectrogram", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <SpectrogramRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                    */
/* ------------------------------------------------------------------ */

export interface SpectrogramRendererProps {
  data: SpectrogramContent;
}

/* ------------------------------------------------------------------ */
/*  Colormap lookup tables (256 RGB triplets each)                    */
/* ------------------------------------------------------------------ */

type RGB = [number, number, number];

function buildLUT(stops: { t: number; rgb: RGB }[]): Uint8Array {
  const lut = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let s0 = stops[0];
    let s1 = stops[stops.length - 1];
    for (let j = 0; j < stops.length - 1; j++) {
      if (t >= stops[j].t && t <= stops[j + 1].t) {
        s0 = stops[j];
        s1 = stops[j + 1];
        break;
      }
    }
    const range = s1.t - s0.t;
    const local = range === 0 ? 0 : (t - s0.t) / range;
    lut[i * 3] = Math.round(s0.rgb[0] + (s1.rgb[0] - s0.rgb[0]) * local);
    lut[i * 3 + 1] = Math.round(s0.rgb[1] + (s1.rgb[1] - s0.rgb[1]) * local);
    lut[i * 3 + 2] = Math.round(s0.rgb[2] + (s1.rgb[2] - s0.rgb[2]) * local);
  }
  return lut;
}

const VIRIDIS_LUT = buildLUT([
  { t: 0.0, rgb: [68, 1, 84] },
  { t: 0.25, rgb: [59, 82, 139] },
  { t: 0.5, rgb: [33, 145, 140] },
  { t: 0.75, rgb: [94, 201, 98] },
  { t: 1.0, rgb: [253, 231, 37] },
]);

const MAGMA_LUT = buildLUT([
  { t: 0.0, rgb: [0, 0, 4] },
  { t: 0.25, rgb: [81, 18, 124] },
  { t: 0.5, rgb: [183, 55, 121] },
  { t: 0.75, rgb: [254, 159, 109] },
  { t: 1.0, rgb: [252, 253, 191] },
]);

const INFERNO_LUT = buildLUT([
  { t: 0.0, rgb: [0, 0, 4] },
  { t: 0.25, rgb: [87, 16, 110] },
  { t: 0.5, rgb: [188, 55, 84] },
  { t: 0.75, rgb: [249, 142, 9] },
  { t: 1.0, rgb: [252, 255, 164] },
]);

const GRAYSCALE_LUT = buildLUT([
  { t: 0.0, rgb: [0, 0, 0] },
  { t: 1.0, rgb: [255, 255, 255] },
]);

function getLUT(colorMap: string): Uint8Array {
  switch (colorMap) {
    case "magma":
      return MAGMA_LUT;
    case "inferno":
      return INFERNO_LUT;
    case "grayscale":
      return GRAYSCALE_LUT;
    default:
      return VIRIDIS_LUT;
  }
}

/* ------------------------------------------------------------------ */
/*  Axis helpers                                                      */
/* ------------------------------------------------------------------ */

function formatFrequency(hz: number): string {
  if (hz >= 1000) return `${(hz / 1000).toFixed(1)}k`;
  return `${Math.round(hz)}`;
}

function formatTime(seconds: number): string {
  if (seconds >= 1) return `${seconds.toFixed(1)}s`;
  return `${Math.round(seconds * 1000)}ms`;
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */

export function SpectrogramRenderer({ data }: SpectrogramRendererProps) {
  const {
    title,
    data: specData,
    frequencyRange,
    timeRange,
    colorMap = "viridis",
    showFrequencyAxis = true,
    showTimeAxis = true,
  } = data;

  const { sampleRate, fftSize, hopSize, magnitudes } = specData;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Compute axis ranges */
  const freqMin = frequencyRange?.min ?? 0;
  const freqMax = frequencyRange?.max ?? sampleRate / 2;
  const numFrames = magnitudes.length;
  const numBins = numFrames > 0 ? magnitudes[0].length : 0;
  const totalDuration = (numFrames * hopSize) / sampleRate;
  const timeStart = timeRange?.start ?? 0;
  const timeEnd = timeRange?.end ?? totalDuration;

  /* Margins for axis labels */
  const marginLeft = showFrequencyAxis ? 54 : 0;
  const marginBottom = showTimeAxis ? 28 : 0;
  const marginTop = 4;
  const marginRight = 4;

  /* Colormap LUT */
  const lut = useMemo(() => getLUT(colorMap), [colorMap]);

  /* Draw function */
  const draw = useCallback(
    (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");
      if (!ctx || numFrames === 0 || numBins === 0) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.scale(dpr, dpr);

      /* Clear */
      ctx.clearRect(0, 0, cssW, cssH);

      /* Plot area */
      const plotX = marginLeft;
      const plotY = marginTop;
      const plotW = cssW - marginLeft - marginRight;
      const plotH = cssH - marginTop - marginBottom;

      if (plotW <= 0 || plotH <= 0) return;

      /* Render spectrogram pixels into an offscreen ImageData */
      const imgW = Math.max(1, Math.round(plotW));
      const imgH = Math.max(1, Math.round(plotH));
      const imageData = ctx.createImageData(imgW, imgH);
      const pixels = imageData.data;

      /* Find min/max for normalisation */
      let magMin = Infinity;
      let magMax = -Infinity;
      for (let f = 0; f < numFrames; f++) {
        const row = magnitudes[f];
        for (let b = 0; b < numBins; b++) {
          const v = row[b];
          if (v < magMin) magMin = v;
          if (v > magMax) magMax = v;
        }
      }
      const magRange = magMax - magMin || 1;

      /* Map each pixel to its magnitude value */
      for (let py = 0; py < imgH; py++) {
        /* Y axis: frequency — bottom is low, top is high */
        /* py=0 is top of canvas = highest frequency */
        const binFrac = (1 - py / (imgH - 1)) * (numBins - 1);
        const binLow = Math.floor(binFrac);
        const binHigh = Math.min(binLow + 1, numBins - 1);
        const binLerp = binFrac - binLow;

        for (let px = 0; px < imgW; px++) {
          /* X axis: time — left to right */
          const frameFrac = (px / (imgW - 1)) * (numFrames - 1);
          const frameLow = Math.floor(frameFrac);
          const frameHigh = Math.min(frameLow + 1, numFrames - 1);
          const frameLerp = frameFrac - frameLow;

          /* Bilinear interpolation */
          const v00 = magnitudes[frameLow][binLow];
          const v01 = magnitudes[frameLow][binHigh];
          const v10 = magnitudes[frameHigh][binLow];
          const v11 = magnitudes[frameHigh][binHigh];

          const vTop = v00 + (v10 - v00) * frameLerp;
          const vBot = v01 + (v11 - v01) * frameLerp;
          const val = vTop + (vBot - vTop) * binLerp;

          /* Normalise to 0-255 index */
          const norm = (val - magMin) / magRange;
          const idx = Math.max(0, Math.min(255, Math.round(norm * 255)));

          const offset = (py * imgW + px) * 4;
          pixels[offset] = lut[idx * 3];
          pixels[offset + 1] = lut[idx * 3 + 1];
          pixels[offset + 2] = lut[idx * 3 + 2];
          pixels[offset + 3] = 255;
        }
      }

      /* Draw the image data onto the canvas at the plot area */
      const offscreen = new OffscreenCanvas(imgW, imgH);
      const offCtx = offscreen.getContext("2d")!;
      offCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(offscreen, plotX, plotY, plotW, plotH);

      /* Draw axes */
      const axisColor = getComputedStyle(canvas).getPropertyValue("color") || "#94a3b8";
      ctx.fillStyle = axisColor;
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 0.5;

      /* Frequency axis (left) */
      if (showFrequencyAxis) {
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        const freqTicks = 5;
        for (let i = 0; i <= freqTicks; i++) {
          const t = i / freqTicks;
          const freq = freqMin + (freqMax - freqMin) * t;
          const y = plotY + plotH - t * plotH;

          ctx.fillText(formatFrequency(freq), marginLeft - 6, y);

          /* Tick mark */
          ctx.beginPath();
          ctx.moveTo(marginLeft - 3, y);
          ctx.lineTo(marginLeft, y);
          ctx.stroke();
        }

        /* Axis label */
        ctx.save();
        ctx.translate(12, plotY + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("Hz", 0, 0);
        ctx.restore();
      }

      /* Time axis (bottom) */
      if (showTimeAxis) {
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const timeTicks = 5;
        for (let i = 0; i <= timeTicks; i++) {
          const t = i / timeTicks;
          const time = timeStart + (timeEnd - timeStart) * t;
          const x = plotX + t * plotW;

          ctx.fillText(formatTime(time), x, plotY + plotH + 4);

          /* Tick mark */
          ctx.beginPath();
          ctx.moveTo(x, plotY + plotH);
          ctx.lineTo(x, plotY + plotH + 3);
          ctx.stroke();
        }
      }
    },
    [
      magnitudes,
      numFrames,
      numBins,
      lut,
      freqMin,
      freqMax,
      timeStart,
      timeEnd,
      sampleRate,
      marginLeft,
      marginBottom,
      marginTop,
      marginRight,
      showFrequencyAxis,
      showTimeAxis,
    ],
  );

  /* ResizeObserver for responsive canvas sizing */
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const observer = new ResizeObserver(() => {
      draw(canvas);
    });

    observer.observe(container);
    draw(canvas);

    return () => observer.disconnect();
  }, [draw]);

  /* Colormap legend */
  const legendGradient = useMemo(() => {
    const stops: string[] = [];
    for (let i = 0; i <= 20; i++) {
      const idx = Math.round((i / 20) * 255);
      const r = lut[idx * 3];
      const g = lut[idx * 3 + 1];
      const b = lut[idx * 3 + 2];
      stops.push(`rgb(${r}, ${g}, ${b})`);
    }
    return `linear-gradient(to right, ${stops.join(", ")})`;
  }, [lut]);

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[900px] mx-auto p-6"
      >
        <Card>
          <CardContent className="p-6">
            {/* Header */}
            {title && (
              <h2 className="text-lg font-semibold mb-4">{title}</h2>
            )}

            {/* Canvas container */}
            <div
              ref={containerRef}
              className={cn(
                "relative w-full rounded-sm overflow-hidden",
                "bg-black/5 dark:bg-white/5",
              )}
              style={{ aspectRatio: "2 / 1", minHeight: "200px" }}
            >
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full text-muted-foreground"
                role="img"
                aria-label={
                  title
                    ? `Spectrogram: ${title}`
                    : `Spectrogram visualization (${numFrames} frames, ${numBins} frequency bins)`
                }
              />
            </div>

            {/* Colormap legend */}
            <div className="flex items-center gap-2 mt-4 px-1">
              <span className="text-xs text-muted-foreground tabular-nums">
                Low
              </span>
              <div
                className="flex-1 h-3 rounded-sm"
                style={{ background: legendGradient }}
              />
              <span className="text-xs text-muted-foreground tabular-nums">
                High
              </span>
            </div>

            {/* Metadata line */}
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>
                Sample rate: {(sampleRate / 1000).toFixed(1)} kHz
              </span>
              <span>FFT: {fftSize}</span>
              <span>Hop: {hopSize}</span>
              <span>Colormap: {colorMap}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
