import { useRef, useEffect } from "react";
import { useView, Fallback, CSS_VARS } from "@chuk/view-shared";
import type { VideoContent } from "./schema";

export function VideoView() {
  const { data, content, isConnected } =
    useView<VideoContent>("video", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <VideoPlayer data={data} />;
}

function VideoPlayer({ data }: { data: VideoContent }) {
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: `var(${CSS_VARS.fontFamily})`,
        backgroundColor: `var(${CSS_VARS.colorBackground})`,
        color: `var(${CSS_VARS.colorText})`,
      }}
    >
      {data.title && (
        <div
          style={{
            padding: "8px 12px",
            fontSize: "15px",
            fontWeight: 600,
            borderBottom: `1px solid var(${CSS_VARS.colorBorder})`,
          }}
        >
          {data.title}
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <video
          ref={videoRef}
          src={data.url}
          controls
          autoPlay={data.autoplay}
          muted={data.muted}
          loop={data.loop}
          poster={data.poster}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: `var(${CSS_VARS.borderRadius})`,
          }}
        />
      </div>
    </div>
  );
}
