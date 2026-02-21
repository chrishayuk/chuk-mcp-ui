/**
 * Compat test harness -- host simulation for Playwright-driven view testing.
 *
 * Query parameters:
 *   view          - view name (maps to /views/{viewName})
 *   protocol      - "ext-apps" (default) | "postmessage"
 *   theme         - "light" (default) | "dark"
 *   handshakeDelay - milliseconds to delay before delivering data
 *   sandbox       - iframe sandbox attribute value (e.g. "allow-scripts")
 *   fixture       - base64-encoded JSON or URL-encoded JSON fixture data
 */

import {
  AppBridge,
  PostMessageTransport,
} from "@modelcontextprotocol/ext-apps/app-bridge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HarnessStatus {
  phase: "loading" | "handshaking" | "initialized" | "delivered" | "error";
  consoleErrors: string[];
  callToolRequests: Array<{ name: string; arguments: unknown }>;
  sizeChanges: Array<{ width?: number; height?: number }>;
  initialized: boolean;
  dataDelivered: boolean;
  errorMessage?: string;
}

// Augment the global Window so Playwright can access our status & bridge.
declare global {
  interface Window {
    __COMPAT__: HarnessStatus;
    __BRIDGE__: AppBridge | undefined;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseParams(): {
  view: string;
  protocol: "ext-apps" | "postmessage";
  theme: "light" | "dark";
  handshakeDelay: number;
  sandbox: string | null;
  fixtureData: unknown;
} {
  const url = new URL(window.location.href);
  const view = url.searchParams.get("view") ?? "";
  const protocol =
    (url.searchParams.get("protocol") as "ext-apps" | "postmessage") ??
    "ext-apps";
  const theme =
    (url.searchParams.get("theme") as "light" | "dark") ?? "light";
  const handshakeDelay = Number(url.searchParams.get("handshakeDelay") ?? "0");
  const sandbox = url.searchParams.get("sandbox");
  // Extract fixture param manually to avoid URLSearchParams decoding '+' as space
  // (base64 strings can contain '+' which would be corrupted by searchParams.get)
  const fixtureMatch = url.search.match(/[?&]fixture=([^&]*)/);
  const fixtureRaw = fixtureMatch ? fixtureMatch[1] : null;

  let fixtureData: unknown = {};
  if (fixtureRaw) {
    try {
      // Try base64 first
      fixtureData = JSON.parse(atob(fixtureRaw));
    } catch {
      try {
        // Fall back to URL-encoded JSON
        fixtureData = JSON.parse(decodeURIComponent(fixtureRaw));
      } catch {
        console.error("Failed to parse fixture data");
      }
    }
  }

  return { view, protocol, theme, handshakeDelay, sandbox, fixtureData };
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Status object (exposed on window for Playwright)
// ---------------------------------------------------------------------------

const status: HarnessStatus = {
  phase: "loading",
  consoleErrors: [],
  callToolRequests: [],
  sizeChanges: [],
  initialized: false,
  dataDelivered: false,
};

window.__COMPAT__ = status;
window.__BRIDGE__ = undefined;

// Capture console errors
const _origConsoleError = console.error;
console.error = (...args: unknown[]) => {
  status.consoleErrors.push(args.map(String).join(" "));
  _origConsoleError.apply(console, args);
};

window.addEventListener("error", (e) => {
  status.consoleErrors.push(e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  status.consoleErrors.push(String(e.reason));
});

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { view, protocol, theme, handshakeDelay, sandbox, fixtureData } =
    parseParams();

  if (!view) {
    status.phase = "error";
    status.errorMessage = "Missing required 'view' query parameter";
    return;
  }

  // -- Create iframe --
  const container = document.getElementById("container")!;
  const iframe = document.createElement("iframe");
  iframe.src = `/views/${view}`;

  if (sandbox !== null) {
    iframe.setAttribute("sandbox", sandbox);
  }

  // Wait for iframe to load
  const iframeLoaded = new Promise<void>((resolve) => {
    iframe.addEventListener("load", () => resolve(), { once: true });
  });

  container.appendChild(iframe);
  await iframeLoaded;

  // -- Protocol handling --
  if (protocol === "ext-apps") {
    await initExtApps(iframe, theme, handshakeDelay, fixtureData);
  } else {
    await initPostMessage(iframe, handshakeDelay, fixtureData);
  }
}

// ---------------------------------------------------------------------------
// ext-apps protocol
// ---------------------------------------------------------------------------

async function initExtApps(
  iframe: HTMLIFrameElement,
  theme: "light" | "dark",
  handshakeDelay: number,
  fixtureData: unknown,
): Promise<void> {
  status.phase = "handshaking";

  try {
    const hostInfo = { name: "ChukCompatHarness", version: "1.0.0" };
    const capabilities = {
      openLinks: {},
      serverTools: {},
      logging: {},
    };
    const options = {
      hostContext: { theme },
    };

    const bridge = new AppBridge(null, hostInfo, capabilities, options);
    window.__BRIDGE__ = bridge;

    const transport = new PostMessageTransport(
      iframe.contentWindow!,
      iframe.contentWindow!,
    );

    // When the view completes its init handshake, deliver fixture data
    bridge.oninitialized = async () => {
      status.phase = "initialized";
      status.initialized = true;

      await delay(handshakeDelay);

      try {
        await bridge.sendToolResult({
          content: [{ type: "text", text: "Showing view." }],
          structuredContent: fixtureData as Record<string, unknown>,
        });
        status.phase = "delivered";
        status.dataDelivered = true;
      } catch (err) {
        status.phase = "error";
        status.errorMessage = `sendToolResult failed: ${String(err)}`;
      }
    };

    // Capture tool call requests from the view
    bridge.oncalltool = async (params) => {
      status.callToolRequests.push({
        name: params.name,
        arguments: params.arguments,
      });
      return { content: [] };
    };

    // Capture size change notifications from the view
    bridge.onsizechange = (params) => {
      status.sizeChanges.push({
        width: params.width,
        height: params.height,
      });
    };

    await bridge.connect(transport);
  } catch (err) {
    status.phase = "error";
    status.errorMessage = `ext-apps init failed: ${String(err)}`;
  }
}

// ---------------------------------------------------------------------------
// postmessage protocol (legacy / fallback)
// ---------------------------------------------------------------------------

async function initPostMessage(
  iframe: HTMLIFrameElement,
  handshakeDelay: number,
  fixtureData: unknown,
): Promise<void> {
  status.phase = "handshaking";

  try {
    await delay(handshakeDelay);

    iframe.contentWindow!.postMessage(
      {
        type: "mcp-app:tool-result",
        structuredContent: fixtureData,
        content: [],
      },
      "*",
    );

    status.phase = "delivered";
    status.dataDelivered = true;
    status.initialized = true;
  } catch (err) {
    status.phase = "error";
    status.errorMessage = `postmessage init failed: ${String(err)}`;
  }
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

main().catch((err) => {
  status.phase = "error";
  status.errorMessage = `harness boot failed: ${String(err)}`;
});
