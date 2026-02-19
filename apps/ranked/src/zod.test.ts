import { describe, it, expect } from "vitest";
import { rankedSchema } from "./zod";

describe("ranked zod schema validation", () => {
  it("accepts minimal valid ranked content", () => {
    const data = {
      type: "ranked",
      version: "1.0",
      items: [{ id: "1", rank: 1, title: "First", score: 100 }],
    };
    expect(rankedSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full ranked content with all optional fields", () => {
    const data = {
      type: "ranked",
      version: "1.0",
      title: "Top Results",
      maxScore: 100,
      showDelta: true,
      scoreLabel: "Relevance",
      scoreSuffix: "%",
      items: [
        {
          id: "1",
          rank: 1,
          title: "First Item",
          subtitle: "Description here",
          score: 95,
          previousRank: 2,
          badges: [
            { label: "Hot" },
            { label: "New", variant: "secondary" },
            { label: "Featured", variant: "outline" },
          ],
          metadata: { author: "Jane", year: "2024" },
          image: { url: "https://example.com/photo.jpg", alt: "Photo" },
          actions: [
            { label: "View", tool: "view_item", arguments: { id: "1" } },
          ],
        },
      ],
    };
    expect(rankedSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all badge variants", () => {
    const variants = ["default", "secondary", "outline"];
    for (const variant of variants) {
      const data = {
        type: "ranked",
        version: "1.0",
        items: [
          {
            id: "1",
            rank: 1,
            title: "Test",
            score: 10,
            badges: [{ label: "Tag", variant }],
          },
        ],
      };
      expect(rankedSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing items", () => {
    const data = {
      type: "ranked",
      version: "1.0",
    };
    expect(rankedSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "detail",
      version: "1.0",
      items: [{ id: "1", rank: 1, title: "Test", score: 10 }],
    };
    expect(rankedSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "ranked",
      items: [{ id: "1", rank: 1, title: "Test", score: 10 }],
    };
    expect(rankedSchema.safeParse(data).success).toBe(false);
  });

  it("rejects item missing required id", () => {
    const data = {
      type: "ranked",
      version: "1.0",
      items: [{ rank: 1, title: "Test", score: 10 }],
    };
    expect(rankedSchema.safeParse(data).success).toBe(false);
  });

  it("rejects item missing required score", () => {
    const data = {
      type: "ranked",
      version: "1.0",
      items: [{ id: "1", rank: 1, title: "Test" }],
    };
    expect(rankedSchema.safeParse(data).success).toBe(false);
  });
});
