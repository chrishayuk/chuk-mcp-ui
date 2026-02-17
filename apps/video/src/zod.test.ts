import { describe, it, expect } from "vitest";
import { videoSchema } from "./zod";

describe("video zod schema validation", () => {
  it("accepts minimal valid input", () => {
    const data = { type: "video", version: "1.0", url: "https://example.com/video.mp4" };
    expect(videoSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full input with all optional fields", () => {
    const data = {
      type: "video",
      version: "1.0",
      url: "https://example.com/video.mp4",
      title: "Demo Video",
      autoplay: true,
      muted: true,
      loop: true,
      poster: "https://example.com/poster.jpg",
      startTime: 30,
    };
    expect(videoSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing url", () => {
    const data = { type: "video", version: "1.0" };
    expect(videoSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = { version: "1.0", url: "https://example.com/video.mp4" };
    expect(videoSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = { type: "chart", version: "1.0", url: "https://example.com/video.mp4" };
    expect(videoSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = { type: "video", version: "2.0", url: "https://example.com/video.mp4" };
    expect(videoSchema.safeParse(data).success).toBe(false);
  });

  it("rejects negative startTime", () => {
    const data = { type: "video", version: "1.0", url: "https://example.com/video.mp4", startTime: -5 };
    expect(videoSchema.safeParse(data).success).toBe(false);
  });

  it("accepts startTime of zero", () => {
    const data = { type: "video", version: "1.0", url: "https://example.com/video.mp4", startTime: 0 };
    expect(videoSchema.safeParse(data).success).toBe(true);
  });
});
