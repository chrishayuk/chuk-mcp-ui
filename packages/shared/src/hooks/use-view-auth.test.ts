import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewAuth } from "./use-view-auth";

// ── Mock App ────────────────────────────────────────────────────────

function createMockApp(resolveWith: unknown = { ok: true }) {
  return {
    callServerTool: vi.fn().mockResolvedValue(resolveWith),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useViewAuth", () => {
  it("starts unauthenticated with no error", () => {
    const { result } = renderHook(() => useViewAuth());
    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.error).toBeNull();
  });

  it("isAuthenticated is false initially", () => {
    const { result } = renderHook(() => useViewAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("transitions to pending then authenticated on successful validation", async () => {
    const onValidate = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useViewAuth({ onValidate }));

    await act(async () => {
      const ok = await result.current.authenticate({
        type: "api-key",
        value: "secret-key-123",
      });
      expect(ok).toBe(true);
    });

    expect(result.current.status).toBe("authenticated");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("transitions to pending then failed on validation error", async () => {
    const onValidate = vi.fn().mockResolvedValue(false);
    const { result } = renderHook(() => useViewAuth({ onValidate }));

    await act(async () => {
      const ok = await result.current.authenticate({
        type: "password",
        value: "wrong",
      });
      expect(ok).toBe(false);
    });

    expect(result.current.status).toBe("failed");
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe("Invalid credentials");
  });

  it("uses custom onValidate when provided", async () => {
    const onValidate = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useViewAuth({ onValidate }));

    await act(async () => {
      await result.current.authenticate({
        type: "api-key",
        value: "my-key",
        username: "admin",
      });
    });

    expect(onValidate).toHaveBeenCalledWith({
      type: "api-key",
      value: "my-key",
      username: "admin",
    });
  });

  it("uses app.callServerTool when onValidate is not provided", async () => {
    const mockApp = createMockApp();
    const { result } = renderHook(() =>
      useViewAuth({ app: mockApp as any, validationTool: "check-key" })
    );

    await act(async () => {
      await result.current.authenticate({
        type: "api-key",
        value: "abc",
      });
    });

    expect(mockApp.callServerTool).toHaveBeenCalledWith({
      name: "check-key",
      arguments: { type: "api-key", value: "abc", username: undefined },
    });
    expect(result.current.status).toBe("authenticated");
  });

  it("withAuth() executes fn when authenticated", async () => {
    const onValidate = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useViewAuth({ onValidate }));

    await act(async () => {
      await result.current.authenticate({ type: "api-key", value: "key" });
    });

    const value = await result.current.withAuth(async () => 42);
    expect(value).toBe(42);
  });

  it("withAuth() rejects when not authenticated", async () => {
    const { result } = renderHook(() => useViewAuth());

    await expect(result.current.withAuth(async () => 42)).rejects.toThrow(
      "Authentication required"
    );
  });

  it("logout() resets to unauthenticated", async () => {
    const onValidate = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useViewAuth({ onValidate }));

    await act(async () => {
      await result.current.authenticate({ type: "api-key", value: "key" });
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("fires onAuthenticated callback on success", async () => {
    const onAuthenticated = vi.fn();
    const onValidate = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useViewAuth({ onValidate, onAuthenticated })
    );

    await act(async () => {
      await result.current.authenticate({ type: "api-key", value: "key" });
    });

    expect(onAuthenticated).toHaveBeenCalledTimes(1);
  });

  it("fires onAuthFailed callback with error message on failure", async () => {
    const onAuthFailed = vi.fn();
    const onValidate = vi.fn().mockResolvedValue(false);
    const { result } = renderHook(() =>
      useViewAuth({ onValidate, onAuthFailed })
    );

    await act(async () => {
      await result.current.authenticate({ type: "password", value: "bad" });
    });

    expect(onAuthFailed).toHaveBeenCalledWith("Invalid credentials");
  });

  it("authenticate can be called again after failure (retry)", async () => {
    let attempt = 0;
    const onValidate = vi.fn().mockImplementation(async () => {
      attempt++;
      return attempt >= 2;
    });
    const { result } = renderHook(() => useViewAuth({ onValidate }));

    await act(async () => {
      const first = await result.current.authenticate({ type: "api-key", value: "bad" });
      expect(first).toBe(false);
    });
    expect(result.current.status).toBe("failed");

    await act(async () => {
      const second = await result.current.authenticate({ type: "api-key", value: "good" });
      expect(second).toBe(true);
    });
    expect(result.current.status).toBe("authenticated");
    expect(result.current.error).toBeNull();
  });
});
