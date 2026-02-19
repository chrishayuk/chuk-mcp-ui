import type { Meta, StoryObj } from "@storybook/react";
import { RankedRenderer } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { RankedContent } from "./schema";

const meta = {
  title: "Views/Ranked",
  component: RankedRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof RankedRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1 -- Search Results                                         */
/* ------------------------------------------------------------------ */

export const SearchResults: Story = {
  args: {
    data: {
      type: "ranked",
      version: "1.0",
      title: "Search Results",
      scoreLabel: "Relevance",
      scoreSuffix: "%",
      maxScore: 100,
      items: [
        { id: "r1",  rank: 1,  title: "Introduction to Machine Learning",     subtitle: "A comprehensive guide to ML fundamentals",           score: 98, metadata: { author: "Dr. Smith", year: "2024" } },
        { id: "r2",  rank: 2,  title: "Deep Learning with Python",            subtitle: "Hands-on neural network programming",                score: 94, metadata: { author: "F. Chollet", year: "2023" } },
        { id: "r3",  rank: 3,  title: "Statistical Learning Theory",          subtitle: "Mathematical foundations of learning algorithms",     score: 89, metadata: { author: "V. Vapnik", year: "2022" } },
        { id: "r4",  rank: 4,  title: "Natural Language Processing in Action", subtitle: "Building NLP pipelines from scratch",                score: 85, metadata: { author: "H. Lane", year: "2023" } },
        { id: "r5",  rank: 5,  title: "Reinforcement Learning: An Introduction", subtitle: "Classic RL textbook, updated edition",            score: 82, metadata: { author: "R. Sutton", year: "2024" } },
        { id: "r6",  rank: 6,  title: "Computer Vision: Algorithms and Applications", subtitle: "Modern approaches to visual recognition",    score: 76, metadata: { author: "R. Szeliski", year: "2022" } },
        { id: "r7",  rank: 7,  title: "Data Science from Scratch",            subtitle: "First principles with Python",                       score: 71, metadata: { author: "J. Grus", year: "2023" } },
        { id: "r8",  rank: 8,  title: "Bayesian Reasoning and Machine Learning", subtitle: "Probabilistic approaches to intelligence",        score: 65, metadata: { author: "D. Barber", year: "2022" } },
        { id: "r9",  rank: 9,  title: "Pattern Recognition and ML",           subtitle: "Bishop's comprehensive reference",                   score: 58, metadata: { author: "C. Bishop", year: "2021" } },
        { id: "r10", rank: 10, title: "The Elements of Statistical Learning",  subtitle: "Data mining, inference, and prediction",             score: 52, metadata: { author: "Hastie et al.", year: "2021" } },
      ],
    } satisfies RankedContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2 -- Leaderboard                                            */
/* ------------------------------------------------------------------ */

export const Leaderboard: Story = {
  args: {
    data: {
      type: "ranked",
      version: "1.0",
      title: "Weekly Leaderboard",
      scoreLabel: "Points earned this week",
      scoreSuffix: " pts",
      maxScore: 1500,
      showDelta: true,
      items: [
        { id: "p1", rank: 1, title: "Alice Chen",     score: 1480, previousRank: 2, image: { url: "https://i.pravatar.cc/80?u=alice",  alt: "Alice" } },
        { id: "p2", rank: 2, title: "Bob Martinez",   score: 1350, previousRank: 1, image: { url: "https://i.pravatar.cc/80?u=bob",    alt: "Bob" } },
        { id: "p3", rank: 3, title: "Carol Williams", score: 1220, previousRank: 3, image: { url: "https://i.pravatar.cc/80?u=carol",  alt: "Carol" } },
        { id: "p4", rank: 4, title: "David Kim",      score: 1100, previousRank: 6, image: { url: "https://i.pravatar.cc/80?u=david",  alt: "David" } },
        { id: "p5", rank: 5, title: "Eva Novak",      score: 980,  previousRank: 4, image: { url: "https://i.pravatar.cc/80?u=eva",    alt: "Eva" } },
      ],
    } satisfies RankedContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3 -- Recommendations                                       */
/* ------------------------------------------------------------------ */

export const Recommendations: Story = {
  args: {
    data: {
      type: "ranked",
      version: "1.0",
      title: "Recommended For You",
      scoreLabel: "Match score",
      scoreSuffix: "%",
      maxScore: 100,
      items: [
        {
          id: "rec1", rank: 1, title: "Wireless Noise-Cancelling Headphones", subtitle: "Premium audio experience", score: 97,
          image: { url: "https://picsum.photos/seed/headphones/80", alt: "Headphones" },
          badges: [{ label: "Best Seller" }, { label: "Prime", variant: "secondary" }],
          actions: [{ label: "View Details", tool: "view_product", arguments: { productId: "rec1" } }],
        },
        {
          id: "rec2", rank: 2, title: "Ergonomic Standing Desk", subtitle: "Height-adjustable bamboo top", score: 93,
          image: { url: "https://picsum.photos/seed/desk/80", alt: "Standing desk" },
          badges: [{ label: "New", variant: "outline" }],
          actions: [{ label: "View Details", tool: "view_product", arguments: { productId: "rec2" } }],
        },
        {
          id: "rec3", rank: 3, title: "Mechanical Keyboard", subtitle: "Hot-swappable switches, RGB backlight", score: 88,
          image: { url: "https://picsum.photos/seed/keyboard/80", alt: "Keyboard" },
          badges: [{ label: "Popular", variant: "secondary" }],
          actions: [{ label: "View Details", tool: "view_product", arguments: { productId: "rec3" } }],
        },
        {
          id: "rec4", rank: 4, title: "Ultra-wide Monitor 34\"", subtitle: "3440x1440 curved display", score: 84,
          image: { url: "https://picsum.photos/seed/monitor/80", alt: "Monitor" },
          badges: [{ label: "Top Rated" }],
          actions: [{ label: "View Details", tool: "view_product", arguments: { productId: "rec4" } }],
        },
        {
          id: "rec5", rank: 5, title: "USB-C Docking Station", subtitle: "Triple display, 100W PD charging", score: 79,
          image: { url: "https://picsum.photos/seed/dock/80", alt: "Docking station" },
          badges: [{ label: "Editor's Choice", variant: "outline" }],
          actions: [{ label: "View Details", tool: "view_product", arguments: { productId: "rec5" } }],
        },
        {
          id: "rec6", rank: 6, title: "Webcam 4K HDR", subtitle: "Auto-framing, built-in mic", score: 72,
          image: { url: "https://picsum.photos/seed/webcam/80", alt: "Webcam" },
          badges: [{ label: "Sale", variant: "secondary" }],
          actions: [{ label: "View Details", tool: "view_product", arguments: { productId: "rec6" } }],
        },
      ],
    } satisfies RankedContent,
    onCallTool: mockCallTool,
  },
};
