import type { Meta, StoryObj } from "@storybook/react";
import { FunnelRenderer } from "./App";
import type { FunnelContent } from "./schema";

const meta = {
  title: "Views/Funnel",
  component: FunnelRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof FunnelRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: SalesConversion                                           */
/* ------------------------------------------------------------------ */

export const SalesConversion: Story = {
  args: {
    data: {
      type: "funnel",
      version: "1.0",
      title: "Sales Conversion Funnel",
      showConversion: true,
      stages: [
        { label: "Visitors", value: 12000, color: "#3b82f6" },
        { label: "Leads", value: 5200, color: "#6366f1" },
        { label: "Qualified", value: 2800, color: "#8b5cf6" },
        { label: "Proposals", value: 1400, color: "#a855f7" },
        { label: "Closed", value: 600, color: "#c084fc" },
      ],
    } satisfies FunnelContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: RecruitmentPipeline                                       */
/* ------------------------------------------------------------------ */

export const RecruitmentPipeline: Story = {
  args: {
    data: {
      type: "funnel",
      version: "1.0",
      title: "Recruitment Pipeline",
      stages: [
        { label: "Applied", value: 850, color: "#0ea5e9" },
        { label: "Screened", value: 340, color: "#14b8a6" },
        { label: "Interviewed", value: 120, color: "#22c55e" },
        { label: "Offered", value: 45, color: "#84cc16" },
        { label: "Hired", value: 28, color: "#eab308" },
      ],
    } satisfies FunnelContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3: WithMetadata                                              */
/* ------------------------------------------------------------------ */

export const WithMetadata: Story = {
  args: {
    data: {
      type: "funnel",
      version: "1.0",
      title: "E-Commerce Funnel",
      showConversion: true,
      stages: [
        {
          label: "Page Views",
          value: 50000,
          color: "#3b82f6",
          metadata: { source: "organic + paid", period: "Jan 2025" },
        },
        {
          label: "Add to Cart",
          value: 8500,
          color: "#6366f1",
          metadata: { avgItems: "2.3", topCategory: "electronics" },
        },
        {
          label: "Checkout Started",
          value: 4200,
          color: "#8b5cf6",
          metadata: { avgCartValue: "$127" },
        },
        {
          label: "Payment Complete",
          value: 3100,
          color: "#a855f7",
          metadata: { paymentMethod: "credit card 68%", couponUsed: "24%" },
        },
        {
          label: "Delivered",
          value: 2950,
          color: "#c084fc",
          metadata: { avgDeliveryDays: "3.2", returnRate: "4.1%" },
        },
      ],
    } satisfies FunnelContent,
  },
};
