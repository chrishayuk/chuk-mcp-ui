import { useRef, useState, useEffect } from "react";
import { CDN_BASE as BASE_URL } from "../config";

interface ViewThumbnailProps {
  viewType: string;
  data: object;
  theme?: "light" | "dark";
}

/**
 * Lazy-loading iframe thumbnail using IntersectionObserver.
 * Renders the iframe at 2x size and scales down to 0.5 for large, focused thumbnails.
 * pointer-events: none prevents interaction with the thumbnail.
 */
export function ViewThumbnail({ viewType, data, theme = "light" }: ViewThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let src = `${BASE_URL}/${viewType}/v1?theme=${theme}`;
  try {
    src = `${BASE_URL}/${viewType}/v1?theme=${theme}#${encodeURIComponent(JSON.stringify(data))}`;
  } catch { /* fallback to base */ }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-t-xl bg-muted"
      style={{ aspectRatio: "16/11" }}
    >
      {visible && (
        <iframe
          src={src}
          title={`Thumbnail: ${viewType}`}
          className="absolute top-0 left-0 border-none pointer-events-none"
          style={{
            width: "200%",
            height: "200%",
            transform: "scale(0.5)",
            transformOrigin: "top left",
          }}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      )}
      {!visible && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          Loading...
        </div>
      )}
    </div>
  );
}
