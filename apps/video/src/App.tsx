import { useRef, useEffect } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import type { VideoContent } from "./schema";

export function VideoView() {
  const { data, content, isConnected } =
    useView<VideoContent>("video", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <VideoPlayer data={data} />;
}

export function VideoPlayer({ data }: { data: VideoContent }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !data.startTime) return;

    const handleMetadata = () => {
      video.currentTime = data.startTime!;
    };

    video.addEventListener("loadedmetadata", handleMetadata);
    return () => video.removeEventListener("loadedmetadata", handleMetadata);
  }, [data.startTime]);

  return (
    <div className="flex flex-col h-full font-sans bg-background text-foreground">
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
    </div>
  );
}
