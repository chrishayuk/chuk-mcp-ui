import type { Meta, StoryObj } from "@storybook/react";
import { useViewNavigation } from "./use-view-navigation";

const ITEMS = [
  { id: "1", name: "Roman Villa", period: "Roman" },
  { id: "2", name: "Saxon Church", period: "Saxon" },
  { id: "3", name: "Medieval Castle", period: "Medieval" },
  { id: "4", name: "Tudor Manor", period: "Tudor" },
];

function NavigationDemo() {
  const nav = useViewNavigation({
    initialRoute: { target: "list", params: {} },
  });

  const screen = nav.current?.target ?? "list";
  const params = nav.current?.params ?? {};

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, display: "grid", gap: 16 }}>
      {/* ── Toolbar ──────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={nav.goBack} disabled={!nav.canGoBack} style={btnStyle}>
          Back
        </button>
        <button onClick={nav.goForward} disabled={!nav.canGoForward} style={btnStyle}>
          Forward
        </button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>
          {nav.stack.map((e, i) => (
            <span key={i} style={{ fontWeight: i === nav.currentIndex ? 700 : 400 }}>
              {i > 0 && " / "}
              {e.target}
            </span>
          ))}
        </span>
      </div>

      {/* ── Screens ──────────────────────────────────── */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, minHeight: 160 }}>
        {screen === "list" && (
          <div>
            <h3 style={{ margin: "0 0 12px" }}>Heritage Sites</h3>
            {ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => nav.push("detail", { id: item.id, name: item.name })}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                  fontSize: 14,
                }}
              >
                {item.name} — <span style={{ color: "#888" }}>{item.period}</span>
              </div>
            ))}
          </div>
        )}

        {screen === "detail" && (
          <div>
            <h3 style={{ margin: "0 0 12px" }}>Detail: {String(params.name)}</h3>
            <p style={{ fontSize: 14, color: "#555" }}>ID: {String(params.id)}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => nav.push("edit", params)} style={btnStyle}>
                Edit
              </button>
              <button onClick={nav.goBack} style={btnStyle}>
                Back
              </button>
            </div>
          </div>
        )}

        {screen === "edit" && (
          <div>
            <h3 style={{ margin: "0 0 12px" }}>Edit: {String(params.name)}</h3>
            <input
              defaultValue={String(params.name ?? "")}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", width: "100%" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => nav.replace("detail", params)} style={btnStyle}>
                Save
              </button>
              <button onClick={nav.goBack} style={btnStyle}>
                Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Debug footer ─────────────────────────────── */}
      <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>
        stack: [{nav.stack.map((e) => e.target).join(", ")}] | index:{" "}
        {nav.currentIndex} | back: {String(nav.canGoBack)} | fwd:{" "}
        {String(nav.canGoForward)}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 6,
  border: "1px solid #ddd",
  background: "#fafafa",
  cursor: "pointer",
  fontSize: 13,
};

const meta = {
  title: "Hooks/useViewNavigation",
  component: NavigationDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof NavigationDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
