import { useState, useMemo, useCallback, useRef } from "react";
import { useView, useViewResize } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Input,
  ScrollArea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn, listContainer, listItem } from "@chuk/view-ui/animations";
import type { GalleryContent, GalleryItem, GalleryAction } from "./schema";

/* ------------------------------------------------------------------ */
/*  GalleryView — connected wrapper                                   */
/* ------------------------------------------------------------------ */

export function GalleryView() {
  const { data, callTool } =
    useView<GalleryContent>("gallery", "1.0");

  if (!data) return null;

  return <GalleryRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  GalleryRenderer — pure presentation                               */
/* ------------------------------------------------------------------ */

export interface GalleryRendererProps {
  data: GalleryContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

export function GalleryRenderer({ data, onCallTool }: GalleryRendererProps) {
  const {
    title,
    items,
    columns,
    filterable,
    sortable,
    sortFields = [],
    emptyMessage,
  } = data;

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const { breakpoint } = useViewResize({ ref: containerRef as React.RefObject<HTMLElement> });

  const handleAction = useCallback(
    async (action: GalleryAction) => {
      if (onCallTool) {
        await onCallTool(action.tool, action.arguments);
      }
    },
    [onCallTool]
  );

  /* Filter items by search text */
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const term = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term))
    );
  }, [items, search]);

  /* Sort items by selected metadata field */
  const sortedItems = useMemo(() => {
    if (!sortField) return filteredItems;
    return [...filteredItems].sort((a, b) => {
      const aVal = a.metadata?.[sortField] ?? "";
      const bVal = b.metadata?.[sortField] ?? "";
      return aVal.localeCompare(bVal);
    });
  }, [filteredItems, sortField]);

  /* Resolve columns: explicit prop or responsive via breakpoint */
  const resolvedColumns = columns ?? responsiveColumns(breakpoint);

  const gridStyle: React.CSSProperties = columns
    ? { gridTemplateColumns: `repeat(${resolvedColumns}, minmax(0, 1fr))` }
    : { gridTemplateColumns: `repeat(auto-fill, minmax(240px, 1fr))` };

  const showToolbar = title || filterable || (sortable && sortFields.length > 0);

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col font-sans text-foreground bg-background"
    >
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
          {title && (
            <h1 className="text-base font-semibold mr-auto">{title}</h1>
          )}
          {filterable && (
            <Input
              placeholder="Filter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-[220px] h-8 text-sm"
            />
          )}
          {sortable && sortFields.length > 0 && (
            <Select value={sortField} onValueChange={setSortField}>
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortFields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Grid area */}
      <ScrollArea className="flex-1">
        {sortedItems.length === 0 ? (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center h-full min-h-[200px] text-sm text-muted-foreground"
          >
            {emptyMessage ?? "No items found"}
          </motion.div>
        ) : (
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-4 p-4"
            style={gridStyle}
          >
            {sortedItems.map((item) => (
              <motion.div key={item.id} variants={listItem}>
                <GalleryCard item={item} onAction={handleAction} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center px-4 py-2 border-t border-border text-xs text-muted-foreground flex-shrink-0">
        {sortedItems.length} of {items.length} items
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GalleryCard                                                       */
/* ------------------------------------------------------------------ */

interface GalleryCardProps {
  item: GalleryItem;
  onAction: (action: GalleryAction) => void;
}

function GalleryCard({ item, onAction }: GalleryCardProps) {
  const { title, subtitle, description, image, badges, metadata, actions } =
    item;

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Image */}
      {image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={image.url}
            alt={image.alt ?? title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <CardContent className="flex-1 p-4 space-y-2">
        <div className="font-semibold leading-tight">{title}</div>
        {subtitle && (
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        )}
        {description && (
          <div className="text-sm line-clamp-2">{description}</div>
        )}

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {badges.map((badge, i) => (
              <Badge key={i} variant={badge.variant ?? "default"}>
                {badge.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadata */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="space-y-1 pt-1">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex items-baseline gap-2 text-xs">
                <span className="text-muted-foreground">{key}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <CardFooter className="px-4 pb-4 pt-0 flex gap-2 flex-wrap">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => onAction(action)}
            >
              {action.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function responsiveColumns(breakpoint: string): number {
  switch (breakpoint) {
    case "xs":
      return 1;
    case "sm":
      return 2;
    case "md":
      return 3;
    case "lg":
    case "xl":
      return 4;
    default:
      return 3;
  }
}
