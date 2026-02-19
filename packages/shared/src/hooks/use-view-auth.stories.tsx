import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useViewAuth } from "./use-view-auth";
import type { AuthStatus } from "./use-view-auth";

const STATUS_COLORS: Record<AuthStatus, string> = {
  unauthenticated: "#9ca3af",
  pending: "#3b82f6",
  authenticated: "#22c55e",
  failed: "#ef4444",
};

function AuthDemo() {
  const [showAuth, setShowAuth] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { status, error, isAuthenticated, authenticate, logout, withAuth } =
    useViewAuth({
      onValidate: async (creds) => {
        await new Promise((r) => setTimeout(r, 600));
        return creds.value === "secret-key-123";
      },
    });

  const handleSubmit = async () => {
    setMessage(null);
    try {
      await withAuth(async () => {
        await new Promise((r) => setTimeout(r, 300));
        setMessage(`Report submitted for ${name} (${email})`);
      });
    } catch {
      setShowAuth(true);
    }
  };

  const handleAuthenticate = async () => {
    const ok = await authenticate({ type: "api-key", value: apiKey });
    if (ok) {
      setShowAuth(false);
      setApiKey("");
      handleSubmit();
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 420, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Report Form</span>
        <span
          style={{
            padding: "2px 10px",
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 600,
            color: "#fff",
            background: STATUS_COLORS[status],
          }}
        >
          {status}
        </span>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleSubmit} style={btnStyle}>
          Submit Report
        </button>
      </div>

      {showAuth && !isAuthenticated && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
            Authentication Required
          </div>
          <input
            placeholder="API Key (try: secret-key-123)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={inputStyle}
          />
          {error && (
            <div style={{ fontSize: 12, color: "#ef4444" }}>{error}</div>
          )}
          <button
            onClick={handleAuthenticate}
            disabled={status === "pending"}
            style={{ ...btnStyle, background: "#3b82f6", color: "#fff", border: "none" }}
          >
            {status === "pending" ? "Validating..." : "Authenticate"}
          </button>
        </div>
      )}

      {message && (
        <div
          style={{
            padding: 10,
            borderRadius: 6,
            background: "#f0fdf4",
            color: "#16a34a",
            fontSize: 13,
          }}
        >
          {message}
        </div>
      )}

      {isAuthenticated && (
        <button onClick={logout} style={{ ...btnStyle, color: "#ef4444", borderColor: "#ef4444" }}>
          Logout
        </button>
      )}

      <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>
        status: {status} | isAuthenticated: {String(isAuthenticated)} | error: {error ?? "null"}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 13,
};

const btnStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 6,
  border: "1px solid #ddd",
  background: "#f0f0f0",
  cursor: "pointer",
  fontSize: 13,
};

const meta = {
  title: "Hooks/useViewAuth",
  component: AuthDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof AuthDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AuthGatedForm: Story = {};
