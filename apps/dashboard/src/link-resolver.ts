import type { CrossViewLink } from "./schema";
import type { ViewMessage } from "@chuk/view-shared";

/** Map of link types to the ViewBus message types they allow through. */
const LINK_TYPE_TO_BUS: Record<string, string[]> = {
  selection: ["select"],
  filter: ["filter"],
  highlight: ["highlight"],
  navigate: ["navigate"],
  update: ["update"],
};

/**
 * Build a ViewBusProvider filter function from CrossViewLink declarations.
 *
 * When links are defined, only messages matching a declared link are forwarded.
 * When links are undefined or empty, all messages pass (backwards compat).
 */
export function buildLinkFilter(
  links: CrossViewLink[] | undefined,
): ((message: ViewMessage, source: string, target: string) => boolean) | undefined {
  if (!links || links.length === 0) return undefined;

  // Build lookup: Map<sourcePanel, Map<targetPanel, Set<busMessageType>>>
  const linkMap = new Map<string, Map<string, Set<string>>>();

  for (const link of links) {
    // Forward direction: source → target
    addRoute(linkMap, link.source, link.target, link.type);
    // Reverse direction if bidirectional
    if (link.bidirectional) {
      addRoute(linkMap, link.target, link.source, link.type);
    }
  }

  return (
    message: ViewMessage,
    sourcePanelId: string,
    targetPanelId: string,
  ): boolean => {
    const sourceRoutes = linkMap.get(sourcePanelId);
    if (!sourceRoutes) return false;
    const allowedTypes = sourceRoutes.get(targetPanelId);
    if (!allowedTypes) return false;
    return allowedTypes.has(message.type);
  };
}

function addRoute(
  linkMap: Map<string, Map<string, Set<string>>>,
  source: string,
  target: string,
  linkType: string,
): void {
  if (!linkMap.has(source)) {
    linkMap.set(source, new Map());
  }
  const targets = linkMap.get(source)!;
  if (!targets.has(target)) {
    targets.set(target, new Set());
  }
  const busTypes = LINK_TYPE_TO_BUS[linkType] ?? [linkType];
  for (const bt of busTypes) {
    targets.get(target)!.add(bt);
  }
}
