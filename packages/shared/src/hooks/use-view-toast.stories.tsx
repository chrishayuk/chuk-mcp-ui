import type { Meta, StoryObj } from "@storybook/react";
import { useViewToast } from "./use-view-toast";
import type { ToastSeverity } from "./use-view-toast";

const severityColors: Record<ToastSeverity, { bg: string; badge: string; text: string }> = {
  success: { bg: "#f0fdf4", badge: "#16a34a", text: "#15803d" },
  error:   { bg: "#fef2f2", badge: "#dc2626", text: "#b91c1c" },
  warning: { bg: "#fffbeb", badge: "#d97706", text: "#b45309" },
  info:    { bg: "#eff6ff", badge: "#2563eb", text: "#1d4ed8" },
};

function ToastDemo() {
  const { toasts, success, error, warning, info, dismiss, dismissAll } =
    useViewToast({ defaultDuration: 4000, maxToasts: 5 });

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => success("Operation completed!")} style={{ ...btnStyle, background: "#dcfce7", borderColor: "#86efac" }}>
          Success
        </button>
        <button onClick={() => error("Something went wrong.")} style={{ ...btnStyle, background: "#fee2e2", borderColor: "#fca5a5" }}>
          Error
        </button>
        <button onClick={() => warning("Check your input.")} style={{ ...btnStyle, background: "#fef3c7", borderColor: "#fcd34d" }}>
          Warning
        </button>
        <button onClick={() => info("New update available.")} style={{ ...btnStyle, background: "#dbeafe", borderColor: "#93c5fd" }}>
          Info
        </button>
      </div>

      <button onClick={dismissAll} style={{ ...btnStyle, background: "#f3f4f6", borderColor: "#d1d5db" }}>
        Dismiss All
      </button>

      {/* Toast display area */}
      <div
        style={{
          display: "grid",
          gap: 8,
          minHeight: 80,
          padding: 12,
          border: "1px dashed #d1d5db",
          borderRadius: 8,
          background: "#fafafa",
        }}
      >
        {toasts.length === 0 && (
          <div style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", padding: 16 }}>
            No toasts — click a button above
          </div>
        )}

        {toasts.map((t) => {
          const colors = severityColors[t.severity];
          return (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 8,
                background: colors.bg,
                border: `1px solid ${colors.badge}33`,
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "#fff",
                  background: colors.badge,
                  padding: "2px 8px",
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              >
                {t.severity}
              </span>
              <span style={{ flex: 1, fontSize: 14, color: colors.text }}>{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: colors.text,
                  padding: "0 4px",
                  lineHeight: 1,
                  opacity: 0.6,
                }}
              >
                X
              </button>
            </div>
          );
        })}
      </div>

      {/* Debug footer */}
      <div style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>
        toasts.length: {toasts.length}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 16px",
  borderRadius: 6,
  border: "1px solid #ddd",
  cursor: "pointer",
  fontSize: 14,
};

const meta = {
  title: "Hooks/useViewToast",
  component: ToastDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
