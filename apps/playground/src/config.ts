/** Base URL for the CDN where views are hosted.
 * In dev, points to local server. In production, uses the current origin
 * so the playground works regardless of the deployment domain. */
export const CDN_BASE = import.meta.env.DEV
  ? "http://localhost:8000"
  : window.location.origin;
