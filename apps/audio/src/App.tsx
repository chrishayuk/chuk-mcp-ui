import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent, Button, Slider } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { AudioContent, AudioRegion } from "./schema";

/* ------------------------------------------------------------------ */
/*  AudioView — connected component with useView                       */
/* ------------------------------------------------------------------ */

export function AudioView() {
  const { data, content, isConnected } =
    useView<AudioContent>("audio", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <AudioRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  AudioRenderer — pure rendering component                           */
/* ------------------------------------------------------------------ */

export interface AudioRendererProps {
  data: AudioContent;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const DEFAULT_BAR_COUNT = 100;

export function AudioRenderer({ data }: AudioRendererProps) {
  const {
    title,
    url,
    waveform,
    duration: propDuration,
    regions,
    autoplay = false,
    loop = false,
  } = data;

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(propDuration ?? 0);
  const [volume, setVolume] = useState(1);

  /* ---------- normalised waveform data ---------- */
  const bars = useMemo(() => {
    if (waveform && waveform.length > 0) return waveform;
    // Generate a placeholder waveform when none is provided
    const count = DEFAULT_BAR_COUNT;
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      out.push(0.15 + Math.random() * 0.35);
    }
    return out;
  }, [waveform]);

  /* ---------- animation loop for smooth playhead ---------- */
  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      setCurrentTime(audio.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  /* ---------- audio event handlers ---------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
    };
    const onEnded = () => {
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
    };
    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  /* ---------- volume sync ---------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  /* ---------- canvas drawing ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const barCount = bars.length;
    const gap = 2;
    const barWidth = Math.max(1, (w - gap * (barCount - 1)) / barCount);
    const progress = duration > 0 ? currentTime / duration : 0;

    ctx.clearRect(0, 0, w, h);

    // Compute CSS custom property colours from the document
    const style = getComputedStyle(document.documentElement);
    const primaryColor =
      style.getPropertyValue("--color-primary").trim() || "#3b82f6";
    const mutedColor =
      style.getPropertyValue("--color-muted").trim() || "#e5e7eb";
    const foregroundColor =
      style.getPropertyValue("--color-foreground").trim() || "#111827";

    /* --- draw region overlays --- */
    if (regions && regions.length > 0 && duration > 0) {
      for (const region of regions) {
        const x1 = (region.start / duration) * w;
        const x2 = (region.end / duration) * w;
        ctx.fillStyle = region.color ?? "rgba(59,130,246,0.15)";
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x1, 0, x2 - x1, h);
        ctx.globalAlpha = 1;

        if (region.label) {
          ctx.fillStyle = region.color ?? foregroundColor;
          ctx.globalAlpha = 0.7;
          ctx.font = "10px sans-serif";
          ctx.fillText(region.label, x1 + 3, 12);
          ctx.globalAlpha = 1;
        }
      }
    }

    /* --- draw waveform bars --- */
    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + gap);
      const amp = bars[i];
      const barHeight = Math.max(2, amp * h * 0.9);
      const y = (h - barHeight) / 2;

      const barProgress = (i + 1) / barCount;
      ctx.fillStyle = barProgress <= progress ? primaryColor : mutedColor;
      ctx.fillRect(x, y, barWidth, barHeight);
    }

    /* --- draw playhead line --- */
    if (duration > 0) {
      const playheadX = progress * w;
      ctx.strokeStyle = foregroundColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, h);
      ctx.stroke();
    }
  }, [bars, currentTime, duration, regions]);

  /* ---------- resize observer for responsive canvas ---------- */
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(() => {
      // Trigger a re-render by forcing a state update
      setCurrentTime((t) => t);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  /* ---------- click-to-seek on waveform ---------- */
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const audio = audioRef.current;
      if (!canvas || !audio || duration <= 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      audio.currentTime = ratio * duration;
      setCurrentTime(audio.currentTime);
    },
    [duration],
  );

  /* ---------- play / pause toggle ---------- */
  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }, []);

  /* ---------- volume change ---------- */
  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
  }, []);

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[700px] mx-auto p-4"
      >
        <Card>
          <CardContent className="p-5">
            {/* Hidden native audio element */}
            <audio
              ref={audioRef}
              src={url}
              autoPlay={autoplay}
              loop={loop}
              preload="metadata"
            />

            {/* Title */}
            {title && (
              <h2 className="text-lg font-semibold mb-3">{title}</h2>
            )}

            {/* Waveform canvas */}
            <div
              ref={containerRef}
              className="relative w-full h-24 mb-3 cursor-pointer rounded-md overflow-hidden bg-muted/30"
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                onClick={handleCanvasClick}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-3">
              {/* Play / Pause button */}
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayback}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex-shrink-0"
              >
                {isPlaying ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
              </Button>

              {/* Time display */}
              <span className="text-sm tabular-nums text-muted-foreground min-w-[90px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Volume control */}
              <div className="flex items-center gap-2 min-w-[120px]">
                <VolumeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                  aria-label="Volume"
                />
              </div>
            </div>

            {/* Region legend */}
            {regions && regions.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t">
                {regions.map((region) => (
                  <RegionLabel key={region.id} region={region} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Region label chip                                                  */
/* ------------------------------------------------------------------ */

function RegionLabel({ region }: { region: AudioRegion }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="w-3 h-3 rounded-sm flex-shrink-0"
        style={{ backgroundColor: region.color ?? "#3b82f6", opacity: 0.5 }}
      />
      <span>{region.label ?? region.id}</span>
      <span className="tabular-nums">
        {formatTime(region.start)}&ndash;{formatTime(region.end)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function VolumeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}
