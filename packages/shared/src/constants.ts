/**
 * Shared constants used by both client-side (useView) and server-side
 * (server helpers) code. Kept in a tiny module so the client bundle
 * doesn't pull in server-only dependencies.
 */

/** The production CDN origin for hosted views. */
export const CDN_ORIGIN = "https://mcp-views.chukai.io";
