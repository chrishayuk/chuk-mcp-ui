import type { Meta, StoryObj } from "@storybook/react";
import { useRef } from "react";
import { useViewResize } from "./use-view-resize";
import type { Breakpoint } from "./use-view-resize";

const BREAKPOINT_COLORS: Record<Breakpoint, string> = {
  xs: "#ef4444",
  sm: "#f97316",
  md: "#eab308",
  lg: "#22c55e",
  xl: "#3b82f6",
};

function ResizeDemo({ breakpoints }: { breakpoints?: { sm: number; md: number; lg: number; xl: number } }) {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height, breakpoint } = useViewResize({ ref, debounceMs: 50, breakpoints });

  return (
    <div
      ref={ref}
      style={{
        resize: "both",
        overflow: "auto",
        border: `3px solid ${BREAKPOINT_COLORS[breakpoint]}`,
        borderRadius: 8,
        padding: 24,
        minWidth: 200,
        minHeight: 150,
        maxWidth: 1400,
        background: "var(--chuk-color-surface, #fff)",
      }}
    >
      <div style={{ fontFamily: "monospace", fontSize: 14, display: "grid", gap: 12 }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: BREAKPOINT_COLORS[breakpoint] }}>
          {breakpoint.toUpperCase()}
        </div>
        <div>
          <strong>{width}</strong> x <strong>{height}</strong> px
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {(["xs", "sm", "md", "lg", "xl"] as const).map((bp) => (
            <span
              key={bp}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: breakpoint === bp ? 700 : 400,
                background: breakpoint === bp ? BREAKPOINT_COLORS[bp] : "transparent",
                color: breakpoint === bp ? "#fff" : "#888",
                border: `1px solid ${BREAKPOINT_COLORS[bp]}`,
              }}
            >
              {bp}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#888", marginTop: 8 }}>
          Drag the bottom-right corner to resize
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Hooks/useViewResize",
  component: ResizeDemo,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof ResizeDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomBreakpoints: Story = {
  args: {
    breakpoints: { sm: 300, md: 500, lg: 700, xl: 900 },
  },
};
