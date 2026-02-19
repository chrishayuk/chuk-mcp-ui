import { useState, useCallback, useRef } from "react";
import type { App } from "@modelcontextprotocol/ext-apps";

export type AuthStatus = "unauthenticated" | "pending" | "authenticated" | "failed";
export type AuthType = "password" | "api-key" | "oauth-token";

export interface AuthCredentials {
  type: AuthType;
  value: string;
  username?: string;
}

export interface ViewAuthState {
  status: AuthStatus;
  error: string | null;
  isAuthenticated: boolean;
  authenticate: (credentials: AuthCredentials) => Promise<boolean>;
  logout: () => void;
  withAuth: <T>(fn: () => Promise<T>) => Promise<T>;
}

interface UseViewAuthOptions {
  app?: App | null;
  validationTool?: string;
  authType?: AuthType;
  onValidate?: (credentials: AuthCredentials) => Promise<boolean>;
  onAuthenticated?: () => void;
  onAuthFailed?: (error: string) => void;
}

/**
 * Authentication gating hook for MCP Views.
 *
 * Provides a state machine (unauthenticated -> pending -> authenticated | failed),
 * credential validation via a custom callback or an MCP server tool, and a
 * `withAuth` guard that rejects unauthenticated calls.
 *
 * Credentials are stored only in a ref and never exposed in state.
 */
export function useViewAuth(options: UseViewAuthOptions = {}): ViewAuthState {
  const { app, validationTool, onValidate, onAuthenticated, onAuthFailed } = options;

  const [status, setStatus] = useState<AuthStatus>("unauthenticated");
  const [error, setError] = useState<string | null>(null);

  const statusRef = useRef<AuthStatus>(status);
  const credentialsRef = useRef<AuthCredentials | null>(null);

  const authenticate = useCallback(
    async (credentials: AuthCredentials): Promise<boolean> => {
      setStatus("pending");
      statusRef.current = "pending";
      setError(null);

      try {
        let valid: boolean;

        if (onValidate) {
          valid = await onValidate(credentials);
        } else if (app) {
          const result = await (app as any).callServerTool({
            name: validationTool || "validate-auth",
            arguments: {
              type: credentials.type,
              value: credentials.value,
              username: credentials.username,
            },
          });
          valid = !!result;
        } else {
          throw new Error("No validation method available");
        }

        if (valid) {
          credentialsRef.current = credentials;
          setStatus("authenticated");
          statusRef.current = "authenticated";
          onAuthenticated?.();
          return true;
        } else {
          const msg = "Invalid credentials";
          setStatus("failed");
          statusRef.current = "failed";
          setError(msg);
          onAuthFailed?.(msg);
          return false;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Authentication failed";
        setStatus("failed");
        statusRef.current = "failed";
        setError(msg);
        onAuthFailed?.(msg);
        return false;
      }
    },
    [app, validationTool, onValidate, onAuthenticated, onAuthFailed]
  );

  const logout = useCallback(() => {
    setStatus("unauthenticated");
    statusRef.current = "unauthenticated";
    setError(null);
    credentialsRef.current = null;
  }, []);

  const withAuth = useCallback(
    <T>(fn: () => Promise<T>): Promise<T> => {
      if (statusRef.current === "authenticated") {
        return fn();
      }
      return Promise.reject(new Error("Authentication required"));
    },
    []
  );

  return {
    status,
    error,
    isAuthenticated: status === "authenticated",
    authenticate,
    logout,
    withAuth,
  };
}
