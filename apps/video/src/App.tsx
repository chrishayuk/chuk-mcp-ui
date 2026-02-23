import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import { useView } from "@chuk/view-shared";
import type { VideoContent } from "./schema";

export function VideoView() {
  const { data } =
    useView<VideoContent>("video", "1.0");

  if (!data) return null;

  return <VideoPlayer data={data} />;
}

export function VideoPlayer({ data }: { data: VideoContent }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set initial startTime on first metadata load
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !data.startTime) return;

    const handleMetadata = () => {
      video.currentTime = data.startTime!;
    };

    video.addEventListener("loadedmetadata", handleMetadata);
    return () => video.removeEventListener("loadedmetadata", handleMetadata);
  }, [data.startTime]);

  // React to playing state changes (from patches)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || data.playing === undefined) return;

    if (data.playing) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [data.playing]);

  // React to currentTime seek commands (from patches)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || data.currentTime === undefined) return;

    video.currentTime = data.currentTime;
  }, [data.currentTime]);

  // React to playbackRate changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || data.playbackRate === undefined) return;

    video.playbackRate = data.playbackRate;
  }, [data.playbackRate]);

  // React to volume changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || data.volume === undefined) return;

    video.volume = data.volume;
  }, [data.volume]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full font-sans bg-background text-foreground"
    >
      {data.title && (
        <div className="px-3 py-2 text-[15px] font-semibold border-b">
          {data.title}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <video
          ref={videoRef}
          src={data.url}
          controls
          autoPlay={data.autoplay}
          muted={data.muted}
          loop={data.loop}
          poster={data.poster}
          className="max-w-full max-h-full rounded-md"
        />
      </div>
    </motion.div>
  );
}
